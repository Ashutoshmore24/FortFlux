import Trail from "../models/Trail.js";
import Fort from "../models/Fort.js";
import { getWeatherForCoords } from "./weather.service.js";

// ─────────────────────────────────────────────────────────────
// Risk Calculation Constants
// ─────────────────────────────────────────────────────────────
const MAX_RAINFALL_MM = 150; // mm/hr — denominator for soil saturation

// Auto-status thresholds
const THRESHOLD_CAUTION = 30;
const THRESHOLD_CLOSED = 75;

/**
 * Determines trail status based on computed risk score.
 */
const getStatusFromRisk = (riskScore) => {
    if (riskScore >= THRESHOLD_CLOSED) return "closed";
    if (riskScore >= THRESHOLD_CAUTION) return "caution";
    return "open";
};

/**
 * Computes risk score for a single trail segment using live weather data.
 *
 * Formula:
 *   Risk = min(100, baselineDifficulty × soilSaturation × slopeGradient × (footfall / maxSafeFootfall) × 100)
 *
 * Where:
 *   soilSaturation = min(precipitation / MAX_RAINFALL_MM, 1.0)
 *
 * @param {Object} trail - Trail document from MongoDB
 * @param {Object} weatherData - Weather data from weather.service.js
 * @param {number} [footfallOverride] - Optional footfall override (for authority simulation)
 * @returns {Object} Risk breakdown for this trail
 */
const computeTrailRisk = (trail, weatherData, footfallOverride = null) => {
    const precipitation = weatherData?.precipitation ?? 0;
    const soilSaturation = Math.min(precipitation / MAX_RAINFALL_MM, 1.0);
    const footfall = footfallOverride ?? trail.currentFootfall;

    const rawRisk =
        trail.baselineDifficulty *
        soilSaturation *
        trail.slopeGradient *
        (footfall / trail.maxSafeFootfall) *
        100;

    const liveRiskScore = Math.min(100, Math.round(rawRisk));
    const suggestedStatus = getStatusFromRisk(liveRiskScore);

    return {
        trailId: trail._id,
        name: trail.name,
        slug: trail.slug,
        liveRiskScore,
        suggestedStatus,
        currentDbRiskScore: trail.currentRiskScore,
        currentDbStatus: trail.status,
        factors: {
            baselineDifficulty: trail.baselineDifficulty,
            slopeGradient: trail.slopeGradient,
            soilSaturation: parseFloat(soilSaturation.toFixed(3)),
            precipitation,
            footfall,
            maxSafeFootfall: trail.maxSafeFootfall,
        },
    };
};

/**
 * Computes risk scores for ALL trail segments of a fort using live weather.
 *
 * @param {string} fortSlug - Fort slug identifier
 * @param {number} [footfallOverride] - Optional global footfall override
 * @returns {Object|null} Full risk breakdown, or null if fort not found
 */
const computeFortRisk = async (fortSlug, footfallOverride = null) => {
    const fort = await Fort.findOne({ slug: fortSlug.toLowerCase() });
    if (!fort) return null;

    const trails = await Trail.find({ fort: fort._id });
    if (trails.length === 0) {
        return {
            fort: {
                name: fort.name,
                slug: fort.slug,
                elevation: fort.elevation,
            },
            weather: null,
            trails: [],
            aggregate: { averageRisk: 0, maxRisk: 0, criticalCount: 0, cautionCount: 0 },
        };
    }

    // Fetch live weather for the fort's coordinates
    const [longitude, latitude] = fort.location.coordinates;
    const weatherData = await getWeatherForCoords(latitude, longitude);

    // Compute risk for each trail
    const trailRisks = trails.map((trail) =>
        computeTrailRisk(trail, weatherData, footfallOverride)
    );

    // Aggregate stats
    const scores = trailRisks.map((t) => t.liveRiskScore);
    const averageRisk = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const maxRisk = Math.max(...scores);
    const criticalCount = scores.filter((s) => s >= THRESHOLD_CLOSED).length;
    const cautionCount = scores.filter((s) => s >= THRESHOLD_CAUTION && s < THRESHOLD_CLOSED).length;

    return {
        fort: {
            name: fort.name,
            slug: fort.slug,
            elevation: fort.elevation,
        },
        weather: {
            precipitation: weatherData.precipitation,
            humidity: weatherData.humidity,
            windSpeed: weatherData.windSpeed,
            weatherDescription: weatherData.weatherDescription,
            weatherIcon: weatherData.weatherIcon,
            monsoonSeverity: weatherData.monsoonSeverity,
            cached: weatherData.cached,
        },
        trails: trailRisks,
        aggregate: {
            averageRisk,
            maxRisk,
            criticalCount,
            cautionCount,
            totalTrails: trails.length,
        },
        computedAt: new Date().toISOString(),
    };
};

/**
 * Computes risk scores AND persists them to the database.
 * Also auto-sets trail status based on risk thresholds.
 * Authority-only action.
 *
 * @param {string} fortSlug - Fort slug identifier
 * @param {number} [footfallOverride] - Optional global footfall override
 * @returns {Object|null} Risk breakdown with applied status, or null if fort not found
 */
const applyRiskScores = async (fortSlug, footfallOverride = null) => {
    const result = await computeFortRisk(fortSlug, footfallOverride);
    if (!result || result.trails.length === 0) return result;

    // Persist each trail's computed risk score and auto-status
    const updatePromises = result.trails.map(async (trailRisk) => {
        const trail = await Trail.findById(trailRisk.trailId);
        if (!trail) return;

        // Don't override a manually "diverted" trail — authorities set that explicitly
        const shouldAutoStatus = trail.status !== "diverted";

        trail.currentRiskScore = trailRisk.liveRiskScore;
        if (shouldAutoStatus) {
            trail.status = trailRisk.suggestedStatus;
        }

        await trail.save();

        // Update result object to reflect what was actually applied
        trailRisk.appliedStatus = trail.status;
        trailRisk.wasAutoSet = shouldAutoStatus;
    });

    await Promise.all(updatePromises);

    result.appliedAt = new Date().toISOString();
    return result;
};

export { computeTrailRisk, computeFortRisk, applyRiskScores };
