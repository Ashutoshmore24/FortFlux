import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useWeatherStore } from "../store/useWeatherStore";
import { getSocket } from "../lib/socket";
import { Mountain, Shield, Compass, LogOut, UserCheck, Menu, X, Wifi, WifiOff, History, User } from "lucide-react";

export const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const selectedFortSlug = useWeatherStore((state) => state.selectedFortSlug) || "rajgad";
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // Socket connection status
  const socket = getSocket();
  const isConnected = socket?.connected;
  const avatarSrc = authUser?.avatarUrl || authUser?.profilePic;

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-[#E2ECE4] shadow-xs">
      {/* Subtle bottom environmental glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-600/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-emerald-600/30 p-0.5 bg-white shadow-sm shadow-emerald-700/10 group-hover:border-emerald-600/60 group-hover:scale-105 transition-all duration-300 ring-2 ring-emerald-600/15 shrink-0 flex items-center justify-center">
            <img
              src="/fortflux_logo.jpeg"
              alt="FortFlux Logo"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/logo.png";
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-[#132A22] tracking-tight group-hover:text-emerald-700 transition-colors">FortFlux</span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-[#52685E] font-medium leading-none">Sahyadri Eco-Monitor</p>
          </div>
        </Link>

        {/* Navigation / User Controls */}
        <div className="flex items-center gap-3">
          {authUser ? (
            <>
              {/* Desktop Navigation Links */}
              <div className="hidden sm:flex items-center gap-1 bg-[#F0F4F1] border border-[#E2ECE4] p-1 rounded-xl text-xs font-medium">
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200 ${
                    isActive("/dashboard")
                      ? "bg-white text-emerald-800 border border-[#D1E3D5] shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent"
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  Trekker Trail
                </Link>
                <Link
                  to={`/forts/${selectedFortSlug}/history`}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200 ${
                    location.pathname.includes("/history")
                      ? "bg-white text-purple-900 border border-purple-200 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent"
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-purple-600" />
                  Fort History
                </Link>
                {authUser.role === "authority" && (
                  <Link
                    to="/authority"
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200 ${
                      isActive("/authority")
                        ? "bg-white text-amber-900 border border-amber-300 shadow-xs font-semibold"
                        : "text-amber-800 hover:text-amber-950 hover:bg-amber-100/50 border border-transparent"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    Authority Console
                  </Link>
                )}
              </div>

              {/* Connection Status Dot */}
              <div className="hidden sm:flex items-center" title={isConnected ? "Live connection active" : "Reconnecting..."}>
                <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                  isConnected
                    ? "bg-emerald-500 shadow-xs shadow-emerald-500/50"
                    : "bg-amber-500 animate-pulse"
                }`} />
              </div>

              {/* User Profile Badge */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E2ECE4]">
                <Link to="/profile" className="flex items-center gap-2.5 hover:bg-[#F2F7F4] p-1.5 rounded-xl transition-all duration-200 group">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={authUser.username}
                      className="w-8 h-8 rounded-full object-cover border border-emerald-500/40 group-hover:border-emerald-600 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#E8F0EA] border border-[#D5E2D8] flex items-center justify-center text-emerald-800 group-hover:text-emerald-950 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}

                  <div className="text-right hidden md:block">
                    <div className="text-xs font-bold text-[#132A22] group-hover:text-emerald-800 transition-colors">{authUser.username}</div>
                    <div className="text-[10px] text-[#52685E] font-medium truncate max-w-[150px]">
                      {authUser.organization || (authUser.role === "authority" ? "Forest Authority" : "Sahyadri Explorer")}
                    </div>
                  </div>

                  <div
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all duration-200 ${
                      authUser.role === "authority"
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : "bg-emerald-50 border-emerald-200 text-emerald-800"
                    }`}
                  >
                    {authUser.role === "authority" ? (
                      <>
                        <Shield className="w-3 h-3 text-amber-600" />
                        <span>Authority</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        <span>Trekker</span>
                      </>
                    )}
                  </div>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-800 rounded-xl hover:bg-slate-100 transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-700/20 transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Slide-Down Menu */}
      {authUser && isMobileMenuOpen && (
        <div className="sm:hidden bg-white/95 backdrop-blur-xl border-t border-[#E2ECE4] shadow-lg animate-fade-in-down">
          <div className="px-4 py-4 space-y-2">
            {/* Connection Status */}
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 bg-[#F5F8F4] rounded-lg">
              {isConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Live connection active</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-amber-700 font-medium">Reconnecting...</span>
                </>
              )}
            </div>

            {/* Nav Links */}
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive("/dashboard")
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold"
                  : "text-slate-700 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              Trekker Trail Dashboard
            </Link>

            <Link
              to={`/forts/${selectedFortSlug}/history`}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                location.pathname.includes("/history")
                  ? "bg-purple-50 text-purple-900 border border-purple-200 font-semibold"
                  : "text-slate-700 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <History className="w-4 h-4 text-purple-600" />
              Fort Heritage & History
            </Link>

            {authUser.role === "authority" && (
              <Link
                to="/authority"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive("/authority")
                    ? "bg-amber-50 text-amber-950 border border-amber-200 font-semibold"
                    : "text-amber-900 hover:bg-amber-50 border border-transparent"
                }`}
              >
                <Shield className="w-4 h-4 text-amber-600" />
                Authority Command Center
              </Link>
            )}

            <Link
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive("/profile")
                  ? "bg-slate-100 text-slate-900 border border-slate-200 font-semibold"
                  : "text-slate-700 hover:bg-slate-50 border border-transparent"
              }`}
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={authUser.username}
                  className="w-5 h-5 rounded-full object-cover border border-emerald-500/40 shrink-0"
                />
              ) : (
                <User className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              Profile — {authUser.username}
            </Link>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
