import { useQuery } from "@tanstack/react-query";
import { api } from "../api/services/api";
import { useInternshipScope } from "../context/useInternship";
import { dashboardStats as studentDashboardStats } from "../api/services/itstudent";
import { supervisorDashboardStats } from "../api/services/schoolSupervisors";
import {
  isNoInternshipError,
  isPaymentRequiredError,
} from "../helpers/registration";
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

/** The selected internship's dashboard (the current one by default). */
export const useStudentDashboard = () => {
  const scope = useInternshipScope();
  return useQuery<StudentDashboardResponse>({
    queryKey: ["student-dashboard", scope],
    queryFn: () => studentDashboardStats(scope),
    staleTime: 2 * 60 * 1000,
    // An unpaid fee or a missing enrolment won't fix itself on retry — show
    // the matching panel at once.
    retry: (failureCount, error) =>
      !isPaymentRequiredError(error) &&
      !isNoInternshipError(error) &&
      failureCount < 3,
  });
};

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
