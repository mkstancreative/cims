import "./PageLoader.css";

/**
 * The app's page loader: an indeterminate progress bar along the top, and the
 * logo inside a spinning brand ring with a short label. Full-screen for
 * route-level waits (auth checks, lazy layouts, signing in); `inline` fills
 * the content area instead, for page-to-page loads inside a layout.
 */
export default function PageLoader({
  label = "Loading…",
  inline = false,
}: {
  label?: string;
  inline?: boolean;
}) {
  return (
    <div
      className={`page-loader${inline ? " page-loader--inline" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="page-loader__bar" aria-hidden="true" />
      <div className="page-loader__center">
        <div className="page-loader__ring" aria-hidden="true">
          <img src="/logo.png" alt="" className="page-loader__logo" />
        </div>
        <p className="page-loader__label">{label}</p>
      </div>
    </div>
  );
}
