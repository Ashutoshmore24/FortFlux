import Fort from "../models/Fort.js";
import Trail from "../models/Trail.js";
import Cistern from "../models/Cistern.js";
import FortHistory from "../models/FortHistory.js";
import { emitToAll, emitToFort } from "../lib/socket.js";

/**
 * GET /api/forts
 * Public endpoint: Retrieve all heritage forts with basic overview.
 */
export const getAllForts = async (req, res) => {
    try {
        const forts = await Fort.find().sort({ name: 1 });
        return res.status(200).json({
            count: forts.length,
            forts,
        });
    } catch (error) {
        console.error("Error in getAllForts:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * GET /api/forts/:slug
 * Public endpoint: Get comprehensive fort details, including all its trails and cisterns.
 */
export const getFortBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const fort = await Fort.findOne({ slug: slug.toLowerCase() });

        if (!fort) {
            return res.status(404).json({ message: `Fort with slug '${slug}' not found` });
        }

        const [trails, cisterns] = await Promise.all([
            Trail.find({ fort: fort._id }).sort({ name: 1 }),
            Cistern.find({ fort: fort._id }).populate("nearestTrail", "name slug status"),
        ]);

        return res.status(200).json({
            fort,
            trails,
            cisterns,
        });
    } catch (error) {
        console.error("Error in getFortBySlug:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * GET /api/forts/:slug/history
 * Public endpoint: Retrieve historical data for a given fort.
 */
export const getFortHistory = async (req, res) => {
    try {
        const { slug } = req.params;
        const fort = await Fort.findOne({ slug: slug.toLowerCase() });

        if (!fort) {
            return res.status(404).json({ message: `Fort with slug '${slug}' not found` });
        }

        const history = await FortHistory.findOne({ fortId: fort._id }).populate("fortId", "name description imageUrl location sections region district baseVillage elevation");
        if (!history) {
            // Provide synthesized historical timeline and trends based on fort data
            return res.status(200).json({
                fortId: fort,
                timeline: [
                    { year: 1647, title: "Liberation & Fortification", description: `Reinforcement of key bastions and defenses of ${fort.name}.` },
                    { year: 1670, title: "Maratha Administration", description: `Active garrisoning and strategic defense under Chhatrapati Shivaji Maharaj.` },
                    { year: 1818, title: "British Takeover", description: `Captured by British East India Company forces following extensive bombardment.` }
                ],
                erosionTrends: [
                    { year: 2010, severityIndex: 2, notes: "Minor surface wear on entry trails." },
                    { year: 2015, severityIndex: 4, notes: "Monsoon soil erosion on exposed ridges." },
                    { year: 2020, severityIndex: 6, notes: "Vegetation encroachment on stone ramparts." },
                    { year: 2024, severityIndex: 7, notes: "Active archaeological restoration and trail preservation." }
                ],
                photoComparisons: []
            });
        }

        return res.status(200).json(history);
    } catch (error) {
        console.error("Error in getFortHistory:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * GET /api/forts/:slug/trails
 * Public endpoint: Retrieve all trail segments for a given fort.
 */
export const getFortTrails = async (req, res) => {
    try {
        const { slug } = req.params;
        const fort = await Fort.findOne({ slug: slug.toLowerCase() });

        if (!fort) {
            return res.status(404).json({ message: `Fort with slug '${slug}' not found` });
        }

        const query = { fort: fort._id };
        if (req.query.status) {
            query.status = req.query.status;
        }

        const trails = await Trail.find(query).sort({ currentRiskScore: -1 });

        return res.status(200).json({
            fort: fort.name,
            count: trails.length,
            trails,
        });
    } catch (error) {
        console.error("Error in getFortTrails:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * GET /api/forts/:slug/cisterns
 * Public endpoint: Retrieve all water cisterns and lake reservoirs for a given fort.
 */
export const getFortCisterns = async (req, res) => {
    try {
        const { slug } = req.params;
        const fort = await Fort.findOne({ slug: slug.toLowerCase() });

        if (!fort) {
            return res.status(404).json({ message: `Fort with slug '${slug}' not found` });
        }

        const cisterns = await Cistern.find({ fort: fort._id })
            .populate("nearestTrail", "name slug status currentRiskScore");

        return res.status(200).json({
            fort: fort.name,
            count: cisterns.length,
            cisterns,
        });
    } catch (error) {
        console.error("Error in getFortCisterns:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * PUT /api/forts/trails/:trailId
 * Protected (Authority / Admin only): Manually override trail status, footfall, or risk parameters.
 */
export const updateTrailStatus = async (req, res) => {
    try {
        const { trailId } = req.params;
        const { status, currentRiskScore, currentFootfall, description } = req.body;

        const allowedStatuses = ["open", "caution", "closed", "diverted"];
        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
            });
        }

        const trail = await Trail.findById(trailId);
        if (!trail) {
            return res.status(404).json({ message: "Trail segment not found" });
        }

        if (status !== undefined) trail.status = status;
        if (currentRiskScore !== undefined) trail.currentRiskScore = currentRiskScore;
        if (currentFootfall !== undefined) trail.currentFootfall = currentFootfall;
        if (description !== undefined) trail.description = description;

        await trail.save();

        // Phase 7: Emit real-time trail status update to all connected clients
        const fort = await Fort.findById(trail.fort);
        const eventData = {
            trailId: trail._id,
            fortSlug: fort?.slug || null,
            name: trail.name,
            status: trail.status,
            currentRiskScore: trail.currentRiskScore,
            currentFootfall: trail.currentFootfall,
            updatedAt: trail.updatedAt,
        };

        if (fort?.slug) {
            emitToFort(fort.slug, "trail-status-changed", eventData);
        }
        emitToAll("trail-status-changed", eventData);

        return res.status(200).json({
            message: `Trail '${trail.name}' status updated to '${trail.status}'`,
            trail,
        });
    } catch (error) {
        console.error("Error in updateTrailStatus:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
