// ── Heads-Up Telemetry HUD Component (Phase 1) ──
// Displays live cursor coordinates, terrain elevation ASL, zoom, bearing, and pitch.

import { useState } from "react";
import { Compass, Mountain, MapPin, Radio, Eye, EyeOff } from "lucide-react";

const MapTelemetryHUD = ({
    cursorCoords = null, // { lng, lat, elevation }
    bearing = 0,
    pitch = 0,
    zoom = 8,
    className = "",
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const formatCoord = (val, isLat) => {
        if (val == null || isNaN(val)) return "--";
        const dir = isLat ? (val >= 0 ? "N" : "S") : val >= 0 ? "E" : "W";
        return `${Math.abs(val).toFixed(4)}°${dir}`;
    };

    const normBearing = Math.round(((bearing % 360) + 360) % 360);
    const roundedPitch = Math.round(pitch);
    const roundedZoom = typeof zoom === "number" ? zoom.toFixed(1) : "8.0";

    return (
        <div
            className={`absolute bottom-3 right-3 z-[12] select-none transition-all duration-200 ${className}`}
        >
            {isCollapsed ? (
                <button
                    type="button"
                    onClick={() => setIsCollapsed(false)}
                    title="Expand Map Telemetry HUD"
                    aria-label="Expand Map Telemetry HUD"
                    className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-[#E2ECE4] px-2.5 py-1.5 rounded-xl shadow-md text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition cursor-pointer text-[10px] font-bold"
                >
                    <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span>HUD</span>
                </button>
            ) : (
                <div className="bg-white/95 backdrop-blur-md border border-[#E2ECE4] rounded-xl shadow-md px-3 py-1.5 flex items-center gap-3 text-slate-700 font-mono text-[10px]">
                    {/* Live Cursor Coordinates */}
                    <div className="flex items-center gap-1.5 border-r border-[#E2ECE4] pr-3" title="Cursor Coordinates">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>
                            {cursorCoords ? (
                                <>
                                    <span className="font-semibold text-slate-800">{formatCoord(cursorCoords.lat, true)}</span>
                                    <span className="text-slate-400 mx-1">,</span>
                                    <span className="font-semibold text-slate-800">{formatCoord(cursorCoords.lng, false)}</span>
                                </>
                            ) : (
                                <span className="text-slate-400">Hover map</span>
                            )}
                        </span>
                    </div>

                    {/* Terrain Elevation ASL */}
                    <div className="flex items-center gap-1 border-r border-[#E2ECE4] pr-3" title="Terrain Elevation ASL">
                        <Mountain className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="font-semibold text-slate-800">
                            {cursorCoords?.elevation != null ? `${cursorCoords.elevation}m ASL` : "--"}
                        </span>
                    </div>

                    {/* Camera Orientation */}
                    <div className="flex items-center gap-1.5 border-r border-[#E2ECE4] pr-3" title="Camera Orientation">
                        <Compass className="w-3 h-3 text-sky-600 shrink-0" />
                        <span className="font-medium text-slate-600">
                            {normBearing}° <span className="text-slate-400">|</span> {roundedPitch}° tilt
                        </span>
                    </div>

                    {/* Zoom Level */}
                    <div className="flex items-center gap-1" title="Zoom Level">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider">Z:</span>
                        <span className="font-bold text-slate-700">{roundedZoom}</span>
                    </div>

                    {/* Collapse Button */}
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(true)}
                        title="Collapse Telemetry HUD"
                        aria-label="Collapse Telemetry HUD"
                        className="text-slate-400 hover:text-slate-600 pl-1 cursor-pointer transition"
                    >
                        <EyeOff className="w-3 h-3" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default MapTelemetryHUD;
