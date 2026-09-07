import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import generateToken, { getCookieOptions } from "../lib/jwt.js";
import admin from "../lib/firebase-admin.js";
import cloudinary from "../lib/cloudinary.js";

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const signup = async (req, res) => {
    try {
        const { username, email, password, role, organization } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Sanitize role (trekkers or authorities only via signup)
        const userRole = (role === "authority") ? "authority" : "trekker";

        // Create the new user
        const newUser = new User({
            username: username.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: userRole,
            organization: organization ? organization.trim() : "",
        });

        // Save the user first before issuing a token/cookie
        await newUser.save();

        // Generate JWT token and set cookie
        generateToken(newUser._id, newUser.role, res);

        return res.status(201).json({
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            organization: newUser.organization,
            profilePic: newUser.profilePic,
        });
    } catch (error) {
        console.error("Error in signup controller:", error.message);
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already exists" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find user by email
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare passwords
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token and set cookie
        generateToken(user._id, user.role, res);

        return res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            organization: user.organization,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.error("Error in login controller:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const logout = async (req, res) => {
    try {
        res.clearCookie("jwt", getCookieOptions());
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error in logout controller:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const checkAuth = async (req, res) => {
    try {
        return res.status(200).json(req.user);
    } catch (error) {
        console.error("Error in checkAuth controller:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { username, fullName, bio, location, organization } = req.body;
        const userId = req.user._id;

        const updateData = {};
        if (username !== undefined) updateData.username = username.trim();
        if (fullName !== undefined) updateData.fullName = fullName.trim();
        if (bio !== undefined) updateData.bio = bio.trim();
        if (location !== undefined) updateData.location = location.trim();
        if (organization !== undefined) updateData.organization = organization.trim();

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { returnDocument: "after" }
        ).select("-password");

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error in updateProfile controller:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ message: "Firebase ID token is required" });
        }

        // Verify the Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;

        if (!email) {
            return res.status(400).json({ message: "Google account must have an email address" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        let user = await User.findOne({ email: normalizedEmail });

        if (user) {
            // Update googleId if not already set (existing email/password user linking to Google)
            if (!user.googleId) {
                user.googleId = uid;
                user.authProvider = "google";
                if (picture && !user.profilePic) {
                    user.profilePic = picture;
                }
                await user.save();
            }
        } else {
            // Create a new user — generate a random placeholder password
            const randomPassword = crypto.randomBytes(32).toString("hex");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = new User({
                username: name || email.split("@")[0],
                email: normalizedEmail,
                password: hashedPassword,
                role: "trekker",
                organization: "",
                profilePic: picture || "",
                googleId: uid,
                authProvider: "google",
            });

            await user.save();
        }

        // Generate JWT token and set cookie
        generateToken(user._id, user.role, res);

        return res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            organization: user.organization,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.error("Error in googleLogin controller:", error.message);

        if (error.code === "auth/id-token-expired") {
            return res.status(401).json({ message: "Google token has expired. Please try again." });
        }
        if (error.code === "auth/argument-error" || error.code === "auth/id-token-revoked") {
            return res.status(401).json({ message: "Invalid Google token. Please try again." });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
};

export { login, signup, logout, checkAuth, updateProfile, googleLogin };