import React from "react";

export default function Timeline({ events }) {
    if (!events || events.length === 0) return null;

    return (
        <div className="relative border-l border-emerald-500/30 ml-3 md:ml-6 mt-4">
            {events.map((event, index) => (
                <div key={index} className="mb-8 ml-6 group">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-slate-900 rounded-full -left-3 ring-4 ring-slate-950 border border-emerald-500/50 group-hover:bg-emerald-500/20 transition-colors duration-300">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    </span>
                    <h3 className="flex items-center mb-1 text-lg font-semibold text-emerald-400">
                        {event.title}
                    </h3>
                    <time className="block mb-2 text-sm font-normal leading-none text-slate-400">
                        {event.year}
                    </time>
                    <p className="text-base font-normal text-slate-300">
                        {event.description}
                    </p>
                </div>
            ))}
        </div>
    );
}
