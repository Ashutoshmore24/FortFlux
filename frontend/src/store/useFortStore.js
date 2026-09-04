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
}));
