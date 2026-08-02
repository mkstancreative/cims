import { api } from "./api";
import type {
  SubmitEvaluationPayload,
  PendingEvaluationsResponse,
  MyEvaluationResponse,
  StudentEvaluationsResponse,
  CompositeResultsResponse,
  CompositeResultsParams,
} from "../types/evaluation";

export const getPendingEvaluations =
  async (): Promise<PendingEvaluationsResponse> => {
    const response = await api.get("/evaluations/pending");
    return response.data;
  };

export const submitEvaluation = async (
  studentId: string,
  payload: SubmitEvaluationPayload,
) => {
  const response = await api.post(`/evaluations/${studentId}`, payload);
  return response.data;
};

export const getMyEvaluation = async (): Promise<MyEvaluationResponse> => {
  const response = await api.get("/evaluations/my-evaluation");
  return response.data;
};

export const getStudentEvaluations = async (
  studentId: string,
): Promise<StudentEvaluationsResponse> => {
  const response = await api.get(`/evaluations/student/${studentId}`);
  return response.data;
};

export const getCompositeResults = async (
  params?: CompositeResultsParams,
): Promise<CompositeResultsResponse> => {
  const response = await api.get("/evaluations/composite-results", { params });
  return response.data;
};
