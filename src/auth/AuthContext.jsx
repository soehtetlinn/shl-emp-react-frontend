import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setUnauthorizedHandler } from "../api/client.js";
import { getToken, setToken } from "../api/token.js";
import { decodeJwt } from "./jwt.js";

/** Account levels as the backend stores them. */
export const ROLES = { 1: "admin", 2: "hr", 3: "employee" };

function userFromToken(token) {
  const payload = decodeJwt(token);
  const role = payload && ROLES[Number(payload.Account)];
  if (!role || !payload._id) return null;
  const name = [payload.FirstName, payload.LastName].filter(Boolean).join(" ");
  return { id: payload._id, role, name: name || payload.Email || "User" };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => userFromToken(getToken()));

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const token = await api.post("/api/login", { email, password });
    const nextUser = userFromToken(token);
    if (!nextUser) throw new Error("Invalid email or password");
    setToken(token);
    setUser(nextUser);
    return nextUser;
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
