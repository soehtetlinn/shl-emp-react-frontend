import {
  ACCOUNT_LEVELS,
  LEAVE_STATUS,
  dateOnly,
  fullName,
  leaveStatusTone,
  optionsFrom,
  toOptions,
} from "./helpers.js";

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

// The flat `*Name` fallbacks cover rows coming from the DynamoDB-backed employee endpoint.
const employeeId = (row) => row._id ?? row.EmployeeId;

export const employeeResource = {
  title: "Employees",
  singular: "Employee",
  list: () => "/api/employee",
  create: () => "/api/employee",
  update: (_ctx, row) => `/api/employee/${employeeId(row)}`,
  // Employees are never deleted from here: set a termination date instead.
  detailPath: (row) => `/hr/employee/${employeeId(row)}/personal-info`,
  columns: [
    { key: "EmployeeCode", header: "Code" },
    { key: "name", header: "Name", value: fullName },
    { key: "Email", header: "Email" },
    {
      key: "Account",
      header: "Access",
      value: (row) => ACCOUNT_LEVELS[Number(row.Account)],
      tone: (label) => ({ Admin: "danger", HR: "info" })[label] ?? "muted",
    },
    { key: "role", header: "Role", value: (row) => row.role?.[0]?.RoleName ?? row.RoleName },
    { key: "position", header: "Position", value: (row) => row.position?.[0]?.PositionName ?? row.PositionName },
    {
      key: "department",
      header: "Department",
      value: (row) => row.department?.[0]?.DepartmentName ?? row.DepartmentName ?? row.Department,
    },
    { key: "ContactNo", header: "Contact no." },
    { key: "DOB", header: "Date of birth", value: (row) => dateOnly(row.DOB) },
    { key: "DateOfJoining", header: "Joined", value: (row) => dateOnly(row.DateOfJoining) },
    { key: "TerminateDate", header: "Terminated", value: (row) => dateOnly(row.TerminateDate) },
  ],
  fields: [
    { name: "Email", label: "Email", type: "email", required: true },
    { name: "Password", label: "Password", type: "password", required: true, createOnly: true },
    {
      name: "Account",
      label: "Account access",
      type: "select",
      required: true,
      numeric: true,
      options: toOptions(ACCOUNT_LEVELS),
    },
    {
      name: "RoleID",
      label: "Role",
      type: "select",
      required: true,
      source: optionsFrom("/api/role", (role) => role.RoleName),
      initial: (row) => row.role?.[0]?._id ?? row.RoleID,
    },
    { name: "Gender", label: "Gender", type: "radio", required: true, options: GENDER_OPTIONS },
    { name: "FirstName", label: "First name", type: "text", required: true },
    { name: "MiddleName", label: "Middle name", type: "text" },
    { name: "LastName", label: "Last name", type: "text", required: true },
    { name: "DOB", label: "Date of birth", type: "date", required: true },
    { name: "ContactNo", label: "Contact no.", type: "text", required: true },
    { name: "EmployeeCode", label: "Employee code", type: "text", required: true },
    {
      name: "DepartmentID",
      label: "Department",
      type: "select",
      required: true,
      source: optionsFrom("/api/department", (department) => department.DepartmentName),
      initial: (row) => row.department?.[0]?._id ?? row.DepartmentID,
    },
    {
      name: "PositionID",
      label: "Position",
      type: "select",
      required: true,
      source: optionsFrom("/api/position", (position) => position.PositionName),
      initial: (row) => row.position?.[0]?._id ?? row.PositionID,
    },
    { name: "DateOfJoining", label: "Date of joining", type: "date", required: true },
    { name: "TerminateDate", label: "Date of termination", type: "date" },
  ],
};

const salaryOf = (row) => row.salary?.[0] ?? {};

export const salaryResource = {
  title: "Salaries",
  singular: "Salary",
  // The list is "employees that have a salary", each carrying it in `salary[0]`.
  list: () => "/api/salary",
  create: (_ctx, values) => `/api/salary/${values.EmployeeID}`,
  update: (_ctx, row) => `/api/salary/${salaryOf(row)._id}`,
  remove: (_ctx, row) => `/api/salary/${row._id}`,
  toValues: (row) => ({
    ...salaryOf(row),
    EmployeeName: fullName(row),
    ConfirmAccountNo: salaryOf(row).AccountNo,
  }),
  columns: [
    { key: "employee", header: "Employee", value: fullName },
    { key: "BasicSalary", header: "Basic salary", value: (row) => salaryOf(row).BasicSalary },
    { key: "BankName", header: "Bank", value: (row) => salaryOf(row).BankName },
    { key: "AccountNo", header: "Account no.", value: (row) => salaryOf(row).AccountNo },
    { key: "AccountHolderName", header: "Account holder", value: (row) => salaryOf(row).AccountHolderName },
    { key: "IFSCcode", header: "IFSC code", value: (row) => salaryOf(row).IFSCcode },
    { key: "TaxDeduction", header: "Tax deduction", value: (row) => salaryOf(row).TaxDeduction },
  ],
  fields: [
    {
      name: "EmployeeID",
      label: "Employee",
      type: "select",
      required: true,
      transient: true,
      createOnly: true,
      source: optionsFrom("/api/employee", fullName),
    },
    { name: "EmployeeName", label: "Employee", type: "text", readOnly: true, editOnly: true },
    { name: "BasicSalary", label: "Basic salary", type: "number", required: true },
    { name: "BankName", label: "Bank name", type: "text", required: true },
    { name: "AccountNo", label: "Account no.", type: "text", required: true },
    {
      name: "ConfirmAccountNo",
      label: "Re-enter account no.",
      type: "text",
      required: true,
      transient: true,
      mustMatch: "AccountNo",
    },
    { name: "AccountHolderName", label: "Account holder name", type: "text", required: true },
    { name: "IFSCcode", label: "IFSC code", type: "text", required: true },
    { name: "TaxDeduction", label: "Tax deduction", type: "number", required: true },
  ],
};

const applicant = (row) => row.employee?.[0];

/** HR's view of every leave application: the only thing HR changes is the status. */
export const leaveReviewResource = {
  title: "Leave Applications",
  singular: "Leave Application",
  editTitle: "Review leave application",
  list: () => "/api/leave-application-hr",
  update: (_ctx, row) => `/api/leave-application-hr/${row._id}`,
  remove: (_ctx, row) => `/api/leave-application-hr/${applicant(row)?._id ?? row.EmployeeID}/${row._id}`,
  toValues: (row) => ({ ...row, Applicant: fullName(applicant(row)) }),
  columns: [
    { key: "code", header: "Employee code", value: (row) => applicant(row)?.EmployeeCode },
    { key: "name", header: "Name", value: (row) => fullName(applicant(row)) },
    { key: "Leavetype", header: "Leave type" },
    { key: "FromDate", header: "From", value: (row) => dateOnly(row.FromDate) },
    { key: "ToDate", header: "To", value: (row) => dateOnly(row.ToDate) },
    { key: "Reasonforleave", header: "Reason" },
    { key: "Status", header: "Status", value: (row) => LEAVE_STATUS[Number(row.Status)], tone: leaveStatusTone },
  ],
  fields: [
    { name: "Applicant", label: "Employee", type: "text", readOnly: true },
    { name: "Leavetype", label: "Leave type", type: "text", readOnly: true },
    { name: "FromDate", label: "From", type: "date", readOnly: true },
    { name: "ToDate", label: "To", type: "date", readOnly: true },
    { name: "Reasonforleave", label: "Reason", type: "textarea", readOnly: true },
    { name: "Status", label: "Status", type: "select", required: true, numeric: true, options: toOptions(LEAVE_STATUS) },
  ],
};
