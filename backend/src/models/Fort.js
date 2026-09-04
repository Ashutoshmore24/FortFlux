import mongoose from "mongoose";

const FortSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
    },
    elevation: {
        type: Number,
        required: true, // meters above sea level
    },
    region: {
        type: String,
        default: "Sahyadri",
        trim: true,
    },
    district: {
        type: String,
        default: "Pune",
        trim: true,
    },
    description: {
        type: String,
        default: "",
    },
    baseVillage: {
        type: String,
        default: "",
        trim: true,
    },
    imageUrl: {
        type: String,
        default: "",
    },
    sections: [
        {
            name: { type: String, required: true },
            description: { type: String, default: "" },
        },
    ],
}, { timestamps: true });

FortSchema.index({ location: "2dsphere" });

const Fort = mongoose.model("Fort", FortSchema);

export default Fort;
