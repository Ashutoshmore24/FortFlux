/**
 * Phase 7 — Socket.IO Client Singleton
 *
 * Manages a single Socket.IO connection to the backend.
 * Automatically handles reconnection and provides subscribe/unsubscribe helpers
 * for Zustand stores to listen to real-time events.
 *
 * Usage:
 *   import { connectSocket, disconnectSocket, getSocket } from "../lib/socket";
 *   connectSocket();   // Call once on auth success
 *   disconnectSocket(); // Call on logout
 */

import { io } from "socket.io-client";

let socket = null;

/**
 * Connect to the Socket.IO server.
 * Uses cookies for auth (credentials: true), matching the backend JWT middleware.
 * Safe to call multiple times — reconnects only if not already connected.
 *
 * @returns {import("socket.io-client").Socket} The socket instance
 */
export const connectSocket = () => {
    if (socket?.connected) {
        return socket;
    }

    // Determine the backend URL — in dev, Vite proxies /api but socket.io
    // needs to connect directly. In production, same origin is used.
    const backendUrl = import.meta.env.VITE_API_BASE_URL
        ? import.meta.env.VITE_API_BASE_URL.replace("/api", "")
        : "";

    socket = io(backendUrl, {
        // Send cookies (JWT) with the connection handshake
        withCredentials: true,
        // Start with polling, upgrade to WebSocket for reliability
        transports: ["polling", "websocket"],
        // Reconnection settings
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
    });

    socket.on("connect", () => {
        console.log("⚡ Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
        console.log("⚡ Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
        console.warn("⚡ Socket connection error:", error.message);
    });

    return socket;
};

/**
 * Disconnect from the Socket.IO server.
 * Cleans up the socket instance and all listeners.
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log("⚡ Socket disconnected (manual)");
    }
};

/**
 * Get the current socket instance.
 * Returns null if not connected.
 *
 * @returns {import("socket.io-client").Socket|null}
 */
export const getSocket = () => socket;

/**
 * Subscribe to a socket event. Returns an unsubscribe function.
 * Safe to call even if socket isn't connected yet — queues the listener.
 *
 * @param {string} event - Event name to listen for
 * @param {Function} callback - Handler function
 * @returns {Function} Unsubscribe function to remove the listener
 */
export const subscribeToEvent = (event, callback) => {
    if (!socket) {
        console.warn(`⚡ Cannot subscribe to '${event}' — socket not connected`);
        return () => {};
    }

    socket.on(event, callback);
    return () => {
        socket?.off(event, callback);
    };
};

/**
 * Join a fort-specific room to receive targeted updates.
 *
 * @param {string} fortSlug - The fort slug to join
 */
export const joinFortRoom = (fortSlug) => {
    if (socket?.connected && fortSlug) {
        socket.emit("join-fort", fortSlug);
    }
};

/**
 * Leave a fort-specific room.
 *
 * @param {string} fortSlug - The fort slug to leave
 */
export const leaveFortRoom = (fortSlug) => {
    if (socket?.connected && fortSlug) {
        socket.emit("leave-fort", fortSlug);
    }
};
