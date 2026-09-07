import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Mountain, Shield, Compass, LogOut, UserCheck } from "lucide-react";

export const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 rounded-xl group-hover:border-emerald-500/50 transition">
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
              {/* Role-Specific Navigation Links */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-medium">
                <Link
                  to="/dashboard"
                  className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  Trekker Trail
                </Link>
                {authUser.role === "authority" && (
                  <Link
                    to="/authority"
                    className="px-3 py-1.5 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition flex items-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    Authority Console
                  </Link>
                )}
              </div>

              {/* User Profile Badge */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <Link to="/profile" className="flex items-center gap-2 hover:bg-slate-800/50 p-1.5 rounded-xl transition">
                  <div className="text-right hidden md:block">
                    <div className="text-xs font-semibold text-slate-200">{authUser.username}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                      {authUser.organization || (authUser.role === "authority" ? "Forest Authority" : "Sahyadri Explorer")}
                    </div>
                  </div>

                  <div
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
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
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-950 transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

