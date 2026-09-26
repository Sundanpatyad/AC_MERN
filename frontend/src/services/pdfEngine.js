import { GlobalWorkerOptions, getDocument, version } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

let configured = false;

/** Configure pdf.js web worker once (parse/render off main thread). */
export function ensurePdfWorker() {
  if (configured) return;
  try {
    GlobalWorkerOptions.workerSrc = workerUrl;
    configured = true;
  } catch (error) {
    console.error('pdf worker setup failed:', error);
  }
}

export function isPdfArrayBuffer(bytes) {
  if (!(bytes instanceof ArrayBuffer) || bytes.byteLength < 5) return false;
  const head = new Uint8Array(bytes, 0, 5);
  return (
    head[0] === 0x25 &&
    head[1] === 0x50 &&
    head[2] === 0x44 &&
    head[3] === 0x46 &&
    head[4] === 0x2d
  );
}

/**
 * Open a PDF in the worker. Copies bytes so the source buffer stays usable for cache.
 * Always destroy the returned `pdf` (and cancel `loadingTask`) on unmount.
 */
export function openPdfDocument(bytes) {
  ensurePdfWorker();
  if (!isPdfArrayBuffer(bytes)) {
    throw new Error('Could not open this material');
  }
  // Fresh copy for the worker — avoids detached ArrayBuffer / shared mutation issues
  const data = new Uint8Array(bytes.slice(0));
  const loadingTask = getDocument({
    data,
    // Full file already in memory
    disableStream: true,
    disableAutoFetch: true,
    // Safer in locked-down browsers
    isEvalSupported: false,
    useSystemFonts: true,
    // Cap worker memory pressure on huge files
    verbosity: 0,
  });
  return { loadingTask, version };
}

/** Device-aware scale — caps canvas pixels so mobile GPUs don't OOM. */
export function pageRenderScale(zoom, pageWidth = 612) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const base = 1.15 * zoom * dpr;
  const maxCssWidth = Math.min(window.innerWidth || 1200, 1200);
  const widthScale = (maxCssWidth * dpr) / Math.max(pageWidth, 1);
  return Math.min(base, widthScale, 3.5);
}
