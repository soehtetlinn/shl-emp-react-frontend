// Shared building blocks for the resource definitions in this folder.
//
// A resource describes one CRUD screen as data:
//   title / singular    headings and button labels; `description` is an optional subtitle
//   list(ctx)           path to fetch rows from; `unwrap(data)` extracts the array if it is nested
//   create(ctx, values) / update(ctx, row) / remove(ctx, row)
//                       paths for each write; leave one out to hide that action
//   columns             [{ key, header, value?(row), tone?(text), avatar?, number? }] — see DataTable
//   fields              form fields, see components/ResourceForm.jsx
//   toValues(row)       maps a row to form values when the fields live in a nested object
//   toBody(body, info)  last-minute changes to the request body
//   canEdit(row)        true, or a sentence explaining why the row is locked
//   detailPath(row)     adds a "view" action that navigates to this route
//
// `ctx` carries route-level context, currently just `{ employeeId }`.

/** Trims an ISO timestamp down to the YYYY-MM-DD a date input understands. */
export const dateOnly = (value) => (value ? String(value).slice(0, 10) : "");

export const fullName = (person) =>
  [person?.FirstName, person?.MiddleName, person?.LastName].filter(Boolean).join(" ");

/** Options loaded from another endpoint, e.g. the company list for a "Company" select. */
export const optionsFrom = (path, label, filter) => ({ path, label, filter });

export const companySelect = (initial) => ({
  name: "CompanyID",
  label: "Company",
  type: "select",
  required: true,
  source: optionsFrom("/api/company", (company) => company.CompanyName),
  initial,
});

/** Country → State cascade used by the city and company forms. Neither value is submitted. */
export const countrySelect = (initial) => ({
  name: "CountryID",
  label: "Country",
  type: "select",
  required: true,
  transient: true,
  resets: ["StateID", "CityID"],
  source: optionsFrom("/api/country", (country) => country.CountryName),
  initial,
});

export const stateSelect = ({ initial, transient = false }) => ({
  name: "StateID",
  label: "State",
  type: "select",
  required: true,
  transient,
  resets: ["CityID"],
  placeholder: "Select a country first",
  source: optionsFrom(
    "/api/state",
    (state) => state.StateName,
    (state, values) => state.CountryID === values.CountryID || state.country?.[0]?._id === values.CountryID,
  ),
  initial,
});

export const LEAVE_STATUS = { 1: "Pending", 2: "Approved", 3: "Rejected" };
export const leaveStatusTone = (label) =>
  ({ Pending: "warning", Approved: "success", Rejected: "danger" })[label];

export const ACCOUNT_LEVELS = { 1: "Admin", 2: "HR", 3: "Employee" };

/** Turns a `{ value: label }` map into select options. */
export const toOptions = (map) => Object.entries(map).map(([value, label]) => ({ value, label }));
