import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="
        fixed bottom-6 left-6 z-[9998]
        w-11 h-11 rounded-2xl
        bg-white/90 backdrop-blur-xl border border-[#E2ECE4]
        text-slate-700 hover:text-emerald-700
        hover:border-emerald-400 hover:bg-white
        shadow-lg
        flex items-center justify-center
        transition-all duration-300 cursor-pointer
        animate-fade-in-up
        hover:scale-105 active:scale-95
      "
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};

export default ScrollToTop;
