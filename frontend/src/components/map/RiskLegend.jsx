const RiskLegend = () => {
    return (
        <div className="absolute bottom-3 right-3 z-[1000] bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl p-3">
            <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                Trail Risk Legend
            </h4>
            <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-1 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-slate-400">Safe (0–29%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-1 rounded-full bg-lime-500" />
                    <span className="text-[10px] text-slate-400">Moderate (30–49%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-1 rounded-full bg-amber-500" />
                    <span className="text-[10px] text-slate-400">Caution (50–74%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-1 rounded-full bg-rose-500" />
                    <span className="text-[10px] text-slate-400">Critical (75%+)</span>
                </div>
                <div className="flex items-center gap-2 mt-1 pt-1 border-t border-slate-800">
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white/80" />
                    <span className="text-[10px] text-slate-400">Cistern</span>
                </div>
            </div>
        </div>
    );
};

export { RiskLegend };
export default RiskLegend;
