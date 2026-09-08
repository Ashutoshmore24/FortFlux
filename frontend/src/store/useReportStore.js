import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useReportStore = create((set, get) => ({
    reports: [],
    recentReports: [],
    isLoadingReports: false,
    isUploading: false,
    isUpdatingStatus: false,
    error: null,

    /**
     * Fetch all photo evidence reports for a fort.
     */
    fetchFortReports: async (slug) => {
        if (!slug) return;
        set({ isLoadingReports: true, error: null });
        try {
            const res = await axiosInstance.get(`/reports/fort/${slug}`);
            set({ reports: res.data.reports || [] });
            return { success: true, reports: res.data.reports };
        } catch (error) {
            console.error("Error fetching fort reports:", error);
            const msg = error.response?.data?.message || "Failed to load reports";
            set({ error: msg });
            return { success: false, message: msg };
        } finally {
            set({ isLoadingReports: false });
        }
    },

    /**
     * Fetch recent photo evidence across all forts for community feed.
     */
    fetchRecentReports: async () => {
        try {
            const res = await axiosInstance.get("/reports/recent");
            set({ recentReports: res.data.reports || [] });
            return { success: true, reports: res.data.reports };
        } catch (error) {
            console.error("Error fetching recent reports:", error);
            return { success: false };
        }
    },

    /**
     * Upload a new crowdsourced photo evidence report.
     */
    uploadReport: async (formData) => {
        set({ isUploading: true, error: null });
        try {
            const res = await axiosInstance.post("/reports", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const newReport = res.data.report;

            // Prepend new report to state
            set((state) => ({
                reports: [newReport, ...state.reports],
                recentReports: [newReport, ...state.recentReports],
            }));

            return { success: true, report: newReport };
        } catch (error) {
            console.error("Error uploading report:", error);
            const msg = error.response?.data?.message || "Failed to upload photo evidence";
            set({ error: msg });
            return { success: false, message: msg };
        } finally {
            set({ isUploading: false });
        }
    },

    /**
     * Update report verification status (Authority action).
     * Optionally severs the associated trail if action === "sever_trail".
     */
    updateReportStatus: async (reportId, payload) => {
        set({ isUpdatingStatus: true });
        try {
            const res = await axiosInstance.patch(`/reports/${reportId}/status`, payload);
            const updated = res.data.report;

            // Update in local lists
            set((state) => ({
                reports: state.reports.map((r) => (r._id === reportId ? updated : r)),
                recentReports: state.recentReports.map((r) => (r._id === reportId ? updated : r)),
            }));

            return { success: true, data: res.data };
        } catch (error) {
            console.error("Error updating report status:", error);
            return { success: false, message: error.response?.data?.message || "Failed to update report" };
        } finally {
            set({ isUpdatingStatus: false });
        }
    },
}));
