import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
                <p className="text-emerald-400 font-semibold mb-1">Year: {label}</p>
                <p className="text-slate-200">
                    <span className="font-medium text-slate-400">Severity: </span>
                    <span className={data.severityIndex >= 7 ? "text-red-400" : data.severityIndex >= 4 ? "text-yellow-400" : "text-emerald-400"}>
                        {data.severityIndex} / 10
                    </span>
                </p>
                {data.notes && (
                    <p className="text-slate-400 text-sm mt-2 italic max-w-xs">"{data.notes}"</p>
                )}
            </div>
        );
    }
    return null;
};

export default function ErosionChart({ data }) {
    if (!data || data.length === 0) return null;

    return (
        <div className="w-full h-72 sm:h-80 md:h-96">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorSeverity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis 
                        dataKey="year" 
                        stroke="#94a3b8" 
                        tick={{ fill: '#94a3b8' }}
                        tickLine={{ stroke: '#475569' }}
                    />
                    <YAxis 
                        domain={[0, 10]} 
                        stroke="#94a3b8" 
                        tick={{ fill: '#94a3b8' }}
                        tickLine={{ stroke: '#475569' }}
                        label={{ value: 'Severity (1-10)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="severityIndex"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorSeverity)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#34d399' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
