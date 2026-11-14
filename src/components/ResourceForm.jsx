import { useEffect, useId, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { dateOnly } from "../resources/helpers.js";

// Field options understood here:
//   name, label, type      text | email | password | number | date | textarea | select | radio
//   required, placeholder
//   options                static [{ value, label }] for select / radio
//   source                 { path, label(option), filter?(option, values) } — options loaded from the API
//   initial(row)           where the edit value comes from when it isn't simply row[name]
//   defaultValue           starting value on create
//   numeric                submit the value as a number (selects and radios hold strings)
//   readOnly               shown but never submitted
//   transient              editable but never submitted (cascade parents, confirmation inputs)
//   createOnly / editOnly  only present in that mode
//   resets                 names of fields to clear when this one changes
//   mustMatch              name of a field this one has to equal
//   notBefore              name of a date field this one may not precede

const asInput = (value) => (value === undefined || value === null ? "" : String(value));

/** Builds the starting values for a form from a row (edit) or from the field defaults (create). */
export function initialFormValues(fields, row, toValues) {
  const base = row ? (toValues ? toValues(row) : row) : {};
  return Object.fromEntries(
    fields.map((field) => {
      let value = row ? (field.initial ? field.initial(row) : base[field.name]) : field.defaultValue;
      if (field.type === "date") value = dateOnly(value);
      return [field.name, asInput(value)];
    }),
  );
}

function validate(fields, values) {
  for (const field of fields) {
    const value = values[field.name];
    if (field.mustMatch && value !== values[field.mustMatch]) {
      const other = fields.find((f) => f.name === field.mustMatch);
      return `${field.label} must match ${other?.label ?? field.mustMatch}.`;
    }
    if (field.notBefore && value && values[field.notBefore] && value < values[field.notBefore]) {
      const other = fields.find((f) => f.name === field.notBefore);
      return `${field.label} can't be earlier than ${other?.label ?? field.notBefore}.`;
    }
  }
  return "";
}

function toBody(fields, values) {
  const body = {};
  for (const field of fields) {
    if (field.readOnly || field.transient) continue;
    const value = values[field.name];
    const asNumber = (field.numeric || field.type === "number") && value !== "";
    body[field.name] = asNumber ? Number(value) : value;
  }
  return body;
}

function Field({ field, id, value, options, optionsReady, onChange }) {
  const common = {
    id,
    name: field.name,
    required: field.required,
    disabled: field.readOnly,
    value,
    onChange: (event) => onChange(event.target.value),
  };

  if (field.type === "textarea") return <textarea {...common} rows={3} />;

  if (field.type === "select") {
    const empty = !optionsReady ? "Loading…" : options.length === 0 && field.placeholder ? field.placeholder : "Select…";
    return (
      <select {...common}>
        <option value="">{empty}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "radio") {
    return (
      <div className="radio-group" role="radiogroup" aria-labelledby={`${id}-label`}>
        {options.map((option) => (
          <label key={option.value} className="radio">
            <input
              type="radio"
              name={field.name}
              value={option.value}
              checked={value === option.value}
              required={field.required}
              disabled={field.readOnly}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    );
  }

  return <input {...common} type={field.type} autoComplete={field.type === "password" ? "new-password" : "off"} />;
}

export default function ResourceForm({ fields, mode, initialValues, submitLabel = "Save", onSubmit, onCancel }) {
  const formId = useId();
  const activeFields = useMemo(
    () => fields.filter((f) => !(f.createOnly && mode === "edit") && !(f.editOnly && mode === "create")),
    [fields, mode],
  );
  const [values, setValues] = useState(initialValues);
  const [remote, setRemote] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Load every distinct option source once when the form opens.
  const sourcePaths = useMemo(
    () => [...new Set(activeFields.filter((f) => f.source).map((f) => f.source.path))],
    [activeFields],
  );
  useEffect(() => {
    let cancelled = false;
    Promise.all(sourcePaths.map((path) => api.get(path)))
      .then((lists) => {
        if (cancelled) return;
        setRemote(Object.fromEntries(sourcePaths.map((path, i) => [path, Array.isArray(lists[i]) ? lists[i] : []])));
      })
      .catch((loadError) => {
        if (cancelled) return;
        setRemote({});
        setError(`Could not load the form options: ${loadError.message}`);
      });
    return () => {
      cancelled = true;
    };
  }, [sourcePaths]);

  const optionsFor = (field) => {
    if (!field.source) return field.options ?? [];
    return (remote?.[field.source.path] ?? [])
      .filter((option) => !field.source.filter || field.source.filter(option, values))
      .map((option) => ({ value: String(option._id), label: field.source.label(option) }));
  };

  const change = (field, value) => {
    setValues((current) => {
      const next = { ...current, [field.name]: value };
      for (const name of field.resets ?? []) if (name in next) next[name] = "";
      return next;
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    const problem = validate(activeFields, values);
    if (problem) return setError(problem);
    setError("");
    setSaving(true);
    try {
      await onSubmit(toBody(activeFields, values), values);
    } catch (submitError) {
      setError(submitError.message || "Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-grid">
        {activeFields.map((field) => {
          const id = `${formId}-${field.name}`;
          return (
            <div key={field.name} className={`field${field.type === "textarea" ? " field-wide" : ""}`}>
              <label id={`${id}-label`} htmlFor={field.type === "radio" ? undefined : id}>
                {field.label}
                {field.required && !field.readOnly && <span className="required" aria-hidden="true"> *</span>}
              </label>
              <Field
                field={field}
                id={id}
                value={values[field.name] ?? ""}
                options={field.type === "select" || field.type === "radio" ? optionsFor(field) : []}
                optionsReady={!field.source || remote !== null}
                onChange={(value) => change(field, value)}
              />
            </div>
          );
        })}
      </div>

      {error && (
        <p className="alert alert-danger" role="alert">
          {error}
        </p>
      )}

      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
