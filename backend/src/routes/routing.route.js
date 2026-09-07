import express from "express";
import { getRoute, simulateRoute } from "../controllers/routing.controller.js";

const router = express.Router();

// GET /api/routing/:slug?start=...&destination=...
router.get("/:slug", getRoute);
router.get("/:slug/route", getRoute);

// POST /api/routing/simulate  (body: { fortSlug, rainfall, footfall, severedTrailIds, start, destination })
router.post("/simulate", simulateRoute);
router.post("/:slug/simulate", simulateRoute);

export default router;
