import React, { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
    Bar,
    ComposedChart,
    Legend
} from "recharts";
import {
    CloudRain,
    AlertTriangle,
    ShieldCheck,
    Activity,
    Mountain,
    Users,
    Wrench,
    Info,
    CheckCircle2,
    Calendar,
    ChevronRight,
    Compass
} from "lucide-react";

/**
 * Custom Rich Tooltip for Environmental & Degradation Data
 */
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const item = payload[0].payload;
        const alertColor =
            item.alertLevel === "Critical"
                ? "bg-red-500/20 text-red-400 border-red-500/40"
                : item.alertLevel === "High"
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                : item.alertLevel === "Moderate"
                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";

        return (
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-2xl shadow-2xl max-w-sm space-y-3 z-50 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        <span className="text-white font-bold text-sm">Season {label}</span>
                    </div>
                    {item.alertLevel && (
                        <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] ${alertColor}`}>
                            {item.alertLevel} Risk
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Erosion Severity:</span>
                        <span className="text-sm font-bold text-white">
                            {item.severityIndex?.toFixed(1) || item.severityIndex} / 10
                        </span>
                    </div>
                    {item.rainfallMm && (
                        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Monsoon Rainfall:</span>
                            <span className="text-sm font-bold text-cyan-300">
                                {item.rainfallMm} mm
                            </span>
                        </div>
                    )}
                    {item.footfallPressure && (
                        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Footfall Pressure:</span>
                            <span className="text-sm font-bold text-purple-300">
                                {item.footfallPressure} / 10
                            </span>
                        </div>
                    )}
                    {item.restorationEffort && (
                        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Restoration Effort:</span>
                            <span className="text-sm font-bold text-emerald-300">
                                {item.restorationEffort} / 10
                            </span>
                        </div>
                    )}
                </div>

                {item.notes && (
                    <div className="bg-slate-950/90 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-emerald-400 font-bold block mb-1 text-[10px] uppercase tracking-wider">
                            Environmental Observation
                        </span>
                        <p className="text-slate-300 leading-relaxed italic">
                            "{item.notes}"
                        </p>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

export default function ErosionChart({ data, environmentalProfile, fortName, isUNESCO }) {
    const [viewMode, setViewMode] = useState("combined"); // "combined" | "erosion" | "rainfall" | "restoration"

    if (!data || data.length === 0) return null;

    const profile = environmentalProfile || {
        typology: "Sahyadri Heritage Fortification",
        stabilityScore: isUNESCO ? 82 : 72,
        stabilityStatus: isUNESCO ? "Well Preserved & Reinforced" : "Moderately Stable",
        avgRainfall: "3,300 mm / yr",
        primaryRisk: "Monsoon Surface Runoff & Scree Slippage",
        peakSeason: "July – August (Peak Monsoon)",
        managingAgency: isUNESCO
            ? "UNESCO World Heritage & Archaeological Survey of India (ASI)"
            : "State Directorate of Archaeology & Local Trekking NGOs",
        sections: [
            { name: "Main Approach Stairway", risk: "Moderate", score: 5.4, issue: "Trekker footfall & loose gravel", status: "Reinforced with handrails" },
            { name: "Outer Ramparts & Bastions", risk: "High", score: 7.2, issue: "Monsoon water seepage & scree erosion", status: "Under active stone mortaring" },
            { name: "Rock-Cut Water Cisterns", risk: "Low", score: 2.8, issue: "Silt & seasonal algae accumulation", status: "Desilted by NGO volunteers" },
            { name: "Citadel (Balekilla)", risk: "Moderate", score: 4.6, issue: "Wind shear & joint weathering", status: "Structurally stable" }
        ]
    };

    return (
        <div className="space-y-6">
            {/* 4 Stat Cards: Scientific & Conservation Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Stat 1: Stability Score */}
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400">Surface Stability</span>
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-extrabold text-white">{profile.stabilityScore}%</span>
                        <span className="text-[10px] text-emerald-400 font-medium">Index</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${
                                profile.stabilityScore >= 80
                                    ? "bg-emerald-500"
                                    : profile.stabilityScore >= 70
                                    ? "bg-yellow-500"
                                    : "bg-amber-500"
                            }`}
                            style={{ width: `${profile.stabilityScore}%` }}
                        ></div>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">{profile.stabilityStatus}</span>
                </div>

                {/* Stat 2: Monsoon Rainfall */}
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400">Avg Monsoon Rain</span>
                        <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-extrabold text-cyan-300">{profile.avgRainfall}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">Western Ghats Orographic Precipitation</p>
                </div>

                {/* Stat 3: Peak Hazard Period */}
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400">Peak Hazard Period</span>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-amber-300">{profile.peakSeason}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">High slippage & rockfall risk</p>
                </div>

                {/* Stat 4: Conservation Status */}
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400">Protected Status</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-purple-300">
                            {isUNESCO ? "UNESCO Heritage" : "State Protected"}
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight truncate">{profile.managingAgency}</p>
                </div>
            </div>

            {/* View Mode Selector Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                    <button
                        type="button"
                        onClick={() => setViewMode("combined")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            viewMode === "combined"
                                ? "bg-emerald-500 text-slate-950 shadow-md font-bold"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        Combined Impact
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("erosion")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            viewMode === "erosion"
                                ? "bg-emerald-500 text-slate-950 shadow-md font-bold"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        Erosion Severity
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("rainfall")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            viewMode === "rainfall"
                                ? "bg-cyan-500 text-slate-950 shadow-md font-bold"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        Monsoon Rainfall
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("restoration")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            viewMode === "restoration"
                                ? "bg-purple-500 text-slate-950 shadow-md font-bold"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        Footfall vs Restoration
                    </button>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Erosion Index (1-10)
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Rainfall (mm)
                    </span>
                </div>
            </div>

            {/* Recharts Canvas */}
            <div className="w-full h-72 sm:h-80 md:h-88">
                <ResponsiveContainer width="100%" height="100%">
                    {viewMode === "combined" ? (
                        <ComposedChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="erosionGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="year" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} />
                            <YAxis
                                yAxisId="left"
                                domain={[0, 10]}
                                stroke="#64748b"
                                tick={{ fill: "#94a3b8", fontSize: 11 }}
                                tickLine={false}
                                label={{ value: "Erosion (1-10)", angle: -90, position: "insideLeft", fill: "#10b981", fontSize: 10 }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                domain={[2000, 5500]}
                                stroke="#64748b"
                                tick={{ fill: "#38bdf8", fontSize: 10 }}
                                tickLine={false}
                                label={{ value: "Rain (mm)", angle: 90, position: "insideRight", fill: "#38bdf8", fontSize: 10 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                yAxisId="right"
                                dataKey="rainfallMm"
                                name="Rainfall (mm)"
                                fill="#0284c7"
                                opacity={0.35}
                                radius={[6, 6, 0, 0]}
                                maxBarSize={32}
                            />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="severityIndex"
                                name="Erosion Severity"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#erosionGrad)"
                                activeDot={{ r: 6, strokeWidth: 2, stroke: "#ffffff", fill: "#10b981" }}
                            />
                        </ComposedChart>
                    ) : viewMode === "erosion" ? (
                        <AreaChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="erosionOnly" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="year" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} />
                            <YAxis
                                domain={[0, 10]}
                                stroke="#64748b"
                                tick={{ fill: "#94a3b8", fontSize: 11 }}
                                tickLine={false}
                                label={{ value: "Severity Index (1-10)", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 11 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="severityIndex"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#erosionOnly)"
                                activeDot={{ r: 6, strokeWidth: 2, stroke: "#ffffff", fill: "#f59e0b" }}
                            />
                        </AreaChart>
                    ) : viewMode === "rainfall" ? (
                        <ComposedChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="year" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} />
                            <YAxis
                                domain={[2000, 5500]}
                                stroke="#64748b"
                                tick={{ fill: "#38bdf8", fontSize: 11 }}
                                tickLine={false}
                                label={{ value: "Monsoon Rain (mm)", angle: -90, position: "insideLeft", fill: "#38bdf8", fontSize: 11 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="rainfallMm"
                                name="Rainfall (mm)"
                                fill="#0284c7"
                                radius={[8, 8, 0, 0]}
                                maxBarSize={40}
                            />
                        </ComposedChart>
                    ) : (
                        <LineChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="year" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} />
                            <YAxis
                                domain={[0, 10]}
                                stroke="#64748b"
                                tick={{ fill: "#94a3b8", fontSize: 11 }}
                                tickLine={false}
                                label={{ value: "Index (1-10)", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 11 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="footfallPressure"
                                name="Footfall Pressure"
                                stroke="#c084fc"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: "#c084fc" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="restorationEffort"
                                name="Restoration Effort"
                                stroke="#34d399"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: "#34d399" }}
                            />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>

            {/* Plan C: Section-by-Section Vulnerability Matrix */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                        <Compass className="w-4 h-4 text-emerald-400" />
                        <span>Section-by-Section Architectural Vulnerability</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Micro-climate risk analysis</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {profile.sections.map((sec, idx) => {
                        const riskBadge =
                            sec.risk === "Severe"
                                ? "bg-red-500/20 text-red-400 border-red-500/40"
                                : sec.risk === "High"
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                                : sec.risk === "Moderate"
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
                                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";

                        return (
                            <div
                                key={idx}
                                className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/90 hover:border-slate-700 transition-colors space-y-1.5"
                            >
                                <div className="flex items-center justify-between">
                                    <h4 className="text-white font-bold text-xs">{sec.name}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${riskBadge}`}>
                                        {sec.risk} Risk ({sec.score}/10)
                                    </span>
                                </div>
                                <p className="text-slate-300 text-xs">
                                    <strong className="text-slate-400 font-medium">Hazard:</strong> {sec.issue}
                                </p>
                                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/90 pt-0.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span className="truncate">{sec.status}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Scientific Provenance Footnote */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 flex items-start gap-2.5 text-[11px] text-slate-400">
                <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <p className="leading-relaxed">
                    <strong>Methodology & Scientific Provenance:</strong> Environmental indices are modeled using orographic monsoon precipitation anomalies from Western Ghats meteorological stations, historical flood events (2019/2021 cloudbursts), and Archaeological Survey of India (ASI) restoration documentation.
                </p>
            </div>
        </div>
    );
}
