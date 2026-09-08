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
    bg: "bg-emerald-500/10 border-emerald-500/40",
    icon: "text-emerald-400",
    bar: "bg-emerald-500",
  },
  error: {
    bg: "bg-rose-500/10 border-rose-500/40",
    icon: "text-rose-400",
    bar: "bg-rose-500",
  },
  warning: {
    bg: "bg-amber-500/10 border-amber-500/40",
    icon: "text-amber-400",
    bar: "bg-amber-500",
  },
  info: {
    bg: "bg-cyan-500/10 border-cyan-500/40",
    icon: "text-cyan-400",
    bar: "bg-cyan-500",
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
        flex items-start gap-3 px-4 py-3.5 rounded-2xl border backdrop-blur-xl
        shadow-2xl shadow-black/30 min-w-[300px] max-w-[420px]
        ${colors.bg}
        ${isExiting ? "animate-slide-down" : "animate-slide-up"}
      `}
      role="alert"
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${colors.icon}`} />
      <p className="text-sm text-slate-200 flex-1 leading-relaxed">{toast.message}</p>
      <button
        onClick={handleDismiss}
        className="text-slate-500 hover:text-slate-300 transition shrink-0 mt-0.5"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Auto-dismiss progress bar */}
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bar} opacity-40 rounded-full`}
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
