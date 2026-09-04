import express from "express";
import { getWeather, clearCache } from "../controllers/weather.controller.js";
import { protectRoute, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protected route: any authenticated user can fetch weather
router.get("/:fortSlug", protectRoute, getWeather);

// Admin-only: clear weather cache
router.post("/cache/clear", protectRoute, requireRole("admin"), clearCache);

export default router;
