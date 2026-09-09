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
                ? "bg-rose-100 text-rose-800 border-rose-300"
                : item.alertLevel === "High"
                ? "bg-amber-100 text-amber-800 border-amber-300"
                : item.alertLevel === "Moderate"
                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                : "bg-emerald-100 text-emerald-800 border-emerald-300";

        return (
            <div className="bg-white/95 backdrop-blur-md border border-[#E2ECE4] p-4 rounded-2xl shadow-xl max-w-sm space-y-3 z-50 text-xs">
                <div className="flex items-center justify-between border-b border-[#E2ECE4] pb-2">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span className="text-[#132A22] font-bold text-sm">Season {label}</span>
                    </div>
                    {item.alertLevel && (
                        <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] ${alertColor}`}>
                            {item.alertLevel} Risk
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div className="bg-[#F8FAF8] p-2 rounded-lg border border-[#E2ECE4]">
                        <span className="text-slate-500 block text-[10px]">Erosion Severity:</span>
                        <span className="text-sm font-bold text-[#132A22]">
                            {item.severityIndex?.toFixed(1) || item.severityIndex} / 10
                        </span>
                    </div>
                    {item.rainfallMm && (
                        <div className="bg-[#F8FAF8] p-2 rounded-lg border border-[#E2ECE4]">
                            <span className="text-slate-500 block text-[10px]">Monsoon Rainfall:</span>
                            <span className="text-sm font-bold text-sky-700">
                                {item.rainfallMm} mm
                            </span>
                        </div>
                    )}
                    {item.footfallPressure && (
                        <div className="bg-[#F8FAF8] p-2 rounded-lg border border-[#E2ECE4]">
                            <span className="text-slate-500 block text-[10px]">Footfall Pressure:</span>
                            <span className="text-sm font-bold text-purple-700">
                                {item.footfallPressure} / 10
                            </span>
                        </div>
                    )}
                    {item.restorationEffort && (
                        <div className="bg-[#F8FAF8] p-2 rounded-lg border border-[#E2ECE4]">
                            <span className="text-slate-500 block text-[10px]">Restoration Effort:</span>
                            <span className="text-sm font-bold text-emerald-700">
                                {item.restorationEffort} / 10
                            </span>
                        </div>
                    )}
                </div>

                {item.notes && (
                    <div className="bg-[#F5F8F4] p-2.5 rounded-xl border border-[#E2ECE4]">
                        <span className="text-emerald-800 font-bold block mb-1 text-[10px] uppercase tracking-wider">
                            Environmental Observation
                        </span>
                        <p className="text-slate-700 leading-relaxed italic">
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
                <div className="bg-[#F8FAF8] p-3.5 rounded-xl border border-[#E2ECE4] space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-600">Surface Stability</span>
                        <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-extrabold text-[#132A22]">{profile.stabilityScore}%</span>
                        <span className="text-[10px] text-emerald-700 font-semibold">Index</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
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
                    <span className="text-[10px] text-slate-500 block truncate">{profile.stabilityStatus}</span>
                </div>

                {/* Stat 2: Monsoon Rainfall */}
                <div className="bg-[#F8FAF8] p-3.5 rounded-xl border border-[#E2ECE4] space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-600">Avg Monsoon Rain</span>
                        <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-extrabold text-sky-700">{profile.avgRainfall}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">Western Ghats Orographic Precipitation</p>
                </div>

                {/* Stat 3: Peak Hazard Period */}
                <div className="bg-[#F8FAF8] p-3.5 rounded-xl border border-[#E2ECE4] space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-600">Peak Hazard Period</span>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-amber-700">{profile.peakSeason}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">High slippage & rockfall risk</p>
                </div>

                {/* Stat 4: Conservation Status */}
                <div className="bg-[#F8FAF8] p-3.5 rounded-xl border border-[#E2ECE4] space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-600">Protected Status</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-purple-700">
                            {isUNESCO ? "UNESCO Heritage" : "State Protected"}
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight truncate">{profile.managingAgency}</p>
                </div>
            </div>

            {/* View Mode Selector Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2ECE4] pb-3">
                <div className="flex flex-wrap items-center gap-1.5 bg-[#EEF5EF] p-1 rounded-xl border border-[#E2ECE4]">
                    <button
                        type="button"
                        onClick={() => setViewMode("combined")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            viewMode === "combined"
                                ? "bg-white text-emerald-900 shadow-xs font-bold border border-[#E2ECE4]"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        Combined Impact
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("erosion")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            viewMode === "erosion"
                                ? "bg-white text-emerald-900 shadow-xs font-bold border border-[#E2ECE4]"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        Erosion Severity
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("rainfall")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            viewMode === "rainfall"
                                ? "bg-white text-sky-900 shadow-xs font-bold border border-[#E2ECE4]"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        Monsoon Rainfall
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("restoration")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            viewMode === "restoration"
                                ? "bg-white text-purple-900 shadow-xs font-bold border border-[#E2ECE4]"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        Footfall vs Restoration
                    </button>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Erosion Index (1-10)
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Rainfall (mm)
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
                                    <stop offset="5%" stopColor="#059669" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#059669" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2ECE4" vertical={false} />
                            <XAxis dataKey="year" stroke="#94A3B8" tick={{ fill: "#64748B", fontSize: 11 }} tickLine={false} />
                            <YAxis
                                yAxisId="left"
                                domain={[0, 10]}
                                stroke="#94A3B8"
                                tick={{ fill: "#64748B", fontSize: 11 }}
                                tickLine={false}
                                label={{ value: "Erosion (1-10)", angle: -90, position: "insideLeft", fill: "#059669", fontSize: 10 }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                domain={[2000, 5500]}
                                stroke="#94A3B8"
                                tick={{ fill: "#0284C7", fontSize: 10 }}
                                tickLine={false}
                                label={{ value: "Rain (mm)", angle: 90, position: "insideRight", fill: "#0284C7", fontSize: 10 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                yAxisId="right"
                                dataKey="rainfallMm"
                                name="Rainfall (mm)"
                                fill="#0284c7"
                                opacity={0.3}
                                radius={[6, 6, 0, 0]}
                                maxBarSize={32}
                            />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="severityIndex"
                                name="Erosion Severity"
                                stroke="#059669"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#erosionGrad)"
                                activeDot={{ r: 6, strokeWidth: 2, stroke: "#ffffff", fill: "#059669" }}
                            />
                        </ComposedChart>
                    ) : viewMode === "erosion" ? (
                        <AreaChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="erosionOnly" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.7} />
                                    <stop offset="95%" stopColor="#059669" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2ECE4" vertical={false} />
                            <XAxis dataKey="year" stroke="#94A3B8" tick={{ fill: "#64748B", fontSize: 11 }} tickLine={false} />
                            <YAxis
                                domain={[0, 10]}
                                stroke="#94A3B8"
                                tick={{ fill: "#64748B", fontSize: 11 }}
                                tickLine={false}
                                label={{ value: "Severity Index (1-10)", angle: -90, position: "insideLeft", fill: "#64748B", fontSize: 11 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="severityIndex"
                                stroke="#059669"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#erosionOnly)"
                                activeDot={{ r: 6, strokeWidth: 2, stroke: "#ffffff", fill: "#d97706" }}
                            />
                        </AreaChart>
                    ) : viewMode === "rainfall" ? (
                        <ComposedChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2ECE4" vertical={false} />
                            <XAxis dataKey="year" stroke="#94A3B8" tick={{ fill: "#64748B", fontSize: 11 }} tickLine={false} />
                            <YAxis
                                domain={[2000, 5500]}
                                stroke="#94A3B8"
                                tick={{ fill: "#0284c7", fontSize: 11 }}
                                tickLine={false}
                                label={{ value: "Monsoon Rain (mm)", angle: -90, position: "insideLeft", fill: "#0284c7", fontSize: 11 }}
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
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2ECE4" vertical={false} />
                            <XAxis dataKey="year" stroke="#94A3B8" tick={{ fill: "#64748B", fontSize: 11 }} tickLine={false} />
                            <YAxis
                                domain={[0, 10]}
                                stroke="#94A3B8"
                                tick={{ fill: "#64748B", fontSize: 11 }}
                                tickLine={false}
                                label={{ value: "Index (1-10)", angle: -90, position: "insideLeft", fill: "#64748B", fontSize: 11 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="footfallPressure"
                                name="Footfall Pressure"
                                stroke="#9333ea"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: "#9333ea" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="restorationEffort"
                                name="Restoration Effort"
                                stroke="#059669"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: "#059669" }}
                            />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>

            {/* Plan C: Section-by-Section Vulnerability Matrix */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-[#E2ECE4] pb-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#132A22]">
                        <Compass className="w-4 h-4 text-emerald-600" />
                        <span>Section-by-Section Architectural Vulnerability</span>
                    </div>
                    <span className="text-[11px] text-slate-500">Micro-climate risk analysis</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {profile.sections.map((sec, idx) => {
                        const riskBadge =
                            sec.risk === "Severe"
                                ? "bg-rose-100 text-rose-800 border-rose-300"
                                : sec.risk === "High"
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : sec.risk === "Moderate"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                : "bg-emerald-100 text-emerald-800 border-emerald-300";

                        return (
                            <div
                                key={idx}
                                className="bg-[#F8FAF8] p-3.5 rounded-xl border border-[#E2ECE4] hover:border-emerald-300 transition-colors space-y-1.5 shadow-2xs"
                            >
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[#132A22] font-bold text-xs">{sec.name}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${riskBadge}`}>
                                        {sec.risk} Risk ({sec.score}/10)
                                    </span>
                                </div>
                                <p className="text-slate-600 text-xs">
                                    <strong className="text-slate-700 font-medium">Hazard:</strong> {sec.issue}
                                </p>
                                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 pt-0.5 font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span className="truncate">{sec.status}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Scientific Provenance Footnote */}
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 flex items-start gap-2.5 text-[11px] text-slate-700">
                <Info className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <p className="leading-relaxed">
                    <strong>Methodology & Scientific Provenance:</strong> Environmental indices are modeled using orographic monsoon precipitation anomalies from Western Ghats meteorological stations, historical flood events (2019/2021 cloudbursts), and Archaeological Survey of India (ASI) restoration documentation.
                </p>
            </div>
        </div>
    );
}
