import { computeFortRisk, applyRiskScores } from "../services/risk.service.js";
import { emitToAll, emitToFort } from "../lib/socket.js";

/**
 * GET /api/risk/:fortSlug
 * Returns live-computed risk scores for all trails of the specified fort.
 * Read-only — does NOT persist scores to the database.
 * Requires authentication.
 */
export const getRisk = async (req, res) => {
    try {
        const { fortSlug } = req.params;

        if (!fortSlug || fortSlug.trim() === "") {
            return res.status(400).json({ message: "Fort slug is required" });
        }

        // Optional footfall override from query param
        const footfallOverride = req.query.footfall
            ? Number(req.query.footfall)
            : null;

        const result = await computeFortRisk(fortSlug, footfallOverride);

        if (!result) {
            return res.status(404).json({
                message: `Fort with slug '${fortSlug}' not found`,
            });
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in getRisk controller:", error.message);

        if (error.message.includes("Open-Meteo")) {
            return res.status(502).json({
                message: "Weather service temporarily unavailable — cannot compute risk",
                detail: error.message,
            });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * POST /api/risk/:fortSlug/apply
 * Computes live risk scores AND persists them to the database.
 * Also auto-sets trail statuses based on risk thresholds.
 * Authority / Admin only.
 */
export const applyRisk = async (req, res) => {
    try {
        const { fortSlug } = req.params;

        if (!fortSlug || fortSlug.trim() === "") {
            return res.status(400).json({ message: "Fort slug is required" });
        }

        // Optional footfall override from request body
        const footfallOverride = req.body.footfallOverride
            ? Number(req.body.footfallOverride)
            : null;

        const result = await applyRiskScores(fortSlug, footfallOverride);

        if (!result) {
            return res.status(404).json({
                message: `Fort with slug '${fortSlug}' not found`,
            });
        }

        // Phase 7: Emit real-time risk update to all connected clients
        const riskEventData = {
            fortSlug,
            fortName: result.fort.name,
            trails: result.trails.map((t) => ({
                trailId: t.trailId,
                name: t.name,
                liveRiskScore: t.liveRiskScore,
                suggestedStatus: t.suggestedStatus,
                appliedStatus: t.appliedStatus,
            })),
            updatedAt: Date.now(),
        };
        emitToFort(fortSlug, "risk-update", riskEventData);
        emitToAll("risk-update", riskEventData);

        return res.status(200).json({
            message: `Risk scores applied to ${result.trails.length} trail(s) for ${result.fort.name}`,
            ...result,
        });

    } catch (error) {
        console.error("Error in applyRisk controller:", error.message);

        if (error.message.includes("Open-Meteo")) {
            return res.status(502).json({
                message: "Weather service temporarily unavailable — cannot compute risk",
                detail: error.message,
            });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
};
