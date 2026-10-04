// ── Offline Map Download & Mountain Blackout Manager Modal ──
// High-fidelity dark glassmorphic manager for downloading fort packs,
// managing IndexedDB storage, and offline emergency survival kits.

import { useState, useMemo } from "react";
import { useOfflineStore } from "../../store/useOfflineStore";
import { EMERGENCY_RESCUE_CONTACTS, generateEmergencySOS } from "../../utils/offlineMapManager";
import {
    DownloadCloud,
    Trash2,
    CheckCircle2,
    AlertTriangle,
    Wifi,
    WifiOff,
    HardDrive,
    Shield,
    PhoneCall,
    Copy,
    Check,
    Radio,
    Search,
    RefreshCw,
    X,
    FileText,
    Zap,
    MapPin,
} from "lucide-react";

export const OfflineMapDownloadModal = ({
    availableForts = [],
    selectedFortSlug = "rajgad",
    onSelectFort = null,
}) => {
    const {
        isOnline,
        isSimulatingOffline,
        setSimulateOffline,
        isModalOpen,
        closeModal,
        downloadedPacks,
        storageStats,
        downloadProgress,
        isDownloadingBatch,
        batchProgress,
        downloadFort,
        downloadAllForts,
        removeFortPack,
        clearAll,
        isDownloaded,
    } = useOfflineStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [copiedPhone, setCopiedPhone] = useState(null);
    const [copiedSOS, setCopiedSOS] = useState(false);
    const [activeTab, setActiveTab] = useState("downloads"); // "downloads" | "sos_kit"

    // Normalize forts list
    const fortList = useMemo(() => {
        if (availableForts && availableForts.length > 0) {
            return availableForts.map((f) => ({
                slug: f.slug || f.name?.toLowerCase().replace(/\s+/g, "-"),
                name: f.name || f.slug,
                district: f.district || "Pune / Raigad",
                elevation: f.elevation || 1200,
            }));
        }
        // Fallback default fort list
        return [
            { slug: "rajgad", name: "Rajgad Fort", district: "Pune", elevation: 1376 },
            { slug: "torna", name: "Torna Fort", district: "Pune", elevation: 1403 },
            { slug: "harishchandragad", name: "Harishchandragad", district: "Ahmednagar", elevation: 1424 },
            { slug: "raigad", name: "Raigad Fort", district: "Raigad", elevation: 820 },
            { slug: "sinhagad", name: "Sinhagad Fort", district: "Pune", elevation: 1312 },
            { slug: "lohagad", name: "Lohagad Fort", district: "Pune", elevation: 1033 },
            { slug: "visapur", name: "Visapur Fort", district: "Pune", elevation: 1084 },
            { slug: "pratapgad", name: "Pratapgad Fort", district: "Satara", elevation: 1080 },
            { slug: "kalavantin-durg", name: "Kalavantin Durg", district: "Raigad", elevation: 686 },
            { slug: "shivneri", name: "Shivneri Fort", district: "Pune", elevation: 1042 },
            { slug: "panhala", name: "Panhala Fort", district: "Kolhapur", elevation: 845 },
            { slug: "purandar", name: "Purandar Fort", district: "Pune", elevation: 1387 },
            { slug: "tikona", name: "Tikona Fort", district: "Pune", elevation: 1060 },
            { slug: "tung", name: "Tung Fort", district: "Pune", elevation: 1075 },
            { slug: "sudhagad", name: "Sudhagad Fort", district: "Raigad", elevation: 590 },
            { slug: "sarasgad", name: "Sarasgad Fort", district: "Raigad", elevation: 490 },
            { slug: "vasota", name: "Vasota Fort", district: "Satara", elevation: 1120 },
            { slug: "korigad", name: "Korigad Fort", district: "Pune", elevation: 929 },
        ];
    }, [availableForts]);

    const filteredForts = useMemo(() => {
        if (!searchQuery.trim()) return fortList;
        const q = searchQuery.toLowerCase();
        return fortList.filter(
            (f) => f.name.toLowerCase().includes(q) || f.district.toLowerCase().includes(q)
        );
    }, [fortList, searchQuery]);

    if (!isModalOpen) return null;

    const currentFort = fortList.find(
        (f) => f.slug.toLowerCase() === selectedFortSlug?.toLowerCase()
    ) || fortList[0];

    const currentDownloadStatus = downloadProgress[currentFort.slug];
    const isCurrentDownloaded = isDownloaded(currentFort.slug);

    const handleCopyPhone = (number) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(number);
            setCopiedPhone(number);
            setTimeout(() => setCopiedPhone(null), 2000);
        }
    };

    const handleCopySOS = () => {
        const text = generateEmergencySOS([73.6822, 18.2459], currentFort.name);
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            setCopiedSOS(true);
            setTimeout(() => setCopiedSOS(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white border border-[#E2ECE4] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Modal Header ── */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white flex items-center justify-between border-b border-emerald-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
                            <DownloadCloud className="w-5 h-5 text-emerald-300" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-base tracking-tight text-white">
                                    Offline Mountain Navigation
                                </h3>
                                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold uppercase">
                                    Zero Cellular
                                </span>
                            </div>
                            <p className="text-xs text-emerald-200/80 mt-0.5">
                                Download fort trails, cisterns, cellular dead zones & rescue guides for offline field survival.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={closeModal}
                        aria-label="Close offline modal"
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white flex items-center justify-center transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Tabs Navigation ── */}
                <div className="flex items-center border-b border-[#E2ECE4] bg-[#F8FAF8] px-4 pt-2 gap-2 text-xs font-bold">
                    <button
                        type="button"
                        onClick={() => setActiveTab("downloads")}
                        className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition cursor-pointer ${
                            activeTab === "downloads"
                                ? "border-emerald-600 text-emerald-800 bg-white rounded-t-lg shadow-2xs"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <DownloadCloud className="w-4 h-4 text-emerald-600" />
                        <span>Offline Fort Packs ({downloadedPacks.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("sos_kit")}
                        className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition cursor-pointer ${
                            activeTab === "sos_kit"
                                ? "border-red-600 text-red-800 bg-white rounded-t-lg shadow-2xs"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <Shield className="w-4 h-4 text-red-600" />
                        <span>Emergency Rescue SOS Kit</span>
                    </button>
                </div>

                {/* ── Modal Content ── */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                    {/* Status & Test Blackout Card */}
                    <div className="p-3.5 rounded-xl bg-[#F5F8F4] border border-[#E2ECE4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    isOnline && !isSimulatingOffline
                                        ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                                        : "bg-amber-100 text-amber-700 border border-amber-300"
                                }`}
                            >
                                {isOnline && !isSimulatingOffline ? (
                                    <Wifi className="w-4 h-4" />
                                ) : (
                                    <WifiOff className="w-4 h-4 animate-pulse" />
                                )}
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                    <span>Network:</span>
                                    <span
                                        className={
                                            isOnline && !isSimulatingOffline
                                                ? "text-emerald-700 font-black"
                                                : "text-amber-700 font-black"
                                        }
                                    >
                                        {isSimulatingOffline
                                            ? "Simulated Mountain Blackout"
                                            : isOnline
                                            ? "Online (High-Speed)"
                                            : "No Connection (Offline)"}
                                    </span>
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                    <HardDrive className="w-3 h-3 text-slate-400" />
                                    <span>
                                        Storage: <strong>{storageStats.totalFormatted}</strong> used across{" "}
                                        {storageStats.count} cached forts
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Simulate Mountain Blackout Switch */}
                        <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-[#D5E2D8] shadow-2xs">
                            <span className="text-[11px] font-semibold text-slate-700">
                                Simulate Blackout:
                            </span>
                            <button
                                type="button"
                                onClick={() => setSimulateOffline(!isSimulatingOffline)}
                                aria-label="Toggle blackout simulation"
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition cursor-pointer active:scale-95 ${
                                    isSimulatingOffline
                                        ? "bg-amber-500 text-white shadow-xs"
                                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                }`}
                            >
                                {isSimulatingOffline ? "Active (ON)" : "OFF"}
                            </button>
                        </div>
                    </div>

                    {activeTab === "downloads" ? (
                        <>
                            {/* Current Selected Fort Download Banner */}
                            <div className="p-4 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-white shadow-xs">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">
                                                Active Trek Selection
                                            </span>
                                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                                {currentFort.elevation}m MSL
                                            </span>
                                        </div>
                                        <h4 className="text-base font-extrabold text-[#132A22] mt-0.5">
                                            {currentFort.name}
                                        </h4>
                                        <p className="text-[11px] text-slate-600 mt-0.5">
                                            Includes trails, cisterns, dead zone scarp polygons, and nearest 4G emergency points.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 self-stretch sm:self-center">
                                        {isCurrentDownloaded ? (
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                    Pack Cached
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => downloadFort(currentFort.slug)}
                                                    disabled={currentDownloadStatus?.isDownloading}
                                                    title="Re-download and update pack"
                                                    className="px-2 py-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-100 border border-[#E2ECE4] text-xs font-semibold transition cursor-pointer"
                                                >
                                                    <RefreshCw
                                                        className={`w-3.5 h-3.5 ${
                                                            currentDownloadStatus?.isDownloading ? "animate-spin" : ""
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => downloadFort(currentFort.slug)}
                                                disabled={currentDownloadStatus?.isDownloading}
                                                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                                            >
                                                {currentDownloadStatus?.isDownloading ? (
                                                    <>
                                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                        <span>Downloading {currentDownloadStatus.percent}%</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <DownloadCloud className="w-4 h-4" />
                                                        <span>Download Offline Pack (~280 KB)</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Progress bar if currently downloading */}
                                {currentDownloadStatus?.isDownloading && (
                                    <div className="mt-3">
                                        <div className="flex justify-between text-[11px] font-semibold text-emerald-800 mb-1">
                                            <span>{currentDownloadStatus.message}</span>
                                            <span>{currentDownloadStatus.percent}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                                                style={{ width: `${currentDownloadStatus.percent}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Batch Download / Purge Row */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => downloadAllForts(fortList)}
                                    disabled={isDownloadingBatch}
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                                >
                                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                                    <span>
                                        {isDownloadingBatch
                                            ? `Downloading All (${batchProgress.current}/${batchProgress.total})...`
                                            : "Download All 18 Forts Pack (Full Bundle ~4.2 MB)"}
                                    </span>
                                </button>

                                {storageStats.count > 0 && (
                                    <button
                                        type="button"
                                        onClick={clearAll}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl text-xs font-semibold border border-red-200 transition cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Purge Cache</span>
                                    </button>
                                )}
                            </div>

                            {/* Search & Forts Catalog */}
                            <div className="space-y-2 pt-1">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Sahyadri Forts Offline Catalog ({filteredForts.length})
                                    </h5>
                                    <div className="relative w-44">
                                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search fort..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-8 pr-2 py-1 text-xs bg-[#F8FAF8] border border-[#D5E2D8] rounded-lg focus:outline-none focus:border-emerald-600"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                                    {filteredForts.map((fort) => {
                                        const downloaded = isDownloaded(fort.slug);
                                        const progress = downloadProgress[fort.slug];
                                        const isSelected =
                                            selectedFortSlug?.toLowerCase() === fort.slug.toLowerCase();

                                        return (
                                            <div
                                                key={fort.slug}
                                                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition ${
                                                    isSelected
                                                        ? "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/20"
                                                        : "border-[#E2ECE4] bg-white hover:border-slate-300"
                                                }`}
                                            >
                                                <div
                                                    className="min-w-0 cursor-pointer flex-1"
                                                    onClick={() => onSelectFort && onSelectFort(fort.slug)}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-bold text-slate-800 truncate">
                                                            {fort.name}
                                                        </span>
                                                        {downloaded && (
                                                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 block truncate">
                                                        {fort.district} · {fort.elevation}m
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    {downloaded ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFortPack(fort.slug)}
                                                            title="Remove offline pack"
                                                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => downloadFort(fort.slug)}
                                                            disabled={progress?.isDownloading}
                                                            title="Download offline pack"
                                                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg transition cursor-pointer active:scale-95 disabled:opacity-50"
                                                        >
                                                            {progress?.isDownloading ? (
                                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <DownloadCloud className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* ── SOS & Rescue Kit Tab ── */
                        <div className="space-y-4">
                            {/* Emergency SOS Generator */}
                            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-red-600" />
                                        <h4 className="text-xs font-extrabold text-red-900 uppercase tracking-wider">
                                            Field SOS SMS Generator
                                        </h4>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCopySOS}
                                        className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition cursor-pointer active:scale-95 shadow-xs"
                                    >
                                        {copiedSOS ? (
                                            <>
                                                <Check className="w-3.5 h-3.5" />
                                                <span>Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" />
                                                <span>Copy Emergency SMS</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <pre className="p-3 bg-white rounded-lg border border-red-200 text-[11px] font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {generateEmergencySOS([73.6822, 18.2459], currentFort.name)}
                                </pre>
                                <p className="text-[10px] text-red-700 mt-2">
                                    💡 When in a fringe reception zone, SMS text messages will transmit even if 4G voice calls drop.
                                </p>
                            </div>

                            {/* 24x7 Helplines */}
                            <div className="space-y-2">
                                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Verified Sahyadri Mountain Rescue Helplines
                                </h5>
                                <div className="grid grid-cols-1 gap-2">
                                    {EMERGENCY_RESCUE_CONTACTS.map((contact, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-xl border border-[#E2ECE4] bg-white flex items-center justify-between gap-3 shadow-2xs"
                                        >
                                            <div>
                                                <div className="text-xs font-bold text-slate-800">
                                                    {contact.name}
                                                </div>
                                                <div className="text-[10px] text-slate-500">
                                                    {contact.type} ·{" "}
                                                    <span className="text-emerald-700 font-semibold">
                                                        {contact.active}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={`tel:${contact.number.replace(/\s+/g, "")}`}
                                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition cursor-pointer"
                                                >
                                                    <PhoneCall className="w-3 h-3 text-emerald-600" />
                                                    <span>{contact.number}</span>
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyPhone(contact.number)}
                                                    title="Copy phone number"
                                                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                                                >
                                                    {copiedPhone === contact.number ? (
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="p-3.5 bg-[#F8FAF8] border-t border-[#E2ECE4] flex items-center justify-between text-xs text-slate-500">
                    <span>
                        Data stored securely in local <strong>IndexedDB</strong> cache.
                    </span>
                    <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs transition cursor-pointer"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OfflineMapDownloadModal;
