import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLogoutUser } from "../../hooks/useAuth";
import type { NavItem, NavSection } from "./types";

// ─── Active link ──────────────────────────────────────────────────────────────
const trimSlash = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

/** Does `path` cover the current page? Exact, or as a parent segment
 *  (`/student/internships` covers `/student/internships/42/evaluation`).
 *  Area roots like `/student` only match exactly, so Dashboard doesn't light
 *  up on every page. */
function covers(path: string, pathname: string): boolean {
  if (path === pathname) return true;
  const isRoot = path.split("/").filter(Boolean).length < 2;
  return !isRoot && pathname.startsWith(`${path}/`);
}

/** The one nav path to highlight: the longest that covers the page, so a
 *  detail page tracks its own list page and nothing else. */
function resolveActivePath(nav: NavSection[], pathname: string): string {
  const current = trimSlash(pathname);
  let best = "";
  for (const section of nav) {
    for (const item of section.items) {
      const paths = [item.path, ...(item.children ?? []).map((c) => c.path)];
      for (const p of paths) {
        if (!p) continue;
        const candidate = trimSlash(p);
        if (candidate.length > best.length && covers(candidate, current)) {
          best = candidate;
        }
      }
    }
  }
  return best;
}

// ─── Expandable Nav Item ──────────────────────────────────────────────────────
function NavItemRow({
  item,
  activePath,
  collapsed,
}: {
  item: NavItem;
  activePath: string;
  collapsed: boolean;
}) {
  const navigate = useNavigate();
  const rowRef = useRef<HTMLDivElement>(null);
  const hasChildren = !!item.children?.length;
  const isActive =
    !hasChildren && !!item.path && trimSlash(item.path) === activePath;
  const isChildActive =
    hasChildren && item.children!.some((c) => trimSlash(c.path) === activePath);
  const [open, setOpen] = useState(isChildActive);

  // Reaching a child page any other way (a link, back/forward) opens its
  // group — adjusted during render rather than in an effect.
  const [wasChildActive, setWasChildActive] = useState(isChildActive);
  if (isChildActive !== wasChildActive) {
    setWasChildActive(isChildActive);
    if (isChildActive) setOpen(true);
  }

  // Keep the active link in view in a long, scrolled sidebar.
  const highlighted = isActive || isChildActive;
  useEffect(() => {
    if (highlighted) rowRef.current?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  if (!hasChildren) {
    return (
      <div
        ref={rowRef}
        className={`dash-nav-item${isActive ? " dash-nav-item--active" : ""}${collapsed ? " dash-nav-item--collapsed" : ""}`}
        onClick={() => item.path && navigate(item.path)}
        role="button"
        tabIndex={0}
        aria-current={isActive ? "page" : undefined}
        onKeyDown={(e) => e.key === "Enter" && item.path && navigate(item.path)}
        title={collapsed ? item.label : undefined}
      >
        <span className="dash-nav-item__icon">{item.icon}</span>
        {!collapsed && (
          <span className="dash-nav-item__label">{item.label}</span>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        ref={rowRef}
        className={`dash-nav-item${isChildActive ? " dash-nav-item--parent-active" : ""}${collapsed ? " dash-nav-item--collapsed" : ""}`}
        onClick={() => !collapsed && setOpen((o) => !o)}
        role="button"
        tabIndex={0}
        title={collapsed ? item.label : undefined}
      >
        <span className="dash-nav-item__icon">{item.icon}</span>
        {!collapsed && (
          <>
            <span className="dash-nav-item__label">{item.label}</span>
            <span
              className={`dash-nav-item__chevron${open ? " dash-nav-item__chevron--open" : ""}`}
            >
              <ChevronDown size={14} />
            </span>
          </>
        )}
      </div>

      {!collapsed && (
        <div
          className="dash-submenu"
          style={{
            maxHeight: open ? item.children!.length * 40 + "px" : "0px",
          }}
        >
          {item.children!.map((child) => (
            <div
              key={child.path}
              className={`dash-submenu-item${trimSlash(child.path) === activePath ? " dash-submenu-item--active" : ""}`}
              onClick={() => navigate(child.path)}
              role="button"
              tabIndex={0}
              aria-current={
                trimSlash(child.path) === activePath ? "page" : undefined
              }
            >
              {child.label}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
interface SideBarProps {
  nav?: NavSection[];
  collapsed: boolean;
  mobileOpen: boolean;
  onCollapseToggle: () => void;
  onMobileClose: () => void;
}

export default function SideBar({
  nav,
  collapsed,
  mobileOpen,
  onCollapseToggle,
}: SideBarProps) {
  const { pathname } = useLocation();
  const activePath = resolveActivePath(nav ?? [], pathname);
  const { mutate: logout, isPending: loggingOut } = useLogoutUser();
  const appName = import.meta.env.VITE_APP_NAME;

  return (
    <aside
      className={[
        "dash-sidebar",
        collapsed ? "dash-sidebar--collapsed" : "",
        mobileOpen ? "dash-sidebar--mobile-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ── Logo + collapse toggle ── */}
      <div className="dash-sidebar__logo">
        <img src="/logo.png" alt="logo" className="dash-sidebar__logo-icon" />
        {!collapsed && (
          <span className="dash-sidebar__logo-text">{appName}</span>
        )}
        <button
          className="dash-sidebar__collapse-btn"
          onClick={onCollapseToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="dash-sidebar__nav">
        {(nav ?? []).map((section) => (
          <div key={section.section} className="dash-sidebar__section">
            {!collapsed && (
              <p className="dash-sidebar__section-label">{section.section}</p>
            )}
            {collapsed && <div className="dash-sidebar__section-divider" />}
            {section.items.map((item) => (
              <NavItemRow
                key={item.label}
                item={item}
                activePath={activePath}
                collapsed={collapsed}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* ── User / Logout footer ── */}
      <div className="dash-sidebar__footer">
        {/* Logout button */}
        <button
          className={`dash-sidebar__logout-btn${collapsed ? " collapsed" : ""}`}
          onClick={() => logout()}
          disabled={loggingOut}
          title="Logout"
          aria-label="Logout"
        >
          <LogOut size={15} />
          {!collapsed && (
            <span>{loggingOut ? "Signing out…" : "Sign Out"}</span>
          )}
        </button>
      </div>
    </aside>
  );
}
