import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useRoutingStore = create((set, get) => ({
    routeResult: null, // Full route response from API
    isLoading: false,
    error: null,

    // ── Phase 5 Adaptive Routing & Simulation State ──
    simulationResult: null,
    severedTrails: [],
    diversionRoute: null,
    isSimulating: false,
    simulationError: null,
    manuallySeveredIds: [],

    /**
     * Find the safest route between two waypoints for a given fort.
     * Calls GET /api/forts/:slug/route?start=...&destination=...
     */
    findRoute: async (fortSlug, start, destination) => {
        if (!fortSlug || !start || !destination) {
            return { success: false, message: "Fort, start, and destination are required" };
        }

        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.get(`/forts/${fortSlug}/route`, {
                params: { start, destination },
            });
            set({ routeResult: res.data });
            return { success: true, data: res.data };
        } catch (error) {
            const message =
                error.response?.data?.message || "Failed to compute route";
            set({ error: message, routeResult: null });
            return { success: false, message };
        } finally {
            set({ isLoading: false });
        }
    },

    /**
     * Simulate adaptive routing with carrying-capacity parameters or severed paths.
     * Calls POST /api/routing/simulate
     */
    simulateRouting: async (fortSlug, options = {}) => {
        if (!fortSlug) {
            return { success: false, message: "Fort slug is required for simulation" };
        }

        const {
            rainfall = null,
            footfall = null,
            severedTrailIds = null,
            riskOverrides = null,
            start = null,
            destination = null,
        } = options;

        const effectiveSeveredIds = severedTrailIds !== null
            ? severedTrailIds
            : get().manuallySeveredIds;

        set({ isSimulating: true, simulationError: null });
        try {
            const res = await axiosInstance.post(`/routing/simulate`, {
                fortSlug,
                rainfall,
                footfall,
                severedTrailIds: effectiveSeveredIds,
                riskOverrides,
                start,
                destination,
            });

            const data = res.data;
            set({
                simulationResult: data,
                severedTrails: data.severedTrails || [],
                diversionRoute: data.diversionRoute || null,
            });

            return { success: true, data };
        } catch (error) {
            const message =
                error.response?.data?.message || "Routing simulation failed";
            set({
                simulationError: message,
                simulationResult: null,
                severedTrails: [],
                diversionRoute: null,
            });
            return { success: false, message };
        } finally {
            set({ isSimulating: false });
        }
    },

    /**
     * Toggle manual trail severing (simulate authority closure)
     */
    toggleSeverTrail: async (fortSlug, trailId, currentOptions = {}) => {
        const currentSevered = get().manuallySeveredIds;
        const exists = currentSevered.includes(trailId);
        const updatedSevered = exists
            ? currentSevered.filter((id) => id !== trailId)
            : [...currentSevered, trailId];

        set({ manuallySeveredIds: updatedSevered });

        return get().simulateRouting(fortSlug, {
            ...currentOptions,
            severedTrailIds: updatedSevered,
        });
    },

    /**
     * Clear all simulation state (reset map to normal trails)
     */
    clearSimulation: () => {
        set({
            simulationResult: null,
            severedTrails: [],
            diversionRoute: null,
            manuallySeveredIds: [],
            simulationError: null,
        });
    },

    /**
     * Clear the current route result.
     */
    clearRoute: () => {
        set({ routeResult: null, error: null });
    },
}));
