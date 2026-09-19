import { computeTrailRisk } from "./backend/src/services/risk.service.js";
import { calculateEdgeCost, buildGraph, runDijkstra } from "./backend/src/services/routing.service.js";

console.log("=================================================");
console.log("🧪 TESTING FORTFLUX 3-ITEM ENHANCEMENTS");
console.log("=================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`✅ PASS: ${message}`);
        passed++;
    } else {
        console.error(`❌ FAIL: ${message}`);
        failed++;
    }
}

// ─────────────────────────────────────────────────────────────
// TEST 1: Terrain Risk Floor (fixes zero-rainfall bug)
// ─────────────────────────────────────────────────────────────
console.log("--- 1. Testing Terrain Risk Floor ---");

// Steep / High-difficulty trail (e.g. Suvela Machi or Citadel chimney)
const steepTrail = {
    _id: "trail_steep_1",
    name: "Steep Rock Chute",
    slug: "steep-rock-chute",
    baselineDifficulty: 1.9,
    slopeGradient: 1.8,
    maxSafeFootfall: 200,
    currentFootfall: 100,
    currentRiskScore: 0,
    status: "open",
};

// Easy / Flat trail (e.g. Lower plateau path)
const flatTrail = {
    _id: "trail_flat_1",
    name: "Gentle Plateau Walk",
    slug: "gentle-plateau-walk",
    baselineDifficulty: 1.0,
    slopeGradient: 1.0,
    maxSafeFootfall: 1000,
    currentFootfall: 100,
    currentRiskScore: 0,
    status: "open",
};

const dryWeather = { precipitation: 0 };

const steepResultDry = computeTrailRisk(steepTrail, dryWeather, null, 0);
const flatResultDry = computeTrailRisk(flatTrail, dryWeather, null, 0);

console.log(`Steep trail at 0mm rain: liveRiskScore = ${steepResultDry.liveRiskScore}% (floor factor: ${steepResultDry.factors.terrainFloor}%)`);
console.log(`Flat trail at 0mm rain: liveRiskScore = ${flatResultDry.liveRiskScore}% (floor factor: ${flatResultDry.factors.terrainFloor}%)`);

assert(
    steepResultDry.liveRiskScore >= 10 && steepResultDry.liveRiskScore <= 15,
    `Steep trail floors around 10-15% risk at zero rainfall (Got: ${steepResultDry.liveRiskScore}%)`
);

assert(
    flatResultDry.liveRiskScore >= 0 && flatResultDry.liveRiskScore <= 4,
    `Easy flat trail floors near 0% risk at zero rainfall (Got: ${flatResultDry.liveRiskScore}%)`
);

// Check gradual increase in rainfall: no discontinuity
let lastRisk = steepResultDry.liveRiskScore;
let monotonic = true;
for (let p = 5; p <= 100; p += 10) {
    const rainResult = computeTrailRisk(steepTrail, { precipitation: p }, null, 0);
    if (rainResult.liveRiskScore < lastRisk) {
        monotonic = false;
    }
    lastRisk = rainResult.liveRiskScore;
}
assert(monotonic, "Increasing rainfall results in smooth monotonic risk curve above the terrain floor");

// ─────────────────────────────────────────────────────────────
// TEST 2: Non-Linear Dijkstra Edge Cost
// ─────────────────────────────────────────────────────────────
console.log("\n--- 2. Testing Non-Linear Dijkstra Edge Cost ---");

// Direct, short trail with high risk (1.0 km, 70% risk)
const shortDangerousTrail = {
    _id: "trail_danger",
    id: "trail_danger",
    name: "Direct Cliff Path",
    distanceKm: 1.0,
    currentRiskScore: 70,
    status: "open",
    startPoint: { name: "Base Camp" },
    endPoint: { name: "Summit" },
    path: [[73.6, 18.2], [73.61, 18.21]],
};

// Longer, gentle bypass trail with low risk (1.8 km, 5% risk)
const longSafeTrail = {
    _id: "trail_safe",
    id: "trail_safe",
    name: "Ridge Bypass Trail",
    distanceKm: 1.8,
    currentRiskScore: 5,
    status: "open",
    startPoint: { name: "Base Camp" },
    endPoint: { name: "Summit" },
    path: [[73.6, 18.2], [73.62, 18.22]],
};

const costDanger = calculateEdgeCost(shortDangerousTrail);
const costSafe = calculateEdgeCost(longSafeTrail);

console.log(`Cost for Short High-Risk Trail (1.0km, 70% risk): ${costDanger.toFixed(3)}`);
console.log(`Cost for Long Safe Trail (1.8km, 5% risk): ${costSafe.toFixed(3)}`);

assert(
    costDanger > costSafe,
    `Non-linear cost penalizes 70% risk trail (${costDanger.toFixed(2)}) higher than 1.8km 5% safe trail (${costSafe.toFixed(2)})`
);

// Verify with full Dijkstra graph solver
const trails = [shortDangerousTrail, longSafeTrail];
const { adjacency } = buildGraph(trails);
const routeResult = runDijkstra(adjacency, "base camp", "summit");

assert(
    routeResult !== null && routeResult.trails.length > 0,
    "Dijkstra found a valid route between Base Camp and Summit"
);
assert(
    routeResult.trails[0].name === "Ridge Bypass Trail",
    `Dijkstra chose safe bypass trail '${routeResult.trails[0].name}' over dangerous direct trail`
);

// ─────────────────────────────────────────────────────────────
// TEST 3: Simulated Antecedent Rainfall Slider (Soil Memory)
// ─────────────────────────────────────────────────────────────
console.log("\n--- 3. Testing Simulated Antecedent Rainfall Slider ---");

// With current rainfall at 0mm, test increasing preceding rainfall (0, 75, 150, 225, 300 mm)
const dryWeatherNow = { precipitation: 0 };
const testTrail = {
    _id: "trail_moderate",
    name: "Fort Gateway Ascent",
    baselineDifficulty: 1.4,
    slopeGradient: 1.4,
    maxSafeFootfall: 400,
    currentFootfall: 200,
    currentRiskScore: 0,
    status: "open",
};

const riskAntecedent0 = computeTrailRisk(testTrail, dryWeatherNow, null, 0).liveRiskScore;
const riskAntecedent75 = computeTrailRisk(testTrail, dryWeatherNow, null, 75).liveRiskScore;
const riskAntecedent150 = computeTrailRisk(testTrail, dryWeatherNow, null, 150).liveRiskScore;
const riskAntecedent300 = computeTrailRisk(testTrail, dryWeatherNow, null, 300).liveRiskScore;

console.log(`Preceding 0mm: risk = ${riskAntecedent0}%`);
console.log(`Preceding 75mm: risk = ${riskAntecedent75}%`);
console.log(`Preceding 150mm: risk = ${riskAntecedent150}%`);
console.log(`Preceding 300mm: risk = ${riskAntecedent300}%`);

assert(
    riskAntecedent0 < riskAntecedent75 &&
    riskAntecedent75 < riskAntecedent150 &&
    riskAntecedent150 < riskAntecedent300,
    "Antecedent rainfall slider increases risk smoothly and monotonically at 0mm live rain"
);

// Test combination of live rain and preceding rain (should not prematurely clamp to 100%)
const combinedModerate = computeTrailRisk(testTrail, { precipitation: 30 }, null, 60).liveRiskScore;
const combinedHeavy = computeTrailRisk(testTrail, { precipitation: 60 }, null, 120).liveRiskScore;

console.log(`Combined (30mm/hr live + 60mm antecedent): risk = ${combinedModerate}%`);
console.log(`Combined (60mm/hr live + 120mm antecedent): risk = ${combinedHeavy}%`);

assert(
    combinedModerate > riskAntecedent0 && combinedModerate < 100,
    `Sensible scaling for moderate live + antecedent rain (${combinedModerate}%)`
);
assert(
    combinedHeavy > combinedModerate,
    `Heavy live + antecedent rain yields higher risk (${combinedHeavy}%) without premature 100% saturation`
);

// ─────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────
console.log("\n=================================================");
console.log(`Total tests passed: ${passed}/${passed + failed}`);
if (failed === 0) {
    console.log("🎉 ALL ENHANCEMENT VERIFICATIONS PASSED PERFECTLY!");
} else {
    console.error(`💥 ${failed} TEST(S) FAILED!`);
    process.exit(1);
}
console.log("=================================================");
