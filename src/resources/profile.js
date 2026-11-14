// Records that belong to a single employee. Shown to the employee themselves and to HR
// (inside an employee's detail page); `ctx.employeeId` says whose records are on screen.

import { LEAVE_STATUS, dateOnly, leaveStatusTone } from "./helpers.js";
import { GENDER_OPTIONS } from "./people.js";

/**
 * These endpoints share one shape:
 *   GET    /api/<name>/:employeeId          → { ..., [listKey]: [...] }
 *   POST   /api/<name>/:employeeId
 *   PUT    /api/<name>/:recordId
 *   DELETE /api/<name>/:employeeId/:recordId
 */
function employeeOwned({ endpoint, listKey, ...rest }) {
  return {
    list: (ctx) => `${endpoint}/${ctx.employeeId}`,
    unwrap: (data) => data?.[listKey] ?? [],
    create: (ctx) => `${endpoint}/${ctx.employeeId}`,
    update: (_ctx, row) => `${endpoint}/${row._id}`,
    remove: (ctx, row) => `${endpoint}/${ctx.employeeId}/${row._id}`,
    ...rest,
  };
}

export const educationResource = employeeOwned({
  title: "Education",
  singular: "Education",
  endpoint: "/api/education",
  listKey: "education",
  columns: [
    { key: "SchoolUniversity", header: "School / University" },
    { key: "Degree", header: "Degree" },
    { key: "Grade", header: "Grade" },
    { key: "PassingOfYear", header: "Passing year" },
  ],
  fields: [
    { name: "SchoolUniversity", label: "School / University", type: "text", required: true },
    { name: "Degree", label: "Degree", type: "text", required: true },
    { name: "Grade", label: "Grade", type: "text", required: true },
    { name: "PassingOfYear", label: "Passing year", type: "text", required: true },
  ],
});

export const familyResource = employeeOwned({
  title: "Dependents",
  singular: "Dependent",
  endpoint: "/api/family-info",
  listKey: "familyInfo",
  columns: [
    { key: "Name", header: "Name" },
    { key: "Relationship", header: "Relationship" },
    { key: "DOB", header: "Date of birth", value: (row) => dateOnly(row.DOB) },
    { key: "Occupation", header: "Occupation" },
  ],
  fields: [
    { name: "Name", label: "Name", type: "text", required: true },
    { name: "Relationship", label: "Relationship", type: "text", required: true },
    { name: "DOB", label: "Date of birth", type: "date", required: true },
    { name: "Occupation", label: "Occupation", type: "text", required: true },
  ],
});

export const workExperienceResource = employeeOwned({
  title: "Work Experience",
  singular: "Work Experience",
  endpoint: "/api/work-experience",
  listKey: "workExperience",
  columns: [
    { key: "CompanyName", header: "Company" },
    { key: "Designation", header: "Designation" },
    { key: "FromDate", header: "From", value: (row) => dateOnly(row.FromDate) },
    { key: "ToDate", header: "To", value: (row) => dateOnly(row.ToDate) },
  ],
  fields: [
    { name: "CompanyName", label: "Company", type: "text", required: true },
    { name: "Designation", label: "Designation", type: "text", required: true },
    { name: "FromDate", label: "From", type: "date", required: true },
    { name: "ToDate", label: "To", type: "date", required: true, notBefore: "FromDate" },
  ],
});

const LEAVE_TYPES = ["Sick Leave", "Casual Leave", "Privilege Leave"];
const PENDING = 1;

export const leaveApplicationResource = employeeOwned({
  title: "Leave Applications",
  singular: "Leave Application",
  endpoint: "/api/leave-application-emp",
  listKey: "leaveApplication",
  canEdit: (row) =>
    Number(row.Status) === PENDING || "An application can't be edited after it is approved or rejected.",
  // Employees can't set the status: every application they save is pending.
  toBody: (body) => ({ ...body, Status: PENDING }),
  columns: [
    { key: "Leavetype", header: "Leave type" },
    { key: "FromDate", header: "From", value: (row) => dateOnly(row.FromDate) },
    { key: "ToDate", header: "To", value: (row) => dateOnly(row.ToDate) },
    { key: "Reasonforleave", header: "Reason" },
    { key: "Status", header: "Status", value: (row) => LEAVE_STATUS[Number(row.Status)], tone: leaveStatusTone },
  ],
  fields: [
    {
      name: "Leavetype",
      label: "Leave type",
      type: "select",
      required: true,
      options: LEAVE_TYPES.map((type) => ({ value: type, label: type })),
    },
    { name: "FromDate", label: "From", type: "date", required: true },
    { name: "ToDate", label: "To", type: "date", required: true, notBefore: "FromDate" },
    { name: "Reasonforleave", label: "Reason for leave", type: "textarea", required: true },
  ],
});

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

/** Personal information is a single record per employee, so it has fields but no table. */
export const personalInfoFields = [
  { name: "FirstName", label: "First name", type: "text", readOnly: true },
  { name: "MiddleName", label: "Middle name", type: "text", readOnly: true },
  { name: "LastName", label: "Last name", type: "text", readOnly: true },
  { name: "Gender", label: "Gender", type: "radio", required: true, options: GENDER_OPTIONS },
  { name: "ContactNo", label: "Contact no.", type: "text", required: true },
  { name: "EmergencyContactNo", label: "Emergency contact no.", type: "text", required: true },
  { name: "Email", label: "Email", type: "email", required: true },
  { name: "PANcardNo", label: "PAN card no.", type: "text" },
  { name: "DOB", label: "Date of birth", type: "date", required: true },
  {
    name: "BloodGroup",
    label: "Blood group",
    type: "select",
    options: BLOOD_GROUPS.map((group) => ({ value: group, label: group })),
  },
  { name: "Hobbies", label: "Hobbies", type: "text" },
  { name: "PresentAddress", label: "Present address", type: "textarea", required: true },
  // "PermanetAddress" (sic) is the field name the backend uses.
  { name: "PermanetAddress", label: "Permanent address", type: "textarea", required: true },
];
