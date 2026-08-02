import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Spinner from "../components/ui/Spinner/Spinner";
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));

import AssignedStudents from "../pages/Supervisors/AssignedStudents";
import DashBoardSupervisor from "../pages/Supervisors/DashBoardSupervisor";
import StudentLogBooks from "../pages/Supervisors/StudentLogBooks";
import AssignedStudentLogBookView from "../components/supervisor/views/AssignedStudentLogBookView";
import StudentsEvaluations from "../pages/Supervisors/StudentsEvaluations";
import Notifications from "../pages/Shared/Notifications";

export default function SupervisorRoutes() {
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
        {/* Default → dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Supervisor routes */}
        <Route path="dashboard" element={<DashBoardSupervisor />} />
        <Route path="assigned-students" element={<AssignedStudents />} />

        {/* Logbook routes */}
        <Route
          path="students/:studentId/logbooks"
          element={<StudentLogBooks />}
        />
        <Route
          path="students/:studentId/logbooks/:logbookId"
          element={<AssignedStudentLogBookView />}
        />

        {/* Evaluation routes */}
        <Route path="students-evaluations" element={<StudentsEvaluations />} />

        {/* Notifications */}
        <Route path="notifications" element={<Notifications />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
