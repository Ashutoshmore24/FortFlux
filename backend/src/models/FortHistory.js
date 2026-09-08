import mongoose from "mongoose";

const FortHistorySchema = new mongoose.Schema({
    fortId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Fort",
        required: true,
        unique: true
    },
    timeline: [
        {
            year: { type: Number, required: true },
            title: { type: String, required: true },
            description: { type: String, required: true }
        }
    ],
    erosionTrends: [
        {
            year: { type: Number, required: true },
            severityIndex: { type: Number, required: true, min: 1, max: 10 },
            notes: { type: String, default: "" }
        }
    ],
    photoComparisons: [
        {
            type: { type: String, enum: ["satellite", "structural"], required: true },
            beforeImageUrl: { type: String, required: true },
            beforeLabel: { type: String, required: true },
            afterImageUrl: { type: String, required: true },
            afterLabel: { type: String, required: true },
            caption: { type: String, default: "" }
        }
    ]
}, { timestamps: true });

const FortHistory = mongoose.model("FortHistory", FortHistorySchema);

export default FortHistory;
