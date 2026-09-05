import express from "express";
import { getRisk, applyRisk } from "../controllers/risk.controller.js";
import { protectRoute, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Any authenticated user can fetch live-computed risk (read-only)
router.get("/:fortSlug", protectRoute, getRisk);

// Authority / Admin only: compute + persist risk scores to DB
router.post(
    "/:fortSlug/apply",
    protectRoute,
    requireRole("authority", "admin"),
    applyRisk
);

export default router;
