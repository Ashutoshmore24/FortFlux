import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useFortStore } from "../store/useFortStore";
import { useWeatherStore } from "../store/useWeatherStore";
import FortMap from "../components/map/FortMap";
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
    Eye,
    Award,
    ExternalLink,
    Landmark,
    Bus,
    ShieldCheck,
    Navigation2,
    X,
    Loader2
} from "lucide-react";

export default function HistoryPage() {
    const { slug } = useParams();
    const { fetchFortHistory, fortHistory, isLoadingHistory, forts, selectFort, fetchFortDetail } = useFortStore();
    const { setSelectedFort } = useWeatherStore();
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [isLocatingUser, setIsLocatingUser] = useState(false);

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

    // Coordinates for summit and base
    const summitLat = details.coordinates?.lat;
    const summitLng = details.coordinates?.lng;

    /**
     * Request user permission for current location and open Google Maps route from current location.
     */
    const handleRouteOnGoogleMaps = () => {
        const destination = (summitLat && summitLng)
            ? `${summitLat},${summitLng}`
            : encodeURIComponent(`${details.name}, Maharashtra`);

        if (!navigator.geolocation) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, "_blank", "noopener,noreferrer");
            return;
        }

        setIsLocatingUser(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setIsLocatingUser(false);
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destination}`;
                window.open(mapsUrl, "_blank", "noopener,noreferrer");
            },
            (err) => {
                setIsLocatingUser(false);
                console.warn("Geolocation permission error/denied:", err);
                // Graceful fallback to destination only, letting Google Maps ask on device
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, "_blank", "noopener,noreferrer");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    };

    /**
     * Directly open our website's interactive map component for this fort.
     */
    const handleOpenWebsiteMap = () => {
        if (slug) {
            setSelectedFort(slug);
            fetchFortDetail(slug);
            const match = forts?.find((f) => f.slug === slug);
            if (match) {
                selectFort(match);
            } else if (details.fortId) {
                selectFort({
                    _id: details.fortId._id || slug,
                    name: details.fortId.name || details.name,
                    slug: slug,
                    location: details.fortId.location || { coordinates: [summitLng || 73.7558, summitLat || 18.3663] },
                    elevation: details.fortId.elevation,
                    district: details.fortId.district,
                    region: details.fortId.region
                });
            }
        }
        setIsMapModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Top Back Navigation Bar */}
                <div className="flex items-center justify-between">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 transition-all font-medium border border-slate-700/60 shadow-lg text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Interactive Map
                    </Link>
                    <div className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{details.fortId?.district || "Maharashtra"} • {details.fortId?.elevation || 1100}m MSL</span>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* HERO BANNER SECTION (Proper Fitting + Local Image + UNESCO)    */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="relative w-full h-[48vh] md:h-[54vh] min-h-[380px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group bg-slate-900">
                    <img
                        src={details.heroImage || details.fortId?.imageUrl || "/forts/sinhagad.webp"}
                        alt={details.fortId?.name || slug}
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                        onError={(e) => {
                            // Fallback gracefully if format fails
                            if (e.currentTarget.src !== details.fortId?.imageUrl && details.fortId?.imageUrl) {
                                e.currentTarget.src = details.fortId.imageUrl;
                            }
                        }}
                    />

                    {/* Multi-tier Gradient protection for crystal-clear readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-transparent"></div>

                    {/* Hero Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 space-y-3 z-10">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3.5 py-1 rounded-full text-xs font-bold border border-emerald-500/40 backdrop-blur-md shadow-sm">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> HERITAGE FORTIFICATION
                            </div>

                            {/* UNESCO World Heritage Site Badge */}
                            {details.isUNESCO && (
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/30 via-yellow-500/25 to-amber-500/30 text-amber-200 px-3.5 py-1 rounded-full text-xs font-black border border-amber-400/60 backdrop-blur-md shadow-lg shadow-amber-950/50 tracking-wider">
                                    <Landmark className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                                    <span>UNESCO WORLD HERITAGE SITE</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-2xl">
                                {details.fortId?.name || details.name}
                            </h1>
                            {details.isUNESCO && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/50 text-xs md:text-sm font-bold backdrop-blur-md shadow-md shadow-amber-950/30">
                                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                                    UNESCO Heritage
                                </span>
                            )}
                        </div>

                        <p className="text-slate-300 text-sm md:text-base font-medium max-w-2xl drop-shadow-md leading-relaxed">
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
                {/* CHRONOLOGICAL EVENTS TIMELINE                                   */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                        <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <History className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-100">Chronological Events & Sovereign Milestones</h2>
                            <p className="text-xs text-slate-400">Historical milestones, siege timelines, and ruler transitions</p>
                        </div>
                    </div>
                    <Timeline events={details.timeline} />
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* KEY LANDMARKS TO VISIT (Updated with Modern Theme & Fonts)     */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/90 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                            <Landmark className="w-4 h-4" /> Architectural Highlights
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-wide text-white uppercase font-sans">
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
                                className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/80 shadow-xl hover:border-emerald-500/60 hover:shadow-emerald-950/20 transition-all duration-300 flex flex-col cursor-pointer"
                                onClick={() => setSelectedPhoto(lm.imageUrl)}
                            >
                                <div className="h-52 md:h-56 w-full overflow-hidden relative bg-slate-950">
                                    <img
                                        src={lm.imageUrl}
                                        alt={lm.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        onError={(e) => {
                                            // Fallback to fort hero image if landmark link errors out
                                            e.currentTarget.src = details.heroImage || "/forts/sinhagad.webp";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>

                                    {/* Category Tag */}
                                    {lm.category && (
                                        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                                            {lm.category}
                                        </div>
                                    )}

                                    {/* Inspect / View Button */}
                                    <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-200 border border-white/10 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                                        <Eye className="w-3 h-3 text-emerald-400" /> View
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-slate-900/90">
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                            <h3 className="text-white font-bold text-base md:text-lg leading-snug">
                                                {lm.name}
                                            </h3>
                                            {lm.duration && (
                                                <span className="text-[11px] font-medium text-slate-400 shrink-0 flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/50">
                                                    <Clock className="w-3 h-3 text-amber-400" /> {lm.duration}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                                            {lm.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Side-by-Side Highlight Boxes: Must-See Landmarks & Best Photo Spots */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {/* Box 1: Must-See Landmarks (Emerald Accent) */}
                        <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 border-l-4 border-l-emerald-500 shadow-lg space-y-4">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base md:text-lg">
                                <span className="text-emerald-400 text-lg">⭐</span> Must-See Landmarks
                            </div>
                            <ul className="space-y-2.5 text-sm text-slate-300">
                                {details.mustSeeLandmarks?.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Box 2: Best Photo Spots (Amber Accent) */}
                        <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 border-l-4 border-l-amber-500 shadow-lg space-y-4">
                            <div className="flex items-center gap-2 text-amber-400 font-bold text-base md:text-lg">
                                <span className="text-amber-400 text-lg">📸</span> Best Photo Spots
                            </div>
                            <ul className="space-y-2.5 text-sm text-slate-300">
                                {details.photoSpots?.map((spot, idx) => (
                                    <li key={idx} className="flex items-start gap-2.5">
                                        <span className="text-amber-400 font-bold">•</span>
                                        <span>{spot}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* TURN-BY-TURN DIRECTIONS + GOOGLE MAPS DIRECT NAVIGATION        */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="space-y-6">
                    <div className="rounded-2xl overflow-hidden border border-purple-800/40 shadow-2xl bg-slate-900/90">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <Compass className="w-6 h-6 text-purple-200 shrink-0" />
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-white tracking-wide flex items-center gap-2">
                                        Turn-by-Turn Directions
                                        <span className="text-xs bg-purple-900/70 text-purple-200 font-semibold px-2.5 py-0.5 rounded-full border border-purple-400/30">
                                            {details.directions?.length || 5} steps
                                        </span>
                                    </h3>
                                    <p className="text-purple-200/80 text-xs">
                                        {details.coordinates?.trailhead?.name || details.fortId?.baseVillage} → {details.name} Summit
                                    </p>
                                </div>
                            </div>

                            {/* Google Maps & Website Map Actions */}
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                <button
                                    type="button"
                                    onClick={handleRouteOnGoogleMaps}
                                    disabled={isLocatingUser}
                                    className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-600/70 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95 cursor-pointer"
                                    title="Get your current location and show route to this fort on Google Maps"
                                >
                                    {isLocatingUser ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                                            <span>Getting Location...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Navigation2 className="w-3.5 h-3.5" />
                                            <span>Route on Google Maps</span>
                                            <ExternalLink className="w-3 h-3 opacity-70" />
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleOpenWebsiteMap}
                                    className="inline-flex items-center gap-1.5 bg-purple-900/80 hover:bg-purple-800 text-purple-200 font-semibold px-3 py-1.5 rounded-xl text-xs transition-all border border-purple-400/30 cursor-pointer shadow-md active:scale-95"
                                    title="Directly open our interactive website map for this fort"
                                >
                                    <MapPin className="w-3.5 h-3.5 text-purple-300" />
                                    <span>Fort Pin</span>
                                </button>
                            </div>
                        </div>

                        {/* Trailhead Quick Summary Bar */}
                        <div className="bg-slate-950/80 px-6 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                <span><strong>Trailhead:</strong> {details.coordinates?.trailhead?.name || details.fortId?.baseVillage}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mountain className="w-3.5 h-3.5 text-purple-400" />
                                <span><strong>Summit Elevation:</strong> {details.fortId?.elevation || 1100}m MSL</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono text-slate-400">
                                <span>GPS: {details.coordinates?.lat?.toFixed(4)}, {details.coordinates?.lng?.toFixed(4)}</span>
                            </div>
                        </div>

                        {/* Step Items List */}
                        <div className="divide-y divide-slate-800/80">
                            {details.directions?.map((dir, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 md:px-6 flex items-center justify-between hover:bg-slate-800/40 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                                            {dir.type === "turn-right" ? (
                                                <ArrowUpRight className="w-5 h-5" />
                                            ) : dir.type === "turn-left" ? (
                                                <CornerDownRight className="w-5 h-5 rotate-180" />
                                            ) : (
                                                <Navigation className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                                                    Step {dir.step || idx + 1}
                                                </span>
                                                {dir.terrain && (
                                                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60">
                                                        {dir.terrain}
                                                    </span>
                                                )}
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

                    {/* ═══════════════════════════════════════════════════════════ */}
                    {/* ROUTE INFORMATION SECTION (Upgraded to Dark Slate Theme)   */}
                    {/* ═══════════════════════════════════════════════════════════ */}
                    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                    <Car className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Route & Transit Guide</h3>
                                    <p className="text-xs text-slate-400">Access routes, motorable roads, public transport, and parking amenities</p>
                                </div>
                            </div>
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 hidden sm:inline-flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Trail Access
                            </span>
                        </div>

                        {/* 4 Pillars Structured Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* 1. Trek Route */}
                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4.5 space-y-2 hover:border-slate-700 transition-colors">
                                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                                    <Compass className="w-4 h-4 text-emerald-400" />
                                    <span>Trail Approach & Route</span>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {details.routeInfo?.summary}
                                </p>
                            </div>

                            {/* 2. Motorable Road */}
                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4.5 space-y-2 hover:border-slate-700 transition-colors">
                                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                                    <Car className="w-4 h-4 text-cyan-400" />
                                    <span>Road & Motorable Status</span>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {details.routeInfo?.motorable}
                                </p>
                            </div>

                            {/* 3. Public Transit */}
                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4.5 space-y-2 hover:border-slate-700 transition-colors">
                                <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
                                    <Bus className="w-4 h-4 text-purple-400" />
                                    <span>Public Transit & Connectivity</span>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {details.routeInfo?.transport}
                                </p>
                            </div>

                            {/* 4. Parking & Base Amenities */}
                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4.5 space-y-2 hover:border-slate-700 transition-colors">
                                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                                    <MapPin className="w-4 h-4 text-amber-400" />
                                    <span>Base Parking & Amenities</span>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {details.routeInfo?.parking}
                                </p>
                            </div>
                        </div>
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
                                        <p className="text-xs text-slate-300 leading-relaxed">Multi-tiered stone bastion gates designed to withstand artillery fire.</p>
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
                {/* ENVIRONMENTAL & EROSION RESILIENCE MONITOR                      */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                                <Mountain className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-slate-100">Environmental & Erosion Resilience Monitor</h2>
                                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        Scientific Climate Model
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">
                                    Longitudinal monsoon precipitation exposure, trail soil loss & architectural preservation (2016–2025)
                                </p>
                            </div>
                        </div>
                        <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 self-start sm:self-auto font-mono">
                            {details.environmentalProfile?.typology || "Sahyadri Heritage Fort"}
                        </span>
                    </div>

                    <ErosionChart
                        data={details.erosionTrends}
                        environmentalProfile={details.environmentalProfile}
                        fortName={details.name}
                        isUNESCO={details.isUNESCO}
                    />
                </div>


                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* COMMUNITY PHOTO GALLERY (Authentic Trekker Photos & Lightbox)  */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                <Camera className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-100">Community Gallery (Google Maps Uploads)</h2>
                                <p className="text-xs text-slate-400">Authentic photographs contributed by Sahyadri trekkers, mountaineers, and historians</p>
                            </div>
                        </div>
                        <span className="text-xs text-slate-300 bg-slate-800 px-3.5 py-1.5 rounded-full flex items-center gap-2 self-start md:self-auto border border-slate-700/60 font-medium">
                            <Users className="w-4 h-4 text-emerald-400" /> 24+ Verified Trekker Contributions
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {details.communityPhotos?.map((img, idx) => (
                            <div
                                key={idx}
                                className="group relative rounded-2xl overflow-hidden aspect-square border border-slate-800 hover:border-emerald-500/60 transition-all duration-300 cursor-pointer shadow-lg bg-slate-950"
                                onClick={() => setSelectedPhoto(img.url)}
                            >
                                <img
                                    src={img.url}
                                    alt={img.caption || `Community upload ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    loading="lazy"
                                    onError={(e) => {
                                        // Fallback to local hero image
                                        e.currentTarget.src = details.heroImage || "/forts/sinhagad.webp";
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white shadow">
                                                {img.user?.charAt(0) || "U"}
                                            </div>
                                            <span className="text-xs font-semibold text-slate-200 drop-shadow-md">
                                                {img.user}
                                            </span>
                                        </div>
                                        {img.date && (
                                            <span className="text-[10px] text-slate-400">
                                                {img.date}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                                        {img.caption}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Full-Screen Photo Modal / Lightbox */}
                {selectedPhoto && (
                    <div
                        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <div
                            className="relative max-w-5xl max-h-[92vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-950 flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative overflow-hidden flex items-center justify-center bg-black">
                                <img
                                    src={selectedPhoto}
                                    alt="Enlarged view"
                                    className="w-full h-full object-contain max-h-[82vh]"
                                />
                                <button
                                    onClick={() => setSelectedPhoto(null)}
                                    className="absolute top-4 right-4 bg-slate-900/90 hover:bg-slate-800 text-white rounded-full p-2.5 text-sm border border-slate-700 shadow-xl transition-all cursor-pointer"
                                    title="Close viewer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                                <span className="flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-emerald-400" /> High-Resolution Sahyadri Archival View
                                </span>
                                <span>Press ESC or click anywhere to exit</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Website Interactive Map Modal */}
                {isMapModalOpen && (
                    <div
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
                        onClick={() => setIsMapModalOpen(false)}
                    >
                        <div
                            className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-4 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-white font-bold text-base md:text-lg">
                                                {details.fortId?.name || details.name}
                                            </h3>
                                            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                Website Map Component
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            Interactive 3D Satellite & Terrain view with live trails, water cisterns & erosion risk
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <Link
                                        to={`/dashboard?fort=${slug}`}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700/80 transition-all shadow"
                                    >
                                        <span>Full Dashboard Map</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </Link>
                                    <button
                                        onClick={() => setIsMapModalOpen(false)}
                                        className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                                        title="Close map viewer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Embedded FortMap Component */}
                            <div className="w-full h-[65vh] min-h-[420px] relative bg-slate-950">
                                <FortMap className="w-full h-full" />
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
