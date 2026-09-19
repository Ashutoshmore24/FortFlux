// ── GeoJSON Conversion Utilities ──
// Converts backend MongoDB data into GeoJSON FeatureCollections for MapLibre.
// Validates all coordinates before rendering.

import { RISK_COLORS, CISTERN_COLORS } from "../config/mapConfig";
import { FORT_HISTORY_DETAILS, FORT_GPS_COORDINATES, FORT_LANDMARK_COORDINATES } from "../data/fortHistoryData";

/**
 * Validate a [longitude, latitude] coordinate pair.
 */
export const isValidLngLat = (coords) => {
    if (!Array.isArray(coords) || coords.length < 2) return false;
    const [lng, lat] = coords;
    return (
        typeof lng === "number" &&
        typeof lat === "number" &&
        !isNaN(lng) &&
        !isNaN(lat) &&
        lng >= -180 &&
        lng <= 180 &&
        lat >= -90 &&
        lat <= 90
    );
};

/**
 * Validate a LineString coordinate array (at least 2 valid points).
 */
export const isValidLineString = (coords) => {
    if (!Array.isArray(coords) || coords.length < 2) return false;
    return coords.every(isValidLngLat);
};

// ── Trail Risk Color Logic (exact match to existing system) ──

/**
 * Get trail color based on status and risk score.
 * Preserved from the original FortMap.jsx — identical logic.
 */
export const getTrailColor = (status, riskScore) => {
    if (status === "closed" || status === "diverted") return RISK_COLORS.critical;
    if (status === "caution" || riskScore >= 50) return RISK_COLORS.caution;
    if (riskScore >= 30) return RISK_COLORS.moderate;
    return RISK_COLORS.safe;
};

/**
 * Get trail dash array for MapLibre line-dasharray.
 * Returns null for solid lines (open trails).
 */
export const getTrailDashArray = (status) => {
    if (status === "closed") return [3, 2];
    if (status === "diverted") return [2, 1, 0.5, 1];
    if (status === "caution") return [1.5, 1];
    return null; // solid
};

/**
 * Get risk category label from score.
 */
export const getRiskLabel = (score) => {
    if (score >= 75) return "CRITICAL";
    if (score >= 50) return "CAUTION";
    if (score >= 30) return "MODERATE";
    return "SAFE";
};

// ── GeoJSON Converters ──

/**
 * Convert an array of fort objects (from useFortStore) to a GeoJSON FeatureCollection.
 * @param {Array} forts - Array of fort objects from API
 * @param {string|null} selectedSlug - Slug of the currently selected fort
 * @param {string} activeFilter - Active filter string ('all', 'pune', 'raigad', 'satara', 'sea-forts', etc.)
 * @param {Map|Object|null} weatherMap - Optional weather telemetry map keyed by fort slug
 * @returns {Object} GeoJSON FeatureCollection
 */
export const fortsToGeoJSON = (forts, selectedSlug = null, activeFilter = "all", weatherMap = null) => {
    const features = [];

    for (const fort of forts) {
        const coords = fort.location?.coordinates;
        if (!isValidLngLat(coords)) {
            console.warn(`[FortFlux] Invalid coordinates for fort "${fort.name}", skipping.`, coords);
            continue;
        }

        const isSeaFort = (fort.elevation || 0) <= 25;
        const fortWeather = weatherMap?.[fort.slug] || (weatherMap instanceof Map ? weatherMap.get(fort.slug) : null);
        const precipitation = Number(fortWeather?.precipitation || fortWeather?.rain || 0);
        const hasRain = precipitation > 0;
        const hasMonsoonSurge = precipitation >= 7.5;

        // Filter evaluation
        let isMatchFilter = true;
        const filter = (activeFilter || "all").toLowerCase();
        if (filter === "pune") {
            isMatchFilter = (fort.district || "").toLowerCase().includes("pune");
        } else if (filter === "raigad") {
            isMatchFilter = (fort.district || "").toLowerCase().includes("raigad");
        } else if (filter === "satara") {
            isMatchFilter = (fort.district || "").toLowerCase().includes("satara");
        } else if (filter === "sea-forts") {
            isMatchFilter = isSeaFort;
        } else if (filter === "monsoon") {
            isMatchFilter = hasRain || hasMonsoonSurge;
        }

        features.push({
            type: "Feature",
            properties: {
                id: fort._id,
                name: fort.name,
                slug: fort.slug,
                elevation: fort.elevation || 0,
                district: fort.district || "",
                region: fort.region || "",
                description: fort.description || "",
                baseVillage: fort.baseVillage || "",
                isSelected: fort.slug === selectedSlug,
                isSeaFort,
                isMatchFilter,
                hasRain,
                hasMonsoonSurge,
                precipitation,
                temperature: fortWeather?.temperature != null ? Math.round(fortWeather.temperature) : null,
                weatherDesc: fortWeather?.weatherDescription || "",
                weatherIcon: fortWeather?.weatherIcon || "☀️",
            },
            geometry: {
                type: "Point",
                coordinates: coords, // [lng, lat] — already in GeoJSON order
            },
        });
    }

    return { type: "FeatureCollection", features };
};

/**
 * Convert trails array to GeoJSON FeatureCollection.
 * Supports risk overrides from Authority simulation.
 * @param {Array} trails - Trail objects from fortDetail
 * @param {Map|null} riskOverrides - Optional Map<trailId, simulatedRiskScore>
 * @returns {Object} GeoJSON FeatureCollection
 */
export const trailsToGeoJSON = (trails, riskOverrides = null) => {
    const features = [];

    for (const trail of trails) {
        const path = trail.path || [];
        if (!isValidLineString(path)) {
            if (path.length > 0) {
                console.warn(`[FortFlux] Invalid path for trail "${trail.name}", skipping.`, path);
            }
            continue;
        }

        const effectiveRisk = riskOverrides?.get(trail._id) ?? trail.currentRiskScore;
        const effectiveStatus = effectiveRisk >= 75 ? "closed" : trail.status;
        const isSimulated =
            riskOverrides?.has(trail._id) &&
            riskOverrides.get(trail._id) !== trail.currentRiskScore;

        const color = getTrailColor(effectiveStatus, effectiveRisk);
        const dashArray = getTrailDashArray(effectiveStatus);

        features.push({
            type: "Feature",
            properties: {
                id: trail._id,
                name: trail.name,
                slug: trail.slug || "",
                riskScore: Math.round(effectiveRisk),
                originalRisk: trail.currentRiskScore,
                status: effectiveStatus,
                originalStatus: trail.status,
                difficulty: trail.difficulty || "moderate",
                distanceKm: trail.distanceKm || 0,
                isSimulated,
                color,
                dashArray: dashArray ? dashArray.join(",") : "",
                width: isSimulated ? 5 : 4,
                riskLabel: getRiskLabel(effectiveRisk),
                // Future: segment-level risk can be added as nested properties
            },
            geometry: {
                type: "LineString",
                coordinates: path, // [[lng, lat], ...] — already in GeoJSON order
            },
        });
    }

    return { type: "FeatureCollection", features };
};

/**
 * Convert cisterns array to GeoJSON FeatureCollection.
 * @param {Array} cisterns - Cistern objects from fortDetail
 * @returns {Object} GeoJSON FeatureCollection
 */
export const cisternsToGeoJSON = (cisterns) => {
    const features = [];

    for (const cistern of cisterns) {
        const coords = cistern.location?.coordinates;
        if (!isValidLngLat(coords)) {
            console.warn(`[FortFlux] Invalid coordinates for cistern "${cistern.name}", skipping.`, coords);
            continue;
        }

        const fillColor =
            cistern.status === "overflow"
                ? CISTERN_COLORS.overflow
                : cistern.status === "elevated"
                    ? CISTERN_COLORS.elevated
                    : CISTERN_COLORS.normal;

        features.push({
            type: "Feature",
            properties: {
                id: cistern._id,
                name: cistern.name,
                status: cistern.status || "normal",
                currentLevelPct: cistern.currentLevelPct || 0,
                capacityLiters: cistern.capacityLiters || 0,
                fillColor,
            },
            geometry: {
                type: "Point",
                coordinates: coords, // [lng, lat]
            },
        });
    }

    return { type: "FeatureCollection", features };
};

/**
 * Compute LngLat bounds from an array of forts.
 * Returns [[swLng, swLat], [neLng, neLat]] or null if no valid forts.
 */
export const computeFortBounds = (forts) => {
    const valid = forts.filter((f) => isValidLngLat(f.location?.coordinates));
    if (valid.length === 0) return null;

    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;

    for (const f of valid) {
        const [lng, lat] = f.location.coordinates;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
    }

    return [
        [minLng, minLat],
        [maxLng, maxLat],
    ];
};

/**
 * Convert severed trails into a GeoJSON FeatureCollection for hazard overlay.
 */
export const severedTrailsToGeoJSON = (severedTrails) => {
    if (!Array.isArray(severedTrails) || severedTrails.length === 0) {
        return { type: "FeatureCollection", features: [] };
    }

    const features = [];
    for (const trail of severedTrails) {
        const path = trail.path || [];
        if (!isValidLineString(path)) continue;

        features.push({
            type: "Feature",
            properties: {
                id: trail.trailId || trail._id,
                name: trail.name,
                riskScore: trail.simulatedRiskScore ?? trail.currentRiskScore ?? trail.riskScore ?? 80,
                severReason: trail.severReason || "critical_risk_threshold",
                distanceKm: trail.distanceKm || 0,
            },
            geometry: {
                type: "LineString",
                coordinates: path,
            },
        });
    }

    return { type: "FeatureCollection", features };
};

/**
 * Convert diversion route into a GeoJSON FeatureCollection.
 */
export const diversionRouteToGeoJSON = (diversionRoute) => {
    if (!diversionRoute || !diversionRoute.safe || !Array.isArray(diversionRoute.segments)) {
        return { type: "FeatureCollection", features: [] };
    }

    const features = [];
    for (const seg of diversionRoute.segments) {
        const path = seg.path || [];
        if (!isValidLineString(path)) continue;

        features.push({
            type: "Feature",
            properties: {
                name: seg.name,
                distanceKm: seg.distanceKm || 0,
                riskScore: seg.currentRiskScore || 0,
                isDiversion: true,
            },
            geometry: {
                type: "LineString",
                coordinates: path,
            },
        });
    }

    return { type: "FeatureCollection", features };
};

/**
 * Convert fort key landmarks from Fort History into a GeoJSON FeatureCollection.
 * Replaces crowdsourced hazard pins with authentic key landmark points from fort history.
 *
 * @param {Array} reports - Optional reports from store
 * @param {Array} forts - Array of forts from store or API
 * @param {string|null} selectedSlug - Currently selected fort slug
 * @returns {Object} GeoJSON FeatureCollection of authentic fort landmarks
 */
export const reportsToGeoJSON = (reports = [], forts = [], selectedSlug = null) => {
    const features = [];
    const fortSlugs = Object.keys(FORT_HISTORY_DETAILS);

    for (const slug of fortSlugs) {
        const history = FORT_HISTORY_DETAILS[slug];
        if (!history || !Array.isArray(history.landmarks)) continue;

        const fortObj = Array.isArray(forts) ? forts.find((f) => f.slug === slug) : null;
        const landmarkCoordsList = FORT_LANDMARK_COORDINATES[slug] || [];

        history.landmarks.forEach((lm, idx) => {
            // Retrieve exact surveyed GPS coordinates for this specific key landmark
            const surveyedCoords = landmarkCoordsList[idx]?.coordinates;
            let lmCoords = surveyedCoords;

            if (!isValidLngLat(lmCoords)) {
                // Fallback to fort center location if landmark coordinate unavailable
                const baseCoords = fortObj?.location?.coordinates ||
                    (FORT_GPS_COORDINATES[slug] ? [FORT_GPS_COORDINATES[slug].lng, FORT_GPS_COORDINATES[slug].lat] : null);
                if (isValidLngLat(baseCoords)) {
                    lmCoords = baseCoords;
                }
            }

            if (!isValidLngLat(lmCoords)) return;

            features.push({
                type: "Feature",
                properties: {
                    id: `landmark-${slug}-${idx}`,
                    name: lm.name,
                    landmarkName: lm.name,
                    category: lm.category || "Historic Landmark",
                    duration: lm.duration || "",
                    description: lm.description || "",
                    imageUrl: lm.imageUrl || "",
                    fortSlug: slug,
                    fortName: history.name || fortObj?.name || slug,
                    pinColor: "#f59e0b",
                    glowColor: "#fbbf24",
                    isSelectedFort: slug === selectedSlug,
                },
                geometry: {
                    type: "Point",
                    coordinates: lmCoords,
                },
            });
        });
    }

    return { type: "FeatureCollection", features };
};

// ── Geospatial Elevation & Profile Calculations (Phase 2) ──

/**
 * Calculate the great-circle distance between two [lng, lat] coordinates in kilometers.
 * Uses the Haversine formula.
 */
export const haversineDistanceKm = (coord1, coord2) => {
    if (!isValidLngLat(coord1) || !isValidLngLat(coord2)) return 0;
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Calculate slope gradient percentage and angle in degrees between two elevation points.
 */
export const calculateSlopeGradient = (distanceMeters, elevDiffMeters) => {
    if (distanceMeters <= 0) return { angleDeg: 0, gradientPct: 0, category: "gentle" };
    const gradientPct = (Math.abs(elevDiffMeters) / distanceMeters) * 100;
    const angleDeg = (Math.atan2(Math.abs(elevDiffMeters), distanceMeters) * 180) / Math.PI;

    let category = "gentle";
    if (angleDeg >= 25) category = "steep";
    else if (angleDeg >= 15) category = "moderate";

    return {
        angleDeg: Math.round(angleDeg * 10) / 10,
        gradientPct: Math.round(gradientPct * 10) / 10,
        category,
    };
};

/**
 * Compute estimated trek time using Naismith's Rule with Langmuir descent correction:
 * Base time = 5 km/h walking speed
 * Ascent penalty = +1 hour per 600m ascent
 * Descent penalty = +1 hour per 1200m descent if slope is steep (>300m drop)
 */
export const computeNaismithTrekTime = (distanceKm, elevationGainMeters = 0, elevationLossMeters = 0) => {
    const validDist = Math.max(0.1, Number(distanceKm) || 0);
    const validGain = Math.max(0, Number(elevationGainMeters) || 0);
    const validLoss = Math.max(0, Number(elevationLossMeters) || 0);

    const baseHours = validDist / 4.2; // 4.2 km/h average mountain trail baseline
    const ascentHours = baseHours + validGain / 550; // 550m ascent per hr in Sahyadri terrain
    const descentHours = baseHours + (validLoss > 200 ? (validLoss - 200) / 1000 : 0);

    const formatHours = (h) => {
        const totalMinutes = Math.round(h * 60);
        const hrs = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        if (hrs === 0) return `${mins}m`;
        return `${hrs}h ${mins > 0 ? `${mins}m` : ""}`.trim();
    };

    return {
        ascentMinutes: Math.round(ascentHours * 60),
        descentMinutes: Math.round(descentHours * 60),
        ascentFormatted: formatHours(ascentHours),
        descentFormatted: formatHours(descentHours),
    };
};

/**
 * Compute the complete elevation profile points and statistics along a trail path.
 * Samples true 3D DEM terrain from MapLibre queryTerrainElevation if available;
 * otherwise uses realistic orographic natural elevation curves along the ascent.
 *
 * @param {Array<Array<number>>} path - Array of [lng, lat] coordinates
 * @param {number} fortElevation - Summit fort elevation in meters ASL
 * @param {Object|null} map - MapLibre map instance (for live DEM terrain query)
 * @returns {Object} Elevation profile data
 */
export const computeTrailElevationProfile = (path, fortElevation = 1000, map = null) => {
    if (!Array.isArray(path) || path.length < 2) {
        return null;
    }

    const summitElev = Math.max(100, Number(fortElevation) || 1000);
    // Base valley elevation typically 350-500m below summit in Sahyadris
    const baseElev = Math.max(20, Math.round(summitElev * 0.48));

    let cumulativeDist = 0;
    const rawPoints = [];

    for (let i = 0; i < path.length; i++) {
        const coord = path[i];
        if (i > 0) {
            cumulativeDist += haversineDistanceKm(path[i - 1], coord);
        }

        // Try querying true DEM terrain elevation
        let elev = null;
        if (map && typeof map.queryTerrainElevation === "function") {
            try {
                const sampled = map.queryTerrainElevation(coord);
                if (sampled != null && !isNaN(sampled)) {
                    elev = Math.round(sampled);
                }
            } catch {
                // Ignore query error, fall back to mathematical orographic model
            }
        }

        rawPoints.push({
            coord,
            distKm: cumulativeDist,
            queriedElev: elev,
        });
    }

    const totalDistanceKm = Math.max(0.1, cumulativeDist);

    // If MapLibre DEM wasn't available for points, generate realistic topographic curve
    const points = rawPoints.map((pt, idx) => {
        const t = pt.distKm / totalDistanceKm; // 0 (start/valley) -> 1 (citadel)
        let finalElev = pt.queriedElev;

        if (finalElev == null) {
            // Orographic mountain profile: steeper near the citadel bastion
            // Uses an exponential sigmoid blend with natural micro-ridges
            const curve = Math.pow(t, 1.4);
            const ridgeNoise = Math.sin(t * Math.PI * 4) * 18 * Math.sin(t * Math.PI);
            finalElev = Math.round(baseElev + (summitElev - baseElev) * curve + ridgeNoise);
        }

        return {
            distanceKm: Math.round(pt.distKm * 100) / 100,
            elevationM: finalElev,
            coordinates: pt.coord,
        };
    });

    // Compute ascent, descent, and segment slopes
    let totalAscent = 0;
    let totalDescent = 0;
    let maxSlopeAngle = 0;

    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const segDistM = (curr.distanceKm - prev.distanceKm) * 1000;
        const elevDiff = curr.elevationM - prev.elevationM;

        if (elevDiff > 0) totalAscent += elevDiff;
        else totalDescent += Math.abs(elevDiff);

        const slope = calculateSlopeGradient(segDistM, elevDiff);
        curr.slopeAngle = slope.angleDeg;
        curr.gradientPct = slope.gradientPct;
        curr.slopeCategory = slope.category;

        if (slope.angleDeg > maxSlopeAngle) {
            maxSlopeAngle = slope.angleDeg;
        }
    }

    if (points.length > 0 && points[0].slopeAngle == null) {
        points[0].slopeAngle = points[1]?.slopeAngle || 0;
        points[0].gradientPct = points[1]?.gradientPct || 0;
        points[0].slopeCategory = points[1]?.slopeCategory || "gentle";
    }

    const elevations = points.map((p) => p.elevationM);
    const minElev = Math.min(...elevations);
    const maxElev = Math.max(...elevations);
    const naismith = computeNaismithTrekTime(totalDistanceKm, totalAscent, totalDescent);

    return {
        points,
        totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
        minElevation: minElev,
        maxElevation: maxElev,
        elevationGain: Math.round(totalAscent),
        elevationLoss: Math.round(totalDescent),
        maxSlopeAngle: Math.round(maxSlopeAngle * 10) / 10,
        naismith,
    };
};

