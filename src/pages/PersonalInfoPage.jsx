import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Pencil } from "lucide-react";
import { api } from "../api/client.js";
import Modal from "../components/Modal.jsx";
import ResourceForm, { initialFormValues } from "../components/ResourceForm.jsx";
import { dateOnly } from "../resources/helpers.js";
import { personalInfoFields } from "../resources/profile.js";

function display(field, info) {
  const value = info[field.name];
  if (value === undefined || value === null || value === "") return "—";
  if (field.type === "date") return dateOnly(value);
  return field.options?.find((option) => option.value === String(value))?.label ?? String(value);
}

/** One employee's personal record: a read-only summary with an edit dialog. */
export default function PersonalInfoPage() {
  const { employeeId } = useOutletContext();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      setInfo(await api.get(`/api/personal-info/${employeeId}`));
    } catch (loadError) {
      setError(loadError.message);
    }
  }, [employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (body) => {
    await api.put(`/api/personal-info/${info._id ?? employeeId}`, body);
    setEditing(false);
    await load();
  };

  return (
    <section className="page">
      <header className="page-header">
        <h1>Personal Information</h1>
        {info && (
          <button type="button" className="btn btn-primary" onClick={() => setEditing(true)}>
            <Pencil size={16} aria-hidden="true" />
            Edit
          </button>
        )}
      </header>

      {error && (
        <div className="alert alert-danger" role="alert">
          Could not load personal information: {error}{" "}
          <button type="button" className="link-btn" onClick={load}>
            Try again
          </button>
        </div>
      )}

      {!info && !error && (
        <div className="loading" role="status">
          <span className="spinner" aria-hidden="true" />
          Loading…
        </div>
      )}

      {info && (
        <dl className="detail-card">
          {personalInfoFields.map((field) => (
            <div key={field.name} className={field.type === "textarea" ? "detail-wide" : undefined}>
              <dt>{field.label}</dt>
              <dd>{display(field, info)}</dd>
            </div>
          ))}
        </dl>
      )}

      {editing && (
        <Modal title="Edit Personal Information" size="lg" onClose={() => setEditing(false)}>
          <ResourceForm
            fields={personalInfoFields}
            mode="edit"
            initialValues={initialFormValues(personalInfoFields, info)}
            submitLabel="Save changes"
            onSubmit={save}
            onCancel={() => setEditing(false)}
          />
        </Modal>
      )}
    </section>
  );
}
