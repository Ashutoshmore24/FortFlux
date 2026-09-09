import { useState } from "react";
import { Shield, ChevronDown, ChevronUp } from "lucide-react";

const RiskLegend = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="absolute bottom-3 right-3 z-[15]">
            {isExpanded ? (
                <div className="bg-white/95 backdrop-blur-md border border-[#E2ECE4] rounded-xl p-3 shadow-lg animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-[#E2ECE4]">
                        <div className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-emerald-600" />
                            <h4 className="text-[10px] font-bold text-[#132A22] uppercase tracking-wider">
                                Trail Risk Legend
                            </h4>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsExpanded(false)}
                            aria-label="Collapse risk legend"
                            className="text-slate-400 hover:text-slate-700 text-[11px] p-0.5 hover:bg-[#F5F8F4] rounded transition cursor-pointer"
                        >
                            <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-1 rounded-full bg-emerald-500" />
                            <span className="text-[10px] text-slate-700 font-medium">Safe (0–29%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-1 rounded-full bg-lime-500" />
                            <span className="text-[10px] text-slate-700 font-medium">Moderate (30–49%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-1 rounded-full bg-amber-500" />
                            <span className="text-[10px] text-slate-700 font-medium">Caution (50–74%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-1 rounded-full bg-rose-500" />
                            <span className="text-[10px] text-slate-700 font-medium">Critical (75%+)</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-[#E2ECE4]">
                            <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
                            <span className="text-[10px] text-slate-700 font-medium">Cistern (Water)</span>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    aria-label="Open risk legend"
                    title="View trail risk score color legend"
                    className="flex items-center gap-1.5 bg-white/95 hover:bg-white backdrop-blur-md border border-[#E2ECE4] hover:border-emerald-300 text-slate-700 hover:text-[#132A22] px-2.5 py-1.5 rounded-lg text-[10px] font-semibold shadow-md transition cursor-pointer active:scale-95"
                >
                    <div className="flex items-center -space-x-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                    </div>
                    <span>Risk Legend</span>
                    <ChevronUp className="w-3 h-3 text-slate-500" />
                </button>
            )}
        </div>
    );
};

export { RiskLegend };
export default RiskLegend;
