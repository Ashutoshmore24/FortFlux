import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Mountain, Mail, Lock, User, Eye, EyeOff, Shield, Compass, Building, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "trekker",
    organization: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { signup, isSigningUp, googleLogin, isGoogleLoggingIn, authError, clearError, authUser } = useAuthStore();
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

  const handleGoogleSignup = async () => {
    await googleLogin();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-[#F5F8F4]">
      {/* Environmental Ambient Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-teal-500/[0.04] blur-3xl animate-gradient-shift" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.05] blur-3xl animate-gradient-shift" style={{ animationDelay: "3s" }} />
        <div className="absolute top-1/3 right-1/3 w-[350px] h-[350px] rounded-full bg-amber-500/[0.03] blur-3xl animate-gradient-shift" style={{ animationDelay: "5s" }} />
      </div>

      {/* Signup Card */}
      <div className="w-full max-w-xl bg-white border border-[#E2ECE4] rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden animate-scale-in">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600" />

        {/* Header */}
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
          <h1 className="text-2xl font-extrabold text-[#132A22] tracking-tight">Create Your Account</h1>
          <p className="text-xs text-[#52685E] mt-1 font-medium">
            Join FortFlux to monitor and safeguard the Sahyadri trails
          </p>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-800 text-xs animate-fade-in-up">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-medium">{authError}</span>
          </div>
        )}

        {/* Google Sign-Up Button */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={isGoogleLoggingIn || isSigningUp}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl shadow-xs transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer"
        >
          {isGoogleLoggingIn ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Signing up with Google...</span>
            </>
          ) : (
            <>
              <GoogleIcon />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#E2ECE4]" />
          <span className="text-[11px] text-[#52685E] font-medium">or register with email</span>
          <div className="flex-1 h-px bg-[#E2ECE4]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Switcher Cards */}
          <div className="animate-fade-in-up delay-100">
            <label className="block text-xs font-semibold text-[#132A22] mb-2">
              Select Your Access Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Trekker Role Card */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "trekker" })}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative cursor-pointer hover-lift ${
                  formData.role === "trekker"
                    ? "bg-emerald-50/80 border-emerald-500 shadow-sm"
                    : "bg-[#F8FAF8] border-[#D5E2D8] hover:border-emerald-300"
                }`}
              >
                {formData.role === "trekker" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute top-3 right-3" />
                )}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <Compass className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#132A22]">Trekker / Public</h3>
                    <span className="text-[10px] text-emerald-700 font-semibold">Visitor Access</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#52685E] leading-relaxed font-medium">
                  Real-time trail safety, live risk heatmaps & photo degradation uploads.
                </p>
              </button>

              {/* Authority Role Card */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "authority" })}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative cursor-pointer hover-lift ${
                  formData.role === "authority"
                    ? "bg-amber-50/80 border-amber-500 shadow-sm"
                    : "bg-[#F8FAF8] border-[#D5E2D8] hover:border-amber-300"
                }`}
              >
                {formData.role === "authority" && (
                  <CheckCircle2 className="w-4 h-4 text-amber-600 absolute top-3 right-3" />
                )}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                    <Shield className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#132A22]">Park Authority</h3>
                    <span className="text-[10px] text-amber-700 font-semibold">Official Console</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#52685E] leading-relaxed font-medium">
                  Cistern overflow matrix, trail closures & carrying capacity throttle.
                </p>
              </button>
            </div>
          </div>

          {/* Conditional Organization Field for Authority */}
          {formData.role === "authority" && (
            <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-2xl animate-fade-in-up">
              <label className="block text-xs font-semibold text-amber-900 mb-1.5">
                Department / Authority Organization
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-700">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra Forest Dept, ASI Western Circle"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Username */}
          <div className="animate-fade-in-up delay-200">
            <label className="block text-xs font-semibold text-[#132A22] mb-1.5">
              Full Name or Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="Tanaji Malusare"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAF8] border border-[#D5E2D8] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition-all duration-200"
              />
            </div>
          </div>

          {/* Email */}
          <div className="animate-fade-in-up delay-300">
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
                placeholder="tanaji@sahyadri.org"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAF8] border border-[#D5E2D8] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition-all duration-200"
              />
            </div>
          </div>

          {/* Password */}
          <div className="animate-fade-in-up delay-400">
            <label className="block text-xs font-semibold text-[#132A22] mb-1.5">
              Password (at least 6 characters)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSigningUp || isGoogleLoggingIn}
            className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 hover:shadow-lg hover:shadow-emerald-700/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] cursor-pointer animate-fade-in-up delay-500"
          >
            {isSigningUp ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering Account...</span>
              </>
            ) : (
              `Create ${formData.role === "authority" ? "Authority" : "Trekker"} Account`
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#52685E]">
          Already registered?{" "}
          <Link to="/login" className="text-emerald-700 hover:text-emerald-800 font-bold transition">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
