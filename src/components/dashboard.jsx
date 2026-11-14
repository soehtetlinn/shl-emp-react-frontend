// Building blocks shared by the three dashboards.

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const formatNumber = (value) => Number(value || 0).toLocaleString("en-US");

/** Counts items per label: `countBy(employees, e => e.Gender)` → [{ label, value }], largest first. */
export function countBy(items, labelOf) {
  const counts = new Map();
  for (const item of items) {
    const label = labelOf(item) || "Unassigned";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

export function DashboardState({ data, error, onRetry, children }) {
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Could not load the dashboard: {error}{" "}
        <button type="button" className="link-btn" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="loading" role="status">
        <span className="spinner" aria-hidden="true" />
        Loading…
      </div>
    );
  }
  return children;
}

export function StatCard({ icon: Icon, label, value, hint, tone = "primary", to }) {
  const body = (
    <>
      <span className={`stat-icon stat-icon-${tone}`}>
        <Icon size={20} aria-hidden="true" />
      </span>
      <span className="stat-text">
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        {hint && <span className="stat-hint">{hint}</span>}
      </span>
    </>
  );
  return to ? (
    <Link className="stat-card stat-card-link" to={to}>
      {body}
    </Link>
  ) : (
    <div className="stat-card">{body}</div>
  );
}

export function Panel({ title, action, children, wide = false }) {
  return (
    <section className={`panel${wide ? " panel-wide" : ""}`}>
      <header className="panel-header">
        <h2>{title}</h2>
        {action && (
          <Link className="panel-link" to={action.to}>
            {action.label}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}

/** Horizontal bars for comparing a handful of categories. `items`: [{ label, value, tone? }]. */
export function BarList({ items, formatValue = formatNumber }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  if (items.length === 0) return <p className="panel-empty">No data yet.</p>;
  return (
    <ul className="bar-list">
      {items.map((item) => (
        <li key={item.label}>
          <span className="bar-label">{item.label}</span>
          <span className="bar-track">
            <span
              className={`bar-fill${item.tone ? ` bar-fill-${item.tone}` : ""}`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </span>
          <span className="bar-value">{formatValue(item.value)}</span>
        </li>
      ))}
    </ul>
  );
}
