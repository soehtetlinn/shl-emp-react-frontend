import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { isMock } from "../api/client.js";
import { DEMO_ACCOUNTS } from "../api/mock/seed.js";
import { NAVIGATION } from "../app/navigation.js";
import logo from "../assets/logo.png";

export default function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={NAVIGATION[user.role].home} replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (loginError) {
      setError(loginError.status ? "Invalid email or password." : loginError.message);
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <img className="login-logo" src={logo} alt="" />
        <h1>Sign in</h1>
        <p className="muted">SHL Employee Management</p>

        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            required
            autoFocus
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
            <p>Demo mode — pick an account to fill the form:</p>
            <div>
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="btn"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                    setError("");
                  }}
                >
                  {account.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
