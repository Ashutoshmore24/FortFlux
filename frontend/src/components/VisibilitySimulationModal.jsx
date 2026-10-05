import { useState, useMemo, useEffect } from "react";
import {
  X,
  Eye,
  EyeOff,
  Sun,
  Sunset,
  Moon,
  CloudRain,
  Sparkles,
  Mountain,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  RotateCcw,
  SlidersHorizontal,
  Info,
  Flashlight,
  Compass,
  Layers,
} from "lucide-react";

/**
 * Distance milestones (in meters) along the logarithmic horizon scale
 */
const DISTANCE_TICKS = [
  { meters: 50, label: "50 m" },
  { meters: 200, label: "200 m" },
  { meters: 800, label: "800 m" },
  { meters: 2000, label: "2 km" },
  { meters: 5000, label: "5 km" },
  { meters: 10000, label: "10 km" },
  { meters: 20000, label: "20 km" },
];

/**
 * Sahyadri-tailored historic & ecological presets
 */
const SAHYADRI_PRESETS = [
  {
    id: "torna-whiteout",
    name: "Torna Ridge Whiteout",
    meters: 90,
    condition: "monsoon-fog",
    lighting: "day",
    tag: "Monsoon Deluge",
    color: "from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-300",
  },
  {
    id: "konkan-kada-mist",
    name: "Konkan Kada Cloud Surge",
    meters: 380,
    condition: "cloudburst",
    lighting: "day",
    tag: "High Wind Mist",
    color: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-300",
  },
  {
    id: "rajgad-morning-fog",
    name: "Rajgad Valley Inversion",
    meters: 1800,
    condition: "radiation-fog",
    lighting: "golden",
    tag: "Morning Cloud Sea",
    color: "from-teal-500/20 to-teal-600/10 border-teal-500/30 text-teal-300",
  },
  {
    id: "raigad-clear-vista",
    name: "Raigad Winter Panorama",
    meters: 18500,
    condition: "clear-haze",
    lighting: "day",
    tag: "Clear Horizon",
    color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-300",
  },
  {
    id: "night-search",
    name: "Harishchandragad Night Fog",
    meters: 220,
    condition: "monsoon-fog",
    lighting: "night",
    tag: "Torchlight Wall",
    color: "from-indigo-500/20 to-purple-600/10 border-indigo-500/30 text-indigo-300",
  },
];

/**
 * Converts meters to horizontal percentage (0% - 100%) along the non-linear distance axis
 */
const metersToPercent = (meters) => {
  const minM = 50;
  const maxM = 25000;
  const clamped = Math.max(minM, Math.min(maxM, meters));
  // Logarithmic transformation for intuitive perceptual scale
  const logMin = Math.log(minM);
  const logMax = Math.log(maxM);
  const logVal = Math.log(clamped);
  const pct = ((logVal - logMin) / (logMax - logMin)) * 100;
  return Math.min(99, Math.max(1, pct));
};

export const VisibilitySimulationModal = ({
  isOpen,
  onClose,
  initialMeters = 8600,
  fortName = "Sahyadri Fort",
}) => {
  const [visibilityMeters, setVisibilityMeters] = useState(initialMeters);
  const [condition, setCondition] = useState("monsoon-fog"); // "monsoon-fog" | "radiation-fog" | "cloudburst" | "clear-haze"
  const [lighting, setLighting] = useState("day"); // "day" | "golden" | "night"
  const [headlamp, setHeadlamp] = useState(true);

  // Sync when initialMeters changes
  useEffect(() => {
    if (initialMeters && initialMeters > 0) {
      setVisibilityMeters(initialMeters);
    }
  }, [initialMeters]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Scientific Koschmieder optical equations
  const metrics = useMemo(() => {
    const vKm = Math.max(0.04, visibilityMeters / 1000);
    // Extinction coefficient beta = 3.912 / V
    const beta = 3.912 / vKm;
    // Contrast at 1 km = exp(-beta * 1.0)
    const contrast1km = Math.min(100, Math.max(0, Math.round(Math.exp(-beta * 1.0) * 100)));
    // Contrast at 500m
    const contrast500m = Math.min(100, Math.max(0, Math.round(Math.exp(-beta * 0.5) * 100)));

    let status = "clear";
    let statusLabel = "Optimal Panoramic Visibility";
    let statusBadgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    let adviceTitle = "Safe Alpine Navigation";
    let adviceText =
      "Panoramic views across valleys and neighboring peaks. Fort bastions and trails are easily identifiable from kilometers away.";

    if (visibilityMeters < 150) {
      status = "critical";
      statusLabel = "Extreme Whiteout Deluge (<150m)";
      statusBadgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/30";
      adviceTitle = "🚨 Severe Cliff & Ridge Drop Hazard";
      adviceText =
        "Complete loss of depth perception. Sheer 400m drops on narrow Sahyadri machis (ridges) like Zunjar Machi or Konkan Kada are undetectable until 2 steps away. Stop moving or tether with safety rope; sound 3 whistle blasts per minute.";
    } else if (visibilityMeters < 600) {
      status = "danger";
      statusLabel = "Dense Ghat Fog & Deluge (<600m)";
      statusBadgeColor = "bg-orange-500/20 text-orange-300 border-orange-500/30";
      adviceTitle = "⚠️ Restricted Sight & Landmark Obscurity";
      adviceText =
        "Fort bastions, gateways, and descent routes disappear into mist. Rely strictly on GPS offline track and physical rock cairns. Headlamps reflect back off dense droplets creating a blind white wall.";
    } else if (visibilityMeters < 2500) {
      status = "moderate";
      statusLabel = "Valley Radiation Fog (<2.5km)";
      statusBadgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
      adviceTitle = "🟡 Moderate Horizon Cloud Sea";
      adviceText =
        "Immediate ridge paths and water cisterns are well visible, but distant fort towers and escape valleys are veiled in cloud. Keep trekking group tightly clustered.";
    } else if (visibilityMeters < 10000) {
      status = "good";
      statusLabel = "Light Mountain Haze (<10km)";
      statusBadgeColor = "bg-sky-500/20 text-sky-300 border-sky-500/30";
      adviceTitle = "🟢 Standard Hill Station Sight";
      adviceText =
        "Good visibility for general trekking. Base villages and surrounding ridges are clearly distinguishable with normal daylight navigation.";
    }

    return {
      vKm,
      beta: beta.toFixed(2),
      contrast1km,
      contrast500m,
      status,
      statusLabel,
      statusBadgeColor,
      adviceTitle,
      adviceText,
    };
  }, [visibilityMeters]);

  // Compute optical transmittance for each landscape layer based on its distance
  const getLayerStyle = (layerMeters) => {
    const vKm = Math.max(0.04, visibilityMeters / 1000);
    const dKm = layerMeters / 1000;
    const beta = 3.912 / vKm;
    // Transmittance T(d) = e^(-beta * d)
    const transmittance = Math.exp(-beta * dKm);

    // Compute opacity and atmospheric blur
    const visibleRatio = visibilityMeters / layerMeters;
    let opacity = Math.max(0.03, Math.min(1, Math.pow(transmittance, 0.65)));
    let blurPx = 0;

    if (visibleRatio < 0.6) {
      opacity = Math.max(0.02, opacity * 0.4);
      blurPx = Math.min(6, (0.6 - visibleRatio) * 8);
    } else if (visibleRatio < 1.0) {
      blurPx = (1.0 - visibleRatio) * 2.5;
    }

    // In night mode without flashlight or beyond beam range, apply darkness
    if (lighting === "night") {
      const beamMaxM = headlamp ? 250 : 25;
      if (layerMeters > beamMaxM) {
        opacity = opacity * 0.12;
      }
    }

    return {
      opacity,
      filter: blurPx > 0.3 ? `blur(${blurPx.toFixed(1)}px)` : undefined,
      transition: "opacity 0.25s ease-out, filter 0.25s ease-out",
    };
  };

  const sightLimitPercent = metersToPercent(visibilityMeters);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-5xl bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── TOP HEADER BAR ── */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-emerald-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Atmospheric Visibility Simulator
                </h2>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                  Koschmieder Optical Physics
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Mountain className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulating optical range for {fortName} & Sahyadri Ridges</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVisibilityMeters(initialMeters || 8600)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Reset to Live Fort Telemetry"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/80 hover:border-rose-500/50 border border-slate-700 text-slate-300 hover:text-rose-400 transition cursor-pointer"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">

          {/* ── MAIN INTERACTIVE VISTA VIEWPORT ── */}
          <div className="relative rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617]">

            {/* Top Overlay Badge / Pill (Like the Google Reference) */}
            <div className="absolute top-3.5 left-4 z-30 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-lg ${metrics.statusBadgeColor}`}>
                <span className="w-2 h-2 rounded-full bg-current animate-ping opacity-75" />
                {metrics.statusLabel}
              </span>
            </div>

            {/* Top Right Mode Indicators */}
            <div className="absolute top-3.5 right-4 z-30 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-900/80 backdrop-blur-md border border-slate-700/70 text-slate-300">
                {lighting === "day" ? "☀️ Daylight" : lighting === "golden" ? "🌅 Golden Hour" : "🔦 Night Trek"}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-900/80 backdrop-blur-md border border-slate-700/70 text-slate-300 capitalize">
                {condition.replace("-", " ")}
              </span>
            </div>

            {/* ── SKY & ATMOSPHERIC BACKDROP ── */}
            <div
              className={`h-64 sm:h-76 w-full relative overflow-hidden transition-colors duration-700 ${
                lighting === "golden"
                  ? "bg-gradient-to-b from-amber-700/40 via-orange-950/30 to-[#0f172a]"
                  : lighting === "night"
                  ? "bg-gradient-to-b from-[#020617] via-[#090d16] to-[#0f172a]"
                  : condition === "monsoon-fog"
                  ? "bg-gradient-to-b from-slate-600/30 via-slate-700/20 to-[#0f172a]"
                  : condition === "cloudburst"
                  ? "bg-gradient-to-b from-slate-900/70 via-cyan-950/40 to-[#0f172a]"
                  : "bg-gradient-to-b from-sky-800/30 via-slate-800/30 to-[#0f172a]"
              }`}
            >
              {/* Rain Streaks if Cloudburst */}
              {condition === "cloudburst" && (
                <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] animate-pulse" />
              )}

              {/* Fog Mist Atmosphere Layers (Drifting Particle Waves) */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                style={{
                  background:
                    condition === "monsoon-fog"
                      ? "radial-gradient(ellipse at 50% 60%, rgba(226,232,240,0.45) 0%, rgba(148,163,184,0.15) 70%, transparent 100%)"
                      : condition === "radiation-fog"
                      ? "linear-gradient(to top, rgba(241,245,249,0.5) 0%, rgba(203,213,225,0.1) 50%, transparent 100%)"
                      : condition === "cloudburst"
                      ? "radial-gradient(ellipse at 50% 70%, rgba(148,163,184,0.55) 0%, rgba(51,65,85,0.3) 80%, transparent 100%)"
                      : "linear-gradient(to top, rgba(226,232,240,0.12) 0%, transparent 60%)",
                  opacity: Math.min(1, Math.max(0.15, 3000 / Math.max(100, visibilityMeters))),
                }}
              />

              {/* Flashlight Beam Cone in Night Mode */}
              {lighting === "night" && headlamp && (
                <div
                  className="absolute bottom-0 left-8 w-96 h-full pointer-events-none origin-bottom-left"
                  style={{
                    background:
                      "conic-gradient(from 40deg at 0% 100%, transparent 0deg, rgba(254,240,138,0.22) 15deg, rgba(254,240,138,0.35) 25deg, transparent 40deg)",
                    opacity: 0.9,
                  }}
                />
              )}

              {/* ── PARALLAX SVG MOUNTAIN & FORT LAYERS ── */}
              <svg
                viewBox="0 0 1000 320"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full select-none"
              >
                {/* 1. LAYER 6: 20 km Horizon Deccan Ridges */}
                <g style={getLayerStyle(20000)}>
                  <path
                    d="M0 160 Q 180 130 350 150 T 700 135 T 1000 155 L 1000 320 L 0 320 Z"
                    fill={lighting === "golden" ? "#451a03" : "#1e293b"}
                    opacity="0.35"
                  />
                  <path
                    d="M100 150 Q 280 110 520 140 T 920 120 L 1000 320 L 0 320 Z"
                    fill={lighting === "golden" ? "#78350f" : "#334155"}
                    opacity="0.3"
                  />
                </g>

                {/* 2. LAYER 5: 5 km Neighboring Fort Pinnacle (e.g. Torna / Rajgad) */}
                <g style={getLayerStyle(5000)}>
                  {/* Jagged volcanic basalt peak */}
                  <polygon
                    points="720,100 755,180 790,210 680,210"
                    fill={lighting === "golden" ? "#9a3412" : "#334155"}
                  />
                  <path
                    d="M620 210 Q 720 160 820 180 T 1000 200 L 1000 320 L 600 320 Z"
                    fill={lighting === "golden" ? "#9a3412" : "#1e293b"}
                    opacity="0.6"
                  />
                  {/* Tiny peak flag */}
                  <line x1="720" y1="100" x2="720" y2="85" stroke="#f97316" strokeWidth="1.5" />
                  <polygon points="720,85 730,90 720,95" fill="#f97316" />
                </g>

                {/* 3. LAYER 4: 2 km Mid-Range Saddle Ridge & Plateau */}
                <g style={getLayerStyle(2000)}>
                  <path
                    d="M250 200 Q 420 170 580 190 T 850 210 L 850 320 L 250 320 Z"
                    fill={lighting === "golden" ? "#b45309" : "#1e3a2f"}
                    opacity="0.75"
                  />
                  {/* Rock-cut cistern on ridge */}
                  <rect x="420" y="200" width="34" height="12" rx="2" fill="#0284c7" opacity="0.8" />
                  <text x="437" y="196" fill="#7dd3fc" fontSize="9" textAnchor="middle" fontWeight="bold">
                    Cistern
                  </text>
                  {/* Stone temples & trees */}
                  <circle cx="510" cy="188" r="4" fill="#059669" />
                  <circle cx="522" cy="186" r="6" fill="#047857" />
                </g>

                {/* 4. LAYER 3: 800 m Cliff Edge Precipice (Kadelot Point) */}
                <g style={getLayerStyle(800)}>
                  {/* Sheer drop cliff */}
                  <path
                    d="M380 180 L 460 180 L 470 250 L 520 270 L 520 320 L 320 320 Z"
                    fill={lighting === "golden" ? "#c2410c" : "#22382c"}
                  />
                  {/* Cliff overhang marker */}
                  <polygon points="460,180 472,185 465,195 455,190" fill="#475569" />
                  {/* Wild teak / karvy shrubs */}
                  <circle cx="395" cy="176" r="7" fill="#15803d" />
                  <circle cx="410" cy="174" r="9" fill="#166534" />
                  <circle cx="426" cy="177" r="7" fill="#15803d" />
                  <text x="430" y="165" fill="#86efac" fontSize="9" textAnchor="middle" fontWeight="bold">
                    800m Cliff
                  </text>
                </g>

                {/* 5. LAYER 2: 200 m Ancient Stone Bastion (Buruj) & Ramparts */}
                <g style={getLayerStyle(200)}>
                  {/* Massive circular stone bastion */}
                  <path
                    d="M130 210 Q 170 195 210 210 L 215 320 L 125 320 Z"
                    fill={lighting === "golden" ? "#7c2d12" : "#1f3329"}
                  />
                  {/* Bastion arrow slits & crenellations */}
                  <rect x="145" y="215" width="4" height="10" rx="1" fill="#0f172a" />
                  <rect x="168" y="215" width="4" height="10" rx="1" fill="#0f172a" />
                  <rect x="190" y="215" width="4" height="10" rx="1" fill="#0f172a" />
                  {/* Fort Wall ramparts connecting bastion */}
                  <path
                    d="M60 230 L 130 215 L 130 320 L 60 320 Z"
                    fill={lighting === "golden" ? "#9a3412" : "#2d4a3e"}
                  />
                  {/* Maratha Saffron Flagpole on Bastion */}
                  <line x1="170" y1="198" x2="170" y2="155" stroke="#e2e8f0" strokeWidth="2" />
                  <polygon points="170,155 195,166 170,177" fill="#f97316" />
                  <text x="170" y="148" fill="#fdba74" fontSize="10" textAnchor="middle" fontWeight="bold">
                    Fort Bastion (200m)
                  </text>
                </g>

                {/* 6. LAYER 1: 50 m Foreground Rock Steps & Trekker Silhouette */}
                <g style={getLayerStyle(50)}>
                  {/* Rocky Sahyadri Trail Steps */}
                  <path
                    d="M0 260 L 50 250 L 90 270 L 140 280 L 190 320 L 0 320 Z"
                    fill={lighting === "golden" ? "#451a03" : "#0d1b14"}
                  />
                  {/* Guide Stone Cairn (3 stacked rocks) */}
                  <ellipse cx="65" cy="245" rx="8" ry="4" fill="#64748b" />
                  <ellipse cx="65" cy="239" rx="6" ry="3" fill="#94a3b8" />
                  <ellipse cx="65" cy="234" rx="4" ry="2" fill="#cbd5e1" />

                  {/* Trekker Silhouette */}
                  <circle cx="28" cy="226" r="4.5" fill="#38bdf8" /> {/* Head */}
                  <path d="M28 231 L 28 248 L 22 262 M 28 248 L 33 262" stroke="#38bdf8" strokeWidth="2.5" /> {/* Legs */}
                  <path d="M28 236 L 20 246 M 28 236 L 36 244" stroke="#38bdf8" strokeWidth="2" /> {/* Arms */}
                  <rect x="22" y="233" width="6" height="11" rx="2" fill="#0284c7" /> {/* Backpack */}
                  {/* Walking Stick */}
                  <line x1="36" y1="240" x2="39" y2="264" stroke="#cbd5e1" strokeWidth="1.5" />
                </g>
              </svg>

              {/* ── DYNAMIC SIGHT LIMIT VERTICAL INDICATOR LINE (Like User Reference) ── */}
              <div
                className="absolute top-0 bottom-0 pointer-events-none transition-all duration-300 z-20 flex flex-col items-center"
                style={{ left: `${sightLimitPercent}%` }}
              >
                {/* Top Pulsing Beacon / Target Dot */}
                <div className="relative -mt-1">
                  <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 border border-white shadow-[0_0_12px_rgba(6,182,212,0.9)]" />
                </div>

                {/* Vertical Dotted Sight Line */}
                <div className="w-[1.5px] h-full border-r-2 border-dashed border-cyan-400/90 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />

                {/* Base Marker Tag */}
                <div className="absolute bottom-2 -translate-x-1/2 bg-cyan-900/90 border border-cyan-400/80 text-cyan-200 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                  Limit: {visibilityMeters >= 1000 ? `${(visibilityMeters / 1000).toFixed(1)} km` : `${visibilityMeters} m`}
                </div>
              </div>
            </div>

            {/* ── DISTANCE SCALE TICKS AXIS ── */}
            <div className="relative h-10 bg-slate-950 border-t border-slate-800 px-4 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none">
              {DISTANCE_TICKS.map((tick) => {
                const tickPct = metersToPercent(tick.meters);
                const isReached = visibilityMeters >= tick.meters;
                return (
                  <div
                    key={tick.meters}
                    className="absolute -translate-x-1/2 flex flex-col items-center cursor-pointer group"
                    style={{ left: `${tickPct}%` }}
                    onClick={() => setVisibilityMeters(tick.meters)}
                  >
                    <div
                      className={`w-[1px] h-2.5 transition-colors ${
                        isReached ? "bg-cyan-400" : "bg-slate-700 group-hover:bg-slate-500"
                      }`}
                    />
                    <span
                      className={`mt-1 font-semibold transition-colors ${
                        isReached
                          ? "text-cyan-300 font-bold"
                          : "text-slate-500 group-hover:text-slate-300"
                      }`}
                    >
                      {tick.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── METRICS TELEMETRY BAR (Like User Reference) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-inner">
            {/* Sight Limit */}
            <div className="text-center sm:text-left p-2">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                Sight Limit
              </span>
              <div className="text-xl sm:text-2xl font-black text-cyan-400 tracking-tight mt-0.5">
                {visibilityMeters >= 1000
                  ? `${(visibilityMeters / 1000).toFixed(1)} km`
                  : `${visibilityMeters} m`}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Optical threshold</span>
            </div>

            {/* Extinction Coefficient */}
            <div className="text-center sm:text-left p-2 border-l border-slate-800/80">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                Extinction β
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight mt-0.5">
                {metrics.beta} <span className="text-xs text-amber-500/80 font-normal">km⁻¹</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Scattering coefficient</span>
            </div>

            {/* Contrast at 1km */}
            <div className="text-center sm:text-left p-2 border-l border-slate-800/80">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                Contrast @ 1km
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight mt-0.5">
                {metrics.contrast1km}%
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Target luminance ratio</span>
            </div>

            {/* Perception Index */}
            <div className="text-center sm:text-left p-2 border-l border-slate-800/80">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                Contrast @ 500m
              </span>
              <div className="text-xl sm:text-2xl font-black text-purple-400 tracking-tight mt-0.5">
                {metrics.contrast500m}%
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Trailhead recognition</span>
            </div>
          </div>

          {/* ── RANGE SLIDER & FINE-GRAIN ADJUSTMENT ── */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                Meteorological Visibility Range
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Current:</span>
                <span className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs sm:text-sm shadow-xs">
                  {visibilityMeters >= 1000
                    ? `${(visibilityMeters / 1000).toFixed(2)} km`
                    : `${visibilityMeters} m`}
                </span>
              </div>
            </div>

            {/* Non-linear Ergonomic Slider */}
            <input
              type="range"
              min="50"
              max="25000"
              step="25"
              value={visibilityMeters}
              onChange={(e) => setVisibilityMeters(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 focus:outline-none transition"
            />

            <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
              <span>50 m (Deluge)</span>
              <span>500 m (Ghat Fog)</span>
              <span>2 km (Morning Mist)</span>
              <span>10 km (Haze)</span>
              <span>25 km (Clear Vista)</span>
            </div>
          </div>

          {/* ── SAHYADRI WEATHER & AEROSOL CONDITION SELECTORS ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Condition Mode */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Atmospheric Particle Condition
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "monsoon-fog", label: "Monsoon Fog", desc: "Dense water droplets" },
                  { id: "radiation-fog", label: "Radiation Fog", desc: "Cold valley inversion" },
                  { id: "cloudburst", label: "Cloudburst Rain", desc: "Driving rain bands" },
                  { id: "clear-haze", label: "Warm Haze", desc: "Dry summer dust" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCondition(item.id)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      condition === item.id
                        ? "bg-cyan-950/80 border-cyan-500/60 text-cyan-200 shadow-md"
                        : "bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Lighting & Torch Mode */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Lighting & Environment
                </span>
                {lighting === "night" && (
                  <button
                    onClick={() => setHeadlamp(!headlamp)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                      headlamp
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                        : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    <Flashlight className="w-3 h-3" />
                    {headlamp ? "Headlamp ON" : "Headlamp OFF"}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "day", label: "Daylight", icon: Sun },
                  { id: "golden", label: "Golden Dusk", icon: Sunset },
                  { id: "night", label: "Night Trek", icon: Moon },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setLighting(item.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                        lighting === item.id
                          ? "bg-cyan-950/80 border-cyan-500/60 text-cyan-200 shadow-md"
                          : "bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── QUICK SAHYADRI FORTS PRESETS ── */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Mountain className="w-3.5 h-3.5 text-emerald-400" />
              Quick Sahyadri Terrain Presets
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {SAHYADRI_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setVisibilityMeters(preset.meters);
                    setCondition(preset.condition);
                    setLighting(preset.lighting);
                  }}
                  className={`p-2.5 rounded-xl border bg-gradient-to-br text-left transition cursor-pointer hover:scale-[1.02] shadow-xs ${preset.color}`}
                >
                  <div className="text-[10px] font-bold opacity-80 uppercase">{preset.tag}</div>
                  <div className="text-xs font-bold truncate mt-0.5">{preset.name}</div>
                  <div className="text-[11px] font-mono font-bold mt-1 text-white">
                    {preset.meters >= 1000 ? `${preset.meters / 1000} km` : `${preset.meters} m`}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── TREKKER SURVIVAL ADVISORY CARD ── */}
          <div
            className={`rounded-2xl p-4 sm:p-5 border transition-all ${
              metrics.status === "critical"
                ? "bg-rose-950/40 border-rose-500/40 text-rose-200"
                : metrics.status === "danger"
                ? "bg-orange-950/40 border-orange-500/40 text-orange-200"
                : metrics.status === "moderate"
                ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
                : "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-black/30 border border-white/10 shrink-0 mt-0.5">
                {metrics.status === "critical" ? (
                  <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce" />
                ) : metrics.status === "danger" ? (
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                ) : metrics.status === "moderate" ? (
                  <Info className="w-5 h-5 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  {metrics.adviceTitle}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10">
                    Sight: {visibilityMeters >= 1000 ? `${(visibilityMeters / 1000).toFixed(1)} km` : `${visibilityMeters} m`}
                  </span>
                </h4>
                <p className="text-xs leading-relaxed opacity-90">{metrics.adviceText}</p>
              </div>
            </div>
          </div>

        </div>

        {/* ── BOTTOM FOOTER BAR ── */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2 text-[11px]">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Integrated with Sahyadri Weather Telemetry & Dijkstra Risk Models</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setVisibilityMeters(initialMeters || 8600)}
              className="text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
            >
              Reset Simulation
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-md cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisibilitySimulationModal;
