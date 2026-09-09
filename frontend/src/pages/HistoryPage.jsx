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
            <div className="flex justify-center items-center h-screen bg-[#F5F8F4]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
        <div className="min-h-screen bg-[#F5F8F4] text-slate-800 p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Top Back Navigation Bar */}
                <div className="flex items-center justify-between">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center bg-white px-4 py-2 rounded-full text-emerald-800 hover:bg-[#F2F7F4] hover:text-emerald-950 transition-all font-bold border border-[#E2ECE4] shadow-xs text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Interactive Map
                    </Link>
                    <div className="flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{details.fortId?.district || "Maharashtra"} • {details.fortId?.elevation || 1100}m MSL</span>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* HERO BANNER SECTION (Natural Photography + Warm Sandstone Accent) */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="relative w-full h-[48vh] md:h-[54vh] min-h-[380px] rounded-3xl overflow-hidden border border-[#E2ECE4] shadow-md group bg-slate-100">
                    <img
                        src={details.heroImage || details.fortId?.imageUrl || "/forts/sinhagad.webp"}
                        alt={details.fortId?.name || slug}
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                        onError={(e) => {
                            if (e.currentTarget.src !== details.fortId?.imageUrl && details.fortId?.imageUrl) {
                                e.currentTarget.src = details.fortId.imageUrl;
                            }
                        }}
                    />

                    {/* Gradient protection for crystal-clear readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent"></div>

                    {/* Hero Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 space-y-3 z-10">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-3.5 py-1 rounded-full text-xs font-bold border border-white/30 backdrop-blur-md shadow-xs">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-300" /> HERITAGE FORTIFICATION
                            </div>

                            {/* UNESCO World Heritage Site Badge (Warm Sandstone Accent) */}
                            {details.isUNESCO && (
                                <div className="inline-flex items-center gap-2 bg-amber-500/85 text-white px-3.5 py-1 rounded-full text-xs font-black border border-amber-300 backdrop-blur-md shadow-md tracking-wider">
                                    <Landmark className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                                    <span>UNESCO WORLD HERITAGE SITE</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-md">
                                {details.fortId?.name || details.name}
                            </h1>
                            {details.isUNESCO && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400/20 text-amber-200 border border-amber-400/40 text-xs md:text-sm font-bold backdrop-blur-md">
                                    <Award className="w-4 h-4 text-amber-300 shrink-0" />
                                    UNESCO Heritage
                                </span>
                            )}
                        </div>

                        <p className="text-white/90 text-sm md:text-base font-medium max-w-2xl drop-shadow-sm leading-relaxed">
                            {details.heroSubtitle}
                        </p>
                    </div>
                </div>

                {/* Historical & Environmental Overview */}
                <div className="bg-white border border-[#E2ECE4] rounded-2xl p-6 md:p-8 shadow-xs space-y-5">
                    <div className="flex items-center gap-3 border-b border-[#E2ECE4] pb-4">
                        <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-[#132A22]">Historical & Environmental Overview</h2>
                            <p className="text-xs text-[#52685E] font-medium">Architectural heritage, strategic military history, and preservation status</p>
                        </div>
                    </div>

                    <div className="text-slate-700 text-base leading-relaxed space-y-4 font-normal">
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
                <div className="bg-white border border-[#E2ECE4] rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
                    <div className="flex items-center gap-3 border-b border-[#E2ECE4] pb-4">
                        <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                            <History className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-[#132A22]">Chronological Events & Sovereign Milestones</h2>
                            <p className="text-xs text-[#52685E] font-medium">Historical milestones, siege timelines, and ruler transitions</p>
                        </div>
                    </div>
                    <Timeline events={details.timeline} />
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* KEY LANDMARKS TO VISIT (Light Environmental Theme)             */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-white border border-[#E2ECE4] rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
                            <Landmark className="w-4 h-4" /> Architectural Highlights
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#132A22] uppercase font-sans">
                            KEY LANDMARKS TO VISIT
                        </h2>
                        <p className="text-[#52685E] text-sm mt-1 font-medium">
                            Iconic structures, architectural marvels, and prime vantage points across {details.name}
                        </p>
                    </div>

                    {/* 3 Landmark Photo Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {details.landmarks?.map((lm, idx) => (
                            <div
                                key={idx}
                                className="group relative rounded-2xl overflow-hidden border border-[#E2ECE4] bg-white shadow-xs hover:border-emerald-500 hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer hover-lift"
                                onClick={() => setSelectedPhoto(lm.imageUrl)}
                            >
                                <div className="h-52 md:h-56 w-full overflow-hidden relative bg-slate-100">
                                    <img
                                        src={lm.imageUrl}
                                        alt={lm.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        onError={(e) => {
                                            e.currentTarget.src = details.heroImage || "/forts/sinhagad.webp";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                                    {/* Category Tag */}
                                    {lm.category && (
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-800 border border-[#E2ECE4] shadow-xs">
                                            {lm.category}
                                        </div>
                                    )}

                                    {/* Inspect / View Button */}
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-700 border border-[#E2ECE4] flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity shadow-xs">
                                        <Eye className="w-3 h-3 text-emerald-600" /> View
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                            <h3 className="text-[#132A22] font-bold text-base md:text-lg leading-snug">
                                                {lm.name}
                                            </h3>
                                            {lm.duration && (
                                                <span className="text-[11px] font-semibold text-amber-800 shrink-0 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                                    <Clock className="w-3 h-3 text-amber-600" /> {lm.duration}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-normal">
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
                        <div className="bg-emerald-50/70 rounded-xl p-5 border border-emerald-200 border-l-4 border-l-emerald-600 shadow-xs space-y-3">
                            <div className="flex items-center gap-2 text-emerald-900 font-bold text-base md:text-lg">
                                <span>⭐</span> Must-See Landmarks
                            </div>
                            <ul className="space-y-2 text-sm text-emerald-950 font-medium">
                                {details.mustSeeLandmarks?.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Box 2: Best Photo Spots (Sandstone/Amber Accent) */}
                        <div className="bg-amber-50/70 rounded-xl p-5 border border-amber-200 border-l-4 border-l-amber-600 shadow-xs space-y-3">
                            <div className="flex items-center gap-2 text-amber-950 font-bold text-base md:text-lg">
                                <span>📸</span> Best Photo Spots
                            </div>
                            <ul className="space-y-2 text-sm text-amber-950 font-medium">
                                {details.photoSpots?.map((spot, idx) => (
                                    <li key={idx} className="flex items-start gap-2.5">
                                        <span className="text-amber-600 font-bold">•</span>
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
                    <div className="rounded-2xl overflow-hidden border border-[#E2ECE4] shadow-xs bg-white">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <Compass className="w-6 h-6 text-white shrink-0" />
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-white tracking-wide flex items-center gap-2">
                                        Turn-by-Turn Directions
                                        <span className="text-xs bg-white/20 text-white font-semibold px-2.5 py-0.5 rounded-full border border-white/30">
                                            {details.directions?.length || 5} steps
                                        </span>
                                    </h3>
                                    <p className="text-emerald-100 text-xs font-medium">
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
                                    className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-emerald-900 font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
                                    title="Get your current location and show route to this fort on Google Maps"
                                >
                                    {isLocatingUser ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                                            <span>Getting Location...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Navigation2 className="w-3.5 h-3.5 text-emerald-700" />
                                            <span>Route on Google Maps</span>
                                            <ExternalLink className="w-3 h-3 opacity-60" />
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleOpenWebsiteMap}
                                    className="inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold px-3 py-1.5 rounded-xl text-xs transition-all border border-emerald-600/50 cursor-pointer shadow-xs active:scale-95"
                                    title="Directly open our interactive website map for this fort"
                                >
                                    <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                                    <span>Fort Pin</span>
                                </button>
                            </div>
                        </div>

                        {/* Trailhead Quick Summary Bar */}
                        <div className="bg-[#F8FAF8] px-6 py-2.5 border-b border-[#E2ECE4] flex flex-wrap items-center justify-between gap-4 text-xs text-slate-700 font-medium">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                                <span><strong>Trailhead:</strong> {details.coordinates?.trailhead?.name || details.fortId?.baseVillage}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mountain className="w-3.5 h-3.5 text-teal-700" />
                                <span><strong>Summit Elevation:</strong> {details.fortId?.elevation || 1100}m MSL</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono text-slate-500">
                                <span>GPS: {details.coordinates?.lat?.toFixed(4)}, {details.coordinates?.lng?.toFixed(4)}</span>
                            </div>
                        </div>

                        {/* Step Items List */}
                        <div className="divide-y divide-[#E2ECE4]">
                            {details.directions?.map((dir, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 md:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
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
                                                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                                                    Step {dir.step || idx + 1}
                                                </span>
                                                {dir.terrain && (
                                                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                                        {dir.terrain}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-slate-800 text-sm font-semibold">
                                                {dir.title}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs md:text-sm text-slate-500 shrink-0 ml-4 font-mono font-medium">
                                        {dir.distance} • {dir.duration}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ROUTE INFORMATION SECTION */}
                    <div className="bg-white border border-[#E2ECE4] rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
                        <div className="flex items-center justify-between border-b border-[#E2ECE4] pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
                                    <Car className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[#132A22]">Route & Transit Guide</h3>
                                    <p className="text-xs text-[#52685E] font-medium">Access routes, motorable roads, public transport, and parking amenities</p>
                                </div>
                            </div>
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline-flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Trail Access
                            </span>
                        </div>

                        {/* 4 Pillars Structured Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* 1. Trek Route */}
                            <div className="bg-[#F8FAF8] border border-[#E2ECE4] rounded-xl p-4.5 space-y-2 hover:border-emerald-300 transition-colors">
                                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                                    <Compass className="w-4 h-4 text-emerald-600" />
                                    <span>Trail Approach & Route</span>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed font-normal">
                                    {details.routeInfo?.summary}
                                </p>
                            </div>

                            {/* 2. Motorable Road */}
                            <div className="bg-[#F8FAF8] border border-[#E2ECE4] rounded-xl p-4.5 space-y-2 hover:border-teal-300 transition-colors">
                                <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                                    <Car className="w-4 h-4 text-teal-600" />
                                    <span>Road & Motorable Status</span>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed font-normal">
                                    {details.routeInfo?.motorable}
                                </p>
                            </div>

                            {/* 3. Public Transit */}
                            <div className="bg-[#F8FAF8] border border-[#E2ECE4] rounded-xl p-4.5 space-y-2 hover:border-purple-300 transition-colors">
                                <div className="flex items-center gap-2 text-purple-800 font-bold text-sm">
                                    <Bus className="w-4 h-4 text-purple-600" />
                                    <span>Public Transit & Connectivity</span>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed font-normal">
                                    {details.routeInfo?.transport}
                                </p>
                            </div>

                            {/* 4. Parking & Base Amenities */}
                            <div className="bg-[#F8FAF8] border border-[#E2ECE4] rounded-xl p-4.5 space-y-2 hover:border-amber-300 transition-colors">
                                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                                    <MapPin className="w-4 h-4 text-amber-600" />
                                    <span>Base Parking & Amenities</span>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed font-normal">
                                    {details.routeInfo?.parking}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FULL INFORMATION & ARCHITECTURE SECTION */}
                <div className="bg-white border border-[#E2ECE4] rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
                    <div className="flex items-center gap-3 border-b border-[#E2ECE4] pb-4">
                        <div className="p-2.5 bg-sky-50 text-sky-700 rounded-xl border border-sky-200">
                            <Info className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#132A22]">Full Information & Architecture</h2>
                            <p className="text-xs text-[#52685E] font-medium">Geographic parameters, elevation, and key architectural sections</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Geographic Parameters List */}
                        <div className="bg-[#F8FAF8] p-5 rounded-xl border border-[#E2ECE4] space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#52685E]">
                                Geographic Attributes
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-slate-700">
                                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-200">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <span>
                                        <strong className="text-[#132A22] font-semibold">Region:</strong> {details.fortId?.region || "Sahyadri — Western Ghats"}
                                    </span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-700">
                                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-200">
                                        <Navigation className="w-4 h-4" />
                                    </div>
                                    <span>
                                        <strong className="text-[#132A22] font-semibold">District:</strong> {details.fortId?.district || "Maharashtra"}
                                    </span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-700">
                                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-200">
                                        <Mountain className="w-4 h-4" />
                                    </div>
                                    <span>
                                        <strong className="text-[#132A22] font-semibold">Elevation:</strong> {details.fortId?.elevation ? `${details.fortId.elevation} meters MSL` : "1,100 m MSL"}
                                    </span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-700">
                                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-200">
                                        <Map className="w-4 h-4" />
                                    </div>
                                    <span>
                                        <strong className="text-[#132A22] font-semibold">Base Village:</strong> {details.fortId?.baseVillage || "Local Base Village"}
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* Fort Sections Breakdown */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#52685E]">
                                Architectural Sections
                            </h3>
                            {details.fortId?.sections && details.fortId.sections.length > 0 ? (
                                details.fortId.sections.map((sec, idx) => (
                                    <div key={idx} className="bg-[#F8FAF8] p-4 rounded-xl border border-[#E2ECE4]">
                                        <h4 className="font-bold text-emerald-800 text-sm mb-1">{sec.name}</h4>
                                        <p className="text-xs text-slate-600 leading-relaxed font-normal">{sec.description}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="space-y-3">
                                    <div className="bg-[#F8FAF8] p-4 rounded-xl border border-[#E2ECE4]">
                                        <h4 className="font-bold text-emerald-800 text-sm mb-1">Main Entrance Fortifications</h4>
                                        <p className="text-xs text-slate-600 leading-relaxed font-normal">Multi-tiered stone bastion gates designed to withstand artillery fire.</p>
                                    </div>
                                    <div className="bg-[#F8FAF8] p-4 rounded-xl border border-[#E2ECE4]">
                                        <h4 className="font-bold text-emerald-800 text-sm mb-1">Balekilla (Upper Citadel)</h4>
                                        <p className="text-xs text-slate-600 leading-relaxed font-normal">The command stronghold situated at the apex vantage of the fortress ridge.</p>
                                    </div>
                                    <div className="bg-[#F8FAF8] p-4 rounded-xl border border-[#E2ECE4]">
                                        <h4 className="font-bold text-emerald-800 text-sm mb-1">Water Harvest Tanks</h4>
                                        <p className="text-xs text-slate-600 leading-relaxed font-normal">Perennial rock-cut freshwater cisterns engineered to sustain long military sieges.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ENVIRONMENTAL & EROSION RESILIENCE MONITOR */}
                <div className="bg-white border border-[#E2ECE4] rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2ECE4] pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
                                <Mountain className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-[#132A22]">Environmental & Erosion Resilience Monitor</h2>
                                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                        Scientific Climate Model
                                    </span>
                                </div>
                                <p className="text-xs text-[#52685E] font-medium">
                                    Longitudinal monsoon precipitation exposure, trail soil loss & architectural preservation (2016–2025)
                                </p>
                            </div>
                        </div>
                        <span className="text-xs text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto font-mono font-medium">
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

                {/* COMMUNITY PHOTO GALLERY */}
                <div className="bg-white border border-[#E2ECE4] rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2ECE4] pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl border border-teal-200">
                                <Camera className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[#132A22]">Community Gallery</h2>
                                <p className="text-xs text-[#52685E] font-medium">Authentic photographs contributed by Sahyadri trekkers, mountaineers, and historians</p>
                            </div>
                        </div>
                        <span className="text-xs text-slate-700 bg-slate-50 px-3.5 py-1.5 rounded-full flex items-center gap-2 self-start md:self-auto border border-slate-200 font-semibold">
                            <Users className="w-4 h-4 text-emerald-600" /> 24+ Verified Trekker Contributions
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {details.communityPhotos?.map((img, idx) => (
                            <div
                                key={idx}
                                className="group relative rounded-2xl overflow-hidden aspect-square border border-[#E2ECE4] hover:border-emerald-500 transition-all duration-300 cursor-pointer shadow-xs hover-lift bg-slate-100"
                                onClick={() => setSelectedPhoto(img.url)}
                            >
                                <img
                                    src={img.url}
                                    alt={img.caption || `Community upload ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    loading="lazy"
                                    onError={(e) => {
                                        e.currentTarget.src = details.heroImage || "/forts/sinhagad.webp";
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white shadow">
                                                {img.user?.charAt(0) || "U"}
                                            </div>
                                            <span className="text-xs font-semibold text-white drop-shadow-sm">
                                                {img.user}
                                            </span>
                                        </div>
                                        {img.date && (
                                            <span className="text-[10px] text-white/80">
                                                {img.date}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-white/90 line-clamp-2 leading-tight">
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
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <div
                            className="relative max-w-5xl max-h-[92vh] rounded-2xl overflow-hidden shadow-2xl border border-[#E2ECE4] bg-white flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative overflow-hidden flex items-center justify-center bg-slate-100">
                                <img
                                    src={selectedPhoto}
                                    alt="Enlarged view"
                                    className="w-full h-full object-contain max-h-[82vh]"
                                />
                                <button
                                    onClick={() => setSelectedPhoto(null)}
                                    className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-800 rounded-full p-2.5 text-sm shadow-xl transition-all cursor-pointer"
                                    title="Close viewer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-4 bg-white border-t border-[#E2ECE4] flex items-center justify-between text-xs text-slate-600">
                                <span className="flex items-center gap-2 font-medium">
                                    <Camera className="w-4 h-4 text-emerald-600" /> High-Resolution Sahyadri Archival View
                                </span>
                                <span>Click anywhere to exit</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Website Interactive Map Modal */}
                {isMapModalOpen && (
                    <div
                        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
                        onClick={() => setIsMapModalOpen(false)}
                    >
                        <div
                            className="relative w-full max-w-5xl bg-white border border-[#E2ECE4] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-4 px-6 bg-[#F8FAF8] border-b border-[#E2ECE4] flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-[#132A22] font-bold text-base md:text-lg">
                                                {details.fortId?.name || details.name}
                                            </h3>
                                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                Interactive Map
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#52685E] font-medium">
                                            Satellite & Topo view with live trails & erosion risk
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <Link
                                        to={`/dashboard?fort=${slug}`}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-all shadow-xs"
                                    >
                                        <span>Full Dashboard Map</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </Link>
                                    <button
                                        onClick={() => setIsMapModalOpen(false)}
                                        className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                                        title="Close map viewer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Embedded FortMap Component */}
                            <div className="w-full h-[65vh] min-h-[420px] relative bg-slate-50">
                                <FortMap className="w-full h-full" />
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
