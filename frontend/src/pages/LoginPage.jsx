import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Mountain, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Compass, Shield, CheckCircle2 } from "lucide-react";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoggingIn, googleLogin, isGoogleLoggingIn, authError, clearError, authUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (authUser) {
      if (authUser.role === "authority") {
        navigate("/authority");
      } else {
        navigate("/dashboard");
      }
    }
  }, [authUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(formData);
  };

  const handleGoogleLogin = async () => {
    await googleLogin();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-[#F5F8F4]">
      {/* Environmental Ambient Gradients & Mist Textures */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.05] blur-3xl animate-gradient-shift" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-teal-500/[0.04] blur-3xl animate-gradient-shift" style={{ animationDelay: "3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-amber-500/[0.03] blur-3xl animate-gradient-shift" style={{ animationDelay: "6s" }} />
      </div>

      {/* Main Login Container with Sahyadri Photography Showcase */}
      <div className="w-full max-w-4xl bg-white border border-[#E2ECE4] rounded-3xl shadow-xl overflow-hidden relative grid grid-cols-1 md:grid-cols-12 animate-scale-in">

        {/* Left Col: Sahyadri Landscape Hero Banner */}
        <div className="hidden md:flex md:col-span-5 relative overflow-hidden flex-col justify-between p-8 text-white">
          {/* Background Photography with Natural Lighting & Mist Gradient */}
          <img
            src="/forts/rajgad.jpg"
            alt="Rajgad Fort Sahyadri"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Subtle mist overlay to guarantee readable text while keeping natural landscape visible */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d2a1d]/90 via-[#0d2a1d]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0d2a1d]/20 to-[#0d2a1d]/60" />

          {/* Top Pill */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold shadow-xs">
              <Compass className="w-3.5 h-3.5 text-emerald-300" />
              Sahyadri Heritage & Safety
            </span>
          </div>

          {/* Bottom Hero Description */}
          <div className="relative z-10 space-y-2">
            <h3 className="text-xl font-extrabold text-white tracking-tight leading-snug">
              Micro-Climate Resilience & Dynamic Trail Intelligence
            </h3>
            <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
              Real-time erosion forecasting, crowdsourced hazard telemetry, and safe adaptive routing across 18 living Western Ghat fortifications.
            </p>
            <div className="pt-2 flex items-center gap-3 text-[11px] text-emerald-200/90 font-medium">
              <span>📍 Rajgad</span>
              <span>•</span>
              <span>📍 Sinhagad</span>
              <span>•</span>
              <span>📍 Torna</span>
            </div>
          </div>
        </div>

        {/* Right Col: Login Form Card */}
        <div className="col-span-1 md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white relative">
          {/* Decorative Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600" />

          {/* Heading */}
          <div className="text-center mb-6">
            <div className="inline-flex mb-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-600/30 p-0.5 bg-white shadow-md shadow-emerald-700/10 ring-4 ring-emerald-600/10 animate-float flex items-center justify-center">
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
            </div>
            <h1 className="text-2xl font-extrabold text-[#132A22] tracking-tight">Welcome Back</h1>
            <p className="text-xs text-[#52685E] mt-1 font-medium">
              Sign in to access your Sahyadri environmental portal
            </p>
          </div>

          {/* Error Alert */}
          {authError && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-800 text-xs animate-fade-in-up">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{authError}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoggingIn || isLoggingIn}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl shadow-xs transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer"
          >
            {isGoogleLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Signing in with Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#E2ECE4]" />
            <span className="text-[11px] text-[#52685E] font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-[#E2ECE4]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="animate-fade-in-up delay-100">
              <label className="block text-xs font-semibold text-[#132A22] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="ranger@sahyadri.gov.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAF8] border border-[#D5E2D8] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition-all duration-200"
                />
              </div>
            </div>

            <div className="animate-fade-in-up delay-200">
              <label className="block text-xs font-semibold text-[#132A22] mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAF8] border border-[#D5E2D8] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn || isGoogleLoggingIn}
              className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 hover:shadow-lg hover:shadow-emerald-700/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] cursor-pointer animate-fade-in-up delay-300"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign In to FortFlux"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-[#52685E]">
            Don't have an account?{" "}
            <Link to="/signup" className="text-emerald-700 hover:text-emerald-800 font-bold transition">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
