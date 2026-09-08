import express from "express";
import { login, signup, logout, checkAuth, updateProfile, googleLogin } from "../controllers/auth.controller.js";
import { protectRoute, requireRole } from "../middlewares/auth.middleware.js";
import { authRateLimiter } from "../middlewares/arcjet.middleware.js";

const router = express.Router();

// Sensitive authentication endpoints guarded against brute-force / credential stuffing
router.post("/signup", authRateLimiter, signup);
router.post("/login", authRateLimiter, login);
router.post("/logout", logout);
router.post("/google", authRateLimiter, googleLogin);

router.get("/check", protectRoute, checkAuth);
router.put("/profile", protectRoute, updateProfile);

// Route guarded for Authorities and Admins only
router.get("/authority-check", protectRoute, requireRole("authority", "admin"), (req, res) => {
    res.status(200).json({
        message: "Access granted to Authority Dashboard",
        user: req.user,
    });
});

export default router;