import axios from "axios";
import { useRateLimitStore } from "../store/useRateLimitStore";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
});

// Intercept 429 Rate Limit responses and trigger the live countdown modal
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      const data = error.response.data || {};
      const retryAfter =
        Number(data.retryAfter) ||
        parseInt(error.response.headers?.["retry-after"], 10) ||
        60;
      const message =
        data.message ||
        "Rate limit exceeded. Please try again after 1 minute.";
      const violationCount = data.violationCount || 1;
      const banDuration = data.banDuration || retryAfter;

      useRateLimitStore.getState().openModal({
        retryAfter,
        message,
        violationCount,
        banDuration,
      });
    }
    return Promise.reject(error);
  }
);


