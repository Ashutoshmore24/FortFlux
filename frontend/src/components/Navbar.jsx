import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useWeatherStore } from "../store/useWeatherStore";
import { getSocket, connectSocket } from "../lib/socket";
import {
  Shield,
  Compass,
  LogOut,
  UserCheck,
  Menu,
  X,
  Wifi,
  WifiOff,
  History,
  User,
  Award,
  ChevronRight,
} from "lucide-react";

export const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const selectedFortSlug = useWeatherStore((state) => state.selectedFortSlug) || "rajgad";
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Reactive Socket Connection State
  const [isConnected, setIsConnected] = useState(() => {
    const s = getSocket();
    return !!s?.connected;
  });

  useEffect(() => {
    // If authenticated but socket not yet initialized, initiate connection
    if (authUser && !getSocket()) {
      connectSocket();
    }

    const updateStatus = () => {
      const s = getSocket();
      setIsConnected(!!s?.connected);
    };

    updateStatus();

    // Listen to window-level custom socket events
    const handleCustomConn = (e) => {
      setIsConnected(!!e.detail?.connected);
    };
    window.addEventListener("socket:connection", handleCustomConn);

    // Also attach directly to socket if available
    const socket = getSocket();
    if (socket) {
      socket.on("connect", updateStatus);
      socket.on("disconnect", updateStatus);
    }

    // Polling heartbeat (every 1s) to immediately reflect connection state
    const timer = setInterval(updateStatus, 1000);

    return () => {
      window.removeEventListener("socket:connection", handleCustomConn);
      if (socket) {
        socket.off("connect", updateStatus);
        socket.off("disconnect", updateStatus);
      }
      clearInterval(timer);
    };
  }, [authUser]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;
  const avatarSrc = authUser?.avatarUrl || authUser?.profilePic;

  return (
    <header
      className={`sticky top-0 z-50 text-white transition-all duration-300 ${
        isScrolled
          ? "bg-black/35 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.25)]"
          : "bg-black/15 backdrop-blur-xl backdrop-saturate-150 border-b border-white/[0.08] shadow-[0_2px_15px_rgba(0,0,0,0.15)]"
      }`}
    >
      {/* Top Specular Edge Highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* ── Brand Logo & Title ── */}
        <Link
          to="/"
          className="flex items-center gap-3 group shrink-0"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-emerald-400/40 p-0.5 bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:border-emerald-300 group-hover:scale-105 transition-all duration-300 ring-2 ring-emerald-500/20 shrink-0 flex items-center justify-center">
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
              <span className="font-extrabold text-xl text-white tracking-tight group-hover:text-emerald-300 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                FortFlux
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 backdrop-blur-md shadow-xs">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-black font-semibold leading-none tracking-wide">
  Sahyadri Eco-Monitor
</p>

          </div>
        </Link>

        {/* ── Navigation Links (Centered Glass Capsule) ── */}
        {authUser ? (
          /* Authenticated Navigation */
          <nav className="hidden sm:flex items-center gap-1.5 bg-black/40 backdrop-blur-2xl border border-white/15 p-1.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)] text-xs font-medium">
            <Link
              to="/dashboard"
              className={`px-4 py-1.5 rounded-full flex items-center gap-2 transition-all duration-300 ${
                isActive("/dashboard")
                  ? "bg-gradient-to-r from-emerald-600/70 to-teal-600/70 text-white font-bold border border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                  : "text-slate-200 hover:text-white hover:bg-white/15 drop-shadow-xs"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              Dashboard
            </Link>

            <Link
              to={`/forts/${selectedFortSlug}/history`}
              className={`px-4 py-1.5 rounded-full flex items-center gap-2 transition-all duration-300 ${
                location.pathname.includes("/history")
                  ? "bg-gradient-to-r from-purple-600/70 to-indigo-600/70 text-white font-bold border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.35)]"
                  : "text-slate-200 hover:text-white hover:bg-white/15 drop-shadow-xs"
              }`}
            >
              <History className="w-3.5 h-3.5 text-purple-400" />
              Fort History
            </Link>

            {authUser.role === "authority" && (
              <Link
                to="/authority"
                className={`px-4 py-1.5 rounded-full flex items-center gap-2 transition-all duration-300 ${
                  isActive("/authority")
                    ? "bg-gradient-to-r from-amber-600/70 to-orange-600/70 text-white font-bold border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.35)]"
                    : "text-amber-200 hover:text-white hover:bg-white/15 drop-shadow-xs"
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Authority Console
              </Link>
            )}
          </nav>
        ) : (
          /* Unauthenticated Navigation: Glass Capsule to 18 Forts */
          <nav className="hidden md:flex items-center">
            <Link
              to="/forts/rajgad/history"
              className="px-4 py-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 backdrop-blur-2xl text-xs font-semibold text-slate-100 hover:text-white shadow-[0_4px_16px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all duration-300 flex items-center gap-2"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              18 Heritage Fortresses
            </Link>
          </nav>
        )}

        {/* ── Right Controls: Telemetry Mesh & Minimal Profile ── */}
        <div className="flex items-center gap-2.5">

          {/* Minimal Authenticated Profile: ONLY User Icon + Badge Beside It */}
          {authUser ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                title={`Profile: ${authUser.username} (${authUser.role})`}
                className="flex items-center gap-2 bg-black/40 hover:bg-black/60 border border-white/15 backdrop-blur-2xl p-1 pr-2.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all duration-300 group"
              >
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={authUser.username}
                    className="w-7 h-7 rounded-full object-cover border-2 border-emerald-400/60 group-hover:border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.4)] shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-950/90 border border-emerald-400/50 flex items-center justify-center text-emerald-300 group-hover:text-emerald-100 shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Role Badge Beside Icon */}
                <div
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 border capitalize tracking-wider ${
                    authUser.role === "authority"
                      ? "bg-amber-500/30 border-amber-400/50 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                      : "bg-emerald-500/30 border-emerald-400/50 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  }`}
                >
                  {authUser.role === "authority" ? (
                    <Shield className="w-3 h-3 text-amber-300" />
                  ) : (
                    <UserCheck className="w-3 h-3 text-emerald-300" />
                  )}
                  <span>{authUser.role}</span>
                </div>
              </Link>

              {/* Logout Button */}
<button
  type="button"
  onClick={handleLogout}
  title="Sign Out"
  className="p-2 text-slate-900 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/10 rounded-full transition-all duration-200 cursor-pointer"
>
  <LogOut className="w-4 h-4" />
</button>

            </div>
          ) : (
            /* Unauthenticated Visitor Buttons */
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-1.5 text-xs font-semibold text-slate-100 hover:text-white rounded-full bg-black/30 hover:bg-black/50 border border-white/15 backdrop-blur-xl shadow-xs transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-full border border-emerald-300/40 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2 text-slate-200 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* ── Mobile Slide-Down Drawer ── */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-[#071911]/95 backdrop-blur-2xl border-t border-white/[0.08] text-white shadow-2xl animate-fade-in-down">
          <div className="px-4 py-4 space-y-3">
            
            {/* User or Visitor Header in Mobile */}
            {authUser ? (
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={authUser.username}
                      className="w-8 h-8 rounded-full object-cover border border-emerald-500/40 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold text-white">{authUser.username}</div>
                    <div className="text-[10px] text-emerald-400 capitalize">{authUser.role}</div>
                  </div>
                </div>

                <div
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                    authUser.role === "authority"
                      ? "bg-amber-500/20 border-amber-400/40 text-amber-300"
                      : "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                  }`}
                >
                  {authUser.role}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="text-xs font-bold text-white">Sahyadri Heritage Platform</div>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile Nav Links */}
            <div className="space-y-1">
              {authUser ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive("/dashboard")
                        ? "bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/40"
                        : "text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Compass className="w-4 h-4 text-emerald-400" />
                      Dashboard
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  {authUser.role === "authority" && (
                    <Link
                      to="/authority"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                        isActive("/authority")
                          ? "bg-amber-600/30 text-amber-300 font-bold border border-amber-500/40"
                          : "text-amber-200 hover:bg-white/5"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Shield className="w-4 h-4 text-amber-400" />
                        Authority Command Center
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  )}

                  <Link
                    to={`/forts/${selectedFortSlug}/history`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                      location.pathname.includes("/history")
                        ? "bg-purple-600/30 text-purple-300 font-bold border border-purple-500/40"
                        : "text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <History className="w-4 h-4 text-purple-400" />
                      Fort History
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive("/profile")
                        ? "bg-white/10 text-white font-bold border border-white/20"
                        : "text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-slate-300" />
                      Profile Settings
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                </>
              ) : (
                <Link
                  to="/forts/rajgad/history"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/5"
                >
                  <span className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    18 Heritage Fortresses
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              )}
            </div>

            {/* Mobile Footer Action */}
            <div className="pt-2 border-t border-white/10">
              {authUser ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 border border-rose-500/30 hover:bg-rose-950/60 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-2 text-center rounded-xl bg-white/10 text-white text-xs font-semibold"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-2 text-center rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
