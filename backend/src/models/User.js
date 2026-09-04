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
        required: true,
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
    }
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

export default User;