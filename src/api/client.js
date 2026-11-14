import { ApiError } from "./errors.js";
import { getToken } from "./token.js";
import { unwrapDynamo } from "./dynamo.js";
import { mockRequest } from "./mock/server.js";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

/** True when the app runs against the in-browser demo backend instead of a real server. */
export const isMock = !API_URL || import.meta.env.VITE_API_MODE === "mock";

let unauthorizedHandler = null;

/** Called whenever the backend answers 401, so the session can be cleared in one place. */
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

async function httpRequest(method, path, body, token) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  // The backend expects the raw JWT in the `authorization` header (no "Bearer" prefix).
  if (token) headers.authorization = token;

  let response;
  try {
    response = await fetch(API_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Cannot reach the server. Check your connection and try again.");
  }

  const text = await response.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // Plain-text answer (the login endpoint returns the bare token) — keep it as text.
  }

  if (!response.ok) {
    const message =
      (typeof data === "string" && data) || data?.message || `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }
  return unwrapDynamo(data);
}

export async function request(method, path, body) {
  const token = getToken();
  try {
    return isMock
      ? await mockRequest({ method, path, body, token })
      : await httpRequest(method, path, body, token);
  } catch (error) {
    if (error.status === 401 && path !== "/api/login") unauthorizedHandler?.();
    throw error;
  }
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  delete: (path) => request("DELETE", path),
};
