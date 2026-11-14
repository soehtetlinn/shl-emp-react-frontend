import { countrySelect, stateSelect } from "./helpers.js";

export const countryResource = {
  title: "Countries",
  singular: "Country",
  list: () => "/api/country",
  create: () => "/api/country",
  update: (_ctx, row) => `/api/country/${row._id}`,
  remove: (_ctx, row) => `/api/country/${row._id}`,
  columns: [{ key: "CountryName", header: "Country" }],
  fields: [{ name: "CountryName", label: "Country", type: "text", required: true }],
};

export const stateResource = {
  title: "States",
  singular: "State",
  list: () => "/api/state",
  create: () => "/api/state",
  update: (_ctx, row) => `/api/state/${row._id}`,
  remove: (_ctx, row) => `/api/state/${row._id}`,
  columns: [
    { key: "country", header: "Country", value: (row) => row.country?.[0]?.CountryName },
    { key: "StateName", header: "State" },
  ],
  fields: [
    // Here the country is part of the record, so unlike the cascades it is submitted.
    { ...countrySelect((row) => row.country?.[0]?._id ?? row.CountryID), transient: false, resets: [] },
    { name: "StateName", label: "State", type: "text", required: true },
  ],
};

export const cityResource = {
  title: "Cities",
  singular: "City",
  list: () => "/api/city",
  create: () => "/api/city",
  update: (_ctx, row) => `/api/city/${row._id}`,
  remove: (_ctx, row) => `/api/city/${row._id}`,
  columns: [
    { key: "country", header: "Country", value: (row) => row.state?.[0]?.country?.[0]?.CountryName },
    { key: "state", header: "State", value: (row) => row.state?.[0]?.StateName },
    { key: "CityName", header: "City" },
  ],
  fields: [
    countrySelect((row) => row.state?.[0]?.country?.[0]?._id),
    stateSelect({ initial: (row) => row.state?.[0]?._id ?? row.StateID }),
    { name: "CityName", label: "City", type: "text", required: true },
  ],
};
