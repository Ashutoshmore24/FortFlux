import { useEffect } from "react";
import { useRateLimitStore } from "../store/useRateLimitStore";
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  Lock,
  Unlock,
  Flame,
  Zap,
  CheckCircle2,
} from "lucide-react";

/**
 * Premium Rate Limit Security Modal
 *
 * Functionality intentionally preserved:
 * - Live countdown
 * - First violation = 1 minute
 * - Repeated violations = 5 minute lockout
 * - Progress calculation
 * - Store-driven unlock state
 * - Background scroll prevention
 */
export default function RateLimitModal() {
  const {
    isOpen,
    retryAfter,
    initialDuration,
    violationCount,
    message,
    isUnlocked,
    closeModal,
  } = useRateLimitStore();

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Format MM:SS
  const minutes = Math.floor(retryAfter / 60);
  const seconds = retryAfter % 60;

  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;

  // Progress calculation
  const progressPercent =
    initialDuration > 0
      ? Math.min(
          100,
          Math.max(0, ((initialDuration - retryAfter) / initialDuration) * 100),
        )
      : 100;

  const isFirstViolation = violationCount === 1;

  const theme = isUnlocked
    ? {
        accent: "emerald",
        glow: "bg-emerald-500/20",
        iconBg: "bg-emerald-500/10",
        iconBorder: "border-emerald-400/30",
        iconText: "text-emerald-400",
        badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
        progress: "bg-emerald-400",
        button: "from-emerald-400 via-teal-400 to-cyan-400",
        buttonHover:
          "hover:from-emerald-300 hover:via-teal-300 hover:to-cyan-300",
        timer: "text-emerald-400 drop-shadow-[0_0_25px_rgba(16,185,129,0.45)]",
      }
    : isFirstViolation
      ? {
          accent: "amber",
          glow: "bg-amber-500/20",
          iconBg: "bg-amber-500/10",
          iconBorder: "border-amber-400/30",
          iconText: "text-amber-400",
          badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
          progress:
            "bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400",
          button: "from-amber-400 via-orange-400 to-rose-400",
          buttonHover:
            "hover:from-amber-300 hover:via-orange-300 hover:to-rose-300",
          timer: "text-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.4)]",
        }
      : {
          accent: "rose",
          glow: "bg-rose-500/20",
          iconBg: "bg-rose-500/10",
          iconBorder: "border-rose-400/30",
          iconText: "text-rose-400",
          badge: "bg-rose-500/10 text-rose-300 border-rose-500/20",
          progress: "bg-gradient-to-r from-rose-500 via-red-500 to-orange-400",
          button: "from-rose-500 via-red-500 to-orange-400",
          buttonHover:
            "hover:from-rose-400 hover:via-red-400 hover:to-orange-300",
          timer: "text-rose-400 drop-shadow-[0_0_25px_rgba(244,63,94,0.45)]",
        };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 select-none animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rate-limit-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-2xl"
        aria-hidden="true"
      />

      {/* Background Grid */}
      <div
        className="fixed inset-0 opacity-[0.035]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Modal */}
      <div
        className="
          relative w-full max-w-md
          overflow-hidden
          rounded-[28px]
          border border-white/[0.08]
          bg-slate-900/95
          shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9)]
          backdrop-blur-3xl
          animate-scale-in
        "
      >
        {/* Top Accent */}
        <div
          className={`absolute inset-x-0 top-0 h-[2px] ${
            isUnlocked
              ? "bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400"
              : isFirstViolation
                ? "bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400"
                : "bg-gradient-to-r from-rose-500 via-red-500 to-orange-400"
          }`}
        />

        {/* Ambient Glow */}
        <div
          className={`absolute -top-32 -right-32 h-72 w-72 rounded-full blur-[90px] pointer-events-none ${theme.glow}`}
          aria-hidden="true"
        />

        <div
          className={`absolute -bottom-40 -left-40 h-72 w-72 rounded-full blur-[100px] pointer-events-none ${
            isUnlocked
              ? "bg-cyan-500/5"
              : isFirstViolation
                ? "bg-orange-500/5"
                : "bg-red-500/5"
          }`}
          aria-hidden="true"
        />

        {/* Main Content */}
        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          {/* Security Header */}
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.07]">
                <Zap className="h-4 w-4 text-slate-400" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  FortFlux Security
                </p>
                <p className="text-[11px] text-slate-600">
                  Request Protection Gateway
                </p>
              </div>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full ${
                    isUnlocked
                      ? "bg-emerald-400"
                      : isFirstViolation
                        ? "bg-amber-400"
                        : "bg-rose-400"
                  } opacity-60`}
                />
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    isUnlocked
                      ? "bg-emerald-400"
                      : isFirstViolation
                        ? "bg-amber-400"
                        : "bg-rose-400"
                  }`}
                />
              </span>

              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Live
              </span>
            </div>
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Outer pulse */}
              <div
                className={`absolute -inset-5 rounded-full blur-2xl opacity-50 ${theme.glow} animate-pulse`}
              />

              {/* Ring */}
              <div
                className={`absolute -inset-2 rounded-[22px] border ${
                  theme.iconBorder
                } opacity-40`}
              />

              {/* Icon Container */}
              <div
                className={`
                  relative flex h-[76px] w-[76px]
                  items-center justify-center
                  rounded-[22px]
                  border
                  ${theme.iconBg}
                  ${theme.iconBorder}
                  ${theme.iconText}
                  shadow-inner
                `}
              >
                {isUnlocked ? (
                  <ShieldCheck className="h-9 w-9 animate-bounce" />
                ) : isFirstViolation ? (
                  <Clock
                    className="h-9 w-9"
                    style={{
                      animation: "spin 12s linear infinite",
                    }}
                  />
                ) : (
                  <ShieldAlert className="h-9 w-9 animate-pulse" />
                )}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center mt-6">
            <span
              className={`
                inline-flex items-center gap-2
                rounded-full
                border
                px-3.5 py-1.5
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                ${theme.badge}
              `}
            >
              {isUnlocked ? (
                <>
                  <Unlock className="h-3.5 w-3.5" />
                  Cooldown Complete
                </>
              ) : isFirstViolation ? (
                <>
                  <Clock className="h-3.5 w-3.5" />
                  First Warning · 1 Min
                </>
              ) : (
                <>
                  <Flame className="h-3.5 w-3.5" />
                  Security Lockout · 5 Min
                </>
              )}
            </span>
          </div>

          {/* Heading */}
          <div className="text-center mt-4">
            <h2
              id="rate-limit-title"
              className="text-2xl sm:text-[27px] font-black tracking-tight text-white"
            >
              {isUnlocked
                ? "Access Restored"
                : isFirstViolation
                  ? "Rate Limit Exceeded"
                  : "Security Lockout Active"}
            </h2>

            <p className="mx-auto mt-2.5 max-w-sm text-xs sm:text-sm leading-6 text-slate-400">
              {isUnlocked
                ? "The security cooldown has completed. You can now safely resume your request."
                : message ||
                  (isFirstViolation
                    ? "Too many rapid requests were detected. Please wait before trying again."
                    : "Repeated rapid requests detected. A temporary security cooldown is currently active.")}
            </p>
          </div>

          {/* Timer Card */}
          <div
            className="
              relative mt-7
              overflow-hidden
              rounded-2xl
              border border-white/[0.07]
              bg-slate-950/70
              p-5
            "
          >
            {/* Timer subtle glow */}
            <div
              className={`absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-10 ${theme.glow}`}
            />

            <div className="relative">
              {/* Timer Label */}
              <div className="flex items-center justify-center gap-2">
                {isUnlocked ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-slate-500" />
                )}

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  {isUnlocked ? "Status · Unlocked" : "Time Remaining"}
                </span>
              </div>

              {/* Timer */}
              <div
                className={`
                  mt-2
                  text-center
                  font-mono
                  text-5xl sm:text-[56px]
                  font-black
                  tracking-[0.08em]
                  ${theme.timer}
                `}
              >
                {formattedTime}
              </div>

              {/* Progress */}
              <div className="mt-5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80 p-[2px]">
                  <div
                    className={`h-full rounded-full ${theme.progress} transition-all duration-1000 ease-linear`}
                    style={{
                      width: `${progressPercent}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-slate-600">
                    0s
                  </span>

                  <span className="rounded-full bg-white/[0.03] px-2.5 py-1 font-mono text-[9px] text-slate-500">
                    {Math.round(progressPercent)}% elapsed
                  </span>

                  <span className="font-mono text-[9px] text-slate-600">
                    {initialDuration}s
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Violation Information */}
          {!isUnlocked && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-4 w-4 text-slate-500" />

                <div>
                  <p className="text-[10px] font-semibold text-slate-400">
                    Security events
                  </p>
                  <p className="text-[9px] text-slate-600">
                    Rate limit violations detected
                  </p>
                </div>
              </div>

              <div
                className={`
                  min-w-8 rounded-lg border px-2 py-1
                  text-center font-mono text-xs font-bold
                  ${theme.badge}
                `}
              >
                {violationCount}
              </div>
            </div>
          )}

          {/* Action */}
          <div className="mt-5">
            {isUnlocked ? (
              <button
                type="button"
                onClick={closeModal}
                className={`
                  group relative w-full overflow-hidden
                  rounded-xl
                  bg-gradient-to-r ${theme.button}
                  ${theme.buttonHover}
                  px-4 py-3.5
                  text-sm font-bold
                  text-slate-950
                  shadow-lg
                  transition-all duration-200
                  hover:scale-[1.01]
                  active:scale-[0.99]
                `}
              >
                {/* Button shine */}
                <span className="absolute inset-0 -translate-x-full bg-white/20 skew-x-[-20deg] transition-transform duration-700 group-hover:translate-x-full" />

                <span className="relative flex items-center justify-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Dismiss & Resume
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="
                  flex w-full items-center justify-center gap-2.5
                  rounded-xl
                  border border-white/[0.06]
                  bg-slate-800/60
                  px-4 py-3.5
                  text-xs sm:text-sm
                  font-medium
                  text-slate-500
                  cursor-not-allowed
                "
              >
                <Lock className="h-4 w-4 animate-pulse" />

                <span>
                  Please wait{" "}
                  <span className="font-mono font-bold text-slate-400">
                    {retryAfter}s
                  </span>{" "}
                  before retrying
                </span>
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-slate-800" />

            <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-slate-600">
              Protected by Arcjet Security Gateway
            </p>

            <div className="h-px w-8 bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
