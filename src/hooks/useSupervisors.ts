import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createSupervisor, getSupervisors } from "../api/services/supervisors";
import type { SupervisorParams } from "../api/types/supervisor";

function getErrMsg(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

export const useSupervisors = (params?: SupervisorParams) => {
  return useQuery({
    queryKey: ["supervisors", params],
    queryFn: () => getSupervisors(params),
  });
};

export const useCreateSupervisor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSupervisor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisors"] });
      toast.success("Supervisor created successfully!");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to create supervisor.")),
  });
};
