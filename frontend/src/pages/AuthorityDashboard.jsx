import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Shield, AlertOctagon, Sliders, Users, Droplets, CheckCircle2, RefreshCw } from "lucide-react";

export const AuthorityDashboard = () => {
  const { authUser } = useAuthStore();

  const [rainfall, setRainfall] = useState(65);
  const [footfall, setFootfall] = useState(450);
  const [pathSevered, setPathSevered] = useState(false);

  // Dynamic Risk Weight calculation based on README formula
  // Risk = Baseline(1.2) * Soil Saturation * Slope(1.4) * (Footfall / MaxSafe(500))
  const maxSafeFootfall = 500;
  const soilSaturation = rainfall / 100;
  const riskScore = Math.min(100, Math.round(1.2 * soilSaturation * 1.4 * (footfall / maxSafeFootfall) * 100));
  const isCritical = riskScore >= 75;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Authority Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
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
            <AlertOctagon className={`w-8 h-8 shrink-0 ${isCritical ? "text-rose-500 animate-pulse" : "text-amber-400"}`} />
            <div>
              <div className="text-xs text-slate-400">Erosion Risk Index</div>
              <div className="text-lg font-black text-white">{riskScore}% {isCritical ? "(CRITICAL)" : "(MONITORED)"}</div>
              <div className="text-[11px] text-amber-300">Rajgad - Torna Sector</div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alert Box */}
      <div className="mb-8 p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-400 shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-200">
              Hydrological Warning: Rock-Cut Cistern #3 Overcapacity
            </h3>
            <p className="text-xs text-rose-300/80 mt-0.5 max-w-2xl">
              Surface water velocity is projected to scour the lower masonry steps on the Pali Gate ascent within 90 minutes.
            </p>
          </div>
        </div>

        <button
          onClick={() => setPathSevered(!pathSevered)}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-2 ${
            pathSevered
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950"
          }`}
        >
          {pathSevered ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Diversion Active (Reopen Trail)
            </>
          ) : (
            <>
              <AlertOctagon className="w-4 h-4" />
              Sever Path & Broadcast Diversion
            </>
          )}
        </button>
      </div>

      {/* Carrying-Capacity Throttle & Simulation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sliders panel */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Carrying-Capacity Throttle</h3>
                <p className="text-xs text-slate-400">Live stress-test simulation parameters</p>
              </div>
            </div>
            <button
              onClick={() => { setRainfall(65); setFootfall(450); }}
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
                <span className="text-xs font-bold text-cyan-400">{rainfall} mm/hr</span>
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
                <span className="text-xs font-bold text-emerald-400">{footfall} trekkers / km</span>
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
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-base mb-1">Dynamic Risk Evaluation</h3>
            <p className="text-xs text-slate-400 mb-6">
              Formula: Traversal Difficulty × Soil Saturation × Slope × (Density / Max Safe Footfall)
            </p>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 mb-6">
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="text-slate-400">Erosion Index:</span>
                <span className={`font-bold ${isCritical ? "text-rose-400" : "text-amber-400"}`}>
                  {riskScore} / 100
                </span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-300 ${
                    isCritical
                      ? "bg-rose-500"
                      : riskScore > 50
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${riskScore}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400">
                {isCritical ? (
                  <span className="text-rose-400 font-semibold">
                    🚨 Warning: Threshold exceeded! Trail segments near Suvela Machi are experiencing soil rutting.
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold">
                    ✅ Safe Operational Parameters. No automatic diversion required.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="font-semibold text-slate-300">Authority Note:</span> Any changes made here are broadcasted in real time to all authenticated Trekkers on the field.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;

