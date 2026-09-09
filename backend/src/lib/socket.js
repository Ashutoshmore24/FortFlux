/**
 * Phase 7 — Socket.IO Server Singleton
 *
 * Provides a centralized Socket.IO instance that can be imported
 * anywhere in the backend to emit real-time events.
 *
 * Usage:
 *   import { initSocket, getIO } from "./lib/socket.js";
 *   // In server.js: initSocket(httpServer);
 *   // In controllers: getIO().emit("event-name", data);
 */

import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import ENV from "./env.js";

let io = null;

/**
 * Initialize Socket.IO server and attach it to the HTTP server.
 * Sets up authentication middleware and connection handling.
 *
 * @param {import("http").Server} httpServer - Node.js HTTP server instance
 * @returns {Server} The Socket.IO server instance
 */
export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: (origin, callback) => callback(null, true),
            credentials: true,
        },
        // Graceful transport upgrade: start with polling, upgrade to WebSocket
        transports: ["polling", "websocket"],
    });

    // ── Authentication Middleware ──
    // Verify JWT from cookies if present, otherwise allow connection for real-time telemetry mesh
    io.use((socket, next) => {
        try {
            const cookies = socket.handshake.headers.cookie;
            if (cookies) {
                const tokenMatch = cookies
                    .split(";")
                    .map((c) => c.trim())
                    .find((c) => c.startsWith("jwt="));

                if (tokenMatch) {
                    const token = tokenMatch.split("=")[1];
                    const decoded = jwt.verify(token, ENV.JWT_SECRET);
                    socket.userId = decoded.userId;
                    socket.userRole = decoded.role;
                }
            }
        } catch (error) {
            console.warn("Socket auth handshake note:", error.message);
        }

        // Default to trekker role for public environmental telemetry if not explicitly set
        if (!socket.userRole) {
            socket.userRole = "trekker";
        }
        next();
    });

    // ── Connection Handler ──
    io.on("connection", (socket) => {
        console.log(
            `⚡ Socket connected: ${socket.id} (user: ${socket.userId}, role: ${socket.userRole})`
        );

        // Join a room based on user role for targeted events
        socket.join(`role:${socket.userRole}`);

        // Clients can join fort-specific rooms to receive updates for a specific fort
        socket.on("join-fort", (fortSlug) => {
            if (fortSlug && typeof fortSlug === "string") {
                socket.join(`fort:${fortSlug}`);
                console.log(`📍 Socket ${socket.id} joined fort room: ${fortSlug}`);
            }
        });

        socket.on("leave-fort", (fortSlug) => {
            if (fortSlug && typeof fortSlug === "string") {
                socket.leave(`fort:${fortSlug}`);
                console.log(`📍 Socket ${socket.id} left fort room: ${fortSlug}`);
            }
        });

        socket.on("disconnect", (reason) => {
            console.log(`⚡ Socket disconnected: ${socket.id} (${reason})`);
        });
    });

    console.log("🔌 Socket.IO server initialized");
    return io;
};

/**
 * Get the active Socket.IO server instance.
 * Returns null if Socket.IO hasn't been initialized yet (safe to call before init).
 *
 * @returns {Server|null}
 */
export const getIO = () => io;

/**
 * Emit an event to all connected clients.
 * Safe to call even before Socket.IO is initialized — silently no-ops.
 *
 * @param {string} event - Event name
 * @param {*} data - Event payload
 */
export const emitToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};

/**
 * Emit an event to all clients in a specific fort room.
 *
 * @param {string} fortSlug - Fort slug identifying the room
 * @param {string} event - Event name
 * @param {*} data - Event payload
 */
export const emitToFort = (fortSlug, event, data) => {
    if (io && fortSlug) {
        io.to(`fort:${fortSlug}`).emit(event, data);
    }
};

/**
 * Emit an event to all clients with a specific role.
 *
 * @param {string} role - User role (e.g., "trekker", "authority", "admin")
 * @param {string} event - Event name
 * @param {*} data - Event payload
 */
export const emitToRole = (role, event, data) => {
    if (io && role) {
        io.to(`role:${role}`).emit(event, data);
    }
};
