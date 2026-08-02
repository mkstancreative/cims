import DashBoardLayout from "../components/layout/DashBoardLayout";
import SupervisorRoutes from "../routes/SupervisorRoutes";

export default function SuperVisorLayout() {
  return (
    <DashBoardLayout pageTitle="Supervisor Dashboard">
      <SupervisorRoutes />
    </DashBoardLayout>
  );
}
