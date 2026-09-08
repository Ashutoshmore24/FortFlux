import mongoose from "mongoose";
import dotenv from "dotenv";
import Fort from "../models/Fort.js";
import FortHistory from "../models/FortHistory.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/fortflux";

const seedHistory = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const allForts = await Fort.find({});
        console.log(`Found ${allForts.length} forts to seed history for.`);

        for (const fort of allForts) {
            await FortHistory.deleteMany({ fortId: fort._id });

            const historyData = {
                fortId: fort._id,
                timeline: [
                    { year: 1328, title: "Early Regional Fortification", description: `Earliest known strategic fortification and outposts established at ${fort.name}.` },
                    { year: 1647, title: "Liberation & Swarajya Control", description: `Chhatrapati Shivaji Maharaj established control, reinforcing bastions and gates.` },
                    { year: 1670, title: "Maratha Strategic Peak", description: `Active garrisoning, royal treasure protection, and military logistics hub.` },
                    { year: 1703, title: "Mughal Confrontation", description: `Key battles fought to defend the territorial integrity of the Deccan.` },
                    { year: 1818, title: "British Takeover", description: `Captured by the British East India Company forces.` }
                ],
                erosionTrends: [
                    { year: 2010, severityIndex: 2, notes: "Minor wear on main gates and stone stairways." },
                    { year: 2015, severityIndex: 4, notes: "Increased footfall led to trail and pathway degradation." },
                    { year: 2020, severityIndex: 6, notes: "Heavy monsoons caused weathering on outer ramparts." },
                    { year: 2024, severityIndex: 7, notes: "Active preservation, trail marking, and structural reinforcement." }
                ],
                photoComparisons: [
                    {
                        type: "structural",
                        beforeImageUrl: fort.imageUrl || "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
                        beforeLabel: "Archival Record",
                        afterImageUrl: fort.imageUrl || "https://images.unsplash.com/photo-1598418042502-0e24ec172c3d?auto=format&fit=crop&w=800&q=80",
                        afterLabel: "Contemporary State",
                        caption: `Structural state and preservation analysis of ${fort.name}.`
                    }
                ]
            };

            const history = new FortHistory(historyData);
            await history.save();
            console.log(`✓ History seeded for ${fort.name}`);
        }

        console.log("All fort histories successfully seeded!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding history:", error);
        process.exit(1);
    }
};

seedHistory();
