import { BASE_URL } from '../constants/api';

/**
 * DB / API may return /api/v1/media/... — resolve against the app API host.
 */
export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  if (!url.includes('/api/v1/media/')) return url;

  const base = String(BASE_URL || '').replace(/\/$/, '');
  if (url.startsWith('/api/v1/media/')) return `${base}${url}`;

  const idx = url.indexOf('/api/v1/media/');
  return `${base}${url.slice(idx)}`;
}
