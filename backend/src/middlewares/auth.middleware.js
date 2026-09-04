import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ENV from "../lib/env.js";

export const protectRoute = async (req, res, next) => {
    try {
        
        let token = req.cookies?.jwt;

        // Fallback to Bearer token in Authorization header
        if (!token && req.headers?.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Unauthorized — no token provided" });
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET);

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in protectRoute middleware:", error.message);

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Unauthorized — invalid token" });
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Unauthorized — token expired" });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
};

export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized — authentication required" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Forbidden — access requires one of the following roles: ${roles.join(", ")}`,
            });
        }

        next();
    };
};

export default protectRoute;

