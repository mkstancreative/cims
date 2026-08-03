import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Spinner from "../components/ui/Spinner/Spinner";
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));
import DashBoardAdmin from "../pages/Admin/DashBoardAdmin";
import Notifications from "../pages/Shared/Notifications";
import UnAssignedStudents from "../pages/Admin/UnAssignedStudents";

const Batches = lazy(() => import("../pages/Admin/Batches"));
const Students = lazy(() => import("../pages/Admin/Students"));
const Supervisor = lazy(() => import("../pages/Admin/Supervisor"));
const Institutions = lazy(() => import("../pages/Admin/Institutions"));
const Curriculum = lazy(() => import("../pages/Admin/Curriculum"));
const Quizzes = lazy(() => import("../pages/Admin/Quizzes"));
const Registrations = lazy(() => import("../pages/Admin/Registrations"));
const Payments = lazy(() => import("../pages/Admin/Payments"));
const Internships = lazy(() => import("../pages/Admin/Internships"));
const Results = lazy(() => import("../pages/Admin/Results"));
const Settings = lazy(() => import("../pages/Admin/Settings"));
const AdminStudentView = lazy(
  () => import("../components/admin/view/AdminStudentView"),
);
const StudentProgress = lazy(
  () => import("../components/admin/view/StudentProgress"),
);
const AdminCertificates = lazy(() => import("../pages/Admin/AdminCertificates"));

export default function AdminRoutes() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spinner
            size={30}
            color="var(--color-accent)"
            text="Loading module..."
          />
        </div>
      }
    >
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashBoardAdmin />} />

        {/* ── Registration & review ── */}
        <Route path="registrations" element={<Registrations />} />
        <Route path="payments" element={<Payments />} />

        {/* ── Setup ── */}
        <Route path="institutions" element={<Institutions />} />
        <Route path="batches" element={<Batches />} />
        <Route path="curriculum" element={<Curriculum />} />
        <Route path="quizzes" element={<Quizzes />} />

        {/* ── People ── */}
        <Route path="students" element={<Students />} />
        <Route path="students/:id" element={<AdminStudentView />} />
        <Route path="students/:id/progress" element={<StudentProgress />} />
        <Route path="unassigned-students" element={<UnAssignedStudents />} />
        <Route path="supervisors" element={<Supervisor />} />

        {/* ── Placements ── */}
        <Route path="internships" element={<Internships />} />
        <Route path="results" element={<Results />} />
        <Route path="certificates" element={<AdminCertificates />} />

        {/* ── System ── */}
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<Notifications />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
