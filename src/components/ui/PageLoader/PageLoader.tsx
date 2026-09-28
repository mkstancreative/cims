/** Full-screen spinner for route-level waits (auth checks, lazy layouts). */
export default function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--color-bg-primary)",
        color: "var(--color-accent)",
        gap: 10,
        fontSize: 14,
        fontFamily: "var(--font-sans, system-ui)",
      }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        style={{ animation: "page-loader-spin 1s linear infinite" }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="60"
          strokeDashoffset="20"
          strokeLinecap="round"
        />
      </svg>
      <style>{`@keyframes page-loader-spin { to { transform: rotate(360deg); } }`}</style>
      {label}
    </div>
  );
}
