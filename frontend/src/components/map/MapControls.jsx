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
            <div className="bg-white/95 backdrop-blur-md border border-[#E2ECE4] rounded-xl p-2 flex flex-col gap-1.5 shadow-md">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-emerald-600" />
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Map Style</span>
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
                                ? "bg-sky-100 text-sky-800 border border-sky-300 font-bold shadow-xs"
                                : "bg-[#F8FAF8] text-slate-600 border border-[#E2ECE4] hover:text-slate-900 hover:bg-white hover:border-emerald-300"
                        }`}
                    >
                        <Satellite className="w-3.5 h-3.5 mb-0.5 text-sky-600" />
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
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold shadow-xs"
                                : "bg-[#F8FAF8] text-slate-600 border border-[#E2ECE4] hover:text-slate-900 hover:bg-white hover:border-emerald-300"
                        }`}
                    >
                        <Globe className="w-3.5 h-3.5 mb-0.5 text-emerald-600" />
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
                                ? "bg-amber-100 text-amber-800 border border-amber-300 font-bold shadow-xs ring-1 ring-amber-300/60"
                                : "bg-[#F8FAF8] text-slate-600 border border-[#E2ECE4] hover:text-slate-900 hover:bg-white hover:border-emerald-300"
                        }`}
                    >
                        <Mountain className="w-3.5 h-3.5 mb-0.5 text-amber-600" />
                        <span className="flex items-center gap-0.5">
                            3D {terrainEnabled && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                        </span>
                    </button>
                </div>
            </div>

            {/* 2. 3D Camera & Rotation Controls (Expanded when 3D mode is active) */}
            {terrainEnabled && (
                <div className="bg-white/95 backdrop-blur-md border border-amber-300/80 rounded-xl p-2 flex flex-col gap-1.5 shadow-md ring-1 ring-amber-200/50 animate-in fade-in zoom-in-95 duration-200">
                    {/* Header with live bearing and pitch */}
                    <div className="flex items-center justify-between px-0.5">
                        <div className="flex items-center gap-1 text-amber-800">
                            <Orbit className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">3D Orbit</span>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-mono font-semibold text-slate-700 bg-[#F5F8F4] px-1.5 py-0.5 rounded border border-[#E2ECE4]">
                            <span title="Compass bearing">{Math.round((bearing % 360 + 360) % 360)}°</span>
                            <span className="text-slate-400">|</span>
                            <span title="Camera tilt">{Math.round(pitch)}° tilt</span>
                        </div>
                    </div>

                    {/* 3D Directional D-Pad */}
                    <div className="grid grid-cols-3 gap-1 items-center justify-items-center bg-[#F5F8F4] p-1.5 rounded-lg border border-[#E2ECE4]">
                        <div />
                        <button
                            type="button"
                            onClick={onPitchUp}
                            title="Tilt Up / Higher 3D Perspective"
                            aria-label="Tilt camera up"
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-[#E2ECE4] hover:border-amber-300 transition cursor-pointer active:scale-95 shadow-xs"
                        >
                            <ChevronUp className="w-4 h-4" />
                        </button>
                        <div />

                        <button
                            type="button"
                            onClick={onRotateLeft}
                            title="Rotate Left (-45°)"
                            aria-label="Rotate map left"
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-[#E2ECE4] hover:border-amber-300 transition cursor-pointer active:scale-95 shadow-xs"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={onResetNorth}
                            title="Snap to North (0°)"
                            aria-label="Reset orientation to North"
                            className="w-7 h-7 flex flex-col items-center justify-center rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition cursor-pointer active:scale-95 font-bold text-[9px] shadow-xs"
                        >
                            <Compass className="w-3 h-3 text-amber-600" />
                            N
                        </button>
                        <button
                            type="button"
                            onClick={onRotateRight}
                            title="Rotate Right (+45°)"
                            aria-label="Rotate map right"
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-[#E2ECE4] hover:border-amber-300 transition cursor-pointer active:scale-95 shadow-xs"
                        >
                            <RotateCw className="w-3.5 h-3.5" />
                        </button>

                        <div />
                        <button
                            type="button"
                            onClick={onPitchDown}
                            title="Tilt Down / Flatter Angle"
                            aria-label="Tilt camera down"
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-[#E2ECE4] hover:border-amber-300 transition cursor-pointer active:scale-95 shadow-xs"
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
                                ? "bg-amber-100 text-amber-900 border border-amber-400 font-bold shadow-xs"
                                : "bg-[#F8FAF8] text-slate-700 border border-[#E2ECE4] hover:bg-white hover:border-amber-300"
                        }`}
                    >
                        <div className="flex items-center gap-1.5">
                            <Orbit className={`w-3.5 h-3.5 ${isAutoRotating ? "animate-spin text-amber-600" : "text-slate-500"}`} />
                            <span>360° Auto Orbit</span>
                        </div>
                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${isAutoRotating ? "bg-amber-500 text-white font-black" : "bg-slate-200 text-slate-700"}`}>
                            {isAutoRotating ? "ON" : "OFF"}
                        </span>
                    </button>

                    {/* Left Click Drag Mode: Pan vs Orbit */}
                    <div className="flex items-center justify-between bg-[#F5F8F4] p-1 rounded-lg border border-[#E2ECE4]">
                        <span className="text-[9px] font-semibold text-slate-600 pl-1">Drag:</span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => onToggleInteractionMode("pan")}
                                title="Left click drag pans map"
                                aria-label="Pan mode"
                                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                                    interactionMode === "pan"
                                        ? "bg-white text-sky-800 border border-sky-300 shadow-xs font-bold"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <Hand className="w-2.5 h-2.5 text-sky-600" />
                                Pan
                            </button>
                            <button
                                type="button"
                                onClick={() => onToggleInteractionMode("rotate")}
                                title="Left click drag freely spins and tilts 3D view"
                                aria-label="Orbit rotate mode"
                                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                                    interactionMode === "rotate"
                                        ? "bg-white text-amber-800 border border-amber-300 shadow-xs font-bold"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <RotateCw className="w-2.5 h-2.5 text-amber-600" />
                                Orbit
                            </button>
                        </div>
                    </div>

                    {/* Hint text */}
                    <p className="text-[9px] text-slate-500 leading-tight px-0.5">
                        💡 <span className="text-slate-700 font-medium">Right-click + drag</span> or use <span className="text-amber-700 font-semibold">Orbit</span> mode to rotate.
                    </p>
                </div>
            )}

            {/* 3. Layer Toggle Buttons (Compact Grid) */}
            <div className="bg-white/95 backdrop-blur-md border border-[#E2ECE4] rounded-xl p-2 flex flex-col gap-1.5 shadow-md">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-emerald-600" />
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Layers</span>
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
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold shadow-xs"
                                : "bg-[#F8FAF8] text-slate-600 border border-[#E2ECE4] hover:text-slate-900 hover:bg-white hover:border-emerald-300"
                        }`}
                    >
                        <Navigation className="w-3 h-3 text-emerald-600" />
                        <span>Trails</span>
                    </button>

                    <button
                        type="button"
                        onClick={onToggleCisterns}
                        aria-label="Toggle cistern layer visibility"
                        title={showCisterns ? "Hide cisterns" : "Show cisterns"}
                        className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[10px] font-medium transition cursor-pointer active:scale-95 ${
                            showCisterns
                                ? "bg-blue-100 text-blue-800 border border-blue-300 font-bold shadow-xs"
                                : "bg-[#F8FAF8] text-slate-600 border border-[#E2ECE4] hover:text-slate-900 hover:bg-white hover:border-emerald-300"
                        }`}
                    >
                        <Droplets className="w-3 h-3 text-blue-600" />
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
                                    ? "bg-amber-100 text-amber-800 border border-amber-300 font-bold shadow-xs"
                                    : "bg-[#F8FAF8] text-slate-600 border border-[#E2ECE4] hover:text-slate-900 hover:bg-white hover:border-emerald-300"
                            }`}
                        >
                            <Camera className="w-3 h-3 text-amber-600" />
                            <span>Photos</span>
                        </button>
                    )}
                </div>
            </div>

            {/* 4. Utility Row: Fullscreen, Reset View, Locate Me */}
            <div className="bg-white/95 backdrop-blur-md border border-[#E2ECE4] rounded-xl p-1.5 flex items-center justify-between gap-1 shadow-md">
                {/* Fullscreen Button */}
                {onToggleFullscreen && (
                    <button
                        type="button"
                        onClick={onToggleFullscreen}
                        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                        title={isFullscreen ? "Exit Fullscreen (ESC)" : "Enter Fullscreen"}
                        className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-[10px] font-medium transition cursor-pointer active:scale-95 ${
                            isFullscreen
                                ? "bg-purple-100 text-purple-800 border border-purple-300 font-bold shadow-xs"
                                : "bg-[#F8FAF8] text-slate-600 border border-[#E2ECE4] hover:text-slate-900 hover:bg-white hover:border-emerald-300"
                        }`}
                    >
                        {isFullscreen ? (
                            <Minimize2 className="w-3 h-3 text-purple-600" />
                        ) : (
                            <Maximize2 className="w-3 h-3 text-purple-600" />
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
                    className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-[10px] font-medium transition cursor-pointer bg-[#F8FAF8] text-slate-600 border border-[#E2ECE4] hover:text-slate-900 hover:bg-white hover:border-emerald-300 active:scale-95"
                >
                    <RotateCcw className="w-3 h-3 text-slate-500" />
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
                            ? "bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold shadow-xs"
                            : "bg-[#F8FAF8] text-slate-600 border border-[#E2ECE4] hover:text-slate-900 hover:bg-white hover:border-emerald-300"
                    }`}
                >
                    <LocateFixed className={`w-3 h-3 text-cyan-600 ${isLocating ? "animate-pulse" : ""}`} />
                    <span>GPS</span>
                </button>
            </div>
        </div>
    );
};

export default MapControls;
