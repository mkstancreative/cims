import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../api/services/api";
import {
  updateStudentProfile,
  uploadPassport,
  getStudentProgress,
} from "../api/services/itstudent";
import type {
  UpdateStudentProfilePayload,
  UploadPassportPayload,
} from "../api/types/itstudent";

export const useUpdateStudentProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateStudentProfilePayload) =>
      updateStudentProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, "Failed to update profile. Please try again."),
      );
    },
  });
};

export const useUploadPassport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadPassportPayload) => uploadPassport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Passport photo uploaded successfully!");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to upload passport."));
    },
  });
};

export const useStudentProgress = () => {
  return useQuery({
    queryKey: ["student-progress"],
    queryFn: getStudentProgress,
  });
};
