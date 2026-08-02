import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Spinner from "../components/ui/Spinner/Spinner";
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));

import DashBoardStudent from "../pages/Students/DashBoardStudent";
import LogBook from "../pages/Students/LogBook";
import MyProfile from "../pages/Students/MyProfile";
import Notifications from "../pages/Shared/Notifications";

const MyCurriculum = lazy(() => import("../pages/Students/MyCurriculum"));
const MyQuiz = lazy(() => import("../pages/Students/MyQuiz"));
const MyInternships = lazy(() => import("../pages/Students/MyInternships"));
const MyEvaluation = lazy(() => import("../pages/Students/MyEvaluation"));
const MyCertificate = lazy(() => import("../pages/Students/MyCertificate"));

export default function StudentRoutes() {
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
          <Spinner size={30} color="var(--color-accent)" text="Loading..." />
        </div>
      }
    >
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashBoardStudent />} />
        <Route path="curriculum" element={<MyCurriculum />} />
        <Route path="logbook" element={<LogBook />} />
        <Route path="quiz" element={<MyQuiz />} />
        <Route path="internships" element={<MyInternships />} />
        <Route path="evaluation" element={<MyEvaluation />} />
        <Route path="certificate" element={<MyCertificate />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
