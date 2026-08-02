import { useState, type FormEvent } from "react";
import { Settings as SettingsIcon, Upload } from "lucide-react";
import Spinner from "../../components/ui/Spinner/Spinner";
import { useSettings, useUpdateSettings } from "../../hooks/useSettings";
import type { SystemSettings } from "../../api/types/settings";

const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(
  /\/api(\/v\d+)?\/?$/,
  "",
);

function logoSrc(url?: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
}

function SettingsForm({ settings }: { settings?: SystemSettings }) {
  const { mutate: update, isPending } = useUpdateSettings();

  const [form, setForm] = useState({
    name: settings?.name ?? "",
    phone: settings?.phone ?? "",
    email: settings?.email ?? "",
    address: settings?.address ?? "",
    code: settings?.code ?? "",
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const set = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Build/revoke the object URL in the event handler (not an effect).
  const handleLogoChange = (file: File | null) => {
    setLogo(file);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    update({ ...form, logo });
  };

  const currentLogo = logoSrc(settings?.logo?.url);

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 640,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 14,
        padding: 24,
      }}
    >
      {/* ── Logo ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 12,
            border: "1px solid var(--color-border)",
            background: "var(--color-bg-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {preview || currentLogo ? (
            <img
              src={preview ?? currentLogo ?? ""}
              alt="Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <SettingsIcon size={26} color="var(--color-text-secondary)" />
          )}
        </div>
        <div>
          <label
            className="modal-cancel"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
            }}
          >
            <Upload size={14} /> Choose Logo
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleLogoChange(e.target.files?.[0] ?? null)}
            />
          </label>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 12,
              color: "var(--color-text-secondary)",
            }}
          >
            {logo ? logo.name : "PNG or JPG, transparent preferred"}
          </p>
        </div>
      </div>

      <div className="form-group">
        <label className="modal-label">
          Name <span>*</span>
        </label>
        <input
          className="modal-input"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label className="modal-label">
          Code <span>*</span>
        </label>
        <input
          className="modal-input"
          value={form.code}
          onChange={(e) => set("code", e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label className="modal-label">
          Email <span>*</span>
        </label>
        <input
          type="email"
          className="modal-input"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label className="modal-label">
          Phone <span>*</span>
        </label>
        <input
          className="modal-input"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label className="modal-label">
          Address <span>*</span>
        </label>
        <input
          className="modal-input"
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          required
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button type="submit" className="modal-submit" disabled={isPending}>
          {isPending ? <Spinner size={14} color="#fff" text="" /> : "Save Settings"}
        </button>
      </div>
    </form>
  );
}

export default function Settings() {
  const { data, isLoading } = useSettings();
  const settings = data?.settings;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <SettingsIcon size={20} />
          </div>
          <div>
            <h2 className="page-title">Settings</h2>
            <p className="page-sub">Manage system information and branding</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
          <Spinner size={26} color="var(--color-accent)" text="Loading…" />
        </div>
      ) : (
        <SettingsForm key={settings?.code ?? "new"} settings={settings} />
      )}
    </div>
  );
}
