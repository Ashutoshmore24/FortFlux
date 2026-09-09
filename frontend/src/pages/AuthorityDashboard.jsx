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

  // Toggle manual severing of a trail segment
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

  const aggregateSimRisk =
    trails.length > 0
      ? Math.round(
          [...riskOverrides.values()].reduce((a, b) => a + b, 0) /
            riskOverrides.size
        )
      : 0;
  const isCritical = aggregateSimRisk >= 75;

  const liveAggregate = liveRiskData?.aggregate;
  const liveTrailRisks = liveRiskData?.trails || [];
  const isLiveCritical = (liveAggregate?.averageRisk || 0) >= 75;

  const alertCisterns = cisterns.filter(
    (c) => c.currentLevelPct >= c.overflowThreshold
  );

  const handleTrailToggle = async (trail) => {
    setUpdatingTrailId(trail._id);
    const newStatus = trail.status === "closed" || trail.status === "diverted" ? "open" : "closed";
    await updateTrailStatus(trail._id, { status: newStatus });
    setUpdatingTrailId(null);
  };

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
      {/* ── AUTHORITY COMMAND CONSOLE HEADER ── */}
      <div className="bg-white border border-[#E2ECE4] rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden animate-fade-in-up shadow-sm">
        {/* Subtle fort landscape background */}
        <img
          src={fortDetail?.imageUrl || `/forts/${selectedFortSlug || "rajgad"}.jpg`}
          alt="Sahyadri Fort Authority"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-15 select-none pointer-events-none"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/forts/rajgad.jpg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/70 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-emerald-600 to-teal-600" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-amber-700" />
                Authority Command Center
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold">
                {authUser?.organization || "Sahyadri Heritage Protection Division"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#132A22] tracking-tight">
              Officer {authUser?.username}
            </h1>
            <p className="text-xs sm:text-sm text-[#52685E] mt-1 max-w-xl font-medium leading-relaxed">
              Structural alerts, hydrological runoff models, and carrying-capacity controls across the 18 Sahyadri fortresses.
            </p>
          </div>

          <div className="flex items-center gap-3.5 bg-white/95 backdrop-blur-md border border-amber-200/80 p-4 sm:p-5 rounded-2xl shadow-xs shrink-0">
            <AlertOctagon
              className={`w-8 h-8 shrink-0 ${
                isCritical ? "text-rose-600 animate-pulse" : "text-amber-600"
              }`}
            />
            <div>
              <div className="text-xs text-[#52685E] font-medium">Simulated Erosion Index</div>
              <div className="text-lg font-extrabold text-[#132A22]">
                {aggregateSimRisk}%{" "}
                <span className={isCritical ? "text-rose-600 text-sm" : "text-amber-700 text-sm"}>
                  {isCritical ? "(CRITICAL)" : "(MONITORED)"}
                </span>
              </div>
              <div className="text-[11px] text-emerald-800 font-bold">
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
            className="appearance-none bg-white border border-[#D5E2D8] text-slate-800 text-xs font-semibold rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:border-emerald-600 transition cursor-pointer shadow-xs hover:border-emerald-400"
          >
            {availableForts.map((f) => (
              <option key={f.slug} value={f.slug}>
                {f.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <span className="text-[11px] text-[#52685E] font-medium">
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
              className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in-up shadow-xs"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl shrink-0">
                  <Droplets className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-900">
                    Hydrological Warning: {cistern.name} —{" "}
                    {cistern.status === "overflow"
                      ? "Overflow Active"
                      : "Nearing Overflow"}
                  </h3>
                  <p className="text-xs text-rose-800 mt-0.5 max-w-2xl font-medium">
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
        <div className="bg-white border border-[#E2ECE4] rounded-3xl p-6 sm:p-8 shadow-xs animate-fade-in-up delay-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#132A22] text-base">
                  Carrying-Capacity Throttle
                </h3>
                <p className="text-xs text-[#52685E] font-medium">
                  Live stress-test simulation parameters
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setRainfall(65);
                setFootfall(450);
              }}
              className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          <div className="space-y-6">
            {/* Rainfall Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-teal-600" />
                  Monsoon Rainfall Surge
                </span>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  {rainfall} mm/hr
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="150"
                value={rainfall}
                onChange={(e) => setRainfall(Number(e.target.value))}
                className="w-full h-2 bg-[#E2ECE4] rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-[#52685E] mt-1 font-medium">
                <span>0 mm (Drizzle)</span>
                <span>75 mm (Heavy)</span>
                <span>150 mm (Extreme Cloudburst)</span>
              </div>
            </div>

            {/* Trekker Volume Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Live Trekker Footfall Density
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
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
                className="w-full h-2 bg-[#E2ECE4] rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-[#52685E] mt-1 font-medium">
                <span>50 (Low)</span>
                <span>500 (Max Safe Capacity)</span>
                <span>1000 (Severe Overcrowding)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Risk Gauge & Actions */}
        <div className="bg-white border border-[#E2ECE4] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs animate-fade-in-up delay-200">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <h3 className="font-bold text-[#132A22] text-base">
                Dynamic Risk Evaluation
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleComputeLiveRisk}
                  disabled={isLoadingRisk}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-[11px] font-bold transition disabled:opacity-50 cursor-pointer shadow-2xs"
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
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold transition disabled:opacity-50 cursor-pointer shadow-2xs"
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
            <p className="text-xs text-[#52685E] mb-4 font-medium">
              Formula: Traversal Difficulty × Soil Saturation × Slope × (Density / Max Safe Footfall)
            </p>

            {/* Success banner */}
            {applySuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Risk scores applied to database. Trail statuses updated automatically.
              </div>
            )}

            {/* Risk error */}
            {riskError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold">
                ⚠️ {riskError}
              </div>
            )}

            {/* Dual gauge: Simulated vs Live */}
            <div className="grid grid-cols-1 gap-3 mb-4">
              {/* Simulated Risk Gauge */}
              <div className="p-4 bg-[#F8FAF8] rounded-2xl border border-[#E2ECE4]">
                <div className="flex items-center justify-between mb-2 text-xs font-semibold">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <Sliders className="w-3 h-3 text-slate-500" /> Simulated Erosion Index
                  </span>
                  <span
                    className={`font-bold ${
                      isCritical ? "text-rose-700" : "text-amber-700"
                    }`}
                  >
                    {aggregateSimRisk} / 100
                  </span>
                </div>
                <div className="w-full bg-[#E2ECE4] h-2.5 rounded-full overflow-hidden mb-2">
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
                <div className="text-[11px]">
                  {isCritical ? (
                    <span className="text-rose-700 font-bold">
                      🚨 Threshold exceeded at current slider parameters.
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold">
                      ✅ Safe Operational Parameters.
                    </span>
                  )}
                </div>
              </div>

              {/* Live Risk Gauge */}
              {liveRiskData && liveAggregate && (
                <div className={`p-4 rounded-2xl border ${
                  isLiveCritical
                    ? "bg-rose-50/70 border-rose-200"
                    : "bg-teal-50/70 border-teal-200"
                }`}>
                  <div className="flex items-center justify-between mb-2 text-xs font-semibold">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <Activity className="w-3 h-3 text-teal-700" /> Live Weather Risk
                      {liveRiskData.weather && (
                        <span className="ml-1 text-slate-600 font-normal">{liveRiskData.weather.weatherIcon} {liveRiskData.weather.precipitation}mm</span>
                      )}
                    </span>
                    <span
                      className={`font-bold ${
                        isLiveCritical ? "text-rose-700" : "text-teal-800"
                      }`}
                    >
                      {liveAggregate.averageRisk} / 100
                    </span>
                  </div>
                  <div className="w-full bg-[#E2ECE4] h-2.5 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isLiveCritical
                          ? "bg-rose-500"
                          : liveAggregate.averageRisk > 50
                          ? "bg-amber-500"
                          : "bg-teal-600"
                      }`}
                      style={{ width: `${liveAggregate.averageRisk}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span>
                      {liveAggregate.criticalCount > 0 ? (
                        <span className="text-rose-700 font-bold">
                          🚨 {liveAggregate.criticalCount} critical segment{liveAggregate.criticalCount !== 1 ? "s" : ""}
                        </span>
                      ) : liveAggregate.cautionCount > 0 ? (
                        <span className="text-amber-800 font-bold">
                          ⚠️ {liveAggregate.cautionCount} caution segment{liveAggregate.cautionCount !== 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold">✅ All segments safe</span>
                      )}
                    </span>
                    {lastComputed && (
                      <span className="text-[#52685E] font-medium">
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
                      className="flex items-center justify-between text-[11px] bg-[#F8FAF8] border border-[#E2ECE4] rounded-lg px-3 py-2"
                    >
                      <span className="text-slate-800 font-semibold truncate mr-2">
                        {trail.name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0 text-slate-600">
                        <span>
                          DB: {trail.currentRiskScore}%
                        </span>
                        <span>·</span>
                        <span
                          className={`font-bold ${
                            simRisk >= 75
                              ? "text-rose-700"
                              : simRisk >= 50
                              ? "text-amber-700"
                              : "text-emerald-700"
                          }`}
                        >
                          Sim: {simRisk}%
                        </span>
                        {liveTrail && (
                          <>
                            <span>·</span>
                            <span
                              className={`font-bold ${
                                liveTrail.liveRiskScore >= 75
                                  ? "text-rose-700"
                                  : liveTrail.liveRiskScore >= 50
                                  ? "text-amber-700"
                                  : "text-teal-700"
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

          <div className="text-xs text-[#52685E] p-3 bg-[#F8FAF8] rounded-xl border border-[#E2ECE4] mt-4 font-medium">
            <strong className="text-[#132A22]">Authority Note:</strong> Sim uses slider parameters. Live uses real Open-Meteo weather. "Apply to DB" persists live scores and auto-sets trail statuses (≥75% → closed, ≥30% → caution).
          </div>
        </div>
      </div>

      {/* ═══ Adaptive Routing Auto-Sever Alert ═══ */}
      {severedTrails.length > 0 && (
        <div className="mb-6 p-4 sm:p-5 bg-rose-50 border border-rose-200 rounded-3xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-rose-100 text-rose-700 rounded-2xl shrink-0 mt-0.5">
                <AlertOctagon className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-rose-950">
                    🚦 Adaptive Routing Engine Active: {severedTrails.length} Segment{severedTrails.length > 1 ? "s" : ""} Auto-Severed
                  </h3>
                  <span className="text-[10px] bg-rose-100 text-rose-800 font-extrabold px-2.5 py-0.5 rounded-full border border-rose-300 uppercase tracking-wider">
                    Threshold Exceeded (≥ 75%)
                  </span>
                </div>
                <p className="text-xs text-rose-800 max-w-3xl leading-relaxed font-medium">
                  {simulationResult?.summary || "Compromised trail segments severed to prevent erosion disaster. Safe traffic diversion computed live via Dijkstra graph traversal."}
                </p>
                {diversionRoute && diversionRoute.safe && (
                  <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-emerald-900 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                    <span className="flex items-center gap-1.5">
                      <Route className="w-4 h-4 text-emerald-700" />
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
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Engine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map & Trail Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-fade-in-up">
        {/* Map (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-[#132A22] text-lg flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                <MapIcon className="w-4 h-4" />
              </div>
              Authority Map — Live Trail Network
            </h2>
            <div className="flex items-center gap-2">
              {severedTrails.length > 0 ? (
                <span className="text-[11px] bg-rose-50 text-rose-800 font-bold px-3 py-1 rounded-full border border-rose-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  Diversion Active
                </span>
              ) : (
                <span className="text-[11px] bg-amber-50 text-amber-800 font-bold px-3 py-1 rounded-full border border-amber-200">
                  ⚡ Simulation Active
                </span>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-[#E2ECE4] overflow-hidden shadow-xs bg-white">
            <FortMap
              className="h-[680px] lg:h-[720px]"
              onFortSelect={(fort) => handleFortChange(fort.slug)}
              riskOverrides={riskOverrides}
              severedTrails={severedTrails}
              diversionRoute={diversionRoute}
              photoReports={reports}
            />
          </div>
        </div>

        {/* Trail Management Panel (1/3 width) */}
        <div className="bg-white border border-[#E2ECE4] rounded-3xl p-6 shadow-xs">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#132A22] text-base">
                Trail Management
              </h3>
              <p className="text-xs text-[#52685E] font-medium">
                Close or reopen trail segments
              </p>
            </div>
          </div>

          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-xs font-medium">Loading trails...</span>
            </div>
          ) : trails.length === 0 ? (
            <p className="text-xs text-[#52685E] italic py-8 text-center">
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
                        ? "bg-rose-50/80 border-rose-300"
                        : isClosed
                        ? "bg-rose-50/50 border-rose-200"
                        : "bg-[#F8FAF8] border-[#E2ECE4]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">
                          {trail.name}
                        </div>
                        <div className="text-[10px] text-[#52685E] font-medium">
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
                            ? "bg-rose-50 text-rose-800 border border-rose-200"
                            : trail.currentRiskScore >= 50
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {isSevered ? "SEVERED" : `Risk ${riskOverrides.get(trail._id) || trail.currentRiskScore}%`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() => handleSeverToggle(trail._id)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 border cursor-pointer ${
                          isSevered
                            ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                            : "bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200"
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
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 border disabled:opacity-50 cursor-pointer ${
                          isClosed
                            ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isClosed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Reopen DB
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-500" /> Close DB
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

      {/* ═══ Incoming Field Audits & AI Visual Triage ═══ */}
      <div className="bg-white border border-[#E2ECE4] rounded-3xl p-6 sm:p-8 mb-8 animate-fade-in-up shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#132A22] text-lg">
                  Incoming Field Audits & AI Visual Triage
                </h3>
                <span className="text-[10px] bg-amber-50 text-amber-800 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
                  Live Evidence
                </span>
              </div>
              <p className="text-xs text-[#52685E] mt-0.5 font-medium">
                Crowdsourced geotagged hazard photos with AI severity assessment and one-click trail severance
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-[#F8FAF8] p-1 rounded-xl border border-[#E2ECE4] text-xs font-semibold">
            <button
              onClick={() => setAuditFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                auditFilter === "all"
                  ? "bg-white text-slate-900 border border-[#D5E2D8] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({reports.length})
            </button>
            <button
              onClick={() => setAuditFilter("pending")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                auditFilter === "pending"
                  ? "bg-amber-50 text-amber-900 border border-amber-200 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pending ({reports.filter((r) => r.status === "pending").length})
            </button>
            <button
              onClick={() => setAuditFilter("verified")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                auditFilter === "verified"
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
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
              <div className="p-8 text-center bg-[#F8FAF8] rounded-2xl border border-[#E2ECE4]">
                <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-[#52685E] font-medium">
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
                    ? "bg-rose-50 text-rose-800 border-rose-300"
                    : report.severity === "high"
                    ? "bg-orange-50 text-orange-900 border-orange-300"
                    : report.severity === "moderate"
                    ? "bg-amber-50 text-amber-900 border-amber-300"
                    : "bg-emerald-50 text-emerald-900 border-emerald-300";

                return (
                  <div
                    key={report._id}
                    className="bg-white border border-[#E2ECE4] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-emerald-300 transition shadow-xs"
                  >
                    <div>
                      {/* Photo Thumbnail */}
                      {report.imageUrl && (
                        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                          <img
                            src={report.imageUrl}
                            alt={report.hazardType}
                            className="w-full h-full object-cover"
                          />
                          <span
                            className={`absolute top-2.5 right-2.5 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border shadow-xs ${severityColor}`}
                          >
                            {report.severity}
                          </span>
                          <span className="absolute bottom-2.5 left-2.5 text-[10px] font-bold bg-white/90 text-slate-800 px-2.5 py-0.5 rounded-lg border border-[#E2ECE4] capitalize shadow-xs">
                            {report.hazardType}
                          </span>
                        </div>
                      )}

                      {/* Details */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#52685E] font-medium">
                            By <strong className="text-[#132A22]">{report.user?.username || "Trekker"}</strong>
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                              report.status === "verified"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : report.status === "rejected"
                                ? "bg-slate-100 text-slate-500"
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {report.status}
                          </span>
                        </div>

                        {report.description && (
                          <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed font-medium">
                            {report.description}
                          </p>
                        )}

                        {/* AI Triage Card */}
                        {report.aiTriage && (
                          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs space-y-1">
                            <div className="flex items-center justify-between text-sky-900 font-bold text-[11px]">
                              <span>🤖 AI Hazard Assessment</span>
                              {report.aiTriage.confidenceScore && (
                                <span className="text-[10px] text-sky-700 font-bold">
                                  {Math.round(report.aiTriage.confidenceScore * 100)}% Confidence
                                </span>
                              )}
                            </div>
                            <p className="text-sky-950 text-[11px] leading-relaxed font-medium">
                              {report.aiTriage.hazardAssessment}
                            </p>
                            {report.aiTriage.recommendedAction && (
                              <div className="text-[10px] text-amber-800 font-bold pt-1">
                                Action: {report.aiTriage.recommendedAction}
                              </div>
                            )}
                          </div>
                        )}

                        {report.trail && (
                          <div className="text-[11px] text-[#52685E] flex items-center gap-1.5 font-medium">
                            <Navigation className="w-3 h-3 text-emerald-600" />
                            <span>Corridor: <strong className="text-[#132A22]">{report.trail?.name || "Main Trail"}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="p-4 pt-2 border-t border-[#E2ECE4] bg-[#F8FAF8] space-y-2">
                      {report.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleVerifyAndSever(report)}
                            disabled={isActing}
                            className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
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
                              className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verify Only
                            </button>
                            <button
                              onClick={() => handleDismissReport(report, "rejected")}
                              disabled={isActing}
                              className="py-1.5 px-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                            >
                              <XCircle className="w-3 h-3 text-slate-400" /> Dismiss
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Action Logged
                          </span>
                          <button
                            onClick={() => handleDismissReport(report, "resolved")}
                            disabled={isActing}
                            className="text-[11px] text-slate-500 hover:text-slate-800 transition font-semibold cursor-pointer"
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
