import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ResetPassword from "./components/auth/ResetPassword";
import ProtectedRoute from "./routes/ProtectedRoute";
import AuthProvider from "./context/AuthProvider";
import { ModalProvider } from "./context/ModalProvider";
import { NotificationsProvider } from "./context";
import { NotificationPopupContainer } from "./components/ui/NotificationPopup";
import ChangePassword from "./components/shared/forms/ChangePassword";
import { useAuth } from "./context/useAuth";
import PageLoader from "./components/ui/PageLoader/PageLoader";

// Lazy-load role layouts so each bundle stays small
const AdminLayout = lazy(() => import("./layout/AdminLayout"));
const StudentLayout = lazy(() => import("./layout/StudentLayout"));
const SupervisorLayout = lazy(() => import("./layout/SuperVisorLayout"));
const VerifyPayment = lazy(() => import("./pages/Register/VerifyPayment"));
const PendingPayment = lazy(() => import("./pages/Register/PendingPayment"));
const VerifyCertificate = lazy(
  () => import("./pages/Students/VerifyCertificate/VerifyCertificate"),
);
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));

const GlobalAuthModals = () => {
  const { user, setAuth } = useAuth();

  if (!user) return null;

  return (
    <ChangePassword
      isOpen={!!user.mustChangePassword}
      onSuccess={() => setAuth({ ...user, mustChangePassword: false })}
    />
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <GlobalAuthModals />
        <NotificationsProvider>
          <NotificationPopupContainer />
          <ModalProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* ── Public ───────────────────────────────────────────────── */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/registrations/verify"
                  element={<VerifyPayment />}
                />
                <Route
                  path="/registration/payment-callback"
                  element={<VerifyPayment />}
                />
                {/* Payment-gated login lands here — authenticated, but no dashboard yet */}
                <Route
                  path="/registrations/pending"
                  element={<PendingPayment />}
                />
                <Route
                  path="/reset-password/:token"
                  element={<ResetPassword />}
                />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/certificates/verify/*"
                  element={<VerifyCertificate />}
                />

                {/* ── Admin / Coordinator ──────────────────────────────────── */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={["admin", "coordinator"]} />
                  }
                >
                  <Route path="/admin/*" element={<AdminLayout />} />
                </Route>

                {/* ── Student ──────────────────────────────────────────────── */}
                <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                  <Route path="/student/*" element={<StudentLayout />} />
                </Route>

                {/* ── Supervisor ───────────────────────────────────────────── */}
                <Route
                  element={<ProtectedRoute allowedRoles={["supervisor"]} />}
                >
                  <Route path="/supervisor/*" element={<SupervisorLayout />} />
                </Route>

                {/* ── Catch-all ────────────────────────────────────────────── */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ModalProvider>
        </NotificationsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
