import React, { useState, useRef, useEffect } from "react";
import { MoveHorizontal } from "lucide-react";

export default function ImageComparisonSlider({ beforeImageUrl, afterImageUrl, beforeLabel, afterLabel, caption }) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    const handleMove = (clientX) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(position);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        handleMove(e.clientX);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        handleMove(e.touches[0].clientX);
    };

    useEffect(() => {
        const handleMouseUp = () => setIsDragging(false);
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            window.addEventListener("touchmove", handleTouchMove, { passive: false });
            window.addEventListener("touchend", handleMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div className="flex flex-col gap-3">
            <div
                ref={containerRef}
                className="relative w-full aspect-video rounded-xl overflow-hidden select-none touch-none cursor-crosshair group ring-1 ring-[#E2ECE4] shadow-md"
                onMouseDown={(e) => {
                    setIsDragging(true);
                    handleMove(e.clientX);
                }}
                onTouchStart={(e) => {
                    setIsDragging(true);
                    handleMove(e.touches[0].clientX);
                }}
            >
                {/* After Image (Background) */}
                <div className="absolute inset-0">
                    <img
                        src={afterImageUrl}
                        alt={afterLabel}
                        className="w-full h-full object-cover"
                        draggable={false}
                    />
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 border border-[#E2ECE4] shadow-md">
                        {afterLabel}
                    </div>
                </div>

                {/* Before Image (Clipped overlay) */}
                <div
                    className="absolute inset-0 right-0 overflow-hidden bg-[#F5F8F4]"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                    <img
                        src={beforeImageUrl}
                        alt={beforeLabel}
                        className="absolute inset-0 w-full h-full object-cover max-w-none"
                        style={{ width: '100%', height: '100%' }}
                        draggable={false}
                    />
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 border border-[#E2ECE4] shadow-md">
                        {beforeLabel}
                    </div>
                </div>

                {/* Slider Handle */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize hover:bg-emerald-500 transition-colors duration-200"
                    style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-emerald-800 border border-[#E2ECE4]">
                        <MoveHorizontal className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {caption && (
                <p className="text-sm text-slate-600 text-center italic mt-2">
                    {caption}
                </p>
            )}
        </div>
    );
}
