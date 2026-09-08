import { create } from "zustand";

let activeTimerId = null;

export const useRateLimitStore = create((set, get) => ({
  isOpen: false,
  retryAfter: 60,
  initialDuration: 60,
  violationCount: 1,
  message: "",
  isUnlocked: false,

  openModal: ({
    retryAfter = 60,
    message = "",
    violationCount = 1,
    banDuration = 60,
  }) => {
    // Clear any existing active timer interval
    if (activeTimerId) {
      clearInterval(activeTimerId);
      activeTimerId = null;
    }

    const duration = Math.max(1, Math.ceil(retryAfter));
    const totalDuration = banDuration > 0 ? banDuration : duration;

    set({
      isOpen: true,
      retryAfter: duration,
      initialDuration: totalDuration,
      violationCount,
      message:
        message ||
        (violationCount === 1
          ? "Rate limit exceeded. Please try again after 1 minute."
          : "Rate limit exceeded. Repeated rapid requests detected. Please try again after 5 minutes."),
      isUnlocked: false,
    });

    // Start 1-second countdown ticker
    activeTimerId = setInterval(() => {
      const current = get().retryAfter;
      if (current <= 1) {
        clearInterval(activeTimerId);
        activeTimerId = null;
        set({ retryAfter: 0, isUnlocked: true });
      } else {
        set({ retryAfter: current - 1 });
      }
    }, 1000);
  },

  closeModal: () => {
    if (activeTimerId) {
      clearInterval(activeTimerId);
      activeTimerId = null;
    }
    set({ isOpen: false, isUnlocked: false });
  },
}));
