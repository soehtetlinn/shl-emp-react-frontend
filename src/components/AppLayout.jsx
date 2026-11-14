import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { isMock } from "../api/client.js";
import { NAVIGATION } from "../app/navigation.js";
import logo from "../assets/logo.png";

const isNarrow = () => window.matchMedia("(max-width: 860px)").matches;

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() => !isNarrow());
  const nav = NAVIGATION[user.role];

  // On small screens the sidebar is an overlay: close it after navigating.
  useEffect(() => {
    if (isNarrow()) setSidebarOpen(false);
  }, [pathname]);

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
        <p className="sidebar-section">{nav.label}</p>
        <nav>
          {nav.items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className="nav-link">
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
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
          {isMock && <span className="badge badge-warning">Demo data</span>}
          <div className="topbar-user">
            <span className="user-name">{user.name}</span>
            <span className="badge badge-muted">{nav.label}</span>
            <button type="button" className="btn btn-quiet" onClick={logout}>
              <LogOut size={16} aria-hidden="true" />
              Log out
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
