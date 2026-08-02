import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createCurriculum,
  getCurricula,
  getCurriculum,
  updateCurriculum,
  deactivateCurriculum,
  getMyCurriculum,
} from "../api/services/curriculum";
import type { CurriculumParams } from "../api/types/curriculum";

function getErrMsg(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

export const useCurricula = (params?: CurriculumParams) => {
  return useQuery({
    queryKey: ["curricula", params],
    queryFn: () => getCurricula(params),
  });
};

export const useCurriculum = (id: string) => {
  return useQuery({
    queryKey: ["curricula", id],
    queryFn: () => getCurriculum(id),
    enabled: !!id,
  });
};

export const useMyCurriculum = () => {
  return useQuery({
    queryKey: ["curricula", "my"],
    queryFn: getMyCurriculum,
  });
};

export const useCreateCurriculum = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCurriculum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curricula"] });
      toast.success("Curriculum created successfully!");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to create curriculum.")),
  });
};

export const useUpdateCurriculum = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCurriculum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curricula"] });
      toast.success("Curriculum updated successfully!");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to update curriculum.")),
  });
};

export const useDeactivateCurriculum = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateCurriculum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curricula"] });
      toast.success("Curriculum deactivated.");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to deactivate curriculum.")),
  });
};
