import { useQuery } from "@tanstack/react-query";
import { api } from "../api/services/api";
import { dashboardStats as studentDashboardStats } from "../api/services/itstudent";
import { supervisorDashboardStats } from "../api/services/schoolSupervisors";
import type {
  StudentDashboardResponse,
  AdminDashboardResponse,
  SupervisorDashboardResponse,
} from "../api/types/dashboard";

// Admin dashboard hits /admin/dashboard
const adminDashboardStatsFn = async (): Promise<AdminDashboardResponse> => {
  const response = await api.get<AdminDashboardResponse>("/admin/dashboard");
  return response.data;
};

export const useStudentDashboard = () =>
  useQuery<StudentDashboardResponse>({
    queryKey: ["student-dashboard"],
    queryFn: studentDashboardStats,
    staleTime: 2 * 60 * 1000,
  });

export const useAdminDashboard = () =>
  useQuery<AdminDashboardResponse>({
    queryKey: ["admin-dashboard"],
    queryFn: adminDashboardStatsFn,
    staleTime: 2 * 60 * 1000,
  });

export const useSupervisorDashboard = () =>
  useQuery<SupervisorDashboardResponse>({
    queryKey: ["supervisor-dashboard"],
    queryFn: supervisorDashboardStats,
    staleTime: 2 * 60 * 1000,
  });
