import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { BiArrowBack, BiMinus, BiPlus } from "react-icons/bi";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { axiosInstance } from "../services/apiConnector";
import { pdfEndpoints } from "../services/apis";
import { getCachedPdf, saveCachedPdf } from "../services/pdfCache";
import { toast } from "@/utils/toast";

GlobalWorkerOptions.workerSrc = workerUrl;

const readError = async (error) => {
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

const clampZoom = (value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 20) / 20));

const PdfReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const hostRef = useRef(null);
  const pdfRef = useRef(null);
  const pinchRef = useRef(null);
  const [status, setStatus] = useState("Loading material...");
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [ready, setReady] = useState(false);

  const applyZoom = useCallback((value) => {
    setZoom((current) => clampZoom(typeof value === "number" ? value : current));
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return undefined;
    }

    let cancelled = false;
    const blockKeys = (event) => {
      const key = event.key?.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && (key === "s" || key === "p")) {
        event.preventDefault();
      }
    };
    const blockMenu = (event) => {
      if (hostRef.current?.contains(event.target)) event.preventDefault();
    };
    document.addEventListener("keydown", blockKeys);
    document.addEventListener("contextmenu", blockMenu);

    const open = async () => {
      try {
        const ticketResponse = await axiosInstance.post(pdfEndpoints.TICKET(id));
        const ticket = ticketResponse.data?.ticket;
        const revision = ticketResponse.data?.revision;
        if (!ticket) throw new Error("Could not open this material");

        let bytes = revision ? await getCachedPdf(id, revision) : null;
        if (!bytes) {
          const fileResponse = await axiosInstance.get(pdfEndpoints.FILE(id), {
            headers: { "X-AC-Viewer": ticket },
            responseType: "arraybuffer",
          });
          bytes = fileResponse.data;
          if (revision) await saveCachedPdf(id, revision, bytes);
        }
        if (cancelled) return;

        const pdf = await getDocument({ data: new Uint8Array(bytes) }).promise;
        if (cancelled) return;
        pdfRef.current = pdf;
        setReady(true);
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
      pdfRef.current = null;
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("contextmenu", blockMenu);
    };
  }, [id, navigate, token]);

  useEffect(() => {
    const pdf = pdfRef.current;
    const host = hostRef.current;
    if (!pdf || !host || !ready) return undefined;
    let cancelled = false;

    const draw = async () => {
      host.replaceChildren();
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        if (cancelled) return;
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.2 * zoom });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.className = "block h-auto w-full bg-white";
        canvas.addEventListener("dragstart", (event) => event.preventDefault());
        host.appendChild(canvas);
        await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      }
    };

    draw();
    return () => {
      cancelled = true;
    };
  }, [ready, zoom]);

  const watermark = "Awakening Classes";

  return (
    <div className="min-h-screen bg-page print:hidden">
      <div className="fixed top-16 inset-x-0 z-30 border-b border-line bg-page">
        <div className="mx-auto flex h-12 max-w-3xl items-center justify-between gap-3 px-4">
          <Link
            to="/study-material"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-fg"
          >
            <BiArrowBack className="text-lg" />
            Study material
          </Link>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-full border border-line px-1.5 py-0.5">
              <button
                type="button"
                onClick={() => applyZoom(zoom - 0.25)}
                disabled={zoom <= MIN_ZOOM}
                className="grid h-7 w-7 place-items-center text-fg disabled:text-muted"
                aria-label="Zoom out"
              >
                <BiMinus />
              </button>
              <span className="min-w-10 text-center text-[11px] font-medium text-fg">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => applyZoom(zoom + 0.25)}
                disabled={zoom >= MAX_ZOOM}
                className="grid h-7 w-7 place-items-center text-fg disabled:text-muted"
                aria-label="Zoom in"
              >
                <BiPlus />
              </button>
            </div>
            <span className="hidden rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-muted sm:inline">
              View only
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-3 pb-4 pt-16 sm:px-4">
        {status ? (
          <div className="rounded-xl border border-line bg-surface px-5 py-8 text-center">
            <p className="text-sm text-fg">{status}</p>
            {failed && status === "Purchase required" && (
              <Link
                to="/study-material"
                className="mt-4 inline-flex rounded-lg bg-solid px-4 py-2 text-sm font-medium text-solid-fg"
              >
                Back to library
              </Link>
            )}
          </div>
        ) : null}

        <div
          className="relative overflow-auto select-none"
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
          <div style={{ width: `${Math.max(100, zoom * 100)}%` }} className="min-w-full">
            <div ref={hostRef} className="space-y-3" />
          </div>
          {!status && (
            <div className="pointer-events-none absolute inset-0 flex flex-wrap content-start gap-16 overflow-hidden p-8 opacity-[0.12]">
              {Array.from({ length: 12 }).map((_, index) => (
                <span key={index} className="whitespace-nowrap text-sm text-black rotate-[-18deg]">
                  {watermark}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfReader;
