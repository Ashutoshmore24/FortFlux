import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import ENV from './lib/env.js';
import express, { urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './lib/db.js';
import { initSocket } from './lib/socket.js';
import authRoutes from './routes/auth.route.js';
import fortRoutes from './routes/fort.route.js';
import weatherRoutes from './routes/weather.route.js';
import riskRoutes from './routes/risk.route.js';
import routingRoutes from './routes/routing.route.js';
import userRoutes from './routes/user.route.js';
import reportRoutes from './routes/report.route.js';
import { globalRateLimiter } from './middlewares/arcjet.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");

const app = express();
const httpServer = createServer(app);

const PORT = ENV.PORT || 6000;

// Trust reverse proxy headers on Render (for rate-limiting client IP and HTTPS cookies)
app.set("trust proxy", 1);

// Dynamic CORS configuration
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
];
if (ENV.CLIENT_URL) {
    ENV.CLIENT_URL.split(",").forEach((url) => {
        const trimmed = url.trim().replace(/\/$/, "");
        if (trimmed && !allowedOrigins.includes(trimmed)) {
            allowedOrigins.push(trimmed);
        }
    });
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.includes(origin) ||
            allowedOrigins.includes("*") ||
            origin.endsWith(".onrender.com")
        ) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
}));
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

// Baseline API Rate Limiting across all endpoints (exempting session check)
app.use("/api", (req, res, next) => {
    if (req.path === "/auth/check") return next();
    return globalRateLimiter(req, res, next);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/forts", fortRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/risk", riskRoutes);
app.use("/api/routing", routingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);

// Catch-all for unknown API routes
app.all("/api/*path", (req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Serve frontend build in production or when frontend/dist exists
if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));

    // Handle React SPA client-side routing (Express 5 compatible)
    app.use((req, res, next) => {
        if (req.method === 'GET' && !req.path.startsWith('/api')) {
            return res.sendFile(path.join(frontendDistPath, 'index.html'));
        }
        next();
    });
}

// Connect to DB, initialize Socket.IO, then start server
connectDB().then(() => {
    // Phase 7: Attach Socket.IO to the HTTP server
    initSocket(httpServer);

    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    // Gracefully handle port-already-in-use errors
    httpServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`\n❌ Port ${PORT} is already in use.`);
            console.error(`   Another server instance is still running.`);
            console.error(`   To fix: run  npx kill-port ${PORT}  then restart.\n`);
            process.exit(1);
        } else {
            throw err;
        }
    });
});