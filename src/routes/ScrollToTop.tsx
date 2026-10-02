import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Start every page at the top. React Router keeps the window's scroll
 * position between routes, so Login / Register opened from low on the landing
 * page would otherwise open part-way down. A `#hash` link keeps its anchor.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}
