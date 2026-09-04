import mongoose from "mongoose";

const CisternSchema = new mongoose.Schema({
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
    location: {
        name: { type: String, default: "" },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
    },
    capacityLiters: {
        type: Number,
        required: true,
    },
    currentLevelPct: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    overflowThreshold: {
        type: Number,
        default: 85, // Alert triggers above this %
    },
    status: {
        type: String,
        enum: ["normal", "elevated", "overflow"],
        default: "normal",
    },
    nearestTrail: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trail",
    },
    description: {
        type: String,
        default: "",
    },
}, { timestamps: true });

CisternSchema.index({ fort: 1 });

const Cistern = mongoose.model("Cistern", CisternSchema);

export default Cistern;
