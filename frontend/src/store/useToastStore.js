import { create } from "zustand";

/**
 * Global toast notification store.
 * Usage:
 *   import { useToastStore } from "../store/useToastStore";
 *   useToastStore.getState().addToast({ type: "success", message: "Saved!" });
 */
let toastIdCounter = 0;

export const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: ({ type = "info", message, duration = 4000 }) => {
    const id = ++toastIdCounter;
    const toast = { id, type, message, duration, createdAt: Date.now() };
    set((state) => ({ toasts: [...state.toasts, toast] }));

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => set({ toasts: [] }),
}));
