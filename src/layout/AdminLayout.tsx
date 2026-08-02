import DashBoardLayout from "../components/layout/DashBoardLayout";
import AdminRoutes from "../routes/AdminRoutes";

export default function AdminLayout() {
  return (
    <DashBoardLayout pageTitle="Admin Dashboard">
      <AdminRoutes />
    </DashBoardLayout>
  );
}
