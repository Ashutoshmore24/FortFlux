import TrailReport from "../models/TrailReport.js";
import Fort from "../models/Fort.js";
import Trail from "../models/Trail.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import ENV from "../lib/env.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

/**
 * Verified community photos catalog matching user-uploaded fort photos
 */
export const FORT_COMMUNITY_PHOTOS = {
    "rajgad": [
        {
            file: "rajgad_1.jpg",
            hazardType: "waterlogging",
            severity: "moderate",
            description: "Chor Darwaja to Padmavati Machi carved rock steps are slippery with moss after overnight rainfall. Trekkers advised to take steady foot placement.",
            offset: [0.001, -0.001]
        },
        {
            file: "rajgad_2.jpg",
            hazardType: "rockfall",
            severity: "high",
            description: "Loose scree displacement along the narrow spine leading towards Suvela Machi Nedhe. Strong crosswinds present.",
            offset: [-0.001, 0.001]
        }
    ],
    "sinhagad": [
        {
            file: "sinhagad_1.jpg",
            hazardType: "other",
            severity: "low",
            description: "Kalyan Darwaja stone path clear and dry. Excellent morning visibility across the valley towards Khadakwasla.",
            offset: [0.0005, 0.0005]
        },
        {
            file: "sinhagad_2.jpg",
            hazardType: "rockfall",
            severity: "high",
            description: "Loose basalt boulders resting precariously on slope above Tanaji Kada track. Stay clear of the outer cliff edge.",
            offset: [-0.0008, 0.0007]
        },
        {
            file: "sinhagad_3.jpg",
            hazardType: "waterlogging",
            severity: "moderate",
            description: "Heavy mist and morning dew condensation on steep rock steps near Pune Darwaja. Basalt friction reduced.",
            offset: [0.001, -0.0006]
        },
        {
            file: "sinhagad_4.jpg",
            hazardType: "railing",
            severity: "moderate",
            description: "Wind gusts exceeding 35 km/h along the western ridge bastion. Stay behind marked perimeter markers.",
            offset: [-0.0005, -0.0008]
        }
    ],
    "torna": [
        {
            file: "torna_1.jpg",
            hazardType: "railing",
            severity: "high",
            description: "Zunjar Machi exposed ridgeline has strong crosswinds. Rock steps wet from low-hanging clouds.",
            offset: [0.0007, -0.0004]
        },
        {
            file: "torna_2.jpg",
            hazardType: "other",
            severity: "low",
            description: "Bini Darwaja entrance trail in great condition. Clear path through outer fortifications.",
            offset: [-0.0005, 0.0005]
        },
        {
            file: "torna_3.jpg",
            hazardType: "rockfall",
            severity: "moderate",
            description: "Minor rockfall debris on Menghai goddess temple trail. Trekkers can easily navigate around.",
            offset: [0.0004, 0.0008]
        }
    ],
    "raigad": [
        {
            file: "raigad_1.JPG",
            hazardType: "waterlogging",
            severity: "moderate",
            description: "Maha Darwaja ascent steps wet from continuous cloud cover. Heavy trekker foot traffic creating slick patches.",
            offset: [0.0006, -0.0005]
        },
        {
            file: "raigad_2.jpg",
            hazardType: "other",
            severity: "low",
            description: "Hirkani Buruj bastion edge clear. Outer masonry inspected and secure.",
            offset: [-0.0007, 0.0003]
        },
        {
            file: "raigad_3.jpg",
            hazardType: "railing",
            severity: "high",
            description: "Takmak Tok cliff viewpoint damp and slippery. Trekkers cautioned not to approach unbarricaded rock edges.",
            offset: [0.0008, 0.0006]
        }
    ],
    "harishchandragad": [
        {
            file: "harishchandragad_1.jpg",
            hazardType: "railing",
            severity: "critical",
            description: "Kokankada vertical drop covered in dense fog with intense updrafts. High alert: stay behind safety boundary.",
            offset: [0.001, -0.001]
        },
        {
            file: "harishchandragad_2.jpg",
            hazardType: "rockfall",
            severity: "high",
            description: "Taramati peak trail loose shale and scree. Ankle support and slow pace strongly recommended.",
            offset: [-0.0012, 0.0008]
        },
        {
            file: "harishchandragad_3.jpg",
            hazardType: "waterlogging",
            severity: "moderate",
            description: "Kedareshwar cave pool water level at normal height. Surrounding rock steps damp.",
            offset: [0.0005, 0.0007]
        },
        {
            file: "harishchandragad_4.jpg",
            hazardType: "waterlogging",
            severity: "moderate",
            description: "Khireshwar route through Tolar Khind has active seasonal stream runoffs across lower trail.",
            offset: [-0.0009, -0.0006]
        }
    ],
    "purandar": [
        {
            file: "purandar_1.jpg",
            hazardType: "other",
            severity: "low",
            description: "Bini Darwaja approach path clear with dry basalt rock. Gentle gradient with steady footing.",
            offset: [0.0005, -0.0005]
        },
        {
            file: "purandar_2.JPG",
            hazardType: "rockfall",
            severity: "moderate",
            description: "Vajragad saddle trail has loose pebbles on slope. Caution advised when descending the gravel section.",
            offset: [-0.0007, 0.0006]
        }
    ],
    "lohagad": [
        {
            file: "lohagad_1.jpg",
            hazardType: "waterlogging",
            severity: "moderate",
            description: "Ganesh Darwaja steps wet from morning condensation. Iron handrails intact and safe.",
            offset: [0.0006, 0.0005]
        },
        {
            file: "lohagad_2.jpg",
            hazardType: "railing",
            severity: "moderate",
            description: "Vinchu Kata scorpion tail narrow ridge windy. Rock spine dry with good grip.",
            offset: [-0.0008, -0.0006]
        },
        {
            file: "lohagad_3.jpg",
            hazardType: "waterlogging",
            severity: "low",
            description: "Laxmi Kothi cistern overflow channels clear. Clean rainwater collected in ancient tanks.",
            offset: [0.0004, -0.0007]
        },
        {
            file: "lohagad_4.jpg",
            hazardType: "overcrowding",
            severity: "low",
            description: "Trekker bottleneck at secondary gateway during peak afternoon hours. Move steadily in single file.",
            offset: [-0.0005, 0.0008]
        }
    ],
    "visapur": [
        {
            file: "visapur_1.jpg",
            hazardType: "waterlogging",
            severity: "high",
            description: "Waterfall trail ascent has active water rushing over stone steps. Very slippery, trekking shoes required.",
            offset: [0.0007, -0.0006]
        },
        {
            file: "visapur_2.jpg",
            hazardType: "other",
            severity: "low",
            description: "Plateau ruins and cannon bastions dry and accessible.",
            offset: [-0.0006, 0.0005]
        },
        {
            file: "visapur_3.jpg",
            hazardType: "fissure",
            severity: "moderate",
            description: "Loose stone masonry observed near ancient water tanks on east face. Maintain distance from edge.",
            offset: [0.0005, 0.0008]
        },
        {
            file: "visapur_4.JPG",
            hazardType: "rockfall",
            severity: "moderate",
            description: "Descent route towards Bhaje caves has gravel and loose rocks. Take slow steps.",
            offset: [-0.0008, -0.0007]
        }
    ],
    "korigad": [
        {
            file: "korigad_1.jpg",
            hazardType: "other",
            severity: "low",
            description: "Wide stone steps from Peth Shahapur in pristine condition with safety railings.",
            offset: [0.0005, 0.0005]
        },
        {
            file: "korigad_2.jpg",
            hazardType: "waterlogging",
            severity: "low",
            description: "Korai Devi lake brimful with clean monsoon rainwater. Path around perimeter dry.",
            offset: [-0.0006, -0.0005]
        },
        {
            file: "korigad_3.jpg",
            hazardType: "railing",
            severity: "moderate",
            description: "Outer perimeter wall traverse exposed to Amby Valley crosswinds.",
            offset: [0.0007, -0.0006]
        },
        {
            file: "korigad_4.jpg",
            hazardType: "other",
            severity: "low",
            description: "Panoramic view towards Tung and Tikona clear with gentle breeze.",
            offset: [-0.0005, 0.0007]
        }
    ],
    "tikona": [
        {
            file: "tikona_1.jpg",
            hazardType: "rockfall",
            severity: "moderate",
            description: "Steep staircase near Trimbakeshwar Mahadev temple has worn rock steps. Hold support ropes.",
            offset: [0.0006, -0.0005]
        },
        {
            file: "tikona_2.jpg",
            hazardType: "railing",
            severity: "high",
            description: "Pyramidal ridge summit ascent exposed. Windy conditions, keep three points of contact.",
            offset: [-0.0006, 0.0006]
        },
        {
            file: "tikona_3.jpg",
            hazardType: "other",
            severity: "low",
            description: "Pawna lake vista viewpoint clear. Excellent trail markings throughout.",
            offset: [0.0005, 0.0007]
        }
    ],
    "rajmachi": [
        {
            file: "rajmachi_1.jpg",
            hazardType: "waterlogging",
            severity: "moderate",
            description: "Udhewadi jungle route has muddy patches after overnight rain. 4x4 track wet but walkable.",
            offset: [0.0008, -0.0007]
        },
        {
            file: "rajmachi_2.jpg",
            hazardType: "rockfall",
            severity: "high",
            description: "Shrivardhan fort peak ascent rock steps steep and weathered. Hand support recommended.",
            offset: [-0.0007, 0.0008]
        },
        {
            file: "rajmachi_3.jpeg",
            hazardType: "other",
            severity: "low",
            description: "Manaranjan machi path clear. Forest canopy providing shaded trekking conditions.",
            offset: [0.0006, 0.0005]
        },
        {
            file: "rajmachi_4.JPG",
            hazardType: "waterlogging",
            severity: "moderate",
            description: "Kataldhar waterfall overlook trail damp with light mist. Basalt traction fair.",
            offset: [-0.0006, -0.0006]
        }
    ],
    "pratapgad": [
        {
            file: "pratapgad_1.jpg",
            hazardType: "other",
            severity: "low",
            description: "Lower fort ramparts and Afzal Khan tomb access trail in excellent maintained condition.",
            offset: [0.0005, 0.0005]
        },
        {
            file: "pratapgad_2.jpg",
            hazardType: "waterlogging",
            severity: "moderate",
            description: "Bhavani temple courtyard stone slabs wet from morning Mahabaleshwar fog.",
            offset: [-0.0006, -0.0005]
        },
        {
            file: "pratapgad_3.jpg",
            hazardType: "railing",
            severity: "high",
            description: "Redka bastion steep lookout cliff windy with reduced visibility towards Jawali valley.",
            offset: [0.0007, -0.0006]
        },
        {
            file: "pratapgad_4.jpg",
            hazardType: "other",
            severity: "low",
            description: "Upper fort Shivaji statue precinct clean, well-guarded and tourist friendly.",
            offset: [-0.0005, 0.0007]
        }
    ],
    "panhala": [
        {
            file: "panhala_1.JPG",
            hazardType: "other",
            severity: "low",
            description: "Teen Darwaza triple gateway entry road asphalt and basalt pave clear.",
            offset: [0.0006, -0.0005]
        },
        {
            file: "panhala_2.jpg",
            hazardType: "railing",
            severity: "moderate",
            description: "Sajja Kothi balcony bastion railing stable. Light breeze across Kolhapur plateau.",
            offset: [-0.0007, 0.0006]
        }
    ],
    "shivneri": [
        {
            file: "shivneri_1.jpg",
            hazardType: "other",
            severity: "low",
            description: "Seven defensive gateways chain in immaculate condition. Archaeological stone steps dry.",
            offset: [0.0005, 0.0005]
        },
        {
            file: "shivneri_2.jpg",
            hazardType: "waterlogging",
            severity: "low",
            description: "Badami Talav and Ganga Jamuna cistern spring water crystal clear.",
            offset: [-0.0006, -0.0005]
        },
        {
            file: "shivneri_3.jpg",
            hazardType: "railing",
            severity: "moderate",
            description: "Kadelot point sheer precipice has secure fencing. Trekkers reminded not to cross chain barriers.",
            offset: [0.0007, 0.0006]
        }
    ],
    "ajinkyatara": [
        {
            file: "ajinkyatara_1.jpg",
            hazardType: "other",
            severity: "low",
            description: "Satara city view from western bastion crystal clear. Motorable road and walking trail dry.",
            offset: [0.0005, -0.0005]
        },
        {
            file: "ajinkyatara_3.jpg",
            hazardType: "fissure",
            severity: "moderate",
            description: "Minor weathering on ancient water cistern edge. Tread with care on perimeter stone rim.",
            offset: [-0.0006, 0.0006]
        }
    ],
    "sindhudurg": [
        {
            file: "sindhudurg_1.jpg",
            hazardType: "other",
            severity: "low",
            description: "Kurte island boat landing pier clear at low tide. Sea state calm.",
            offset: [0.0005, 0.0005]
        },
        {
            file: "sindhudurg_2.jpg",
            hazardType: "waterlogging",
            severity: "moderate",
            description: "High tide sea spray washing over western ocean ramparts. Basalt stones wet.",
            offset: [-0.0006, -0.0005]
        },
        {
            file: "sindhudurg_3.JPG",
            hazardType: "railing",
            severity: "high",
            description: "Crashing waves near Raniche Haat bastion. Trekkers advised to stay in inner court during swell.",
            offset: [0.0007, 0.0006]
        }
    ],
    "vijaydurg": [
        {
            file: "vijaydurg_1.jpg",
            hazardType: "other",
            severity: "low",
            description: "Triple concentric battlements entrance clear. Dry coastal breeze.",
            offset: [0.0005, -0.0005]
        },
        {
            file: "vijaydurg_2.jpg",
            hazardType: "fissure",
            severity: "moderate",
            description: "Submerged defense wall visible at low water. Masonry weathered by saltwater tides.",
            offset: [-0.0006, 0.0005]
        },
        {
            file: "vijaydurg_3.jpg",
            hazardType: "waterlogging",
            severity: "low",
            description: "Underground escape tunnel entrance damp. Keep flashlights handy.",
            offset: [0.0006, 0.0007]
        },
        {
            file: "vijaydurg_4.jpg",
            hazardType: "railing",
            severity: "moderate",
            description: "Outer naval shipyard bastion parapet windy. Solid footing on lateral battlements.",
            offset: [-0.0005, -0.0006]
        }
    ],
    "murud-janjira": [
        {
            file: "murud-janjira_1.jpg",
            hazardType: "other",
            severity: "low",
            description: "Sailboat jetty boarding point clear. Calm Arabian sea swell.",
            offset: [0.0005, 0.0005]
        },
        {
            file: "murud-janjira_2.jpg",
            hazardType: "waterlogging",
            severity: "moderate",
            description: "Sea gateway entrance steps slippery with marine algae during mid-tide.",
            offset: [-0.0006, -0.0005]
        },
        {
            file: "murud-janjira_3.JPG",
            hazardType: "other",
            severity: "low",
            description: "Kalal Bangadi massive cannon courtyard dry and accessible.",
            offset: [0.0007, 0.0006]
        },
        {
            file: "murud-janjira_4.JPG",
            hazardType: "fissure",
            severity: "moderate",
            description: "Ocean bastion rounded ramparts show saltwater patina. Railing intact.",
            offset: [-0.0005, 0.0007]
        }
    ]
};

const MAP_FILE_PATH = path.resolve(__dirname, "../data/cloudinaryEvidenceMap.json");

/**
 * Seed authentic crowdsourced community reports using real fort photos uploaded to Cloudinary
 */
export const seedCommunityEvidence = async ({ force = false } = {}) => {
    try {
        // 1. Check existing Cloudinary-hosted reports
        const cloudinaryReportsCount = await TrailReport.countDocuments({
            imageUrl: { $regex: "res.cloudinary.com" }
        });

        if (cloudinaryReportsCount >= 50 && !force) {
            console.log(`ℹ️ Community trail evidence already hosted on Cloudinary (${cloudinaryReportsCount} reports). Skipping re-upload.`);
            return { success: true, count: cloudinaryReportsCount, skipped: true };
        }

        console.log("🌱 Starting Cloudinary sync & seeding for authentic community trail evidence...");

        // Load existing mapping if available
        let cloudinaryMap = {};
        if (fs.existsSync(MAP_FILE_PATH)) {
            try {
                cloudinaryMap = JSON.parse(fs.readFileSync(MAP_FILE_PATH, "utf-8"));
            } catch (e) {
                cloudinaryMap = {};
            }
        }

        // Gather all photos that need uploading
        const toUpload = [];
        for (const [slug, photos] of Object.entries(FORT_COMMUNITY_PHOTOS)) {
            for (const photo of photos) {
                if (!cloudinaryMap[slug]?.[photo.file]?.url) {
                    const candidatePaths = [
                        path.resolve(__dirname, `../../../frontend/public/community_evidence/${slug}/${photo.file}`),
                        path.resolve(__dirname, `../../../frontend/public/live community photos/${slug}/${photo.file}`)
                    ];
                    const foundPath = candidatePaths.find(p => fs.existsSync(p));
                    if (foundPath) {
                        toUpload.push({ slug, file: photo.file, filePath: foundPath });
                    }
                }
            }
        }

        if (toUpload.length > 0) {
            console.log(`☁️ Found ${toUpload.length} photos to upload to Cloudinary...`);
            const BATCH_SIZE = 4;
            for (let i = 0; i < toUpload.length; i += BATCH_SIZE) {
                const batch = toUpload.slice(i, i + BATCH_SIZE);
                await Promise.all(batch.map(async (item) => {
                    try {
                        const uploadRes = await cloudinary.uploader.upload(item.filePath, {
                            folder: `fortflux/community_evidence/${item.slug}`,
                            transformation: [{ width: 1200, height: 900, crop: "limit", quality: "auto" }]
                        });
                        if (!cloudinaryMap[item.slug]) cloudinaryMap[item.slug] = {};
                        cloudinaryMap[item.slug][item.file] = {
                            url: uploadRes.secure_url,
                            public_id: uploadRes.public_id
                        };
                        console.log(`☁️ Uploaded: [${item.slug}] ${item.file} -> Cloudinary`);
                    } catch (uploadErr) {
                        console.error(`❌ Failed to upload ${item.file} to Cloudinary:`, uploadErr.message);
                    }
                }));

                // Persist progress to JSON map file after each batch
                try {
                    fs.writeFileSync(MAP_FILE_PATH, JSON.stringify(cloudinaryMap, null, 2), "utf-8");
                } catch (writeErr) {
                    console.error("Failed to write map file:", writeErr.message);
                }
            }
            console.log("☁️ Finished Cloudinary uploads!");
        } else {
            console.log("☁️ All photos already uploaded to Cloudinary according to evidence map.");
        }

        // 2. Delete old reports when force-seeding or updating to Cloudinary URLs
        const delRes = await TrailReport.deleteMany({});
        console.log(`🗑️ Cleared ${delRes.deletedCount} old trail reports.`);

        // 3. Ensure diverse authentic trekker personas exist
        const sampleTrekkers = [
            { username: "Ashutosh More", email: "ashutosh.more@sahyadri.org", role: "trekker", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80" },
            { username: "Siddharth Shinde", email: "siddharth.shinde@sahyadri.org", role: "trekker", avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80" },
            { username: "Pooja Patil", email: "pooja.patil@sahyadri.org", role: "trekker", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80" },
            { username: "Tanvi Deshmukh", email: "tanvi.deshmukh@sahyadri.org", role: "trekker", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80" },
            { username: "Rohan Gaikwad", email: "rohan.gaikwad@sahyadri.org", role: "trekker", avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80" },
            { username: "Neha Joshi", email: "neha.joshi@sahyadri.org", role: "trekker", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80" },
            { username: "Aditya Kulkarni", email: "aditya.kulkarni@sahyadri.org", role: "trekker", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80" },
            { username: "Vikram Sawant", email: "vikram.sawant@sahyadri.org", role: "trekker", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80" },
        ];

        const userDocs = [];
        for (const trekker of sampleTrekkers) {
            let u = await User.findOne({ email: trekker.email });
            if (!u) {
                u = await User.create({
                    username: trekker.username,
                    email: trekker.email,
                    password: "Password@123",
                    role: trekker.role,
                    avatarUrl: trekker.avatarUrl,
                    profilePic: trekker.avatarUrl,
                    isVerified: true,
                });
            }
            userDocs.push(u);
        }

        const allUsers = await User.find({});
        const poolUsers = allUsers.length > 0 ? allUsers : userDocs;

        const allForts = await Fort.find({});
        if (allForts.length === 0) {
            console.warn("⚠️ No forts found to seed community reports for.");
            return { success: false, message: "No forts in database" };
        }

        const reportsToInsert = [];
        let userIndex = 0;

        for (const fort of allForts) {
            const fortPhotos = FORT_COMMUNITY_PHOTOS[fort.slug] || [];
            const fortCoords = fort.location?.coordinates || [73.68, 18.25];

            for (let i = 0; i < fortPhotos.length; i++) {
                const photo = fortPhotos[i];
                const assignedUser = poolUsers[userIndex % poolUsers.length];
                userIndex++;

                const [baseLng, baseLat] = fortCoords;
                const [offLng, offLat] = photo.offset || [0, 0];
                const aiTriageResult = generateAiTriage(photo.hazardType, photo.severity);

                // Check Cloudinary mapping, fallback to local path if upload was skipped
                const cloudEntry = cloudinaryMap[fort.slug]?.[photo.file];
                const imageUrl = cloudEntry?.url || `/community_evidence/${fort.slug}/${photo.file}`;
                const cloudinaryId = cloudEntry?.public_id || "";

                // Stagger dates realistically across the last 3 days
                const daysAgo = (i % 3);
                const reportDate = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000) - (i * 3600 * 1000));

                reportsToInsert.push({
                    fort: fort._id,
                    user: assignedUser._id,
                    imageUrl,
                    cloudinaryId,
                    hazardType: photo.hazardType,
                    severity: photo.severity,
                    description: photo.description,
                    location: {
                        type: "Point",
                        coordinates: [baseLng + offLng, baseLat + offLat],
                    },
                    status: "verified",
                    aiTriage: {
                        confidenceScore: aiTriageResult.confidence,
                        hazardAssessment: aiTriageResult.assessment,
                        recommendedAction: aiTriageResult.action,
                    },
                    createdAt: reportDate,
                    updatedAt: reportDate,
                });
            }
        }

        const inserted = await TrailReport.insertMany(reportsToInsert);
        console.log(`✅ Successfully seeded ${inserted.length} real community trail evidence reports with Cloudinary URLs across ${allForts.length} forts!`);

        return {
            success: true,
            count: inserted.length,
            fortsCount: allForts.length,
            cloudinaryUploaded: toUpload.length,
        };
    } catch (error) {
        console.error("❌ Error seeding community evidence:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Controller endpoint to trigger seeding
 * POST/GET /api/reports/seed-community
 */
export const handleSeedCommunityEvidence = async (req, res) => {
    try {
        const force = req.query.force === "true" || req.body?.force === true;
        const result = await seedCommunityEvidence({ force });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};
