import Fort from "../models/Fort.js";
import Trail from "../models/Trail.js";
import { findRoute, simulateRouting } from "../services/routing.service.js";
import { emitToAll, emitToFort } from "../lib/socket.js";

/**
 * GET /api/forts/:slug/route?start=...&destination=...
 * Public endpoint: Phase 5 Adaptive Routing Engine.
 *
 * Computes a risk-aware shortest path between two named trail
 * waypoints for the given fort, using Dijkstra's algorithm over the
 * fort's current Trail data. Closed, diverted, and critical-risk
 * (currentRiskScore >= 75) trails are never selected.
 */
export const getRoute = async (req, res) => {
    try {
        const slug = req.params.slug || req.query.slug;
        const { start, destination } = req.query;

        if (!slug) {
            return res.status(400).json({ message: "Fort slug is required" });
        }

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

        const fort = await Fort.findOne({ slug: slug.toLowerCase() });
        if (!fort) {
            return res.status(404).json({ message: `Fort with slug '${slug}' not found` });
        }

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

        return res.status(200).json({
            fort: fort.name,
            start: result.startDisplayName,
            destination: result.destinationDisplayName,
            safe: true,
            totalDistanceKm: result.totalDistanceKm,
            totalRoutingCost: result.totalCost,
            segmentCount: result.trails.length,
            segments: result.trails,
        });
    } catch (error) {
        console.error("Error in getRoute controller:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * POST /api/routing/simulate
 * Simulates adaptive routing with stress-test parameters (rainfall, footfall)
 * or explicit trail-severing commands. Computes severed edges and diversion routes.
 */
export const simulateRoute = async (req, res) => {
    try {
        const {
            fortSlug,
            rainfall,
            footfall,
            severedTrailIds = [],
            riskOverrides = null,
            start,
            destination,
        } = req.body || {};

        const slug = req.params.slug || fortSlug;

        if (!slug) {
            return res.status(400).json({ message: "Fort slug is required for simulation" });
        }

        const fort = await Fort.findOne({ slug: slug.toLowerCase() });
        if (!fort) {
            return res.status(404).json({ message: `Fort with slug '${slug}' not found` });
        }

        const trails = await Trail.find({ fort: fort._id });
        if (trails.length === 0) {
            return res.status(200).json({
                success: false,
                fort: fort.name,
                message: `No trails found for fort '${fort.name}'`,
                severedTrails: [],
                diversionRoute: null,
            });
        }

        const simulationResult = simulateRouting({
            trails,
            rainfall: typeof rainfall === "number" ? rainfall : null,
            footfall: typeof footfall === "number" ? footfall : null,
            severedTrailIds: Array.isArray(severedTrailIds) ? severedTrailIds : [],
            riskOverrides,
            startName: start || null,
            destinationName: destination || null,
        });

        const responseData = {
            success: true,
            fort: fort.name,
            fortSlug: fort.slug,
            ...simulationResult,
        };

        // Phase 7: Emit real-time simulation update to all connected clients
        emitToFort(fort.slug, "simulation-update", responseData);
        emitToAll("simulation-update", responseData);

        return res.status(200).json(responseData);
    } catch (error) {
        console.error("Error in simulateRoute controller:", error);
        return res.status(500).json({
            message: "Internal server error during routing simulation",
            error: error.message,
        });
    }
};