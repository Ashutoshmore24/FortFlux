import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useFortStore } from "../store/useFortStore";
import { useWeatherStore } from "../store/useWeatherStore";
import { useRiskStore } from "../store/useRiskStore";
import { useRoutingStore } from "../store/useRoutingStore";
import { useReportStore } from "../store/useReportStore";
import FortMap from "../components/map/FortMap";
import {
  Shield,
  AlertOctagon,
  Sliders,
  Users,
  Droplets,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  Map as MapIcon,
  XCircle,
  RotateCcw,
  Navigation,
  Loader2,
  Zap,
  Database,
  Activity,
  Route,
  Scissors,
  Camera,
  AlertTriangle,
  Eye,
} from "lucide-react";

export const AuthorityDashboard = () => {
  const { authUser } = useAuthStore();
  const {
    forts,
    selectedFort,
    fortDetail,
    fetchForts,
    fetchFortDetail,
    selectFort,
    updateTrailStatus,
    isLoadingDetail,
  } = useFortStore();
  const {
    availableForts,
    fetchForts: fetchWeatherForts,
    selectedFortSlug,
    setSelectedFort: setWeatherFort,
    weatherData,
    fetchWeather,
    isLoadingForts,
  } = useWeatherStore();

  const {
    riskData: liveRiskData,
    isLoading: isLoadingRisk,
    isApplying,
    fetchRisk,
    applyRisk,
    error: riskError,
    lastComputed,
  } = useRiskStore();

  const {
    severedTrails,
    diversionRoute,
    simulationResult,
    isSimulating,
    simulateRouting,
    toggleSeverTrail,
    clearSimulation,
    manuallySeveredIds,
  } = useRoutingStore();

  const {
    reports,
    fetchFortReports,
    updateReportStatus,
    isLoadingReports,
  } = useReportStore();

  const [rainfall, setRainfall] = useState(65);
  const [footfall, setFootfall] = useState(450);
  const [updatingTrailId, setUpdatingTrailId] = useState(null);
  const [applySuccess, setApplySuccess] = useState(false);
  const [auditFilter, setAuditFilter] = useState("all");
  const [actingReportId, setActingReportId] = useState(null);

  // Fetch forts on mount
  useEffect(() => {
    fetchForts();
    fetchWeatherForts();
  }, []);

  // Fetch fort detail when weather fort slug changes
  useEffect(() => {
    if (selectedFortSlug) {
      fetchFortDetail(selectedFortSlug);
      fetchWeather(selectedFortSlug);
      fetchFortReports(selectedFortSlug);
    }
  }, [selectedFortSlug]);

  const handleFortChange = (slug) => {
    setWeatherFort(slug);
    const mapFort = forts.find((f) => f.slug === slug);
    if (mapFort) selectFort(mapFort);
    setApplySuccess(false);
    clearSimulation();
  };

  // Toggle manual severing of a trail segment (simulate emergency severance)
  const handleSeverToggle = async (trailId) => {
    if (selectedFortSlug) {
      await toggleSeverTrail(selectedFortSlug, trailId, {
        rainfall,
        footfall,
      });
    }
  };

  // One-click Verify & Sever Trail from crowdsourced field report
  const handleVerifyAndSever = async (report) => {
    setActingReportId(report._id);
    const res = await updateReportStatus(report._id, {
      status: "verified",
      action: "sever_trail",
    });
    if (res.success) {
      if (report.trail?._id || report.trail) {
        const trailId = report.trail._id || report.trail;
        await handleSeverToggle(trailId);
      }
      await fetchFortDetail(selectedFortSlug);
    }
    setActingReportId(null);
  };

  // Verify only
  const handleVerifyOnly = async (report) => {
    setActingReportId(report._id);
    await updateReportStatus(report._id, { status: "verified" });
    setActingReportId(null);
  };

  // Dismiss / resolve report
  const handleDismissReport = async (report, newStatus = "rejected") => {
    setActingReportId(report._id);
    await updateReportStatus(report._id, { status: newStatus });
    setActingReportId(null);
  };

  // Compute live risk from weather API
  const handleComputeLiveRisk = async () => {
    if (selectedFortSlug) {
      setApplySuccess(false);
      await fetchRisk(selectedFortSlug);
    }
  };

  // Apply computed risk to DB + auto-set trail statuses
  const handleApplyRisk = async () => {
    if (selectedFortSlug) {
      const result = await applyRisk(selectedFortSlug);
      if (result.success) {
        setApplySuccess(true);
        // Refresh fort detail to reflect updated trail statuses on the map
        await fetchFortDetail(selectedFortSlug);
        setTimeout(() => setApplySuccess(false), 4000);
      }
    }
  };

  // Ensure a fort is selected on initial load
  useEffect(() => {
    if (forts.length > 0 && !selectedFort) {
      const defaultFort = forts.find((f) => f.slug === selectedFortSlug) || forts[0];
      selectFort(defaultFort);
    }
  }, [forts]);

  const trails = fortDetail?.trails || [];
  const cisterns = fortDetail?.cisterns || [];

  // Dynamic Risk Weight calculation using ACTUAL trail parameters from DB
  // Risk = BaselineDifficulty × Soil Saturation × SlopeGradient × (Footfall / MaxSafe)
  const maxRainfall = 150;
  const soilSaturation = Math.min(rainfall / maxRainfall, 1);

  // Compute per-trail simulated risk scores based on slider values
  const riskOverrides = useMemo(() => {
    const overrides = new Map();
    trails.forEach((trail) => {
      const simRisk = Math.min(
        100,
        Math.round(
          trail.baselineDifficulty *
            soilSaturation *
            trail.slopeGradient *
            (footfall / trail.maxSafeFootfall) *
            100
        )
      );
      overrides.set(trail._id, simRisk);
    });
    return overrides;
  }, [trails, soilSaturation, footfall]);

  // Aggregate simulated risk score
  const aggregateSimRisk =
    trails.length > 0
      ? Math.round(
          [...riskOverrides.values()].reduce((a, b) => a + b, 0) /
            riskOverrides.size
        )
      : 0;
  const isCritical = aggregateSimRisk >= 75;

  // Live risk data from the API
  const liveAggregate = liveRiskData?.aggregate;
  const liveTrailRisks = liveRiskData?.trails || [];
  const isLiveCritical = (liveAggregate?.averageRisk || 0) >= 75;

  // Find cisterns above overflow threshold
  const alertCisterns = cisterns.filter(
    (c) => c.currentLevelPct >= c.overflowThreshold
  );

  // Handle trail status toggle (close/reopen)
  const handleTrailToggle = async (trail) => {
    setUpdatingTrailId(trail._id);
    const newStatus = trail.status === "closed" || trail.status === "diverted" ? "open" : "closed";
    await updateTrailStatus(trail._id, { status: newStatus });
    setUpdatingTrailId(null);
  };

  // ── Adaptive Routing Auto-Sever & Simulation Trigger ──
  // Whenever rainfall or footfall causes risk >= 75% or manual severing occurs,
  // the routing engine dynamically severs compromised paths and computes safe diversion routes.
  useEffect(() => {
    if (!selectedFortSlug || trails.length === 0) return;

    const hasCriticalRisk = trails.some((t) => (riskOverrides.get(t._id) || 0) >= 75);
    const hasManualSever = manuallySeveredIds.length > 0;

    if (hasCriticalRisk || hasManualSever) {
      const overridesObj = Object.fromEntries(riskOverrides.entries());
      simulateRouting(selectedFortSlug, {
        rainfall,
        footfall,
        riskOverrides: overridesObj,
        severedTrailIds: manuallySeveredIds,
      });
    } else if (severedTrails.length > 0) {
      clearSimulation();
    }
  }, [selectedFortSlug, rainfall, footfall, riskOverrides, manuallySeveredIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Authority Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden animate-fade-in-up">
        {/* Animated gradient accent */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-rose-500/5 animate-gradient-shift pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5" />
                Authority Command Center
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
                {authUser?.organization || "Sahyadri Heritage Protection Division"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Officer {authUser?.username}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Structural alerts, hydrological runoff models, and carrying-capacity controls for Sahyadri fortresses.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 border border-amber-500/30 p-4 rounded-2xl">
            <AlertOctagon
              className={`w-8 h-8 shrink-0 ${
                isCritical ? "text-rose-500 animate-pulse" : "text-amber-400"
              }`}
            />
            <div>
              <div className="text-xs text-slate-400">Simulated Erosion Index</div>
              <div className="text-lg font-black text-white">
                {aggregateSimRisk}%{" "}
                {isCritical ? "(CRITICAL)" : "(MONITORED)"}
              </div>
              <div className="text-[11px] text-amber-300">
                {selectedFort?.name || "Select a Fort"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fort Selector */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <select
            value={selectedFortSlug}
            onChange={(e) => handleFortChange(e.target.value)}
            className="appearance-none bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:border-amber-500 transition cursor-pointer"
          >
            {availableForts.map((f) => (
              <option key={f.slug} value={f.slug}>
                {f.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <span className="text-[11px] text-slate-500">
          {trails.length} trail segment{trails.length !== 1 ? "s" : ""} ·{" "}
          {cisterns.length} cistern{cisterns.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Dynamic Cistern Overflow Alerts */}
      {alertCisterns.length > 0 && (
        <div className="mb-8 space-y-3">
          {alertCisterns.map((cistern) => (
            <div
              key={cistern._id}
              className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in-up hover-glow"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-400 shrink-0">
                  <Droplets className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-200">
                    Hydrological Warning: {cistern.name} —{" "}
                    {cistern.status === "overflow"
                      ? "Overflow Active"
                      : "Nearing Overflow"}
                  </h3>
                  <p className="text-xs text-rose-300/80 mt-0.5 max-w-2xl">
                    Water level at{" "}
                    <strong>{cistern.currentLevelPct}%</strong> capacity (
                    {cistern.capacityLiters.toLocaleString()}L). Overflow
                    threshold: {cistern.overflowThreshold}%.
                    {cistern.nearestTrail && (
                      <span>
                        {" "}
                        Nearest trail:{" "}
                        <strong>{cistern.nearestTrail.name}</strong> (
                        {cistern.nearestTrail.status}).
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <span
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 ${
                  cistern.status === "overflow"
                    ? "bg-rose-600 text-white"
                    : "bg-amber-600 text-white"
                }`}
              >
                {cistern.currentLevelPct}% Full
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Carrying-Capacity Throttle & Simulation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sliders panel */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 hover-glow animate-fade-in-up delay-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Carrying-Capacity Throttle
                </h3>
                <p className="text-xs text-slate-400">
                  Live stress-test simulation parameters
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setRainfall(65);
                setFootfall(450);
              }}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          <div className="space-y-6">
            {/* Rainfall Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  Monsoon Rainfall Surge
                </span>
                <span className="text-xs font-bold text-cyan-400">
                  {rainfall} mm/hr
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="150"
                value={rainfall}
                onChange={(e) => setRainfall(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0 mm (Drizzle)</span>
                <span>75 mm (Heavy)</span>
                <span>150 mm (Extreme Cloudburst)</span>
              </div>
            </div>

            {/* Trekker Volume Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Live Trekker Footfall Density
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {footfall} trekkers / km
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={footfall}
                onChange={(e) => setFootfall(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>50 (Low)</span>
                <span>500 (Max Safe Capacity)</span>
                <span>1000 (Severe Overcrowding)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Risk Gauge & Actions */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover-glow animate-fade-in-up delay-200">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-white text-base">
                Dynamic Risk Evaluation
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleComputeLiveRisk}
                  disabled={isLoadingRisk}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-[11px] font-semibold transition disabled:opacity-50"
                >
                  {isLoadingRisk ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Zap className="w-3 h-3" />
                  )}
                  Compute Live Risk
                </button>
                <button
                  onClick={handleApplyRisk}
                  disabled={isApplying || !liveRiskData}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-semibold transition disabled:opacity-50"
                  title={!liveRiskData ? "Compute live risk first" : "Apply computed risk scores to database"}
                >
                  {isApplying ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Database className="w-3 h-3" />
                  )}
                  Apply to DB
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Formula: Traversal Difficulty × Soil Saturation × Slope × (Density
              / Max Safe Footfall)
            </p>

            {/* Success banner */}
            {applySuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Risk scores applied to database. Trail statuses updated automatically.
              </div>
            )}

            {/* Risk error */}
            {riskError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-semibold">
                ⚠️ {riskError}
              </div>
            )}

            {/* Dual gauge: Simulated vs Live */}
            <div className="grid grid-cols-1 gap-3 mb-4">
              {/* Simulated Risk Gauge */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Sliders className="w-3 h-3" /> Simulated Erosion Index
                  </span>
                  <span
                    className={`font-bold ${
                      isCritical ? "text-rose-400" : "text-amber-400"
                    }`}
                  >
                    {aggregateSimRisk} / 100
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isCritical
                        ? "bg-rose-500"
                        : aggregateSimRisk > 50
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${aggregateSimRisk}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400">
                  {isCritical ? (
                    <span className="text-rose-400 font-semibold">
                      🚨 Threshold exceeded at current slider parameters.
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold">
                      ✅ Safe Operational Parameters.
                    </span>
                  )}
                </div>
              </div>

              {/* Live Risk Gauge (only shown after computation) */}
              {liveRiskData && liveAggregate && (
                <div className={`p-4 rounded-2xl border ${
                  isLiveCritical
                    ? "bg-rose-500/5 border-rose-500/30"
                    : "bg-cyan-500/5 border-cyan-500/30"
                }`}>
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Activity className="w-3 h-3 text-cyan-400" /> Live Weather Risk
                      {liveRiskData.weather && (
                        <span className="ml-1">{liveRiskData.weather.weatherIcon} {liveRiskData.weather.precipitation}mm</span>
                      )}
                    </span>
                    <span
                      className={`font-bold ${
                        isLiveCritical ? "text-rose-400" : "text-cyan-400"
                      }`}
                    >
                      {liveAggregate.averageRisk} / 100
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isLiveCritical
                          ? "bg-rose-500"
                          : liveAggregate.averageRisk > 50
                          ? "bg-amber-500"
                          : "bg-cyan-500"
                      }`}
                      style={{ width: `${liveAggregate.averageRisk}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      {liveAggregate.criticalCount > 0 ? (
                        <span className="text-rose-400 font-semibold">
                          🚨 {liveAggregate.criticalCount} critical segment{liveAggregate.criticalCount !== 1 ? "s" : ""}
                        </span>
                      ) : liveAggregate.cautionCount > 0 ? (
                        <span className="text-amber-400 font-semibold">
                          ⚠️ {liveAggregate.cautionCount} caution segment{liveAggregate.cautionCount !== 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">✅ All segments safe</span>
                      )}
                    </span>
                    {lastComputed && (
                      <span className="text-slate-500">
                        {new Date(lastComputed).toLocaleTimeString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Per-trail breakdown */}
            {trails.length > 0 && (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {trails.map((trail) => {
                  const simRisk = riskOverrides.get(trail._id) || 0;
                  const liveTrail = liveTrailRisks.find((t) => t.trailId === trail._id);
                  return (
                    <div
                      key={trail._id}
                      className="flex items-center justify-between text-[11px] bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2"
                    >
                      <span className="text-slate-300 truncate mr-2">
                        {trail.name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-slate-500">
                          DB: {trail.currentRiskScore}%
                        </span>
                        <span className="text-slate-600">·</span>
                        <span
                          className={`font-bold ${
                            simRisk >= 75
                              ? "text-rose-400"
                              : simRisk >= 50
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }`}
                        >
                          Sim: {simRisk}%
                        </span>
                        {liveTrail && (
                          <>
                            <span className="text-slate-600">·</span>
                            <span
                              className={`font-bold ${
                                liveTrail.liveRiskScore >= 75
                                  ? "text-rose-400"
                                  : liveTrail.liveRiskScore >= 50
                                  ? "text-amber-400"
                                  : "text-cyan-400"
                              }`}
                            >
                              Live: {liveTrail.liveRiskScore}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-xs text-slate-400 p-3 bg-slate-950/60 rounded-xl border border-slate-800 mt-4">
            <span className="font-semibold text-slate-300">
              Authority Note:
            </span>{" "}
            <strong>Sim</strong> uses slider parameters. <strong>Live</strong> uses real Open-Meteo weather.
            "Apply to DB" persists live scores and auto-sets trail statuses (≥75% → closed, ≥30% → caution).
          </div>
        </div>
      </div>

      {/* ═══ Interactive Fort Map + Trail Management ═══ */}
      {severedTrails.length > 0 && (
        <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-rose-950/50 via-slate-900 to-emerald-950/40 border border-rose-500/40 rounded-3xl shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-rose-500/20 rounded-2xl text-rose-400 shrink-0 mt-0.5">
                <AlertOctagon className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-white">
                    🚦 Adaptive Routing Engine Active: {severedTrails.length} Segment{severedTrails.length > 1 ? "s" : ""} Auto-Severed
                  </h3>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 font-extrabold px-2.5 py-0.5 rounded-full border border-rose-500/40 uppercase tracking-wider">
                    Threshold Exceeded (≥ 75%)
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  {simulationResult?.summary || "Compromised trail segments severed to prevent erosion disaster. Safe traffic diversion computed live via Dijkstra graph traversal."}
                </p>
                {diversionRoute && diversionRoute.safe && (
                  <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-emerald-300 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                    <span className="flex items-center gap-1.5">
                      <Route className="w-4 h-4 text-emerald-400" />
                      Active Diversion: <strong>{diversionRoute.start}</strong> → <strong>{diversionRoute.destination}</strong>
                    </span>
                    <span>·</span>
                    <span>Distance: {diversionRoute.totalDistanceKm} km</span>
                    <span>·</span>
                    <span>{diversionRoute.segmentCount} Safe Segment{diversionRoute.segmentCount !== 1 ? "s" : ""}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => {
                  clearSimulation();
                  setRainfall(40);
                  setFootfall(300);
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Engine
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-fade-in-up">
        {/* Map (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-amber-400" />
              Authority Map — Live Trail Network
            </h2>
            <div className="flex items-center gap-2">
              {severedTrails.length > 0 ? (
                <span className="text-[11px] bg-rose-500/20 text-rose-300 font-bold px-3 py-1 rounded-full border border-rose-500/40 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  Diversion Active
                </span>
              ) : (
                <span className="text-[11px] bg-amber-500/10 text-amber-300 font-semibold px-3 py-1 rounded-full border border-amber-500/30">
                  ⚡ Simulation Active
                </span>
              )}
            </div>
          </div>
          <FortMap
            className="h-[680px] lg:h-[720px]"
            onFortSelect={(fort) => handleFortChange(fort.slug)}
            riskOverrides={riskOverrides}
            severedTrails={severedTrails}
            diversionRoute={diversionRoute}
            photoReports={reports}
          />
        </div>

        {/* Trail Management Panel (1/3 width) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 hover-glow">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Trail Management
              </h3>
              <p className="text-xs text-slate-400">
                Close or reopen trail segments
              </p>
            </div>
          </div>

          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-xs">Loading trails...</span>
            </div>
          ) : trails.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-8 text-center">
              Select a fort to manage its trails
            </p>
          ) : (
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {trails.map((trail) => {
                const isClosed =
                  trail.status === "closed" || trail.status === "diverted";
                const isUpdating = updatingTrailId === trail._id;
                const isSevered = manuallySeveredIds.includes(trail._id) || (riskOverrides.get(trail._id) || 0) >= 75;

                return (
                  <div
                    key={trail._id}
                    className={`p-3 rounded-xl border transition ${
                      isSevered
                        ? "bg-rose-500/10 border-rose-500/40"
                        : isClosed
                        ? "bg-rose-500/5 border-rose-500/30"
                        : "bg-slate-950/50 border-slate-800/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {trail.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {trail.distanceKm} km · {trail.difficulty} ·
                          Footfall: {trail.currentFootfall}/
                          {trail.maxSafeFootfall}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          isSevered
                            ? "bg-rose-600 text-white font-extrabold animate-pulse"
                            : isClosed
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : trail.currentRiskScore >= 50
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {isSevered ? "SEVERED" : `Risk ${riskOverrides.get(trail._id) || trail.currentRiskScore}%`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() => handleSeverToggle(trail._id)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1 border ${
                          isSevered
                            ? "bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border-amber-500/30"
                            : "bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border-rose-500/30"
                        }`}
                      >
                        {isSevered ? (
                          <>
                            <RotateCcw className="w-3 h-3" /> Reconnect
                          </>
                        ) : (
                          <>
                            <Scissors className="w-3 h-3" /> Sever Path
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleTrailToggle(trail)}
                        disabled={isUpdating}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1 border disabled:opacity-50 ${
                          isClosed
                            ? "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isClosed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Reopen DB
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Close DB
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Section Divider */}
      <div className="my-8 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      {/* ═══ Incoming Field Audits & AI Visual Triage (Phase 6) ═══ */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 animate-fade-in-up hover-glow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-lg">
                  Incoming Field Audits & AI Visual Triage
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/40 uppercase tracking-wider">
                  Phase 6 Evidence
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Crowdsourced geotagged hazard photos with AI severity assessment and one-click trail severance
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setAuditFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition ${
                auditFilter === "all"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All ({reports.length})
            </button>
            <button
              onClick={() => setAuditFilter("pending")}
              className={`px-3 py-1.5 rounded-lg transition ${
                auditFilter === "pending"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Pending ({reports.filter((r) => r.status === "pending").length})
            </button>
            <button
              onClick={() => setAuditFilter("verified")}
              className={`px-3 py-1.5 rounded-lg transition ${
                auditFilter === "verified"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Verified ({reports.filter((r) => r.status === "verified").length})
            </button>
          </div>
        </div>

        {/* Audit reports grid */}
        {(() => {
          const filtered = reports.filter((r) => {
            if (auditFilter === "pending") return r.status === "pending";
            if (auditFilter === "verified") return r.status === "verified";
            return true;
          });

          if (filtered.length === 0) {
            return (
              <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800">
                <Camera className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">
                  No {auditFilter !== "all" ? auditFilter : ""} photo audits found for this fort.
                </p>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {filtered.map((report) => {
                const isActing = actingReportId === report._id;
                const severityColor =
                  report.severity === "critical"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : report.severity === "high"
                    ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                    : report.severity === "moderate"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";

                return (
                  <div
                    key={report._id}
                    className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition shadow-lg"
                  >
                    <div>
                      {/* Photo Thumbnail */}
                      {report.imageUrl && (
                        <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                          <img
                            src={report.imageUrl}
                            alt={report.hazardType}
                            className="w-full h-full object-cover"
                          />
                          <span
                            className={`absolute top-2.5 right-2.5 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border backdrop-blur-sm ${severityColor}`}
                          >
                            {report.severity}
                          </span>
                          <span className="absolute bottom-2.5 left-2.5 text-[10px] font-bold bg-slate-950/80 text-slate-300 px-2.5 py-0.5 rounded-lg border border-slate-800 capitalize">
                            {report.hazardType}
                          </span>
                        </div>
                      )}

                      {/* Details */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">
                            By <strong>{report.user?.username || "Trekker"}</strong>
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                              report.status === "verified"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : report.status === "rejected"
                                ? "bg-slate-800 text-slate-400"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {report.status}
                          </span>
                        </div>

                        {report.description && (
                          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                            {report.description}
                          </p>
                        )}

                        {/* AI Triage Card */}
                        {report.aiTriage && (
                          <div className="bg-sky-950/40 border border-sky-500/30 rounded-xl p-3 text-xs space-y-1">
                            <div className="flex items-center justify-between text-sky-300 font-bold text-[11px]">
                              <span>🤖 AI Hazard Assessment</span>
                              {report.aiTriage.confidenceScore && (
                                <span className="text-[10px] text-sky-400">
                                  {Math.round(report.aiTriage.confidenceScore * 100)}% Confidence
                                </span>
                              )}
                            </div>
                            <p className="text-sky-200 text-[11px] leading-relaxed">
                              {report.aiTriage.hazardAssessment}
                            </p>
                            {report.aiTriage.recommendedAction && (
                              <div className="text-[10px] text-amber-300 font-semibold pt-1">
                                Action: {report.aiTriage.recommendedAction}
                              </div>
                            )}
                          </div>
                        )}

                        {report.trail && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <Navigation className="w-3 h-3 text-emerald-400" />
                            <span>Corridor: <strong>{report.trail?.name || "Main Trail"}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="p-4 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
                      {report.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleVerifyAndSever(report)}
                            disabled={isActing}
                            className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/50 disabled:opacity-50"
                          >
                            {isActing ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <AlertOctagon className="w-3.5 h-3.5" />
                            )}
                            Verify & Sever Trail
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleVerifyOnly(report)}
                              disabled={isActing}
                              className="py-1.5 px-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Verify Only
                            </button>
                            <button
                              onClick={() => handleDismissReport(report, "rejected")}
                              disabled={isActing}
                              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1 disabled:opacity-50"
                            >
                              <XCircle className="w-3 h-3" /> Dismiss
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Action Logged
                          </span>
                          <button
                            onClick={() => handleDismissReport(report, "resolved")}
                            disabled={isActing}
                            className="text-[11px] text-slate-400 hover:text-slate-200 transition"
                          >
                            Mark Resolved
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default AuthorityDashboard;
