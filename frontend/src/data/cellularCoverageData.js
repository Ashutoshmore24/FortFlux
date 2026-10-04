// ── Mountain Cellular Coverage & Dead Zones Dataset ──
// Covers sheer basalt gorges, deep scarp shadows, and high-ground 4G hotspots
// across the Sahyadri mountain forts of Maharashtra.

export const CELLULAR_ZONES = [
    // ═══════════════════════════════════════════════════════
    // 1. RAJGAD FORT
    // ═══════════════════════════════════════════════════════
    {
        id: "cz-rajgad-chor-darwaja-gorge",
        fortSlug: "rajgad",
        name: "Chor Darwaja Basalt Gorge Dead Zone",
        type: "dead_zone",
        severity: "critical_blackout",
        coordinates: [73.6852, 18.2435],
        // Polygon around steep rocky chute of Chor Darwaja
        polygon: [
            [73.6838, 18.2422],
            [73.6868, 18.2426],
            [73.6872, 18.2448],
            [73.6846, 18.2452],
            [73.6838, 18.2422],
        ],
        carrierStatus: {
            jio: "No Service (0 bars)",
            airtel: "No Service (0 bars)",
            vi: "No Service (0 bars)",
            bsnl: "No Service (0 bars)",
        },
        terrainBlocker: "Deep 450m volcanic scarp blocks line-of-sight to Deccan valley towers.",
        safetyAdvisory: "Complete radio blackout. Pre-download offline map. Turn off cellular data to prevent battery drain while ascending.",
        nearestHotspot: {
            name: "Padmavati Machi Eastern Rampart",
            coordinates: [73.6845, 18.2475],
            distanceMeters: 410,
            bearing: "North-East (35°)",
            carrier: "Jio & Airtel 4G (2-3 Bars)",
        },
    },
    {
        id: "cz-rajgad-suvela-nedhe-shadow",
        fortSlug: "rajgad",
        name: "Suvela Machi Nedhe Valley Shadow",
        type: "dead_zone",
        severity: "critical_blackout",
        coordinates: [73.6932, 18.2445],
        polygon: [
            [73.6912, 18.2435],
            [73.6955, 18.2438],
            [73.6962, 18.2460],
            [73.6920, 18.2458],
            [73.6912, 18.2435],
        ],
        carrierStatus: {
            jio: "No Service (0 bars)",
            airtel: "No Service (0 bars)",
            vi: "Emergency SOS Only",
            bsnl: "No Service (0 bars)",
        },
        terrainBlocker: "Natural rock eyelet (Nedhe) ridge blocks telecom propagation from Velhe.",
        safetyAdvisory: "Zero cellular connectivity along narrow ridge flank. Keep whistle ready.",
        nearestHotspot: {
            name: "Suvela Machi First Bastion",
            coordinates: [73.6895, 18.2455],
            distanceMeters: 390,
            bearing: "West (275°)",
            carrier: "Airtel 4G (2 Bars)",
        },
    },
    {
        id: "cz-rajgad-sanjeevani-flank",
        fortSlug: "rajgad",
        name: "Sanjeevani Machi Southwest Ridge",
        type: "fringe",
        severity: "poor_fringe",
        coordinates: [73.6765, 18.2430],
        polygon: [
            [73.6745, 18.2415],
            [73.6788, 18.2422],
            [73.6795, 18.2448],
            [73.6750, 18.2442],
            [73.6745, 18.2415],
        ],
        carrierStatus: {
            jio: "1 Bar LTE (Unstable)",
            airtel: "1 Bar EDGE (Voice drops)",
            vi: "No Service (0 bars)",
            bsnl: "1 Bar 2G (SMS only)",
        },
        terrainBlocker: "Intermittent reception on outer ramparts; dead zone in interior fortification trenches.",
        safetyAdvisory: "Fringe reception. SMS text messages may deliver; voice calls frequently drop.",
        nearestHotspot: {
            name: "Balekilla Central Citadel Summit",
            coordinates: [73.6828, 18.2464],
            distanceMeters: 620,
            bearing: "North-East (55°)",
            carrier: "Jio & Airtel 4G (3-4 Bars)",
        },
    },
    {
        id: "cz-rajgad-balekilla-summit-hotspot",
        fortSlug: "rajgad",
        name: "Balekilla Crown Summit (High-Ground Hotspot)",
        type: "emergency_hotspot",
        severity: "line_of_sight_signal",
        coordinates: [73.6828, 18.2464],
        polygon: [
            [73.6815, 18.2452],
            [73.6842, 18.2452],
            [73.6845, 18.2476],
            [73.6818, 18.2476],
            [73.6815, 18.2452],
        ],
        carrierStatus: {
            jio: "4G LTE (4 Bars - Fast Data)",
            airtel: "4G LTE (3 Bars - HD Voice)",
            vi: "3G (2 Bars)",
            bsnl: "3G (2 Bars)",
        },
        terrainBlocker: "Unobstructed 360-degree line-of-sight at 1,376m elevation to Pune & Bhor cellular relays.",
        safetyAdvisory: "RECOMMENDED EMERGENCY CELLULAR POINT. Best location for 112 emergency calls, live location broadcasting, and weather updates.",
        nearestHotspot: null,
    },
    {
        id: "cz-rajgad-padmavati-hotspot",
        fortSlug: "rajgad",
        name: "Padmavati Machi Plateau Hotspot",
        type: "emergency_hotspot",
        severity: "line_of_sight_signal",
        coordinates: [73.6845, 18.2475],
        polygon: [
            [73.6830, 18.2465],
            [73.6860, 18.2465],
            [73.6862, 18.2488],
            [73.6832, 18.2488],
            [73.6830, 18.2465],
        ],
        carrierStatus: {
            jio: "4G LTE (3 Bars)",
            airtel: "4G LTE (3 Bars)",
            vi: "2G/3G (1-2 Bars)",
            bsnl: "2G (1 Bar)",
        },
        terrainBlocker: "Direct vista towards Gunjavane valley base repeater towers.",
        safetyAdvisory: "Safe communication hub with forest guard shelter, fresh cistern water, and reliable network.",
        nearestHotspot: null,
    },

    // ═══════════════════════════════════════════════════════
    // 2. TORNA FORT (Prachandagad)
    // ═══════════════════════════════════════════════════════
    {
        id: "cz-torna-zunjar-machi-chasm",
        fortSlug: "torna",
        name: "Zunjar Machi Sheer Cliff Chasm",
        type: "dead_zone",
        severity: "critical_blackout",
        coordinates: [73.6120, 18.2755],
        polygon: [
            [73.6095, 18.2740],
            [73.6145, 18.2742],
            [73.6152, 18.2770],
            [73.6100, 18.2768],
            [73.6095, 18.2740],
        ],
        carrierStatus: {
            jio: "No Service (0 bars)",
            airtel: "No Service (0 bars)",
            vi: "No Service (0 bars)",
            bsnl: "No Service (0 bars)",
        },
        terrainBlocker: "Vertical 500m basalt cliff flank creates severe radio shadow.",
        safetyAdvisory: "High danger zone. Zero cellular coverage. Rockfall hazard; keep offline map active.",
        nearestHotspot: {
            name: "Mengai Devi Temple Plateau",
            coordinates: [73.6215, 18.2762],
            distanceMeters: 980,
            bearing: "East (85°)",
            carrier: "Jio & Airtel 4G (3 Bars)",
        },
    },
    {
        id: "cz-torna-budhla-machi-fringe",
        fortSlug: "torna",
        name: "Budhla Machi Western Scarp",
        type: "fringe",
        severity: "poor_fringe",
        coordinates: [73.6295, 18.2775],
        polygon: [
            [73.6270, 18.2760],
            [73.6320, 18.2762],
            [73.6325, 18.2790],
            [73.6275, 18.2788],
            [73.6270, 18.2760],
        ],
        carrierStatus: {
            jio: "1 Bar LTE",
            airtel: "1 Bar EDGE",
            vi: "No Service",
            bsnl: "No Service",
        },
        terrainBlocker: "Dense cloud cover and high ridges cause periodic signal drops.",
        safetyAdvisory: "Unstable signal. Move towards Mengai Temple for urgent calls.",
        nearestHotspot: {
            name: "Mengai Devi Temple Plateau",
            coordinates: [73.6215, 18.2762],
            distanceMeters: 850,
            bearing: "West (265°)",
            carrier: "Jio & Airtel 4G (3 Bars)",
        },
    },
    {
        id: "cz-torna-mengai-hotspot",
        fortSlug: "torna",
        name: "Mengai Devi Plateau Hotspot",
        type: "emergency_hotspot",
        severity: "line_of_sight_signal",
        coordinates: [73.6215, 18.2762],
        polygon: [
            [73.6200, 18.2750],
            [73.6230, 18.2750],
            [73.6232, 18.2775],
            [73.6202, 18.2775],
            [73.6200, 18.2750],
        ],
        carrierStatus: {
            jio: "4G LTE (3 Bars)",
            airtel: "4G LTE (3 Bars)",
            vi: "2G (1 Bar)",
            bsnl: "3G (2 Bars)",
        },
        terrainBlocker: "Elevation 1,403m with direct line-of-sight to Velhe repeater.",
        safetyAdvisory: "Designated rescue base camp on Torna with overnight temple shelter and active network.",
        nearestHotspot: null,
    },

    // ═══════════════════════════════════════════════════════
    // 3. HARISHCHANDRAGAD FORT
    // ═══════════════════════════════════════════════════════
    {
        id: "cz-harishchandra-konkan-kada-deadzone",
        fortSlug: "harishchandragad",
        name: "Konkan Kada Abyss Radio Blackout",
        type: "dead_zone",
        severity: "critical_blackout",
        coordinates: [73.7713, 19.3922],
        polygon: [
            [73.7680, 19.3900],
            [73.7745, 19.3905],
            [73.7750, 19.3945],
            [73.7685, 19.3940],
            [73.7680, 19.3900],
        ],
        carrierStatus: {
            jio: "No Service (0 bars)",
            airtel: "No Service (0 bars)",
            vi: "No Service (0 bars)",
            bsnl: "No Service (0 bars)",
        },
        terrainBlocker: "Curved 2,000ft concave cliff faces deep Konkan valley with zero telecom coverage.",
        safetyAdvisory: "DANGER ZONE: Extreme radio blackout. In fog or rain, offline GPS navigation is mandatory.",
        nearestHotspot: {
            name: "Harishchandreshwar Temple Base",
            coordinates: [73.7780, 19.3870],
            distanceMeters: 920,
            bearing: "South-East (125°)",
            carrier: "Jio 4G (1-2 Bars near caves)",
        },
    },
    {
        id: "cz-harishchandra-taramati-hotspot",
        fortSlug: "harishchandragad",
        name: "Taramati Peak Summit Hotspot (1,429m)",
        type: "emergency_hotspot",
        severity: "line_of_sight_signal",
        coordinates: [73.7772, 19.3855],
        polygon: [
            [73.7758, 19.3842],
            [73.7788, 19.3842],
            [73.7790, 19.3870],
            [73.7760, 19.3870],
            [73.7758, 19.3842],
        ],
        carrierStatus: {
            jio: "4G LTE (4 Bars)",
            airtel: "4G LTE (3 Bars)",
            vi: "3G (2 Bars)",
            bsnl: "3G (2 Bars)",
        },
        terrainBlocker: "Highest summit provides line-of-sight to Ahmednagar and Thane telecom backbones.",
        safetyAdvisory: "Primary SOS broadcast location on Harishchandragad plateau.",
        nearestHotspot: null,
    },

    // ═══════════════════════════════════════════════════════
    // 4. RAIGAD FORT (Capital of Maratha Empire)
    // ═══════════════════════════════════════════════════════
    {
        id: "cz-raigad-takmak-tok-deadzone",
        fortSlug: "raigad",
        name: "Takmak Tok Precipice Shadow",
        type: "dead_zone",
        severity: "critical_blackout",
        coordinates: [73.4455, 18.2360],
        polygon: [
            [73.4435, 18.2345],
            [73.4475, 18.2348],
            [73.4480, 18.2375],
            [73.4440, 18.2372],
            [73.4435, 18.2345],
        ],
        carrierStatus: {
            jio: "No Service (0 bars)",
            airtel: "No Service (0 bars)",
            vi: "No Service (0 bars)",
            bsnl: "No Service (0 bars)",
        },
        terrainBlocker: "1,400ft execution precipice extending over Kal gorge with dense valley mist.",
        safetyAdvisory: "Sheer vertical drop. No cellular signal. Move away from edge towards Holicha Mal.",
        nearestHotspot: {
            name: "Holicha Mal & Shivaji Maharaj Memorial",
            coordinates: [73.4410, 18.2340],
            distanceMeters: 480,
            bearing: "South-West (230°)",
            carrier: "Jio & Airtel 4G (4 Bars)",
        },
    },
    {
        id: "cz-raigad-holicha-mal-hotspot",
        fortSlug: "raigad",
        name: "Holicha Mal & Ropeway Station Hotspot",
        type: "emergency_hotspot",
        severity: "line_of_sight_signal",
        coordinates: [73.4410, 18.2340],
        polygon: [
            [73.4395, 18.2325],
            [73.4425, 18.2325],
            [73.4428, 18.2355],
            [73.4398, 18.2355],
            [73.4395, 18.2325],
        ],
        carrierStatus: {
            jio: "5G / 4G (4 Bars)",
            airtel: "5G / 4G (4 Bars)",
            vi: "4G (3 Bars)",
            bsnl: "4G (3 Bars)",
        },
        terrainBlocker: "Equipped with dedicated micro-cellular antenna for tourism & ropeway infrastructure.",
        safetyAdvisory: "Full connectivity zone with emergency medical station and Maharashtra Tourism office.",
        nearestHotspot: null,
    },

    // ═══════════════════════════════════════════════════════
    // 5. SINHAGAD FORT
    // ═══════════════════════════════════════════════════════
    {
        id: "cz-sinhagad-kalyan-darwaja-gorge",
        fortSlug: "sinhagad",
        name: "Kalyan Darwaja Deep Forest Ravine",
        type: "dead_zone",
        severity: "critical_blackout",
        coordinates: [73.7540, 18.3615],
        polygon: [
            [73.7520, 18.3600],
            [73.7565, 18.3602],
            [73.7570, 18.3630],
            [73.7525, 18.3628],
            [73.7520, 18.3600],
        ],
        carrierStatus: {
            jio: "No Service (0 bars)",
            airtel: "1 Bar (Unusable)",
            vi: "No Service (0 bars)",
            bsnl: "No Service (0 bars)",
        },
        terrainBlocker: "Deep south ravine surrounded by basalt ramparts.",
        safetyAdvisory: "Popular steep trekking route. Keep downloaded offline map active.",
        nearestHotspot: {
            name: "Tanaji Malusare Memorial & Doordarshan Tower",
            coordinates: [73.7580, 18.3660],
            distanceMeters: 650,
            bearing: "North-East (35°)",
            carrier: "All Carriers 4G/5G (4 Bars)",
        },
    },
    {
        id: "cz-sinhagad-doordarshan-hotspot",
        fortSlug: "sinhagad",
        name: "Doordarshan Relay Tower Hotspot",
        type: "emergency_hotspot",
        severity: "line_of_sight_signal",
        coordinates: [73.7580, 18.3660],
        polygon: [
            [73.7565, 18.3645],
            [73.7595, 18.3645],
            [73.7600, 18.3675],
            [73.7570, 18.3675],
            [73.7565, 18.3645],
        ],
        carrierStatus: {
            jio: "5G (5 Bars)",
            airtel: "5G (5 Bars)",
            vi: "4G (4 Bars)",
            bsnl: "4G (4 Bars)",
        },
        terrainBlocker: "Direct line-of-sight to Pune City with telecom relay broadcast towers.",
        safetyAdvisory: "Full high-speed 5G connectivity point.",
        nearestHotspot: null,
    },

    // ═══════════════════════════════════════════════════════
    // 6. LOHAGAD & VISAPUR FORTS
    // ═══════════════════════════════════════════════════════
    {
        id: "cz-lohagad-vinchukata-ridge-fringe",
        fortSlug: "lohagad",
        name: "Vinchukata Scorpions Tail Ridge",
        type: "fringe",
        severity: "poor_fringe",
        coordinates: [73.4750, 18.7050],
        polygon: [
            [73.4720, 18.7035],
            [73.4775, 18.7038],
            [73.4780, 18.7065],
            [73.4725, 18.7062],
            [73.4720, 18.7035],
        ],
        carrierStatus: {
            jio: "1-2 Bars (Unstable)",
            airtel: "1 Bar (Frequent Drops)",
            vi: "No Service",
            bsnl: "1 Bar 2G",
        },
        terrainBlocker: "1.5km long narrow ridge exposed to high crosswinds and valley attenuation.",
        safetyAdvisory: "Very narrow ridge with sheer drops on both sides. Avoid using phone while walking.",
        nearestHotspot: {
            name: "Lohagad Citadel & Ganesh Darwaja",
            coordinates: [73.4835, 18.7120],
            distanceMeters: 850,
            bearing: "North-East (40°)",
            carrier: "Jio & Airtel 4G (3-4 Bars)",
        },
    },

    // ═══════════════════════════════════════════════════════
    // 7. PRATAPGAD FORT
    // ═══════════════════════════════════════════════════════
    {
        id: "cz-pratapgad-radhanagari-gorge",
        fortSlug: "pratapgad",
        name: "Koyna Valley Forest Dead Zone",
        type: "dead_zone",
        severity: "critical_blackout",
        coordinates: [73.5780, 17.9310],
        polygon: [
            [73.5755, 17.9295],
            [73.5805, 17.9298],
            [73.5810, 17.9330],
            [73.5760, 17.9325],
            [73.5755, 17.9295],
        ],
        carrierStatus: {
            jio: "No Service (0 bars)",
            airtel: "No Service (0 bars)",
            vi: "No Service (0 bars)",
            bsnl: "No Service (0 bars)",
        },
        terrainBlocker: "Dense subtropical evergreen forest canopy in Koyna sanctuary watershed.",
        safetyAdvisory: "Dense wildlife corridor. Radio blackout. Stay on designated stone pathway.",
        nearestHotspot: {
            name: "Bhavani Mata Temple & Upper Citadel",
            coordinates: [73.5825, 17.9345],
            distanceMeters: 550,
            bearing: "North-East (45°)",
            carrier: "Airtel & Jio 4G (3 Bars)",
        },
    },

    // ═══════════════════════════════════════════════════════
    // 8. KALAVANTIN DURG & PRABALGAD
    // ═══════════════════════════════════════════════════════
    {
        id: "cz-kalavantin-pinnacle-stairs",
        fortSlug: "kalavantin-durg",
        name: "Kalavantin Rock-Cut Steps Shadow",
        type: "dead_zone",
        severity: "critical_blackout",
        coordinates: [73.2205, 18.9785],
        polygon: [
            [73.2190, 18.9772],
            [73.2225, 18.9775],
            [73.2230, 18.9800],
            [73.2195, 18.9798],
            [73.2190, 18.9772],
        ],
        carrierStatus: {
            jio: "Emergency SOS Only",
            airtel: "No Service (0 bars)",
            vi: "No Service (0 bars)",
            bsnl: "No Service (0 bars)",
        },
        terrainBlocker: "Vertical 70-degree rock needle shields low-angle cellular transmissions from Panvel.",
        safetyAdvisory: "Extreme exposure. Hands must remain free. Do not hold mobile devices on steps.",
        nearestHotspot: {
            name: "Prabalmachi Plateau Base Village",
            coordinates: [73.2260, 18.9740],
            distanceMeters: 720,
            bearing: "South-East (130°)",
            carrier: "Jio 4G (3 Bars)",
        },
    },
];

/**
 * Convert cellular coverage zones into GeoJSON FeatureCollection
 * Supports optional filtering by fortSlug.
 */
export const cellularCoverageToGeoJSON = (fortSlug = null) => {
    const zones = fortSlug
        ? CELLULAR_ZONES.filter((z) => z.fortSlug.toLowerCase() === fortSlug.toLowerCase())
        : CELLULAR_ZONES;

    const features = [];

    zones.forEach((zone) => {
        // 1. Polygon Feature (representing the zone area)
        features.push({
            type: "Feature",
            id: `poly-${zone.id}`,
            geometry: {
                type: "Polygon",
                coordinates: [zone.polygon],
            },
            properties: {
                id: zone.id,
                name: zone.name,
                fortSlug: zone.fortSlug,
                type: zone.type,
                severity: zone.severity,
                center: zone.coordinates,
                terrainBlocker: zone.terrainBlocker,
                safetyAdvisory: zone.safetyAdvisory,
                carrierJio: zone.carrierStatus.jio,
                carrierAirtel: zone.carrierStatus.airtel,
                carrierVi: zone.carrierStatus.vi,
                carrierBsnl: zone.carrierStatus.bsnl,
                nearestHotspotName: zone.nearestHotspot?.name || "None",
                nearestHotspotDist: zone.nearestHotspot?.distanceMeters || 0,
                nearestHotspotBearing: zone.nearestHotspot?.bearing || "N/A",
                nearestHotspotCarrier: zone.nearestHotspot?.carrier || "N/A",
            },
        });

        // 2. Point Feature (for icon marker & text label at the centroid)
        features.push({
            type: "Feature",
            id: `pt-${zone.id}`,
            geometry: {
                type: "Point",
                coordinates: zone.coordinates,
            },
            properties: {
                id: zone.id,
                name: zone.name,
                fortSlug: zone.fortSlug,
                type: zone.type,
                severity: zone.severity,
                center: zone.coordinates,
                isPointMarker: true,
                nearestHotspotName: zone.nearestHotspot?.name || "None",
                nearestHotspotDist: zone.nearestHotspot?.distanceMeters || 0,
                nearestHotspotBearing: zone.nearestHotspot?.bearing || "N/A",
                nearestHotspotCarrier: zone.nearestHotspot?.carrier || "N/A",
                carrierJio: zone.carrierStatus.jio,
                carrierAirtel: zone.carrierStatus.airtel,
                carrierVi: zone.carrierStatus.vi,
                safetyAdvisory: zone.safetyAdvisory,
            },
        });
    });

    return {
        type: "FeatureCollection",
        features,
    };
};

/**
 * Haversine formula distance between two coordinates in meters.
 */
export const haversineDistanceMeters = (coord1, coord2) => {
    if (!coord1 || !coord2) return Infinity;
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;
    const R = 6371000;
    const toRad = (x) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Find the nearest emergency cellular hotspot for a given position
 */
export const findNearestHotspot = (coordinates, fortSlug = null) => {
    if (!coordinates) return null;
    const hotspots = CELLULAR_ZONES.filter(
        (z) => z.type === "emergency_hotspot" && (!fortSlug || z.fortSlug.toLowerCase() === fortSlug.toLowerCase())
    );

    let closest = null;
    let minDistance = Infinity;

    hotspots.forEach((h) => {
        const d = haversineDistanceMeters(coordinates, h.coordinates);
        if (d < minDistance) {
            minDistance = d;
            closest = {
                ...h,
                distanceMeters: Math.round(d),
            };
        }
    });

    return closest;
};
