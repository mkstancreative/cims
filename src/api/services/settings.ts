import { api } from "./api";
import type { SettingsResponse, UpdateSettingsFields } from "../types/settings";

export const getSettings = async (): Promise<SettingsResponse> => {
  const response = await api.get("/settings");
  return response.data;
};

export const updateSettings = async (
  fields: UpdateSettingsFields,
): Promise<SettingsResponse> => {
  const form = new FormData();
  form.append("name", fields.name);
  form.append("phone", fields.phone);
  form.append("email", fields.email);
  form.append("address", fields.address);
  form.append("code", fields.code);
  if (fields.logo) form.append("logo", fields.logo);

  const response = await api.put("/settings", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
