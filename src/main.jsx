import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { applyTheme, currentTheme } from "./app/theme.js";
import { ToastProvider } from "./components/Toast.jsx";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/dashboard.css";

// The old Create React App build registered a service worker that would keep serving
// the previous version to returning visitors. Remove it if it is still installed.
navigator.serviceWorker
  ?.getRegistrations()
  .then((registrations) => registrations.forEach((registration) => registration.unregister()))
  .catch(() => {});

applyTheme(currentTheme());

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
