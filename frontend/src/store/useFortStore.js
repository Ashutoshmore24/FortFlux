import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useFortStore = create((set, get) => ({
    forts: [],
    selectedFort: null,
    fortDetail: null, // { fort, trails, cisterns }
    isLoading: false,
    isLoadingDetail: false,
    error: null,

    /**
     * Fetch all forts (basic list).
     */
    fetchForts: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.get("/forts");
            set({ forts: res.data?.forts || [] });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || "Failed to fetch forts";
            set({ error: message });
            return { success: false, message };
        } finally {
            set({ isLoading: false });
        }
    },

    /**
     * Fetch full fort detail by slug (fort + trails + cisterns).
     */
    fetchFortDetail: async (slug) => {
        set({ isLoadingDetail: true });
        try {
            const res = await axiosInstance.get(`/forts/${slug}`);
            set({
                fortDetail: res.data,
                selectedFort: res.data?.fort || null,
            });
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || "Failed to fetch fort details";
            console.error("fetchFortDetail error:", message);
            return { success: false, message };
        } finally {
            set({ isLoadingDetail: false });
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
        set({ selectedFort: null, fortDetail: null });
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
}));
