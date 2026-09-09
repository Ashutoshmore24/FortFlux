import { useEffect, useState } from "react";
import { useToastStore } from "../store/useToastStore";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

const ICON_MAP = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLOR_MAP = {
  success: {
    bg: "bg-white/95 border-emerald-300",
    icon: "text-emerald-600",
    bar: "bg-emerald-500",
  },
  error: {
    bg: "bg-white/95 border-rose-300",
    icon: "text-rose-600",
    bar: "bg-rose-500",
  },
  warning: {
    bg: "bg-white/95 border-amber-300",
    icon: "text-amber-600",
    bar: "bg-amber-500",
  },
  info: {
    bg: "bg-white/95 border-teal-300",
    icon: "text-teal-600",
    bar: "bg-teal-500",
  },
};

const ToastItem = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = ICON_MAP[toast.type] || Info;
  const colors = COLOR_MAP[toast.type] || COLOR_MAP.info;

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 280);
  };

  return (
    <div
      className={`
        relative flex items-start gap-3 px-4 py-3.5 rounded-2xl border backdrop-blur-xl
        shadow-lg min-w-[300px] max-w-[420px]
        ${colors.bg}
        ${isExiting ? "animate-slide-down" : "animate-slide-up"}
      `}
      role="alert"
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${colors.icon}`} />
      <p className="text-sm font-medium text-slate-800 flex-1 leading-relaxed">{toast.message}</p>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss toast"
        className="text-slate-400 hover:text-slate-700 transition shrink-0 mt-0.5 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Auto-dismiss progress bar */}
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full overflow-hidden bg-slate-100">
          <div
            className={`h-full ${colors.bar} rounded-full`}
            style={{
              animation: `toastProgress ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-2.5 pointer-events-auto">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
