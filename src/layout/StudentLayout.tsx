import DashBoardLayout from "../components/layout/DashBoardLayout";
import StudentRoutes from "../routes/StudentRoutes";

export default function StudentLayout() {
  return (
    <DashBoardLayout pageTitle="Student Dashboard">
      <StudentRoutes />
    </DashBoardLayout>
  );
}
