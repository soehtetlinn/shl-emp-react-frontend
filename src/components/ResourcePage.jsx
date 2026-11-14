import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "../api/client.js";
import DataTable from "./DataTable.jsx";
import Modal from "./Modal.jsx";
import ResourceForm, { initialFormValues } from "./ResourceForm.jsx";
import { useToast } from "./Toast.jsx";

/**
 * A complete list / add / edit / delete screen driven by a resource definition
 * (see resources/helpers.js for the shape).
 */
export default function ResourcePage({ resource }) {
  const ctx = useOutletContext() ?? {};
  const notify = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState(null); // null | { row?: object }
  const [deleting, setDeleting] = useState(null); // null | { row, error, busy }

  const listPath = resource.list(ctx);

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const data = await api.get(listPath);
      const list = resource.unwrap ? resource.unwrap(data) : data;
      setRows(Array.isArray(list) ? list : []);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, [listPath, resource]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (body, values) => {
    const row = editing.row;
    const finalBody = resource.toBody ? resource.toBody(body, { row, values }) : body;
    if (row) await api.put(resource.update(ctx, row), finalBody);
    else await api.post(resource.create(ctx, values), finalBody);
    setEditing(null);
    notify(`${resource.singular} ${row ? "updated" : "added"}`);
    await load();
  };

  const confirmDelete = async () => {
    setDeleting((current) => ({ ...current, busy: true, error: "" }));
    try {
      await api.delete(resource.remove(ctx, deleting.row));
      setDeleting(null);
      notify(`${resource.singular} deleted`);
      await load();
    } catch (error) {
      setDeleting((current) => current && { ...current, busy: false, error: error.message });
    }
  };

  const rowActions = (row) => {
    const editable = resource.canEdit ? resource.canEdit(row) : true;
    return (
      <div className="row-actions">
        {resource.detailPath && (
          <Link className="icon-btn" to={resource.detailPath(row)} aria-label="View details" title="View details">
            <Eye size={16} />
          </Link>
        )}
        {resource.update && (
          <button
            type="button"
            className="icon-btn"
            aria-label="Edit"
            title={editable === true ? "Edit" : editable}
            disabled={editable !== true}
            onClick={() => setEditing({ row })}
          >
            <Pencil size={16} />
          </button>
        )}
        {resource.remove && (
          <button
            type="button"
            className="icon-btn icon-btn-danger"
            aria-label="Delete"
            title="Delete"
            onClick={() => setDeleting({ row, error: "", busy: false })}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    );
  };

  const hasActions = Boolean(resource.detailPath || resource.update || resource.remove);
  const mode = editing?.row ? "edit" : "create";

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h1>{resource.title}</h1>
          {resource.description && <p className="page-subtitle">{resource.description}</p>}
        </div>
        {resource.create && (
          <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>
            <Plus size={16} aria-hidden="true" />
            Add {resource.singular}
          </button>
        )}
      </header>

      {loadError && (
        <div className="alert alert-danger" role="alert">
          Could not load {resource.title.toLowerCase()}: {loadError}{" "}
          <button type="button" className="link-btn" onClick={load}>
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading" role="status">
          <span className="spinner" aria-hidden="true" />
          Loading…
        </div>
      ) : (
        <DataTable
          columns={resource.columns}
          rows={rows}
          actions={hasActions ? rowActions : undefined}
          emptyText={`No ${resource.title.toLowerCase()} yet.`}
        />
      )}

      {editing && (
        <Modal
          title={mode === "edit" ? (resource.editTitle ?? `Edit ${resource.singular}`) : `Add ${resource.singular}`}
          size={resource.fields.length > 6 ? "lg" : "md"}
          onClose={() => setEditing(null)}
        >
          <ResourceForm
            fields={resource.fields}
            mode={mode}
            initialValues={initialFormValues(resource.fields, editing.row, resource.toValues)}
            submitLabel={mode === "edit" ? "Save changes" : `Add ${resource.singular}`}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {deleting && (
        <Modal title={`Delete ${resource.singular}`} size="sm" onClose={() => setDeleting(null)}>
          <p>Delete this record? This can't be undone.</p>
          {deleting.error && (
            <p className="alert alert-danger" role="alert">
              {deleting.error}
            </p>
          )}
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setDeleting(null)} disabled={deleting.busy}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={deleting.busy}>
              {deleting.busy ? "Deleting…" : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
