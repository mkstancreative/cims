import { useState, type ReactNode } from "react";
import "./style.css";
import TopBar from "./TopBar";
import SideBar from "./SideBar";
import Footer from "./Footer";
import type { NavSection } from "./types";
import { useAuth } from "../../context/useAuth";
import { ADMIN_NAV } from "../../config/AdminNavConfig";
import { STUDENT_NAV } from "../../config/SttudentNavConfig";
import { SUPERVISOR_NAV } from "../../config/SuperviorNavConfig";

// ─── Dashboard Layout ─────────────────────────────────────────────────────────
type DashBoardLayoutProps = {
  children?: ReactNode;
  pageTitle?: string;
  breadcrumb?: string[];
};

export default function DashBoardLayout({
  children,
  pageTitle,
  breadcrumb,
}: DashBoardLayoutProps) {
  const { user } = useAuth();

  // Auto-select nav based on role — no layout needs to pass it manually
  const nav: NavSection[] =
    user?.role === "admin" || user?.role === "coordinator"
      ? (ADMIN_NAV as NavSection[])
      : user?.role === "supervisor"
        ? (SUPERVISOR_NAV as NavSection[])
        : (STUDENT_NAV as NavSection[]);

  // Sidebar collapsed state — persisted in localStorage
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  // Mobile drawer open state
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sidebar_collapsed", String(next));
      } catch {
        /* localStorage unavailable */
      }
      return next;
    });
  };

  const toggleMobile = () => setMobileOpen((o) => !o);
  const closeMobile = () => setMobileOpen(false);

  const userName = user ? `${user.firstName} ${user.lastName}` : "User";
  const userInitials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "?";
  const userRole =
    user?.role === "admin"
      ? "Administrator"
      : user?.role === "coordinator"
        ? "Coordinator"
        : user?.role === "supervisor"
          ? "Supervisor"
          : "Student";

  return (
    <div className={`dash-shell${collapsed ? " dash-shell--collapsed" : ""}`}>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="dash-mobile-backdrop" onClick={closeMobile} />
      )}

      {/* Fixed Sidebar */}
      <SideBar
        nav={nav}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCollapseToggle={toggleCollapse}
        onMobileClose={closeMobile}
      />

      {/* Scrollable main column */}
      <div className="dash-main">
        {/* Fixed Topbar */}
        <TopBar
          pageTitle={pageTitle}
          breadcrumb={breadcrumb}
          userName={userName}
          userInitials={userInitials}
          userRole={userRole}
          collapsed={collapsed}
          onMobileMenuToggle={toggleMobile}
        />
        {/* Page content */}
        <main className="dash-content">{children}</main>
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
