import jwt from "jsonwebtoken";
import ENV from "./env.js";

export const getCookieOptions = () => {
    const isProduction = ENV.NODE_ENV === "production";
    const isCrossOrigin = Boolean(
        ENV.CLIENT_URL &&
        !ENV.CLIENT_URL.includes("localhost") &&
        !ENV.CLIENT_URL.includes("127.0.0.1")
    );

    return {
        maxAge: 4 * 24 * 60 * 60 * 1000, // 4 days in ms
        httpOnly: true, // prevents XSS attacks — not accessible via JS
        sameSite: isCrossOrigin ? "none" : "lax",
        secure: isProduction || isCrossOrigin,
    };
};

const generateToken = (userId, role = "trekker", res = null) => {
    const token = jwt.sign(
        { userId, role },
        ENV.JWT_SECRET,
        {
            expiresIn: ENV.JWT_EXPIRES_IN || "4d",
        }
    );

    if (res && typeof res.cookie === "function") {
        res.cookie("jwt", token, getCookieOptions());
    }

    return token;
};

export default generateToken;

