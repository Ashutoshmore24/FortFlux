import express from "express";
import {
    createReport,
    getFortReports,
    getRecentReports,
    updateReportStatus,
} from "../controllers/report.controller.js";
import { protectRoute, requireRole } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Public / Authenticated read routes
router.get("/recent", getRecentReports);
router.get("/fort/:slug", getFortReports);

// Protected report submission
router.post(
    "/",
    protectRoute,
    upload.single("photo"),
    createReport
);

// Protected authority triage action
router.patch(
    "/:id/status",
    protectRoute,
    requireRole("authority", "admin"),
    updateReportStatus
);

export default router;
