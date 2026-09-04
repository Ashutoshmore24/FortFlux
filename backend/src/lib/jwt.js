import jwt from "jsonwebtoken";
import ENV from "./env.js";

export const getCookieOptions = () => ({
    maxAge: 4 * 24 * 60 * 60 * 1000, // 4 days in ms
    httpOnly: true, // prevents XSS attacks — not accessible via JS
    sameSite: "strict", // prevents CSRF attacks
    secure: ENV.NODE_ENV !== "development", // HTTPS only in production
});

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

