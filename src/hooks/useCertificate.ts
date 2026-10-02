import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCertificateStatus,
  requestCertificate,
  getAllRequests,
  getCertById,
  approveCertBulk,
  rejectCertBulk,
  financialStats,
  getMyCertificate,
  verifyCertificate,
} from "../api/services/certificate";
import { toast } from "react-toastify";

/**
 * One internship's certificate request. Pass the id: without it the API
 * answers with the student's latest request, whichever internship it's for.
 */
export const useCertificateStatus = (internshipId?: string, enabled = true) => {
  return useQuery({
    queryKey: ["certificate-status", internshipId],
    queryFn: () => getCertificateStatus(internshipId),
    enabled,
    // 404 is "no request for this internship yet" — an answer, not a blip.
    retry: (count, err) => {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      return !(status && status >= 400 && status < 500) && count < 2;
    },
  });
};

export const useRequestCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { internshipId: string }) => requestCertificate(payload),
    onSuccess: (data: { success?: boolean; message?: string }) => {
      if (data?.success === false) {
        toast.error(data.message || "Failed to request certificate");
        return;
      }
      toast.success("Certificate request submitted.");
      queryClient.invalidateQueries({ queryKey: ["certificate-status"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(
        error.response?.data?.message || "Error requesting certificate",
      );
    },
  });
};

export const useAllCertRequests = (params: {
  page: number;
  limit: number;
  startDate: string;
  endDate: string;
  status?: string | null;
  paymentStatus?: string | null;
  search?: string | null;
}) => {
  return useQuery({
    queryKey: ["all-cert-requests", params],
    queryFn: () => getAllRequests(params),
  });
};

export const useCertDetails = (id: string | null) => {
  return useQuery({
    queryKey: ["cert-details", id],
    queryFn: () => getCertById(id!),
    enabled: !!id,
  });
};

export const useBulkApproveCert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { certificateIds: string[] }) =>
      approveCertBulk(payload),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Certificates approved.");
        queryClient.invalidateQueries({ queryKey: ["all-cert-requests"] });
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Error approving requests");
    },
  });
};

export const useBulkRejectCert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { certificateIds: string[]; reason?: string }) =>
      rejectCertBulk(payload),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Certificates rejected.");
        queryClient.invalidateQueries({ queryKey: ["all-cert-requests"] });
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Error rejecting requests");
    },
  });
};

export const useCertFinancialStats = () => {
  return useQuery({
    queryKey: ["cert-financial-stats"],
    queryFn: financialStats,
  });
};

export const useGetMyCertificate = () => {
  return useMutation({
    mutationFn: (internshipId?: string) => getMyCertificate(internshipId),
  });
};

export const useVerifyCertificateQRCode = (certNumber: string | null) => {
  return useQuery({
    queryKey: ["verify-cert-qrcode", certNumber],
    queryFn: () => verifyCertificate(certNumber!),
    enabled: !!certNumber,
    retry: false,
  });
};
