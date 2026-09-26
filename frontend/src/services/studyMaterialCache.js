import { apiConnector } from './apiConnector';
import { pdfEndpoints } from './apis';

/**
 * staleTime 0 = show cache instantly, always background-refetch on mount/focus.
 * Keeps purchase `owned` flags fresh (e.g. paid on app, open web later).
 */
export const STUDY_STALE_MS = 0;
export const STUDY_GC_MS = 45 * 60 * 1000;

/**
 * Query-key factory (TanStack Query recommended pattern).
 * Stable keys → dedupe + shared cache across Home + Library.
 * `authed` separates guest vs logged-in so owned flags never mix.
 */
export const studyKeys = {
  all: ['study'],
  exams: (filters) => [
    'study-exams',
    filters?.query || '',
    filters?.category || 'all',
    filters?.authed ? '1' : '0',
  ],
  materials: (filters) => [
    'study-materials',
    filters?.examId || '',
    filters?.query || '',
    filters?.authed ? '1' : '0',
  ],
  home: (filters) => ['study-exams-home', filters?.authed ? '1' : '0'],
};

/** @deprecated use studyKeys.exams */
export function studyExamsKey(query, category, authed) {
  return studyKeys.exams({ query, category, authed });
}

/** @deprecated use studyKeys.materials */
export function studyMaterialsKey(examId, query, authed) {
  return studyKeys.materials({ examId, query, authed });
}

/** @deprecated use studyKeys.home */
export function studyHomeExamsKey(authed) {
  return studyKeys.home({ authed: Boolean(authed) });
}

export async function fetchStudyExams({ query = '', category = 'all' } = {}) {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (category && category !== 'all') params.set('category', category);
  const response = await apiConnector('GET', `${pdfEndpoints.EXAMS}?${params}`);
  return {
    exams: response.data?.data || [],
    categories: response.data?.categories || [],
  };
}

export async function fetchStudyHomeExams() {
  const response = await apiConnector('GET', `${pdfEndpoints.EXAMS}?sort=latest`);
  return (response.data?.data || []).slice(0, 4);
}

export async function fetchStudyMaterialsPage({
  examId,
  query = '',
  page = 1,
  limit = 8,
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    exam: String(examId),
  });
  if (query) params.set('q', query);
  const response = await apiConnector('GET', `${pdfEndpoints.LIST}?${params}`);
  return {
    items: response.data?.data || [],
    total: response.data?.total || 0,
    hasMore: Boolean(response.data?.hasMore),
    page,
  };
}

/** Intent-based prefetch (hover / focus) — production UX pattern. */
export function prefetchStudyExams(queryClient, { query = '', category = 'all', authed = false } = {}) {
  return queryClient.prefetchQuery(
    studyKeys.exams({ query, category, authed }),
    () => fetchStudyExams({ query, category }),
    { staleTime: STUDY_STALE_MS }
  );
}

export function prefetchStudyMaterials(
  queryClient,
  { examId, query = '', authed = false } = {}
) {
  if (!examId) return Promise.resolve();
  return queryClient.prefetchInfiniteQuery(
    studyKeys.materials({ examId, query, authed }),
    ({ pageParam = 1 }) =>
      fetchStudyMaterialsPage({ examId, query, page: pageParam, limit: 8 }),
    {
      staleTime: STUDY_STALE_MS,
      getNextPageParam: (last) => (last?.hasMore ? last.page + 1 : undefined),
    }
  );
}

export function invalidateStudyQueries(queryClient) {
  return Promise.all([
    queryClient.invalidateQueries('study-exams'),
    queryClient.invalidateQueries('study-materials'),
    queryClient.invalidateQueries('study-exams-home'),
  ]);
}

// Back-compat no-ops (persist lives in queryClient now)
export const STUDY_CACHE_MS = STUDY_GC_MS;
export function readStudyCache() {
  return undefined;
}
export function writeStudyCache() {}
export function clearStudyCaches() {}
