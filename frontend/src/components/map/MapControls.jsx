// ── Map Controls Panel ──
// Provides map style switching, 3D camera controls, layer toggles, GPS, reset, and fullscreen.
// Matches the FortFlux dark glassmorphism design system.

import {
    Mountain,
    Navigation,
    Droplets,
    Layers,
    Globe,
    Satellite,
    Compass,
    LocateFixed,
    RotateCcw,
    RotateCw,
    Camera,
    ChevronUp,
    ChevronDown,
    Orbit,
    Hand,
    Maximize2,
    Minimize2,
} from "lucide-react";

const MapControls = ({
    mapStyle,
    onStyleChange,
    showTrails,
    onToggleTrails,
    showCisterns,
    onToggleCisterns,
    showReports = true,
    onToggleReports,
    terrainEnabled,
    onToggleTerrain,
    onResetView,
    onLocateMe,
    isLocating = false,
    isFullscreen = false,
    onToggleFullscreen,
    bearing = 0,
    pitch = 0,
    onRotateLeft,
    onRotateRight,
    onPitchUp,
    onPitchDown,
    onResetNorth,
    isAutoRotating = false,
    onToggleAutoRotate,
    interactionMode = "pan",
    onToggleInteractionMode,
}) => {
    return (
        <div className="absolute top-3 right-3 z-[10] flex flex-col gap-1.5 w-[215px] max-h-[calc(100%-24px)] overflow-y-auto overflow-x-hidden pr-0.5 select-none">
            {/* 1. Map Style Switcher (Compact 3-Column Grid) */}
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-2 flex flex-col gap-1.5 shadow-lg shadow-slate-950/20">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-500" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Map Style</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-1">
                    {/* Satellite */}
                    <button
                        type="button"
                        onClick={() => onStyleChange("satellite")}
                        aria-label="Switch to satellite map style"
                        title="Satellite imagery"
                        className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-medium transition cursor-pointer active:scale-95 ${
                            mapStyle === "satellite"
                                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                                : "bg-slate-800/90 text-slate-400 border border-slate-700 hover:text-slate-200 hover:bg-slate-750"
                        }`}
                    >
                        <Satellite className="w-3.5 h-3.5 mb-0.5 text-sky-400" />
                        <span>Satellite</span>
                    </button>

                    {/* Topo Terrain */}
                    <button
                        type="button"
                        onClick={() => onStyleChange("terrain")}
                        aria-label="Switch to topographic terrain map style"
                        title="Topographic terrain & contours"
                        className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-medium transition cursor-pointer active:scale-95 ${
                            mapStyle === "terrain"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                                : "bg-slate-800/90 text-slate-400 border border-slate-700 hover:text-slate-200 hover:bg-slate-750"
                        }`}
                    >
                        <Globe className="w-3.5 h-3.5 mb-0.5 text-emerald-400" />
                        <span>Topo</span>
                    </button>

                    {/* 3D Terrain Toggle */}
                    <button
                        type="button"
                        onClick={onToggleTerrain}
                        aria-label="Toggle 3D terrain"
                        title={terrainEnabled ? "Disable 3D elevation" : "Enable 3D elevation"}
                        className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-medium transition cursor-pointer active:scale-95 ${
                            terrainEnabled
                                ? "bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm ring-1 ring-amber-400/30"
                                : "bg-slate-800/90 text-slate-400 border border-slate-700 hover:text-slate-200 hover:bg-slate-750"
                        }`}
                    >
                        <Mountain className="w-3.5 h-3.5 mb-0.5 text-amber-400" />
                        <span className="flex items-center gap-0.5">
                            3D {terrainEnabled && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                        </span>
                    </button>
                </div>
            </div>

            {/* 2. 3D Camera & Rotation Controls (Expanded when 3D mode is active) */}
            {terrainEnabled && (
                <div className="bg-slate-900/95 backdrop-blur-md border border-amber-500/40 rounded-xl p-2 flex flex-col gap-1.5 shadow-lg shadow-amber-950/25 ring-1 ring-amber-500/20 animate-in fade-in zoom-in-95 duration-200">
                    {/* Header with live bearing and pitch */}
                    <div className="flex items-center justify-between px-0.5">
                        <div className="flex items-center gap-1 text-amber-300">
                            <Orbit className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">3D Orbit</span>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-mono font-semibold text-slate-300 bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-700">
                            <span title="Compass bearing">{Math.round((bearing % 360 + 360) % 360)}°</span>
                            <span className="text-slate-500">|</span>
                            <span title="Camera tilt">{Math.round(pitch)}° tilt</span>
                        </div>
                    </div>

                    {/* 3D Directional D-Pad */}
                    <div className="grid grid-cols-3 gap-1 items-center justify-items-center bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
                        <div />
                        <button
                            type="button"
                            onClick={onPitchUp}
                            title="Tilt Up / Higher 3D Perspective"
                            aria-label="Tilt camera up"
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 transition cursor-pointer active:scale-95"
                        >
                            <ChevronUp className="w-4 h-4" />
                        </button>
                        <div />

                        <button
                            type="button"
                            onClick={onRotateLeft}
                            title="Rotate Left (-45°)"
                            aria-label="Rotate map left"
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 transition cursor-pointer active:scale-95"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={onResetNorth}
                            title="Snap to North (0°)"
                            aria-label="Reset orientation to North"
                            className="w-7 h-7 flex flex-col items-center justify-center rounded-md bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition cursor-pointer active:scale-95 font-bold text-[9px]"
                        >
                            <Compass className="w-3 h-3 text-amber-400" />
                            N
                        </button>
                        <button
                            type="button"
                            onClick={onRotateRight}
                            title="Rotate Right (+45°)"
                            aria-label="Rotate map right"
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 transition cursor-pointer active:scale-95"
                        >
                            <RotateCw className="w-3.5 h-3.5" />
                        </button>

                        <div />
                        <button
                            type="button"
                            onClick={onPitchDown}
                            title="Tilt Down / Flatter Angle"
                            aria-label="Tilt camera down"
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 transition cursor-pointer active:scale-95"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        <div />
                    </div>

                    {/* 360° Auto Orbit Continuous Spin */}
                    <button
                        type="button"
                        onClick={onToggleAutoRotate}
                        aria-label="Toggle 360 degree auto orbit"
                        title={isAutoRotating ? "Pause 360° orbit" : "Start continuous 360° cinematic orbit"}
                        className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] font-medium transition cursor-pointer active:scale-95 ${
                            isAutoRotating
                                ? "bg-amber-500/25 text-amber-200 border border-amber-400 shadow-sm shadow-amber-500/20"
                                : "bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:border-slate-600"
                        }`}
                    >
                        <div className="flex items-center gap-1.5">
                            <Orbit className={`w-3.5 h-3.5 ${isAutoRotating ? "animate-spin text-amber-400" : "text-slate-400"}`} />
                            <span>360° Auto Orbit</span>
                        </div>
                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${isAutoRotating ? "bg-amber-400 text-slate-950 font-black" : "bg-slate-700 text-slate-300"}`}>
                            {isAutoRotating ? "ON" : "OFF"}
                        </span>
                    </button>

                    {/* Left Click Drag Mode: Pan vs Orbit */}
                    <div className="flex items-center justify-between bg-slate-950/60 p-1 rounded-lg border border-slate-800">
                        <span className="text-[9px] font-semibold text-slate-400 pl-1">Drag:</span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => onToggleInteractionMode("pan")}
                                title="Left click drag pans map"
                                aria-label="Pan mode"
                                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                                    interactionMode === "pan"
                                        ? "bg-sky-500/25 text-sky-200 border border-sky-500/40 shadow-sm"
                                        : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <Hand className="w-2.5 h-2.5" />
                                Pan
                            </button>
                            <button
                                type="button"
                                onClick={() => onToggleInteractionMode("rotate")}
                                title="Left click drag freely spins and tilts 3D view"
                                aria-label="Orbit rotate mode"
                                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                                    interactionMode === "rotate"
                                        ? "bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-sm shadow-amber-500/20"
                                        : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <RotateCw className="w-2.5 h-2.5" />
                                Orbit
                            </button>
                        </div>
                    </div>

                    {/* Hint text */}
                    <p className="text-[9px] text-slate-400/80 leading-tight px-0.5">
                        💡 <span className="text-slate-300">Right-click + drag</span> or use <span className="text-amber-300">Orbit</span> mode to rotate.
                    </p>
                </div>
            )}

            {/* 3. Layer Toggle Buttons (Compact Grid) */}
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-2 flex flex-col gap-1.5 shadow-lg shadow-slate-950/20">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-slate-500" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Layers</span>
                    </div>
                </div>

                <div className={`grid ${onToggleReports ? "grid-cols-3" : "grid-cols-2"} gap-1`}>
                    <button
                        type="button"
                        onClick={onToggleTrails}
                        aria-label="Toggle trail layer visibility"
                        title={showTrails ? "Hide trails" : "Show trails"}
                        className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[10px] font-medium transition cursor-pointer active:scale-95 ${
                            showTrails
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 shadow-sm shadow-emerald-500/10"
                                : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200 hover:bg-slate-750"
                        }`}
                    >
                        <Navigation className="w-3 h-3 text-emerald-400" />
                        <span>Trails</span>
                    </button>

                    <button
                        type="button"
                        onClick={onToggleCisterns}
                        aria-label="Toggle cistern layer visibility"
                        title={showCisterns ? "Hide cisterns" : "Show cisterns"}
                        className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[10px] font-medium transition cursor-pointer active:scale-95 ${
                            showCisterns
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/35 shadow-sm shadow-blue-500/10"
                                : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200 hover:bg-slate-750"
                        }`}
                    >
                        <Droplets className="w-3 h-3 text-blue-400" />
                        <span>Cisterns</span>
                    </button>

                    {onToggleReports && (
                        <button
                            type="button"
                            onClick={onToggleReports}
                            aria-label="Toggle photo evidence layer visibility"
                            title={showReports ? "Hide photo evidence" : "Show photo evidence"}
                            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[10px] font-medium transition cursor-pointer active:scale-95 ${
                                showReports
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/35 shadow-sm shadow-amber-500/10"
                                    : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200 hover:bg-slate-750"
                            }`}
                        >
                            <Camera className="w-3 h-3 text-amber-400" />
                            <span>Photos</span>
                        </button>
                    )}
                </div>
            </div>

            {/* 4. Utility Row: Fullscreen, Reset View, Locate Me */}
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 flex items-center justify-between gap-1 shadow-lg shadow-slate-950/20">
                {/* Fullscreen Button */}
                {onToggleFullscreen && (
                    <button
                        type="button"
                        onClick={onToggleFullscreen}
                        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                        title={isFullscreen ? "Exit Fullscreen (ESC)" : "Enter Fullscreen"}
                        className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-[10px] font-medium transition cursor-pointer active:scale-95 ${
                            isFullscreen
                                ? "bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-sm"
                                : "bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-750"
                        }`}
                    >
                        {isFullscreen ? (
                            <Minimize2 className="w-3 h-3 text-purple-400" />
                        ) : (
                            <Maximize2 className="w-3 h-3 text-purple-400" />
                        )}
                        <span>{isFullscreen ? "Exit" : "Full"}</span>
                    </button>
                )}

                {/* Reset View */}
                <button
                    type="button"
                    onClick={onResetView}
                    aria-label="Reset map view"
                    title="Reset view to default"
                    className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-[10px] font-medium transition cursor-pointer bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-750 active:scale-95"
                >
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    <span>Reset</span>
                </button>

                {/* Locate Me (GPS) */}
                <button
                    type="button"
                    onClick={onLocateMe}
                    aria-label="Locate me using GPS"
                    title="Show my location"
                    className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-[10px] font-medium transition cursor-pointer active:scale-95 ${
                        isLocating
                            ? "bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 shadow-sm"
                            : "bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-750"
                    }`}
                >
                    <LocateFixed className={`w-3 h-3 text-cyan-400 ${isLocating ? "animate-pulse" : ""}`} />
                    <span>GPS</span>
                </button>
            </div>
        </div>
    );
};

export default MapControls;
