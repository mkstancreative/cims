// ─── System Settings Types ────────────────────────────────────────────────────

export interface SettingsLogo {
  filename: string;
  url: string;
  originalName: string;
}

export interface SystemSettings {
  logo?: SettingsLogo | null;
  name: string;
  phone: string;
  email: string;
  address: string;
  code: string;
}

export interface SettingsResponse {
  success: boolean;
  message?: string;
  settings: SystemSettings;
}

export interface UpdateSettingsFields {
  name: string;
  phone: string;
  email: string;
  address: string;
  code: string;
  logo?: File | null;
}
