import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  authError: null,

  clearError: () => set({ authError: null }),

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
    } catch (error) {
      console.log("Not logged in or session expired:", error?.response?.data?.message || error.message);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true, authError: null });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Signup failed. Please try again.";
      set({ authError: message });
      return { success: false, message };
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true, authError: null });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Invalid email or password";
      set({ authError: message });
      return { success: false, message };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      return { success: true };
    } catch (error) {
      console.error("Logout failed:", error);
      // Clear user locally anyway
      set({ authUser: null });
      return { success: false };
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true, authError: null });
    try {
      const res = await axiosInstance.put("/auth/profile", data);
      set({ authUser: res.data });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Profile update failed.";
      set({ authError: message });
      return { success: false, message };
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));

