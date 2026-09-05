// ── Map Controls Panel ──
// Provides map style switching, layer toggles, terrain controls, GPS, and camera reset.
// Matches the existing FortFlux dark glassmorphism design.

import { Mountain, Navigation, Droplets, Layers, Globe, MapIcon, Satellite, Compass, LocateFixed, RotateCcw } from "lucide-react";

const MapControls = ({
    mapStyle,
    onStyleChange,
    showTrails,
    onToggleTrails,
    showCisterns,
    onToggleCisterns,
    terrainEnabled,
    onToggleTerrain,
    onResetView,
    onLocateMe,
    isLocating = false,
}) => {
    return (
        <div className="absolute top-3 right-3 z-[10] flex flex-col gap-2">
            {/* Map Style Switcher */}
            <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-xl p-2 flex flex-col gap-1.5">
                <div className="flex items-center gap-1 px-1 mb-0.5">
                    <Layers className="w-3 h-3 text-slate-500" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Map Style</span>
                </div>
                {/* 1. Satellite Style */}
                <button
                    onClick={() => onStyleChange("satellite")}
                    aria-label="Switch to satellite map style"
                    title="Satellite imagery"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer ${mapStyle === "satellite"
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/10"
                        : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
                        }`}
                >
                    <Satellite className="w-3 h-3" />
                    Satellite
                </button>

                {/* 2. Terrain Style */}
                <button
                    onClick={() => onStyleChange("terrain")}
                    aria-label="Switch to terrain map style"
                    title="Topographic terrain & contours"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer ${mapStyle === "terrain"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10"
                        : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
                        }`}
                >
                    <Globe className="w-3 h-3" />
                    Terrain
                </button>

                {/* 3. 3D Terrain Toggle */}
                <button
                    onClick={onToggleTerrain}
                    aria-label="Toggle 3D terrain"
                    title={terrainEnabled ? "Disable 3D elevation" : "Enable 3D elevation"}
                    className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer ${terrainEnabled
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20 ring-1 ring-amber-400/30"
                        : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Mountain className="w-3 h-3" />
                        3D Terrain
                    </div>
                    {terrainEnabled && (
                        <span className="text-[9px] font-bold uppercase bg-amber-500/30 text-amber-200 px-1 py-0.2 rounded">
                            3D ON
                        </span>
                    )}
                </button>
            </div>

            {/* Layer Toggle Buttons */}
            <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-xl p-2 flex flex-col gap-1.5">
                <div className="flex items-center gap-1 px-1 mb-0.5">
                    <Navigation className="w-3 h-3 text-slate-500" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Layers</span>
                </div>
                <button
                    onClick={onToggleTrails}
                    aria-label="Toggle trail layer visibility"
                    title={showTrails ? "Hide trails" : "Show trails"}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer ${showTrails
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                >
                    <Navigation className="w-3 h-3" />
                    Trails
                </button>
                <button
                    onClick={onToggleCisterns}
                    aria-label="Toggle cistern layer visibility"
                    title={showCisterns ? "Hide cisterns" : "Show cisterns"}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer ${showCisterns
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                >
                    <Droplets className="w-3 h-3" />
                    Cisterns
                </button>
            </div>

            {/* Camera Controls */}
            <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-xl p-2 flex flex-col gap-1.5">
                <button
                    onClick={onResetView}
                    aria-label="Reset map view"
                    title="Reset view to default"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
                >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                </button>
                <button
                    onClick={onLocateMe}
                    aria-label="Locate me using GPS"
                    title="Show my location"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer ${isLocating
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
                        }`}
                >
                    <LocateFixed className={`w-3 h-3 ${isLocating ? "animate-pulse" : ""}`} />
                    Locate Me
                </button>
            </div>
        </div>
    );
};

export default MapControls;
