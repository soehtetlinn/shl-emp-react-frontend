// The in-browser backend. It implements the routes and response shapes of the original REST
// server, so a real server can be swapped in later (see api/client.js). Data lives in localStorage.

import { ApiError } from "../errors.js";
import { decodeJwt, encodeUnsignedJwt } from "../../auth/jwt.js";
import { seed } from "./seed.js";

const STORAGE_KEY = "shl.mockdb.v2";
const LATENCY_MS = import.meta.env?.MODE === "test" ? 0 : 180;
const SESSION_SECONDS = 8 * 60 * 60;

const ADMIN = 1;
const HR = 2;
const EMPLOYEE = 3;

let db = null;

function load() {
  if (db) return db;
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (raw) return (db = JSON.parse(raw));
  } catch {
    // Unreadable or corrupt storage: fall back to a fresh copy of the seed.
  }
  return (db = structuredClone(seed));
}

function save() {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Storage unavailable: changes last until the page reloads.
  }
}

/** Restores the demo data to its initial state. */
export function resetMockDb() {
  db = structuredClone(seed);
  save();
}

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const fail = (status, message) => {
  throw new ApiError(message, status);
};

/** Mimics a populated relation: an array holding the matching document, or nothing. */
const related = (collection, id) => load()[collection].filter((doc) => doc._id === id);

const pick = (source, fields) =>
  Object.fromEntries(fields.filter((f) => source?.[f] !== undefined).map((f) => [f, source[f]]));

const withCompany = (doc) => ({ ...doc, company: related("companies", doc.CompanyID) });
const withCountry = (state) => ({ ...state, country: related("countries", state.CountryID) });
const withState = (city) => ({ ...city, state: related("states", city.StateID).map(withCountry) });
const withCity = (company) => ({ ...company, city: related("cities", company.CityID).map(withState) });

function publicEmployee(employee) {
  const { Password: _password, ...rest } = employee;
  return {
    ...rest,
    role: related("roles", employee.RoleID),
    position: related("positions", employee.PositionID),
    department: related("departments", employee.DepartmentID),
  };
}

const STAFF = [ADMIN, HR];

/** Plain collections: GET list, POST, PUT /:id, DELETE /:id. */
const COLLECTIONS = {
  role: { store: "roles", fields: ["CompanyID", "RoleName"], view: withCompany, allow: STAFF },
  position: { store: "positions", fields: ["CompanyID", "PositionName"], view: withCompany, allow: STAFF },
  department: { store: "departments", fields: ["CompanyID", "DepartmentName"], view: withCompany, allow: STAFF },
  country: { store: "countries", fields: ["CountryName"], allow: STAFF },
  state: { store: "states", fields: ["CountryID", "StateName"], view: withCountry, allow: STAFF },
  city: { store: "cities", fields: ["StateID", "CityName"], view: withState, allow: STAFF },
  company: {
    store: "companies",
    fields: [
      "CompanyName", "Address", "CityID", "PostalCode", "Website", "Email",
      "ContactPerson", "ContactNo", "FaxNo", "PanNo", "GSTNo", "CINNo",
    ],
    view: withCity,
    allow: STAFF,
  },
  "admin/portal": { store: "portals", fields: ["PortalName", "Status"], allow: [ADMIN], idField: "ID" },
  "admin/project-bid": {
    store: "projectBids",
    fields: [
      "ProjectTitle", "ProjectURL", "ProjectDesc", "Portal_ID", "EstimatedTime",
      "EstimatedCost", "ResourceID", "Status", "Remark",
    ],
    view: (bid) => ({ ...bid, portals: related("portals", bid.Portal_ID) }),
    allow: [ADMIN],
  },
};

/** Per-employee collections: GET /:employeeId, POST /:employeeId, PUT /:id, DELETE /:employeeId/:id. */
const EMPLOYEE_COLLECTIONS = {
  education: { store: "education", key: "education", fields: ["SchoolUniversity", "Degree", "Grade", "PassingOfYear"] },
  "family-info": { store: "familyInfo", key: "familyInfo", fields: ["Name", "Relationship", "DOB", "Occupation"] },
  "work-experience": { store: "workExperience", key: "workExperience", fields: ["CompanyName", "Designation", "FromDate", "ToDate"] },
  "leave-application-emp": {
    store: "leaves",
    key: "leaveApplication",
    fields: ["Leavetype", "FromDate", "ToDate", "Reasonforleave", "Status"],
  },
};

/** A document cannot be deleted while any of these collections still point at it. */
const REFERENCED_BY = {
  companies: [["roles", "CompanyID"], ["positions", "CompanyID"], ["departments", "CompanyID"]],
  countries: [["states", "CountryID"]],
  states: [["cities", "StateID"]],
  cities: [["companies", "CityID"]],
  roles: [["employees", "RoleID"]],
  positions: [["employees", "PositionID"]],
  departments: [["employees", "DepartmentID"]],
  portals: [["projectBids", "Portal_ID"]],
};

const EMPLOYEE_FIELDS = [
  "Email", "Account", "RoleID", "Gender", "FirstName", "MiddleName", "LastName", "DOB",
  "ContactNo", "EmployeeCode", "DepartmentID", "PositionID", "DateOfJoining", "TerminateDate",
];
const PERSONAL_FIELDS = [
  "Gender", "ContactNo", "EmergencyContactNo", "Email", "PANcardNo", "DOB",
  "BloodGroup", "Hobbies", "PresentAddress", "PermanetAddress",
];
const SALARY_FIELDS = ["BasicSalary", "BankName", "AccountNo", "AccountHolderName", "IFSCcode", "TaxDeduction"];

function findOr404(store, id, idField = "_id") {
  const doc = load()[store].find((item) => String(item[idField]) === String(id) || item._id === id);
  return doc ?? fail(404, "Record not found");
}

function removeFrom(store, id) {
  const data = load();
  for (const [otherStore, field] of REFERENCED_BY[store] ?? []) {
    if (data[otherStore].some((doc) => doc[field] === id)) {
      fail(403, "This record is used by other records and cannot be deleted.");
    }
  }
  data[store] = data[store].filter((doc) => doc._id !== id);
}

function requireRole(user, allowed) {
  if (!allowed.includes(user.Account)) fail(403, "You are not allowed to perform this operation.");
}

/** Staff may act on any employee; an employee only on their own records. */
function requireAccessTo(user, employeeId) {
  if (user.Account === EMPLOYEE && user._id !== employeeId) {
    fail(403, "You are not allowed to perform this operation.");
  }
}

function assertEmailFree(email, exceptId) {
  const taken = load().employees.some(
    (e) => e._id !== exceptId && e.Email.toLowerCase() === String(email).toLowerCase(),
  );
  if (taken) fail(403, "An employee with this email already exists.");
}

function login(body) {
  const email = String(body?.email ?? "").trim().toLowerCase();
  const employee = load().employees.find(
    (e) => e.Email.toLowerCase() === email && e.Password === body?.password,
  );
  if (!employee) fail(401, "Invalid email or password");
  const now = Math.floor(Date.now() / 1000);
  return encodeUnsignedJwt({
    _id: employee._id,
    Account: employee.Account,
    FirstName: employee.FirstName,
    LastName: employee.LastName,
    iat: now,
    exp: now + SESSION_SECONDS,
  });
}

function authenticate(token) {
  const payload = decodeJwt(token);
  const user = payload && load().employees.find((e) => e._id === payload._id);
  return user ?? fail(401, "Your session has expired. Please sign in again.");
}

function handleCollection(config, user, method, [id], body) {
  requireRole(user, config.allow);
  const data = load();
  const view = config.view ?? ((doc) => doc);

  if (method === "GET" && !id) return data[config.store].map(view);
  if (method === "POST" && !id) {
    const doc = { _id: newId(), ...pick(body, config.fields) };
    if (config.idField) {
      doc[config.idField] = Math.max(0, ...data[config.store].map((d) => d[config.idField] ?? 0)) + 1;
    }
    data[config.store].push(doc);
    return view(doc);
  }
  if (method === "PUT" && id) {
    const doc = findOr404(config.store, id, config.idField);
    Object.assign(doc, pick(body, config.fields));
    return view(doc);
  }
  if (method === "DELETE" && id) {
    removeFrom(config.store, findOr404(config.store, id, config.idField)._id);
    return null;
  }
  return fail(404, "Not found");
}

function handleEmployeeCollection(config, user, method, [first, second], body) {
  const data = load();

  if (method === "PUT") {
    const doc = findOr404(config.store, first);
    requireAccessTo(user, doc.EmployeeID);
    Object.assign(doc, pick(body, config.fields));
    return doc;
  }

  const employee = findOr404("employees", first);
  requireAccessTo(user, employee._id);

  if (method === "GET") {
    return {
      _id: employee._id,
      FirstName: employee.FirstName,
      LastName: employee.LastName,
      [config.key]: data[config.store].filter((doc) => doc.EmployeeID === employee._id),
    };
  }
  if (method === "POST") {
    const doc = { _id: newId(), EmployeeID: employee._id, ...pick(body, config.fields) };
    data[config.store].push(doc);
    return doc;
  }
  if (method === "DELETE" && second) {
    data[config.store] = data[config.store].filter(
      (doc) => !(doc._id === second && doc.EmployeeID === employee._id),
    );
    return null;
  }
  return fail(404, "Not found");
}

function handleEmployee(user, method, [id], body) {
  requireRole(user, STAFF);
  const data = load();

  if (method === "GET" && !id) return data.employees.map(publicEmployee);
  if (method === "POST" && !id) {
    assertEmailFree(body?.Email);
    const employee = { _id: newId(), ...pick(body, [...EMPLOYEE_FIELDS, "Password"]) };
    data.employees.push(employee);
    return publicEmployee(employee);
  }
  if (method === "PUT" && id) {
    const employee = findOr404("employees", id);
    if (body?.Email) assertEmailFree(body.Email, employee._id);
    Object.assign(employee, pick(body, EMPLOYEE_FIELDS));
    return publicEmployee(employee);
  }
  return fail(404, "Not found");
}

function handleSalary(user, method, [id], body) {
  const data = load();

  // The one salary route open to employees: reading their own.
  if (method === "GET" && id) {
    const employee = findOr404("employees", id);
    requireAccessTo(user, employee._id);
    return {
      ...publicEmployee(employee),
      salary: data.salaries.filter((s) => s.EmployeeID === employee._id),
    };
  }
  requireRole(user, STAFF);

  if (method === "GET" && !id) {
    return data.employees
      .map((employee) => ({
        ...publicEmployee(employee),
        salary: data.salaries.filter((s) => s.EmployeeID === employee._id),
      }))
      .filter((employee) => employee.salary.length > 0);
  }
  if (method === "POST" && id) {
    const employee = findOr404("employees", id);
    if (data.salaries.some((s) => s.EmployeeID === employee._id)) {
      fail(403, "Salary information for this employee already exists.");
    }
    const salary = { _id: newId(), EmployeeID: employee._id, ...pick(body, SALARY_FIELDS) };
    data.salaries.push(salary);
    return salary;
  }
  if (method === "PUT" && id) {
    return Object.assign(findOr404("salaries", id), pick(body, SALARY_FIELDS));
  }
  if (method === "DELETE" && id) {
    data.salaries = data.salaries.filter((s) => s.EmployeeID !== id);
    return null;
  }
  return fail(404, "Not found");
}

function handlePersonalInfo(user, method, [id], body) {
  const employee = findOr404("employees", id);
  requireAccessTo(user, employee._id);

  if (method === "GET") return publicEmployee(employee);
  if (method === "PUT") {
    if (body?.Email) assertEmailFree(body.Email, employee._id);
    Object.assign(employee, pick(body, PERSONAL_FIELDS));
    return publicEmployee(employee);
  }
  return fail(404, "Not found");
}

function handleLeaveReview(user, method, [first, second], body) {
  requireRole(user, STAFF);
  const data = load();

  if (method === "GET" && !first) {
    return data.leaves.map((leave) => ({
      ...leave,
      employee: related("employees", leave.EmployeeID).map(publicEmployee),
    }));
  }
  if (method === "PUT" && first) {
    return Object.assign(findOr404("leaves", first), pick(body, ["Status"]));
  }
  if (method === "DELETE" && second) {
    data.leaves = data.leaves.filter((leave) => leave._id !== second);
    return null;
  }
  return fail(404, "Not found");
}

function route(method, segments, body, token) {
  if (segments[0] === "login" && method === "POST") return login(body);

  const user = authenticate(token);
  const isAdminRoute = segments[0] === "admin";
  const name = isAdminRoute ? segments.slice(0, 2).join("/") : segments[0];
  const rest = segments.slice(isAdminRoute ? 2 : 1);

  if (COLLECTIONS[name]) return handleCollection(COLLECTIONS[name], user, method, rest, body);
  if (EMPLOYEE_COLLECTIONS[name]) {
    return handleEmployeeCollection(EMPLOYEE_COLLECTIONS[name], user, method, rest, body);
  }
  if (name === "employee") return handleEmployee(user, method, rest, body);
  if (name === "salary") return handleSalary(user, method, rest, body);
  if (name === "personal-info") return handlePersonalInfo(user, method, rest, body);
  if (name === "leave-application-hr") return handleLeaveReview(user, method, rest, body);
  return fail(404, "Not found");
}

export async function mockRequest({ method, path, body, token }) {
  if (LATENCY_MS) await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
  const segments = path.replace(/^\/api\//, "").split("/").filter(Boolean);
  const result = route(method.toUpperCase(), segments, body, token);
  save();
  // Hand back a copy so callers can never mutate the stored documents.
  return result == null ? result : structuredClone(result);
}
