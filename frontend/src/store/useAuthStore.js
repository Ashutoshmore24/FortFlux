import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";

const normalizeUser = (user) => {
  if (!user) return null;
  const avatar = user.avatarUrl || user.profilePic || "";
  return {
    ...user,
    avatarUrl: avatar,
    profilePic: avatar,
  };
};

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isGoogleLoggingIn: false,
  isUpdatingProfile: false,
  isUploadingAvatar: false,
  authError: null,

  clearError: () => set({ authError: null }),

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: normalizeUser(res.data) });
    } catch (error) {
      if (error?.response?.status === 429) {
        // Rate limited - do NOT clear user session, keep current state intact!
        console.warn("Session check throttled by rate limiter - preserving current session state");
        return;
      }
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
      set({ authUser: normalizeUser(res.data) });
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
      set({ authUser: normalizeUser(res.data) });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Invalid email or password";
      set({ authError: message });
      return { success: false, message };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  googleLogin: async () => {
    set({ isGoogleLoggingIn: true, authError: null });
    try {
      // Open Google sign-in popup via Firebase
      const result = await signInWithPopup(auth, googleProvider);
      // Get the Firebase ID token
      const idToken = await result.user.getIdToken();
      // Send token to our backend for verification and user creation/login
      const res = await axiosInstance.post("/auth/google", { idToken });
      set({ authUser: normalizeUser(res.data) });
      return { success: true };
    } catch (error) {
      let message = "Google sign-in failed. Please try again.";
      if (error.code === "auth/popup-closed-by-user") {
        message = "Sign-in popup was closed. Please try again.";
      } else if (error.code === "auth/cancelled-popup-request") {
        message = "Sign-in was cancelled. Please try again.";
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      set({ authError: message });
      return { success: false, message };
    } finally {
      set({ isGoogleLoggingIn: false });
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
      set({ authUser: normalizeUser(res.data) });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Profile update failed.";
      set({ authError: message });
      return { success: false, message };
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  uploadAvatar: async (userId, file) => {
    set({ isUploadingAvatar: true, authError: null });
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axiosInstance.post(`/users/${userId}/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set({ authUser: normalizeUser(res.data) });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to upload avatar.";
      set({ authError: message });
      return { success: false, message };
    } finally {
      set({ isUploadingAvatar: false });
    }
  },
}));

