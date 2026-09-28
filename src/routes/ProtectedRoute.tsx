import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import type { UserRole } from "../api/types/auth";
import PageLoader from "../components/ui/PageLoader/PageLoader";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <PageLoader label="Authenticating…" />;

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
