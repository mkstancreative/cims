import { api } from "./api";
import type {
  UpdateStudentProfilePayload,
  UploadPassportPayload,
  GetStudentProgressResponse,
} from "../types/itstudent";

export const dashboardStats = async () => {
  const response = await api.get("/students/dashboard");
  return response.data;
};

export const updateStudentProfile = async (
  payload: UpdateStudentProfilePayload,
) => {
  const response = await api.put("/students/profile", payload);
  return response.data;
};

export const uploadPassport = async (payload: UploadPassportPayload) => {
  const form = new FormData();
  form.append("photo", payload.photo);
  const response = await api.post("/students/upload-passport", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getStudentProgress = async () => {
  const response =
    await api.get<GetStudentProgressResponse>("/students/progress");
  return response.data;
};
