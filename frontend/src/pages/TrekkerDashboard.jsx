import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useWeatherStore } from "../store/useWeatherStore";
import { useFortStore } from "../store/useFortStore";
import { useRiskStore } from "../store/useRiskStore";
import { useRoutingStore } from "../store/useRoutingStore";
import { useReportStore } from "../store/useReportStore";
import FortMap from "../components/map/FortMap";
import PhotoUploadModal from "../components/PhotoUploadModal";
import {
  Compass,
  CloudRain,
  AlertTriangle,
  Camera,
  MapPin,
  CheckCircle2,
  Shield,
  Thermometer,
  Wind,
  Droplets,
  RefreshCw,
  ChevronDown,
  Map as MapIcon,
  Activity,
  Navigation,
  Mountain,
  Leaf,
  Route,
  ShieldCheck,
  XCircle,
  Backpack,
  Info,
  Loader2,
  History,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";

export const TrekkerDashboard = () => {
  const { authUser } = useAuthStore();
  const {
    weatherData,
    isLoading,
    error,
    selectedFortSlug,
    availableForts,
    fetchWeather,
    setSelectedFort,
    startAutoRefresh,
    stopAutoRefresh,
    fetchForts,
    isLoadingForts,
  } = useWeatherStore();

  const { selectFort: setMapFort, forts, fortDetail, fetchFortDetail, fetchForts: fetchMapForts } = useFortStore();

  const {
    riskData: liveRiskData,
    isLoading: isLoadingRisk,
    fetchRisk,
    startPolling,
    stopPolling,
  } = useRiskStore();

  const {
    routeResult,
    isLoading: isLoadingRoute,
    error: routeError,
    findRoute,
    clearRoute,
  } = useRoutingStore();

  const {
    reports,
    fetchFortReports,
    isLoadingReports,
  } = useReportStore();

  const [startWaypoint, setStartWaypoint] = useState("");
  const [destWaypoint, setDestWaypoint] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const fortParam = searchParams.get("fort");

  // If URL has ?fort=slug, select it
  useEffect(() => {
    if (fortParam) {
      handleFortChange(fortParam);
    }
  }, [fortParam]);

  // Fetch forts list + weather on mount & start auto-refresh
  useEffect(() => {
    fetchForts();
    fetchMapForts();
    fetchWeather();
    startAutoRefresh();
    return () => {
      stopAutoRefresh();
      stopPolling();
    };
  }, []);

  // Fetch fort detail + live risk when selected fort changes
  useEffect(() => {
    if (selectedFortSlug) {
      fetchFortDetail(selectedFortSlug);
      fetchRisk(selectedFortSlug);
      fetchFortReports(selectedFortSlug);
      // Start polling risk every 2 minutes
      startPolling(selectedFortSlug, 2 * 60 * 1000);
      // Sync with useFortStore selectedFort
      const matching = forts.find((f) => f.slug === selectedFortSlug);
      if (matching) setMapFort(matching);
    }
    return () => stopPolling();
  }, [selectedFortSlug, forts]);

  const handleFortChange = (slug) => {
    setSelectedFort(slug);
    const mapFort = forts.find((f) => f.slug === slug);
    if (mapFort) setMapFort(mapFort);
  };

  // Dynamic trail data from selected fort
  const liveTrails = fortDetail?.trails || [];

  // Extract unique waypoints from trails (for route finder dropdowns)
  const waypoints = useMemo(() => {
    const names = new Set();
    liveTrails.forEach((trail) => {
      if (trail.startPoint?.name) names.add(trail.startPoint.name);
      if (trail.endPoint?.name) names.add(trail.endPoint.name);
    });
    return [...names].sort();
  }, [liveTrails]);

  // Reset waypoint selections when fort changes
  useEffect(() => {
    setStartWaypoint("");
    setDestWaypoint("");
    clearRoute();
  }, [selectedFortSlug]);

  const handleFindRoute = async () => {
    if (!selectedFortSlug || !startWaypoint || !destWaypoint) return;
    await findRoute(selectedFortSlug, startWaypoint, destWaypoint);
  };

  // Live risk from the risk engine API (preferred) or fallback to DB scores
  const liveTrailRisks = liveRiskData?.trails || [];
  const liveAggregate = liveRiskData?.aggregate;
  const hasLiveRisk = liveTrailRisks.length > 0;

  // Get risk score for a trail: prefer live-computed, fallback to DB
  const getTrailRiskScore = (trail) => {
    const liveTrail = liveTrailRisks.find((t) => t.trailId === trail._id);
    return liveTrail ? liveTrail.liveRiskScore : trail.currentRiskScore;
  };

  // Compute aggregate erosion risk from live API or trail data
  const aggregateRisk = hasLiveRisk
    ? (liveAggregate?.averageRisk ?? (liveTrails.length > 0 ? Math.round(liveTrails.reduce((sum, t) => sum + t.currentRiskScore, 0) / liveTrails.length) : 0))
    : liveTrails.length > 0
      ? Math.round(liveTrails.reduce((sum, t) => sum + t.currentRiskScore, 0) / liveTrails.length)
      : 0;
  const riskLevel = aggregateRisk >= 75 ? 4 : aggregateRisk >= 50 ? 3 : aggregateRisk >= 30 ? 2 : aggregateRisk >= 10 ? 1 : 0;
  const riskLabels = ["Level 0 - Safe", "Level 1 - Low", "Level 2 - Elevated", "Level 3 - High", "Level 4 - Critical"];
  const riskBadgeColors = [
    "bg-emerald-50 text-emerald-800 border-emerald-200",
    "bg-teal-50 text-teal-800 border-teal-200",
    "bg-amber-50 text-amber-800 border-amber-200",
    "bg-orange-50 text-orange-900 border-orange-200",
    "bg-rose-50 text-rose-900 border-rose-200",
  ];

  const weather = weatherData?.weather;
  const fortInfo = weatherData?.fort;

  // Determine severity-based styling for light theme
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "clear": return "text-emerald-700";
      case "cloudy": return "text-sky-700";
      case "light": return "text-teal-700";
      case "moderate": return "text-amber-700";
      case "heavy": return "text-orange-700";
      case "extreme": return "text-rose-700";
      default: return "text-teal-700";
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case "clear": return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "cloudy": return "bg-sky-50 border-sky-200 text-sky-800";
      case "light": return "bg-teal-50 border-teal-200 text-teal-800";
      case "moderate": return "bg-amber-50 border-amber-200 text-amber-800";
      case "heavy": return "bg-orange-50 border-orange-200 text-orange-900";
      case "extreme": return "bg-rose-50 border-rose-200 text-rose-900";
      default: return "bg-teal-50 border-teal-200 text-teal-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── LIGHT ENVIRONMENTAL WELCOME BANNER ── */}
      <div className="relative rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden animate-fade-in-up border border-[#E2ECE4] shadow-sm bg-white">
        {/* Prominent Sahyadri Fort Landscape Background with Natural Light Overlay */}
        <img
          src={fortDetail?.imageUrl || `/forts/${selectedFortSlug || "rajgad"}.jpg`}
          alt={fortInfo?.name || "Sahyadri Fort"}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-30 select-none"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/forts/rajgad.jpg";
          }}
        />
        {/* Soft mist light gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFFFFF]/95 via-[#FFFFFF]/85 to-[#FFFFFF]/45 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                Trekker Field Portal
              </span>
              {authUser?.role === "authority" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                  <Shield className="w-3 h-3 text-amber-600" /> Authority viewing Trekker mode
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mb-1.5">
              {(authUser?.avatarUrl || authUser?.profilePic) && (
                <img
                  src={authUser?.avatarUrl || authUser?.profilePic}
                  alt={authUser?.username}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-emerald-500/40 shadow-xs shrink-0"
                />
              )}
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#132A22]">
                Hey, <span className="text-emerald-700">{authUser?.username}!</span>
                <span className="text-2xl ml-2">🏔️</span>
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-[#52685E] mt-1 max-w-xl leading-relaxed font-medium">
              Live trail telemetry, monsoon erosion metrics, and crowdsourced hazard tracking across Sahyadri heritage fortresses.
            </p>

            {/* Quick stat pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-[#E2ECE4] text-[#132A22] text-[11px] font-semibold shadow-xs">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" /> 18 Forts Monitored
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-[#E2ECE4] text-[#132A22] text-[11px] font-semibold shadow-xs">
                <Activity className="w-3.5 h-3.5 text-teal-600" /> Live Environmental Feed
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-[#E2ECE4] text-[#132A22] text-[11px] font-semibold shadow-xs">
                <Route className="w-3.5 h-3.5 text-sky-600" /> AI Adaptive Routing
              </span>
              {selectedFortSlug && (
                <Link
                  to={`/forts/${selectedFortSlug}/history`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 hover:bg-purple-100 transition-all text-[11px] font-bold shadow-xs cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-purple-600" /> Fort History & Satellite Timeline
                </Link>
              )}
            </div>
          </div>

          {/* Live Weather Badge */}
          <div className="flex items-center gap-3.5 bg-white/95 backdrop-blur-md border border-[#E2ECE4] p-4 sm:p-5 rounded-2xl shadow-xs min-w-[220px] shrink-0">
            {isLoading && !weather ? (
              <div className="flex items-center gap-3 animate-pulse w-full">
                <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-24" />
                  <div className="h-4 bg-slate-100 rounded w-32" />
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
                <div>
                  <div className="text-xs text-slate-500">Weather</div>
                  <div className="text-sm font-bold text-amber-700">Unavailable</div>
                  <button onClick={() => fetchWeather()} className="text-[11px] text-emerald-700 hover:text-emerald-800 flex items-center gap-1 mt-0.5 transition cursor-pointer font-semibold">
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                </div>
              </div>
            ) : weather ? (
              <div className="flex items-center gap-3">
                <div className="text-3xl shrink-0 animate-float">{weather.weatherIcon}</div>
                <div>
                  <div className="text-[10px] text-[#52685E] uppercase tracking-wider font-bold">Current Forecast</div>
                  <div className={`text-sm font-bold mt-0.5 ${getSeverityColor(weather.weatherSeverity)}`}>
                    {weather.monsoonSeverity?.label || weather.weatherDescription}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-bold">{fortInfo?.name || "Sahyadri Corridor"}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <CloudRain className="w-8 h-8 text-emerald-600 shrink-0 animate-pulse" />
                <div>
                  <div className="text-xs text-slate-500">Current Forecast</div>
                  <div className="text-sm font-bold text-[#132A22]">Loading...</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── SAHYADRI FORTS PHOTOGRAPHY QUICK EXPLORER ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
              <Mountain className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-[#132A22]">Sahyadri Heritage Fortresses</h2>
            <span className="text-xs text-[#52685E] font-medium hidden sm:inline">— Select a fort to view telemetry & trails</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            18 Forts
          </span>
        </div>

        {/* Scrollable Fort Cards Row */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {availableForts.slice(0, 10).map((f) => {
            const isSelected = f.slug === selectedFortSlug;
            return (
              <button
                key={f.slug}
                onClick={() => handleFortChange(f.slug)}
                className={`flex-shrink-0 w-44 rounded-2xl overflow-hidden border text-left transition-all duration-200 group cursor-pointer hover-lift ${
                  isSelected
                    ? "border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm bg-emerald-50/40"
                    : "border-[#E2ECE4] bg-white hover:border-emerald-300"
                }`}
              >
                <div className="h-24 w-full relative overflow-hidden bg-slate-100">
                  <img
                    src={`/forts/${f.slug}.jpg`}
                    alt={f.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `/forts/${f.slug}.webp`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-1.5 left-2 text-white font-bold text-xs truncate max-w-[90%] drop-shadow-sm">
                    {f.name}
                  </span>
                </div>
                <div className="p-2.5 flex items-center justify-between text-[10px] text-[#52685E]">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    {f.district || "Pune"}
                  </span>
                  <span className="font-bold text-emerald-800">
                    {f.elevation ? `${f.elevation}m` : "Summit"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── LIVE WEATHER DETAIL CARD ── */}
      {weather && (
        <div className="bg-white border border-[#E2ECE4] rounded-2xl p-6 mb-8 animate-fade-in-up shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="text-4xl animate-float">{weather.weatherIcon}</div>
              <div>
                <h3 className="font-bold text-[#132A22] text-base flex items-center gap-2">
                  Live Weather
                  <span className="text-emerald-600">—</span>
                  <span className="text-emerald-800">{fortInfo?.name}</span>
                </h3>
                <p className="text-xs text-[#52685E] mt-0.5 font-medium">
                  {weather.weatherDescription} · <span className="text-emerald-700 font-semibold">Elevation: {fortInfo?.elevation}m ASL</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Fort Selector */}
              <div className="relative">
                <select
                  value={selectedFortSlug}
                  onChange={(e) => handleFortChange(e.target.value)}
                  className="appearance-none bg-[#F8FAF8] border border-[#D5E2D8] text-slate-800 text-xs font-semibold rounded-xl px-4 py-2 pr-8 focus:outline-none focus:border-emerald-600 transition cursor-pointer hover:border-emerald-400"
                >
                  {availableForts.map((f) => (
                    <option key={f.slug} value={f.slug}>{f.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-700 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Refresh */}
              <button
                onClick={() => fetchWeather()}
                disabled={isLoading}
                className="p-2 bg-[#F8FAF8] hover:bg-emerald-50 border border-[#D5E2D8] hover:border-emerald-300 rounded-xl text-slate-600 hover:text-emerald-700 transition cursor-pointer disabled:opacity-50"
                title="Refresh weather"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>

              {/* Fort History Button */}
              {selectedFortSlug && (
                <Link
                  to={`/forts/${selectedFortSlug}/history`}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-xs cursor-pointer"
                  title="Explore Fort History, Architecture & Satellite Comparison"
                >
                  <History className="w-3.5 h-3.5 text-emerald-700" />
                  <span>History & Satellite</span>
                </Link>
              )}
            </div>
          </div>

          {/* Weather Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Temperature */}
            <div className="bg-orange-50/70 border border-orange-200/80 rounded-xl p-4 hover-lift animate-fade-in-up delay-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-orange-100 text-orange-700 rounded-lg">
                  <Thermometer className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] text-[#52685E] font-medium">Temperature</span>
              </div>
              <div className="text-2xl font-black text-[#132A22]">{weather.temperature}°<span className="text-lg text-orange-600">C</span></div>
              <div className="text-[10px] text-orange-700 font-semibold mt-0.5">Feels like {weather.apparentTemperature}°C</div>
            </div>

            {/* Precipitation */}
            <div className={`border rounded-xl p-4 hover-lift animate-fade-in-up delay-200 ${getSeverityBg(weather.weatherSeverity)}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white/70 rounded-lg">
                  <CloudRain className={`w-3.5 h-3.5 ${getSeverityColor(weather.weatherSeverity)}`} />
                </div>
                <span className="text-[11px] font-medium opacity-90">Precipitation</span>
              </div>
              <div className="text-2xl font-black">{weather.precipitation}<span className="text-sm ml-1">mm</span></div>
              <div className="text-[10px] mt-0.5 font-bold">{weather.monsoonSeverity?.label}</div>
            </div>

            {/* Humidity */}
            <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4 hover-lift animate-fade-in-up delay-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-teal-100 text-teal-700 rounded-lg">
                  <Droplets className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] text-[#52685E] font-medium">Humidity</span>
              </div>
              <div className="text-2xl font-black text-[#132A22]">{weather.humidity}<span className="text-lg text-teal-700">%</span></div>
              <div className="text-[10px] text-teal-700 font-semibold mt-0.5">
                {weather.humidity >= 85 ? "High saturation" : weather.humidity >= 60 ? "Moderate" : "Low moisture"}
              </div>
            </div>

            {/* Wind */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 hover-lift animate-fade-in-up delay-400">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Wind className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] text-[#52685E] font-medium">Wind Speed</span>
              </div>
              <div className="text-2xl font-black text-[#132A22]">{weather.windSpeed}<span className="text-sm text-emerald-700 ml-1">km/h</span></div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Gusts {weather.windGusts} km/h</div>
            </div>
          </div>

          {/* Monsoon Severity Bar */}
          <div className="mt-4 p-4 bg-[#F8FAF8] rounded-xl border border-[#E2ECE4]">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-[#52685E] font-semibold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-700" />
                Monsoon Severity Index
              </span>
              <span className={`font-bold text-sm ${getSeverityColor(weather.weatherSeverity)}`}>
                Level {weather.monsoonSeverity?.level} / 5
              </span>
            </div>
            <div className="w-full bg-[#E2ECE4] h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${(weather.monsoonSeverity?.level / 5) * 100}%`,
                  background: "linear-gradient(90deg, #059669, #f59e0b, #ef4444)"
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#52685E] mt-1.5 font-medium">
              <span>☀️ Clear</span><span>🌧️ Heavy</span><span>⛈️ Extreme Surge</span>
            </div>
          </div>

          {/* Trek Recommendations */}
          {weather.recommendation && (
            <div className={`mt-4 p-4 sm:p-5 rounded-xl border ${weather.recommendation.isSafe ? "bg-emerald-50/60 border-emerald-200" : "bg-rose-50/60 border-rose-200"}`}>
              <div className="flex items-start gap-3 mb-4">
                <div className={`p-2.5 rounded-xl ${weather.recommendation.isSafe ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                  {weather.recommendation.isSafe ? <ShieldCheck className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className={`font-bold text-base ${weather.recommendation.isSafe ? "text-emerald-900" : "text-rose-900"}`}>
                    {weather.recommendation.status}
                  </h4>
                  <p className="text-xs text-[#52685E] mt-1 leading-relaxed font-medium">{weather.recommendation.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E2ECE4]">
                <div>
                  <h5 className="text-[11px] font-bold text-emerald-800 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                    <Backpack className="w-3.5 h-3.5 text-emerald-600" /> Recommended Gear
                  </h5>
                  <ul className="space-y-1.5">
                    {weather.recommendation.accessories.map((item, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-center gap-2 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-amber-800 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5 text-amber-600" /> Precautions
                  </h5>
                  <ul className="space-y-1.5">
                    {weather.recommendation.precautions.map((item, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-center gap-2 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Cache indicator */}
          <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-[#52685E]">
            <span className={`w-1.5 h-1.5 rounded-full ${weather.cached ? "bg-amber-500" : "bg-emerald-500"}`} />
            {weather.cached ? "Cached data" : "Fresh telemetry"} · Last updated: {new Date(weather.fetchedAt).toLocaleTimeString("en-IN")}
            {" · "}Auto-refresh every 5 min
          </div>
        </div>
      )}

      {/* ── FORT MAP ── */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-[#132A22] text-lg flex items-center gap-2">
            <div className="p-1.5 bg-sky-50 border border-sky-200 rounded-lg">
              <MapIcon className="w-4 h-4 text-sky-700" />
            </div>
            Sahyadri Fort Network
            <span className="text-slate-400">—</span>
            <span className="text-sky-800 font-bold">Interactive Topographic Map</span>
          </h2>
          <span className="text-[11px] bg-sky-50 text-sky-900 font-bold px-3 py-1.5 rounded-full border border-sky-200 shadow-xs">
            🗺️ 18 Forts · Konkan & Deccan
          </span>
        </div>
        <div className="rounded-2xl border border-[#E2ECE4] overflow-hidden shadow-sm transition-all duration-300 bg-white">
          <FortMap
            className="h-[550px]"
            onFortSelect={(fort) => handleFortChange(fort.slug)}
            safeRoute={routeResult}
            photoReports={reports}
          />
        </div>
      </div>

      {/* ── ROUTE FINDER ── */}
      <div className="rounded-2xl p-6 mb-8 animate-fade-in-up border border-[#E2ECE4] shadow-xs bg-white">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[#132A22] text-base flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
              <Route className="w-4 h-4" />
            </div>
            Adaptive Route Finder
          </h3>
          <span className="text-[11px] bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-full border border-emerald-200">
            ⚡ Dijkstra · Risk-Aware
          </span>
        </div>

        {waypoints.length === 0 ? (
          <p className="text-xs text-[#52685E] italic py-4 text-center">
            📍 Select a fort on the map to enable waypoint routing
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Start Waypoint */}
              <div>
                <label className="block text-[11px] text-emerald-800 font-bold mb-1.5 uppercase tracking-wider">🟢 Start Waypoint</label>
                <div className="relative">
                  <select
                    value={startWaypoint}
                    onChange={(e) => setStartWaypoint(e.target.value)}
                    className="w-full appearance-none bg-[#F8FAF8] border border-[#D5E2D8] text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:border-emerald-600 transition cursor-pointer hover:border-emerald-400"
                  >
                    <option value="">Select start...</option>
                    {waypoints.filter((w) => w !== destWaypoint).map((wp) => (
                      <option key={wp} value={wp}>{wp}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-700 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Destination Waypoint */}
              <div>
                <label className="block text-[11px] text-rose-800 font-bold mb-1.5 uppercase tracking-wider">🔴 Destination</label>
                <div className="relative">
                  <select
                    value={destWaypoint}
                    onChange={(e) => setDestWaypoint(e.target.value)}
                    className="w-full appearance-none bg-[#F8FAF8] border border-rose-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:border-rose-500 transition cursor-pointer hover:border-rose-400"
                  >
                    <option value="">Select destination...</option>
                    {waypoints.filter((w) => w !== startWaypoint).map((wp) => (
                      <option key={wp} value={wp}>{wp}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-rose-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Find Route Button */}
              <div className="flex items-end">
                <button
                  onClick={handleFindRoute}
                  disabled={!startWaypoint || !destWaypoint || isLoadingRoute}
                  className="w-full py-2.5 px-4 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                >
                  {isLoadingRoute ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Computing Safe Route...</>
                  ) : (
                    <><Navigation className="w-3.5 h-3.5" /> Find Safe Route</>
                  )}
                </button>
              </div>
            </div>

            {/* Route Error */}
            {routeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl mb-4">
                <p className="text-xs text-rose-800 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                  {routeError}
                </p>
              </div>
            )}

            {/* Route Result — Safe */}
            {routeResult && routeResult.safe && (
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ✅ Safe Route Verified
                  </h4>
                  <button onClick={clearRoute} className="text-[11px] text-slate-500 hover:text-slate-800 transition cursor-pointer font-semibold">Clear</button>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 mb-3 font-medium">
                  <span><strong className="text-[#132A22]">{routeResult.start}</strong> → <strong className="text-[#132A22]">{routeResult.destination}</strong></span>
                  <span className="text-emerald-700 font-bold">{routeResult.totalDistanceKm} km</span>
                  <span className="text-[#52685E]">{routeResult.segmentCount} segment{routeResult.segmentCount !== 1 ? "s" : ""}</span>
                </div>
                <div className="space-y-1.5">
                  {routeResult.segments.map((seg, i) => (
                    <div key={seg.trailId || i} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-emerald-200/80 text-[11px] shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">{i + 1}</span>
                        <span className="text-slate-800 font-semibold">{seg.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 font-medium">
                        <span>{seg.distanceKm} km</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] border ${seg.currentRiskScore >= 50 ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"}`}>
                          {seg.currentRiskScore}% risk
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Route Result — No Safe Route */}
            {routeResult && !routeResult.safe && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> No Safe Route Available
                  </h4>
                  <button onClick={clearRoute} className="text-[11px] text-slate-500 hover:text-slate-800 transition cursor-pointer font-semibold">Clear</button>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed font-medium">
                  {routeResult.message || "All connecting trails are currently closed, diverted, or at critical risk levels. Try a different route or wait for conditions to improve."}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── KEY STATS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* Trail Status Card */}
        <div className="rounded-2xl p-6 hover-lift animate-fade-in-up delay-100 border border-[#E2ECE4] bg-white shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#132A22] text-base flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                <MapPin className="w-4 h-4" />
              </div>
              Active Trail Status
            </h3>
            <span className="text-[11px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              {liveTrails.length} Trail{liveTrails.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-2.5 text-xs max-h-[280px] overflow-y-auto pr-1">
            {liveTrails.length === 0 ? (
              <p className="text-[#52685E] text-xs italic py-6 text-center">📍 Select a fort to view trail status</p>
            ) : (
              liveTrails.slice(0, 6).map((trail) => (
                <div key={trail._id} className="flex items-center justify-between p-3 bg-[#F8FAF8] rounded-xl border border-[#E2ECE4] hover:bg-white hover:border-emerald-300 transition">
                  <div className="min-w-0 mr-2">
                    <div className="font-bold text-slate-800 truncate text-[12px]">{trail.name}</div>
                    <div className="text-[#52685E] text-[10px] mt-0.5 font-medium">{trail.distanceKm} km · <span>{trail.difficulty}</span></div>
                  </div>
                  {(() => {
                    const riskScore = getTrailRiskScore(trail);
                    const effectiveStatus = trail.status === "closed" || trail.status === "diverted"
                      ? trail.status
                      : riskScore >= 75 ? "closed" : riskScore >= 50 ? "caution" : trail.status;
                    if (effectiveStatus === "closed" || effectiveStatus === "diverted") {
                      return (
                        <span className="bg-rose-50 text-rose-800 font-bold flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg text-[10px] border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" /> {effectiveStatus === "diverted" ? "Diverted" : "Closed"}
                        </span>
                      );
                    } else if (effectiveStatus === "caution" || riskScore >= 30) {
                      return (
                        <span className="bg-amber-50 text-amber-800 font-bold flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg text-[10px] border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> Caution
                        </span>
                      );
                    } else {
                      return (
                        <span className="bg-emerald-50 text-emerald-800 font-bold flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg text-[10px] border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Open
                        </span>
                      );
                    }
                  })()}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Erosion Risk Index */}
        <div className="rounded-2xl p-6 hover-lift animate-fade-in-up delay-200 border border-[#E2ECE4] bg-white shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#132A22] text-base flex items-center gap-2">
              <div className="p-1.5 bg-sky-50 text-sky-700 rounded-lg border border-sky-200">
                <CloudRain className="w-4 h-4" />
              </div>
              Erosion Risk Index
            </h3>
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${riskBadgeColors[riskLevel]}`}>
                {riskLabels[riskLevel]}
              </span>
              {hasLiveRisk && (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-teal-600" /> Live
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-[#52685E] mb-5 leading-relaxed font-medium">
            Aggregated from {liveTrails.length} trail segment{liveTrails.length !== 1 ? "s" : ""} — rainfall saturation, slope angle, and basalt mortar degradation.
          </p>

          {/* Risk gauge */}
          <div className="relative mb-3">
            <div className="w-full bg-[#E8F0EA] h-4 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${aggregateRisk}%`,
                  background: aggregateRisk >= 75
                    ? "linear-gradient(90deg, #f97316, #ef4444)"
                    : aggregateRisk >= 50
                      ? "linear-gradient(90deg, #f59e0b, #f97316)"
                      : "linear-gradient(90deg, #059669, #0d9488)"
                }}
              />
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-all duration-700"
              style={{
                left: `calc(${aggregateRisk}% - 8px)`,
                background: aggregateRisk >= 75 ? "#ef4444" : aggregateRisk >= 50 ? "#f97316" : "#059669"
              }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-[#52685E] mt-2 font-bold">
            <span className="text-emerald-700">Safe (0%)</span>
            <span className={`font-bold text-xs ${aggregateRisk >= 75 ? "text-rose-700" : aggregateRisk >= 50 ? "text-amber-700" : "text-emerald-700"}`}>
              {aggregateRisk}% Avg Risk
            </span>
            <span className="text-rose-700">Critical (100%)</span>
          </div>
        </div>

        {/* Crowdsourced Audit Card */}
        <div className="rounded-2xl p-6 flex flex-col justify-between hover-lift animate-fade-in-up delay-300 border border-[#E2ECE4] bg-white shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#132A22] text-base flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                  <Camera className="w-4 h-4" />
                </div>
                Crowdsourced Audit
              </h3>
              {reports.length > 0 && (
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                  {reports.length} Logged
                </span>
              )}
            </div>
            <p className="text-xs text-[#52685E] mb-4 leading-relaxed font-medium">
              Upload geotagged photos of mortar fissures, trail step rutting, rockfall, or masonry degradation as you trek.
            </p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full py-3 px-4 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-emerald-600 hover:bg-emerald-700 shadow-sm"
          >
            <Camera className="w-4 h-4" />
            Submit Trail Photo Evidence
          </button>
        </div>
      </div>

      {/* ── LIVE EVIDENCE FEED ── */}
      {reports.length > 0 && (
        <div className="rounded-3xl p-6 sm:p-8 mb-8 animate-fade-in-up border border-[#E2ECE4] bg-white shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#132A22] text-base">
                  Live Community Trail Evidence
                  {fortInfo?.name && <span className="text-emerald-700"> — {fortInfo.name}</span>}
                </h3>
                <p className="text-xs text-[#52685E] mt-0.5 font-medium">
                  Real-time geotagged hazard photos verified by on-trail Sahyadri trekkers
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 hover:bg-emerald-100"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-700" /> Add Evidence
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reports.slice(0, 6).map((report) => {
              const severityStyles = {
                critical: { badge: "bg-rose-50 text-rose-800 border-rose-300", card: "border-rose-200" },
                high: { badge: "bg-orange-50 text-orange-900 border-orange-300", card: "border-orange-200" },
                moderate: { badge: "bg-amber-50 text-amber-900 border-amber-300", card: "border-amber-200" },
                low: { badge: "bg-emerald-50 text-emerald-900 border-emerald-300", card: "border-emerald-200" },
              };
              const style = severityStyles[report.severity] || severityStyles.low;

              return (
                <div
                  key={report._id}
                  className={`bg-white border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover-lift shadow-xs ${style.card}`}
                >
                  {report.imageUrl && (
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={report.imageUrl}
                        alt={report.hazardType}
                        className="w-full h-full object-cover hover:scale-105 transition duration-400"
                      />
                      <span className={`absolute top-2.5 right-2.5 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border shadow-xs ${style.badge}`}>
                        {report.severity}
                      </span>
                      <span className="absolute bottom-2.5 left-2.5 text-[10px] font-bold bg-white/90 text-slate-800 px-2.5 py-1 rounded-lg border border-[#E2ECE4] capitalize shadow-xs backdrop-blur-xs">
                        {report.hazardType}
                      </span>
                    </div>
                  )}
                  <div className="p-4">
                    {report.description && (
                      <p className="text-xs text-slate-700 line-clamp-2 mb-2 leading-relaxed font-medium">{report.description}</p>
                    )}
                    {report.aiTriage?.hazardAssessment && (
                      <div className="bg-sky-50 border border-sky-200 rounded-xl p-2.5 mb-2.5 text-[11px] text-sky-900 font-medium">
                        <span className="font-bold text-sky-800">🤖 AI Triage:</span>{" "}
                        {report.aiTriage.hazardAssessment}
                      </div>
                    )}
                  </div>

                  <div className="px-4 pb-4 pt-2 border-t border-[#E2ECE4] flex items-center justify-between text-[10px] text-[#52685E] font-medium">
                    <span>By <span className="font-bold text-[#132A22]">{report.user?.username || "Sahyadri Trekker"}</span></span>
                    <span>{report.createdAt ? new Date(report.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Recent"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Geotagged Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        fortSlug={selectedFortSlug}
        defaultFortSlug={selectedFortSlug}
        fortName={fortInfo?.name || "Fort"}
        trails={liveTrails}
      />
    </div>
  );
};

export default TrekkerDashboard;
