import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { subscribeToEvent } from "../lib/socket";

export const useFortStore = create((set, get) => ({
    forts: [],
    selectedFort: null,
    fortDetail: null, // { fort, trails, cisterns }
    fortHistory: null,
    isLoading: false,
    isLoadingDetail: false,
    isLoadingHistory: false,
    error: null,
    _socketUnsubs: [],

    /**
     * Fetch all forts (basic list).
     * Includes retry logic to handle Render free-tier cold starts
     * where the backend may take 30–60s to wake up.
     */
    fetchForts: async () => {
        set({ isLoading: true, error: null });
        const MAX_RETRIES = 3;
        const RETRY_DELAYS = [3000, 6000, 12000]; // 3s, 6s, 12s backoff

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const res = await axiosInstance.get("/forts", {
                    timeout: attempt === 0 ? 15000 : 45000, // longer timeout on retries for cold start
                });
                set({ forts: res.data?.forts || [], isLoading: false });
                return { success: true };
            } catch (error) {
                const isLastAttempt = attempt === MAX_RETRIES - 1;
                if (isLastAttempt) {
                    const message = error.response?.data?.message || "Failed to fetch forts";
                    set({ error: message, isLoading: false });
                    return { success: false, message };
                }
                console.warn(
                    `[FortFlux] Fetch forts attempt ${attempt + 1}/${MAX_RETRIES} failed, retrying in ${RETRY_DELAYS[attempt] / 1000}s...`
                );
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt]));
            }
        }
        set({ isLoading: false });
    },

    /**
     * Fetch full fort detail by slug (fort + trails + cisterns).
     * Includes retry logic for Render cold-start resilience.
     */
    fetchFortDetail: async (slug) => {
        set({ isLoadingDetail: true });
        const MAX_RETRIES = 3;
        const RETRY_DELAYS = [2000, 5000, 10000];

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const res = await axiosInstance.get(`/forts/${slug}`, {
                    timeout: attempt === 0 ? 15000 : 45000,
                });
                set({
                    fortDetail: res.data,
                    selectedFort: res.data?.fort || null,
                    isLoadingDetail: false,
                });
                return { success: true, data: res.data };
            } catch (error) {
                const isLastAttempt = attempt === MAX_RETRIES - 1;
                if (isLastAttempt) {
                    const message = error.response?.data?.message || "Failed to fetch fort details";
                    console.error("fetchFortDetail error:", message);
                    set({ isLoadingDetail: false });
                    return { success: false, message };
                }
                console.warn(
                    `[FortFlux] Fetch fort detail attempt ${attempt + 1}/${MAX_RETRIES} failed, retrying in ${RETRY_DELAYS[attempt] / 1000}s...`
                );
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt]));
            }
        }
        set({ isLoadingDetail: false });
    },

    /**
     * Fetch history for a specific fort by slug.
     */
    fetchFortHistory: async (slug) => {
        set({ isLoadingHistory: true, error: null });
        try {
            const res = await axiosInstance.get(`/forts/${slug}/history`);
            set({ fortHistory: res.data });
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || "Failed to fetch fort history";
            console.error("fetchFortHistory error:", message);
            set({ error: message, fortHistory: null });
            return { success: false, message };
        } finally {
            set({ isLoadingHistory: false });
        }
    },

    /**
     * Select a fort on the map (sets selectedFort + fetches detail).
     */
    selectFort: async (fort) => {
        set({ selectedFort: fort });
        if (fort?.slug) {
            await get().fetchFortDetail(fort.slug);
        }
    },

    clearSelection: () => {
        set({ selectedFort: null, fortDetail: null, fortHistory: null });
    },

    /**
     * Update a trail's status/risk/footfall via the authority API.
     * After success, refreshes fort detail so the map reflects the change.
     */
    updateTrailStatus: async (trailId, data) => {
        try {
            const res = await axiosInstance.put(`/forts/trails/${trailId}`, data);
            // Refresh fort detail to reflect updated trail on the map
            const selectedFort = get().selectedFort;
            if (selectedFort?.slug) {
                await get().fetchFortDetail(selectedFort.slug);
            }
            return { success: true, trail: res.data?.trail };
        } catch (error) {
            const message = error.response?.data?.message || "Failed to update trail status";
            console.error("updateTrailStatus error:", message);
            return { success: false, message };
        }
    },

    /**
     * Phase 7: Subscribe to real-time socket events.
     * Updates trail data in-place when trail-status-changed events arrive.
     */
    subscribeToSocket: () => {
        // Clean up any existing subscriptions first
        get().unsubscribeFromSocket();

        const unsubs = [];

        // Listen for trail status changes from authority actions
        unsubs.push(
            subscribeToEvent("trail-status-changed", (data) => {
                const { fortDetail } = get();
                if (!fortDetail?.trails) return;

                // Update the trail in the current fortDetail if it matches
                const updatedTrails = fortDetail.trails.map((trail) => {
                    if (trail._id === data.trailId) {
                        return {
                            ...trail,
                            status: data.status,
                            currentRiskScore: data.currentRiskScore,
                            currentFootfall: data.currentFootfall,
                            updatedAt: data.updatedAt,
                        };
                    }
                    return trail;
                });

                set({
                    fortDetail: { ...fortDetail, trails: updatedTrails },
                });
            })
        );

        // Listen for risk-update events to refresh trail risk scores
        unsubs.push(
            subscribeToEvent("risk-update", (data) => {
                const { fortDetail, selectedFort } = get();
                if (!fortDetail?.trails || !selectedFort) return;

                // Only process if this update is for our currently selected fort
                if (data.fortSlug !== selectedFort.slug) return;

                const updatedTrails = fortDetail.trails.map((trail) => {
                    const riskUpdate = data.trails?.find(
                        (t) => t.trailId === trail._id
                    );
                    if (riskUpdate) {
                        return {
                            ...trail,
                            currentRiskScore: riskUpdate.liveRiskScore,
                            status: riskUpdate.appliedStatus || trail.status,
                        };
                    }
                    return trail;
                });

                set({
                    fortDetail: { ...fortDetail, trails: updatedTrails },
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

