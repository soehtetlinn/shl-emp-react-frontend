import { optionsFrom, toOptions } from "./helpers.js";

const PORTAL_STATUS = { 1: "Enabled", 0: "Disabled" };
const BID_STATUS = { 1: "Open", 2: "Closed", 3: "Cancelled", 4: "Awarded" };
const BID_RESOURCES = { 1: "Resource 1", 2: "Resource 2", 3: "Resource 3" };

export const portalResource = {
  title: "Portal Master",
  singular: "Portal",
  list: () => "/api/admin/portal",
  create: () => "/api/admin/portal",
  // The backend addresses portals by their numeric `ID` when updating.
  update: (_ctx, row) => `/api/admin/portal/${row.ID ?? row._id}`,
  remove: (_ctx, row) => `/api/admin/portal/${row._id}`,
  toBody: (body, { row }) => (row ? { ...body, _id: row._id, ID: row.ID } : body),
  columns: [
    { key: "PortalName", header: "Portal" },
    {
      key: "Status",
      header: "Status",
      value: (row) => PORTAL_STATUS[Number(row.Status)] ?? PORTAL_STATUS[0],
      tone: (label) => (label === "Enabled" ? "success" : "muted"),
    },
  ],
  fields: [
    { name: "PortalName", label: "Portal", type: "text", required: true },
    {
      name: "Status",
      label: "Status",
      type: "radio",
      required: true,
      numeric: true,
      options: [
        { value: "1", label: "Enabled" },
        { value: "0", label: "Disabled" },
      ],
      defaultValue: "1",
    },
  ],
};

export const projectBidResource = {
  title: "Project Bidding",
  singular: "Project Bid",
  list: () => "/api/admin/project-bid",
  create: () => "/api/admin/project-bid",
  update: (_ctx, row) => `/api/admin/project-bid/${row._id}`,
  remove: (_ctx, row) => `/api/admin/project-bid/${row._id}`,
  columns: [
    { key: "ProjectTitle", header: "Project" },
    { key: "portal", header: "Portal", value: (row) => row.portals?.[0]?.PortalName },
    { key: "ProjectURL", header: "URL" },
    { key: "EstimatedTime", header: "Est. time" },
    { key: "EstimatedCost", header: "Est. cost" },
    {
      key: "Status",
      header: "Status",
      value: (row) => BID_STATUS[Number(row.Status)],
      tone: (label) => ({ Open: "info", Awarded: "success", Cancelled: "danger" })[label] ?? "muted",
    },
    { key: "Remark", header: "Remark" },
  ],
  fields: [
    { name: "ProjectTitle", label: "Project title", type: "text", required: true },
    { name: "ProjectURL", label: "Project URL", type: "text", required: true },
    { name: "ProjectDesc", label: "Description", type: "textarea", required: true },
    {
      name: "Portal_ID",
      label: "Portal",
      type: "select",
      required: true,
      // Only enabled portals can receive new bids; keep the current one selectable when editing.
      source: optionsFrom(
        "/api/admin/portal",
        (portal) => portal.PortalName,
        (portal, values) => Number(portal.Status) === 1 || portal._id === values.Portal_ID,
      ),
      initial: (row) => row.portals?.[0]?._id ?? row.Portal_ID,
    },
    { name: "EstimatedTime", label: "Estimated time (hours)", type: "number", required: true },
    { name: "EstimatedCost", label: "Estimated cost", type: "number", required: true },
    { name: "ResourceID", label: "Resource", type: "select", required: true, numeric: true, options: toOptions(BID_RESOURCES) },
    { name: "Status", label: "Status", type: "select", required: true, numeric: true, options: toOptions(BID_STATUS) },
    { name: "Remark", label: "Remark", type: "textarea" },
  ],
};
