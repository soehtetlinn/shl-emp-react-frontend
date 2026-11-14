import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";

const ToastContext = createContext(() => {});
const VISIBLE_MS = 3200;

/** Short confirmations ("Role added") shown in the corner after an action. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const notify = useCallback((message, tone = "success") => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), VISIBLE_MS);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = toast.tone === "danger" ? CircleAlert : CheckCircle2;
          return (
            <div key={toast.id} className={`toast toast-${toast.tone}`}>
              <Icon size={18} aria-hidden="true" />
              {toast.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/** Returns `notify(message, tone?)`. */
export const useToast = () => useContext(ToastContext);
