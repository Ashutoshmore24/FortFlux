// ── Offline Field Survival Banner ──
// High-visibility amber/emerald tactical bar displayed when internet cuts off
// or mountain blackout mode is simulated.

import { useState } from "react";
import { useOfflineStore } from "../../store/useOfflineStore";
import { generateEmergencySOS } from "../../utils/offlineMapManager";
import {
    WifiOff,
    DownloadCloud,
    ShieldAlert,
    Copy,
    Check,
    Navigation,
    Radio,
    Sparkles,
    AlertTriangle,
    Eye,
    EyeOff,
} from "lucide-react";

export const OfflineFieldBanner = ({
    selectedFortSlug,
    fortName,
    currentCoords = null,
    nearestHotspot = null,
    className = "",
}) => {
    const {
        isOnline,
        isSimulatingOffline,
        setSimulateOffline,
        downloadedPacks,
        openModal,
        isDownloaded,
    } = useOfflineStore();

    const [copied, setCopied] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const isEffectivelyOffline = !isOnline || isSimulatingOffline;
    if (!isEffectivelyOffline) return null;

    const hasDownloaded = isDownloaded(selectedFortSlug);
    const effectiveFortName = fortName || selectedFortSlug || "Sahyadri Fort";

    const handleCopySOS = () => {
        const text = generateEmergencySOS(currentCoords || [73.6822, 18.2459], effectiveFortName);
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    return (
        <div
            className={`w-full z-[15] transition-all duration-300 animate-in slide-in-from-top-2 ${className}`}
        >
            <div className="bg-gradient-to-r from-amber-950/95 via-stone-900/95 to-amber-950/95 backdrop-blur-md border-b-2 border-amber-500/60 shadow-xl text-white px-3 sm:px-5 py-2.5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5">
                    {/* Left: Status badge and info */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                            <WifiOff className="w-4 h-4 animate-pulse" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                                    Mountain Network Blackout
                                </span>
                                {isSimulatingOffline && (
                                    <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-400/30 px-1.5 py-0.5 rounded font-bold">
                                        Simulated Test Mode
                                    </span>
                                )}
                                <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                        hasDownloaded
                                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                                            : "bg-red-500/20 text-red-300 border-red-400/40"
                                    }`}
                                >
                                    {hasDownloaded
                                        ? "✓ Offline Pack Loaded (Cached)"
                                        : "⚠️ Live Only (No Offline Pack)"}
                                </span>
                            </div>
                            <p className="text-[11px] text-amber-100/90 truncate mt-0.5">
                                Operating in zero-cellular field survival mode for{" "}
                                <strong className="text-white capitalize">{effectiveFortName}</strong>.
                                Map renders cached trails, cisterns, and dead zones without internet.
                            </p>
                        </div>
                    </div>

                    {/* Middle: Nearest Hotspot Pointer (if available) */}
                    {nearestHotspot && (
                        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs">
                            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                            <span className="text-[11px]">
                                Nearest 4G Hotspot:{" "}
                                <strong className="text-white">{nearestHotspot.name}</strong> (
                                {nearestHotspot.distanceMeters}m {nearestHotspot.bearing})
                            </span>
                        </div>
                    )}

                    {/* Right: Quick Action Buttons */}
                    <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                        {/* Copy SOS Coordinates */}
                        <button
                            type="button"
                            onClick={handleCopySOS}
                            title="Copy emergency SMS with GPS coordinates to clipboard"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer bg-red-600/90 hover:bg-red-600 text-white border border-red-400/50 shadow-xs active:scale-95"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-white" />
                                    <span>SOS Copied!</span>
                                </>
                            ) : (
                                <>
                                    <ShieldAlert className="w-3.5 h-3.5 text-red-200" />
                                    <span>Copy SOS SMS</span>
                                </>
                            )}
                        </button>

                        {/* Offline Packs Manager */}
                        <button
                            type="button"
                            onClick={openModal}
                            title="Manage downloaded offline map packs"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer bg-stone-800 hover:bg-stone-700 text-amber-200 border border-amber-500/30 active:scale-95"
                        >
                            <DownloadCloud className="w-3.5 h-3.5 text-amber-400" />
                            <span>Offline Packs</span>
                        </button>

                        {/* End Simulation Toggle (if simulated) */}
                        {isSimulatingOffline && (
                            <button
                                type="button"
                                onClick={() => setSimulateOffline(false)}
                                title="Exit simulated offline mode"
                                className="px-2 py-1.5 rounded-lg text-xs font-semibold text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-700/80 border border-stone-600/50 transition cursor-pointer active:scale-95"
                            >
                                Exit Sim
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfflineFieldBanner;
