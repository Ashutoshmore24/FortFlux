// ── FortFlux Offline State Store (Zustand) ──
// Manages online/offline state, network blackout simulations,
// download progress, and IndexedDB cache hydration.

import { create } from "zustand";
import {
    downloadFortOfflinePack,
    getAllOfflinePacks,
    deleteOfflinePack,
    clearAllOfflineData,
    getOfflineStorageStats,
    getOfflinePack,
} from "../utils/offlineMapManager";

export const useOfflineStore = create((set, get) => ({
    // ── Network Connectivity ──
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSimulatingOffline: false,
    get isEffectivelyOffline() {
        return !get().isOnline || get().isSimulatingOffline;
    },

    // ── Downloaded Packs & Storage ──
    downloadedPacks: [], // Array of offline pack metadata
    storageStats: { count: 0, totalBytes: 0, totalFormatted: "0 KB" },
    activeOfflinePack: null, // Currently selected fort's cached pack
    isLoadingPacks: false,

    // ── Download Progress ──
    downloadProgress: {}, // { [slug]: { percent: number, message: string, isDownloading: boolean } }
    isDownloadingBatch: false,
    batchProgress: { current: 0, total: 0, currentFort: "" },

    // ── UI Modal State ──
    isModalOpen: false,

    /**
     * Initialize store: listen to window online/offline events & hydrate IndexedDB stats.
     */
    initOfflineStore: async () => {
        if (typeof window !== "undefined") {
            const handleOnline = () => set({ isOnline: true });
            const handleOffline = () => set({ isOnline: false });

            window.addEventListener("online", handleOnline);
            window.addEventListener("offline", handleOffline);
        }

        await get().refreshDownloadedPacks();
    },

    /**
     * Toggle network blackout simulation.
     */
    setSimulateOffline: (simulate) => {
        set({ isSimulatingOffline: simulate });
    },

    /**
     * Open / Close the Offline Download Manager Modal.
     */
    openModal: () => set({ isModalOpen: true }),
    closeModal: () => set({ isModalOpen: false }),

    /**
     * Refresh the list of downloaded packs from IndexedDB.
     */
    refreshDownloadedPacks: async () => {
        set({ isLoadingPacks: true });
        try {
            const packs = await getAllOfflinePacks();
            const stats = await getOfflineStorageStats();
            set({
                downloadedPacks: packs,
                storageStats: stats,
                isLoadingPacks: false,
            });
        } catch (err) {
            console.warn("[OfflineStore] Failed to load offline packs:", err);
            set({ isLoadingPacks: false });
        }
    },

    /**
     * Download offline pack for a single fort.
     */
    downloadFort: async (fortSlug) => {
        const slug = fortSlug.toLowerCase();
        set((state) => ({
            downloadProgress: {
                ...state.downloadProgress,
                [slug]: { percent: 5, message: "Starting download...", isDownloading: true },
            },
        }));

        try {
            const result = await downloadFortOfflinePack(slug, ({ percent, message }) => {
                set((state) => ({
                    downloadProgress: {
                        ...state.downloadProgress,
                        [slug]: { percent, message, isDownloading: true },
                    },
                }));
            });

            await get().refreshDownloadedPacks();

            // Set active offline pack if it matches
            set((state) => ({
                activeOfflinePack: result.pack,
                downloadProgress: {
                    ...state.downloadProgress,
                    [slug]: { percent: 100, message: "Download complete!", isDownloading: false },
                },
            }));

            // Clear progress indicator after 3 seconds
            setTimeout(() => {
                set((state) => {
                    const newProgress = { ...state.downloadProgress };
                    delete newProgress[slug];
                    return { downloadProgress: newProgress };
                });
            }, 3000);

            return result;
        } catch (err) {
            set((state) => ({
                downloadProgress: {
                    ...state.downloadProgress,
                    [slug]: { percent: 0, message: `Failed: ${err.message}`, isDownloading: false },
                },
            }));
            throw err;
        }
    },

    /**
     * Download all available forts sequentially into IndexedDB.
     */
    downloadAllForts: async (fortList = []) => {
        if (!fortList.length) return;
        set({
            isDownloadingBatch: true,
            batchProgress: { current: 0, total: fortList.length, currentFort: fortList[0].name || fortList[0].slug },
        });

        for (let i = 0; i < fortList.length; i++) {
            const fort = fortList[i];
            const slug = fort.slug || fort;
            set({
                batchProgress: {
                    current: i + 1,
                    total: fortList.length,
                    currentFort: fort.name || slug,
                },
            });

            try {
                await downloadFortOfflinePack(slug);
            } catch (err) {
                console.warn(`[OfflineStore] Skipped batch download for ${slug}:`, err.message);
            }
        }

        await get().refreshDownloadedPacks();
        set({ isDownloadingBatch: false });
    },

    /**
     * Delete an offline pack from IndexedDB.
     */
    removeFortPack: async (fortSlug) => {
        await deleteOfflinePack(fortSlug);
        await get().refreshDownloadedPacks();
        if (get().activeOfflinePack?.fortSlug === fortSlug.toLowerCase()) {
            set({ activeOfflinePack: null });
        }
    },

    /**
     * Clear all offline storage.
     */
    clearAll: async () => {
        await clearAllOfflineData();
        await get().refreshDownloadedPacks();
        set({ activeOfflinePack: null });
    },

    /**
     * Load an offline pack into memory for field navigation.
     */
    loadActivePack: async (fortSlug) => {
        const pack = await getOfflinePack(fortSlug);
        set({ activeOfflinePack: pack });
        return pack;
    },

    /**
     * Check if a fort is already downloaded.
     */
    isDownloaded: (fortSlug) => {
        if (!fortSlug) return false;
        return get().downloadedPacks.some(
            (p) => p.fortSlug.toLowerCase() === fortSlug.toLowerCase()
        );
    },
}));
