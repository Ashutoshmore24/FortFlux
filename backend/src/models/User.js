import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: false,
        minlength: 6
    },
    role: {
        type: String,
        enum: ["trekker", "authority", "admin"],
        default: "trekker"
    },
    organization: {
        type: String,
        default: "",
        trim: true
    },
    profilePic: {
        type: String,
        default: ""
    },
    googleId: {
        type: String,
        default: null
    },
    authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },
    fullName: {
        type: String,
        default: "",
        trim: true
    },
    bio: {
        type: String,
        default: "",
        maxlength: 150,
        trim: true
    },
    location: {
        type: String,
        default: "",
        trim: true
    },
    avatarUrl: {
        type: String,
        default: ""
    },
    avatarCloudinaryId: {
        type: String,
        default: ""
    },
    bannerUrl: {
        type: String,
        default: ""
    },
    bannerCloudinaryId: {
        type: String,
        default: ""
    },
    stats: {
        treksCompleted: { type: Number, default: 0 },
        photosContributed: { type: Number, default: 0 },
        fortsVisited: { type: [String], default: [] }
    },
    authorityDetails: {
        assignedForts: { type: [String], default: [] },
        designation: { type: String, default: "" }
    }
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

export default User;