import { api } from "./api";

export interface CertificateRequest {
  graduationYear: string;
  graduationMonth: string;
  graduationDate: string;
  ndStatementOfResult?: File;
  itDischargeLetter?: File;
  hndStatementOfResult?: File;
  placeOfIT: string;
}

export const requestCertificate = async (
  payload: FormData | CertificateRequest,
) => {
  const response = await api.post("/certificates/request", payload, {
    headers:
      payload instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : {},
  });
  return response.data;
};

export const getCertificateStatus = async (internshipId?: string) => {
  const response = await api.get("/certificates/status", {
    params: internshipId ? { internshipId } : undefined,
  });
  return response.data;
};

export const getMyCertificate = async (internshipId?: string) => {
  const response = await api.get("/certificates/my-certificate", {
    params: internshipId ? { internshipId } : undefined,
  });
  return response.data;
};

// Admin
export const getAllRequests = async (params: {
  page: number;
  limit: number;
  startDate: string;
  endDate: string;
  status?: string | null;
  paymentStatus?: string | null;
  search?: string | null;
}) => {
  const response = await api.get("/certificates/admin/all", { params });
  return response.data;
};

export const getCertById = async (id: string) => {
  const response = await api.get(`/certificates/admin/cert/${id}`);
  return response.data;
};

export const approveCertBulk = async (payload: {
  certificateIds: string[];
}) => {
  const response = await api.post(`/certificates/admin/bulk-approve`, payload);
  return response.data;
};

export const rejectCertBulk = async (payload: {
  certificateIds: string[];
  reason?: string;
}) => {
  const response = await api.post(`/certificates/admin/bulk-reject`, payload);
  return response.data;
};

export const financialStats = async () => {
  const response = await api.get(`/certificates/stats`);
  return response.data;
};

// Public certificate verification by certificate number
export const verifyCertificate = async (certificateNumber: string) => {
  const response = await api.get(
    `/certificates/verify?certificateNumber=${encodeURIComponent(certificateNumber)}`,
  );
  return response.data;
};

// Backwards-compatible alias used by the QR verification page
export const certificateQRCode = verifyCertificate;
