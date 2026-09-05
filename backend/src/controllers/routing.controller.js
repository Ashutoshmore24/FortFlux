import Fort from "../models/Fort.js";
import Trail from "../models/Trail.js";
import { findRoute } from "../services/routing.service.js";

/**
 * GET /api/forts/:slug/route?start=...&destination=...
 * Public endpoint: Phase 5 Adaptive Routing Engine.
 *
 * Computes a risk-aware shortest path between two named trail
 * waypoints for the given fort, using Dijkstra's algorithm over the
 * fort's current Trail data. Closed, diverted, and critical-risk
 * (currentRiskScore >= 75) trails are never selected.
 *
 * Works dynamically for any fort — nothing here is hardcoded to a
 * specific fort or route.
 */
export const getRoute = async (req, res) => {
    try {
        const { slug } = req.params;
        const { start, destination } = req.query;

        // ── Validate query params ────────────────────────────────
        if (!start || !start.trim() || !destination || !destination.trim()) {
            return res.status(400).json({
                message: "Both 'start' and 'destination' query parameters are required",
            });
        }

        if (start.trim().toLowerCase() === destination.trim().toLowerCase()) {
            return res.status(400).json({
                message: "'start' and 'destination' must be different waypoints",
            });
        }

        // ── Look up fort (same pattern as getFortTrails) ─────────
        const fort = await Fort.findOne({ slug: slug.toLowerCase() });
        if (!fort) {
            return res.status(404).json({ message: `Fort with slug '${slug}' not found` });
        }

        // ── Load all trails for this fort (safe + unsafe; the ────
        //    routing service does its own safety filtering so the
        //    exclusion rules live in exactly one place) ───────────
        const trails = await Trail.find({ fort: fort._id });

        if (trails.length === 0) {
            return res.status(200).json({
                fort: fort.name,
                start,
                destination,
                safe: false,
                message: `No trail data exists yet for '${fort.name}'`,
            });
        }

        // ── Run the routing engine ───────────────────────────────
        const result = findRoute(trails, start, destination);

        if (result.status === "invalid_node") {
            return res.status(400).json({
                message: `'${result.node === "start" ? start : destination}' is not a valid, currently reachable waypoint for '${fort.name}'`,
            });
        }

        if (result.status === "no_route") {
            return res.status(200).json({
                fort: fort.name,
                start,
                destination,
                safe: false,
                message: "No safe route currently available between these points",
            });
        }

        // ── Shape a map-friendly response ────────────────────────
        const segments = result.trails.map((trail) => ({
            trailId: trail._id,
            name: trail.name,
            slug: trail.slug,
            startPoint: trail.startPoint,
            endPoint: trail.endPoint,
            path: trail.path,
            distanceKm: trail.distanceKm,
            currentRiskScore: trail.currentRiskScore,
            status: trail.status,
            baselineDifficulty: trail.baselineDifficulty,
        }));

        return res.status(200).json({
            fort: fort.name,
            start: result.startDisplayName,
            destination: result.destinationDisplayName,
            safe: true,
            totalDistanceKm: Number(result.totalDistanceKm.toFixed(3)),
            totalRoutingCost: Number(result.totalCost.toFixed(3)),
            segmentCount: segments.length,
            segments,
        });
    } catch (error) {
        console.error("Error in getRoute controller:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};