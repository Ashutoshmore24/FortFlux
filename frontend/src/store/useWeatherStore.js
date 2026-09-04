import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useWeatherStore = create((set, get) => ({
    weatherData: null,
    isLoading: false,
    error: null,
    lastFetched: null,
    selectedFortSlug: "rajgad",

    // Dynamic fort list — fetched from API instead of hardcoded
    availableForts: [],
    isLoadingForts: false,

    _refreshInterval: null,

    /**
     * Fetch all available forts from the API.
     * Called on dashboard mount to populate the fort selector dynamically.
     */
    fetchForts: async () => {
        set({ isLoadingForts: true });
        try {
            const res = await axiosInstance.get("/forts");
            const forts = (res.data?.forts || []).map((f) => ({
                slug: f.slug,
                name: f.name,
                elevation: f.elevation,
                region: f.region,
                district: f.district,
            }));
            set({ availableForts: forts });
            return { success: true, forts };
        } catch (error) {
            console.error("Failed to fetch forts:", error?.response?.data?.message || error.message);
            // Fallback to minimal list if API fails
            set({
                availableForts: [
                    { slug: "rajgad", name: "Rajgad Fort" },
                    { slug: "torna", name: "Torna Fort" },
                    { slug: "sinhagad", name: "Sinhagad Fort" },
                ],
            });
            return { success: false };
        } finally {
            set({ isLoadingForts: false });
        }
    },

    fetchWeather: async (fortSlug) => {
        const slug = fortSlug || get().selectedFortSlug;
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.get(`/weather/${slug}`);
            set({
                weatherData: res.data,
                lastFetched: Date.now(),
                selectedFortSlug: slug,
            });
            return { success: true, data: res.data };
        } catch (error) {
            const message =
                error.response?.data?.message || "Failed to fetch weather data";
            set({ error: message });
            return { success: false, message };
        } finally {
            set({ isLoading: false });
        }
    },

    setSelectedFort: async (fortSlug) => {
        set({ selectedFortSlug: fortSlug });
        await get().fetchWeather(fortSlug);
    },

    startAutoRefresh: (intervalMs = 5 * 60 * 1000) => {
        const existing = get()._refreshInterval;
        if (existing) clearInterval(existing);

        const interval = setInterval(() => {
            get().fetchWeather();
        }, intervalMs);

        set({ _refreshInterval: interval });
    },

    stopAutoRefresh: () => {
        const interval = get()._refreshInterval;
        if (interval) {
            clearInterval(interval);
            set({ _refreshInterval: null });
        }
    },

    getSecondsSinceLastFetch: () => {
        const lastFetched = get().lastFetched;
        if (!lastFetched) return null;
        return Math.floor((Date.now() - lastFetched) / 1000);
    },
}));
