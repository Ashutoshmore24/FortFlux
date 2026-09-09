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
        glow: "bg-emerald-500/10",
        iconBg: "bg-emerald-50",
        iconBorder: "border-emerald-300",
        iconText: "text-emerald-700",
        badge: "bg-emerald-50 text-emerald-800 border-emerald-300",
        progress: "bg-emerald-500",
        button: "from-emerald-600 to-teal-600 text-white",
        buttonHover: "hover:from-emerald-700 hover:to-teal-700",
        timer: "text-emerald-700",
      }
    : isFirstViolation
      ? {
          accent: "amber",
          glow: "bg-amber-500/10",
          iconBg: "bg-amber-50",
          iconBorder: "border-amber-300",
          iconText: "text-amber-700",
          badge: "bg-amber-50 text-amber-800 border-amber-300",
          progress: "bg-gradient-to-r from-amber-500 to-orange-500",
          button: "from-amber-600 to-orange-600 text-white",
          buttonHover: "hover:from-amber-700 hover:to-orange-700",
          timer: "text-amber-700",
        }
      : {
          accent: "rose",
          glow: "bg-rose-500/10",
          iconBg: "bg-rose-50",
          iconBorder: "border-rose-300",
          iconText: "text-rose-700",
          badge: "bg-rose-50 text-rose-800 border-rose-300",
          progress: "bg-gradient-to-r from-rose-500 to-red-500",
          button: "from-rose-600 to-red-600 text-white",
          buttonHover: "hover:from-rose-700 hover:to-red-700",
          timer: "text-rose-700",
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
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="
          relative w-full max-w-md
          overflow-hidden
          rounded-[28px]
          border border-[#E2ECE4]
          bg-white
          shadow-2xl
          animate-scale-in
        "
      >
        {/* Top Accent */}
        <div
          className={`absolute inset-x-0 top-0 h-[3px] ${
            isUnlocked
              ? "bg-gradient-to-r from-emerald-500 to-teal-500"
              : isFirstViolation
                ? "bg-gradient-to-r from-amber-500 to-orange-500"
                : "bg-gradient-to-r from-rose-500 to-red-500"
          }`}
        />

        {/* Ambient Glow */}
        <div
          className={`absolute -top-32 -right-32 h-72 w-72 rounded-full blur-[90px] pointer-events-none ${theme.glow}`}
          aria-hidden="true"
        />

        {/* Main Content */}
        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          {/* Security Header */}
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F8F4] border border-[#E2ECE4]">
                <Zap className="h-4 w-4 text-emerald-700" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700">
                  FortFlux Security
                </p>
                <p className="text-[11px] text-slate-500">
                  Request Protection Gateway
                </p>
              </div>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-2 rounded-full border border-[#E2ECE4] bg-[#F8FAF8] px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full ${
                    isUnlocked
                      ? "bg-emerald-500"
                      : isFirstViolation
                        ? "bg-amber-500"
                        : "bg-rose-500"
                  } opacity-60`}
                />
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    isUnlocked
                      ? "bg-emerald-500"
                      : isFirstViolation
                        ? "bg-amber-500"
                        : "bg-rose-500"
                  }`}
                />
              </span>

              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                Live
              </span>
            </div>
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Outer pulse */}
              <div
                className={`absolute -inset-5 rounded-full blur-2xl opacity-40 ${theme.glow} animate-pulse`}
              />

              {/* Ring */}
              <div
                className={`absolute -inset-2 rounded-[22px] border ${
                  theme.iconBorder
                } opacity-50`}
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
                  shadow-xs
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
              className="text-2xl sm:text-[27px] font-black tracking-tight text-[#132A22]"
            >
              {isUnlocked
                ? "Access Restored"
                : isFirstViolation
                  ? "Rate Limit Exceeded"
                  : "Security Lockout Active"}
            </h2>

            <p className="mx-auto mt-2.5 max-w-sm text-xs sm:text-sm leading-6 text-slate-600">
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
              border border-[#E2ECE4]
              bg-[#F8FAF8]
              p-5
            "
          >
            <div className="relative">
              {/* Timer Label */}
              <div className="flex items-center justify-center gap-2">
                {isUnlocked ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-slate-500" />
                )}

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
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
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 p-[2px]">
                  <div
                    className={`h-full rounded-full ${theme.progress} transition-all duration-1000 ease-linear`}
                    style={{
                      width: `${progressPercent}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-slate-500">
                    0s
                  </span>

                  <span className="rounded-full bg-white border border-[#E2ECE4] px-2.5 py-1 font-mono text-[9px] font-semibold text-slate-600 shadow-2xs">
                    {Math.round(progressPercent)}% elapsed
                  </span>

                  <span className="font-mono text-[9px] text-slate-500">
                    {initialDuration}s
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Violation Information */}
          {!isUnlocked && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-[#E2ECE4] bg-[#F8FAF8] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-4 w-4 text-slate-500" />

                <div>
                  <p className="text-[10px] font-bold text-slate-700">
                    Security events
                  </p>
                  <p className="text-[9px] text-slate-500">
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
                  shadow-md
                  transition-all duration-200
                  hover:scale-[1.01]
                  active:scale-[0.99]
                  cursor-pointer
                `}
              >
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
                  border border-[#E2ECE4]
                  bg-slate-100
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
                  <span className="font-mono font-bold text-slate-700">
                    {retryAfter}s
                  </span>{" "}
                  before retrying
                </span>
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-[#E2ECE4]" />

            <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-slate-400">
              Protected by Arcjet Security Gateway
            </p>

            <div className="h-px w-8 bg-[#E2ECE4]" />
          </div>
        </div>
      </div>
    </div>
  );
}
