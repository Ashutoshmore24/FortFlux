import mongoose from "mongoose";

const TrailReportSchema = new mongoose.Schema(
    {
        fort: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Fort",
            required: true,
        },
        trail: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Trail",
            default: null,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        cloudinaryId: {
            type: String,
            default: "",
        },
        hazardType: {
            type: String,
            enum: [
                "rockfall",       // Loose scree, boulders on path
                "landslide",      // Slope failure, washed out trail
                "waterlogging",   // Submerged steps, cistern overflow
                "fissure",        // Masonry cracking, mortar degradation
                "railing",        // Broken safety railing/chains
                "overcrowding",   // Bottleneck congestion
                "other",
            ],
            default: "rockfall",
        },
        severity: {
            type: String,
            enum: ["low", "moderate", "high", "critical"],
            default: "moderate",
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
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
        status: {
            type: String,
            enum: ["pending", "verified", "rejected", "resolved"],
            default: "pending",
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        verifiedAt: {
            type: Date,
            default: null,
        },
        aiTriage: {
            confidenceScore: {
                type: Number,
                default: 0.88,
            },
            hazardAssessment: {
                type: String,
                default: "",
            },
            recommendedAction: {
                type: String,
                default: "",
            },
        },
    },
    {
        timestamps: true,
    }
);

// GeoJSON 2dsphere index for geospatial proximity queries
TrailReportSchema.index({ location: "2dsphere" });
TrailReportSchema.index({ fort: 1, status: 1 });

export default mongoose.model("TrailReport", TrailReportSchema);
