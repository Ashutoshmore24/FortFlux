import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { subscribeToEvent } from "../lib/socket";

export const useRiskStore = create((set, get) => ({
    riskData: null, // Full risk response from API
    isLoading: false,
    isApplying: false,
    error: null,
    lastComputed: null,

    _pollInterval: null,
    _socketUnsubs: [],

    /**
     * Fetch live-computed risk scores for a fort (read-only, does not persist).
     */
    fetchRisk: async (fortSlug) => {
        if (!fortSlug) return { success: false, message: "No fort slug provided" };

        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.get(`/risk/${fortSlug}`);
            set({
                riskData: res.data,
                lastComputed: Date.now(),
            });
            return { success: true, data: res.data };
        } catch (error) {
            const message =
                error.response?.data?.message || "Failed to compute risk scores";
            set({ error: message });
            return { success: false, message };
        } finally {
            set({ isLoading: false });
        }
    },

    /**
     * Compute + persist risk scores to DB (authority action).
     * Optionally pass a footfall override for simulation.
     */
    applyRisk: async (fortSlug, footfallOverride = null) => {
        if (!fortSlug) return { success: false, message: "No fort slug provided" };

        set({ isApplying: true, error: null });
        try {
            const body = {};
            if (footfallOverride !== null) {
                body.footfallOverride = footfallOverride;
            }

            const res = await axiosInstance.post(`/risk/${fortSlug}/apply`, body);
            set({
                riskData: res.data,
                lastComputed: Date.now(),
            });
            return { success: true, data: res.data };
        } catch (error) {
            const message =
                error.response?.data?.message || "Failed to apply risk scores";
            set({ error: message });
            return { success: false, message };
        } finally {
            set({ isApplying: false });
        }
    },

    /**
     * Start polling risk scores at a regular interval.
     */
    startPolling: (fortSlug, intervalMs = 2 * 60 * 1000) => {
        const existing = get()._pollInterval;
        if (existing) clearInterval(existing);

        const interval = setInterval(() => {
            get().fetchRisk(fortSlug);
        }, intervalMs);

        set({ _pollInterval: interval });
    },

    /**
     * Stop polling risk scores.
     */
    stopPolling: () => {
        const interval = get()._pollInterval;
        if (interval) {
            clearInterval(interval);
            set({ _pollInterval: null });
        }
    },

    /**
     * Get a risk score for a specific trail by its ID from the current riskData.
     */
    getTrailRisk: (trailId) => {
        const trails = get().riskData?.trails;
        if (!trails) return null;
        return trails.find((t) => t.trailId === trailId) || null;
    },

    /**
     * Clear risk data.
     */
    clearRisk: () => {
        get().stopPolling();
        set({ riskData: null, error: null, lastComputed: null });
    },

    /**
     * Phase 7: Subscribe to real-time risk update events.
     */
    subscribeToSocket: () => {
        get().unsubscribeFromSocket();

        const unsubs = [];

        unsubs.push(
            subscribeToEvent("risk-update", (data) => {
                // Update risk data with the live scores from the socket event
                set({
                    riskData: {
                        ...get().riskData,
                        trails: data.trails || get().riskData?.trails,
                        fort: data.fortName
                            ? { name: data.fortName, slug: data.fortSlug }
                            : get().riskData?.fort,
                    },
                    lastComputed: data.updatedAt || Date.now(),
                });
            })
        );

        set({ _socketUnsubs: unsubs });
    },

    /**
     * Phase 7: Unsubscribe from all socket events.
     */
    unsubscribeFromSocket: () => {
        const unsubs = get()._socketUnsubs;
        unsubs.forEach((unsub) => unsub());
        set({ _socketUnsubs: [] });
    },
}));
