// ── Trail Elevation Profile Drawer (Phase 2) ──
// Interactive cross-section elevation profile with slope gradient warnings,
// Naismith trek time calculation, and synchronized 3D cursor on the map.

import { useState, useMemo, useRef } from "react";
import {
    Mountain,
    TrendingUp,
    Clock,
    Activity,
    AlertTriangle,
    X,
    ChevronDown,
    ChevronUp,
    Footprints,
} from "lucide-react";
import { computeTrailElevationProfile, getTrailColor } from "../../utils/geoJsonUtils";

const TrailElevationDrawer = ({
    trail = null,
    fortElevation = 1000,
    map = null,
    onClose,
    onHoverPoint,
    className = "",
}) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const svgRef = useRef(null);

    // Compute elevation profile points and statistics
    const profile = useMemo(() => {
        if (!trail || !trail.path || trail.path.length < 2) return null;
        return computeTrailElevationProfile(trail.path, fortElevation, map);
    }, [trail, fortElevation, map]);

    if (!trail || !profile) return null;

    const {
        points,
        totalDistanceKm,
        minElevation,
        maxElevation,
        elevationGain,
        elevationLoss,
        maxSlopeAngle,
        naismith,
    } = profile;

    // SVG Coordinate mapping
    const svgWidth = 600;
    const svgHeight = 110;
    const padding = { top: 12, right: 16, bottom: 22, left: 36 };

    const innerWidth = svgWidth - padding.left - padding.right;
    const innerHeight = svgHeight - padding.top - padding.bottom;

    const elevRange = Math.max(20, maxElevation - minElevation);

    const getX = (dist) => padding.left + (dist / totalDistanceKm) * innerWidth;
    const getY = (elev) => padding.top + innerHeight - ((elev - minElevation) / elevRange) * innerHeight;

    // Generate SVG path commands
    const pathD = points.reduce((acc, pt, idx) => {
        const x = getX(pt.distanceKm);
        const y = getY(pt.elevationM);
        return `${acc} ${idx === 0 ? "M" : "L"} ${x.toFixed(1)},${y.toFixed(1)}`;
    }, "");

    const areaD = `${pathD} L ${getX(totalDistanceKm).toFixed(1)},${(padding.top + innerHeight).toFixed(1)} L ${getX(0).toFixed(1)},${(padding.top + innerHeight).toFixed(1)} Z`;

    // Handle mouse movement across SVG
    const handleMouseMove = (e) => {
        if (!svgRef.current || points.length === 0) return;
        const rect = svgRef.current.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, (clientX - padding.left * (rect.width / svgWidth)) / (innerWidth * (rect.width / svgWidth))));

        const targetDist = ratio * totalDistanceKm;
        let closestIdx = 0;
        let minDiff = Infinity;

        for (let i = 0; i < points.length; i++) {
            const diff = Math.abs(points[i].distanceKm - targetDist);
            if (diff < minDiff) {
                minDiff = diff;
                closestIdx = i;
            }
        }

        setHoveredIndex(closestIdx);
        if (onHoverPoint && points[closestIdx]) {
            onHoverPoint(points[closestIdx].coordinates);
        }
    };

    const handleMouseLeave = () => {
        setHoveredIndex(null);
        if (onHoverPoint) onHoverPoint(null);
    };

    const hoveredPoint = hoveredIndex != null ? points[hoveredIndex] : null;
    const trailColor = getTrailColor(trail.status, trail.currentRiskScore || 0);

    return (
        <div
            className={`absolute bottom-3 left-3 right-3 sm:right-auto sm:left-3 z-[14] sm:max-w-xl w-[calc(100%-24px)] bg-white/98 backdrop-blur-lg border border-[#E2ECE4] rounded-2xl shadow-xl transition-all duration-300 overflow-hidden select-none animate-in fade-in slide-in-from-bottom-4 ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#F8FAF8] border-b border-[#E2ECE4]">
                <div className="flex items-center gap-2 min-w-0">
                    <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: trailColor }}
                    />
                    <h3 className="font-bold text-xs text-[#132A22] truncate flex items-center gap-1.5">
                        <span>{trail.name || "Trail Profile"}</span>
                    </h3>
                    <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                        style={{
                            color: trailColor,
                            backgroundColor: `${trailColor}15`,
                            border: `1px solid ${trailColor}40`,
                        }}
                    >
                        Risk {Math.round(trail.currentRiskScore || 0)}%
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize bg-white px-1.5 py-0.5 rounded border border-[#E2ECE4]">
                        {trail.difficulty || "Moderate"}
                    </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        title={isCollapsed ? "Expand profile" : "Collapse profile"}
                        aria-label="Toggle profile view"
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    >
                        {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        title="Close elevation profile"
                        aria-label="Close elevation profile"
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {!isCollapsed && (
                <div className="p-3">
                    {/* Key Trail Stats Bar */}
                    <div className="grid grid-cols-4 gap-1.5 mb-2.5 text-[10px]">
                        <div className="bg-[#F5F8F4] border border-[#E2ECE4] rounded-lg p-1.5 flex flex-col">
                            <span className="text-slate-500 flex items-center gap-1">
                                <Activity className="w-3 h-3 text-emerald-600" />
                                Distance
                            </span>
                            <span className="font-bold text-slate-800 text-xs mt-0.5">
                                {totalDistanceKm} km
                            </span>
                        </div>

                        <div className="bg-[#F5F8F4] border border-[#E2ECE4] rounded-lg p-1.5 flex flex-col">
                            <span className="text-slate-500 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-amber-600" />
                                Ascent (Gain)
                            </span>
                            <span className="font-bold text-slate-800 text-xs mt-0.5 text-amber-700">
                                +{elevationGain}m
                            </span>
                        </div>

                        <div className="bg-[#F5F8F4] border border-[#E2ECE4] rounded-lg p-1.5 flex flex-col">
                            <span className="text-slate-500 flex items-center gap-1">
                                <Mountain className="w-3 h-3 text-sky-600" />
                                Summit Elev
                            </span>
                            <span className="font-bold text-slate-800 text-xs mt-0.5">
                                {maxElevation}m ASL
                            </span>
                        </div>

                        <div className="bg-[#F5F8F4] border border-[#E2ECE4] rounded-lg p-1.5 flex flex-col">
                            <span className="text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-indigo-600" />
                                Naismith Est.
                            </span>
                            <span className="font-bold text-slate-800 text-xs mt-0.5" title="Naismith's Rule estimated hiking time">
                                {naismith.ascentFormatted}
                            </span>
                        </div>
                    </div>

                    {/* Interactive SVG Cross-Section Elevation Chart */}
                    <div className="relative bg-[#FAFCF9] border border-[#E2ECE4] rounded-xl p-1 overflow-hidden">
                        <svg
                            ref={svgRef}
                            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                            className="w-full h-24 overflow-visible cursor-crosshair touch-none"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            <defs>
                                <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                                    <stop offset="50%" stopColor="#059669" stopOpacity="0.15" />
                                    <stop offset="100%" stopColor="#059669" stopOpacity="0.02" />
                                </linearGradient>
                            </defs>

                            {/* Background Grid Lines */}
                            <line
                                x1={padding.left}
                                y1={padding.top}
                                x2={svgWidth - padding.right}
                                y2={padding.top}
                                stroke="#E2ECE4"
                                strokeDasharray="3 3"
                            />
                            <line
                                x1={padding.left}
                                y1={padding.top + innerHeight / 2}
                                x2={svgWidth - padding.right}
                                y2={padding.top + innerHeight / 2}
                                stroke="#E2ECE4"
                                strokeDasharray="3 3"
                            />
                            <line
                                x1={padding.left}
                                y1={padding.top + innerHeight}
                                x2={svgWidth - padding.right}
                                y2={padding.top + innerHeight}
                                stroke="#cbd5e1"
                            />

                            {/* Y Axis Labels (Elevation) */}
                            <text
                                x={padding.left - 6}
                                y={padding.top + 4}
                                textAnchor="end"
                                className="text-[9px] fill-slate-400 font-mono"
                            >
                                {maxElevation}m
                            </text>
                            <text
                                x={padding.left - 6}
                                y={padding.top + innerHeight}
                                textAnchor="end"
                                className="text-[9px] fill-slate-400 font-mono"
                            >
                                {minElevation}m
                            </text>

                            {/* X Axis Labels (Distance) */}
                            <text
                                x={padding.left}
                                y={svgHeight - 6}
                                textAnchor="start"
                                className="text-[9px] fill-slate-400 font-mono"
                            >
                                0 km
                            </text>
                            <text
                                x={svgWidth - padding.right}
                                y={svgHeight - 6}
                                textAnchor="end"
                                className="text-[9px] fill-slate-400 font-mono"
                            >
                                {totalDistanceKm} km
                            </text>

                            {/* Silhouette Mountain Area Fill */}
                            <path d={areaD} fill="url(#elevGradient)" />

                            {/* Colored Elevation Segments by Slope Gradient */}
                            {points.map((pt, idx) => {
                                if (idx === 0) return null;
                                const prev = points[idx - 1];
                                const x1 = getX(prev.distanceKm);
                                const y1 = getY(prev.elevationM);
                                const x2 = getX(pt.distanceKm);
                                const y2 = getY(pt.elevationM);

                                const strokeColor =
                                    pt.slopeCategory === "steep"
                                        ? "#ef4444"
                                        : pt.slopeCategory === "moderate"
                                        ? "#f59e0b"
                                        : "#10b981";

                                return (
                                    <line
                                        key={idx}
                                        x1={x1.toFixed(1)}
                                        y1={y1.toFixed(1)}
                                        x2={x2.toFixed(1)}
                                        y2={y2.toFixed(1)}
                                        stroke={strokeColor}
                                        strokeWidth={hoveredIndex === idx ? 3.5 : 2.5}
                                        strokeLinecap="round"
                                    />
                                );
                            })}

                            {/* Hover Interactive Indicator */}
                            {hoveredPoint && (
                                <g>
                                    <line
                                        x1={getX(hoveredPoint.distanceKm).toFixed(1)}
                                        y1={padding.top}
                                        x2={getX(hoveredPoint.distanceKm).toFixed(1)}
                                        y2={padding.top + innerHeight}
                                        stroke="#0ea5e9"
                                        strokeWidth="1.5"
                                        strokeDasharray="2 2"
                                    />
                                    <circle
                                        cx={getX(hoveredPoint.distanceKm).toFixed(1)}
                                        cy={getY(hoveredPoint.elevationM).toFixed(1)}
                                        r="4.5"
                                        fill="#0ea5e9"
                                        stroke="#ffffff"
                                        strokeWidth="2"
                                    />
                                </g>
                            )}
                        </svg>

                        {/* Hover Telemetry Overlay Badge */}
                        {hoveredPoint ? (
                            <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md border border-sky-300 rounded-lg px-2 py-1 shadow-md text-[10px] font-mono flex items-center gap-2">
                                <span className="text-slate-600">{hoveredPoint.distanceKm} km</span>
                                <span className="text-slate-300">|</span>
                                <span className="font-bold text-sky-800">{hoveredPoint.elevationM}m ASL</span>
                                <span className="text-slate-300">|</span>
                                <span
                                    className={`font-semibold ${
                                        hoveredPoint.slopeCategory === "steep"
                                            ? "text-rose-600"
                                            : hoveredPoint.slopeCategory === "moderate"
                                            ? "text-amber-600"
                                            : "text-emerald-600"
                                    }`}
                                >
                                    {hoveredPoint.slopeAngle}° slope
                                </span>
                            </div>
                        ) : (
                            <div className="absolute top-2 right-2 text-[9px] text-slate-400 bg-white/80 px-2 py-0.5 rounded border border-[#E2ECE4]">
                                💡 Hover graph to track on 3D map
                            </div>
                        )}
                    </div>

                    {/* Slope Warning & Legend Footer */}
                    <div className="flex items-center justify-between mt-2 text-[9px] text-slate-500">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                &lt;15° Gentle
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                15°–25° Moderate
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                &gt;25° Steep Scramble
                            </span>
                        </div>

                        {maxSlopeAngle >= 25 && (
                            <span className="flex items-center gap-1 text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                Max {maxSlopeAngle}° Scramble
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrailElevationDrawer;
