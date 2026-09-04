import { useAuthStore } from "../store/useAuthStore";
import { Compass, CloudRain, AlertTriangle, Camera, MapPin, CheckCircle2, Shield } from "lucide-react";

export const TrekkerDashboard = () => {
  const { authUser } = useAuthStore();

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

          <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 p-4 rounded-2xl">
            <CloudRain className="w-8 h-8 text-cyan-400 shrink-0" />
            <div>
              <div className="text-xs text-slate-400">Current Forecast</div>
              <div className="text-sm font-bold text-white">Moderate Monsoon Surge</div>
              <div className="text-[11px] text-cyan-400">Rajgad / Torna Corridor</div>
            </div>
          </div>
        </div>
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

