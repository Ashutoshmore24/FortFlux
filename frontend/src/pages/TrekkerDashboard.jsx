import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useWeatherStore } from "../store/useWeatherStore";
import { useFortStore } from "../store/useFortStore";
import FortMap from "../components/map/FortMap";
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
  Map,
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

  const { selectFort: setMapFort, forts } = useFortStore();

  // Fetch forts list + weather on mount & start auto-refresh
  useEffect(() => {
    fetchForts();
    fetchWeather();
    startAutoRefresh();
    return () => stopAutoRefresh();
  }, []);

  const handleFortChange = (slug) => {
    setSelectedFort(slug);
    const mapFort = forts.find(f => f.slug === slug);
    if (mapFort) setMapFort(mapFort);
  };

  const weather = weatherData?.weather;
  const fortInfo = weatherData?.fort;

  // Determine severity-based styling
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "clear":
        return "text-emerald-400";
      case "cloudy":
        return "text-slate-300";
      case "light":
        return "text-cyan-400";
      case "moderate":
        return "text-amber-400";
      case "heavy":
        return "text-orange-400";
      case "extreme":
        return "text-rose-400";
      default:
        return "text-cyan-400";
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case "clear":
        return "bg-emerald-500/10 border-emerald-500/30";
      case "cloudy":
        return "bg-slate-500/10 border-slate-500/30";
      case "light":
        return "bg-cyan-500/10 border-cyan-500/30";
      case "moderate":
        return "bg-amber-500/10 border-amber-500/30";
      case "heavy":
        return "bg-orange-500/10 border-orange-500/30";
      case "extreme":
        return "bg-rose-500/10 border-rose-500/30";
      default:
        return "bg-cyan-500/10 border-cyan-500/30";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <Compass className="w-3.5 h-3.5" />
                Trekker Field Portal
              </span>
              {authUser?.role === "authority" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
                  <Shield className="w-3 h-3" /> Authority viewing Trekker mode
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome, {authUser?.username}!
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Live trail conditions, monsoon erosion metrics, and crowdsourced hazard tracking across Sahyadri heritage sites.
            </p>
          </div>

          {/* Live Weather Badge — replaces hardcoded "Moderate Monsoon Surge" */}
          <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 p-4 rounded-2xl min-w-[220px]">
            {isLoading && !weather ? (
              // Loading skeleton
              <div className="flex items-center gap-3 animate-pulse w-full">
                <div className="w-8 h-8 bg-slate-800 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-800 rounded w-24" />
                  <div className="h-4 bg-slate-800 rounded w-32" />
                  <div className="h-2.5 bg-slate-800 rounded w-20" />
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs text-slate-400">Weather</div>
                  <div className="text-sm font-bold text-amber-400">Unavailable</div>
                  <button
                    onClick={() => fetchWeather()}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-0.5 transition"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                </div>
              </div>
            ) : weather ? (
              <div className="flex items-center gap-3">
                <div className="text-2xl shrink-0">{weather.weatherIcon}</div>
                <div>
                  <div className="text-xs text-slate-400">Current Forecast</div>
                  <div className={`text-sm font-bold ${getSeverityColor(weather.weatherSeverity)}`}>
                    {weather.monsoonSeverity?.label || weather.weatherDescription}
                  </div>
                  <div className="text-[11px] text-cyan-400">
                    {fortInfo?.name || "Sahyadri Corridor"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <CloudRain className="w-8 h-8 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-xs text-slate-400">Current Forecast</div>
                  <div className="text-sm font-bold text-white">Loading...</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Weather Detail Card + Fort Selector */}
      {weather && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="text-3xl">{weather.weatherIcon}</div>
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  Live Weather — {fortInfo?.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {weather.weatherDescription} · Elevation: {fortInfo?.elevation}m ASL
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Fort Selector */}
              <div className="relative">
                <select
                  value={selectedFortSlug}
                  onChange={(e) => handleFortChange(e.target.value)}
                  className="appearance-none bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl px-4 py-2 pr-8 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
                >
                  {availableForts.map((f) => (
                    <option key={f.slug} value={f.slug}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => fetchWeather()}
                disabled={isLoading}
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-400 hover:text-cyan-400 transition disabled:opacity-50"
                title="Refresh weather"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Weather Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Temperature */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-orange-400" />
                <span className="text-[11px] text-slate-400 font-medium">Temperature</span>
              </div>
              <div className="text-xl font-bold text-white">
                {weather.temperature}°C
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Feels like {weather.apparentTemperature}°C
              </div>
            </div>

            {/* Precipitation */}
            <div className={`border rounded-xl p-4 ${getSeverityBg(weather.weatherSeverity)}`}>
              <div className="flex items-center gap-2 mb-2">
                <CloudRain className={`w-4 h-4 ${getSeverityColor(weather.weatherSeverity)}`} />
                <span className="text-[11px] text-slate-400 font-medium">Precipitation</span>
              </div>
              <div className="text-xl font-bold text-white">
                {weather.precipitation} mm
              </div>
              <div className={`text-[10px] mt-0.5 font-semibold ${getSeverityColor(weather.weatherSeverity)}`}>
                {weather.monsoonSeverity?.label}
              </div>
            </div>

            {/* Humidity */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span className="text-[11px] text-slate-400 font-medium">Humidity</span>
              </div>
              <div className="text-xl font-bold text-white">
                {weather.humidity}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {weather.humidity >= 85 ? "High saturation" : weather.humidity >= 60 ? "Moderate" : "Low moisture"}
              </div>
            </div>

            {/* Wind */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] text-slate-400 font-medium">Wind Speed</span>
              </div>
              <div className="text-xl font-bold text-white">
                {weather.windSpeed} km/h
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Gusts up to {weather.windGusts} km/h
              </div>
            </div>
          </div>

          {/* Monsoon severity indicator bar */}
          <div className="mt-4 p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-slate-400 font-medium">Monsoon Severity Index</span>
              <span className={`font-bold ${getSeverityColor(weather.weatherSeverity)}`}>
                Level {weather.monsoonSeverity?.level} / 5
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
                style={{ width: `${(weather.monsoonSeverity?.level / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Cache/freshness indicator */}
          <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-slate-500">
            <span className={`w-1.5 h-1.5 rounded-full ${weather.cached ? "bg-amber-400" : "bg-emerald-400"}`} />
            {weather.cached ? "Cached data" : "Fresh data"} · Last updated: {new Date(weather.fetchedAt).toLocaleTimeString("en-IN")}
            {" · "}Auto-refresh every 5 min
          </div>
        </div>
      )}

      {/* ═══ Interactive Fort Map ═══ */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white text-lg flex items-center gap-2">
            <Map className="w-5 h-5 text-cyan-400" />
            Sahyadri Fort Network — Live Map
          </h2>
          <span className="text-[11px] bg-cyan-500/10 text-cyan-300 font-semibold px-3 py-1 rounded-full border border-cyan-500/30">
            18 Forts · Konkan & Deccan
          </span>
        </div>
        <FortMap className="h-[550px]" onFortSelect={(fort) => setSelectedFort(fort.slug)} />
      </div>

      {/* Grid of Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Trail Status Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-200 text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Active Trail Status
            </h3>
            <span className="text-[11px] bg-emerald-500/15 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
              Live
            </span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80">
              <div>
                <div className="font-semibold text-slate-200">Gunjawane to Chor Darwaja</div>
                <div className="text-slate-400 text-[10px]">Rajgad Main Ascent</div>
              </div>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Open
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80">
              <div>
                <div className="font-semibold text-slate-200">Suvela Machi Ridge Path</div>
                <div className="text-slate-400 text-[10px]">High wind & slick rock</div>
              </div>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Caution
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80">
              <div>
                <div className="font-semibold text-slate-200">Pali Gate Stairway</div>
                <div className="text-slate-400 text-[10px]">Cistern Runoff Alert</div>
              </div>
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Diversion Active
              </span>
            </div>
          </div>
        </div>

        {/* Erosion Risk Index */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-200 text-base flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-cyan-400" />
              Erosion Risk Index
            </h3>
            <span className="text-[11px] bg-amber-500/15 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
              Level 2 - Elevated
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Calculated from real-time precipitation, slope gradient, and saturation of volcanic rock mortar joints.
          </p>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-2">
            <div className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-full w-[58%]" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Low (0%)</span>
            <span className="font-semibold text-amber-400">58% Saturation</span>
            <span>Critical (100%)</span>
          </div>
        </div>

        {/* Crowdsourced Visual Audit */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-200 text-base flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                Crowdsourced Audit
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Upload geotagged photos of mortar fissures, trail step rutting, or masonry degradation as you trek.
            </p>
          </div>
          <button className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition">
            <Camera className="w-4 h-4" />
            Submit Trail Photo Evidence
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrekkerDashboard;
