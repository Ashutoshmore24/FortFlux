import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useRoutingStore = create((set, get) => ({
    routeResult: null, // Full route response from API
    isLoading: false,
    error: null,

    /**
     * Find the safest route between two waypoints for a given fort.
     * Calls GET /api/forts/:slug/route?start=...&destination=...
     *
     * @param {string} fortSlug - Fort slug identifier
     * @param {string} start - Start waypoint name
     * @param {string} destination - Destination waypoint name
     * @returns {Object} { success, data?, message? }
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
     * Clear the current route result.
     */
    clearRoute: () => {
        set({ routeResult: null, error: null });
    },
}));
