import mongoose from "mongoose";

const TrailSchema = new mongoose.Schema({
    fort: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Fort",
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    // Graph edge representation: start waypoint → end waypoint
    startPoint: {
        name: { type: String, required: true },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
    },
    endPoint: {
        name: { type: String, required: true },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
    },
    // Full polyline coordinates for map rendering: [[lng, lat], [lng, lat], ...]
    path: {
        type: [[Number]],
        default: [],
    },
    // Risk formula parameters
    baselineDifficulty: {
        type: Number,
        default: 1.0,
        min: 1.0,
        max: 2.0,
    },
    slopeGradient: {
        type: Number,
        default: 1.0,
        min: 1.0,
        max: 2.0,
    },
    maxSafeFootfall: {
        type: Number,
        default: 500,
    },
    // Dynamic live states (updated by live telemetry/risk engine)
    currentFootfall: {
        type: Number,
        default: 0,
        min: 0,
    },
    currentRiskScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    status: {
        type: String,
        enum: ["open", "caution", "closed", "diverted"],
        default: "open",
    },
    // Metadata
    distanceKm: {
        type: Number,
        default: 0,
    },
    difficulty: {
        type: String,
        enum: ["easy", "moderate", "hard", "extreme"],
        default: "moderate",
    },
    description: {
        type: String,
        default: "",
    },
    imageUrl: {
        type: String,
        default: "",
    },
    landslideHistory: [
        {
            date: { type: Date, default: Date.now },
            description: { type: String, default: "" },
            severity: {
                type: String,
                enum: ["minor", "moderate", "severe"],
                default: "moderate",
            },
        },
    ],
}, { timestamps: true });

TrailSchema.index({ fort: 1 });
TrailSchema.index({ status: 1 });

const Trail = mongoose.model("Trail", TrailSchema);

export default Trail;
