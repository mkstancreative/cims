import "./Skeleton.css";

/**
 * Card skeleton loaders — the one way the app shows "loading". White cards
 * with a soft shimmer in light mode, a faint overlay in dark mode. Each root
 * is `aria-busy` with a visually hidden label for screen readers.
 */

/** Line widths, cycled, so blocks read like text rather than bars. */
const WIDTHS = ["92%", "68%", "80%", "55%", "74%"];

/** Shimmer lines — for inside an existing card or section. */
export function SkeletonLines({
  lines = 3,
  label = "Loading",
}: {
  lines?: number;
  label?: string;
}) {
  return (
    <div className="skel-lines" aria-busy="true" role="status">
      <span className="sr-only">{label}</span>
      {Array.from({ length: lines }).map((_, i) => (
        <span
          key={i}
          className="skel skel-line"
          style={{ width: WIDTHS[i % WIDTHS.length] }}
        />
      ))}
    </div>
  );
}

/** Rows of "title + sub" pairs — for lists inside a card. */
export function SkeletonRows({
  rows = 3,
  label = "Loading",
}: {
  rows?: number;
  label?: string;
}) {
  return (
    <div className="skel-rows" aria-busy="true" role="status">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skel-row">
          <span className="skel skel-avatar" />
          <div className="skel-row__text">
            <span
              className="skel skel-line"
              style={{ width: WIDTHS[i % WIDTHS.length] }}
            />
            <span className="skel skel-line skel-line--sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** One card: a title bar and a few lines. */
export function SkeletonCard({
  lines = 3,
  title = true,
  className,
  label = "Loading",
}: {
  lines?: number;
  title?: boolean;
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={`skel-card${className ? ` ${className}` : ""}`}
      aria-busy="true"
      role="status"
    >
      <span className="sr-only">{label}</span>
      {title && <span className="skel skel-title" />}
      {Array.from({ length: lines }).map((_, i) => (
        <span
          key={i}
          className="skel skel-line"
          style={{ width: WIDTHS[i % WIDTHS.length] }}
        />
      ))}
    </div>
  );
}

/** A stack (or grid) of cards — for a page or panel still loading. */
export function SkeletonCards({
  cards = 3,
  lines = 3,
  grid = false,
  label = "Loading",
}: {
  cards?: number;
  lines?: number;
  /** Lay the cards out in a responsive grid instead of a stack. */
  grid?: boolean;
  label?: string;
}) {
  return (
    <div
      className={grid ? "skel-grid" : "skel-stack"}
      aria-busy="true"
      role="status"
    >
      <span className="sr-only">{label}</span>
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="skel-card" aria-hidden="true">
          <span className="skel skel-title" />
          {Array.from({ length: lines }).map((_, j) => (
            <span
              key={j}
              className="skel skel-line"
              style={{ width: WIDTHS[(i + j) % WIDTHS.length] }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** A whole page: a header card over a few content cards. */
export function PageSkeleton({
  cards = 3,
  label = "Loading page",
}: {
  cards?: number;
  label?: string;
}) {
  return (
    <div className="skel-page" aria-busy="true" role="status">
      <span className="sr-only">{label}</span>
      <div className="skel-card skel-card--header" aria-hidden="true">
        <span className="skel skel-icon" />
        <div className="skel-row__text">
          <span className="skel skel-title" />
          <span className="skel skel-line skel-line--sm" style={{ width: "40%" }} />
        </div>
      </div>
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="skel-card" aria-hidden="true">
          <span className="skel skel-title" />
          {Array.from({ length: 3 }).map((_, j) => (
            <span
              key={j}
              className="skel skel-line"
              style={{ width: WIDTHS[(i + j) % WIDTHS.length] }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
