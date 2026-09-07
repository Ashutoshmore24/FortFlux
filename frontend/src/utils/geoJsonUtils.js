// ── GeoJSON Conversion Utilities ──
// Converts backend MongoDB data into GeoJSON FeatureCollections for MapLibre.
// Validates all coordinates before rendering.

import { RISK_COLORS, CISTERN_COLORS } from "../config/mapConfig";

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
 * @returns {Object} GeoJSON FeatureCollection
 */
export const fortsToGeoJSON = (forts, selectedSlug = null) => {
    const features = [];

    for (const fort of forts) {
        const coords = fort.location?.coordinates;
        if (!isValidLngLat(coords)) {
            console.warn(`[FortFlux] Invalid coordinates for fort "${fort.name}", skipping.`, coords);
            continue;
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
                isSeaFort: (fort.elevation || 0) <= 15,
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
