import { getWeatherForFort, clearWeatherCache } from "../services/weather.service.js";

/**
 * GET /api/weather/:fortSlug
 * Returns live weather data for the specified fort.
 * Requires authentication (protectRoute middleware applied in route).
 */
export const getWeather = async (req, res) => {
    try {
        const { fortSlug } = req.params;

        if (!fortSlug || fortSlug.trim() === "") {
            return res.status(400).json({ message: "Fort slug is required" });
        }

        const result = await getWeatherForFort(fortSlug);

        if (!result) {
            return res.status(404).json({
                message: `Fort with slug '${fortSlug}' not found`,
            });
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in getWeather controller:", error.message);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * POST /api/weather/cache/clear
 * Admin-only endpoint to manually clear the weather cache.
 */
export const clearCache = async (req, res) => {
    try {
        clearWeatherCache();
        return res.status(200).json({ message: "Weather cache cleared successfully" });
    } catch (error) {
        console.error("Error in clearCache controller:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
