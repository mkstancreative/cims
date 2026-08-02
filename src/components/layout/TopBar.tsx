import { useState, useRef, useEffect } from "react";
import { Sun, Moon, ChevronDown, LogOut, Menu } from "lucide-react";
import { useTheme } from "../../context/useTheme";
import { useLogoutUser } from "../../hooks/useAuth";
import { NotificationIcon } from "../ui/NotificationCenter";

type TopBarProps = {
  pageTitle?: string;
  breadcrumb?: string[];
  userName?: string;
  userInitials?: string;
  userRole?: string;
  collapsed?: boolean;
  onMobileMenuToggle?: () => void;
};

export default function TopBar({
  pageTitle = "Dashboard",
  breadcrumb = ["Home", "Dashboard"],
  userName = "User",
  userInitials = "U",
  userRole = "User",
  onMobileMenuToggle,
}: TopBarProps) {
  const { isDark, toggleTheme } = useTheme();
  const { mutate: logout, isPending: loggingOut } = useLogoutUser();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="dash-topbar">
      {/* Left: mobile menu + page title + breadcrumbs */}
      <div className="dash-topbar__left">
        {/* Mobile hamburger */}
        <button
          className="dash-topbar__icon-btn dash-topbar__mobile-menu-btn"
          onClick={onMobileMenuToggle}
          aria-label="Toggle menu"
          title="Menu"
        >
          <Menu size={16} />
        </button>

        <div className="dash-topbar__title-block">
          <h1 className="dash-topbar__title">{pageTitle}</h1>
          <div className="dash-topbar__breadcrumb">
            {breadcrumb.map((crumb, i) => (
              <span
                key={crumb}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                {i > 0 && (
                  <span className="dash-topbar__breadcrumb-sep">/</span>
                )}
                <span
                  className={
                    i === breadcrumb.length - 1
                      ? "dash-topbar__breadcrumb-current"
                      : ""
                  }
                >
                  {crumb}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div className="dash-topbar__right">
        {/* Theme toggle */}
        <button
          id="theme-toggle-btn"
          className="dash-topbar__icon-btn"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}
          title={isDark ? "Light mode" : "Dark mode"}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <NotificationIcon />

        <div className="dash-topbar__divider" />

        {/* User avatar + dropdown */}
        <div className="dash-topbar__user-menu" ref={menuRef}>
          <button
            className="dash-topbar__avatar-btn"
            aria-label="User menu"
            onClick={() => setUserMenuOpen((o) => !o)}
          >
            <div className="dash-topbar__avatar">{userInitials}</div>
            <span className="dash-topbar__user-name">{userName}</span>
            <ChevronDown
              size={13}
              color="var(--color-text-subtle)"
              className="dash-topbar__user-chevron"
              style={{
                transform: userMenuOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <div className="dash-topbar__dropdown">
              {/* User info header */}
              <div className="dash-topbar__dropdown-header">
                <div className="dash-topbar__dropdown-avatar">
                  {userInitials}
                </div>
                <div>
                  <p className="dash-topbar__dropdown-name">{userName}</p>
                  <p className="dash-topbar__dropdown-role">{userRole}</p>
                </div>
              </div>

              <div className="dash-topbar__dropdown-divider" />

              <div className="dash-topbar__dropdown-divider" />

              <button
                className="dash-topbar__dropdown-item danger"
                disabled={loggingOut}
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
              >
                <LogOut size={14} />
                <span>{loggingOut ? "Signing out…" : "Sign Out"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
