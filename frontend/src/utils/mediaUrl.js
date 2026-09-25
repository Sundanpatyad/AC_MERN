import { BASE_URL } from "../services/apis";

/**
 * DB stores relative paths like /api/v1/media/...
 * Resolve against the current API host (local or production).
 */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("/api/v1/media/")) return url;

  const base = String(BASE_URL || "").replace(/\/$/, "");
  if (url.startsWith("/api/v1/media/")) return `${base}${url}`;

  const idx = url.indexOf("/api/v1/media/");
  return `${base}${url.slice(idx)}`;
}
