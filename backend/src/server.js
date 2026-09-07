import ENV from './lib/env.js';
import express, { urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './lib/db.js';
import authRoutes from './routes/auth.route.js';
import fortRoutes from './routes/fort.route.js';
import weatherRoutes from './routes/weather.route.js';
import riskRoutes from './routes/risk.route.js';
import userRoutes from './routes/user.route.js';

const app = express();

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
app.use("/api/users", userRoutes);

// Catch-all for unknown API routes
app.all("/api/*path", (req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Connect to DB then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});