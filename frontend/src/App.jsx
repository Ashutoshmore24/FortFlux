import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useFortStore } from "./store/useFortStore";
import { useRiskStore } from "./store/useRiskStore";
import { useRoutingStore } from "./store/useRoutingStore";
import { connectSocket, disconnectSocket } from "./lib/socket";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import TrekkerDashboard from "./pages/TrekkerDashboard";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import ProfilePage from "./pages/ProfilePage";
import HistoryPage from "./pages/HistoryPage";
import LandingPage from "./pages/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastContainer } from "./components/Toast";
import RateLimitModal from "./components/RateLimitModal";
import ScrollToTop from "./components/ScrollToTop";
import { Mountain } from "lucide-react";

export function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Phase 7: Connect socket when authenticated, disconnect when not
  useEffect(() => {
    if (authUser) {
      connectSocket();

      // Subscribe all stores to real-time socket events
      useFortStore.getState().subscribeToSocket();
      useRiskStore.getState().subscribeToSocket();
      useRoutingStore.getState().subscribeToSocket();
    } else {
      // Unsubscribe stores and disconnect socket on logout
      useFortStore.getState().unsubscribeFromSocket();
      useRiskStore.getState().unsubscribeFromSocket();
      useRoutingStore.getState().unsubscribeFromSocket();
      disconnectSocket();
    }

    return () => {
      useFortStore.getState().unsubscribeFromSocket();
      useRiskStore.getState().unsubscribeFromSocket();
      useRoutingStore.getState().unsubscribeFromSocket();
      disconnectSocket();
    };
  }, [authUser]);

  if (isCheckingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F8F4] text-slate-800">
        {/* Branded Loading Screen */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Animated rings */}
          <div className="absolute w-24 h-24 rounded-full border border-emerald-600/20 animate-ping" style={{ animationDuration: "2s" }} />
          <div className="absolute w-20 h-20 rounded-full border border-emerald-600/15" />
          {/* Orbiting dot */}
          <div className="absolute w-3 h-3 rounded-full bg-emerald-600 animate-orbit" />
          {/* Center logo */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-600/30 p-0.5 bg-white shadow-lg shadow-emerald-700/10 ring-4 ring-emerald-600/10 animate-pulse-glow flex items-center justify-center">
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

        <h2 className="text-xl font-extrabold text-[#132A22] tracking-tight mb-1">FortFlux</h2>
        <p className="text-xs text-[#52685E] font-medium tracking-wide">
          Connecting to Sahyadri Eco-Monitor...
        </p>

        {/* Loading bar */}
        <div className="mt-6 w-48 h-1.5 bg-[#E2ECE4] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 rounded-full animate-shimmer" style={{ width: "100%" }} />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F5F8F4] text-slate-800 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
        <Navbar />

        <main className="flex-1">
          <ErrorBoundary>
            <Routes>
              {/* Public Auth Routes */}
              <Route
                path="/login"
                element={
                  !authUser ? (
                    <LoginPage />
                  ) : authUser.role === "authority" ? (
                    <Navigate to="/authority" replace />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                }
              />

              <Route
                path="/signup"
                element={
                  !authUser ? (
                    <SignupPage />
                  ) : authUser.role === "authority" ? (
                    <Navigate to="/authority" replace />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                }
              />

              {/* Public Hero & Impact Showcase Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Authenticated Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<TrekkerDashboard />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/forts/:slug/history" element={<HistoryPage />} />

                {/* Authority Only Routes (Protected by RBAC RoleRoute) */}
                <Route element={<RoleRoute allowedRoles={["authority", "admin"]} />}>
                  <Route path="/authority" element={<AuthorityDashboard />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </main>

        {/* Global UI overlays */}
        <ToastContainer />
        <RateLimitModal />
        <ScrollToTop />
      </div>
    </BrowserRouter>
  );
}

export default App;
