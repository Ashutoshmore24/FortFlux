// ── MapTiler + MapLibre Configuration ──
// Centralizes all map configuration. Never hard-code API keys here.

export const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY || "982Xo8OxjE6zO6UViea9";

// ── Map Styles (Only Satellite & Terrain — Dark Mode Removed) ──
export const MAP_STYLES = {
    satellite: {
        id: "satellite",
        name: "Satellite",
        url: `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`,
    },
    terrain: {
        id: "terrain",
        name: "Terrain",
        style: {
            version: 8,
            name: "Terrain",
            glyphs: `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${MAPTILER_KEY}`,
            sprite: `https://api.maptiler.com/maps/outdoor-v2/sprite`,
            sources: {
                "maptiler-topo": {
                    type: "raster",
                    tiles: [
                        `https://api.maptiler.com/maps/topo-v2/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
                    ],
                    tileSize: 256,
                    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
                    maxzoom: 18,
                },
            },
            layers: [
                {
                    id: "maptiler-topo-tiles",
                    type: "raster",
                    source: "maptiler-topo",
                    minzoom: 0,
                    maxzoom: 22,
                },
            ],
        },
    },
};

// ── Terrain DEM source (for 3D elevation) ──
export const TERRAIN_SOURCE = {
    id: "maptiler-terrain",
    type: "raster-dem",
    url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
    tileSize: 256,
};

export const TERRAIN_EXAGGERATION = 1.2;

// ── Initial Camera ──
export const INITIAL_CENTER = [73.8, 18.5]; // [lng, lat] — Maharashtra/Sahyadri focus
export const INITIAL_ZOOM = 8;
export const INITIAL_PITCH = 0;
export const INITIAL_BEARING = 0;

// ── Fort Selection Camera ──
export const FORT_ZOOM = 14;
export const FORT_FLY_SPEED = 1.2;

// ── 3D Terrain Camera ──
export const TERRAIN_3D_PITCH = 60;
export const TERRAIN_3D_BEARING = -20;
export const ROTATION_STEP = 45; // degrees per rotate step
export const PITCH_STEP = 15;    // degrees per pitch step
export const MAX_PITCH = 85;
export const MIN_PITCH = 0;

// ── Maharashtra Bounds (safety boundary) ──
export const MAHARASHTRA_BOUNDS = [
    [72.6, 15.6], // SW [lng, lat]
    [80.9, 21.0], // NE [lng, lat]
];

// ── Trail Risk Colors (exact match to existing system) ──
export const RISK_COLORS = {
    safe: "#22c55e",       // 0–29%
    moderate: "#84cc16",   // 30–49%
    caution: "#f59e0b",    // 50–74%
    critical: "#ef4444",   // 75%+
};

// ── Cistern Status Colors ──
export const CISTERN_COLORS = {
    normal: "#3b82f6",
    elevated: "#f59e0b",
    overflow: "#ef4444",
};

// ── Fort Marker Colors ──
export const FORT_MARKER = {
    default: "#0ea5e9",
    selected: "#f59e0b",
    seaFort: "#06b6d4",
    border: "rgba(255,255,255,0.9)",
};

// ── GeoJSON Source IDs ──
export const SOURCES = {
    forts: "forts-source",
    trails: "trails-source",
    cisterns: "cisterns-source",
};

// ── Layer IDs ──
export const LAYERS = {
    fortCircles: "fort-circles",
    fortLabels: "fort-labels",
    fortSelected: "fort-selected",
    trailLines: "trail-lines",
    trailSimulated: "trail-simulated",
    cisternCircles: "cistern-circles",
    cisternBorder: "cistern-border",
};
