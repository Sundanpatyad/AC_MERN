const DB_NAME = 'ac-study-pdfs';
const STORE = 'files';

const openDb = () =>
  new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const isPdfBytes = (bytes) => {
  if (!bytes) return false;
  const view =
    bytes instanceof ArrayBuffer
      ? new Uint8Array(bytes)
      : bytes instanceof Uint8Array
        ? bytes
        : null;
  if (!view || view.length < 5) return false;
  // %PDF-
  return (
    view[0] === 0x25 &&
    view[1] === 0x50 &&
    view[2] === 0x44 &&
    view[3] === 0x46 &&
    view[4] === 0x2d
  );
};

export const getCachedPdf = async (id, revision) => {
  try {
    const db = await openDb();
    if (!db || !id || !revision) return null;
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readonly');
      const request = tx.objectStore(STORE).get(String(id));
      request.onsuccess = () => {
        const row = request.result;
        if (row?.revision === revision && isPdfBytes(row?.bytes)) {
          resolve(row.bytes);
          return;
        }
        resolve(null);
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

export const saveCachedPdf = async (id, revision, bytes) => {
  try {
    const db = await openDb();
    if (!db || !id || !revision || !isPdfBytes(bytes)) return;
    await new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put({ revision, bytes }, String(id));
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Cache is best-effort
  }
};
