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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-200">
        {/* Branded Loading Screen */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Animated rings */}
          <div className="absolute w-24 h-24 rounded-full border border-emerald-500/20 animate-ping" style={{ animationDuration: "2s" }} />
          <div className="absolute w-20 h-20 rounded-full border border-emerald-500/10" />
          {/* Orbiting dot */}
          <div className="absolute w-3 h-3 rounded-full bg-emerald-400 animate-orbit" />
          {/* Center logo */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500/40 p-0.5 bg-slate-900 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/10 animate-pulse-glow flex items-center justify-center">
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

        <h2 className="text-lg font-bold text-white tracking-tight mb-1">FortFlux</h2>
        <p className="text-sm text-slate-400 font-medium tracking-wide">
          Connecting to Sahyadri Eco-Monitor...
        </p>

        {/* Loading bar */}
        <div className="mt-6 w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 rounded-full animate-shimmer" style={{ width: "100%" }} />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
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

              {/* Default Route: Redirect based on auth/role */}
              <Route
                path="/"
                element={
                  !authUser ? (
                    <Navigate to="/login" replace />
                  ) : authUser.role === "authority" ? (
                    <Navigate to="/authority" replace />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                }
              />

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
