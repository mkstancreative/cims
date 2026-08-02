import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import type { UserRole } from "../api/types/auth";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "var(--color-bg-primary)",
          color: "var(--color-accent)",
          fontSize: 14,
          gap: 10,
          fontFamily: "var(--font-sans, system-ui)",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          style={{ animation: "spin 1s linear infinite" }}
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="60"
            strokeDashoffset="20"
            strokeLinecap="round"
          />
        </svg>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        Authenticating…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to the user's home dashboard if they don't have the right role
    const roleHome: Record<UserRole, string> = {
      admin: "/admin/dashboard",
      coordinator: "/admin/dashboard",
      supervisor: "/supervisor/dashboard",
      student: "/student/dashboard",
    };
    return <Navigate to={roleHome[user.role] ?? "/"} replace />;
  }

  return <Outlet />;
}
