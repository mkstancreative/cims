import { useState, type FormEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Hash,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Server,
  Settings as SettingsIcon,
  Upload,
} from "lucide-react";
import Spinner from "../../components/ui/Spinner/Spinner";
import { useSettings, useUpdateSettings } from "../../hooks/useSettings";
import { SkeletonCards } from "../../components/ui/Skeleton/Skeleton";
import { resolveAsset } from "../../helpers/assets";
import type { SystemSettings } from "../../api/types/settings";
import "./Settings.css";

// ─── Edit form ────────────────────────────────────────────────────────────────
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

  const currentLogo = resolveAsset(settings?.logo?.url);

  return (
    <form onSubmit={handleSubmit} className="st-card st-form">
      <header className="st-card__head">
        <h3 className="st-card__title">
          <SettingsIcon size={16} /> System information
        </h3>
        <p className="st-card__sub">
          Shown on the landing page, certificates and verification pages.
        </p>
      </header>

      {/* ── Logo ── */}
      <div className="st-logo">
        <div className="st-logo__box">
          {preview || currentLogo ? (
            <img src={preview ?? currentLogo ?? ""} alt="Logo" />
          ) : (
            <SettingsIcon size={26} color="var(--color-text-secondary)" />
          )}
        </div>
        <div>
          <label className="modal-cancel st-logo__pick">
            <Upload size={14} /> Choose Logo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleLogoChange(e.target.files?.[0] ?? null)}
            />
          </label>
          <p className="st-logo__hint">
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

      <div className="st-form__actions">
        <button type="submit" className="modal-submit" disabled={isPending}>
          {isPending ? (
            <Spinner size={14} color="#fff" text="" />
          ) : (
            "Save Settings"
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Saved settings, straight from the server ────────────────────────────────
function Row({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="st-row">
      <span className="st-row__icon">{icon}</span>
      <div className="st-row__body">
        <span className="st-row__label">{label}</span>
        <span className={`st-row__value${value ? "" : " is-empty"}`}>
          {value || "Not set"}
        </span>
      </div>
    </div>
  );
}

/**
 * What the API is serving right now — what visitors and certificates see.
 * Refresh re-fetches it; the logo is checked so a missing file is obvious.
 */
function SavedSettingsCard({
  settings,
  fetchedAt,
  isFetching,
  isError,
  onRefresh,
}: {
  settings?: SystemSettings;
  fetchedAt: number;
  isFetching: boolean;
  isError: boolean;
  onRefresh: () => void;
}) {
  const logoUrl = resolveAsset(settings?.logo?.url);
  // Keyed to the URL, so a new logo is checked afresh.
  const [logoState, setLogoState] = useState<{
    url: string | null;
    state: "loading" | "ok" | "missing";
  }>({ url: logoUrl, state: "loading" });
  const logoStatus = logoState.url === logoUrl ? logoState.state : "loading";

  return (
    <aside className="st-card st-saved">
      <header className="st-card__head st-saved__head">
        <div>
          <h3 className="st-card__title">
            <Server size={16} /> Saved on the server
          </h3>
          <p className="st-card__sub">
            {fetchedAt
              ? `Fetched ${new Date(fetchedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}`
              : "Not fetched yet"}
          </p>
        </div>
        <button
          type="button"
          className="dash-btn dash-btn--ghost st-saved__refresh"
          onClick={onRefresh}
          disabled={isFetching}
        >
          <RefreshCw size={14} className={isFetching ? "st-spin" : ""} />
          {isFetching ? "Fetching…" : "Refresh"}
        </button>
      </header>

      {isError && (
        <div className="st-alert st-alert--error">
          <AlertTriangle size={15} />
          The settings couldn't be fetched. Check the connection and try again.
        </div>
      )}

      {/* Brand preview — the logo and name as visitors see them */}
      <div className="st-brand">
        <div className="st-brand__logo">
          {logoUrl && logoStatus !== "missing" ? (
            <img
              src={logoUrl}
              alt=""
              onLoad={() => setLogoState({ url: logoUrl, state: "ok" })}
              onError={() => setLogoState({ url: logoUrl, state: "missing" })}
            />
          ) : (
            <Building2 size={22} />
          )}
        </div>
        <div className="st-brand__text">
          <strong>{settings?.name || "No name set"}</strong>
          <span>{settings?.code || "No code set"}</span>
        </div>
      </div>

      {logoUrl && logoStatus === "missing" && (
        <div className="st-alert st-alert--warn">
          <AlertTriangle size={15} />
          <span>
            The logo file isn't on the server (
            <code>{settings?.logo?.url}</code>
            ). Choose and save a logo again.
          </span>
        </div>
      )}
      {!logoUrl && (
        <div className="st-alert st-alert--warn">
          <AlertTriangle size={15} />
          No logo saved — pages show the name's initials instead.
        </div>
      )}
      {logoUrl && logoStatus === "ok" && (
        <div className="st-alert st-alert--ok">
          <CheckCircle2 size={15} />
          Logo is loading correctly.
        </div>
      )}

      <div className="st-rows">
        <Row icon={<Hash size={15} />} label="Code" value={settings?.code} />
        <Row icon={<Mail size={15} />} label="Email" value={settings?.email} />
        <Row icon={<Phone size={15} />} label="Phone" value={settings?.phone} />
        <Row
          icon={<MapPin size={15} />}
          label="Address"
          value={settings?.address}
        />
      </div>
    </aside>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Settings() {
  const { data, isLoading, isFetching, isError, refetch, dataUpdatedAt } =
    useSettings();
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
        <SkeletonCards cards={2} lines={4} label="Loading settings" />
      ) : (
        <div className="st-layout">
          <SettingsForm key={settings?.code ?? "new"} settings={settings} />
          <SavedSettingsCard
            settings={settings}
            fetchedAt={dataUpdatedAt}
            isFetching={isFetching}
            isError={isError}
            onRefresh={() => refetch()}
          />
        </div>
      )}
    </div>
  );
}
