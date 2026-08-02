import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createInstitution,
  getInstitutions,
  updateInstitution,
  toggleInstitutionStatus,
  getPublicInstitutions,
} from "../api/services/institution";
import type {
  InstitutionParams,
  ToggleInstitutionStatusPayload,
} from "../api/types/institution";

function getErrMsg(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

export const useInstitutions = (params?: InstitutionParams) => {
  return useQuery({
    queryKey: ["institutions", params],
    queryFn: () => getInstitutions(params),
  });
};

export const usePublicInstitutions = () => {
  return useQuery({
    queryKey: ["institutions", "public"],
    queryFn: getPublicInstitutions,
  });
};

export const useCreateInstitution = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInstitution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      toast.success("Institution created successfully!");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to create institution.")),
  });
};

export const useUpdateInstitution = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateInstitution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      toast.success("Institution updated successfully!");
    },
    onError: (err: unknown) =>
      toast.error(getErrMsg(err, "Failed to update institution.")),
  });
};

export const useToggleInstitutionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleInstitutionStatus,
    onSuccess: (_data, variables: ToggleInstitutionStatusPayload) => {
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      toast.success(
        variables.isActive
          ? "Institution activated."
          : "Institution deactivated.",
      );
    },
    onError: (err: unknown, variables: ToggleInstitutionStatusPayload) =>
      toast.error(
        getErrMsg(
          err,
          variables.isActive
            ? "Failed to activate institution."
            : "Failed to deactivate institution.",
        ),
      ),
  });
};
