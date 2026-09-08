import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useFortStore } from "../store/useFortStore";
import Timeline from "../components/Timeline";
import ErosionChart from "../components/ErosionChart";
import ImageComparisonSlider from "../components/ImageComparisonSlider";
import { getFortHistoricalDetails } from "../data/fortHistoryData";
import {
    ArrowLeft,
    History,
    Mountain,
    Image as ImageIcon,
    Map,
    BookOpen,
    Camera,
    Users,
    MapPin,
    Navigation,
    Info,
    Car,
    Clock,
    Compass,
    CheckCircle2,
    CornerDownRight,
    ArrowUpRight,
    Sparkles,
    Eye
} from "lucide-react";

export default function HistoryPage() {
    const { slug } = useParams();
    const { fetchFortHistory, fortHistory, isLoadingHistory } = useFortStore();
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    useEffect(() => {
        if (slug) {
            fetchFortHistory(slug);
        }
    }, [slug, fetchFortHistory]);

    if (isLoadingHistory && !fortHistory) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    // Merge backend data with rich authentic curated details for every fort
    const details = getFortHistoricalDetails(slug, fortHistory);
    const structuralPair = fortHistory?.photoComparisons?.find((p) => p.type === "structural");

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Top Back Navigation Bar */}
                <div className="flex items-center justify-between">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 transition-all font-medium border border-slate-700/60 shadow-lg text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Interactive Map
                    </Link>
                    <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{details.fortId?.district || "Maharashtra"} • {details.fortId?.elevation}m MSL</span>
                    </div>
                </div>

                {/* Hero Banner Section */}
                <div className="relative w-full h-[45vh] md:h-[50vh] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group">
                    <img
                        src={details.fortId?.imageUrl || "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80"}
                        alt={details.fortId?.name || slug}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 space-y-2">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30 backdrop-blur-md">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> HERITAGE FORTIFICATION
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-2xl">
                            {details.fortId?.name || details.name}
                        </h1>
                        <p className="text-slate-300 text-sm md:text-base font-medium max-w-2xl drop-shadow-md">
                            {details.heroSubtitle}
                        </p>
                    </div>
                </div>

                {/* Historical & Environmental Overview */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-5">
                    <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
                        <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <BookOpen className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-100">Historical & Environmental Overview</h2>
                            <p className="text-xs text-slate-400">Architectural heritage, strategic military history, and preservation status</p>
                        </div>
                    </div>

                    <div className="text-slate-300 text-base leading-relaxed space-y-4">
                        <p>
                            {details.overview || details.fortId?.description}
                        </p>
                        <p>
                            Constructed atop natural basalt rock bastions, this fortress stands as a testament to Maratha engineering ingenuity. Over centuries of monsoon torrents, siege warfare, and seismic shifts, its strategic ramparts, water harvesting tanks, and intricate gateways continue to anchor the cultural identity of Maharashtra.
                        </p>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* KEY LANDMARKS TO VISIT (Screenshot 1 Matching Section)         */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/90 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-widest text-slate-100 uppercase font-serif">
                            KEY LANDMARKS TO VISIT
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Iconic structures, architectural marvels, and prime vantage points across {details.name}
                        </p>
                    </div>

                    {/* 3 Landmark Photo Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {details.landmarks?.map((lm, idx) => (
                            <div
                                key={idx}
                                className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-[#101726] shadow-xl hover:border-emerald-500/50 transition-all duration-300 flex flex-col cursor-pointer"
                                onClick={() => setSelectedPhoto(lm.imageUrl)}
                            >
                                <div className="h-52 md:h-56 w-full overflow-hidden relative">
                                    <img
                                        src={lm.imageUrl}
                                        alt={lm.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#101726] via-transparent to-transparent opacity-80"></div>
                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-200 border border-white/10 flex items-center gap-1">
                                        <Eye className="w-3 h-3 text-emerald-400" /> View
                                    </div>
                                </div>
                                <div className="p-4 bg-[#101726] flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-white font-bold text-base md:text-lg mb-1">
                                            {lm.name}
                                        </h3>
                                        <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                                            {lm.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Side-by-Side Highlight Boxes: Must-See Landmarks & Best Photo Spots */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {/* Box 1: Must-See Landmarks (Blue Accent) */}
                        <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 border-l-4 border-l-blue-500 shadow-lg space-y-4">
                            <div className="flex items-center gap-2 text-blue-400 font-bold text-base md:text-lg">
                                <span className="text-blue-400 text-lg">⭐</span> Must-See Landmarks
                            </div>
                            <ul className="space-y-2.5 text-sm text-slate-300">
                                {details.mustSeeLandmarks?.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-blue-400 font-bold">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Box 2: Best Photo Spots (Yellow/Amber Accent) */}
                        <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 border-l-4 border-l-amber-500 shadow-lg space-y-4">
                            <div className="flex items-center gap-2 text-amber-400 font-bold text-base md:text-lg">
                                <span className="text-amber-400 text-lg">📸</span> Best Photo Spots
                            </div>
                            <ul className="space-y-2.5 text-sm text-slate-300">
                                {details.photoSpots?.map((spot, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-amber-400 font-bold">•</span>
                                        <span>{spot}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* TURN-BY-TURN DIRECTIONS & ROUTE INFO (Screenshot 2 Matching)   */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="space-y-6">
                    {/* Purple Header Box: Turn-by-Turn Directions */}
                    <div className="rounded-2xl overflow-hidden border border-purple-800/40 shadow-2xl">
                        <div className="bg-purple-600 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Compass className="w-6 h-6 text-white" />
                                <h3 className="text-lg md:text-xl font-bold text-white tracking-wide">
                                    Turn-by-Turn Directions ({details.directions?.length || 6} steps)
                                </h3>
                            </div>
                            <span className="text-xs bg-purple-700/80 text-purple-100 font-semibold px-3 py-1 rounded-full border border-purple-400/30">
                                Trailhead to Summit
                            </span>
                        </div>

                        {/* Step Items List */}
                        <div className="bg-slate-900/90 divide-y divide-slate-800">
                            {details.directions?.map((dir, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 md:px-6 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                                            {dir.type === "turn-right" ? (
                                                <ArrowUpRight className="w-5 h-5" />
                                            ) : dir.type === "turn-left" ? (
                                                <CornerDownRight className="w-5 h-5 rotate-180" />
                                            ) : (
                                                <Navigation className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                                                Step {dir.step || idx + 1}
                                            </div>
                                            <div className="text-slate-200 text-sm font-medium">
                                                {dir.title}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs md:text-sm text-slate-400 shrink-0 ml-4 font-mono">
                                        {dir.distance} • {dir.duration}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Route Information Card (Screenshot 2 Warm Card Style) */}
                    <div className="bg-[#fffdfa] border border-amber-200/90 rounded-2xl p-6 md:p-8 shadow-xl text-slate-800 space-y-4">
                        <div className="flex items-center gap-2.5 text-amber-800 font-bold text-lg md:text-xl border-b border-amber-200/60 pb-3">
                            <Car className="w-6 h-6 text-amber-700" />
                            <span>Route Information</span>
                        </div>
                        <ul className="space-y-3 text-sm md:text-base text-slate-700 font-normal">
                            <li className="flex items-start gap-2.5">
                                <span className="text-amber-600 font-bold text-lg leading-none mt-0.5">•</span>
                                <span>{details.routeInfo?.summary}</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="text-amber-600 font-bold text-lg leading-none mt-0.5">•</span>
                                <span>{details.routeInfo?.motorable}</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="text-amber-600 font-bold text-lg leading-none mt-0.5">•</span>
                                <span>{details.routeInfo?.transport}</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="text-amber-600 font-bold text-lg leading-none mt-0.5">•</span>
                                <span>{details.routeInfo?.parking}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* FULL INFORMATION & ARCHITECTURE SECTION                         */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <Info className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-100">Full Information & Architecture</h2>
                            <p className="text-xs text-slate-400">Geographic parameters, elevation, and key architectural sections</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Geographic Parameters List */}
                        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                                Geographic Attributes
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-slate-300">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <span>
                                        <strong className="text-slate-100 font-medium">Region:</strong> {details.fortId?.region || "Sahyadri — Western Ghats"}
                                    </span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-300">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                        <Navigation className="w-4 h-4" />
                                    </div>
                                    <span>
                                        <strong className="text-slate-100 font-medium">District:</strong> {details.fortId?.district || "Maharashtra"}
                                    </span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-300">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                        <Mountain className="w-4 h-4" />
                                    </div>
                                    <span>
                                        <strong className="text-slate-100 font-medium">Elevation:</strong> {details.fortId?.elevation ? `${details.fortId.elevation} meters MSL` : "1,100 m MSL"}
                                    </span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-300">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                        <Map className="w-4 h-4" />
                                    </div>
                                    <span>
                                        <strong className="text-slate-100 font-medium">Base Village:</strong> {details.fortId?.baseVillage || "Local Base Village"}
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* Fort Sections Breakdown */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                                Architectural Sections
                            </h3>
                            {details.fortId?.sections && details.fortId.sections.length > 0 ? (
                                details.fortId.sections.map((sec, idx) => (
                                    <div key={idx} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40">
                                        <h4 className="font-bold text-emerald-400 text-sm mb-1">{sec.name}</h4>
                                        <p className="text-xs text-slate-300 leading-relaxed">{sec.description}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="space-y-3">
                                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40">
                                        <h4 className="font-bold text-emerald-400 text-sm mb-1">Main Entrance Fortifications</h4>
                                        <p className="text-xs text-slate-300 leading-relaxed">Multi-tiered stone bastion gates designed to withstand elephant rams and artillery fire.</p>
                                    </div>
                                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40">
                                        <h4 className="font-bold text-emerald-400 text-sm mb-1">Balekilla (Upper Citadel)</h4>
                                        <p className="text-xs text-slate-300 leading-relaxed">The command stronghold situated at the apex vantage of the fortress ridge.</p>
                                    </div>
                                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40">
                                        <h4 className="font-bold text-emerald-400 text-sm mb-1">Water Harvest Tanks</h4>
                                        <p className="text-xs text-slate-300 leading-relaxed">Perennial rock-cut freshwater cisterns engineered to sustain long military sieges.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* CHRONOLOGICAL EVENTS & EROSION TRENDS                           */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Timeline */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl h-full">
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <History className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-100">Chronological Events</h2>
                                    <p className="text-xs text-slate-400">Historical milestones and ruler transitions</p>
                                </div>
                            </div>
                            <Timeline events={details.timeline} />
                        </div>
                    </div>

                    {/* Right Column: Erosion Trends Chart */}
                    <div className="lg:col-span-6 space-y-8">
                        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl h-full">
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                                <div className="p-2 bg-yellow-500/10 rounded-lg">
                                    <Mountain className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-100">Erosion & Degradation Trend</h2>
                                    <p className="text-xs text-slate-400">Environmental degradation severity over time (Scale 1-10)</p>
                                </div>
                            </div>
                            <ErosionChart data={details.erosionTrends} />
                        </div>
                    </div>
                </div>

                {/* Structural Degradation Photo Comparison (if available) */}
                {structuralPair && (
                    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                            <div className="p-2 bg-cyan-500/10 rounded-lg">
                                <ImageIcon className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-100">Structural Comparison Analysis</h2>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-slate-400" /> Archival vs Contemporary Structural Comparison
                            </h3>
                            <ImageComparisonSlider {...structuralPair} />
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* GOOGLE MAPS STYLE COMMUNITY PHOTO GALLERY                       */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                <Camera className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-100">Community Gallery (Google Maps Uploads)</h2>
                                <p className="text-xs text-slate-400">Real photographs contributed by trekkers, mountaineers, and historians</p>
                            </div>
                        </div>
                        <span className="text-xs text-slate-300 bg-slate-800 px-3.5 py-1.5 rounded-full flex items-center gap-2 self-start md:self-auto border border-slate-700/60 font-medium">
                            <Users className="w-4 h-4 text-emerald-400" /> 24+ Trekker Contributions
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {details.communityPhotos?.map((img, idx) => (
                            <div
                                key={idx}
                                className="group relative rounded-2xl overflow-hidden aspect-square border border-slate-800 hover:border-emerald-500/60 transition-all duration-300 cursor-pointer shadow-lg"
                                onClick={() => setSelectedPhoto(img.url)}
                            >
                                <img
                                    src={img.url}
                                    alt={img.caption || `Community upload ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white shadow">
                                            {img.user?.charAt(0) || "U"}
                                        </div>
                                        <span className="text-xs font-semibold text-slate-200 drop-shadow-md">
                                            {img.user}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 line-clamp-1">
                                        {img.caption}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Full-Screen Photo Modal */}
                {selectedPhoto && (
                    <div
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <div className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
                            <img src={selectedPhoto} alt="Enlarged view" className="w-full h-full object-contain max-h-[85vh]" />
                            <button
                                onClick={() => setSelectedPhoto(null)}
                                className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full p-2 text-sm border border-slate-700"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
