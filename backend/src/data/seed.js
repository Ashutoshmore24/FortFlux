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

        // ═══════════════════════════════════════════════════════════════
        //  PUNE DISTRICT — Sahyadri Heartland
        // ═══════════════════════════════════════════════════════════════

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
            region: "Sahyadri — Deccan",
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

        const rajgadTrails = await Trail.create([
            {
                fort: rajgad._id,
                name: "Gunjavane to Chor Darwaja",
                slug: "gunjavane-to-chor-darwaja",
                startPoint: { name: "Gunjavane Base Village", coordinates: [73.6872, 18.2421] },
                endPoint: { name: "Chor Darwaja (Secret Gate)", coordinates: [73.6845, 18.2448] },
                path: [[73.6872, 18.2421], [73.6865, 18.2430], [73.6858, 18.2439], [73.6845, 18.2448]],
                baselineDifficulty: 1.4, slopeGradient: 1.4, maxSafeFootfall: 450,
                currentFootfall: 120, currentRiskScore: 28, status: "open",
                distanceKm: 3.2, difficulty: "moderate",
                description: "Steep scree-slope trail climbing from the northeast village through rocky gullies with exposed steel railings near Chor Darwaja.",
            },
            {
                fort: rajgad._id,
                name: "Chor Darwaja to Padmavati Machi",
                slug: "chor-darwaja-to-padmavati-machi",
                startPoint: { name: "Chor Darwaja", coordinates: [73.6845, 18.2448] },
                endPoint: { name: "Padmavati Temple Complex", coordinates: [73.6829, 18.2462] },
                path: [[73.6845, 18.2448], [73.6838, 18.2455], [73.6829, 18.2462]],
                baselineDifficulty: 1.1, slopeGradient: 1.1, maxSafeFootfall: 650,
                currentFootfall: 140, currentRiskScore: 12, status: "open",
                distanceKm: 0.8, difficulty: "easy",
                description: "Gentle ascending paved trail winding along the outer fortification curtain wall directly onto the central plateau.",
            },
            {
                fort: rajgad._id,
                name: "Padmavati Machi to Balekilla",
                slug: "padmavati-machi-to-balekilla",
                startPoint: { name: "Padmavati Machi Base", coordinates: [73.6829, 18.2462] },
                endPoint: { name: "Balekilla Maha Darwaja", coordinates: [73.6815, 18.2452] },
                path: [[73.6829, 18.2462], [73.6822, 18.2458], [73.6818, 18.2455], [73.6815, 18.2452]],
                baselineDifficulty: 1.7, slopeGradient: 1.8, maxSafeFootfall: 200,
                currentFootfall: 45, currentRiskScore: 42, status: "open",
                distanceKm: 1.1, difficulty: "hard",
                description: "Very steep 70-degree rock cut stairway with sheer drops. High slippage hazard during rain.",
            },
            {
                fort: rajgad._id,
                name: "Padmavati Machi to Suvela Machi",
                slug: "padmavati-machi-to-suvela-machi",
                startPoint: { name: "Padmavati Temple", coordinates: [73.6829, 18.2462] },
                endPoint: { name: "Suvela Bastion Entrance", coordinates: [73.6860, 18.2475] },
                path: [[73.6829, 18.2462], [73.6842, 18.2469], [73.6860, 18.2475]],
                baselineDifficulty: 1.5, slopeGradient: 1.4, maxSafeFootfall: 350,
                currentFootfall: 80, currentRiskScore: 24, status: "open",
                distanceKm: 1.5, difficulty: "moderate",
                description: "Traverses along the northeastern rim past ancient stone granaries toward the prominent Nedhe rock eyelet.",
            },
            {
                fort: rajgad._id,
                name: "Suvela Machi Ridge Path",
                slug: "suvela-machi-ridge-path",
                startPoint: { name: "Nedhe Natural Needle", coordinates: [73.6875, 18.2482] },
                endPoint: { name: "Kaman Bastion Tip", coordinates: [73.6912, 18.2490] },
                path: [[73.6875, 18.2482], [73.6890, 18.2486], [73.6912, 18.2490]],
                baselineDifficulty: 1.9, slopeGradient: 1.8, maxSafeFootfall: 150,
                currentFootfall: 20, currentRiskScore: 55, status: "caution",
                distanceKm: 1.2, difficulty: "extreme",
                description: "Narrow exposed knife-edge ridge walk with 500m drops on both sides. High crosswinds and rockfall risk.",
            },
            {
                fort: rajgad._id,
                name: "Pali Gate Stairway",
                slug: "pali-gate-stairway",
                startPoint: { name: "Pali Village Base", coordinates: [73.6740, 18.2435] },
                endPoint: { name: "Pali Darwaja Gate", coordinates: [73.6795, 18.2450] },
                path: [[73.6740, 18.2435], [73.6765, 18.2442], [73.6795, 18.2450]],
                baselineDifficulty: 1.2, slopeGradient: 1.3, maxSafeFootfall: 600,
                currentFootfall: 95, currentRiskScore: 18, status: "open",
                distanceKm: 2.7, difficulty: "moderate",
                description: "The royal historic gateway trail paved with wide stone steps. Suitable for larger trekking groups.",
            },
        ]);

        await Cistern.create([
            {
                fort: rajgad._id, name: "Padmavati Lake Cistern",
                location: { name: "Padmavati Machi", coordinates: [73.6831, 18.2464] },
                capacityLiters: 50000, currentLevelPct: 62, overflowThreshold: 85, status: "normal",
                nearestTrail: rajgadTrails[1]._id,
                description: "Primary perennial reservoir feeding the administrative hub. Filtered by natural volcanic basalt layers.",
            },
            {
                fort: rajgad._id, name: "Balekilla Summit Cistern",
                location: { name: "Balekilla Apex", coordinates: [73.6814, 18.2451] },
                capacityLiters: 15000, currentLevelPct: 40, overflowThreshold: 80, status: "normal",
                nearestTrail: rajgadTrails[2]._id,
                description: "High-altitude rock-cut water cistern designed to sustain citadel occupants during prolonged sieges.",
            },
            {
                fort: rajgad._id, name: "Pali Gate Rock-Cut Cistern #3",
                location: { name: "Near Pali Darwaja Inner Court", coordinates: [73.6798, 18.2453] },
                capacityLiters: 25000, currentLevelPct: 75, overflowThreshold: 90, status: "normal",
                nearestTrail: rajgadTrails[5]._id,
                description: "Deep subterranean rock cistern carved into the basalt bedrock alongside the royal entry gate.",
            },
        ]);

        // ─────────────────────────────────────────────────────────────
        // 2. TORNA FORT (Prachandgad — The First Swarajya Fort)
        // ─────────────────────────────────────────────────────────────
        const torna = await Fort.create({
            name: "Torna Fort",
            slug: "torna",
            location: { type: "Point", coordinates: [73.6227, 18.2761] },
            elevation: 1403,
            region: "Sahyadri — Deccan",
            district: "Pune",
            baseVillage: "Velhe",
            description: "The first fort captured by Shivaji Maharaj in 1646 at age 16. Named 'Prachandgad' (Huge Fort) due to its vast perimeter, Torna stands as the tallest fort in Pune district.",
            imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
            sections: [
                { name: "Zunjar Machi", description: "Spectacular knife-edge western spur with fortified bastions suspended over sheer cliffs." },
                { name: "Budhla Machi", description: "Eastern ridge resembling an overturned vessel, fortified with secret escape tunnels." },
                { name: "Menghai Temple Complex", description: "Centrally situated temple and open plateau sheltering ancient rock-cut water tanks." },
            ],
        });

        const tornaTrails = await Trail.create([
            {
                fort: torna._id, name: "Velhe Base to Bidi Darwaja", slug: "velhe-base-to-bidi-darwaja",
                startPoint: { name: "Velhe Village Trailhead", coordinates: [73.6350, 18.2780] },
                endPoint: { name: "Bidi Darwaja Outer Gate", coordinates: [73.6265, 18.2770] },
                path: [[73.6350, 18.2780], [73.6310, 18.2775], [73.6265, 18.2770]],
                baselineDifficulty: 1.5, slopeGradient: 1.6, maxSafeFootfall: 400,
                currentFootfall: 75, currentRiskScore: 30, status: "open",
                distanceKm: 4.1, difficulty: "hard",
                description: "Continuous steep climb through thorn forest and basalt rock gullies exposed to strong afternoon heat.",
            },
            {
                fort: torna._id, name: "Bidi Darwaja to Menghai Temple", slug: "bidi-darwaja-to-menghai-temple",
                startPoint: { name: "Bidi Darwaja Gate", coordinates: [73.6265, 18.2770] },
                endPoint: { name: "Menghai Goddess Shrine", coordinates: [73.6235, 18.2762] },
                path: [[73.6265, 18.2770], [73.6250, 18.2766], [73.6235, 18.2762]],
                baselineDifficulty: 1.1, slopeGradient: 1.1, maxSafeFootfall: 500,
                currentFootfall: 60, currentRiskScore: 10, status: "open",
                distanceKm: 0.9, difficulty: "easy",
                description: "Leveled walkway traversing across the interior fort plateau connecting the gate to the temple settlement.",
            },
            {
                fort: torna._id, name: "Menghai Temple to Zunjar Machi Ridge", slug: "menghai-temple-to-zunjar-machi-ridge",
                startPoint: { name: "Menghai Temple", coordinates: [73.6235, 18.2762] },
                endPoint: { name: "Zunjar Machi Extreme Point", coordinates: [73.6140, 18.2745] },
                path: [[73.6235, 18.2762], [73.6190, 18.2752], [73.6140, 18.2745]],
                baselineDifficulty: 1.8, slopeGradient: 1.9, maxSafeFootfall: 120,
                currentFootfall: 15, currentRiskScore: 50, status: "caution",
                distanceKm: 1.6, difficulty: "extreme",
                description: "Demanding technical ridge with vertical rock ladders, intense gale winds, and cliffside drops.",
            },
            {
                fort: torna._id, name: "Central Plateau to Budhla Machi", slug: "central-plateau-to-budhla-machi",
                startPoint: { name: "Kothi Building", coordinates: [73.6240, 18.2764] },
                endPoint: { name: "Budhla Machi Fortification", coordinates: [73.6295, 18.2758] },
                path: [[73.6240, 18.2764], [73.6270, 18.2760], [73.6295, 18.2758]],
                baselineDifficulty: 1.4, slopeGradient: 1.5, maxSafeFootfall: 250,
                currentFootfall: 35, currentRiskScore: 22, status: "open",
                distanceKm: 1.3, difficulty: "moderate",
                description: "Eastern spur route flanked by rock ramparts and scenic valley overlooks toward Rajgad.",
            },
        ]);

        await Cistern.create([
            {
                fort: torna._id, name: "Menghai Sacred Tank",
                location: { name: "Adjacent to Menghai Temple", coordinates: [73.6238, 18.2763] },
                capacityLiters: 40000, currentLevelPct: 70, overflowThreshold: 85, status: "normal",
                nearestTrail: tornaTrails[1]._id,
                description: "Sacred perennial water storage facility at the spiritual core of Torna.",
            },
            {
                fort: torna._id, name: "Budhla Ridge Rock Cistern",
                location: { name: "Budhla Machi Neck", coordinates: [73.6288, 18.2759] },
                capacityLiters: 20000, currentLevelPct: 55, overflowThreshold: 80, status: "normal",
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
            location: { type: "Point", coordinates: [73.7556, 18.3667] },
            elevation: 1312,
            region: "Sahyadri — Deccan",
            district: "Pune",
            baseVillage: "Atkarwadi",
            description: "Immortalized by the legendary 1670 battle led by Tanaji Malusare. Perched atop an isolated cliff of the Bhuleshwar range, commanding scenic views over the Khadakwasla Dam reservoir.",
            imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
            sections: [
                { name: "Tanaji Malusare Samadhi", description: "Memorial dedicated to the warrior Tanaji Malusare and his heroic conquest of Kondhana." },
                { name: "Kalyan Darwaja", description: "Southwestern double-bastioned military entrance approached from Atkarwadi." },
                { name: "Pune Darwaja", description: "Northeastern primary ceremonial gate facing Pune city." },
                { name: "KadeLot Precipice", description: "Sheer vertical cliff on the western rampart." },
            ],
        });

        const sinhagadTrails = await Trail.create([
            {
                fort: sinhagad._id, name: "Atkarwadi Base to Kalyan Darwaja", slug: "atkarwadi-base-to-kalyan-darwaja",
                startPoint: { name: "Atkarwadi Parking Ground", coordinates: [73.7505, 18.3580] },
                endPoint: { name: "Kalyan Darwaja Gate", coordinates: [73.7538, 18.3645] },
                path: [[73.7505, 18.3580], [73.7518, 18.3610], [73.7538, 18.3645]],
                baselineDifficulty: 1.3, slopeGradient: 1.4, maxSafeFootfall: 800,
                currentFootfall: 210, currentRiskScore: 25, status: "open",
                distanceKm: 2.8, difficulty: "moderate",
                description: "The classic trekker trail from Atkarwadi village. Heavily frequented on weekends; stone steps can get slick when wet.",
            },
            {
                fort: sinhagad._id, name: "Kalyan Darwaja to Tanaji Memorial", slug: "kalyan-darwaja-to-tanaji-memorial",
                startPoint: { name: "Kalyan Darwaja Gate", coordinates: [73.7538, 18.3645] },
                endPoint: { name: "Tanaji Malusare Samadhi", coordinates: [73.7562, 18.3668] },
                path: [[73.7538, 18.3645], [73.7550, 18.3658], [73.7562, 18.3668]],
                baselineDifficulty: 1.0, slopeGradient: 1.1, maxSafeFootfall: 1000,
                currentFootfall: 350, currentRiskScore: 15, status: "open",
                distanceKm: 0.7, difficulty: "easy",
                description: "Flat tourist pathway connecting the southern military gate with the historical memorials and food stalls.",
            },
            {
                fort: sinhagad._id, name: "Tanaji Memorial to Pune Darwaja", slug: "tanaji-memorial-to-pune-darwaja",
                startPoint: { name: "Tanaji Memorial", coordinates: [73.7562, 18.3668] },
                endPoint: { name: "Pune Darwaja Triple Gate", coordinates: [73.7580, 18.3685] },
                path: [[73.7562, 18.3668], [73.7570, 18.3678], [73.7580, 18.3685]],
                baselineDifficulty: 1.1, slopeGradient: 1.1, maxSafeFootfall: 900,
                currentFootfall: 180, currentRiskScore: 10, status: "open",
                distanceKm: 0.6, difficulty: "easy",
                description: "Paved route leading toward the three-tiered northern defensive gateway facing Pune city.",
            },
            {
                fort: sinhagad._id, name: "Pune Darwaja to KadeLot Precipice", slug: "pune-darwaja-to-kadelot-precipice",
                startPoint: { name: "Pune Darwaja Upper Terrace", coordinates: [73.7580, 18.3685] },
                endPoint: { name: "KadeLot Cliff Edge", coordinates: [73.7525, 18.3680] },
                path: [[73.7580, 18.3685], [73.7550, 18.3682], [73.7525, 18.3680]],
                baselineDifficulty: 1.4, slopeGradient: 1.5, maxSafeFootfall: 300,
                currentFootfall: 65, currentRiskScore: 32, status: "open",
                distanceKm: 1.1, difficulty: "moderate",
                description: "Perimeter rampart walk with panoramic valley vistas over the Mutha river basin; exposed drop-offs near the western edge.",
            },
        ]);

        await Cistern.create([
            {
                fort: sinhagad._id, name: "Dev Taki Fresh Water Spring",
                location: { name: "Sinhagad Plateau Central", coordinates: [73.7558, 18.3665] },
                capacityLiters: 60000, currentLevelPct: 82, overflowThreshold: 90, status: "normal",
                nearestTrail: sinhagadTrails[1]._id,
                description: "Celebrated sweet water subterranean cistern naturally fed by underground springs, offering cold potable water year-round.",
            },
            {
                fort: sinhagad._id, name: "Kalyan Gate Step Tank",
                location: { name: "Kalyan Darwaja Foot", coordinates: [73.7540, 18.3642] },
                capacityLiters: 30000, currentLevelPct: 65, overflowThreshold: 85, status: "normal",
                nearestTrail: sinhagadTrails[0]._id,
                description: "Ancient stone stepped tank positioned just inside the outer gate bastion.",
            },
        ]);

        // ─────────────────────────────────────────────────────────────
        // 4. PURANDAR FORT (Treaty Fort)
        // ─────────────────────────────────────────────────────────────
        const purandar = await Fort.create({
            name: "Purandar Fort",
            slug: "purandar",
            location: { type: "Point", coordinates: [73.9830, 18.2765] },
            elevation: 1387,
            region: "Sahyadri — Deccan",
            district: "Pune",
            baseVillage: "Narayanpur",
            description: "Birthplace of Sambhaji Maharaj and site of the historic Treaty of Purandar (1665) between the Marathas and the Mughals. A twin-fort complex with Vajragad (Rudramal) as its companion.",
            imageUrl: "",
            sections: [
                { name: "Purandar Machi", description: "Main fortified plateau with temples and garrison quarters." },
                { name: "Vajragad (Rudramal)", description: "Smaller companion fort connected by a saddle ridge, used as an ammunition depot." },
                { name: "Kedareshwar Temple", description: "Ancient Shiva temple on the upper citadel." },
            ],
        });

        const purandarTrails = await Trail.create([
            {
                fort: purandar._id, name: "Narayanpur to Dilli Darwaja", slug: "narayanpur-to-dilli-darwaja",
                startPoint: { name: "Narayanpur Village", coordinates: [73.9810, 18.2700] },
                endPoint: { name: "Dilli Darwaja Gate", coordinates: [73.9825, 18.2740] },
                path: [[73.9810, 18.2700], [73.9818, 18.2720], [73.9825, 18.2740]],
                baselineDifficulty: 1.3, slopeGradient: 1.4, maxSafeFootfall: 500,
                currentFootfall: 85, currentRiskScore: 20, status: "open",
                distanceKm: 2.5, difficulty: "moderate",
                description: "Standard approach route from the base village through a forested incline to the main gate.",
            },
            {
                fort: purandar._id, name: "Purandar Machi to Kedareshwar", slug: "purandar-machi-to-kedareshwar",
                startPoint: { name: "Purandar Machi Plateau", coordinates: [73.9830, 18.2760] },
                endPoint: { name: "Kedareshwar Temple Summit", coordinates: [73.9835, 18.2790] },
                path: [[73.9830, 18.2760], [73.9832, 18.2775], [73.9835, 18.2790]],
                baselineDifficulty: 1.5, slopeGradient: 1.6, maxSafeFootfall: 300,
                currentFootfall: 40, currentRiskScore: 22, status: "open",
                distanceKm: 1.0, difficulty: "moderate",
                description: "Steep ascent from the machi to the upper citadel housing the Kedareshwar temple.",
            },
            {
                fort: purandar._id, name: "Purandar to Vajragad Saddle", slug: "purandar-to-vajragad-saddle",
                startPoint: { name: "Purandar South Bastion", coordinates: [73.9828, 18.2755] },
                endPoint: { name: "Vajragad Entrance", coordinates: [73.9850, 18.2735] },
                path: [[73.9828, 18.2755], [73.9840, 18.2745], [73.9850, 18.2735]],
                baselineDifficulty: 1.6, slopeGradient: 1.5, maxSafeFootfall: 200,
                currentFootfall: 25, currentRiskScore: 30, status: "open",
                distanceKm: 0.8, difficulty: "hard",
                description: "Exposed saddle traverse connecting the twin forts with steep drops on both sides.",
            },
        ]);

        await Cistern.create([
            {
                fort: purandar._id, name: "Purandar Machi Tank",
                location: { name: "Central Machi", coordinates: [73.9831, 18.2762] },
                capacityLiters: 35000, currentLevelPct: 58, overflowThreshold: 85, status: "normal",
                nearestTrail: purandarTrails[1]._id,
                description: "Main water supply tank on the fortified machi, historically sustaining the garrison during sieges.",
            },
        ]);

        // ─────────────────────────────────────────────────────────────
        // 5. LOHAGAD FORT (The Iron Fort)
        // ─────────────────────────────────────────────────────────────
        const lohagad = await Fort.create({
            name: "Lohagad Fort",
            slug: "lohagad",
            location: { type: "Point", coordinates: [73.4730, 18.7090] },
            elevation: 1033,
            region: "Sahyadri — Deccan",
            district: "Pune",
            baseVillage: "Malavli",
            description: "One of the most popular trekking forts near Lonavala, known for its four fortified gates — Ganesh, Narayan, Hanuman, and Maha Darwaja. The Vinchukata (Scorpion's Tail) is a dramatic narrow ridge extending from the main fort.",
            imageUrl: "",
            sections: [
                { name: "Vinchukata", description: "A narrow tongue-shaped ridge protruding northward, resembling a scorpion's tail." },
                { name: "Laxmi Kothi", description: "Treasure house used by Shivaji Maharaj to store taxes collected from the Konkan trade routes." },
                { name: "Maha Darwaja", description: "The grand main entrance gate with intricate fortification design." },
            ],
        });

        const lohagadTrails = await Trail.create([
            {
                fort: lohagad._id, name: "Malavli Station to Lohagad Entrance", slug: "malavli-to-lohagad-entrance",
                startPoint: { name: "Malavli Railway Station", coordinates: [73.4680, 18.7120] },
                endPoint: { name: "Ganesh Darwaja Base", coordinates: [73.4710, 18.7100] },
                path: [[73.4680, 18.7120], [73.4695, 18.7110], [73.4710, 18.7100]],
                baselineDifficulty: 1.1, slopeGradient: 1.2, maxSafeFootfall: 700,
                currentFootfall: 250, currentRiskScore: 18, status: "open",
                distanceKm: 3.5, difficulty: "easy",
                description: "Well-paved approach from Malavli station through paddy fields and the village settlement. Monsoon route can get muddy.",
            },
            {
                fort: lohagad._id, name: "Four Gates Ascent", slug: "four-gates-ascent",
                startPoint: { name: "Ganesh Darwaja", coordinates: [73.4710, 18.7100] },
                endPoint: { name: "Maha Darwaja (Top)", coordinates: [73.4730, 18.7088] },
                path: [[73.4710, 18.7100], [73.4720, 18.7094], [73.4730, 18.7088]],
                baselineDifficulty: 1.4, slopeGradient: 1.5, maxSafeFootfall: 500,
                currentFootfall: 200, currentRiskScore: 28, status: "open",
                distanceKm: 0.9, difficulty: "moderate",
                description: "Sequential ascent through four fortified gateways — Ganesh, Narayan, Hanuman, and Maha Darwaja.",
            },
            {
                fort: lohagad._id, name: "Main Fort to Vinchukata", slug: "main-fort-to-vinchukata",
                startPoint: { name: "Laxmi Kothi Area", coordinates: [73.4730, 18.7088] },
                endPoint: { name: "Vinchukata Tip", coordinates: [73.4755, 18.7115] },
                path: [[73.4730, 18.7088], [73.4742, 18.7100], [73.4755, 18.7115]],
                baselineDifficulty: 1.7, slopeGradient: 1.6, maxSafeFootfall: 150,
                currentFootfall: 40, currentRiskScore: 45, status: "caution",
                distanceKm: 0.6, difficulty: "hard",
                description: "Narrow ridge walk along the Scorpion's Tail with precipitous drops on both sides. Extremely dangerous in rain.",
            },
        ]);

        await Cistern.create([
            {
                fort: lohagad._id, name: "Lohagad Plateau Cistern",
                location: { name: "Near Laxmi Kothi", coordinates: [73.4732, 18.7090] },
                capacityLiters: 28000, currentLevelPct: 72, overflowThreshold: 85, status: "normal",
                nearestTrail: lohagadTrails[1]._id,
                description: "Rock-cut cistern on the main plateau providing water to the garrison quarters.",
            },
        ]);

        // ─────────────────────────────────────────────────────────────
        // 6. VISAPUR FORT (Twin of Lohagad)
        // ─────────────────────────────────────────────────────────────
        const visapur = await Fort.create({
            name: "Visapur Fort",
            slug: "visapur",
            location: { type: "Point", coordinates: [73.4907, 18.7195] },
            elevation: 1084,
            region: "Sahyadri — Deccan",
            district: "Pune",
            baseVillage: "Malavli",
            description: "The larger and higher twin of Lohagad fort. Offers vast open plateau with multiple rock-cut cisterns, cave shelters, and panoramic 360-degree views of the Sahyadri ranges including Tikona and Tung.",
            imageUrl: "",
            sections: [
                { name: "Upper Plateau", description: "Expansive open summit with scattered ruins and rock-cut water tanks." },
                { name: "Peth Settlement", description: "Remnants of the fortified settlement on the southern approach." },
            ],
        });

        const visapurTrails = await Trail.create([
            {
                fort: visapur._id, name: "Malavli to Visapur via Peth", slug: "malavli-to-visapur-via-peth",
                startPoint: { name: "Malavli Crossroads", coordinates: [73.4680, 18.7120] },
                endPoint: { name: "Visapur Peth Gate", coordinates: [73.4890, 18.7180] },
                path: [[73.4680, 18.7120], [73.4780, 18.7150], [73.4890, 18.7180]],
                baselineDifficulty: 1.5, slopeGradient: 1.6, maxSafeFootfall: 400,
                currentFootfall: 90, currentRiskScore: 30, status: "open",
                distanceKm: 4.0, difficulty: "hard",
                description: "Steep, less-maintained trail through dense forest. More challenging than the Lohagad approach.",
            },
            {
                fort: visapur._id, name: "Peth Gate to Summit Plateau", slug: "peth-gate-to-summit-plateau",
                startPoint: { name: "Visapur Peth Gate", coordinates: [73.4890, 18.7180] },
                endPoint: { name: "Summit Cistern Area", coordinates: [73.4907, 18.7195] },
                path: [[73.4890, 18.7180], [73.4898, 18.7188], [73.4907, 18.7195]],
                baselineDifficulty: 1.3, slopeGradient: 1.3, maxSafeFootfall: 500,
                currentFootfall: 65, currentRiskScore: 15, status: "open",
                distanceKm: 0.7, difficulty: "moderate",
                description: "Final ascent through ruined fortification walls onto the open plateau.",
            },
        ]);

        await Cistern.create([
            {
                fort: visapur._id, name: "Visapur Summit Tank",
                location: { name: "Upper Plateau", coordinates: [73.4905, 18.7193] },
                capacityLiters: 45000, currentLevelPct: 78, overflowThreshold: 85, status: "normal",
                nearestTrail: visapurTrails[1]._id,
                description: "Large rock-cut rainwater harvesting cistern on the open summit. One of the largest on any Sahyadri fort.",
            },
        ]);

        // ─────────────────────────────────────────────────────────────
        // 7. TIKONA FORT (The Triangular Pyramid)
        // ─────────────────────────────────────────────────────────────
        const tikona = await Fort.create({
            name: "Tikona Fort",
            slug: "tikona",
            location: { type: "Point", coordinates: [73.4970, 18.6523] },
            elevation: 1066,
            region: "Sahyadri — Deccan",
            district: "Pune",
            baseVillage: "Tikona Peth",
            description: "A triangular pyramid-shaped hill fort guarding the Pawna valley. Known for its steep rock-cut steps and the Trimbakeshwar Mahadev temple at the summit. Offers spectacular views of Pawna Lake.",
            imageUrl: "",
            sections: [
                { name: "Trimbakeshwar Temple", description: "Ancient Shiva temple on the summit plateau." },
                { name: "Tikona Peth", description: "Base settlement with historical marketplace ruins." },
            ],
        });

        const tikonaTrails = await Trail.create([
            {
                fort: tikona._id, name: "Tikona Peth to Summit", slug: "tikona-peth-to-summit",
                startPoint: { name: "Tikona Peth Base", coordinates: [73.4950, 18.6490] },
                endPoint: { name: "Tikona Summit Gate", coordinates: [73.4970, 18.6523] },
                path: [[73.4950, 18.6490], [73.4960, 18.6505], [73.4970, 18.6523]],
                baselineDifficulty: 1.5, slopeGradient: 1.7, maxSafeFootfall: 350,
                currentFootfall: 110, currentRiskScore: 35, status: "open",
                distanceKm: 1.8, difficulty: "hard",
                description: "Short but very steep climb up the pyramidal face with rock-cut steps. The final rock patch requires hand-climbing.",
            },
        ]);

        await Cistern.create([
            {
                fort: tikona._id, name: "Tikona Summit Water Tank",
                location: { name: "Near Trimbakeshwar Temple", coordinates: [73.4968, 18.6520] },
                capacityLiters: 18000, currentLevelPct: 65, overflowThreshold: 80, status: "normal",
                nearestTrail: tikonaTrails[0]._id,
                description: "Rock-cut rainwater cistern supplying the summit temple complex.",
            },
        ]);

        // ═══════════════════════════════════════════════════════════════
        //  RAIGAD DISTRICT — The Maratha Capital
        // ═══════════════════════════════════════════════════════════════

        // ─────────────────────────────────────────────────────────────
        // 8. RAIGAD FORT (Capital of the Maratha Empire)
        // ─────────────────────────────────────────────────────────────
        const raigad = await Fort.create({
            name: "Raigad Fort",
            slug: "raigad",
            location: { type: "Point", coordinates: [73.4474, 18.2345] },
            elevation: 820,
            region: "Sahyadri — Konkan",
            district: "Raigad",
            baseVillage: "Pachad",
            description: "The final and most fortified capital of the Maratha Empire where Chhatrapati Shivaji Maharaj was crowned in 1674. Features the iconic Hirakani Buruj bastion, Maha Darwaja, royal palace ruins, and Jagdishwar temple.",
            imageUrl: "",
            sections: [
                { name: "Maha Darwaja", description: "Grand entrance gate with intricate defensive architecture and elephant-proof doors." },
                { name: "Rajya Sabha Hall", description: "Court hall where Shivaji Maharaj held council — one of the largest on any Deccan fort." },
                { name: "Hirakani Buruj", description: "The famous bastion named after the legendary woman who descended the sheer cliff at night." },
                { name: "Takmak Tok", description: "Execution point — a vertical cliff used as a punishment drop for traitors." },
                { name: "Jagdishwar Temple", description: "Royal temple dedicated to Lord Shiva, adjacent to Shivaji Maharaj's samadhi." },
            ],
        });

        const raigadTrails = await Trail.create([
            {
                fort: raigad._id, name: "Pachad to Maha Darwaja (Steps Route)", slug: "pachad-to-maha-darwaja",
                startPoint: { name: "Pachad Base Village", coordinates: [73.4490, 18.2280] },
                endPoint: { name: "Maha Darwaja Grand Gate", coordinates: [73.4478, 18.2330] },
                path: [[73.4490, 18.2280], [73.4485, 18.2305], [73.4478, 18.2330]],
                baselineDifficulty: 1.3, slopeGradient: 1.5, maxSafeFootfall: 600,
                currentFootfall: 180, currentRiskScore: 22, status: "open",
                distanceKm: 2.8, difficulty: "moderate",
                description: "The historic 1400+ step staircase ascending through fortified gateways. Now also accessible via ropeway.",
            },
            {
                fort: raigad._id, name: "Maha Darwaja to Rajya Sabha", slug: "maha-darwaja-to-rajya-sabha",
                startPoint: { name: "Maha Darwaja Inner Court", coordinates: [73.4478, 18.2330] },
                endPoint: { name: "Rajya Sabha Court Hall", coordinates: [73.4470, 18.2350] },
                path: [[73.4478, 18.2330], [73.4474, 18.2340], [73.4470, 18.2350]],
                baselineDifficulty: 1.0, slopeGradient: 1.0, maxSafeFootfall: 800,
                currentFootfall: 300, currentRiskScore: 8, status: "open",
                distanceKm: 0.5, difficulty: "easy",
                description: "Paved royal walkway from the main gate through the bazaar marketplace to the court hall.",
            },
            {
                fort: raigad._id, name: "Rajya Sabha to Takmak Tok", slug: "rajya-sabha-to-takmak-tok",
                startPoint: { name: "Rajya Sabha Ruins", coordinates: [73.4470, 18.2350] },
                endPoint: { name: "Takmak Tok Cliff Edge", coordinates: [73.4455, 18.2360] },
                path: [[73.4470, 18.2350], [73.4462, 18.2355], [73.4455, 18.2360]],
                baselineDifficulty: 1.3, slopeGradient: 1.2, maxSafeFootfall: 400,
                currentFootfall: 100, currentRiskScore: 18, status: "open",
                distanceKm: 0.6, difficulty: "moderate",
                description: "Path along the northern rampart to the cliff overlook. Fenced but caution required near the edge.",
            },
        ]);

        await Cistern.create([
            {
                fort: raigad._id, name: "Gangasagar Lake",
                location: { name: "Central Raigad Plateau", coordinates: [73.4472, 18.2348] },
                capacityLiters: 120000, currentLevelPct: 75, overflowThreshold: 90, status: "normal",
                nearestTrail: raigadTrails[1]._id,
                description: "Massive royal reservoir — the primary freshwater source for the entire fort, designed to sustain the capital during extended sieges.",
            },
            {
                fort: raigad._id, name: "Hirakani Step Well",
                location: { name: "Near Hirakani Buruj", coordinates: [73.4460, 18.2342] },
                capacityLiters: 30000, currentLevelPct: 60, overflowThreshold: 85, status: "normal",
                nearestTrail: raigadTrails[2]._id,
                description: "Stepped well carved into the basalt near the famous bastion, accessible via spiral stone steps.",
            },
        ]);

        // ═══════════════════════════════════════════════════════════════
        //  SATARA DISTRICT — Southern Sahyadri
        // ═══════════════════════════════════════════════════════════════

        // ─────────────────────────────────────────────────────────────
        // 9. PRATAPGAD FORT (Fort of Valour)
        // ─────────────────────────────────────────────────────────────
        const pratapgad = await Fort.create({
            name: "Pratapgad Fort",
            slug: "pratapgad",
            location: { type: "Point", coordinates: [73.5780, 17.9335] },
            elevation: 1080,
            region: "Sahyadri — Deccan",
            district: "Satara",
            baseVillage: "Par",
            description: "Site of the legendary Battle of Pratapgad (1659) where Shivaji Maharaj defeated Afzal Khan. Features an upper and lower fort with a prominent statue of Shivaji Maharaj erected by Nehru.",
            imageUrl: "",
            sections: [
                { name: "Upper Fort (Balekilla)", description: "The higher citadel with the Mahadev temple and commanding views of the Krishna valley." },
                { name: "Lower Fort (Machi)", description: "Expansive fortified area with bastions, gateways, and Afzal Khan's tomb." },
                { name: "Afzal Buruj", description: "The bastion where the fateful meeting between Shivaji and Afzal Khan took place." },
            ],
        });

        const pratapgadTrails = await Trail.create([
            {
                fort: pratapgad._id, name: "Par Village to Pratapgad Gate", slug: "par-to-pratapgad-gate",
                startPoint: { name: "Par Village Trailhead", coordinates: [73.5750, 17.9310] },
                endPoint: { name: "Pratapgad Main Gate", coordinates: [73.5770, 17.9330] },
                path: [[73.5750, 17.9310], [73.5760, 17.9320], [73.5770, 17.9330]],
                baselineDifficulty: 1.2, slopeGradient: 1.3, maxSafeFootfall: 600,
                currentFootfall: 150, currentRiskScore: 15, status: "open",
                distanceKm: 1.5, difficulty: "easy",
                description: "Well-maintained steps and paved road accessible by vehicle to a parking lot, then a short climb.",
            },
            {
                fort: pratapgad._id, name: "Lower Fort to Upper Citadel", slug: "lower-fort-to-upper-citadel",
                startPoint: { name: "Afzal Khan Tomb", coordinates: [73.5775, 17.9332] },
                endPoint: { name: "Mahadev Temple Summit", coordinates: [73.5780, 17.9340] },
                path: [[73.5775, 17.9332], [73.5778, 17.9336], [73.5780, 17.9340]],
                baselineDifficulty: 1.4, slopeGradient: 1.5, maxSafeFootfall: 400,
                currentFootfall: 100, currentRiskScore: 20, status: "open",
                distanceKm: 0.4, difficulty: "moderate",
                description: "Steep stone stairway from the lower fortification to the upper citadel. Narrow passages.",
            },
        ]);

        await Cistern.create([
            {
                fort: pratapgad._id, name: "Pratapgad Machi Tank",
                location: { name: "Lower Fort Central", coordinates: [73.5776, 17.9333] },
                capacityLiters: 32000, currentLevelPct: 68, overflowThreshold: 85, status: "normal",
                nearestTrail: pratapgadTrails[1]._id,
                description: "Historic water tank on the lower machi, replenished by monsoon rains channeled through the fortification walls.",
            },
        ]);

        // ─────────────────────────────────────────────────────────────
        // 10. AJINKYATARA FORT (The Invincible Star)
        // ─────────────────────────────────────────────────────────────
        const ajinkyatara = await Fort.create({
            name: "Ajinkyatara Fort",
            slug: "ajinkyatara",
            location: { type: "Point", coordinates: [73.8534, 17.6783] },
            elevation: 975,
            region: "Sahyadri — Deccan",
            district: "Satara",
            baseVillage: "Satara City",
            description: "Strategically located overlooking Satara city, this fort was a key military asset controlling the Krishna valley trade routes. One of the seven forts surrounding Satara, it served as the seat of the Satara Chhatrapatis.",
            imageUrl: "",
            sections: [
                { name: "TV Tower Plateau", description: "Highest point with modern communications tower and panoramic 360-degree views." },
                { name: "Mangai Devi Temple", description: "Ancient goddess temple on the fortified perimeter." },
            ],
        });

        const ajinkyataraTrails = await Trail.create([
            {
                fort: ajinkyatara._id, name: "Satara City to Ajinkyatara Summit", slug: "satara-to-ajinkyatara-summit",
                startPoint: { name: "Ajinkyatara Base Road", coordinates: [73.8520, 17.6750] },
                endPoint: { name: "Ajinkyatara Summit Gate", coordinates: [73.8534, 17.6783] },
                path: [[73.8520, 17.6750], [73.8527, 17.6766], [73.8534, 17.6783]],
                baselineDifficulty: 1.3, slopeGradient: 1.4, maxSafeFootfall: 500,
                currentFootfall: 130, currentRiskScore: 20, status: "open",
                distanceKm: 2.0, difficulty: "moderate",
                description: "Motorable road up to midpoint, then stone steps to the summit. Popular morning exercise route for Satara residents.",
            },
        ]);

        await Cistern.create([
            {
                fort: ajinkyatara._id, name: "Ajinkyatara Summit Tank",
                location: { name: "Fort Plateau", coordinates: [73.8533, 17.6781] },
                capacityLiters: 22000, currentLevelPct: 50, overflowThreshold: 80, status: "normal",
                nearestTrail: ajinkyataraTrails[0]._id,
                description: "Rock-cut cistern at the summit, historically the main water source for the fort garrison.",
            },
        ]);

        // ═══════════════════════════════════════════════════════════════
        //  KOLHAPUR DISTRICT — Southern Maratha Territory
        // ═══════════════════════════════════════════════════════════════

        // ─────────────────────────────────────────────────────────────
        // 11. PANHALA FORT (The Serpent's Hood)
        // ─────────────────────────────────────────────────────────────
        const panhala = await Fort.create({
            name: "Panhala Fort",
            slug: "panhala",
            location: { type: "Point", coordinates: [74.1081, 16.8119] },
            elevation: 977,
            region: "Sahyadri — Deccan",
            district: "Kolhapur",
            baseVillage: "Panhala Town",
            description: "One of the largest forts in the Deccan with a 14km perimeter. Famous for Shivaji Maharaj's legendary escape during the Siege of Panhala (1660), running through the night to Vishalgad with Baji Prabhu Deshpande's rear-guard sacrifice at Ghod Khind.",
            imageUrl: "",
            sections: [
                { name: "Teen Darwaja", description: "Triple-arched gateway — the iconic architectural symbol of Panhala." },
                { name: "Sajja Kothi", description: "The watchtower from which Shivaji Maharaj surveyed the surrounding terrain." },
                { name: "Ambarkhana", description: "Massive granaries that could store grain for years during siege." },
            ],
        });

        const panhalaTrails = await Trail.create([
            {
                fort: panhala._id, name: "Panhala Town to Teen Darwaja", slug: "panhala-town-to-teen-darwaja",
                startPoint: { name: "Panhala Bus Stand", coordinates: [74.1060, 16.8100] },
                endPoint: { name: "Teen Darwaja Gate", coordinates: [74.1078, 16.8115] },
                path: [[74.1060, 16.8100], [74.1070, 16.8108], [74.1078, 16.8115]],
                baselineDifficulty: 1.0, slopeGradient: 1.1, maxSafeFootfall: 800,
                currentFootfall: 200, currentRiskScore: 8, status: "open",
                distanceKm: 1.0, difficulty: "easy",
                description: "Paved road approach from the town to the famous triple gate. Vehicle accessible.",
            },
            {
                fort: panhala._id, name: "Fort Perimeter Walk", slug: "panhala-perimeter-walk",
                startPoint: { name: "Teen Darwaja", coordinates: [74.1078, 16.8115] },
                endPoint: { name: "Sajja Kothi Watchtower", coordinates: [74.1095, 16.8135] },
                path: [[74.1078, 16.8115], [74.1085, 16.8125], [74.1095, 16.8135]],
                baselineDifficulty: 1.2, slopeGradient: 1.2, maxSafeFootfall: 600,
                currentFootfall: 150, currentRiskScore: 12, status: "open",
                distanceKm: 2.5, difficulty: "easy",
                description: "Scenic walk along the extensive fort ramparts with views of the Kolhapur valley.",
            },
        ]);

        await Cistern.create([
            {
                fort: panhala._id, name: "Panhala Ambarkhana Reservoir",
                location: { name: "Near Ambarkhana Granaries", coordinates: [74.1082, 16.8120] },
                capacityLiters: 80000, currentLevelPct: 70, overflowThreshold: 85, status: "normal",
                nearestTrail: panhalaTrails[1]._id,
                description: "One of the largest fort reservoirs in the Deccan, designed to sustain the massive garrison during prolonged sieges.",
            },
        ]);

        // ═══════════════════════════════════════════════════════════════
        //  NASHIK / AHMEDNAGAR — Northern Sahyadri
        // ═══════════════════════════════════════════════════════════════

        // ─────────────────────────────────────────────────────────────
        // 12. SHIVNERI FORT (Birthplace of Shivaji Maharaj)
        // ─────────────────────────────────────────────────────────────
        const shivneri = await Fort.create({
            name: "Shivneri Fort",
            slug: "shivneri",
            location: { type: "Point", coordinates: [73.8538, 19.2026] },
            elevation: 1000,
            region: "Sahyadri — Deccan",
            district: "Pune (Junnar)",
            baseVillage: "Junnar",
            description: "The birthplace of Chhatrapati Shivaji Maharaj, born here on February 19, 1630. Features seven fortified gates, the Shivai Devi temple, and the Badami Talav — a unique basalt-filtered sweet water tank.",
            imageUrl: "",
            sections: [
                { name: "Shivai Temple", description: "Goddess temple where Jijabai prayed for the safe birth of Shivaji." },
                { name: "Shivaji Birth Chamber", description: "The fortified room where Shivaji Maharaj was born, now a national memorial." },
                { name: "Badami Talav", description: "Natural almond-shaped water reservoir famous for its sweet, mineral-rich water." },
            ],
        });

        const shivneriTrails = await Trail.create([
            {
                fort: shivneri._id, name: "Junnar to Shivneri Seven Gates", slug: "junnar-to-shivneri-gates",
                startPoint: { name: "Junnar Town Base", coordinates: [73.8520, 19.1990] },
                endPoint: { name: "Shivneri Main Gate (7th Gate)", coordinates: [73.8535, 19.2020] },
                path: [[73.8520, 19.1990], [73.8528, 19.2005], [73.8535, 19.2020]],
                baselineDifficulty: 1.3, slopeGradient: 1.4, maxSafeFootfall: 600,
                currentFootfall: 200, currentRiskScore: 20, status: "open",
                distanceKm: 2.5, difficulty: "moderate",
                description: "Sequential ascent through seven fortified gateways with stone steps. Well-maintained as a national monument.",
            },
            {
                fort: shivneri._id, name: "Main Gate to Birth Chamber", slug: "main-gate-to-birth-chamber",
                startPoint: { name: "7th Gate Entrance", coordinates: [73.8535, 19.2020] },
                endPoint: { name: "Shivaji Birth Memorial", coordinates: [73.8538, 19.2030] },
                path: [[73.8535, 19.2020], [73.8537, 19.2025], [73.8538, 19.2030]],
                baselineDifficulty: 1.1, slopeGradient: 1.1, maxSafeFootfall: 700,
                currentFootfall: 250, currentRiskScore: 10, status: "open",
                distanceKm: 0.4, difficulty: "easy",
                description: "Paved walkway from the main gate to the birth chamber memorial and Shivai Devi temple.",
            },
        ]);

        await Cistern.create([
            {
                fort: shivneri._id, name: "Badami Talav",
                location: { name: "Shivneri Fort Plateau", coordinates: [73.8540, 19.2028] },
                capacityLiters: 55000, currentLevelPct: 80, overflowThreshold: 90, status: "normal",
                nearestTrail: shivneriTrails[1]._id,
                description: "Famous almond-shaped natural reservoir with sweet mineral water. One of the most remarkable water systems on any Sahyadri fort.",
            },
        ]);

        // ─────────────────────────────────────────────────────────────
        // 13. HARISHCHANDRAGAD (The Ancient Giant)
        // ─────────────────────────────────────────────────────────────
        const harishchandragad = await Fort.create({
            name: "Harishchandragad",
            slug: "harishchandragad",
            location: { type: "Point", coordinates: [73.7792, 19.3918] },
            elevation: 1424,
            region: "Sahyadri — Deccan",
            district: "Ahmednagar",
            baseVillage: "Khireshwar",
            description: "One of the most ancient and geologically significant forts in the Sahyadri range, dating back to the 6th century. Famous for the awe-inspiring Kokankada cliff — a massive vertical overhang resembling a cobra's hood, offering a 1400m drop into the Konkan valley.",
            imageUrl: "",
            sections: [
                { name: "Kokankada", description: "The iconic concave cliff face — a vertical 1400m overhang offering the most dramatic view in the entire Sahyadri range." },
                { name: "Kedareshwar Cave Temple", description: "Ancient Shiva temple inside a natural cave with a lingam surrounded by waist-deep water." },
                { name: "Taramati Peak", description: "The highest point at 1424m, named after the legendary Harishchandra's queen." },
                { name: "Saptatirtha Pushkarini", description: "Sacred rock-cut water tanks near the Harishchandra temple." },
            ],
        });

        const harishchandragadTrails = await Trail.create([
            {
                fort: harishchandragad._id, name: "Khireshwar to Tolar Khind", slug: "khireshwar-to-tolar-khind",
                startPoint: { name: "Khireshwar Village", coordinates: [73.7720, 19.3850] },
                endPoint: { name: "Tolar Khind Saddle", coordinates: [73.7760, 19.3890] },
                path: [[73.7720, 19.3850], [73.7740, 19.3870], [73.7760, 19.3890]],
                baselineDifficulty: 1.5, slopeGradient: 1.6, maxSafeFootfall: 300,
                currentFootfall: 60, currentRiskScore: 35, status: "open",
                distanceKm: 4.5, difficulty: "hard",
                description: "The most popular approach route through thick forest and rocky terrain. Moderate-to-strenuous ascent.",
            },
            {
                fort: harishchandragad._id, name: "Tolar Khind to Kokankada", slug: "tolar-khind-to-kokankada",
                startPoint: { name: "Tolar Khind Junction", coordinates: [73.7760, 19.3890] },
                endPoint: { name: "Kokankada Cliff Edge", coordinates: [73.7800, 19.3925] },
                path: [[73.7760, 19.3890], [73.7780, 19.3908], [73.7800, 19.3925]],
                baselineDifficulty: 1.6, slopeGradient: 1.5, maxSafeFootfall: 250,
                currentFootfall: 45, currentRiskScore: 40, status: "caution",
                distanceKm: 2.0, difficulty: "hard",
                description: "Ridge traverse to the dramatic Kokankada cliff. Exposed sections with no railings. Extremely dangerous in fog or rain.",
            },
            {
                fort: harishchandragad._id, name: "Nalichi Vaat (Rock Climb Route)", slug: "nalichi-vaat-rock-climb",
                startPoint: { name: "Belpada Village", coordinates: [73.7850, 19.3800] },
                endPoint: { name: "Harishchandreshwar Temple", coordinates: [73.7790, 19.3915] },
                path: [[73.7850, 19.3800], [73.7820, 19.3860], [73.7790, 19.3915]],
                baselineDifficulty: 1.9, slopeGradient: 2.0, maxSafeFootfall: 100,
                currentFootfall: 12, currentRiskScore: 65, status: "caution",
                distanceKm: 3.5, difficulty: "extreme",
                description: "Near-vertical rock climbing route through a steep gorge. Requires ropes in monsoon. Only for experienced climbers.",
            },
        ]);

        await Cistern.create([
            {
                fort: harishchandragad._id, name: "Saptatirtha Pushkarini",
                location: { name: "Near Harishchandra Temple", coordinates: [73.7788, 19.3912] },
                capacityLiters: 40000, currentLevelPct: 85, overflowThreshold: 90, status: "elevated",
                nearestTrail: harishchandragadTrails[2]._id,
                description: "Seven sacred rock-cut water tanks near the ancient temple. Perennially filled by underground springs.",
            },
            {
                fort: harishchandragad._id, name: "Kedareshwar Cave Pool",
                location: { name: "Kedareshwar Temple Cave", coordinates: [73.7795, 19.3920] },
                capacityLiters: 15000, currentLevelPct: 90, overflowThreshold: 95, status: "normal",
                nearestTrail: harishchandragadTrails[1]._id,
                description: "Natural underground spring-fed pool surrounding the Shiva lingam inside the cave temple.",
            },
        ]);

        // ─────────────────────────────────────────────────────────────
        // 14. RAJMACHI FORT (Twin Pinnacles)
        // ─────────────────────────────────────────────────────────────
        const rajmachi = await Fort.create({
            name: "Rajmachi Fort",
            slug: "rajmachi",
            location: { type: "Point", coordinates: [73.4050, 18.8371] },
            elevation: 838,
            region: "Sahyadri — Konkan",
            district: "Pune",
            baseVillage: "Udhewadi",
            description: "A twin-pinnacle fort complex consisting of Shrivardhan and Manaranjan, guarding the strategic Bor Ghat trade route between the Deccan plateau and the Konkan coast. The fort village of Udhewadi lies between the two peaks.",
            imageUrl: "",
            sections: [
                { name: "Shrivardhan", description: "The higher of the twin pinnacles with a Mahadev temple at the summit." },
                { name: "Manaranjan", description: "The eastern pinnacle with commanding views of the Bor Ghat pass." },
                { name: "Udhewadi Village", description: "Inhabited fort village nestled in the saddle between the twin peaks." },
            ],
        });

        const rajmachiTrails = await Trail.create([
            {
                fort: rajmachi._id, name: "Lonavala to Rajmachi via Tunnel Road", slug: "lonavala-to-rajmachi-tunnel",
                startPoint: { name: "Lonavala Railway Colony", coordinates: [73.4020, 18.7580] },
                endPoint: { name: "Udhewadi Village Gate", coordinates: [73.4045, 18.8360] },
                path: [[73.4020, 18.7580], [73.4030, 18.7960], [73.4045, 18.8360]],
                baselineDifficulty: 1.2, slopeGradient: 1.2, maxSafeFootfall: 500,
                currentFootfall: 140, currentRiskScore: 15, status: "open",
                distanceKm: 15.0, difficulty: "moderate",
                description: "Long but gradual hike from Lonavala through old British-era railway tunnels. Best done as an overnight trek.",
            },
            {
                fort: rajmachi._id, name: "Udhewadi to Shrivardhan Peak", slug: "udhewadi-to-shrivardhan",
                startPoint: { name: "Udhewadi Village", coordinates: [73.4045, 18.8360] },
                endPoint: { name: "Shrivardhan Summit Temple", coordinates: [73.4040, 18.8380] },
                path: [[73.4045, 18.8360], [73.4042, 18.8370], [73.4040, 18.8380]],
                baselineDifficulty: 1.6, slopeGradient: 1.7, maxSafeFootfall: 200,
                currentFootfall: 30, currentRiskScore: 35, status: "open",
                distanceKm: 0.5, difficulty: "hard",
                description: "Short but steep rock scramble up the pinnacle with exposed rock patches. Requires caution in wet conditions.",
            },
        ]);

        await Cistern.create([
            {
                fort: rajmachi._id, name: "Udhewadi Village Well",
                location: { name: "Udhewadi Central", coordinates: [73.4046, 18.8362] },
                capacityLiters: 25000, currentLevelPct: 60, overflowThreshold: 80, status: "normal",
                nearestTrail: rajmachiTrails[0]._id,
                description: "The village well serving the inhabited fort settlement of Udhewadi. Recharged by monsoon rains.",
            },
        ]);

        // ═══════════════════════════════════════════════════════════════
        //  KONKAN — Sea Forts (Coastal Maharashtra)
        // ═══════════════════════════════════════════════════════════════

        // ─────────────────────────────────────────────────────────────
        // 15. SINDHUDURG FORT (The Ocean Fortress)
        // ─────────────────────────────────────────────────────────────
        const sindhudurg = await Fort.create({
            name: "Sindhudurg Fort",
            slug: "sindhudurg",
            location: { type: "Point", coordinates: [73.4612, 16.0377] },
            elevation: 5,
            region: "Konkan Coast",
            district: "Sindhudurg",
            baseVillage: "Malvan",
            description: "Shivaji Maharaj's masterpiece sea fort built on a rocky island off the Malvan coast in 1664–67. Spans 48 acres with 2 km of fortification walls rising directly from the Arabian Sea. Contains the only temple in the world housing Shivaji Maharaj's hand and foot prints.",
            imageUrl: "",
            sections: [
                { name: "Shivaji Temple", description: "The only temple with Shivaji Maharaj's hand and foot imprints, built by his son Rajaram." },
                { name: "Dandi Bastion", description: "The main watchtower bastion overlooking the shipping lanes." },
                { name: "Sea Walls", description: "2 km of fortification walls built directly on the rocky seabed using lead-poured foundations." },
            ],
        });

        const sindhudurgTrails = await Trail.create([
            {
                fort: sindhudurg._id, name: "Malvan Jetty to Fort Landing", slug: "malvan-jetty-to-fort-landing",
                startPoint: { name: "Malvan Boat Jetty", coordinates: [73.4640, 16.0350] },
                endPoint: { name: "Sindhudurg Landing Steps", coordinates: [73.4618, 16.0370] },
                path: [[73.4640, 16.0350], [73.4630, 16.0360], [73.4618, 16.0370]],
                baselineDifficulty: 1.0, slopeGradient: 1.0, maxSafeFootfall: 500,
                currentFootfall: 180, currentRiskScore: 10, status: "open",
                distanceKm: 0.5, difficulty: "easy",
                description: "Short boat ride from Malvan jetty. Subject to tide and wave conditions. Boats may not operate during rough seas.",
            },
            {
                fort: sindhudurg._id, name: "Fort Perimeter Rampart Walk", slug: "sindhudurg-rampart-walk",
                startPoint: { name: "Landing Steps Inner", coordinates: [73.4618, 16.0370] },
                endPoint: { name: "Dandi Bastion", coordinates: [73.4605, 16.0390] },
                path: [[73.4618, 16.0370], [73.4612, 16.0380], [73.4605, 16.0390]],
                baselineDifficulty: 1.1, slopeGradient: 1.0, maxSafeFootfall: 400,
                currentFootfall: 130, currentRiskScore: 8, status: "open",
                distanceKm: 2.0, difficulty: "easy",
                description: "Walk atop the sea-facing ramparts. Spectacular views but can be slippery from salt spray.",
            },
        ]);

        await Cistern.create([
            {
                fort: sindhudurg._id, name: "Sindhudurg Freshwater Well",
                location: { name: "Fort Interior", coordinates: [73.4610, 16.0378] },
                capacityLiters: 30000, currentLevelPct: 75, overflowThreshold: 85, status: "normal",
                nearestTrail: sindhudurgTrails[1]._id,
                description: "Remarkable engineering feat — a freshwater well on a sea island, sourcing from an underground freshwater lens.",
            },
        ]);

        // ─────────────────────────────────────────────────────────────
        // 16. VIJAYDURG FORT (Victory Fort — Oldest Sea Fort)
        // ─────────────────────────────────────────────────────────────
        const vijaydurg = await Fort.create({
            name: "Vijaydurg Fort",
            slug: "vijaydurg",
            location: { type: "Point", coordinates: [73.3365, 16.5626] },
            elevation: 10,
            region: "Konkan Coast",
            district: "Sindhudurg",
            baseVillage: "Vijaydurg Village",
            description: "The oldest sea fort on the Konkan coast, originally built by the Shilahar dynasty (1200 CE) and later fortified by Shivaji Maharaj. Features a unique triple-layered fortification wall and was the headquarters of the Maratha Navy (Armada).",
            imageUrl: "",
            sections: [
                { name: "Triple Fortification", description: "Three concentric layers of sea walls — a unique defensive design among Indian sea forts." },
                { name: "Naval Dockyard", description: "Ship repair and construction dockyard for the Maratha Navy." },
                { name: "Underwater Tunnel", description: "Legendary submerged passage (now collapsed) connecting the fort to the mainland." },
            ],
        });

        const vijaydurgTrails = await Trail.create([
            {
                fort: vijaydurg._id, name: "Village Road to Fort Gate", slug: "vijaydurg-village-to-gate",
                startPoint: { name: "Vijaydurg Village", coordinates: [73.3380, 16.5610] },
                endPoint: { name: "Vijaydurg Main Gate", coordinates: [73.3368, 16.5622] },
                path: [[73.3380, 16.5610], [73.3374, 16.5616], [73.3368, 16.5622]],
                baselineDifficulty: 1.0, slopeGradient: 1.0, maxSafeFootfall: 600,
                currentFootfall: 100, currentRiskScore: 5, status: "open",
                distanceKm: 0.8, difficulty: "easy",
                description: "Flat approach from the village along a causeway connecting the land-tied island to the shore.",
            },
            {
                fort: vijaydurg._id, name: "Triple Wall Circuit", slug: "vijaydurg-triple-wall-circuit",
                startPoint: { name: "Main Gate Inner Court", coordinates: [73.3368, 16.5622] },
                endPoint: { name: "Outermost Bastion", coordinates: [73.3355, 16.5635] },
                path: [[73.3368, 16.5622], [73.3360, 16.5628], [73.3355, 16.5635]],
                baselineDifficulty: 1.2, slopeGradient: 1.1, maxSafeFootfall: 400,
                currentFootfall: 75, currentRiskScore: 10, status: "open",
                distanceKm: 1.5, difficulty: "easy",
                description: "Walk through the three concentric fortification layers with views of the Arabian Sea.",
            },
        ]);

        await Cistern.create([
            {
                fort: vijaydurg._id, name: "Vijaydurg Garrison Well",
                location: { name: "Inner Fort Courtyard", coordinates: [73.3366, 16.5625] },
                capacityLiters: 35000, currentLevelPct: 68, overflowThreshold: 85, status: "normal",
                nearestTrail: vijaydurgTrails[0]._id,
                description: "Large garrison well providing fresh water to the naval headquarters and dockyard workers.",
            },
        ]);

        // ─────────────────────────────────────────────────────────────
        // 17. MURUD-JANJIRA FORT (The Unconquered Island Fortress)
        // ─────────────────────────────────────────────────────────────
        const janjira = await Fort.create({
            name: "Murud-Janjira Fort",
            slug: "murud-janjira",
            location: { type: "Point", coordinates: [72.9632, 18.2936] },
            elevation: 8,
            region: "Konkan Coast",
            district: "Raigad",
            baseVillage: "Murud",
            description: "The only sea fort on India's western coast that was never conquered. Built by the Siddis of Janjira in the 15th century, it withstood attacks from the Marathas, Portuguese, and British. Features 19 rounded bastions and a complex water supply system.",
            imageUrl: "",
            sections: [
                { name: "19 Bastions", description: "Circular bastions positioned for 360-degree cannon coverage of the surrounding sea." },
                { name: "Palace Ruins", description: "Remnants of the Siddi Nawab's palace with freshwater fountains." },
                { name: "Freshwater Lake", description: "A remarkable freshwater lake inside the sea fort — an engineering marvel." },
            ],
        });

        const janjiraTrails = await Trail.create([
            {
                fort: janjira._id, name: "Rajapuri Jetty to Janjira Landing", slug: "rajapuri-to-janjira-landing",
                startPoint: { name: "Rajapuri Boat Jetty", coordinates: [72.9660, 18.2920] },
                endPoint: { name: "Janjira Fort Landing", coordinates: [72.9638, 18.2932] },
                path: [[72.9660, 18.2920], [72.9650, 18.2926], [72.9638, 18.2932]],
                baselineDifficulty: 1.0, slopeGradient: 1.0, maxSafeFootfall: 400,
                currentFootfall: 120, currentRiskScore: 8, status: "open",
                distanceKm: 0.3, difficulty: "easy",
                description: "Short boat ride from Rajapuri village. Tide-dependent — boats may not run during low tide or rough weather.",
            },
            {
                fort: janjira._id, name: "Janjira Fort Interior Tour", slug: "janjira-fort-interior-tour",
                startPoint: { name: "Main Entrance Arch", coordinates: [72.9638, 18.2932] },
                endPoint: { name: "Freshwater Lake", coordinates: [72.9630, 18.2940] },
                path: [[72.9638, 18.2932], [72.9634, 18.2936], [72.9630, 18.2940]],
                baselineDifficulty: 1.1, slopeGradient: 1.0, maxSafeFootfall: 300,
                currentFootfall: 90, currentRiskScore: 10, status: "open",
                distanceKm: 0.8, difficulty: "easy",
                description: "Walk through the fort interior past palace ruins, cannon emplacements, and the remarkable freshwater lake.",
            },
        ]);

        await Cistern.create([
            {
                fort: janjira._id, name: "Janjira Freshwater Lake",
                location: { name: "Fort Interior", coordinates: [72.9630, 18.2940] },
                capacityLiters: 100000, currentLevelPct: 80, overflowThreshold: 90, status: "normal",
                nearestTrail: janjiraTrails[1]._id,
                description: "Engineering marvel — a large freshwater lake inside a sea fort, fed by underground freshwater springs from the seabed.",
            },
        ]);

        // ─────────────────────────────────────────────────────────────
        // 18. KORIGAD FORT (Koraigad — The Sentinel of Lonavala)
        // ─────────────────────────────────────────────────────────────
        const korigad = await Fort.create({
            name: "Korigad Fort",
            slug: "korigad",
            location: { type: "Point", coordinates: [73.5140, 18.6373] },
            elevation: 929,
            region: "Sahyadri — Konkan",
            district: "Pune",
            baseVillage: "Peth Shahpur",
            description: "A beginner-friendly fort near Lonavala known for its twin pinnacles and panoramic views of the Aamby Valley. The fort has a well-preserved entrance gate and a Koraidevi temple at the summit.",
            imageUrl: "",
            sections: [
                { name: "Koraidevi Temple", description: "Goddess temple at the summit — the fort's namesake." },
                { name: "Twin Pinnacles", description: "Two prominent basalt pinnacles visible from the surrounding valley." },
            ],
        });

        const korigadTrails = await Trail.create([
            {
                fort: korigad._id, name: "Peth Shahpur to Korigad Summit", slug: "peth-shahpur-to-korigad",
                startPoint: { name: "Peth Shahpur Village", coordinates: [73.5120, 18.6350] },
                endPoint: { name: "Korigad Main Gate", coordinates: [73.5138, 18.6370] },
                path: [[73.5120, 18.6350], [73.5130, 18.6360], [73.5138, 18.6370]],
                baselineDifficulty: 1.2, slopeGradient: 1.3, maxSafeFootfall: 500,
                currentFootfall: 100, currentRiskScore: 15, status: "open",
                distanceKm: 1.5, difficulty: "easy",
                description: "Short, well-defined trail through grasslands to the summit. Excellent monsoon trek with waterfalls en route.",
            },
        ]);

        await Cistern.create([
            {
                fort: korigad._id, name: "Korigad Summit Tank",
                location: { name: "Near Koraidevi Temple", coordinates: [73.5139, 18.6372] },
                capacityLiters: 18000, currentLevelPct: 55, overflowThreshold: 80, status: "normal",
                nearestTrail: korigadTrails[0]._id,
                description: "Rock-cut water tank on the summit plateau, historically serving the temple complex.",
            },
        ]);

        // ═══════════════════════════════════════════════════════════════
        //  SUMMARY
        // ═══════════════════════════════════════════════════════════════

        const fortCount = await Fort.countDocuments();
        const trailCount = await Trail.countDocuments();
        const cisternCount = await Cistern.countDocuments();

        console.log("\n══════════════════════════════════════════════════");
        console.log("  ⛰️  FortFlux Sahyadri — Konkan & Deccan Seed Complete!");
        console.log("══════════════════════════════════════════════════");
        console.log(`🏰 Forts seeded:    ${fortCount} (across Pune, Raigad, Satara, Kolhapur, Nashik, Ahmednagar, Sindhudurg)`);
        console.log(`🥾 Trails seeded:   ${trailCount}`);
        console.log(`💧 Cisterns seeded: ${cisternCount}`);
        console.log("══════════════════════════════════════════════════\n");

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
