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
    <header className="sticky top-0 z-50 bg-slate-950/70 backdrop-blur-xl border-b border-slate-800/60">
      {/* Subtle bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 rounded-xl group-hover:border-emerald-500/50 group-hover:shadow-lg group-hover:shadow-emerald-500/10 transition-all duration-300">
            <Mountain className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">FortFlux</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none">Sahyadri Eco-Monitor</p>
          </div>
        </Link>

        {/* Navigation / User Controls */}
        <div className="flex items-center gap-3">
          {authUser ? (
            <>
              {/* Desktop Navigation Links */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 border border-slate-800 p-1 rounded-xl text-xs font-medium">
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200 ${
                    isActive("/dashboard")
                      ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent"
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  Trekker Trail
                </Link>
                <Link
                  to={`/forts/${selectedFortSlug}/history`}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200 ${
                    location.pathname.includes("/history")
                      ? "bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent"
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-purple-400" />
                  Fort History
                </Link>
                {authUser.role === "authority" && (
                  <Link
                    to="/authority"
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200 ${
                      isActive("/authority")
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-amber-300/70 hover:text-amber-200 hover:bg-amber-500/10 border border-transparent"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    Authority Console
                  </Link>
                )}
              </div>

              {/* Connection Status Dot */}
              <div className="hidden sm:flex items-center" title={isConnected ? "Live connection active" : "Reconnecting..."}>
                <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  isConnected
                    ? "bg-emerald-400 shadow-sm shadow-emerald-400/50"
                    : "bg-amber-400 animate-pulse"
                }`} />
              </div>

              {/* User Profile Badge */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
                <Link to="/profile" className="flex items-center gap-2.5 hover:bg-slate-800/50 p-1.5 rounded-xl transition-all duration-200 group">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={authUser.username}
                      className="w-8 h-8 rounded-full object-cover border border-emerald-500/40 group-hover:border-emerald-400 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-slate-300 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}

                  <div className="text-right hidden md:block">
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">{authUser.username}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                      {authUser.organization || (authUser.role === "authority" ? "Forest Authority" : "Sahyadri Explorer")}
                    </div>
                  </div>

                  <div
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all duration-200 ${
                      authUser.role === "authority"
                        ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                        : "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
                    }`}
                  >
                    {authUser.role === "authority" ? (
                      <>
                        <Shield className="w-3 h-3 text-amber-400" />
                        <span>Authority</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3 h-3 text-cyan-400" />
                        <span>Trekker</span>
                      </>
                    )}
                  </div>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-950 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-900/40"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Slide-Down Menu */}
      {authUser && isMobileMenuOpen && (
        <div className="sm:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 animate-fade-in-down">
          <div className="px-4 py-4 space-y-2">
            {/* Connection Status */}
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400">
              {isConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Live connection active</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-400">Reconnecting...</span>
                </>
              )}
            </div>

            {/* Nav Links */}
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive("/dashboard")
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-300 hover:bg-slate-800 border border-transparent"
              }`}
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              Trekker Trail Dashboard
            </Link>

            <Link
              to={`/forts/${selectedFortSlug}/history`}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                location.pathname.includes("/history")
                  ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                  : "text-slate-300 hover:bg-slate-800 border border-transparent"
              }`}
            >
              <History className="w-4 h-4 text-purple-400" />
              Fort Heritage & History
            </Link>

            {authUser.role === "authority" && (
              <Link
                to="/authority"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive("/authority")
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    : "text-amber-300/70 hover:bg-amber-500/10 border border-transparent"
                }`}
              >
                <Shield className="w-4 h-4 text-amber-400" />
                Authority Command Center
              </Link>
            )}

            <Link
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive("/profile")
                  ? "bg-slate-700/50 text-white border border-slate-600"
                  : "text-slate-300 hover:bg-slate-800 border border-transparent"
              }`}
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={authUser.username}
                  className="w-5 h-5 rounded-full object-cover border border-emerald-500/40 shrink-0"
                />
              ) : (
                <User className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              Profile — {authUser.username}
            </Link>

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
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
