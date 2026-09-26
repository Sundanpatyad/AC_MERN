import { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery, useInfiniteQuery, useQueryClient } from 'react-query';
import { BiLockAlt, BiCheckCircle, BiChevronRight } from 'react-icons/bi';
import { BsFiletypePdf } from 'react-icons/bs';
import { apiConnector } from '../services/apiConnector';
import { pdfEndpoints } from '../services/apis';
import {
  STUDY_GC_MS,
  STUDY_STALE_MS,
  studyKeys,
  fetchStudyExams,
  fetchStudyMaterialsPage,
  prefetchStudyMaterials,
  invalidateStudyQueries,
} from '../services/studyMaterialCache';
import { toast } from '@/utils/toast';
import Footer from '../components/common/Footer';
import { itemId, isMongoId } from '../utils/itemId';

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const PAGE_SIZE = 8;
const EXAM_QUERY = 'exam';

const CardPreview = ({ id }) => {
  const [failed, setFailed] = useState(false);
  const mid = itemId(id);
  return (
    <div className="h-[4.25rem] w-12 shrink-0 overflow-hidden rounded-lg border border-line/80 bg-elevated shadow-sm">
      {failed || !isMongoId(mid) ? (
        <div className="flex h-full items-center justify-center text-[9px] font-semibold tracking-wider text-muted">
          PDF
        </div>
      ) : (
        <img
          src={pdfEndpoints.PREVIEW(mid)}
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
  const queryClient = useQueryClient();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [buyingId, setBuyingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const sentinelRef = useRef(null);
  const authed = Boolean(token);
  const examQuery = searchParams.get(EXAM_QUERY) || '';

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const examsKey = useMemo(
    () => studyKeys.exams({ query, category: selectedCategory, authed }),
    [query, selectedCategory, authed]
  );

  const {
    data: examsData,
    isLoading: examsLoading,
    isFetching: examsFetching,
    isPlaceholderData: examsPlaceholder,
  } = useQuery(examsKey, () => fetchStudyExams({ query, category: selectedCategory }), {
    staleTime: STUDY_STALE_MS,
    cacheTime: STUDY_GC_MS,
    keepPreviousData: true,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    onError: () => toast.error("Couldn't load study material"),
  });

  const exams = examsData?.exams || [];
  const categories = examsData?.categories || [];

  const openExam = useMemo(() => {
    if (!examQuery) return null;
    return exams.find((item) => itemId(item._id) === itemId(examQuery)) || null;
  }, [exams, examQuery]);

  const examId = openExam ? itemId(openExam._id) : '';
  const materialsKey = useMemo(
    () => studyKeys.materials({ examId, query, authed }),
    [examId, query, authed]
  );

  const {
    data: materialsPages,
    isLoading: materialsLoading,
    isFetching: materialsFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    materialsKey,
    ({ pageParam = 1 }) =>
      fetchStudyMaterialsPage({
        examId,
        query,
        page: pageParam,
        limit: PAGE_SIZE,
      }),
    {
      enabled: Boolean(examId),
      staleTime: STUDY_STALE_MS,
      cacheTime: STUDY_GC_MS,
      keepPreviousData: true,
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      getNextPageParam: (last) => (last?.hasMore ? last.page + 1 : undefined),
      onError: () => toast.error("Couldn't load study material"),
    }
  );

  const materials = useMemo(
    () => (materialsPages?.pages || []).flatMap((page) => page.items || []),
    [materialsPages]
  );
  const materialsTotal = materialsPages?.pages?.[0]?.total ?? materials.length;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !examId) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || !hasNextPage || isFetchingNextPage) return;
        fetchNextPage();
      },
      { rootMargin: '240px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [examId, hasNextPage, isFetchingNextPage, fetchNextPage, materials.length]);

  const invalidateStudy = useCallback(() => {
    invalidateStudyQueries(queryClient);
  }, [queryClient]);

  const warmExamFolder = useCallback(
    (exam) => {
      const id = itemId(exam?._id);
      if (!isMongoId(id)) return;
      prefetchStudyMaterials(queryClient, { examId: id, query: '', authed });
    },
    [queryClient, authed]
  );

  const buy = async (item) => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      setBuyingId(item._id);
      const response = await apiConnector('POST', pdfEndpoints.ORDER(item._id));
      const order = response.data;
      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        toast.error('Could not open payment');
        return;
      }
      const checkout = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency || 'INR',
        order_id: order.orderId,
        name: 'Awakening Classes',
        description: item.title,
        prefill: {
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          email: user?.email || '',
        },
        handler: async (payment) => {
          try {
            await apiConnector('POST', pdfEndpoints.VERIFY(item._id), {
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature,
            });
            toast.success('Unlocked');
            invalidateStudy();
            const mid = itemId(item._id);
            const exam = itemId(openExam?._id || item.exam?._id);
            navigate(
              exam ? `/study-material/${mid}?${EXAM_QUERY}=${exam}` : `/study-material/${mid}`
            );
          } catch {
            toast.error('Payment received, but unlock failed. Contact support.');
          }
        },
      });
      checkout.open();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not start payment');
    } finally {
      setBuyingId(null);
    }
  };

  const buyExam = async (exam) => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      setBuyingId(exam._id);
      const response = await apiConnector('POST', pdfEndpoints.EXAM_ORDER(exam._id));
      const order = response.data;
      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        toast.error('Could not open payment');
        return;
      }
      const checkout = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency || 'INR',
        order_id: order.orderId,
        name: 'Awakening Classes',
        description: exam.name,
        prefill: {
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          email: user?.email || '',
        },
        handler: async (payment) => {
          try {
            await apiConnector('POST', pdfEndpoints.EXAM_VERIFY(exam._id), {
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature,
            });
            toast.success('Exam unlocked');
            // Optimistic update then background refresh
            queryClient.setQueriesData('study-exams', (current) => {
              if (!current?.exams) return current;
              return {
                ...current,
                exams: current.exams.map((row) =>
                  itemId(row._id) === itemId(exam._id) ? { ...row, owned: true } : row
                ),
              };
            });
            invalidateStudy();
          } catch {
            toast.error('Payment received, but unlock failed. Contact support.');
          }
        },
      });
      checkout.open();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not start payment');
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
        navigate('/login');
        return;
      }
      const id = itemId(item._id);
      if (!isMongoId(id)) {
        toast.error('Could not open this material');
        return;
      }
      const exam = itemId(openExam?._id || item.exam?._id);
      navigate(exam ? `/study-material/${id}?${EXAM_QUERY}=${exam}` : `/study-material/${id}`);
      return;
    }
    buy(item);
  };

  const chooseExam = (exam) => {
    setSearch('');
    setQuery('');
    if (!exam) {
      const next = new URLSearchParams(searchParams);
      next.delete(EXAM_QUERY);
      setSearchParams(next, { replace: true });
      return;
    }
    const id = itemId(exam._id);
    const next = new URLSearchParams(searchParams);
    if (id) next.set(EXAM_QUERY, id);
    setSearchParams(next, { replace: false });
  };

  const showExamSkeleton = !openExam && examsLoading && exams.length === 0;
  const showMaterialsSkeleton = Boolean(openExam) && materialsLoading && materials.length === 0;
  const refreshing =
    (openExam ? materialsFetching && !isFetchingNextPage : examsFetching) &&
    !examsPlaceholder;

  return (
    <div className="min-h-screen bg-page">
      <section className="border-b border-line bg-page">
        <div className="page-shell flex items-end justify-between gap-4 py-5 sm:py-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
              Library
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-fg sm:text-2xl">
              Study material
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {refreshing ? (
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
                Updating…
              </span>
            ) : null}
            {openExam ? (
              <p className="hidden text-xs text-muted sm:block">
                {materialsTotal} paper{materialsTotal === 1 ? '' : 's'}
              </p>
            ) : (
              <p className="hidden text-xs text-muted sm:block">
                {exams.length} exam{exams.length === 1 ? '' : 's'}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="page-shell pb-16 pt-4 sm:pt-5">
        <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center">
          <label className="block min-w-0 flex-1">
            <span className="sr-only">Search study material</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={openExam ? 'Search papers…' : 'Search exams…'}
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-fg/30 focus:ring-2 focus:ring-fg/10"
            />
          </label>
        </div>

        {categories.length > 0 && (
          <div className="mb-4 flex min-w-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:mb-5">
            {[
              {
                name: 'all',
                label: 'All',
                count: categories.reduce((sum, item) => sum + item.count, 0),
              },
              ...categories.map((item) => ({
                name: item.name,
                label: item.name,
                count: item.count,
              })),
            ].map((chip) => {
              const active = selectedCategory === chip.name;
              return (
                <button
                  key={chip.name}
                  type="button"
                  onClick={() => {
                    chooseExam(null);
                    setSelectedCategory(chip.name);
                  }}
                  className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? 'bg-fg text-page shadow-sm'
                      : 'border border-line bg-surface text-muted hover:text-fg'
                  }`}
                >
                  {chip.label}
                  <span className={`ml-1.5 tabular-nums ${active ? 'text-page/70' : 'text-subtle'}`}>
                    {chip.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {openExam && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 sm:mb-5 sm:gap-3 sm:px-4">
            <button
              type="button"
              onClick={() => chooseExam(null)}
              className="text-xs font-medium text-muted hover:text-fg"
            >
              ← All exams
            </button>
            <span className="hidden h-3 w-px bg-line sm:block" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-fg">{openExam.name}</p>
              <p className="truncate text-[11px] text-muted">
                {openExam.access === 'paid'
                  ? openExam.owned
                    ? 'Unlocked — all papers included'
                    : `₹${openExam.price} unlocks every PDF`
                  : 'Open papers individually'}
              </p>
            </div>
            {openExam.access === 'paid' && !openExam.owned && (
              <button
                type="button"
                disabled={buyingId === openExam._id}
                onClick={() => buyExam(openExam)}
                className="shrink-0 rounded-lg bg-solid px-3 py-1.5 text-xs font-semibold text-solid-fg hover:bg-solid-hover disabled:opacity-60"
              >
                {buyingId === openExam._id ? '…' : `Buy ₹${openExam.price}`}
              </button>
            )}
          </div>
        )}

        {showExamSkeleton || showMaterialsSkeleton ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-line bg-surface"
              >
                <div className="aspect-[16/10] animate-pulse bg-elevated" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-elevated" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-elevated" />
                </div>
              </div>
            ))}
          </div>
        ) : !openExam ? (
          exams.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
              <p className="text-base font-medium text-fg">No exams found</p>
              <p className="mt-1 text-sm text-muted">Try another search or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {exams.map((exam) => {
                const locked = exam.access === 'paid' && !exam.owned;
                return (
                  <button
                    key={itemId(exam._id)}
                    type="button"
                    onClick={() => chooseExam(exam)}
                    onMouseEnter={() => warmExamFolder(exam)}
                    onFocus={() => warmExamFolder(exam)}
                    onTouchStart={() => warmExamFolder(exam)}
                    className="group overflow-hidden rounded-xl border border-line bg-surface text-left transition hover:border-fg/25 hover:shadow-md"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-elevated">
                      {exam.thumbnail ? (
                        <img
                          src={exam.thumbnail}
                          alt=""
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-fg/55">
                          <BsFiletypePdf className="text-4xl sm:text-5xl" />
                          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                            Study pack
                          </span>
                        </div>
                      )}
                      <div className="absolute right-2 top-2">
                        {locked ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                            <BiLockAlt size={12} />
                            ₹{exam.price}
                          </span>
                        ) : exam.access === 'paid' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                            <BiCheckCircle size={12} />
                            Unlocked
                          </span>
                        ) : (
                          <span className="rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                            Free
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 p-3.5 sm:p-4">
                      <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                        {exam.category}
                      </p>
                      <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-fg">
                        {exam.name}
                      </h2>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <p className="truncate text-xs text-muted">
                          {exam.pdfCount} PDF{exam.pdfCount === 1 ? '' : 's'}
                        </p>
                        <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-fg opacity-80 group-hover:opacity-100">
                          Open
                          <BiChevronRight size={16} />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )
        ) : materials.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
            <p className="text-base font-medium text-fg">No papers found</p>
            <p className="mt-1 text-sm text-muted">Try another search.</p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-line bg-surface divide-y divide-line">
            {materials.map((item) => {
              const locked = !item.canView;
              return (
                <li
                  key={itemId(item._id)}
                  className="flex items-center gap-3 px-3 py-3 transition hover:bg-elevated/40 sm:gap-4 sm:px-4"
                >
                  <CardPreview id={item._id} />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-semibold text-fg">{item.title}</h2>
                    <p className="mt-0.5 truncate text-[11px] text-muted">
                      {item.category || 'General'}
                      {!locked && item.access === 'paid' ? ' · Owned' : null}
                      {locked && item.soldAsSet ? ' · Included in exam' : null}
                      {locked && !item.soldAsSet ? ` · ₹${item.price}` : null}
                      {!locked && item.access !== 'paid' ? ' · Free' : null}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={buyingId === item._id}
                    onClick={() => openMaterial(item)}
                    className="shrink-0 rounded-lg bg-solid px-3 py-1.5 text-xs font-semibold text-solid-fg hover:bg-solid-hover disabled:opacity-60"
                  >
                    {buyingId === item._id
                      ? '…'
                      : locked
                        ? item.soldAsSet
                          ? 'Buy exam'
                          : 'Buy'
                        : 'Read'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <div ref={sentinelRef} className="h-8" />
        {isFetchingNextPage && (
          <p className="pb-6 text-center text-sm text-muted">Loading more…</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default StudyLibrary;
