import TrailReport from "../models/TrailReport.js";
import Fort from "../models/Fort.js";
import Trail from "../models/Trail.js";
import cloudinary from "../lib/cloudinary.js";
import ENV from "../lib/env.js";

/**
 * AI Hazard Triage Heuristic Engine
 * Generates automated assessment and recommendations based on hazard and severity.
 */
const generateAiTriage = (hazardType, severity) => {
    const assessments = {
        rockfall: {
            critical: {
                confidence: 0.94,
                assessment: "Active boulder detachment & scree displacement detected on steep ascent path.",
                action: "Immediate path severance advised. Reroute footfall via alternate gate.",
            },
            high: {
                confidence: 0.91,
                assessment: "Unstable rock slabs observed above primary trail gully.",
                action: "Issue high rockfall warning; caution helmets mandatory.",
            },
            default: {
                confidence: 0.86,
                assessment: "Scattered loose stone scree causing moderate traction hazard.",
                action: "Advise walking poles and slow pace through section.",
            },
        },
        landslide: {
            critical: {
                confidence: 0.96,
                assessment: "Severe slope failure and soil liquification across trail corridor.",
                action: "Emergency closure required. Trigger automated Dijkstra detour engine.",
            },
            default: {
                confidence: 0.89,
                assessment: "Early slope erosion and mud saturation threatening trail shoulder.",
                action: "Monitor hydrological saturation index closely.",
            },
        },
        fissure: {
            critical: {
                confidence: 0.92,
                assessment: "Deep masonry separation detected in historical bastion curtain wall.",
                action: "Cordon off bastion edge; dispatch ASI heritage structural inspection.",
            },
            default: {
                confidence: 0.87,
                assessment: "Mortar degradation and surface weathering on stone steps.",
                action: "Schedule conservation repair for upcoming dry season.",
            },
        },
        waterlogging: {
            critical: {
                confidence: 0.93,
                assessment: "Cistern overflow cascade flooding rock-cut stairs with swift current.",
                action: "Sever waterlogged trail; divert trekkers to high-ridge bypass.",
            },
            default: {
                confidence: 0.88,
                assessment: "Standing water and moss slickness on carved stone steps.",
                action: "Alert trekkers to slippery basalt hazards.",
            },
        },
        railing: {
            critical: {
                confidence: 0.95,
                assessment: "Complete anchor detachment of safety cable adjacent to 400m precipice.",
                action: "Close exposure section immediately until safety railing re-anchored.",
            },
            default: {
                confidence: 0.90,
                assessment: "Loose steel stanchion identified on outer ridge traversal.",
                action: "Caution trekkers to maintain distance from outer rim.",
            },
        },
    };

    const typeConfig = assessments[hazardType] || {
        default: {
            confidence: 0.85,
            assessment: "Trail obstruction reported requiring visual monitoring.",
            action: "Field review queued for authority inspection.",
        },
    };

    const selected = typeConfig[severity] || typeConfig.default || typeConfig;

    return {
        confidenceScore: selected.confidence,
        hazardAssessment: selected.assessment,
        recommendedAction: selected.action,
    };
};

/**
 * POST /api/reports
 * Submit a crowdsourced photo evidence report.
 */
export const createReport = async (req, res) => {
    try {
        const {
            fortId,
            fortSlug,
            trailId,
            hazardType = "rockfall",
            severity = "moderate",
            description = "",
            latitude,
            longitude,
        } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Photo evidence is required" });
        }

        // Resolve fort
        let targetFort = null;
        if (fortId) {
            targetFort = await Fort.findById(fortId);
        } else if (fortSlug) {
            targetFort = await Fort.findOne({ slug: fortSlug.toLowerCase() });
        }

        if (!targetFort) {
            return res.status(404).json({ message: "Target fort not found" });
        }

        // Parse coordinates
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const hasValidCoords = !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

        const coordinates = hasValidCoords
            ? [lng, lat]
            : targetFort.location?.coordinates || [73.6822, 18.2459];

        // Resolve image URL (Cloudinary with graceful Base64 fallback)
        let imageUrl = "";
        let cloudinaryId = "";

        const hasCloudinary = ENV.CLOUDINARY_CLOUD_NAME && ENV.CLOUDINARY_API_KEY && ENV.CLOUDINARY_API_SECRET;

        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        if (hasCloudinary) {
            try {
                const uploadRes = await cloudinary.uploader.upload(dataURI, {
                    folder: "fortflux_reports",
                    transformation: [{ width: 1200, height: 900, crop: "limit", quality: "auto" }],
                });
                imageUrl = uploadRes.secure_url;
                cloudinaryId = uploadRes.public_id;
            } catch (cloudErr) {
                console.warn("Cloudinary upload failed, using dataURI fallback:", cloudErr.message);
                imageUrl = dataURI;
            }
        } else {
            imageUrl = dataURI;
        }

        // Run AI triage heuristic
        const aiTriage = generateAiTriage(hazardType, severity);

        // Resolve trail: if not passed, find closest trail belonging to the fort
        let matchedTrailId = trailId || null;
        if (!matchedTrailId) {
            const fortTrails = await Trail.find({ fort: targetFort._id });
            if (fortTrails.length > 0) {
                matchedTrailId = fortTrails[0]._id;
            }
        }

        const report = await TrailReport.create({
            fort: targetFort._id,
            trail: matchedTrailId,
            user: req.user._id,
            imageUrl,
            cloudinaryId,
            hazardType,
            severity,
            description: description.trim(),
            location: {
                type: "Point",
                coordinates,
            },
            status: "pending",
            aiTriage,
        });

        const populated = await TrailReport.findById(report._id)
            .populate("user", "username avatarUrl role organization")
            .populate("trail", "name slug")
            .populate("fort", "name slug");

        return res.status(201).json({
            success: true,
            message: "Trail evidence report successfully submitted for audit",
            report: populated,
        });
    } catch (error) {
        console.error("Error in createReport controller:", error);
        return res.status(500).json({ message: "Failed to submit trail report", error: error.message });
    }
};

/**
 * GET /api/reports/fort/:slug
 * Fetch all crowdsourced reports for a specific fort.
 */
export const getFortReports = async (req, res) => {
    try {
        const { slug } = req.params;
        const fort = await Fort.findOne({ slug: slug.toLowerCase() });

        if (!fort) {
            return res.status(404).json({ message: `Fort '${slug}' not found` });
        }

        const reports = await TrailReport.find({ fort: fort._id })
            .populate("user", "username avatarUrl role organization")
            .populate("trail", "name slug status currentRiskScore")
            .populate("verifiedBy", "username role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            fort: fort.name,
            fortSlug: fort.slug,
            count: reports.length,
            reports,
        });
    } catch (error) {
        console.error("Error in getFortReports controller:", error.message);
        return res.status(500).json({ message: "Failed to load fort reports" });
    }
};

/**
 * GET /api/reports/recent
 * Get the most recent crowdsourced reports across the entire fort network.
 */
export const getRecentReports = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 10;

        const reports = await TrailReport.find({})
            .populate("user", "username avatarUrl role organization")
            .populate("fort", "name slug elevation district")
            .populate("trail", "name slug status currentRiskScore")
            .sort({ createdAt: -1 })
            .limit(limit);

        return res.status(200).json({
            success: true,
            count: reports.length,
            reports,
        });
    } catch (error) {
        console.error("Error in getRecentReports controller:", error.message);
        return res.status(500).json({ message: "Failed to fetch recent reports" });
    }
};

/**
 * PATCH /api/reports/:id/status
 * Authority audit action: verify, reject, or resolve a report.
 * Optionally triggers automatic trail severing if verified.
 */
export const updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, action = "none" } = req.body;

        const validStatuses = ["pending", "verified", "rejected", "resolved"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const report = await TrailReport.findById(id);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        report.status = status;
        report.verifiedBy = req.user._id;
        report.verifiedAt = new Date();
        await report.save();

        // If authority ordered a trail closure/severance based on this evidence
        let trailSevered = false;
        if (action === "sever_trail" && report.trail) {
            await Trail.findByIdAndUpdate(report.trail, {
                status: "closed",
                currentRiskScore: 85,
            });
            trailSevered = true;
        }

        const updated = await TrailReport.findById(id)
            .populate("user", "username avatarUrl role")
            .populate("trail", "name slug status currentRiskScore")
            .populate("verifiedBy", "username role");

        return res.status(200).json({
            success: true,
            message: `Report marked as ${status}${trailSevered ? " and associated trail severed" : ""}`,
            report: updated,
            trailSevered,
        });
    } catch (error) {
        console.error("Error in updateReportStatus controller:", error.message);
        return res.status(500).json({ message: "Failed to update report status" });
    }
};
