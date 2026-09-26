import { QueryClient, dehydrate, hydrate } from 'react-query';

/** Study / public catalog queries — safe to persist across reloads. */
const PERSISTABLE_ROOTS = new Set([
  'study-exams',
  'study-materials',
  'study-exams-home',
  'categories',
]);

const STORAGE_KEY = 'ac-rq-persist-v1';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h
const PERSIST_DEBOUNCE_MS = 800;

function isPersistableQuery(query) {
  const root = query?.queryKey?.[0];
  return (
    query?.state?.status === 'success' &&
    typeof root === 'string' &&
    PERSISTABLE_ROOTS.has(root)
  );
}

function readPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.clientState || !parsed?.updatedAt) return null;
    if (Date.now() - Number(parsed.updatedAt) > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.clientState;
  } catch {
    return null;
  }
}

function writePersistedState(client) {
  try {
    const clientState = dehydrate(client, {
      shouldDehydrateQuery: isPersistableQuery,
    });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ updatedAt: Date.now(), clientState })
    );
  } catch {
    /* private mode / quota */
  }
}

/**
 * Production QueryClient:
 * - stale-while-revalidate (staleTime + background refetch)
 * - localStorage dehydrate/hydrate for instant revisits
 * - reconnect / focus refetch only when data is stale
 */
export function createAppQueryClient() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        cacheTime: 30 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
        notifyOnChangeProps: 'tracked',
      },
    },
  });

  const persisted = readPersistedState();
  if (persisted) {
    try {
      hydrate(client, persisted);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  let timer = null;
  const schedulePersist = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => writePersistedState(client), PERSIST_DEBOUNCE_MS);
  };

  client.getQueryCache().subscribe((event) => {
    if (
      event?.type === 'updated' &&
      (event.action?.type === 'success' || event.action?.type === 'invalidate')
    ) {
      schedulePersist();
    }
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => writePersistedState(client));
  }

  return client;
}

export function clearPersistedQueryCache() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
