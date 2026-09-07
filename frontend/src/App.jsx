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
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import { Loader2 } from "lucide-react";

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
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
        <p className="text-sm font-medium tracking-wide">Connecting to FortFlux Eco-Monitor...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
        <Navbar />

        <main className="flex-1">
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

              {/* Authority Only Routes (Protected by RBAC RoleRoute) */}
              <Route element={<RoleRoute allowedRoles={["authority", "admin"]} />}>
                <Route path="/authority" element={<AuthorityDashboard />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
