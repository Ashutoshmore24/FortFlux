import express from "express";
import {
    getAllForts,
    getFortBySlug,
    getFortTrails,
    getFortCisterns,
    updateTrailStatus,
} from "../controllers/fort.controller.js";
import { protectRoute, requireRole } from "../middlewares/auth.middleware.js";
import { getRoute } from "../controllers/routing.controller.js";
const router = express.Router();

// Public routes (accessible to all trekkers and visitors)
router.get("/", getAllForts);
router.get("/:slug", getFortBySlug);
router.get("/:slug/trails", getFortTrails);
router.get("/:slug/cisterns", getFortCisterns);
router.get("/:slug/route", getRoute);

// Protected routes (authorities & admins only)
router.put(
    "/trails/:trailId",
    protectRoute,
    requireRole("authority", "admin"),
    updateTrailStatus
);

export default router;
