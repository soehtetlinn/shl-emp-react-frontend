import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/** A native <dialog>: the browser handles focus trapping, Escape and the backdrop. */
export default function Modal({ title, size = "md", onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={ref}
      className={`modal modal-${size}`}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // A press that lands on the dialog element itself is a press on the backdrop.
      onMouseDown={(event) => event.target === ref.current && onClose()}
    >
      <header className="modal-header">
        <h2>{title}</h2>
        <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
          <X size={18} />
        </button>
      </header>
      <div className="modal-body">{children}</div>
    </dialog>
  );
}
