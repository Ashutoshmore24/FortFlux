import React from "react";

export default function Timeline({ events }) {
    if (!events || events.length === 0) return null;

    return (
        <div className="relative border-l-2 border-emerald-200 ml-3 md:ml-6 mt-4">
            {events.map((event, index) => (
                <div key={index} className="mb-8 ml-6 group">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-white rounded-full -left-[13px] ring-4 ring-[#F5F8F4] border-2 border-emerald-500 group-hover:border-emerald-700 transition-colors duration-300 shadow-xs">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    </span>
                    <h3 className="flex items-center mb-1 text-lg font-bold text-[#132A22]">
                        {event.title}
                    </h3>
                    <time className="inline-block mb-2 text-xs font-bold tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        {event.year}
                    </time>
                    <p className="text-sm font-normal text-slate-700 leading-relaxed">
                        {event.description}
                    </p>
                </div>
            ))}
        </div>
    );
}
