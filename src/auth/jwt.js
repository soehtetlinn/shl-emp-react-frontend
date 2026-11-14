function base64UrlToText(input) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function textToBase64Url(text) {
  const binary = String.fromCharCode(...new TextEncoder().encode(text));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Reads a JWT payload without verifying it. Returns null for anything malformed or expired. */
export function decodeJwt(token) {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(base64UrlToText(parts[1]));
    if (!payload || typeof payload !== "object") return null;
    if (payload.exp && payload.exp * 1000 <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Builds an unsigned JWT-shaped token. Only the demo backend uses this. */
export function encodeUnsignedJwt(payload) {
  const header = textToBase64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
  return `${header}.${textToBase64Url(JSON.stringify(payload))}.demo`;
}
