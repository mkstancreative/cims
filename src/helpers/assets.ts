/** A Settings asset path (e.g. the logo) → an absolute URL on the API host. */
export function resolveAsset(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(
    /\/api(\/v\d+)?\/?$/,
    "",
  );
  return `${apiBase}${path.startsWith("/") ? "" : "/"}${path}`;
}
