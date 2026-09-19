import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";
import ENV from "./env.js";

const ARCJET_KEY = ENV.ARCJET_KEY || "";
export const isArcjetConfigured = Boolean(ARCJET_KEY && ARCJET_KEY.trim().length > 0);

const ALLOWED_BOTS = [
  "CATEGORY:SEARCH_ENGINE",
  "CATEGORY:PREVIEW",
];

/**
 * Optimized Authentication Rate Limiting
 * Allows up to 5 attempts in a quick 10-second burst (handles typos),
 * but caps attempts at 15 over 15 minutes to block sustained brute-forcing.
 */
export const authArcjet = isArcjetConfigured
  ? arcjet({
      key: ARCJET_KEY,
      rules: [
        shield({ mode: "LIVE" }),
        detectBot({ mode: "LIVE", allow: ALLOWED_BOTS }),
        slidingWindow({
          mode: "LIVE",
          characteristics: ["ip.src"], // Track by IP
          max: 5,
          interval: 10, // Short burst protection
        }),
        slidingWindow({
          mode: "LIVE",
          characteristics: ["ip.src"], 
          max: 15,
          interval: 900, // 15 minutes sustained protection
        }),
      ],
    })
  : null;

/**
 * Report Submissions (Cloudinary Protection)
 * Tightened to 5 requests per 60 seconds unless bulk uploading is required.
 */
export const reportArcjet = isArcjetConfigured
  ? arcjet({
      key: ARCJET_KEY,
      rules: [
        shield({ mode: "LIVE" }),
        slidingWindow({
          mode: "LIVE",
          max: 5, // Reduced from 10 to save Cloudinary costs
          interval: 60,
        }),
      ],
    })
  : null;

/**
 * Baseline Global Rate Limiting (Maintained)
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

const aj = authArcjet;
export default aj;
