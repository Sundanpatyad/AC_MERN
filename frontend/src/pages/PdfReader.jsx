import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { BiArrowBack, BiMinus, BiPlus } from "react-icons/bi";
import { axiosInstance } from "../services/apiConnector";
import { pdfEndpoints } from "../services/apis";
import { getCachedPdf, saveCachedPdf } from "../services/pdfCache";
import {
  ensurePdfWorker,
  isPdfArrayBuffer,
  openPdfDocument,
  pageRenderScale,
} from "../services/pdfEngine";
import { toast } from "@/utils/toast";
import { itemId, isMongoId } from "../utils/itemId";

ensurePdfWorker();

const EXAM_QUERY = "exam";

const readError = async (error) => {
  if (error?.message && !error?.response) return error.message;
  const data = error?.response?.data;
  if (data instanceof ArrayBuffer) {
    try {
      return JSON.parse(new TextDecoder().decode(data)).message;
    } catch {
      return null;
    }
  }
  return data?.message || null;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const clampZoom = (value) =>
  Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 20) / 20));

function PdfPage({ pdf, pageNumber, zoom }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [ratio, setRatio] = useState(1.414);
  const [visible, setVisible] = useState(false);
  const [pageError, setPageError] = useState(false);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "600px 0px", threshold: 0.01 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!visible || !pdf) return;
      setPageError(false);
      try {
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;

        const baseViewport = page.getViewport({ scale: 1 });
        setRatio(baseViewport.height / Math.max(baseViewport.width, 1));

        const scale = pageRenderScale(zoom, baseViewport.width);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            /* ignore */
          }
          renderTaskRef.current = null;
        }

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        const task = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task;
        await task.promise;
        renderTaskRef.current = null;
      } catch (error) {
        if (cancelled || error?.name === "RenderingCancelledException") return;
        console.error(`pdf page ${pageNumber}:`, error);
        setPageError(true);
      }
    };

    run();
    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          /* ignore */
        }
        renderTaskRef.current = null;
      }
    };
  }, [pdf, pageNumber, zoom, visible]);

  useEffect(() => {
    if (visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;
  }, [visible]);

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/5"
      style={{ aspectRatio: `${1} / ${ratio}` }}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        onDragStart={(event) => event.preventDefault()}
      />
      {pageError && (
        <div className="absolute inset-0 grid place-items-center bg-surface/80 text-xs text-muted">
          Page {pageNumber} failed
        </div>
      )}
    </div>
  );
}

const PdfReader = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const pinchRef = useRef(null);
  const loadingTaskRef = useRef(null);
  const pdfRef = useRef(null);
  const [status, setStatus] = useState("Loading material...");
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pdf, setPdf] = useState(null);
  const [pageCount, setPageCount] = useState(0);

  const examId = useMemo(() => {
    const fromQuery = itemId(searchParams.get(EXAM_QUERY));
    return isMongoId(fromQuery) ? fromQuery : "";
  }, [searchParams]);

  const libraryBackTo = examId
    ? `/study-material?${EXAM_QUERY}=${examId}`
    : "/study-material";

  const applyZoom = useCallback((value) => {
    setZoom((current) => clampZoom(typeof value === "number" ? value : current));
  }, []);

  const goBackToLibrary = useCallback(() => {
    navigate(libraryBackTo);
  }, [navigate, libraryBackTo]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return undefined;
    }

    const materialId = itemId(id);
    if (!isMongoId(materialId)) {
      setFailed(true);
      setStatus("Could not open this material");
      return undefined;
    }

    let cancelled = false;
    const blockKeys = (event) => {
      const key = event.key?.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && (key === "s" || key === "p")) {
        event.preventDefault();
      }
    };
    const blockMenu = (event) => event.preventDefault();
    document.addEventListener("keydown", blockKeys);
    document.addEventListener("contextmenu", blockMenu);

    const destroyDoc = async ({ updateState = true } = {}) => {
      if (updateState) {
        setPdf(null);
        setPageCount(0);
      }
      const doc = pdfRef.current;
      pdfRef.current = null;
      if (doc) {
        try {
          await doc.destroy();
        } catch {
          /* ignore */
        }
      }
      const task = loadingTaskRef.current;
      loadingTaskRef.current = null;
      if (task) {
        try {
          await task.destroy();
        } catch {
          /* ignore */
        }
      }
    };

    const open = async () => {
      try {
        setFailed(false);
        setStatus("Loading material...");
        await destroyDoc({ updateState: true });

        const ticketResponse = await axiosInstance.post(pdfEndpoints.TICKET(materialId));
        const ticket = ticketResponse.data?.ticket;
        const revision = ticketResponse.data?.revision;
        if (!ticket) throw new Error("Could not open this material");

        let bytes = revision ? await getCachedPdf(materialId, revision) : null;
        if (!bytes) {
          const fileResponse = await axiosInstance.get(pdfEndpoints.FILE(materialId), {
            headers: { "X-AC-Viewer": ticket },
            responseType: "arraybuffer",
          });
          bytes = fileResponse.data;
          if (!isPdfArrayBuffer(bytes)) {
            try {
              const msg = JSON.parse(new TextDecoder().decode(bytes))?.message;
              throw new Error(msg || "Could not open this material");
            } catch (inner) {
              if (inner?.message) throw inner;
              throw new Error("Could not open this material");
            }
          }
          if (revision) await saveCachedPdf(materialId, revision, bytes);
        }
        if (cancelled) return;

        const { loadingTask } = openPdfDocument(bytes);
        loadingTaskRef.current = loadingTask;
        const doc = await loadingTask.promise;
        if (cancelled) {
          try {
            await doc.destroy();
          } catch {
            /* ignore */
          }
          return;
        }
        pdfRef.current = doc;
        setPdf(doc);
        setPageCount(doc.numPages || 0);
        setStatus("");
      } catch (error) {
        if (cancelled) return;
        const message = (await readError(error)) || "Could not open this material";
        setFailed(true);
        setStatus(message);
        if (message !== "Purchase required") toast.error(message);
      }
    };

    open();
    return () => {
      cancelled = true;
      destroyDoc({ updateState: false });
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("contextmenu", blockMenu);
    };
  }, [id, navigate, token]);

  const watermark = "Awakening Classes";

  return (
    <div className="min-h-screen bg-page print:hidden">
      <div className="fixed top-16 inset-x-0 z-30 border-b border-line bg-page/95 backdrop-blur-sm">
        <div className="mx-auto flex h-10 max-w-5xl items-center justify-between gap-2 px-3 sm:px-4">
          <button
            type="button"
            onClick={goBackToLibrary}
            className="inline-flex items-center gap-1 text-sm font-medium text-fg"
          >
            <BiArrowBack className="text-base" />
            <span className="truncate">Back to papers</span>
          </button>
          <div className="flex items-center gap-2">
            {pageCount > 0 && (
              <span className="hidden text-[11px] tabular-nums text-muted sm:inline">
                {pageCount} pages
              </span>
            )}
            <div className="inline-flex items-center gap-0.5 rounded-lg border border-line px-1 py-0.5">
              <button
                type="button"
                onClick={() => applyZoom(zoom - 0.25)}
                disabled={zoom <= MIN_ZOOM}
                className="grid h-6 w-6 place-items-center text-fg disabled:text-muted"
                aria-label="Zoom out"
              >
                <BiMinus />
              </button>
              <span className="min-w-9 text-center text-[11px] font-medium tabular-nums text-fg">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => applyZoom(zoom + 0.25)}
                disabled={zoom >= MAX_ZOOM}
                className="grid h-6 w-6 place-items-center text-fg disabled:text-muted"
                aria-label="Zoom in"
              >
                <BiPlus />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-3 pb-4 pt-14 sm:px-4">
        {status ? (
          <div className="rounded-xl border border-line bg-surface px-5 py-8 text-center">
            <p className="text-sm text-fg">{status}</p>
            {failed && (
              <Link
                to={libraryBackTo}
                className="mt-4 inline-flex rounded-lg bg-solid px-4 py-2 text-sm font-medium text-solid-fg"
              >
                Back to library
              </Link>
            )}
          </div>
        ) : null}

        <div
          className="relative select-none"
          onDragStart={(event) => event.preventDefault()}
          onDoubleClick={() => applyZoom(zoom > 1 ? 1 : 2)}
          onWheel={(event) => {
            if (!event.ctrlKey && !event.metaKey) return;
            event.preventDefault();
            applyZoom(zoom + (event.deltaY < 0 ? 0.25 : -0.25));
          }}
          onTouchStart={(event) => {
            if (event.touches.length !== 2) return;
            const [a, b] = event.touches;
            pinchRef.current = {
              distance: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
              zoom,
            };
          }}
          onTouchMove={(event) => {
            if (event.touches.length !== 2 || !pinchRef.current) return;
            event.preventDefault();
            const [a, b] = event.touches;
            const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
            applyZoom(pinchRef.current.zoom * (distance / pinchRef.current.distance));
          }}
          onTouchEnd={() => {
            pinchRef.current = null;
          }}
        >
          <div
            style={{ width: `${Math.max(100, zoom * 100)}%` }}
            className="relative min-w-full space-y-3"
          >
            {pdf &&
              Array.from({ length: pageCount }, (_, index) => (
                <PdfPage
                  key={`${id}-${index + 1}`}
                  pdf={pdf}
                  pageNumber={index + 1}
                  zoom={zoom}
                />
              ))}
            {!status && pdf && (
              <div className="pointer-events-none absolute inset-0 flex flex-wrap content-start gap-16 overflow-hidden p-8 opacity-[0.12]">
                {Array.from({ length: 12 }).map((_, index) => (
                  <span
                    key={index}
                    className="whitespace-nowrap text-sm text-black rotate-[-18deg]"
                  >
                    {watermark}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfReader;
