import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LogOut, Menu, Moon, RotateCcw, Sun } from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { isMock } from "../api/client.js";
import { resetMockDb } from "../api/mock/server.js";
import { NAVIGATION } from "../app/navigation.js";
import { currentTheme, saveTheme } from "../app/theme.js";
import logo from "../assets/logo.png";
import Avatar from "./Avatar.jsx";
import Modal from "./Modal.jsx";

const isNarrow = () => window.matchMedia("(max-width: 860px)").matches;

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() => !isNarrow());
  const [theme, setTheme] = useState(currentTheme);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const nav = NAVIGATION[user.role];

  // On small screens the sidebar is an overlay: close it after navigating.
  useEffect(() => {
    if (isNarrow()) setSidebarOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    saveTheme(next);
    setTheme(next);
  };

  const resetData = () => {
    resetMockDb();
    // Reload so every screen starts again from the restored data.
    window.location.reload();
  };

  return (
    <div className={`shell${sidebarOpen ? "" : " sidebar-closed"}`}>
      <aside className="sidebar" aria-label="Main navigation">
        <div className="brand">
          <img src={logo} alt="" />
          <div>
            <strong>SHL</strong>
            <span>Employee Management</span>
          </div>
        </div>
        <nav>
          {nav.groups.map((group, index) => (
            <div key={group.label ?? index} className="nav-group">
              {group.label && <p className="sidebar-section">{group.label}</p>}
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className="nav-link">
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <button type="button" className="sidebar-backdrop" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />

      <div className="main">
        <header className="topbar">
          <button
            type="button"
            className="icon-btn"
            aria-label={sidebarOpen ? "Hide menu" : "Show menu"}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <Menu size={20} />
          </button>

          <div className="topbar-tools">
            {isMock && (
              <button
                type="button"
                className="icon-btn"
                aria-label="Reset sample data"
                title="Reset sample data"
                onClick={() => setConfirmingReset(true)}
              >
                <RotateCcw size={18} />
              </button>
            )}
            <button
              type="button"
              className="icon-btn"
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              title={theme === "dark" ? "Light theme" : "Dark theme"}
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="topbar-user">
              <Avatar name={user.name} size={34} />
              <div className="topbar-user-text">
                <strong>{user.name}</strong>
                <span>{nav.label}</span>
              </div>
            </div>
            <button type="button" className="btn btn-quiet" onClick={logout}>
              <LogOut size={16} aria-hidden="true" />
              <span className="hide-narrow">Log out</span>
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>

      {confirmingReset && (
        <Modal title="Reset sample data" size="sm" onClose={() => setConfirmingReset(false)}>
          <p>
            This restores the original sample data and discards every change made in this browser. It can't be
            undone.
          </p>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setConfirmingReset(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={resetData}>
              Reset data
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
