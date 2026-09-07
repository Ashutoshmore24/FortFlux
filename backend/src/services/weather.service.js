import Fort from "../models/Fort.js";

// ─────────────────────────────────────────────────────────────
// In-Memory Weather Cache
// Key: "lat,lon" → { data, fetchedAt }
// TTL: 10 minutes
// ─────────────────────────────────────────────────────────────
const weatherCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Maps WMO weather codes to human-readable descriptions and severity levels.
 * Reference: https://open-meteo.com/en/docs#weathervariables
 */
const WMO_WEATHER_CODES = {
    0: { description: "Clear Sky", severity: "clear", icon: "☀️" },
    1: { description: "Mainly Clear", severity: "clear", icon: "🌤️" },
    2: { description: "Partly Cloudy", severity: "clear", icon: "⛅" },
    3: { description: "Overcast", severity: "cloudy", icon: "☁️" },
    45: { description: "Fog", severity: "cloudy", icon: "🌫️" },
    48: { description: "Depositing Rime Fog", severity: "cloudy", icon: "🌫️" },
    51: { description: "Light Drizzle", severity: "light", icon: "🌦️" },
    53: { description: "Moderate Drizzle", severity: "moderate", icon: "🌧️" },
    55: { description: "Dense Drizzle", severity: "moderate", icon: "🌧️" },
    56: { description: "Light Freezing Drizzle", severity: "moderate", icon: "🌧️" },
    57: { description: "Dense Freezing Drizzle", severity: "heavy", icon: "🌧️" },
    61: { description: "Slight Rain", severity: "light", icon: "🌦️" },
    63: { description: "Moderate Rain", severity: "moderate", icon: "🌧️" },
    65: { description: "Heavy Rain", severity: "heavy", icon: "🌧️" },
    66: { description: "Light Freezing Rain", severity: "heavy", icon: "🌧️" },
    67: { description: "Heavy Freezing Rain", severity: "extreme", icon: "🌧️" },
    71: { description: "Slight Snowfall", severity: "moderate", icon: "🌨️" },
    73: { description: "Moderate Snowfall", severity: "heavy", icon: "🌨️" },
    75: { description: "Heavy Snowfall", severity: "extreme", icon: "🌨️" },
    77: { description: "Snow Grains", severity: "moderate", icon: "🌨️" },
    80: { description: "Slight Rain Showers", severity: "light", icon: "🌦️" },
    81: { description: "Moderate Rain Showers", severity: "moderate", icon: "🌧️" },
    82: { description: "Violent Rain Showers", severity: "extreme", icon: "⛈️" },
    85: { description: "Slight Snow Showers", severity: "moderate", icon: "🌨️" },
    86: { description: "Heavy Snow Showers", severity: "extreme", icon: "🌨️" },
    95: { description: "Thunderstorm", severity: "extreme", icon: "⛈️" },
    96: { description: "Thunderstorm with Slight Hail", severity: "extreme", icon: "⛈️" },
    99: { description: "Thunderstorm with Heavy Hail", severity: "extreme", icon: "⛈️" },
};

/**
 * Maps precipitation (mm/hr) to a monsoon severity label for the Sahyadri context.
 */
const getMonsoonSeverity = (precipitation) => {
    if (precipitation <= 0) return { label: "Dry Conditions", level: 0 };
    if (precipitation <= 2.5) return { label: "Light Drizzle", level: 1 };
    if (precipitation <= 7.5) return { label: "Moderate Rain", level: 2 };
    if (precipitation <= 35) return { label: "Moderate Monsoon Surge", level: 3 };
    if (precipitation <= 75) return { label: "Heavy Monsoon Downpour", level: 4 };
    return { label: "Extreme Cloudburst", level: 5 };
};

/**
 * Generates trek recommendations based on weather conditions.
 */
const generateTrekRecommendations = (weatherData) => {
    let status = "Highly Recommended";
    let isSafe = true;
    let message = "Conditions are ideal for trekking. Enjoy your trip!";
    let accessories = ["Water (2-3L)", "Trekking Shoes", "Energy Snacks", "First-Aid Kit"];
    let precautions = ["Stay hydrated", "Keep the fort clean"];
    
    const { temperature, windSpeed, precipitation, weatherSeverity } = weatherData;

    // Evaluate Precipitation / Weather Severity
    if (weatherSeverity === "extreme" || precipitation > 35) {
        status = "Strictly Avoid";
        isSafe = false;
        message = "Extreme weather or heavy downpour detected. High risk of landslides and slippery routes.";
        accessories = ["Heavy Raincoat", "Waterproof Bag Cover"];
        precautions = ["Do not attempt the trek", "Seek safe shelter immediately", "Avoid streams and edges"];
    } else if (weatherSeverity === "heavy" || precipitation > 7.5) {
        status = "Not Recommended";
        isSafe = false;
        message = "Heavy rain expected. The trails will be very slippery and visibility might be low.";
        accessories.push("Raincoat", "Waterproof Trekking Shoes", "Trekking Pole", "Waterproof Bag Cover");
        precautions.push("Watch your step on wet rocks", "Avoid steep ascents", "Return before dark");
    } else if (weatherSeverity === "moderate" || precipitation > 0) {
        status = "Proceed with Caution";
        isSafe = true;
        message = "Light to moderate rain. The trail might be slightly slippery.";
        accessories.push("Light Rain Jacket", "Trekking Pole", "Cap");
        precautions.push("Be careful on descending routes", "Carry extra dry clothes");
    }

    // Evaluate Temperature
    if (temperature > 35) {
        if (status === "Highly Recommended") {
            status = "Proceed with Caution";
            message = "High temperatures. Risk of dehydration and heat exhaustion.";
        }
        accessories.push("Sunscreen", "Sunglasses", "Cap/Hat", "Electrolytes");
        precautions.push("Start trek early morning", "Take frequent breaks in shade", "Avoid midday sun");
    } else if (temperature < 10) {
        accessories.push("Thermal Wear", "Fleece Jacket", "Gloves");
        precautions.push("Dress in layers", "Keep moving to stay warm");
    }

    // Evaluate Wind Speed
    if (windSpeed > 40) {
        status = status === "Strictly Avoid" ? "Strictly Avoid" : "Not Recommended";
        isSafe = false;
        message = "High wind speeds detected. Very dangerous near cliff edges and ridges.";
        precautions.push("Avoid walking on exposed ridges", "Maintain low center of gravity");
    }

    // Ensure accessories and precautions are unique
    return {
        status,
        isSafe,
        message,
        accessories: [...new Set(accessories)],
        precautions: [...new Set(precautions)],
    };
};

/**
 * Fetches current weather data from Open-Meteo for a given lat/lon.
 * Uses in-memory cache with 10-minute TTL.
 */
const getWeatherForCoords = async (latitude, longitude) => {
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;

    // Check cache
    const cached = weatherCache.get(cacheKey);
    if (cached && (Date.now() - cached.fetchedAt) < CACHE_TTL_MS) {
        return { ...cached.data, cached: true };
    }

    // Fetch from Open-Meteo API
    const params = new URLSearchParams({
        latitude: latitude.toFixed(4),
        longitude: longitude.toFixed(4),
        current: [
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation",
            "rain",
            "weather_code",
            "wind_speed_10m",
            "wind_gusts_10m",
            "apparent_temperature",
        ].join(","),
        timezone: "Asia/Kolkata",
        forecast_days: "1",
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Open-Meteo API returned ${response.status}: ${response.statusText}`);
    }

    const apiData = await response.json();
    const current = apiData.current;

    // Decode WMO weather code
    const weatherCode = current.weather_code;
    const weatherInfo = WMO_WEATHER_CODES[weatherCode] || {
        description: "Unknown",
        severity: "unknown",
        icon: "❓",
    };

    // Compute monsoon severity
    const monsoon = getMonsoonSeverity(current.precipitation);

    const baseWeatherData = {
        temperature: current.temperature_2m,
        apparentTemperature: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        precipitation: current.precipitation,
        rain: current.rain,
        windSpeed: current.wind_speed_10m,
        windGusts: current.wind_gusts_10m,
        weatherCode,
        weatherDescription: weatherInfo.description,
        weatherSeverity: weatherInfo.severity,
        weatherIcon: weatherInfo.icon,
        monsoonSeverity: monsoon,
    };

    const recommendation = generateTrekRecommendations(baseWeatherData);

    const weatherData = {
        ...baseWeatherData,
        recommendation,
        units: {
            temperature: "°C",
            humidity: "%",
            precipitation: "mm",
            windSpeed: "km/h",
        },
        fetchedAt: new Date().toISOString(),
        cached: false,
    };

    // Store in cache
    weatherCache.set(cacheKey, {
        data: weatherData,
        fetchedAt: Date.now(),
    });

    return weatherData;
};

/**
 * Fetches weather for a fort by its slug.
 * Looks up fort coordinates from the database (Phase 1 Fort model).
 */
const getWeatherForFort = async (fortSlug) => {
    const fort = await Fort.findOne({ slug: fortSlug.toLowerCase() });

    if (!fort) {
        return null;
    }

    // Fort.location.coordinates is [longitude, latitude] (GeoJSON format)
    const [longitude, latitude] = fort.location.coordinates;
    const weather = await getWeatherForCoords(latitude, longitude);

    return {
        fort: {
            name: fort.name,
            slug: fort.slug,
            elevation: fort.elevation,
            region: fort.region,
            coordinates: { latitude, longitude },
        },
        weather,
    };
};

/**
 * Clears the weather cache (useful for testing or manual refresh).
 */
const clearWeatherCache = () => {
    weatherCache.clear();
};

export { getWeatherForFort, getWeatherForCoords, clearWeatherCache };
