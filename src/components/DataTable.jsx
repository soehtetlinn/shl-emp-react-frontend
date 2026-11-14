import { useMemo, useState } from "react";
import Avatar from "./Avatar.jsx";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown, Search } from "lucide-react";

const cellValue = (column, row) => (column.value ? column.value(row) : row[column.key]);
const isBlank = (value) => value === undefined || value === null || value === "";

function compare(a, b) {
  if (isBlank(a) || isBlank(b)) return isBlank(a) - isBlank(b); // blanks sort last
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

/**
 * Client-side table with search, sorting and paging.
 * `columns`: [{ key, header, value?(row), tone?(text), avatar?, number? }]; `actions(row)` renders the last cell.
 * `avatar` puts an initials badge before the text; `number` adds thousands separators.
 */
export default function DataTable({ columns, rows, actions, pageSize = 10, emptyText = "Nothing here yet." }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(null); // { index, direction: 1 | -1 }
  const [page, setPage] = useState(1);

  const prepared = useMemo(
    () => rows.map((row, index) => ({ row, id: row._id ?? index, cells: columns.map((c) => cellValue(c, row)) })),
    [rows, columns],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matching = needle
      ? prepared.filter((item) => item.cells.some((cell) => String(cell ?? "").toLowerCase().includes(needle)))
      : prepared;
    if (!sort) return matching;
    return [...matching].sort((a, b) => compare(a.cells[sort.index], b.cells[sort.index]) * sort.direction);
  }, [prepared, query, sort]);

  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const pageItems = visible.slice(start, start + pageSize);

  const toggleSort = (index) => {
    setSort((current) => {
      if (current?.index !== index) return { index, direction: 1 };
      return current.direction === 1 ? { index, direction: -1 } : null;
    });
  };

  return (
    <div className="table-card">
      <div className="table-toolbar">
        <label className="search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search…"
            aria-label="Search table"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <span className="table-count">
          {visible.length} {visible.length === 1 ? "record" : "records"}
        </span>
      </div>

      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              {columns.map((column, index) => {
                const direction = sort?.index === index ? sort.direction : 0;
                const SortIcon = direction === 1 ? ArrowUp : direction === -1 ? ArrowDown : ChevronsUpDown;
                return (
                  <th
                    key={column.key}
                    aria-sort={direction === 1 ? "ascending" : direction === -1 ? "descending" : "none"}
                  >
                    <button type="button" className="th-button" onClick={() => toggleSort(index)}>
                      {column.header}
                      <SortIcon size={14} className={direction ? "" : "sort-idle"} aria-hidden="true" />
                    </button>
                  </th>
                );
              })}
              {actions && <th className="actions-cell">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => (
              <tr key={item.id}>
                {columns.map((column, index) => {
                  const value = item.cells[index];
                  const tone = !isBlank(value) && column.tone?.(value);
                  return (
                    <td key={column.key}>
                      {isBlank(value) ? (
                        <span className="muted">—</span>
                      ) : tone ? (
                        <span className={`badge badge-${tone}`}>{value}</span>
                      ) : column.avatar ? (
                        <span className="cell-person">
                          <Avatar name={value} />
                          {String(value)}
                        </span>
                      ) : column.number ? (
                        Number(value).toLocaleString("en-US")
                      ) : (
                        String(value)
                      )}
                    </td>
                  );
                })}
                {actions && <td className="actions-cell">{actions(item.row)}</td>}
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr>
                <td className="table-empty" colSpan={columns.length + (actions ? 1 : 0)}>
                  {query ? "No records match your search." : emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="table-footer">
          <span>
            {start + 1}–{start + pageItems.length} of {visible.length}
          </span>
          <div className="pager">
            <button
              type="button"
              className="icon-btn"
              aria-label="Previous page"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            <span>
              Page {currentPage} of {pageCount}
            </span>
            <button
              type="button"
              className="icon-btn"
              aria-label="Next page"
              disabled={currentPage === pageCount}
              onClick={() => setPage(currentPage + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
