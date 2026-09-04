import mongoose from "mongoose";
import ENV from "../lib/env.js";
import Fort from "../models/Fort.js";
import Trail from "../models/Trail.js";
import Cistern from "../models/Cistern.js";

const seedData = async () => {
    try {
        if (!ENV.MONGODB_URI) {
            console.error("❌ MONGODB_URI is missing in backend/.env");
            process.exit(1);
        }

        console.log("⏳ Connecting to MongoDB...");
        await mongoose.connect(ENV.MONGODB_URI);
        console.log("Connected to MongoDB for seeding.");

        // Clear existing data
        console.log("🧹 Clearing existing Forts, Trails, and Cisterns...");
        await Fort.deleteMany({});
        await Trail.deleteMany({});
        await Cistern.deleteMany({});

        // ─────────────────────────────────────────────────────────────
        // 1. RAJGAD FORT (The King of Forts)
        // ─────────────────────────────────────────────────────────────
        const rajgad = await Fort.create({
            name: "Rajgad Fort",
            slug: "rajgad",
            location: {
                type: "Point",
                coordinates: [73.6822, 18.2459], // [lng, lat]
            },
            elevation: 1376,
            region: "Western Ghats — Sahyadri",
            district: "Pune",
            baseVillage: "Gunjavane",
            description: "Capital of the Maratha Empire under Chhatrapati Shivaji Maharaj for over 26 years. Known for its distinct tripartite layout: Padmavati Machi, Sanjeevani Machi, and Suvela Machi crowning the central citadel Balekilla.",
            imageUrl: "https://images.unsplash.com/photo-1598418042502-0e24ec172c3d?auto=format&fit=crop&w=1200&q=80",
            sections: [
                { name: "Padmavati Machi", description: "Central administrative plateau containing the Padmavati Temple, Lake, and royal quarters." },
                { name: "Suvela Machi", description: "Narrow eastern ridge famous for the Nedhe (natural rock eyelet needle hole) and double-bastion fortifications." },
                { name: "Sanjeevani Machi", description: "Expansive multi-layered defensive rampart extending southwest with fortified watch bastions." },
                { name: "Balekilla", description: "The highest fortified citadel accessible via a treacherous near-vertical rock stairway." },
            ],
        });

        // Rajgad Trails
        const rajgadTrails = await Trail.create([
            {
                fort: rajgad._id,
                name: "Gunjavane to Chor Darwaja",
                slug: "gunjavane-to-chor-darwaja",
                startPoint: { name: "Gunjavane Base Village", coordinates: [73.6872, 18.2421] },
                endPoint: { name: "Chor Darwaja (Secret Gate)", coordinates: [73.6845, 18.2448] },
                path: [
                    [73.6872, 18.2421],
                    [73.6865, 18.2430],
                    [73.6858, 18.2439],
                    [73.6845, 18.2448],
                ],
                baselineDifficulty: 1.4,
                slopeGradient: 1.4,
                maxSafeFootfall: 450,
                currentFootfall: 120,
                currentRiskScore: 28,
                status: "open",
                distanceKm: 3.2,
                difficulty: "moderate",
                description: "Steep scree-slope trail climbing from the northeast village through rocky gullies with exposed steel railings near Chor Darwaja.",
            },
            {
                fort: rajgad._id,
                name: "Chor Darwaja to Padmavati Machi",
                slug: "chor-darwaja-to-padmavati-machi",
                startPoint: { name: "Chor Darwaja", coordinates: [73.6845, 18.2448] },
                endPoint: { name: "Padmavati Temple Complex", coordinates: [73.6829, 18.2462] },
                path: [
                    [73.6845, 18.2448],
                    [73.6838, 18.2455],
                    [73.6829, 18.2462],
                ],
                baselineDifficulty: 1.1,
                slopeGradient: 1.1,
                maxSafeFootfall: 650,
                currentFootfall: 140,
                currentRiskScore: 12,
                status: "open",
                distanceKm: 0.8,
                difficulty: "easy",
                description: "Gentle ascending paved trail winding along the outer fortification curtain wall directly onto the central plateau.",
            },
            {
                fort: rajgad._id,
                name: "Padmavati Machi to Balekilla",
                slug: "padmavati-machi-to-balekilla",
                startPoint: { name: "Padmavati Machi Base", coordinates: [73.6829, 18.2462] },
                endPoint: { name: "Balekilla Maha Darwaja", coordinates: [73.6815, 18.2452] },
                path: [
                    [73.6829, 18.2462],
                    [73.6822, 18.2458],
                    [73.6818, 18.2455],
                    [73.6815, 18.2452],
                ],
                baselineDifficulty: 1.7,
                slopeGradient: 1.8,
                maxSafeFootfall: 200,
                currentFootfall: 45,
                currentRiskScore: 42,
                status: "open",
                distanceKm: 1.1,
                difficulty: "hard",
                description: "Very steep 70-degree rock cut stairway with sheer drops. High slippage hazard during rain; requires firm footwear and steady footing.",
            },
            {
                fort: rajgad._id,
                name: "Padmavati Machi to Suvela Machi",
                slug: "padmavati-machi-to-suvela-machi",
                startPoint: { name: "Padmavati Temple", coordinates: [73.6829, 18.2462] },
                endPoint: { name: "Suvela Bastion Entrance", coordinates: [73.6860, 18.2475] },
                path: [
                    [73.6829, 18.2462],
                    [73.6842, 18.2469],
                    [73.6860, 18.2475],
                ],
                baselineDifficulty: 1.5,
                slopeGradient: 1.4,
                maxSafeFootfall: 350,
                currentFootfall: 80,
                currentRiskScore: 24,
                status: "open",
                distanceKm: 1.5,
                difficulty: "moderate",
                description: "Traverses along the northeastern rim past ancient stone granaries toward the prominent Nedhe rock eyelet.",
            },
            {
                fort: rajgad._id,
                name: "Suvela Machi Ridge Path",
                slug: "suvela-machi-ridge-path",
                startPoint: { name: "Nedhe Natural Needle", coordinates: [73.6875, 18.2482] },
                endPoint: { name: "Kaman Bastion Tip", coordinates: [73.6912, 18.2490] },
                path: [
                    [73.6875, 18.2482],
                    [73.6890, 18.2486],
                    [73.6912, 18.2490],
                ],
                baselineDifficulty: 1.9,
                slopeGradient: 1.8,
                maxSafeFootfall: 150,
                currentFootfall: 20,
                currentRiskScore: 55,
                status: "caution",
                distanceKm: 1.2,
                difficulty: "extreme",
                description: "Narrow exposed knife-edge ridge walk with 500m drops on both sides. High crosswinds and rockfall risk during adverse weather.",
            },
            {
                fort: rajgad._id,
                name: "Pali Gate Stairway",
                slug: "pali-gate-stairway",
                startPoint: { name: "Pali Village Base", coordinates: [73.6740, 18.2435] },
                endPoint: { name: "Pali Darwaja Gate", coordinates: [73.6795, 18.2450] },
                path: [
                    [73.6740, 18.2435],
                    [73.6765, 18.2442],
                    [73.6795, 18.2450],
                ],
                baselineDifficulty: 1.2,
                slopeGradient: 1.3,
                maxSafeFootfall: 600,
                currentFootfall: 95,
                currentRiskScore: 18,
                status: "open",
                distanceKm: 2.7,
                difficulty: "moderate",
                description: "The royal historic gateway trail paved with wide stone steps. Suitable for pack animals and larger trekking groups.",
            },
        ]);

        // Rajgad Cisterns
        await Cistern.create([
            {
                fort: rajgad._id,
                name: "Padmavati Lake Cistern",
                location: { name: "Padmavati Machi", coordinates: [73.6831, 18.2464] },
                capacityLiters: 50000,
                currentLevelPct: 62,
                overflowThreshold: 85,
                status: "normal",
                nearestTrail: rajgadTrails[1]._id, // Chor Darwaja to Padmavati Machi
                description: "Primary perennial reservoir feeding the administrative hub. Filtered by natural volcanic basalt layers.",
            },
            {
                fort: rajgad._id,
                name: "Balekilla Summit Cistern",
                location: { name: "Balekilla Apex", coordinates: [73.6814, 18.2451] },
                capacityLiters: 15000,
                currentLevelPct: 40,
                overflowThreshold: 80,
                status: "normal",
                nearestTrail: rajgadTrails[2]._id, // Padmavati Machi to Balekilla
                description: "High-altitude rock-cut water cistern designed to sustain citadel occupants during prolonged sieges.",
            },
            {
                fort: rajgad._id,
                name: "Pali Gate Rock-Cut Cistern #3",
                location: { name: "Near Pali Darwaja Inner Court", coordinates: [73.6798, 18.2453] },
                capacityLiters: 25000,
                currentLevelPct: 75,
                overflowThreshold: 90,
                status: "normal",
                nearestTrail: rajgadTrails[5]._id, // Pali Gate Stairway
                description: "Deep subterranean rock cistern carved into the basalt bedrock alongside the royal entry gate.",
            },
        ]);

        // ─────────────────────────────────────────────────────────────
        // 2. TORNA FORT (Prachandgad)
        // ─────────────────────────────────────────────────────────────
        const torna = await Fort.create({
            name: "Torna Fort",
            slug: "torna",
            location: {
                type: "Point",
                coordinates: [73.6227, 18.2761],
            },
            elevation: 1403,
            region: "Western Ghats — Sahyadri",
            district: "Pune",
            baseVillage: "Velhe",
            description: "The first fort captured by Shivaji Maharaj in 1646 at age 16. Named 'Prachandgad' (Huge Fort) due to its vast perimeter and massive fortified machis, Torna stands as the tallest fort in Pune district.",
            imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
            sections: [
                { name: "Zunjar Machi", description: "Spectacular knife-edge western spur featuring a series of fortified bastions suspended over sheer cliffs." },
                { name: "Budhla Machi", description: "Eastern ridge resembling an overturned vessel ('Budhla'), fortified with secret escape tunnels." },
                { name: "Menghai Temple Complex", description: "Centrally situated temple and open plateau sheltering ancient rock-cut water tanks." },
            ],
        });

        // Torna Trails
        const tornaTrails = await Trail.create([
            {
                fort: torna._id,
                name: "Velhe Base to Bidi Darwaja",
                slug: "velhe-base-to-bidi-darwaja",
                startPoint: { name: "Velhe Village Trailhead", coordinates: [73.6350, 18.2780] },
                endPoint: { name: "Bidi Darwaja Outer Gate", coordinates: [73.6265, 18.2770] },
                path: [
                    [73.6350, 18.2780],
                    [73.6310, 18.2775],
                    [73.6265, 18.2770],
                ],
                baselineDifficulty: 1.5,
                slopeGradient: 1.6,
                maxSafeFootfall: 400,
                currentFootfall: 75,
                currentRiskScore: 30,
                status: "open",
                distanceKm: 4.1,
                difficulty: "hard",
                description: "Continuous steep climb through thorn forest and basalt rock gullies exposed to strong afternoon heat.",
            },
            {
                fort: torna._id,
                name: "Bidi Darwaja to Menghai Temple",
                slug: "bidi-darwaja-to-menghai-temple",
                startPoint: { name: "Bidi Darwaja Gate", coordinates: [73.6265, 18.2770] },
                endPoint: { name: "Menghai Goddess Shrine", coordinates: [73.6235, 18.2762] },
                path: [
                    [73.6265, 18.2770],
                    [73.6250, 18.2766],
                    [73.6235, 18.2762],
                ],
                baselineDifficulty: 1.1,
                slopeGradient: 1.1,
                maxSafeFootfall: 500,
                currentFootfall: 60,
                currentRiskScore: 10,
                status: "open",
                distanceKm: 0.9,
                difficulty: "easy",
                description: "Leveled walkway traversing across the interior fort plateau connecting the gate to the temple settlement.",
            },
            {
                fort: torna._id,
                name: "Menghai Temple to Zunjar Machi Ridge",
                slug: "menghai-temple-to-zunjar-machi-ridge",
                startPoint: { name: "Menghai Temple", coordinates: [73.6235, 18.2762] },
                endPoint: { name: "Zunjar Machi Extreme Point", coordinates: [73.6140, 18.2745] },
                path: [
                    [73.6235, 18.2762],
                    [73.6190, 18.2752],
                    [73.6140, 18.2745],
                ],
                baselineDifficulty: 1.8,
                slopeGradient: 1.9,
                maxSafeFootfall: 120,
                currentFootfall: 15,
                currentRiskScore: 50,
                status: "caution",
                distanceKm: 1.6,
                difficulty: "extreme",
                description: "Demanding technical ridge with vertical rock ladders, intense gale winds, and cliffside drops on northern and southern faces.",
            },
            {
                fort: torna._id,
                name: "Central Plateau to Budhla Machi",
                slug: "central-plateau-to-budhla-machi",
                startPoint: { name: "Kothi Building", coordinates: [73.6240, 18.2764] },
                endPoint: { name: "Budhla Machi Fortification", coordinates: [73.6295, 18.2758] },
                path: [
                    [73.6240, 18.2764],
                    [73.6270, 18.2760],
                    [73.6295, 18.2758],
                ],
                baselineDifficulty: 1.4,
                slopeGradient: 1.5,
                maxSafeFootfall: 250,
                currentFootfall: 35,
                currentRiskScore: 22,
                status: "open",
                distanceKm: 1.3,
                difficulty: "moderate",
                description: "Eastern spur route flanked by rock ramparts and scenic valley overlooks toward Rajgad.",
            },
        ]);

        // Torna Cisterns
        await Cistern.create([
            {
                fort: torna._id,
                name: "Menghai Sacred Tank",
                location: { name: "Adjacent to Menghai Temple", coordinates: [73.6238, 18.2763] },
                capacityLiters: 40000,
                currentLevelPct: 70,
                overflowThreshold: 85,
                status: "normal",
                nearestTrail: tornaTrails[1]._id,
                description: "Sacred perennial water storage facility located at the spiritual and administrative core of Torna.",
            },
            {
                fort: torna._id,
                name: "Budhla Ridge Rock Cistern",
                location: { name: "Budhla Machi Neck", coordinates: [73.6288, 18.2759] },
                capacityLiters: 20000,
                currentLevelPct: 55,
                overflowThreshold: 80,
                status: "normal",
                nearestTrail: tornaTrails[3]._id,
                description: "Twin rock-hewn water cisterns replenishing patrols stationed at the eastern bastion.",
            },
        ]);

        // ─────────────────────────────────────────────────────────────
        // 3. SINHAGAD FORT (The Lion's Fort)
        // ─────────────────────────────────────────────────────────────
        const sinhagad = await Fort.create({
            name: "Sinhagad Fort",
            slug: "sinhagad",
            location: {
                type: "Point",
                coordinates: [73.7556, 18.3667],
            },
            elevation: 1312,
            region: "Western Ghats — Sahyadri",
            district: "Pune",
            baseVillage: "Atkarwadi",
            description: "Immortalized by the legendary 1670 battle led by Tanaji Malusare. Perched atop an isolated cliff of the Bhuleshwar range, commanding scenic views over the Khadakwasla Dam reservoir.",
            imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
            sections: [
                { name: "Tanaji Malusare Samadhi", description: "Memorial dedicated to the warrior Tanaji Malusare and his heroic conquest of Kondhana." },
                { name: "Kalyan Darwaja", description: "Southwestern double-bastioned military entrance approached from Atkarwadi." },
                { name: "Pune Darwaja", description: "Northeastern primary ceremonial gate facing the city of Pune." },
                { name: "KadeLot Precipice", description: "Sheer vertical cliff on the western rampart traditionally used as a punishment drop." },
            ],
        });

        // Sinhagad Trails
        const sinhagadTrails = await Trail.create([
            {
                fort: sinhagad._id,
                name: "Atkarwadi Base to Kalyan Darwaja",
                slug: "atkarwadi-base-to-kalyan-darwaja",
                startPoint: { name: "Atkarwadi Parking Ground", coordinates: [73.7505, 18.3580] },
                endPoint: { name: "Kalyan Darwaja Gate", coordinates: [73.7538, 18.3645] },
                path: [
                    [73.7505, 18.3580],
                    [73.7518, 18.3610],
                    [73.7538, 18.3645],
                ],
                baselineDifficulty: 1.3,
                slopeGradient: 1.4,
                maxSafeFootfall: 800,
                currentFootfall: 210,
                currentRiskScore: 25,
                status: "open",
                distanceKm: 2.8,
                difficulty: "moderate",
                description: "The classic trekker trail starting from Atkarwadi village. Heavily frequented on weekends; stone steps can get slick when wet.",
            },
            {
                fort: sinhagad._id,
                name: "Kalyan Darwaja to Tanaji Memorial",
                slug: "kalyan-darwaja-to-tanaji-memorial",
                startPoint: { name: "Kalyan Darwaja Gate", coordinates: [73.7538, 18.3645] },
                endPoint: { name: "Tanaji Malusare Samadhi", coordinates: [73.7562, 18.3668] },
                path: [
                    [73.7538, 18.3645],
                    [73.7550, 18.3658],
                    [73.7562, 18.3668],
                ],
                baselineDifficulty: 1.0,
                slopeGradient: 1.1,
                maxSafeFootfall: 1000,
                currentFootfall: 350,
                currentRiskScore: 15,
                status: "open",
                distanceKm: 0.7,
                difficulty: "easy",
                description: "Flat tourist pathway connecting the southern military gate with the historical memorials and local food stalls.",
            },
            {
                fort: sinhagad._id,
                name: "Tanaji Memorial to Pune Darwaja",
                slug: "tanaji-memorial-to-pune-darwaja",
                startPoint: { name: "Tanaji Memorial", coordinates: [73.7562, 18.3668] },
                endPoint: { name: "Pune Darwaja Triple Gate", coordinates: [73.7580, 18.3685] },
                path: [
                    [73.7562, 18.3668],
                    [73.7570, 18.3678],
                    [73.7580, 18.3685],
                ],
                baselineDifficulty: 1.1,
                slopeGradient: 1.1,
                maxSafeFootfall: 900,
                currentFootfall: 180,
                currentRiskScore: 10,
                status: "open",
                distanceKm: 0.6,
                difficulty: "easy",
                description: "Paved route leading toward the three-tiered northern defensive gateway facing Pune city.",
            },
            {
                fort: sinhagad._id,
                name: "Pune Darwaja to KadeLot Precipice",
                slug: "pune-darwaja-to-kadelot-precipice",
                startPoint: { name: "Pune Darwaja Upper Terrace", coordinates: [73.7580, 18.3685] },
                endPoint: { name: "KadeLot Cliff Edge", coordinates: [73.7525, 18.3680] },
                path: [
                    [73.7580, 18.3685],
                    [73.7550, 18.3682],
                    [73.7525, 18.3680],
                ],
                baselineDifficulty: 1.4,
                slopeGradient: 1.5,
                maxSafeFootfall: 300,
                currentFootfall: 65,
                currentRiskScore: 32,
                status: "open",
                distanceKm: 1.1,
                difficulty: "moderate",
                description: "Perimeter rampart walk with panoramic valley vistas over the Mutha river basin; exposed drop-offs near the western edge.",
            },
        ]);

        // Sinhagad Cisterns
        await Cistern.create([
            {
                fort: sinhagad._id,
                name: "Dev Taki Rock-Cut Fresh Water Spring",
                location: { name: "Sinhagad Plateau Central Cistern", coordinates: [73.7558, 18.3665] },
                capacityLiters: 60000,
                currentLevelPct: 82,
                overflowThreshold: 90,
                status: "normal",
                nearestTrail: sinhagadTrails[1]._id,
                description: "Celebrated sweet water subterranean cistern naturally fed by underground springs, offering cold potable drinking water year-round.",
            },
            {
                fort: sinhagad._id,
                name: "Kalyan Gate Step Tank",
                location: { name: "Kalyan Darwaja Foot", coordinates: [73.7540, 18.3642] },
                capacityLiters: 30000,
                currentLevelPct: 65,
                overflowThreshold: 85,
                status: "normal",
                nearestTrail: sinhagadTrails[0]._id,
                description: "Ancient stone stepped tank positioned just inside the outer gate bastion for military sentries and pilgrims.",
            },
        ]);

        const fortCount = await Fort.countDocuments();
        const trailCount = await Trail.countDocuments();
        const cisternCount = await Cistern.countDocuments();

        console.log("\n==========================================");
        console.log("  FortFlux Sahyadri Seed Complete! ");
        console.log("==========================================");
        console.log(`🏰 Forts seeded:    ${fortCount}`);
        console.log(`🥾 Trails seeded:   ${trailCount}`);
        console.log(`💧 Cisterns seeded: ${cisternCount}`);
        console.log("==========================================\n");

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

seedData();
