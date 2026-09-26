/** Stable React list key from Mongo id / string / number. */
export function itemKey(value: unknown, fallback?: string | number): string {
  if (value == null) return String(fallback ?? '');
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    const maybe = value as { _id?: unknown; id?: unknown; toString?: () => string };
    if (maybe._id != null && maybe._id !== value) return itemKey(maybe._id, fallback);
    if (typeof maybe.id === 'string' || typeof maybe.id === 'number') return String(maybe.id);
    if (typeof maybe.toString === 'function') {
      const s = maybe.toString();
      if (s && s !== '[object Object]') return s;
    }
  }
  return String(fallback ?? 'unknown');
}
