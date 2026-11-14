import { companySelect, countrySelect, optionsFrom, stateSelect } from "./helpers.js";

const companyName = (row) => row.company?.[0]?.CompanyName;
const companyId = (row) => row.company?.[0]?._id ?? row.CompanyID;

/** Role, position and department are the same screen with a different name. */
function companyScoped({ title, singular, endpoint, nameField }) {
  return {
    title,
    singular,
    list: () => endpoint,
    create: () => endpoint,
    update: (_ctx, row) => `${endpoint}/${row._id}`,
    remove: (_ctx, row) => `${endpoint}/${row._id}`,
    columns: [
      { key: "company", header: "Company", value: companyName },
      { key: nameField, header: singular },
    ],
    fields: [
      companySelect(companyId),
      { name: nameField, label: singular, type: "text", required: true },
    ],
  };
}

export const roleResource = companyScoped({
  title: "Roles",
  singular: "Role",
  endpoint: "/api/role",
  nameField: "RoleName",
});

export const positionResource = companyScoped({
  title: "Positions",
  singular: "Position",
  endpoint: "/api/position",
  nameField: "PositionName",
});

export const departmentResource = companyScoped({
  title: "Departments",
  singular: "Department",
  endpoint: "/api/department",
  nameField: "DepartmentName",
});

const city = (row) => row.city?.[0];
const state = (row) => city(row)?.state?.[0];
const country = (row) => state(row)?.country?.[0];

export const companyResource = {
  title: "Companies",
  singular: "Company",
  list: () => "/api/company",
  create: () => "/api/company",
  update: (_ctx, row) => `/api/company/${row._id}`,
  remove: (_ctx, row) => `/api/company/${row._id}`,
  columns: [
    { key: "CompanyName", header: "Company" },
    { key: "Address", header: "Address" },
    { key: "city", header: "City", value: (row) => city(row)?.CityName },
    { key: "state", header: "State", value: (row) => state(row)?.StateName },
    { key: "country", header: "Country", value: (row) => country(row)?.CountryName },
    { key: "PostalCode", header: "Postal code" },
    { key: "Website", header: "Website" },
    { key: "Email", header: "Email" },
    { key: "ContactPerson", header: "Contact person" },
    { key: "ContactNo", header: "Contact no." },
    { key: "FaxNo", header: "Fax no." },
    { key: "PanNo", header: "PAN no." },
    { key: "GSTNo", header: "GST no." },
    { key: "CINNo", header: "CIN no." },
  ],
  fields: [
    { name: "CompanyName", label: "Company name", type: "text", required: true },
    { name: "Address", label: "Address", type: "textarea", required: true },
    countrySelect((row) => country(row)?._id),
    stateSelect({ initial: (row) => state(row)?._id, transient: true }),
    {
      name: "CityID",
      label: "City",
      type: "select",
      required: true,
      placeholder: "Select a state first",
      source: optionsFrom(
        "/api/city",
        (option) => option.CityName,
        (option, values) => option.StateID === values.StateID || option.state?.[0]?._id === values.StateID,
      ),
      initial: (row) => city(row)?._id ?? row.CityID,
    },
    { name: "PostalCode", label: "Postal code", type: "text", required: true },
    { name: "Website", label: "Website", type: "text", required: true },
    { name: "Email", label: "Email", type: "email", required: true },
    { name: "ContactPerson", label: "Contact person", type: "text", required: true },
    { name: "ContactNo", label: "Contact no.", type: "text", required: true },
    { name: "FaxNo", label: "Fax no.", type: "text" },
    { name: "PanNo", label: "PAN no.", type: "text" },
    { name: "GSTNo", label: "GST no.", type: "text" },
    { name: "CINNo", label: "CIN no.", type: "text" },
  ],
};
