import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function cleanup() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error("MONGODB_URI not found");
            process.exit(1);
        }

        await mongoose.connect(uri);
        console.log("Connected to MongoDB.");

        const TrailReport = mongoose.model(
            "TrailReport",
            new mongoose.Schema({}, { strict: false })
        );

        const result = await TrailReport.deleteMany({
            $or: [
                { imageUrl: { $regex: "unsplash", $options: "i" } },
                { description: { $regex: "Chor Darwaja", $options: "i" } },
                { description: { $regex: "Padmavati cistern overflow", $options: "i" } },
                { description: { $regex: "basalt mortar joint", $options: "i" } }
            ]
        });

        console.log(`Deleted ${result.deletedCount} sample/AI generated reports.`);
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    } catch (err) {
        console.error("Cleanup error:", err);
    }
}

cleanup();
