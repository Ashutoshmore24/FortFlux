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
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-4 text-amber-600">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black text-[#132A22] mb-2">Restricted Authority Area</h2>
        <p className="text-slate-600 max-w-md mb-6 text-sm leading-relaxed">
          Your current account role is <span className="font-bold text-emerald-700 capitalize">{authUser.role}</span>.
          Access to structural hazard controls, carrying capacity throttles, and trail closure tools is restricted to verified Fort Authorities & Forest Rangers.
        </p>
        <a
          href="/dashboard"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition"
        >
          Return to Trekker Dashboard
        </a>
      </div>
    );
  }

  return <Outlet />;
};

export default RoleRoute;

