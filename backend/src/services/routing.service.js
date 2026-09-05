/**
 * Phase 5 — Adaptive Routing Engine
 *
 * Pure business logic: builds a directed graph from a fort's Trail
 * documents and finds the safest/cheapest path between two waypoints
 * using Dijkstra's algorithm.
 *
 * This file intentionally has NO Express/HTTP code (same convention as
 * weather.service.js) and NO dependency on Phase 4. It only reads the
 * `currentRiskScore` / `status` fields that already exist on the Trail
 * model. Whenever Phase 4 starts writing updated values into those
 * fields, this service will automatically route around them on the
 * very next request — no code changes required here.
 */

// Trails at or above this risk score are always excluded from routing.
const CRITICAL_RISK_THRESHOLD = 75;

// Statuses that make a trail unusable for routing.
const UNSAFE_STATUSES = new Set(["closed", "diverted"]);

/**
 * Normalizes a waypoint name for case/whitespace-insensitive matching.
 * (Trail.startPoint.name / Trail.endPoint.name are free-text strings.)
 */
const NODE_ALIASES = {
    "chor darwaja (secret gate)": "chor darwaja",
};

const normalizeNodeName = (name) => {
    const normalized = (name || "").trim().toLowerCase();

    return NODE_ALIASES[normalized] || normalized;
};

/**
 * Calculates the risk-aware edge cost for a single trail.
 *
 * cost = distanceKm * (1 + currentRiskScore / 100)
 *
 * Missing/invalid distanceKm or currentRiskScore are defensively
 * treated as 0, matching the Trail schema's own defaults, so a single
 * bad record can't crash routing for the whole fort.
 */
const calculateEdgeCost = (trail) => {
    const distanceKm = typeof trail.distanceKm === "number" && trail.distanceKm >= 0
        ? trail.distanceKm
        : 0;
    const currentRiskScore = typeof trail.currentRiskScore === "number" && trail.currentRiskScore >= 0
        ? trail.currentRiskScore
        : 0;

    return distanceKm * (1 + currentRiskScore / 100);
};

/**
 * Returns true if a trail is currently safe to route through.
 * Unsafe trails (closed, diverted, or critical risk) are excluded
 * entirely from the graph — never selected, never returned.
 */
const isTrailSafe = (trail) => {
    if (UNSAFE_STATUSES.has(trail.status)) return false;
    const riskScore = typeof trail.currentRiskScore === "number" ? trail.currentRiskScore : 0;
    if (riskScore >= CRITICAL_RISK_THRESHOLD) return false;
    return true;
};

/**
 * Builds a directed adjacency list graph from a fort's trail documents.
 *
 * Each trail contributes exactly ONE directed edge: startPoint -> endPoint.
 * Trails are never treated as bidirectional — this mirrors the schema
 * comment "Graph edge representation: start waypoint -> end waypoint".
 *
 * Unsafe trails are skipped entirely (they never appear in the graph,
 * so Dijkstra can never select them).
 *
 * @param {Array} trails - Trail documents belonging to a single fort.
 * @returns {{ adjacency: Map<string, Array>, nodeDisplayNames: Map<string,string> }}
 */
const buildGraph = (trails) => {
    // adjacency: normalizedNodeName -> [{ to, cost, trail }]
    const adjacency = new Map();
    // Keep original (display) names so responses aren't lowercased.
    const nodeDisplayNames = new Map();

    const ensureNode = (rawName) => {
        const key = normalizeNodeName(rawName);
        if (!key) return null;
        if (!adjacency.has(key)) adjacency.set(key, []);
        if (!nodeDisplayNames.has(key)) nodeDisplayNames.set(key, rawName.trim());
        return key;
    };

    for (const trail of trails) {
        if (!trail.startPoint?.name || !trail.endPoint?.name) continue; // malformed record guard
        if (!isTrailSafe(trail)) continue;

        const fromKey = ensureNode(trail.startPoint.name);
        const toKey = ensureNode(trail.endPoint.name);
        if (!fromKey || !toKey) continue;

        adjacency.get(fromKey).push({
            to: toKey,
            cost: calculateEdgeCost(trail),
            trail,
        });
    }

    return { adjacency, nodeDisplayNames };
};

/**
 * Runs Dijkstra's shortest-path algorithm over a pre-built graph.
 *
 * @param {Map} adjacency - adjacency list from buildGraph()
 * @param {string} startKey - normalized start node
 * @param {string} destinationKey - normalized destination node
 * @returns {{ trails: Array, totalDistanceKm: number, totalCost: number } | null}
 *          null when no path exists (disconnected graph / all routes unsafe).
 */
const runDijkstra = (adjacency, startKey, destinationKey) => {
    const distances = new Map(); // node -> cumulative cost
    const previous = new Map(); // node -> { prevNode, trail }
    const visited = new Set();

    for (const node of adjacency.keys()) {
        distances.set(node, Infinity);
    }
    distances.set(startKey, 0);

    // Simple O(V^2) selection — trail networks are small, no need for a heap.
    while (true) {
        let currentNode = null;
        let currentDistance = Infinity;

        for (const [node, dist] of distances) {
            if (!visited.has(node) && dist < currentDistance) {
                currentNode = node;
                currentDistance = dist;
            }
        }

        if (currentNode === null) break; // remaining nodes are unreachable
        if (currentNode === destinationKey) break; // shortest path to target found

        visited.add(currentNode);

        const edges = adjacency.get(currentNode) || [];
        for (const edge of edges) {
            if (visited.has(edge.to)) continue;
            const candidateDistance = currentDistance + edge.cost;
            const knownDistance = distances.has(edge.to) ? distances.get(edge.to) : Infinity;

            if (candidateDistance < knownDistance) {
                distances.set(edge.to, candidateDistance);
                previous.set(edge.to, { prevNode: currentNode, trail: edge.trail });
            }
        }
    }

    if (!distances.has(destinationKey) || distances.get(destinationKey) === Infinity) {
        return null; // unreachable — disconnected graph or all connecting trails unsafe
    }

    // Reconstruct path by walking `previous` backwards from destination.
    const trailsUsed = [];
    let cursor = destinationKey;
    while (cursor !== startKey) {
        const step = previous.get(cursor);
        if (!step) return null; // safety guard, should not happen
        trailsUsed.unshift(step.trail);
        cursor = step.prevNode;
    }

    const totalDistanceKm = trailsUsed.reduce(
        (sum, trail) => sum + (typeof trail.distanceKm === "number" ? trail.distanceKm : 0),
        0
    );

    return {
        trails: trailsUsed,
        totalDistanceKm,
        totalCost: distances.get(destinationKey),
    };
};

/**
 * Public entry point: finds the safest/cheapest route between two named
 * waypoints for a given fort's trail set.
 *
 * @param {Array} trails - ALL Trail documents for the fort (safe + unsafe).
 *                         Filtering happens internally so callers don't
 *                         need to know the safety rules.
 * @param {string} startName - waypoint name to start from
 * @param {string} destinationName - waypoint name to reach
 * @returns {object} result descriptor, see shapes below.
 *
 * Possible return shapes:
 *   { status: "invalid_node", node: "start" | "destination" }
 *   { status: "no_route" }
 *   { status: "ok", trails, totalDistanceKm, totalCost }
 */
const findRoute = (trails, startName, destinationName) => {
    const { adjacency, nodeDisplayNames } = buildGraph(trails);

    const startKey = normalizeNodeName(startName);
    const destinationKey = normalizeNodeName(destinationName);

    // A node is only "known" if it appears as an endpoint of at least
    // one SAFE trail. This deliberately treats waypoints that only
    // exist on closed/diverted/critical trails as unreachable, since
    // there is no safe way to even approach them.
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

export {
    findRoute,
    buildGraph,
    runDijkstra,
    calculateEdgeCost,
    isTrailSafe,
    CRITICAL_RISK_THRESHOLD,
};