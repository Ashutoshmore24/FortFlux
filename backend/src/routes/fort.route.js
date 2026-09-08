import express from "express";
import {
    getAllForts,
    getFortBySlug,
    getFortTrails,
    getFortCisterns,
    getFortHistory,
    updateTrailStatus,
} from "../controllers/fort.controller.js";
import { protectRoute, requireRole } from "../middlewares/auth.middleware.js";
import { getRoute, simulateRoute } from "../controllers/routing.controller.js";
const router = express.Router();

// Public routes (accessible to all trekkers and visitors)
router.get("/", getAllForts);
router.get("/:slug", getFortBySlug);
router.get("/:slug/history", getFortHistory);
router.get("/:slug/trails", getFortTrails);
router.get("/:slug/cisterns", getFortCisterns);
router.get("/:slug/route", getRoute);
router.post("/:slug/route/simulate", simulateRoute);

// Protected routes (authorities & admins only)
router.put(
    "/trails/:trailId",
    protectRoute,
    requireRole("authority", "admin"),
    updateTrailStatus
);

export default router;
