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

const app = express();
const httpServer = createServer(app);

const PORT = ENV.PORT || 6000;

// Middleware
app.use(cors({
    origin: ENV.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

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