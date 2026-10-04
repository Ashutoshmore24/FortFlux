// ── FortFlux Offline Map & Survival Storage Engine ──
// Production-grade IndexedDB storage for offline fort trails, cisterns,
// cellular dead zones, landmarks, emergency contacts, and cached map tiles.

import { axiosInstance } from "../lib/axios";
import { CELLULAR_ZONES, cellularCoverageToGeoJSON } from "../data/cellularCoverageData";
import { FORT_HISTORY_DETAILS, FORT_GPS_COORDINATES, FORT_LANDMARK_COORDINATES } from "../data/fortHistoryData";

const DB_NAME = "fortflux_offline_db";
const DB_VERSION = 1;
const STORE_PACKS = "offline_packs";
const STORE_TILES = "offline_tiles";

/**
 * Emergency rescue contacts for Sahyadri mountain treks.
 */
export const EMERGENCY_RESCUE_CONTACTS = [
    {
        name: "Maharashtra State Emergency Hotline",
        number: "112",
        type: "Toll-Free Police & Disaster Response",
        active: "24x7",
    },
    {
        name: "Sahyadri Mountain Rescue Brigade (SMRB)",
        number: "+91 94220 89201",
        type: "Volunteer High-Angle Cliff Rescue",
        active: "24x7 Emergency",
    },
    {
        name: "Pune District Disaster Control Cell",
        number: "020-26123371",
        type: "Disaster Management Authority",
        active: "24x7",
    },
    {
        name: "Raigad District Disaster Cell",
        number: "02141-222118",
        type: "Konkan Escarpment Rescue",
        active: "24x7",
    },
    {
        name: "Maharashtra Forest Dept. Wildfire & Rescue",
        number: "1926",
        type: "Sanctuary & Forest Patrol",
        active: "24x7 Toll-Free",
    },
];

/**
 * Initialize IndexedDB with schema.
 */
export const openOfflineDB = () => {
    return new Promise((resolve, reject) => {
        if (typeof window === "undefined" || !("indexedDB" in window)) {
            return reject(new Error("IndexedDB is not supported in this browser"));
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_PACKS)) {
                db.createObjectStore(STORE_PACKS, { keyPath: "fortSlug" });
            }
            if (!db.objectStoreNames.contains(STORE_TILES)) {
                db.createObjectStore(STORE_TILES, { keyPath: "url" });
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
};

/**
 * Format bytes into human-readable string (KB, MB).
 */
export const formatBytes = (bytes, decimals = 1) => {
    if (!bytes || bytes === 0) return "0 KB";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

/**
 * Download comprehensive offline pack for a fort into IndexedDB.
 */
export const downloadFortOfflinePack = async (fortSlug, onProgress = null) => {
    const notify = (percent, message) => {
        if (typeof onProgress === "function") {
            onProgress({ percent, message });
        }
    };

    try {
        notify(10, `Initializing offline cache for ${fortSlug}...`);
        const db = await openOfflineDB();

        notify(25, "Fetching live fort geometry, trails & cisterns...");
        let fortData = null;

        try {
            const res = await axiosInstance.get(`/forts/${fortSlug}`, { timeout: 15000 });
            fortData = res.data;
        } catch (apiErr) {
            console.warn(`[OfflineManager] API fetch failed for ${fortSlug}, using synthesized backup:`, apiErr.message);
            // Fallback synthesized package from fortHistoryData if API offline
            const coords = FORT_GPS_COORDINATES[fortSlug] || { lng: 73.6822, lat: 18.2459, elevation: 1300 };
            const hist = FORT_HISTORY_DETAILS[fortSlug] || { name: fortSlug };
            fortData = {
                fort: {
                    name: hist.name || fortSlug,
                    slug: fortSlug,
                    elevation: coords.elevation || 1200,
                    location: { coordinates: [coords.lng, coords.lat] },
                    region: "Sahyadri",
                    district: "Pune / Raigad",
                },
                trails: [],
                cisterns: [],
            };
        }

        notify(55, "Bundling mountain cellular dead zones & rescue points...");
        const cellularZones = CELLULAR_ZONES.filter(
            (z) => z.fortSlug.toLowerCase() === fortSlug.toLowerCase()
        );
        const cellularGeoJSON = cellularCoverageToGeoJSON(fortSlug);
        const historyDetails = FORT_HISTORY_DETAILS[fortSlug] || null;
        const landmarks = FORT_LANDMARK_COORDINATES[fortSlug] || [];
        const gpsCoords = FORT_GPS_COORDINATES[fortSlug] || null;

        notify(75, "Compiling offline field survival kit & emergency guide...");

        const packPayload = {
            fortSlug: fortSlug.toLowerCase(),
            fortName: fortData.fort?.name || fortSlug,
            downloadedAt: Date.now(),
            downloadedDateString: new Date().toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                dateStyle: "medium",
                timeStyle: "short",
            }),
            version: "1.0",
            fort: fortData.fort,
            trails: fortData.trails || [],
            cisterns: fortData.cisterns || [],
            cellularZones,
            cellularGeoJSON,
            landmarks,
            historyDetails,
            gpsCoords,
            emergencyContacts: EMERGENCY_RESCUE_CONTACTS,
            offlineTips: [
                "Turn off Mobile Data & WiFi when in dead zones to prevent continuous antenna hunting that drains phone battery in ~90 mins.",
                "Keep phone in battery-saver mode and warm inside backpack pocket during dense cold fog.",
                "Whistle protocol: 3 blasts of whistle (or flash of torch) repeated every minute is the international distress signal in Sahyadris.",
                "In zero-visibility fog, never walk downhill into uncharted ravines; retrace ridge steps uphill towards known stone fortifications.",
            ],
        };

        // Calculate approximate size in bytes
        const jsonString = JSON.stringify(packPayload);
        const sizeBytes = new Blob([jsonString]).size;
        packPayload.sizeBytes = sizeBytes;
        packPayload.sizeFormatted = formatBytes(sizeBytes);

        notify(90, "Writing offline pack to browser secure storage...");

        // Save to IndexedDB STORE_PACKS
        await new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_PACKS], "readwrite");
            const store = tx.objectStore(STORE_PACKS);
            const putReq = store.put(packPayload);

            putReq.onsuccess = () => resolve(true);
            putReq.onerror = (e) => reject(e.target.error);
        });

        notify(100, `Successfully saved ${packPayload.fortName} offline pack (${packPayload.sizeFormatted})`);
        return { success: true, pack: packPayload };
    } catch (err) {
        console.error(`[OfflineManager] Download failed for ${fortSlug}:`, err);
        notify(0, `Error: ${err.message}`);
        throw err;
    }
};

/**
 * Retrieve cached offline pack for a fort from IndexedDB.
 */
export const getOfflinePack = async (fortSlug) => {
    try {
        const db = await openOfflineDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_PACKS], "readonly");
            const store = tx.objectStore(STORE_PACKS);
            const req = store.get(fortSlug.toLowerCase());

            req.onsuccess = () => {
                resolve(req.result || null);
            };
            req.onerror = (e) => reject(e.target.error);
        });
    } catch (err) {
        console.warn(`[OfflineManager] Failed to read offline pack for ${fortSlug}:`, err.message);
        return null;
    }
};

/**
 * Retrieve all downloaded offline packs from IndexedDB.
 */
export const getAllOfflinePacks = async () => {
    try {
        const db = await openOfflineDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_PACKS], "readonly");
            const store = tx.objectStore(STORE_PACKS);
            const req = store.getAll();

            req.onsuccess = () => {
                resolve(req.result || []);
            };
            req.onerror = (e) => reject(e.target.error);
        });
    } catch (err) {
        console.warn("[OfflineManager] Failed to read all offline packs:", err.message);
        return [];
    }
};

/**
 * Delete a specific offline pack from IndexedDB.
 */
export const deleteOfflinePack = async (fortSlug) => {
    try {
        const db = await openOfflineDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_PACKS], "readwrite");
            const store = tx.objectStore(STORE_PACKS);
            const req = store.delete(fortSlug.toLowerCase());

            req.onsuccess = () => resolve(true);
            req.onerror = (e) => reject(e.target.error);
        });
    } catch (err) {
        console.error(`[OfflineManager] Failed to delete offline pack for ${fortSlug}:`, err);
        return false;
    }
};

/**
 * Clear all offline packs and cached data.
 */
export const clearAllOfflineData = async () => {
    try {
        const db = await openOfflineDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_PACKS, STORE_TILES], "readwrite");
            tx.objectStore(STORE_PACKS).clear();
            tx.objectStore(STORE_TILES).clear();

            tx.oncomplete = () => resolve(true);
            tx.onerror = (e) => reject(e.target.error);
        });
    } catch (err) {
        console.error("[OfflineManager] Failed to clear offline data:", err);
        return false;
    }
};

/**
 * Get total offline storage statistics.
 */
export const getOfflineStorageStats = async () => {
    const packs = await getAllOfflinePacks();
    const totalBytes = packs.reduce((acc, p) => acc + (p.sizeBytes || 0), 0);
    return {
        count: packs.length,
        totalBytes,
        totalFormatted: formatBytes(totalBytes),
        packs: packs.map((p) => ({
            fortSlug: p.fortSlug,
            fortName: p.fortName,
            downloadedAt: p.downloadedAt,
            downloadedDateString: p.downloadedDateString,
            sizeFormatted: p.sizeFormatted,
        })),
    };
};

/**
 * Generate formatted emergency SOS SMS text with trekker GPS coordinates
 */
export const generateEmergencySOS = (coords, fortName = "Sahyadri Fort") => {
    const [lng, lat] = coords || [0, 0];
    const googleMapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
    return `EMERGENCY SOS (FortFlux)
Trekker stranded at ${fortName}.
GPS: Lat ${lat.toFixed(6)}, Lng ${lng.toFixed(6)}
Map: ${googleMapsUrl}
Time: ${new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}
Send Sahyadri Rescue / 112 immediately.`;
};
