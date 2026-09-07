/**
 * Phase 5 — Adaptive Routing Engine
 *
 * Graph traversal and risk-aware routing engine for fort trail networks.
 * Uses Dijkstra's algorithm to compute safest paths, dynamically severs
 * edges when risk exceeds critical threshold (>= 75%) or by authority action,
 * and recalculates diversion routes.
 */

// Trails at or above this risk score are automatically severed from routing.
export const CRITICAL_RISK_THRESHOLD = 75;

// Statuses that make a trail unusable for routing.
export const UNSAFE_STATUSES = new Set(["closed", "diverted"]);

/**
 * Normalizes a waypoint name for case/whitespace-insensitive matching.
 */
const NODE_ALIASES = {
    "chor darwaja (secret gate)": "chor darwaja",
    "padmavati temple": "padmavati temple complex",
    "padmavati machi": "padmavati temple complex",
    "padmavati machi base": "padmavati temple complex",
};

export const normalizeNodeName = (name) => {
    const normalized = (name || "").trim().toLowerCase();
    return NODE_ALIASES[normalized] || normalized;
};

/**
 * Calculates the risk-aware edge cost for a single trail.
 * cost = distanceKm * (1 + riskScore / 100)
 */
export const calculateEdgeCost = (trail, explicitRisk = null) => {
    const distanceKm = typeof trail.distanceKm === "number" && trail.distanceKm >= 0
        ? trail.distanceKm
        : 0.5;

    const risk = typeof explicitRisk === "number"
        ? explicitRisk
        : (typeof trail.currentRiskScore === "number" ? trail.currentRiskScore : 0);

    return distanceKm * (1 + Math.max(0, risk) / 100);
};

/**
 * Checks if a trail is safe to route through under given conditions.
 */
export const isTrailSafe = (trail, effectiveRisk = null, severedIds = new Set()) => {
    const trailIdStr = (trail._id || trail.id || "").toString();
    if (severedIds.has(trailIdStr)) return false;
    if (UNSAFE_STATUSES.has(trail.status)) return false;

    const risk = typeof effectiveRisk === "number"
        ? effectiveRisk
        : (typeof trail.currentRiskScore === "number" ? trail.currentRiskScore : 0);

    if (risk >= CRITICAL_RISK_THRESHOLD) return false;
    return true;
};

/**
 * Builds an adjacency list graph from a fort's trail documents.
 * Supports bidirectional edge traversal so ascent and descent routing
 * both work naturally.
 */
export const buildGraph = (trails, options = {}) => {
    const {
        bidirectional = true,
        riskOverrides = null, // Map or Object of trailId -> simulatedRisk
        severedIds = new Set(), // Set of trailId strings explicitly severed
    } = options;

    const adjacency = new Map();
    const nodeDisplayNames = new Map();

    const ensureNode = (rawName) => {
        const key = normalizeNodeName(rawName);
        if (!key) return null;
        if (!adjacency.has(key)) adjacency.set(key, []);
        if (!nodeDisplayNames.has(key)) nodeDisplayNames.set(key, rawName.trim());
        return key;
    };

    for (const trail of trails) {
        if (!trail.startPoint?.name || !trail.endPoint?.name) continue;

        const trailIdStr = (trail._id || trail.id || "").toString();
        const effectiveRisk = riskOverrides instanceof Map
            ? riskOverrides.get(trailIdStr)
            : (riskOverrides && riskOverrides[trailIdStr] !== undefined
                ? riskOverrides[trailIdStr]
                : trail.currentRiskScore);

        if (!isTrailSafe(trail, effectiveRisk, severedIds)) continue;

        const fromKey = ensureNode(trail.startPoint.name);
        const toKey = ensureNode(trail.endPoint.name);
        if (!fromKey || !toKey) continue;

        const cost = calculateEdgeCost(trail, effectiveRisk);

        // Forward edge (start -> end)
        adjacency.get(fromKey).push({
            to: toKey,
            cost,
            trail,
            reversed: false,
            effectiveRisk: effectiveRisk ?? trail.currentRiskScore,
        });

        // Reverse edge (end -> start) for bidirectional mountain paths
        if (bidirectional) {
            adjacency.get(toKey).push({
                to: fromKey,
                cost,
                trail,
                reversed: true,
                effectiveRisk: effectiveRisk ?? trail.currentRiskScore,
            });
        }
    }

    return { adjacency, nodeDisplayNames };
};

/**
 * Runs Dijkstra's shortest/safest path algorithm.
 */
export const runDijkstra = (adjacency, startKey, destinationKey) => {
    const distances = new Map();
    const previous = new Map();
    const visited = new Set();

    for (const node of adjacency.keys()) {
        distances.set(node, Infinity);
    }
    distances.set(startKey, 0);

    while (true) {
        let currentNode = null;
        let currentDistance = Infinity;

        for (const [node, dist] of distances) {
            if (!visited.has(node) && dist < currentDistance) {
                currentNode = node;
                currentDistance = dist;
            }
        }

        if (currentNode === null) break;
        if (currentNode === destinationKey) break;

        visited.add(currentNode);

        const edges = adjacency.get(currentNode) || [];
        for (const edge of edges) {
            if (visited.has(edge.to)) continue;
            const candidateDistance = currentDistance + edge.cost;
            const knownDistance = distances.has(edge.to) ? distances.get(edge.to) : Infinity;

            if (candidateDistance < knownDistance) {
                distances.set(edge.to, candidateDistance);
                previous.set(edge.to, {
                    prevNode: currentNode,
                    trail: edge.trail,
                    reversed: edge.reversed,
                    effectiveRisk: edge.effectiveRisk,
                });
            }
        }
    }

    if (!distances.has(destinationKey) || distances.get(destinationKey) === Infinity) {
        return null;
    }

    // Reconstruct path
    const trailsUsed = [];
    let cursor = destinationKey;
    while (cursor !== startKey) {
        const step = previous.get(cursor);
        if (!step) return null;

        const rawTrail = step.trail.toObject ? step.trail.toObject() : { ...step.trail };
        const pathCoords = Array.isArray(rawTrail.path) ? rawTrail.path : [];

        // If traversed in reverse, orient coordinates to match travel direction
        const orientedPath = step.reversed ? [...pathCoords].reverse() : pathCoords;
        const segmentStart = step.reversed ? rawTrail.endPoint : rawTrail.startPoint;
        const segmentEnd = step.reversed ? rawTrail.startPoint : rawTrail.endPoint;

        trailsUsed.unshift({
            trailId: rawTrail._id || rawTrail.id,
            name: rawTrail.name,
            slug: rawTrail.slug,
            startPoint: segmentStart,
            endPoint: segmentEnd,
            path: orientedPath,
            distanceKm: rawTrail.distanceKm || 0,
            currentRiskScore: step.effectiveRisk ?? rawTrail.currentRiskScore,
            status: rawTrail.status,
            difficulty: rawTrail.difficulty || "moderate",
            traversedReverse: !!step.reversed,
        });

        cursor = step.prevNode;
    }

    const totalDistanceKm = trailsUsed.reduce((sum, t) => sum + (t.distanceKm || 0), 0);

    return {
        trails: trailsUsed,
        totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
        totalCost: Number(distances.get(destinationKey).toFixed(2)),
    };
};

/**
 * Public entry point: find safest route between two waypoints.
 */
export const findRoute = (trails, startName, destinationName, options = {}) => {
    const { adjacency, nodeDisplayNames } = buildGraph(trails, options);

    const startKey = normalizeNodeName(startName);
    const destinationKey = normalizeNodeName(destinationName);

    if (!adjacency.has(startKey)) {
        return { status: "invalid_node", node: "start" };
    }
    if (!adjacency.has(destinationKey)) {
        return { status: "invalid_node", node: "destination" };
    }

    const result = runDijkstra(adjacency, startKey, destinationKey);
    if (!result) {
        return { status: "no_route" };
    }

    return {
        status: "ok",
        trails: result.trails,
        totalDistanceKm: result.totalDistanceKm,
        totalCost: result.totalCost,
        startDisplayName: nodeDisplayNames.get(startKey),
        destinationDisplayName: nodeDisplayNames.get(destinationKey),
    };
};

/**
 * Simulates adaptive routing with auto-severing and dynamic diversion computation.
 *
 * @param {Object} params
 * @param {Array} params.trails - Fort trails
 * @param {number|null} params.rainfall - Rainfall in mm/hr (from simulation sliders)
 * @param {number|null} params.footfall - Live trekker count / density
 * @param {Array<string>} params.severedTrailIds - Explicit trail IDs severed by authority
 * @param {Map|Object|null} params.riskOverrides - Explicit simulated risk map
 * @param {string|null} params.startName - Optional start waypoint
 * @param {string|null} params.destinationName - Optional destination waypoint
 */
export const simulateRouting = ({
    trails = [],
    rainfall = null,
    footfall = null,
    severedTrailIds = [],
    riskOverrides = null,
    startName = null,
    destinationName = null,
}) => {
    const severedSet = new Set(
        (severedTrailIds || []).map((id) => (id ? id.toString() : ""))
    );

    // Calculate effective simulated risk for each trail
    const maxRainfall = 150;
    const soilSaturation = rainfall !== null
        ? Math.min(Math.max(0, rainfall) / maxRainfall, 1)
        : null;

    const trailRisks = new Map();
    const severedTrails = [];
    const allTrailsStatus = [];

    for (const trail of trails) {
        const trailIdStr = (trail._id || trail.id || "").toString();

        let effectiveRisk = trail.currentRiskScore || 0;

        if (riskOverrides instanceof Map && riskOverrides.has(trailIdStr)) {
            effectiveRisk = riskOverrides.get(trailIdStr);
        } else if (riskOverrides && riskOverrides[trailIdStr] !== undefined) {
            effectiveRisk = riskOverrides[trailIdStr];
        } else if (soilSaturation !== null && footfall !== null) {
            // Apply project risk formula
            const baseDiff = trail.baselineDifficulty || 1.2;
            const slope = trail.slopeGradient || 1.2;
            const maxSafe = trail.maxSafeFootfall || 500;
            const footfallRatio = footfall / maxSafe;

            effectiveRisk = Math.min(
                100,
                Math.round(baseDiff * soilSaturation * slope * footfallRatio * 100)
            );
        }

        trailRisks.set(trailIdStr, effectiveRisk);

        // Check severing condition
        const isExplicitlySevered = severedSet.has(trailIdStr);
        const isCriticalRisk = effectiveRisk >= CRITICAL_RISK_THRESHOLD;
        const isDbClosed = UNSAFE_STATUSES.has(trail.status);

        const isSevered = isExplicitlySevered || isCriticalRisk || isDbClosed;

        let severReason = null;
        if (isExplicitlySevered) severReason = "authority_severed";
        else if (isCriticalRisk) severReason = "critical_risk_threshold";
        else if (isDbClosed) severReason = "closed_in_db";

        const statusEntry = {
            trailId: trailIdStr,
            name: trail.name,
            slug: trail.slug,
            startPoint: trail.startPoint,
            endPoint: trail.endPoint,
            path: trail.path || [],
            distanceKm: trail.distanceKm || 0,
            currentRiskScore: trail.currentRiskScore,
            simulatedRiskScore: effectiveRisk,
            status: isSevered ? "severed" : (effectiveRisk >= 50 ? "caution" : "open"),
            isSevered,
            severReason,
        };

        allTrailsStatus.push(statusEntry);

        if (isSevered) {
            severedTrails.push(statusEntry);
        }
    }

    // Build the graph of only safe remaining trails
    const { adjacency, nodeDisplayNames } = buildGraph(trails, {
        bidirectional: true,
        riskOverrides: trailRisks,
        severedIds: severedSet,
    });

    // Determine waypoints for diversion computation
    let computedDiversion = null;
    let diversionStart = startName;
    let diversionDest = destinationName;

    // If explicit waypoints not provided, find the most meaningful diversion
    if (!diversionStart || !diversionDest) {
        if (severedTrails.length > 0) {
            // Try computing a detour between the endpoints of the primary severed trail
            const primarySevered = severedTrails[0];
            const startAttempt = primarySevered.startPoint?.name;
            const destAttempt = primarySevered.endPoint?.name;

            if (startAttempt && destAttempt) {
                const sKey = normalizeNodeName(startAttempt);
                const dKey = normalizeNodeName(destAttempt);
                if (adjacency.has(sKey) && adjacency.has(dKey)) {
                    const detourResult = runDijkstra(adjacency, sKey, dKey);
                    if (detourResult) {
                        diversionStart = startAttempt;
                        diversionDest = destAttempt;
                        computedDiversion = detourResult;
                    }
                }
            }

            // If local detour not found, route from base village/first trailhead to summit/central temple
            if (!computedDiversion && trails.length > 0) {
                const firstTrail = trails[0];
                const lastTrail = trails[trails.length - 1];
                const sKey = normalizeNodeName(firstTrail.startPoint?.name);
                const dKey = normalizeNodeName(lastTrail.endPoint?.name || lastTrail.startPoint?.name);

                if (adjacency.has(sKey) && adjacency.has(dKey)) {
                    computedDiversion = runDijkstra(adjacency, sKey, dKey);
                    if (computedDiversion) {
                        diversionStart = firstTrail.startPoint?.name;
                        diversionDest = lastTrail.endPoint?.name || lastTrail.startPoint?.name;
                    }
                }
            }
        }
    } else {
        const sKey = normalizeNodeName(diversionStart);
        const dKey = normalizeNodeName(diversionDest);
        if (adjacency.has(sKey) && adjacency.has(dKey)) {
            computedDiversion = runDijkstra(adjacency, sKey, dKey);
        }
    }

    let diversionRoute = null;
    if (computedDiversion) {
        diversionRoute = {
            safe: true,
            start: nodeDisplayNames.get(normalizeNodeName(diversionStart)) || diversionStart,
            destination: nodeDisplayNames.get(normalizeNodeName(diversionDest)) || diversionDest,
            totalDistanceKm: computedDiversion.totalDistanceKm,
            totalCost: computedDiversion.totalCost,
            segmentCount: computedDiversion.trails.length,
            segments: computedDiversion.trails,
        };
    }

    // Build human-readable summary
    let summary = "";
    const severedCount = severedTrails.length;

    if (severedCount === 0) {
        summary = "All trail segments within safe operating thresholds. No paths severed.";
    } else {
        const names = severedTrails.map((t) => t.name).join(", ");
        if (diversionRoute) {
            summary = `${severedCount} path${severedCount > 1 ? "s" : ""} severed (${names}). Safe alternative route active: ${diversionRoute.start} → ${diversionRoute.destination} (${diversionRoute.totalDistanceKm} km).`;
        } else {
            summary = `${severedCount} path${severedCount > 1 ? "s" : ""} severed (${names}). Warning: No safe alternative route available on this network.`;
        }
    }

    return {
        status: "ok",
        isSevered: severedCount > 0,
        severedCount,
        severedTrails,
        diversionRoute,
        allTrailsStatus,
        summary,
    };
};