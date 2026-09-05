import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useWeatherStore } from "../store/useWeatherStore";
import { useFortStore } from "../store/useFortStore";
import { useRiskStore } from "../store/useRiskStore";
import { useRoutingStore } from "../store/useRoutingStore";
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
  Map as MapIcon,
  Activity,
  Navigation,
  Loader2,
  Route,
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

  const [startWaypoint, setStartWaypoint] = useState("");
  const [destWaypoint, setDestWaypoint] = useState("");

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
      // Start polling risk every 2 minutes
      startPolling(selectedFortSlug, 2 * 60 * 1000);
      // Sync with useFortStore selectedFort
      const matching = forts.find(f => f.slug === selectedFortSlug);
      if (matching) setMapFort(matching);
    }
    return () => stopPolling();
  }, [selectedFortSlug, forts]);

  const handleFortChange = (slug) => {
    setSelectedFort(slug);
    const mapFort = forts.find(f => f.slug === slug);
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
    ? liveAggregate.averageRisk
    : liveTrails.length > 0
      ? Math.round(liveTrails.reduce((sum, t) => sum + t.currentRiskScore, 0) / liveTrails.length)
      : 0;
  const riskLevel = aggregateRisk >= 75 ? 4 : aggregateRisk >= 50 ? 3 : aggregateRisk >= 30 ? 2 : aggregateRisk >= 10 ? 1 : 0;
  const riskLabels = ["Level 0 - Safe", "Level 1 - Low", "Level 2 - Elevated", "Level 3 - High", "Level 4 - Critical"];
  const riskBadgeColors = [
    "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    "bg-amber-500/15 text-amber-300 border-amber-500/30",
    "bg-orange-500/15 text-orange-300 border-orange-500/30",
    "bg-rose-500/15 text-rose-300 border-rose-500/30",
  ];

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
            <MapIcon className="w-5 h-5 text-cyan-400" />
            Sahyadri Fort Network — Live Map
          </h2>
          <span className="text-[11px] bg-cyan-500/10 text-cyan-300 font-semibold px-3 py-1 rounded-full border border-cyan-500/30">
            18 Forts · Konkan & Deccan
          </span>
        </div>
        <FortMap
  className="h-[550px]"
  onFortSelect={(fort) => handleFortChange(fort.slug)}
  safeRoute={routeResult}
/>
      </div>

      {/* ═══ Route Finder — Phase 5 Adaptive Routing ═══ */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Route className="w-5 h-5 text-emerald-400" />
            Adaptive Route Finder
          </h3>
          <span className="text-[11px] bg-emerald-500/10 text-emerald-300 font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
            Dijkstra · Risk-Aware
          </span>
        </div>

        {waypoints.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Select a fort to use route finder</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Start Waypoint */}
              <div>
                <label className="block text-[11px] text-slate-400 font-medium mb-1.5">Start Waypoint</label>
                <div className="relative">
                  <select
                    value={startWaypoint}
                    onChange={(e) => setStartWaypoint(e.target.value)}
                    className="w-full appearance-none bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                  >
                    <option value="">Select start...</option>
                    {waypoints.filter((w) => w !== destWaypoint).map((wp) => (
                      <option key={wp} value={wp}>{wp}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Destination Waypoint */}
              <div>
                <label className="block text-[11px] text-slate-400 font-medium mb-1.5">Destination</label>
                <div className="relative">
                  <select
                    value={destWaypoint}
                    onChange={(e) => setDestWaypoint(e.target.value)}
                    className="w-full appearance-none bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                  >
                    <option value="">Select destination...</option>
                    {waypoints.filter((w) => w !== startWaypoint).map((wp) => (
                      <option key={wp} value={wp}>{wp}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Find Route Button */}
              <div className="flex items-end">
                <button
                  onClick={handleFindRoute}
                  disabled={!startWaypoint || !destWaypoint || isLoadingRoute}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition"
                >
                  {isLoadingRoute ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Computing...</>
                  ) : (
                    <><Navigation className="w-3.5 h-3.5" /> Find Safe Route</>
                  )}
                </button>
              </div>
            </div>

            {/* Route Error */}
            {routeError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl mb-4">
                <p className="text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {routeError}
                </p>
              </div>
            )}

            {/* Route Result — Safe */}
            {routeResult && routeResult.safe && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/30 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Safe Route Found
                  </h4>
                  <button
                    onClick={clearRoute}
                    className="text-[10px] text-slate-400 hover:text-slate-200 transition"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-300 mb-3">
                  <span><strong>{routeResult.start}</strong> → <strong>{routeResult.destination}</strong></span>
                  <span className="text-emerald-400 font-semibold">{routeResult.totalDistanceKm} km</span>
                  <span className="text-slate-500">{routeResult.segmentCount} segment{routeResult.segmentCount !== 1 ? "s" : ""}</span>
                </div>
                <div className="space-y-1.5">
                  {routeResult.segments.map((seg, i) => (
                    <div key={seg.trailId || i} className="flex items-center justify-between p-2 bg-slate-950/40 rounded-lg border border-slate-800/60 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold w-5">{i + 1}.</span>
                        <span className="text-slate-200">{seg.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400">
                        <span>{seg.distanceKm} km</span>
                        <span className={seg.currentRiskScore >= 50 ? "text-amber-400" : "text-emerald-400"}>
                          Risk {seg.currentRiskScore}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Route Result — No Safe Route */}
            {routeResult && !routeResult.safe && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    No Safe Route Available
                  </h4>
                  <button
                    onClick={clearRoute}
                    className="text-[10px] text-slate-400 hover:text-slate-200 transition"
                  >
                    Clear
                  </button>
                </div>
                <p className="text-xs text-rose-300/80">
                  {routeResult.message || "All connecting trails between these waypoints are currently closed, diverted, or at critical risk levels. Try a different start/destination or wait for conditions to improve."}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Grid of Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Trail Status Card — Dynamic from API */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-200 text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Active Trail Status
            </h3>
            <span className="text-[11px] bg-emerald-500/15 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
              {liveTrails.length} Trail{liveTrails.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-3 text-xs max-h-[280px] overflow-y-auto pr-1">
            {liveTrails.length === 0 ? (
              <p className="text-slate-500 text-xs italic">Select a fort to view trail status</p>
            ) : (
              liveTrails.slice(0, 6).map((trail) => (
                <div key={trail._id} className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80">
                  <div className="min-w-0 mr-2">
                    <div className="font-semibold text-slate-200 truncate">{trail.name}</div>
                    <div className="text-slate-400 text-[10px]">{trail.distanceKm} km · {trail.difficulty}</div>
                  </div>
                  {(() => {
                      const riskScore = getTrailRiskScore(trail);
                      const effectiveStatus = trail.status === "closed" || trail.status === "diverted"
                        ? trail.status
                        : riskScore >= 75 ? "closed" : riskScore >= 50 ? "caution" : trail.status;
                      if (effectiveStatus === "closed" || effectiveStatus === "diverted") {
                        return (
                          <span className="text-rose-400 font-bold flex items-center gap-1 shrink-0">
                            <AlertTriangle className="w-3.5 h-3.5" /> {effectiveStatus === "diverted" ? "Diverted" : "Closed"}
                          </span>
                        );
                      } else if (effectiveStatus === "caution" || riskScore >= 30) {
                        return (
                          <span className="text-amber-400 font-bold flex items-center gap-1 shrink-0">
                            <AlertTriangle className="w-3.5 h-3.5" /> Caution
                          </span>
                        );
                      } else {
                        return (
                          <span className="text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Open
                          </span>
                        );
                      }
                    })()}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Erosion Risk Index — Dynamic from trail data */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-200 text-base flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-cyan-400" />
              Erosion Risk Index
            </h3>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${riskBadgeColors[riskLevel]}`}>
              {riskLabels[riskLevel]}
            </span>
            {hasLiveRisk && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <Activity className="w-3 h-3" /> Live
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Aggregated from {liveTrails.length} trail segment{liveTrails.length !== 1 ? "s" : ""} — precipitation, slope gradient, and volcanic rock mortar saturation.
          </p>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-2">
            <div
              className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-full transition-all duration-500"
              style={{ width: `${aggregateRisk}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Low (0%)</span>
            <span className={`font-semibold ${
              aggregateRisk >= 75 ? "text-rose-400" : aggregateRisk >= 50 ? "text-amber-400" : "text-emerald-400"
            }`}>{aggregateRisk}% Avg Risk</span>
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
