import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from '../../common/Footer';
import { studentEndpoints } from '../../../services/apis';
import LoadingSpinner from '../ConductMockTests/Spinner';
import { FaRankingStar } from 'react-icons/fa6';
import { FaCrown, FaSearch } from 'react-icons/fa';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_LIMIT = 20;

const RankingsPage = () => {
  const [testList, setTestList] = useState([]);   // [{ testId, testName }]
  const [selectedTest, setSelectedTest] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [rankings, setRankings] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false });
  const [userRank, setUserRank] = useState(null);

  const [page, setPage] = useState(1);

  const [nameQuery, setNameQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Guards against re-runs
  const bootstrapDone = useRef(false);
  const lastFetchKey = useRef('');   // "<testId|testName>:<page>"

  const { token } = useSelector(s => s.auth);
  const { user } = useSelector(s => s.profile);
  const userId = user?._id;
  const { testName: routeTestName } = useParams();
  const navigate = useNavigate();

  const { RANKINGS_API, USER_RANKING_BY_NAME_API, GET_ATTEMPTED_TEST_NAMES_API } = studentEndpoints;

  // ── helpers ──────────────────────────────────────────────
  const testKey = (test, pg) => `${test?.testId ?? test?.testName}:${pg}`;

  const makeParams = (test, pg) => {
    const p = new URLSearchParams({ page: pg, limit: PAGE_LIMIT });
    test?.testId ? p.set('testId', test.testId) : p.set('testName', test.testName);
    return p;
  };

  // ── fetch rankings ────────────────────────────────────────
  const fetchRankings = async (test, pg) => {
    const key = testKey(test, pg);
    if (lastFetchKey.current === key) return;   // skip duplicate call
    lastFetchKey.current = key;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${RANKINGS_API}?${makeParams(test, pg)}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setRankings(data.data ?? []);
      setPagination(data.pagination ?? { total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false });
      const me = (data.data ?? []).find(r => String(r.userId) === String(userId));
      setUserRank(me?.rank ?? null);
    } catch (err) {
      console.error('fetchRankings:', err);
      setError('Failed to load rankings.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── bootstrap (runs exactly once) ─────────────────────────
  useEffect(() => {
    if (!token || bootstrapDone.current) return;
    bootstrapDone.current = true;

    (async () => {
      try {
        const res = await fetch(GET_ATTEMPTED_TEST_NAMES_API, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to fetch test names');

        // The API returns an alphabetically sorted array of strings
        const list = (data.data || []).map(name => ({ testId: null, testName: name }));
        setTestList(list);

        // Pick initial selection
        const initial = list.find(t => routeTestName && (t.testName === routeTestName)) ?? list[0] ?? null;
        setSelectedTest(initial);
      } catch (err) {
        console.error('bootstrap:', err);
        setError('Failed to load rankings.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── sync URL (never navigates from inside async) ──────────
  useEffect(() => {
    if (!selectedTest) return;
    // Only navigate when URL doesn't already match — prevents remount loop
    if (routeTestName !== selectedTest.testName) {
      navigate(`/rankings/${encodeURIComponent(selectedTest.testName)}`, { replace: true });
    }
  }, [selectedTest?.testName]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── fetch when test or page changes ───────────────────────
  useEffect(() => {
    if (!selectedTest || !token) return;
    fetchRankings(selectedTest, page);
  }, [selectedTest, page]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── name search (debounced 500 ms) ────────────────────────
  useEffect(() => {
    if (!nameQuery.trim()) { setSearchResults(null); return; }
    const t = setTimeout(async () => {
      setIsSearching(true);
      try {
        const p = new URLSearchParams({ name: nameQuery.trim() });
        selectedTest?.testId ? p.set('testId', selectedTest.testId) : p.set('testName', selectedTest?.testName ?? '');
        const res = await fetch(`${USER_RANKING_BY_NAME_API}?${p}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setSearchResults(data.success ? data.data : []);
      } catch { setSearchResults([]); }
      finally { setIsSearching(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [nameQuery, selectedTest, token]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── handlers ──────────────────────────────────────────────
  const selectTest = (test) => {
    if (test.testName === selectedTest?.testName) { setDropdownOpen(false); return; }
    setPage(1);
    lastFetchKey.current = '';   // reset so new test fetches
    setRankings([]);
    setUserRank(null);
    setNameQuery('');
    setSearchResults(null);
    setSelectedTest(test);
    setDropdownOpen(false);
  };

  const changePage = (dir) => setPage(p => Math.max(1, Math.min(pagination.totalPages, p + dir)));

  // ── medal helpers ─────────────────────────────────────────
  const medalClass = r => r === 1 ? 'text-yellow-400' : r === 2 ? 'text-slate-400' : r === 3 ? 'text-amber-600' : 'text-zinc-700';
  const displayList = searchResults !== null ? searchResults : rankings;

  // ── render ────────────────────────────────────────────────
  if (!token || (isLoading && testList.length === 0)) return <LoadingSpinner />;
  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <p className="text-red-400">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-24">

        {/* ── Title row ── */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <FaRankingStar className="text-yellow-400" size={20} />
            Rankings
          </h1>
          {userRank && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
              Your rank <span className="text-white font-bold ml-1">#{userRank}</span>
              <span className="text-zinc-600"> / {pagination.total}</span>
            </span>
          )}
        </div>

        {/* ── Test selector ── */}
        <div className="relative mb-6">
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white hover:border-zinc-600 transition-colors"
          >
            <span className="truncate text-left">{selectedTest?.testName ?? 'Select a test'}</span>
            {dropdownOpen ? <ChevronUp size={15} className="text-zinc-500 flex-shrink-0" /> : <ChevronDown size={15} className="text-zinc-500 flex-shrink-0" />}
          </button>

          {dropdownOpen && (
            <div className="absolute z-30 top-full left-0 mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden">
              <div className="max-h-52 overflow-y-auto">
                {testList.map(t => (
                  <button
                    key={t.testId ?? t.testName}
                    onClick={() => selectTest(t)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${t.testName === selectedTest?.testName ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                  >
                    {t.testName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Search bar ── */}
        <div className="relative mb-5">
          <input
            type="text"
            placeholder="Search by name…"
            value={nameQuery}
            onChange={e => setNameQuery(e.target.value)}
            className="w-full px-4 py-2.5 pl-9 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
          {isSearching
            ? <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
            : <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={12} />}
        </div>

        {/* ── Rankings list ── */}
        {isLoading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : displayList.length === 0 ? (
          <p className="text-center text-zinc-600 py-16 text-sm">
            {searchResults !== null ? `No results for "${nameQuery}"` : 'No data available.'}
          </p>
        ) : (
          <div className="space-y-1">
            {displayList.map((r, idx) => {
              const isMe = userId && String(r.userId) === String(userId);
              return (
                <div
                  key={`${r._id ?? r.userId ?? r.rank}-${idx}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isMe ? 'bg-blue-950/50 border border-blue-900/40' : 'hover:bg-zinc-900'} transition-colors`}
                >
                  {/* Rank */}
                  <div className={`w-7 text-sm font-bold flex-shrink-0 ${medalClass(r.rank)}`}>
                    {r.rank <= 3 ? <FaCrown size={13} /> : <span>#{r.rank}</span>}
                  </div>

                  {/* Avatar */}
                  <img
                    src={r.userImage}
                    alt={r.userName}
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.userName)}&background=27272a&color=fff`; }}
                    className="w-8 h-8 rounded-full object-cover border border-zinc-800 flex-shrink-0"
                  />

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isMe ? 'text-blue-300' : 'text-zinc-200'}`}>
                      {r.userName}
                      {r.rank <= 3 && <span className={`ml-2 text-xs ${medalClass(r.rank)}`}>#{r.rank}</span>}
                      {isMe && <span className="ml-1.5 text-xs text-blue-500">you</span>}
                    </p>
                    {r.attemptDate && (
                      <p className="text-[11px] text-zinc-600 mt-0.5">
                        {new Date(r.attemptDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-semibold text-white">{r.score}</span>
                    <span className="text-xs text-zinc-600 ml-1">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {searchResults === null && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => changePage(-1)} disabled={!pagination.hasPrevPage}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span className="text-xs text-zinc-500">
              <span className="text-white font-semibold">{page}</span> / {pagination.totalPages}
            </span>
            <button
              onClick={() => changePage(1)} disabled={!pagination.hasNextPage}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
};

export default RankingsPage;