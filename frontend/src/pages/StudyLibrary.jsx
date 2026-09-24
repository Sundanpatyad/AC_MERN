import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiConnector } from "../services/apiConnector";
import { pdfEndpoints } from "../services/apis";
import { toast } from "@/utils/toast";
import Footer from "../components/common/Footer";

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const PAGE_SIZE = 6;

const CardPreview = ({ id }) => {
  const [failed, setFailed] = useState(false);
  return (
    <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-[#f6f3ec]">
      {failed ? (
        <div className="flex h-full items-center justify-center text-[9px] font-semibold tracking-wider text-[#8a8175]">
          PDF
        </div>
      ) : (
        <img
          src={pdfEndpoints.PREVIEW(id)}
          alt=""
          className="h-full w-full object-cover object-top"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
};

const StudyLibrary = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [materials, setMaterials] = useState([]);
  const [exams, setExams] = useState([]);
  const [openExam, setOpenExam] = useState(null);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [buyingId, setBuyingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const sentinelRef = useRef(null);
  const pageRef = useRef(1);
  const requestRef = useRef(0);
  const busyRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPage = async (page, append) => {
    if (append && busyRef.current) return;
    const requestId = ++requestRef.current;
    busyRef.current = true;
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      if (!openExam) {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (selectedCategory !== "all") params.set("category", selectedCategory);
        const response = await apiConnector("GET", `${pdfEndpoints.EXAMS}?${params}`);
        if (requestId !== requestRef.current) return;
        const next = response.data?.data || [];
        setExams(next);
        const requested = searchParams.get("exam");
        if (requested && !openExam) {
          const match = next.find((item) => item._id === requested);
          if (match) setOpenExam(match);
        }
        setMaterials([]);
        setTotal(next.length);
        setHasMore(false);
        setCategories(response.data?.categories || []);
        pageRef.current = 1;
        return;
      }
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        exam: openExam._id,
      });
      if (query) params.set("q", query);
      const response = await apiConnector("GET", `${pdfEndpoints.LIST}?${params}`);
      if (requestId !== requestRef.current) return;
      const next = response.data?.data || [];
      setMaterials((current) => (append ? [...current, ...next] : next));
      setTotal(response.data?.total || 0);
      setHasMore(Boolean(response.data?.hasMore));
      pageRef.current = page;
    } catch {
      if (requestId === requestRef.current) toast.error("Couldn't load study material");
    } finally {
      if (requestId === requestRef.current) {
        busyRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    pageRef.current = 1;
    fetchPage(1, false);
  }, [query, selectedCategory, token, openExam?._id]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || !hasMore || loading || loadingMore || busyRef.current) return;
        fetchPage(pageRef.current + 1, true);
      },
      { rootMargin: "240px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, materials.length]);

  const buy = async (item) => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      setBuyingId(item._id);
      const response = await apiConnector("POST", pdfEndpoints.ORDER(item._id));
      const order = response.data;
      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        toast.error("Could not open payment");
        return;
      }
      const checkout = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency || "INR",
        order_id: order.orderId,
        name: "Awakening Classes",
        description: item.title,
        prefill: {
          name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          email: user?.email || "",
        },
        handler: async (payment) => {
          try {
            await apiConnector("POST", pdfEndpoints.VERIFY(item._id), {
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature,
            });
            toast.success("Unlocked");
            navigate(`/study-material/${item._id}`);
          } catch {
            toast.error("Payment received, but unlock failed. Contact support.");
          }
        },
      });
      checkout.open();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not start payment");
    } finally {
      setBuyingId(null);
    }
  };

  const buyExam = async (exam) => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      setBuyingId(exam._id);
      const response = await apiConnector("POST", pdfEndpoints.EXAM_ORDER(exam._id));
      const order = response.data;
      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        toast.error("Could not open payment");
        return;
      }
      const checkout = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency || "INR",
        order_id: order.orderId,
        name: "Awakening Classes",
        description: exam.name,
        prefill: {
          name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          email: user?.email || "",
        },
        handler: async (payment) => {
          try {
            await apiConnector("POST", pdfEndpoints.EXAM_VERIFY(exam._id), {
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature,
            });
            toast.success("Exam unlocked");
            setOpenExam({ ...exam, owned: true });
          } catch {
            toast.error("Payment received, but unlock failed. Contact support.");
          }
        },
      });
      checkout.open();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not start payment");
    } finally {
      setBuyingId(null);
    }
  };

  const openMaterial = (item) => {
    if (item.soldAsSet && !item.canView && openExam) {
      buyExam(openExam);
      return;
    }
    if (item.canView) {
      if (!token) {
        navigate("/login");
        return;
      }
      navigate(`/study-material/${item._id}`);
      return;
    }
    buy(item);
  };

  const chooseExam = (exam) => {
    setOpenExam(exam);
    const next = new URLSearchParams(searchParams);
    if (exam) next.set("exam", exam._id);
    else next.delete("exam");
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-page">
      <section className="border-b border-line">
        <div className="page-shell py-12 sm:py-16">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted">Library</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-fg sm:text-5xl">Study material</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Open an exam folder, then read the papers inside Awakening Classes.
          </p>
        </div>
      </section>

      <div className="page-shell pb-16 pt-8">
        <label className="mb-6 block max-w-md">
          <span className="sr-only">Search study material</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={openExam ? "Search papers in this exam" : "Search exams"}
            className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-fg outline-none focus:ring-2 focus:ring-fg/20"
          />
        </label>

        {categories.length > 0 && (
          <div className="mb-8 flex min-w-0 gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
            {[{ name: "all", label: "All", count: categories.reduce((sum, item) => sum + item.count, 0) }, ...categories.map((item) => ({ name: item.name, label: item.name, count: item.count }))].map((chip) => {
              const active = selectedCategory === chip.name;
              return (
                <button
                  key={chip.name}
                  type="button"
                  onClick={() => {
                    chooseExam(null);
                    setSelectedCategory(chip.name);
                  }}
                  className={`shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium ${
                    active ? "bg-fg text-page" : "bg-elevated text-fg hover:bg-surface"
                  }`}
                >
                  {chip.label}
                  <span className={`ml-2 text-xs ${active ? "text-page/70" : "text-muted"}`}>{chip.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {openExam && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => chooseExam(null)}
              className="text-sm font-medium text-muted hover:text-fg"
            >
              ← All exams
            </button>
            <div className="text-right">
              <p className="text-sm font-semibold text-fg">{openExam.name}</p>
              <p className="text-xs text-muted">
                {openExam.access === "paid"
                  ? openExam.owned
                    ? "Unlocked — every PDF in this exam is included"
                    : `₹${openExam.price} unlocks every PDF`
                  : "Each PDF is free or priced on its own"}
              </p>
            </div>
            {openExam.access === "paid" && !openExam.owned && (
              <button
                type="button"
                disabled={buyingId === openExam._id}
                onClick={() => buyExam(openExam)}
                className="rounded-lg bg-solid px-3 py-1.5 text-xs font-medium text-solid-fg hover:bg-solid-hover disabled:opacity-60"
              >
                {buyingId === openExam._id ? "..." : `Buy exam ₹${openExam.price}`}
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
                <div className="h-16 w-12 animate-pulse rounded-md bg-elevated" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-elevated" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-elevated" />
                </div>
              </div>
            ))}
          </div>
        ) : !openExam ? (
          exams.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
              <p className="text-lg font-medium text-fg">No exams found</p>
              <p className="mt-2 text-sm text-muted">Try another search or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {exams.map((exam) => {
                const locked = exam.access === "paid" && !exam.owned;
                return (
                  <article key={exam._id} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-subtle">
                      {exam.category}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold tracking-tight text-fg">{exam.name}</h2>
                    <p className="mt-2 text-sm text-muted">
                      {exam.pdfCount} PDF{exam.pdfCount === 1 ? "" : "s"}
                      {" · "}
                      {locked ? `₹${exam.price}` : exam.access === "paid" ? "Unlocked" : "Free to open"}
                    </p>
                    <button
                      type="button"
                      onClick={() => chooseExam(exam)}
                      className="btn-primary mt-5 w-full"
                    >
                      Open
                    </button>
                  </article>
                );
              })}
            </div>
          )
        ) : materials.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
            <p className="text-lg font-medium text-fg">No papers found</p>
            <p className="mt-2 text-sm text-muted">Try another search.</p>
          </div>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {materials.map((item) => {
              const locked = !item.canView;
              return (
                <li
                  key={item._id}
                  className="flex items-center gap-4 px-4 py-3 sm:px-5"
                >
                  <CardPreview id={item._id} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <h2 className="truncate text-sm font-semibold text-fg">{item.title}</h2>
                    {item.description ? (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                        {item.description}
                      </p>
                    ) : null}
                    <div className="mt-2.5 flex items-center justify-between gap-3">
                      <span className="truncate text-[11px] font-medium uppercase tracking-wide text-muted">
                        {item.category || "General"}
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        {locked && !item.soldAsSet ? (
                          <span className="text-sm font-semibold tabular-nums tracking-tight text-fg">
                            ₹{item.price}
                          </span>
                        ) : locked ? (
                          <span className="text-[11px] font-medium text-muted">Included</span>
                        ) : item.access === "paid" ? (
                          <span className="text-[11px] font-medium text-muted">Owned</span>
                        ) : (
                          <span className="rounded-md bg-elevated px-2 py-1 text-[11px] font-semibold tracking-wide text-fg">
                            Free
                          </span>
                        )}
                        <button
                          type="button"
                          disabled={buyingId === item._id}
                          onClick={() => openMaterial(item)}
                          className="rounded-lg bg-solid px-3 py-1.5 text-xs font-medium text-solid-fg hover:bg-solid-hover disabled:opacity-60"
                        >
                          {buyingId === item._id ? "..." : locked ? (item.soldAsSet ? "Buy exam" : "Buy") : "Read"}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div ref={sentinelRef} className="h-8" />
        {loadingMore && <p className="pb-6 text-center text-sm text-muted">Loading more...</p>}
      </div>
      <Footer />
    </div>
  );
};

export default StudyLibrary;
