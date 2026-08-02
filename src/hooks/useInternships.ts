import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getMyHistory,
  getMyInternship,
  getInternships,
  getInternship,
  updateInternshipStatus,
  setCurrentInternship,
} from "../api/services/internship";
import type { InternshipParams } from "../api/types/internship";

function getErrMsg(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

export const useMyInternshipHistory = () => {
  return useQuery({
    queryKey: ["internships", "my-history"],
    queryFn: getMyHistory,
  });
};

export const useMyInternship = (id: string) => {
  return useQuery({
    queryKey: ["internships", "my-history", id],
    queryFn: () => getMyInternship(id),
    enabled: !!id,
  });
};

export const useInternships = (params?: InternshipParams) => {
  return useQuery({
    queryKey: ["internships", params],
    queryFn: () => getInternships(params),
  });
};

export const useInternship = (id: string) => {
  return useQuery({
    queryKey: ["internships", id],
    queryFn: () => getInternship(id),
    enabled: !!id,
  });
};

export const useUpdateInternshipStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateInternshipStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internships"] });
      toast.success("Internship status updated.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to update internship status.")),
  });
};

export const useSetCurrentInternship = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setCurrentInternship,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internships"] });
      toast.success("Current internship set.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to set current internship.")),
  });
};
