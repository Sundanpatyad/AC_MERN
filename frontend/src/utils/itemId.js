/** Stable Mongo id string for URLs / React keys. Avoids `[object Object]`. */
export function itemId(value) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') {
    const s = String(value).trim();
    return s === '[object Object]' ? '' : s;
  }
  if (typeof value === 'object') {
    if (value._id != null && value._id !== value) return itemId(value._id);
    if (typeof value.id === 'string' || typeof value.id === 'number') return itemId(value.id);
    if (typeof value.toHexString === 'function') {
      try {
        return String(value.toHexString());
      } catch {
        /* ignore */
      }
    }
    if (typeof value.toString === 'function') {
      const s = value.toString();
      if (s && s !== '[object Object]') return s;
    }
  }
  return '';
}

export function isMongoId(value) {
  return /^[a-f\d]{24}$/i.test(itemId(value));
}
