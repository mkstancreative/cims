import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));

import DashBoardStudent from "../pages/Students/DashBoardStudent";
import LogBook from "../pages/Students/LogBook";
import MyProfile from "../pages/Students/MyProfile";
import PageLoader from "../components/ui/PageLoader/PageLoader";
import SelectInternshipRedirect from "./SelectInternshipRedirect";
import Notifications from "../pages/Shared/Notifications";

const MyCurriculum = lazy(() => import("../pages/Students/MyCurriculum"));
const MyQuiz = lazy(() => import("../pages/Students/MyQuiz"));
const MyInternships = lazy(() => import("../pages/Students/MyInternships"));
const MyEvaluation = lazy(() => import("../pages/Students/MyEvaluation"));
const MyCertificate = lazy(() => import("../pages/Students/MyCertificate"));
const MyPayments = lazy(() => import("../pages/Students/MyPayments"));

export default function StudentRoutes() {
  return (
    <Suspense fallback={<PageLoader inline label="Loading page…" />}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashBoardStudent />} />
        <Route path="curriculum" element={<MyCurriculum />} />
        <Route path="logbook" element={<LogBook />} />
        <Route path="quiz" element={<MyQuiz />} />
        <Route path="internships" element={<MyInternships />} />
        {/* The selected internship's evaluation (top-bar switcher). Reached
            from My Internships, the dashboard and the logbook. */}
        <Route path="evaluation" element={<MyEvaluation />} />
        {/* Older per-internship links: select it, then show the page. */}
        <Route
          path="internships/:internshipId/evaluation"
          element={<SelectInternshipRedirect to="/student/evaluation" />}
        />
        <Route
          path="internships/:internshipId/logbooks"
          element={<SelectInternshipRedirect to="/student/logbook" />}
        />
        <Route path="certificate" element={<MyCertificate />} />
        <Route path="payments" element={<MyPayments />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
