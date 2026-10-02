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
import type {
  InternshipParams,
  UpdateInternshipStatusResponse,
} from "../api/types/internship";

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
    onSuccess: (res: UpdateInternshipStatusResponse) => {
      queryClient.invalidateQueries({ queryKey: ["internships"] });
      // A student's profile and progress reflect their internship's status.
      queryClient.invalidateQueries({ queryKey: ["students"] });
      // Activating can abandon the student's other active internship(s),
      // which moves batch counts too.
      if (res?.abandoned) queryClient.invalidateQueries({ queryKey: ["batches"] });
      toast.success("Internship status updated.");
      if (res?.abandoned) {
        toast.info(
          res.abandoned === 1
            ? "This student's earlier active internship was closed as abandoned."
            : `${res.abandoned} earlier active internships for this student were closed as abandoned.`,
        );
      }
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
      // Changes the student's current batch, period and default progress.
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Current internship set.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to set current internship.")),
  });
};
