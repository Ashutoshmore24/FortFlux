import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, Tooltip, useMap, LayersControl } from "react-leaflet";
import L from "leaflet";
import { useFortStore } from "../../store/useFortStore";
import { RiskLegend } from "./RiskLegend";
import { Mountain, Navigation, Droplets, AlertTriangle, CheckCircle2, MapPin, Layers, Globe, MapIcon, Satellite } from "lucide-react";

// ── Map Tile Styles (all free, no API key) ──
const MAP_STYLES = {
    dark: {
        name: "Dark",
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        attribution: "Esri",
        labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
    },
    satellite: {
        name: "Satellite",
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "Esri World Imagery",
        labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    },
    terrain: {
        name: "Terrain",
        url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attribution: "OpenTopoMap",
        labels: null,
    },
};

const HILLSHADE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}";

// Fix Leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ── Custom Fort Marker Icons ──
const createFortIcon = (color, size = 28) =>
    L.divIcon({
        className: "fort-marker-icon",
        html: `<div style="
            width: ${size}px; height: ${size}px;
            background: ${color};
            border: 3px solid rgba(255,255,255,0.9);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            display: flex; align-items: center; justify-content: center;
        ">
            <span style="transform: rotate(45deg); font-size: ${size * 0.42}px;">🏰</span>
        </div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
    });

const fortIconDefault = createFortIcon("#0ea5e9");
const fortIconSelected = createFortIcon("#f59e0b", 36);
const seaFortIcon = createFortIcon("#06b6d4");

// ── Trail Colors by Status ──
const getTrailColor = (status, riskScore) => {
    if (status === "closed" || status === "diverted") return "#ef4444"; // red
    if (status === "caution" || riskScore >= 50) return "#f59e0b"; // amber
    if (riskScore >= 30) return "#84cc16"; // lime
    return "#22c55e"; // green
};

const getTrailDash = (status) => {
    if (status === "closed") return "12 8";
    if (status === "diverted") return "8 4 2 4";
    if (status === "caution") return "6 4";
    return null;
};

// ── Map Center Control ──
const FlyToFort = ({ coordinates }) => {
    const map = useMap();
    useEffect(() => {
        if (coordinates) {
            map.flyTo([coordinates[1], coordinates[0]], 14, { duration: 1.2 });
        }
    }, [coordinates, map]);
    return null;
};

// ── Maharashtra bounding box ──
const MAHARASHTRA_CENTER = [18.5, 73.8];
const MAHARASHTRA_BOUNDS = [
    [15.6, 72.6], // SW corner
    [21.0, 80.9], // NE corner
];

const FortMap = ({ className = "", onFortSelect, riskOverrides = null }) => {
    const {
        forts,
        selectedFort,
        fortDetail,
        isLoading,
        fetchForts,
        selectFort,
        clearSelection,
    } = useFortStore();

    const [showTrails, setShowTrails] = useState(true);
    const [showCisterns, setShowCisterns] = useState(true);
    const [mapStyle, setMapStyle] = useState("dark");
    const [showHillshade, setShowHillshade] = useState(false);

    useEffect(() => {
        if (forts.length === 0) fetchForts();
    }, []);

    const handleFortClick = async (fort) => {
        await selectFort(fort);
        if (onFortSelect) onFortSelect(fort);
    };

    const trails = fortDetail?.trails || [];
    const cisterns = fortDetail?.cisterns || [];

    return (
        <div className={`relative rounded-2xl overflow-hidden border border-slate-700 ${className}`}>
            <MapContainer
                center={MAHARASHTRA_CENTER}
                zoom={8}
                maxBounds={MAHARASHTRA_BOUNDS}
                maxBoundsViscosity={0.8}
                attributionControl={false}
                style={{ height: "100%", width: "100%", minHeight: "500px" }}
                className="bg-slate-950"
            >
                {/* Dynamic tile layer based on selected style */}
                <TileLayer
                    key={`base-${mapStyle}`}
                    url={MAP_STYLES[mapStyle].url}
                />

                {/* Labels overlay for dark & satellite modes */}
                {MAP_STYLES[mapStyle].labels && (
                    <TileLayer
                        key={`labels-${mapStyle}`}
                        url={MAP_STYLES[mapStyle].labels}
                        zIndex={2}
                    />
                )}

                {/* Hillshade overlay for 3D terrain depth effect */}
                {showHillshade && (
                    <TileLayer
                        key="hillshade"
                        url={HILLSHADE_URL}
                        opacity={mapStyle === "satellite" ? 0.35 : mapStyle === "dark" ? 0.25 : 0.2}
                        zIndex={1}
                    />
                )}

                {/* Fly to selected fort */}
                {selectedFort?.location?.coordinates && (
                    <FlyToFort coordinates={selectedFort.location.coordinates} />
                )}

                {/* Fort Markers */}
                {forts.map((fort) => {
                    const [lng, lat] = fort.location?.coordinates || [];
                    if (!lat || !lng) return null;

                    const isSelected = selectedFort?.slug === fort.slug;
                    const isSeaFort = fort.elevation <= 15;

                    return (
                        <Marker
                            key={fort._id}
                            position={[lat, lng]}
                            icon={isSelected ? fortIconSelected : isSeaFort ? seaFortIcon : fortIconDefault}
                            eventHandlers={{
                                click: () => handleFortClick(fort),
                            }}
                        >
                            <Popup className="fort-popup" maxWidth={280}>
                                <div className="p-1">
                                    <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                                        🏰 {fort.name}
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded-full">
                                            ⛰️ {fort.elevation}m
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-semibold rounded-full">
                                            📍 {fort.district}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-semibold rounded-full">
                                            🗺️ {fort.region}
                                        </span>
                                    </div>
                                    {fort.description && (
                                        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                                            {fort.description}
                                        </p>
                                    )}
                                    {fort.baseVillage && (
                                        <p className="text-[10px] text-slate-400 mt-1.5">
                                            Base village: <span className="font-medium text-slate-600">{fort.baseVillage}</span>
                                        </p>
                                    )}
                                </div>
                            </Popup>
                            <Tooltip direction="top" offset={[0, -30]} opacity={0.95}>
                                <span className="text-xs font-semibold">{fort.name}</span>
                            </Tooltip>
                        </Marker>
                    );
                })}

                {/* Trail Polylines (shown when a fort is selected) */}
                {showTrails && trails.map((trail) => {
                    // Trail.path is [[lng, lat], ...] — need to convert to [[lat, lng], ...]
                    const positions = (trail.path || []).map(([lng, lat]) => [lat, lng]);
                    if (positions.length < 2) return null;

                    // Use overridden risk score if provided (from Authority simulation sliders)
                    const effectiveRisk = riskOverrides?.get(trail._id) ?? trail.currentRiskScore;
                    const effectiveStatus = effectiveRisk >= 75 ? "closed" : trail.status;
                    const color = getTrailColor(effectiveStatus, effectiveRisk);
                    const dashArray = getTrailDash(effectiveStatus);
                    const isSimulated = riskOverrides?.has(trail._id) && riskOverrides.get(trail._id) !== trail.currentRiskScore;

                    return (
                        <Polyline
                            key={trail._id}
                            positions={positions}
                            pathOptions={{
                                color,
                                weight: isSimulated ? 5 : 4,
                                opacity: 0.85,
                                dashArray,
                                lineCap: "round",
                                lineJoin: "round",
                            }}
                        >
                            <Tooltip sticky opacity={0.95}>
                                <div className="text-xs">
                                    <div className="font-bold text-slate-800">{trail.name}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span>Risk: <strong style={{ color }}>{Math.round(effectiveRisk)}%</strong></span>
                                        {isSimulated && <span style={{ color: '#f59e0b', fontWeight: 600 }}>⚡ Simulated</span>}
                                        <span>•</span>
                                        <span className="capitalize">{effectiveStatus}</span>
                                        <span>•</span>
                                        <span>{trail.distanceKm} km</span>
                                    </div>
                                </div>
                            </Tooltip>
                        </Polyline>
                    );
                })}

                {/* Cistern Markers (shown when a fort is selected) */}
                {showCisterns && cisterns.map((cistern) => {
                    const [lng, lat] = cistern.location?.coordinates || [];
                    if (!lat || !lng) return null;

                    const fillColor =
                        cistern.status === "overflow" ? "#ef4444" :
                            cistern.status === "elevated" ? "#f59e0b" :
                                "#3b82f6";

                    return (
                        <CircleMarker
                            key={cistern._id}
                            center={[lat, lng]}
                            radius={7}
                            pathOptions={{
                                color: "rgba(255,255,255,0.8)",
                                weight: 2,
                                fillColor,
                                fillOpacity: 0.85,
                            }}
                        >
                            <Tooltip direction="right" offset={[10, 0]} opacity={0.95}>
                                <div className="text-xs">
                                    <div className="font-bold text-slate-800 flex items-center gap-1">
                                        💧 {cistern.name}
                                    </div>
                                    <div className="text-slate-600 mt-0.5">
                                        Level: <strong>{cistern.currentLevelPct}%</strong> / {cistern.capacityLiters.toLocaleString()}L
                                    </div>
                                    <div className="capitalize text-slate-500">Status: {cistern.status}</div>
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    );
                })}
            </MapContainer>

            {/* Map Controls Overlay */}
            <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
                {/* Map Style Switcher */}
                <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-xl p-2 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1 px-1 mb-0.5">
                        <Layers className="w-3 h-3 text-slate-500" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Map Style</span>
                    </div>
                    <button
                        onClick={() => setMapStyle("dark")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition ${mapStyle === "dark"
                            ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
                            }`}
                    >
                        <MapIcon className="w-3 h-3" />
                        Dark
                    </button>
                    <button
                        onClick={() => setMapStyle("satellite")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition ${mapStyle === "satellite"
                            ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
                            }`}
                    >
                        <Satellite className="w-3 h-3" />
                        Satellite
                    </button>
                    <button
                        onClick={() => setMapStyle("terrain")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition ${mapStyle === "terrain"
                            ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
                            }`}
                    >
                        <Globe className="w-3 h-3" />
                        Terrain
                    </button>

                    {/* Hillshade 3D toggle */}
                    <button
                        onClick={() => setShowHillshade(!showHillshade)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition ${showHillshade
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
                            }`}
                    >
                        <Mountain className="w-3 h-3" />
                        3D Relief
                    </button>
                </div>

                {/* Layer Toggle Buttons */}
                <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-xl p-2 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1 px-1 mb-0.5">
                        <Navigation className="w-3 h-3 text-slate-500" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Layers</span>
                    </div>
                    <button
                        onClick={() => setShowTrails(!showTrails)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition ${showTrails
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                    >
                        <Navigation className="w-3 h-3" />
                        Trails
                    </button>
                    <button
                        onClick={() => setShowCisterns(!showCisterns)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition ${showCisterns
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                    >
                        <Droplets className="w-3 h-3" />
                        Cisterns
                    </button>
                </div>
            </div>

            {/* Fort Info Panel (shown when a fort is selected) */}
            {selectedFort && fortDetail && (
                <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-2xl p-4 max-w-md">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                                🏰 {selectedFort.name}
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                {selectedFort.elevation}m ASL · {selectedFort.district} · {selectedFort.region}
                            </p>
                        </div>
                        <button
                            onClick={clearSelection}
                            className="text-slate-400 hover:text-white text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-lg transition"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Trail summary */}
                    {trails.length > 0 && (
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                            {trails.map((trail) => (
                                <div
                                    key={trail._id}
                                    className="flex items-center justify-between text-[11px] bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2"
                                >
                                    <div className="flex-1 min-w-0 mr-2">
                                        <div className="font-medium text-slate-200 truncate">{trail.name}</div>
                                        <div className="text-slate-500 text-[10px]">{trail.distanceKm} km · {trail.difficulty}</div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span
                                            className="font-bold text-[10px]"
                                            style={{ color: getTrailColor(trail.status, trail.currentRiskScore) }}
                                        >
                                            Risk {trail.currentRiskScore}%
                                        </span>
                                        {trail.status === "open" ? (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                        ) : trail.status === "caution" ? (
                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                        ) : (
                                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Cistern summary */}
                    {cisterns.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                            <Droplets className="w-3 h-3 text-blue-400" />
                            <span>{cisterns.length} cistern{cisterns.length > 1 ? "s" : ""} ·
                                Total capacity: {cisterns.reduce((s, c) => s + c.capacityLiters, 0).toLocaleString()}L
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Risk Legend */}
            <RiskLegend />

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-[1000] bg-slate-950/60 flex items-center justify-center">
                    <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-xl px-5 py-3">
                        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-slate-300">Loading forts...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FortMap;
