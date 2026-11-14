import { useState } from "react";
import { Navigate } from "react-router-dom";
import { ArrowRight, CalendarCheck, LayoutDashboard, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { isMock } from "../api/client.js";
import { DEMO_ACCOUNTS } from "../api/mock/seed.js";
import { NAVIGATION } from "../app/navigation.js";
import logo from "../assets/logo.png";

const HIGHLIGHTS = [
  { icon: Users, text: "Employee records, salaries and profiles in one place" },
  { icon: CalendarCheck, text: "Leave requests with one-click approval" },
  { icon: LayoutDashboard, text: "A dashboard for every role" },
  { icon: ShieldCheck, text: "Separate workspaces for Admin, HR and Employees" },
];

export default function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={NAVIGATION[user.role].home} replace />;

  const signIn = async (signInEmail, signInPassword) => {
    setError("");
    setBusy(true);
    try {
      await login(signInEmail.trim(), signInPassword);
    } catch (loginError) {
      setError(loginError.status ? "Invalid email or password." : loginError.message);
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <aside className="login-hero">
        <div className="brand">
          <img src={logo} alt="" />
          <div>
            <strong>SHL</strong>
            <span>Employee Management</span>
          </div>
        </div>
        <div>
          <h1>Your people, organised.</h1>
          <ul className="login-highlights">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text}>
                <Icon size={18} aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="login-footnote">Sample data only. Everything you change stays in this browser.</p>
      </aside>

      <main className="login-main">
        <form
          className="login-card"
          onSubmit={(event) => {
            event.preventDefault();
            signIn(email, password);
          }}
        >
          <div>
            <h2>Sign in</h2>
            <p className="muted">Use your work email and password.</p>
          </div>

          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error && (
            <p className="alert alert-danger" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>

          {isMock && (
            <div className="demo-accounts">
              <p>Or explore with a sample account</p>
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="demo-account"
                  disabled={busy}
                  onClick={() => signIn(account.email, account.password)}
                >
                  <span>
                    <strong>{account.label}</strong>
                    <span className="muted">{account.description}</span>
                  </span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
