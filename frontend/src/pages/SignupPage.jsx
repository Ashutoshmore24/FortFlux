import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Mountain, Mail, Lock, User, Eye, EyeOff, Shield, Compass, Building, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "trekker",
    organization: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { signup, isSigningUp, authError, clearError, authUser } = useAuthStore();
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
    await signup(formData);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-3 text-emerald-400">
            <Mountain className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Your Account</h1>
          <p className="text-xs text-slate-400 mt-1">
            Join FortFlux to monitor and safeguard the Sahyadri trails
          </p>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Switcher Cards */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Your Access Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Trekker Role Card */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "trekker" })}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between relative ${
                  formData.role === "trekker"
                    ? "bg-cyan-500/10 border-cyan-500/60 shadow-lg shadow-cyan-950/40"
                    : "bg-slate-950/40 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100"
                }`}
              >
                {formData.role === "trekker" && (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 absolute top-3 right-3" />
                )}
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-cyan-500/20 text-cyan-300 rounded-xl">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Trekker / Public</h3>
                    <span className="text-[10px] text-cyan-400 font-medium">Visitor Access</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Real-time trail safety, live risk heatmaps & photo degradation uploads.
                </p>
              </button>

              {/* Authority Role Card */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "authority" })}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between relative ${
                  formData.role === "authority"
                    ? "bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-950/40"
                    : "bg-slate-950/40 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100"
                }`}
              >
                {formData.role === "authority" && (
                  <CheckCircle2 className="w-4 h-4 text-amber-400 absolute top-3 right-3" />
                )}
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Park Authority</h3>
                    <span className="text-[10px] text-amber-400 font-medium">Official Console</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Cistern overflow matrix, trail closures & carrying capacity throttle.
                </p>
              </button>
            </div>
          </div>

          {/* Conditional Organization Field for Authority */}
          {formData.role === "authority" && (
            <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-2xl animate-in fade-in duration-200">
              <label className="block text-xs font-semibold text-amber-300 mb-1.5">
                Department / Authority Organization
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Building className="w-4 h-4 text-amber-400/70" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra Forest Dept, ASI Western Circle"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                />
              </div>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Name or Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="Tanaji Malusare"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="tanaji@sahyadri.org"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password (at least 6 characters)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSigningUp}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/60 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningUp ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering Account...
              </>
            ) : (
              `Create ${formData.role === "authority" ? "Authority" : "Trekker"} Account`
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already registered?{" "}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

