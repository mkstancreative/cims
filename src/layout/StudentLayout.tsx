import DashBoardLayout from "../components/layout/DashBoardLayout";
import StudentRoutes from "../routes/StudentRoutes";
import { InternshipProvider } from "../context/InternshipProvider";
import { useSelectedInternship } from "../context/useInternship";
import InternshipSwitcher from "../components/student/InternshipSwitcher/InternshipSwitcher";
import InternshipBanner from "../components/student/InternshipSwitcher/InternshipBanner";

/** The student area, scoped to the internship picked in the top bar. */
function StudentShell() {
  const { selected, isCurrent } = useSelectedInternship();
  return (
    <DashBoardLayout
      pageTitle="Student Dashboard"
      topbarActions={<InternshipSwitcher />}
    >
      <InternshipBanner />
      {/* Switching remounts the pages, so nothing from one internship — a
          table page, an open quiz — carries over to the next. */}
      <StudentRoutes key={isCurrent ? "current" : selected?._id} />
    </DashBoardLayout>
  );
}

export default function StudentLayout() {
  return (
    <InternshipProvider>
      <StudentShell />
    </InternshipProvider>
  );
}
