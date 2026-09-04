import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { ShieldAlert } from "lucide-react";

export const RoleRoute = ({ allowedRoles = ["authority", "admin"] }) => {
  const { authUser, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) return null;

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(authUser.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-4 text-amber-400">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Restricted Authority Area</h2>
        <p className="text-slate-400 max-w-md mb-6 text-sm">
          Your current account role is <span className="font-semibold text-emerald-400 capitalize">{authUser.role}</span>.
          Access to structural hazard controls, carrying capacity throttles, and trail closure tools is restricted to verified Fort Authorities & Forest Rangers.
        </p>
        <a
          href="/dashboard"
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition"
        >
          Return to Trekker Dashboard
        </a>
      </div>
    );
  }

  return <Outlet />;
};

export default RoleRoute;

