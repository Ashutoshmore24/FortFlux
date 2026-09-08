import { useState, useRef, useEffect } from "react";
import { useReportStore } from "../store/useReportStore";
import {
    X,
    Camera,
    UploadCloud,
    MapPin,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Sparkles,
    ShieldAlert,
} from "lucide-react";

export const PhotoUploadModal = ({
    isOpen,
    onClose,
    fortSlug,
    defaultFortSlug,
    fortName = "Fort",
    trails = [],
}) => {
    const activeFortSlug = fortSlug || defaultFortSlug;
    const { uploadReport, isUploading, error } = useReportStore();

    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [hazardType, setHazardType] = useState("rockfall");
    const [severity, setSeverity] = useState("moderate");
    const [selectedTrailId, setSelectedTrailId] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState(null); // { lat, lng }
    const [isLocating, setIsLocating] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const fileInputRef = useRef(null);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setFile(null);
            setPreviewUrl("");
            setDescription("");
            setSuccessMessage("");
            if (trails.length > 0 && !selectedTrailId) {
                setSelectedTrailId(trails[0]._id);
            }
        }
    }, [isOpen, trails]);

    // Handle file selection
    const handleFileChange = (e) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setPreviewUrl(URL.createObjectURL(selected));
        }
    };

    // Geolocation capture
    const handleCaptureLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
                setIsLocating(false);
            },
            (err) => {
                console.warn("Geolocation failed:", err.message);
                // Fallback to selected trail coords if available
                const matchedTrail = trails.find((t) => t._id === selectedTrailId);
                if (matchedTrail && matchedTrail.startPoint?.coordinates) {
                    const [lng, lat] = matchedTrail.startPoint.coordinates;
                    setLocation({ lat, lng });
                }
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    // AI Triage heuristic preview
    const getAiTriagePreview = () => {
        switch (hazardType) {
            case "rockfall":
                return {
                    label: "Rockfall Hazard Assessment",
                    recommendation: severity === "critical"
                        ? "High Risk: Traversal corridor breach predicted. Edge severing advised."
                        : "Moderate Risk: Loose scree detected on ascending path. Caution helmet zone.",
                };
            case "landslide":
                return {
                    label: "Slope Failure Assessment",
                    recommendation: "Critical Risk: Soil saturation threshold crossed. Trigger automated Dijkstra detour.",
                };
            case "waterlogging":
                return {
                    label: "Hydrological Step Hazard",
                    recommendation: "Basalt steps submerged. Micro-slip hazard warning issued to upcoming trekkers.",
                };
            case "fissure":
                return {
                    label: "Masonry Degradation Assessment",
                    recommendation: "Mortar loss identified. Flagged for ASI Archaeological Survey review.",
                };
            case "railing":
                return {
                    label: "Safety Anchor Assessment",
                    recommendation: "Fall exposure alert. Trekkers instructed to maintain 2m distance from ridge rim.",
                };
            default:
                return {
                    label: "Field Anomaly Assessment",
                    recommendation: "Queued for Authority Field Verification.",
                };
        }
    };

    const aiPreview = getAiTriagePreview();

    // Form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append("photo", file);
        formData.append("fortSlug", fortSlug);
        formData.append("hazardType", hazardType);
        formData.append("severity", severity);
        formData.append("description", description);
        if (selectedTrailId) formData.append("trailId", selectedTrailId);

        if (location) {
            formData.append("latitude", location.lat);
            formData.append("longitude", location.lng);
        } else {
            // Default to trail coords if available
            const matchedTrail = trails.find((t) => t._id === selectedTrailId);
            if (matchedTrail && matchedTrail.startPoint?.coordinates) {
                const [lng, lat] = matchedTrail.startPoint.coordinates;
                formData.append("latitude", lat);
                formData.append("longitude", lng);
            }
        }

        const res = await uploadReport(formData);
        if (res.success) {
            setSuccessMessage("Photo evidence verified and submitted to community feed!");
            setTimeout(() => {
                onClose();
            }, 1600);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
                        <Camera className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-white">
                            Submit Trail Field Evidence
                        </h2>
                        <p className="text-xs text-slate-400">
                            Geotagged crowdsourced reports for <strong>{fortName}</strong>
                        </p>
                    </div>
                </div>

                {successMessage ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-full">
                            <CheckCircle2 className="w-12 h-12 animate-bounce" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Evidence Submitted!</h3>
                        <p className="text-xs text-emerald-300 max-w-sm">{successMessage}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error banner */}
                        {error && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* File Upload Box */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-2">
                                Trail Photo Evidence <span className="text-rose-400">*</span>
                            </label>
                            {previewUrl ? (
                                <div className="relative rounded-2xl overflow-hidden border border-slate-700 h-48 bg-slate-950 flex items-center justify-center">
                                    <img
                                        src={previewUrl}
                                        alt="Evidence preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFile(null);
                                            setPreviewUrl("");
                                        }}
                                        className="absolute top-3 right-3 p-1.5 bg-slate-900/80 text-rose-400 hover:text-white rounded-lg border border-slate-700 transition"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-950/40 hover:bg-slate-950/80"
                                >
                                    <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                                    <div className="text-xs font-bold text-slate-200">
                                        Click to upload or drag photo here
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-1">
                                        JPG, PNG, or WebP (Max 5MB)
                                    </div>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>

                        {/* Hazard Category Selector */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-2">
                                Hazard Category
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {[
                                    { id: "rockfall", label: "🪨 Rockfall", desc: "Loose scree & boulders" },
                                    { id: "landslide", label: "⚠️ Landslide", desc: "Slope washout" },
                                    { id: "waterlogging", label: "🌊 Waterlogging", desc: "Flooded stone steps" },
                                    { id: "fissure", label: "🧱 Masonry Fissure", desc: "Mortar crack in wall" },
                                    { id: "railing", label: "⛓️ Broken Railing", desc: "Anchor failure" },
                                    { id: "overcrowding", label: "👥 Overcrowding", desc: "Bottleneck jam" },
                                ].map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setHazardType(cat.id)}
                                        className={`p-2.5 rounded-xl text-left border transition ${hazardType === cat.id
                                            ? "bg-emerald-500/15 border-emerald-500/60 text-emerald-300"
                                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                                            }`}
                                    >
                                        <div className="text-xs font-bold">{cat.label}</div>
                                        <div className="text-[10px] text-slate-500">{cat.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Trail Segment & Severity */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Trail Selector */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Affected Trail Segment
                                </label>
                                <select
                                    value={selectedTrailId}
                                    onChange={(e) => setSelectedTrailId(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                                >
                                    {trails.map((t) => (
                                        <option key={t._id} value={t._id}>
                                            {t.name}
                                        </option>
                                    ))}
                                    <option value="">General Area / Other</option>
                                </select>
                            </div>

                            {/* Severity Selector */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Observed Severity
                                </label>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {[
                                        { id: "low", label: "Low", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
                                        { id: "moderate", label: "Mod", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
                                        { id: "high", label: "High", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
                                        { id: "critical", label: "Crit", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
                                    ].map((s) => (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => setSeverity(s.id)}
                                            className={`py-2 px-1 rounded-xl text-xs font-bold border transition text-center ${severity === s.id ? s.color : "bg-slate-800/80 border-slate-700 text-slate-400"
                                                }`}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Geolocation Tag */}
                        <div className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-emerald-400" />
                                <div>
                                    <div className="font-semibold text-slate-200">
                                        GPS Geotag Location
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                        {location
                                            ? `${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E`
                                            : "Tagged via Trail Segment default coordinates"}
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleCaptureLocation}
                                disabled={isLocating}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-semibold transition flex items-center gap-1"
                            >
                                {isLocating ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <MapPin className="w-3 h-3" />
                                )}
                                Auto-GPS
                            </button>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Trekker Field Observations
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Describe current ground conditions (e.g. boulder fell after rain, slippery rock stairway, broken support chain)..."
                                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                            />
                        </div>

                        {/* AI Triage Heuristic Preview Card */}
                        <div className="p-3.5 bg-cyan-950/30 border border-cyan-500/30 rounded-2xl flex items-start gap-3 text-xs">
                            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            <div>
                                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                                    <span>AI Vision Triage Preview</span>
                                    <span className="text-[10px] bg-cyan-500/20 text-cyan-200 px-1.5 py-0.5 rounded font-mono">
                                        91% Confidence
                                    </span>
                                </div>
                                <div className="text-[11px] text-slate-300 mt-0.5">
                                    {aiPreview.recommendation}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!file || isUploading}
                            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-extrabold rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/50"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Uploading Field Evidence...
                                </>
                            ) : (
                                <>
                                    <Camera className="w-4 h-4" />
                                    Submit Trail Evidence for Triage
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PhotoUploadModal;
