import { api } from "./api";
import type {
  SubmitEvaluationPayload,
  PendingEvaluationsResponse,
  MyEvaluationResponse,
  StudentEvaluationsResponse,
  CompositeResultsResponse,
  CompositeResultsParams,
  EvaluationVerifyParams,
  MyEvaluationParams,
  EvaluationVerifyResponse,
} from "../types/evaluation";

export const getPendingEvaluations =
  async (): Promise<PendingEvaluationsResponse> => {
    const response = await api.get("/evaluations/pending");
    return response.data;
  };

/**
 * Preflight: every gate a submit would hit — blockers, judgement calls and
 * notices — without submitting. Supervisors only.
 */
export const verifyEvaluation = async (
  studentId: string,
  params?: EvaluationVerifyParams,
): Promise<EvaluationVerifyResponse> => {
  const response = await api.get(`/evaluations/${studentId}/verify`, {
    params,
  });
  return response.data;
};

export const submitEvaluation = async (
  studentId: string,
  payload: SubmitEvaluationPayload,
) => {
  const response = await api.post(`/evaluations/${studentId}`, payload);
  return response.data;
};

/**
 * The student's evaluation — for their current internship by default, or a
 * specific one via `internshipId` / `batchId`.
 */
export const getMyEvaluation = async (
  params?: MyEvaluationParams,
): Promise<MyEvaluationResponse> => {
  const response = await api.get("/evaluations/my-evaluation", { params });
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
