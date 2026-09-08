import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";
import ENV from "./env.js";

const ARCJET_KEY = ENV.ARCJET_KEY || "";
export const isArcjetConfigured = Boolean(ARCJET_KEY && ARCJET_KEY.trim().length > 0);

// Base common bot categories allowed
const ALLOWED_BOTS = [
    "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
    "CATEGORY:PREVIEW",       // Link previews e.g. Slack, Discord, Twitter
];

/**
 * Strict rate limiting for Authentication endpoints (login, signup, google)
 * Max 5 requests per 60 seconds to prevent credential stuffing & brute-force
 */
export const authArcjet = isArcjetConfigured
    ? arcjet({
        key: ARCJET_KEY,
        rules: [
            shield({ mode: "LIVE" }),
            detectBot({
                mode: "LIVE",
                allow: ALLOWED_BOTS,
            }),
            slidingWindow({
                mode: "LIVE",
                max: 5,
                interval: 60,
            }),
        ],
    })
    : null;

/**
 * Sensitive action rate limiting for photo/evidence report submissions
 * Max 10 requests per 60 seconds to protect Cloudinary upload bandwidth & storage
 */
export const reportArcjet = isArcjetConfigured
    ? arcjet({
        key: ARCJET_KEY,
        rules: [
            shield({ mode: "LIVE" }),
            slidingWindow({
                mode: "LIVE",
                max: 10,
                interval: 60,
            }),
        ],
    })
    : null;

/**
 * Baseline rate limiting across all API endpoints
 * Max 100 requests per 60 seconds to protect against general DoS/flooding
 */
export const globalArcjet = isArcjetConfigured
    ? arcjet({
        key: ARCJET_KEY,
        rules: [
            shield({ mode: "LIVE" }),
            slidingWindow({
                mode: "LIVE",
                max: 100,
                interval: 60,
            }),
        ],
    })
    : null;

// Default export maintains backward compatibility
const aj = authArcjet;
export default aj;
