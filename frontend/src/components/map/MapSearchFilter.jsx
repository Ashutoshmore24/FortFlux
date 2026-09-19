// ── In-Map Search & Filter Component (Phase 1) ──
// Allows instant search across forts, districts, and base villages,
// with quick filter chips and smooth camera flyTo integration.

import { useState, useMemo, useRef, useEffect } from "react";
import {
    Search,
    X,
    MapPin,
    Mountain,
    Filter,
    ShieldAlert,
    CloudRain,
    Anchor,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

const FILTER_OPTIONS = [
    { id: "all", label: "All Forts", icon: null },
    { id: "pune", label: "Pune", icon: MapPin },
    { id: "raigad", label: "Raigad", icon: MapPin },
    { id: "satara", label: "Satara", icon: MapPin },
    { id: "monsoon", label: "Monsoon Surge", icon: CloudRain },
    { id: "sea-forts", label: "Sea Forts", icon: Anchor },
];

const MapSearchFilter = ({
    forts = [],
    selectedFort = null,
    activeFilter = "all",
    onFilterChange,
    onFortSelect,
    weatherMap = null,
    className = "",
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    const containerRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filtered results for search input
    const searchResults = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return [];

        return forts
            .filter((f) => {
                const nameMatch = f.name?.toLowerCase().includes(q);
                const districtMatch = f.district?.toLowerCase().includes(q);
                const villageMatch = f.baseVillage?.toLowerCase().includes(q);
                const regionMatch = f.region?.toLowerCase().includes(q);
                return nameMatch || districtMatch || villageMatch || regionMatch;
            })
            .slice(0, 7);
    }, [forts, searchQuery]);

    // Calculate count badges for each filter chip
    const filterCounts = useMemo(() => {
        const counts = { all: forts.length, pune: 0, raigad: 0, satara: 0, monsoon: 0, "sea-forts": 0 };

        for (const f of forts) {
            const dist = (f.district || "").toLowerCase();
            if (dist.includes("pune")) counts.pune++;
            if (dist.includes("raigad")) counts.raigad++;
            if (dist.includes("satara")) counts.satara++;
            if ((f.elevation || 0) <= 25) counts["sea-forts"]++;

            const weather = weatherMap?.[f.slug];
            if (weather && (weather.precipitation > 0 || weather.rain > 0)) {
                counts.monsoon++;
            }
        }

        return counts;
    }, [forts, weatherMap]);

    const handleSelectFort = (fort) => {
        setIsDropdownOpen(false);
        setSearchQuery("");
        if (onFortSelect) onFortSelect(fort);
    };

    return (
        <div
            ref={containerRef}
            className={`absolute top-3 left-14 z-[15] max-w-sm w-[calc(100%-80px)] sm:w-80 flex flex-col gap-1.5 transition-all select-none ${className}`}
        >
            {/* Search Input Box */}
            <div className="relative flex items-center bg-white/95 backdrop-blur-md border border-[#E2ECE4] rounded-xl shadow-md transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                <div className="pl-3 text-slate-400">
                    <Search className="w-4 h-4 text-emerald-600" />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Search 18 forts, districts, or villages..."
                    className="w-full bg-transparent px-2.5 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-hidden"
                />

                {searchQuery ? (
                    <button
                        type="button"
                        onClick={() => {
                            setSearchQuery("");
                            setIsDropdownOpen(false);
                        }}
                        className="pr-2.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                        title="Clear search"
                        aria-label="Clear search"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        title={showFilters ? "Hide filter chips" : "Show filter chips"}
                        aria-label="Toggle filter chips"
                        className={`pr-2.5 pl-1 py-1 text-slate-400 hover:text-emerald-700 transition cursor-pointer flex items-center gap-0.5 ${
                            activeFilter !== "all" ? "text-emerald-600 font-bold" : ""
                        }`}
                    >
                        <Filter className="w-3.5 h-3.5" />
                        {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                )}
            </div>

            {/* Autocomplete Dropdown */}
            {isDropdownOpen && searchResults.length > 0 && (
                <div className="bg-white/98 backdrop-blur-lg border border-[#E2ECE4] rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-64 overflow-y-auto">
                    <div className="px-3 py-1.5 bg-[#F5F8F4] border-b border-[#E2ECE4] text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Matching Forts ({searchResults.length})</span>
                        <span>Click to Fly</span>
                    </div>
                    {searchResults.map((f) => {
                        const isSea = (f.elevation || 0) <= 25;
                        return (
                            <button
                                key={f._id || f.slug}
                                type="button"
                                onClick={() => handleSelectFort(f)}
                                className="w-full text-left px-3 py-2 hover:bg-emerald-50/70 border-b border-slate-100 last:border-b-0 transition flex items-center justify-between gap-2 cursor-pointer group"
                            >
                                <div className="min-w-0">
                                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 flex items-center gap-1.5 truncate">
                                        <span>{isSea ? "🌊" : "🏰"}</span>
                                        <span>{f.name}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                        <span className="truncate">{f.district} District</span>
                                        {f.baseVillage && (
                                            <>
                                                <span>·</span>
                                                <span className="truncate">Base: {f.baseVillage}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="shrink-0 flex flex-col items-end">
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                        {f.elevation}m
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Quick Filter Chips */}
            {showFilters && (
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none animate-in fade-in duration-200">
                    {FILTER_OPTIONS.map((opt) => {
                        const count = filterCounts[opt.id] ?? 0;
                        const isActive = activeFilter === opt.id;
                        const Icon = opt.icon;

                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => onFilterChange && onFilterChange(opt.id)}
                                className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition cursor-pointer active:scale-95 shadow-xs border ${
                                    isActive
                                        ? "bg-emerald-700 text-white border-emerald-800 font-bold shadow-sm"
                                        : "bg-white/90 backdrop-blur-md text-slate-700 border-[#E2ECE4] hover:bg-white hover:border-emerald-400 hover:text-emerald-900"
                                }`}
                            >
                                {Icon && <Icon className={`w-3 h-3 ${isActive ? "text-white" : "text-emerald-600"}`} />}
                                <span>{opt.label}</span>
                                <span
                                    className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
                                        isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MapSearchFilter;
