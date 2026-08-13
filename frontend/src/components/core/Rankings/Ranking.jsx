import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Footer from '../../common/Footer';
import { studentEndpoints } from '../../../services/apis';
import LoadingSpinner from '../ConductMockTests/Spinner';
import { FaRankingStar } from 'react-icons/fa6';
import { FaCrown, FaSearch } from 'react-icons/fa';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_LIMIT = 20;

const RankingsPage = () => {
  const [testList, setTestList] = useState([]);   // [{ testId, testName, seriesName }]
  const [selectedTest, setSelectedTest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState('');

  const [rankings, setRankings] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false });
  const [userStats, setUserStats] = useState(null);

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
    if (test?.testId) p.set('testId', test.testId);
    if (test?.testName) p.set('testName', test.testName);
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

      // Use loggedInUserRank from backend to show global rank regardless of pagination
      if (data.loggedInUserRank && data.loggedInUserRank.length > 0) {
        setUserStats(data.loggedInUserRank[0]);
      } else {
        // Fallback for older backend versions
        const me = (data.data ?? []).find(r => String(r.userId) === String(userId));
        setUserStats(me ?? null);
      }
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

        // The API returns an array of objects: { testName, mockTestSeriesId, seriesName, mockTestId }
        const list = (data.data || []).map(item => ({
          testId: item.mockTestSeriesId,
          testName: item.testName,
          seriesName: item.seriesName,
          mockTestId: item.mockTestId
        }));
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
        if (selectedTest?.testId) p.set('testId', selectedTest.testId);
        if (selectedTest?.testName) p.set('testName', selectedTest.testName);

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
    if (test.testId === selectedTest?.testId && test.testName === selectedTest?.testName) { setIsModalOpen(false); return; }
    setPage(1);
    lastFetchKey.current = '';   // reset so new test fetches
    setRankings([]);
    setUserStats(null);
    setNameQuery('');
    setSearchResults(null);
    setSelectedTest(test);
    setIsModalOpen(false);
  };

  const changePage = (dir) => setPage(p => Math.max(1, Math.min(pagination.totalPages, p + dir)));

  // ── medal helpers ─────────────────────────────────────────
  const medalClass = r => r === 1 ? 'text-yellow-400' : r === 2 ? 'text-slate-400' : r === 3 ? 'text-amber-600' : 'text-muted';
  const displayList = searchResults !== null ? searchResults : rankings;

  // ── render ────────────────────────────────────────────────
  if (!token || (isLoading && testList.length === 0)) return <LoadingSpinner />;
  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-page">
      <p className="text-red-400">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-page text-fg">
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-24">

        {/* ── Title row ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <FaRankingStar className="text-yellow-400" size={20} />
            Rankings
          </h1>
          <div className="flex-shrink-0 w-full sm:w-auto">
            {userStats ? (
              <div className="relative group w-full">
                {/* Visual Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-zinc-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

                <div className="relative flex items-center gap-4 px-4 py-2.5 rounded-2xl bg-page border border-line backdrop-blur-xl shadow-2xl w-full">
                  {/* User Avatar with Rank Badge */}
                  <div className="relative">
                    <img
                      src={userStats.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userStats.userName || 'User')}&background=27272a&color=fff`}
                      alt="You"
                      onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userStats.userName || 'User')}&background=27272a&color=fff`; }}
                      className="w-10 h-10 rounded-full border-2 border-line object-cover shadow-inner"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-solid text-solid-fg text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-lg border border-black/10">
                      YOU
                    </div>
                  </div>

                  {/* Rank Stats */}
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[10px] text-subtle font-bold uppercase tracking-widest">Rank</span>
                      <span className="text-xl font-black text-fg italic">#{userStats.rank}</span>
                      <span className="text-[11px] text-subtle font-bold">/ {pagination.total}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-surface text-fg font-bold border border-line">
                        {userStats.score} <span className="text-[8px] opacity-70">PTS</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to={selectedTest?.testId ? `/view-mock/${selectedTest.testId}` : "/explore"}
                className="text-xs px-6 py-2.5 rounded-xl bg-solid text-solid-fg font-black uppercase tracking-widest hover:bg-solid-hover active:scale-95 transition-all shadow-xl block text-center"
              >
                Attempt Test
              </Link>
            )}
          </div>
        </div>

        {/* ── Test Selector Button ── */}
        <div className="mb-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-surface border border-line hover:border-muted transition-all group shadow-2xl backdrop-blur-sm"
            >
            <div className="flex flex-col items-start min-w-0">
              <span className="text-[10px] uppercase tracking-widest text-subtle font-bold mb-0.5 group-hover:text-muted transition-colors">Selected Test</span>
              <span className="text-sm text-fg font-medium truncate w-full text-left">
                {selectedTest?.testName ?? 'Select a mock test…'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-subtle group-hover:text-fg transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-tighter">Change</span>
              <ChevronRight size={16} />
            </div>
          </button>
        </div>

        {/* ── Tabular Test Selector Modal ── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-surface border border-line w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 mx-auto">
              {/* Modal Header */}
              <div className="p-5 border-b border-line flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-fg leading-tight">Explore Mock Tests</h2>
                  <p className="text-[10px] text-muted uppercase tracking-widest font-semibold mt-1">Select a test to view its global leaderboard</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-surface rounded-lg text-subtle hover:text-fg transition-colors"
                >
                  <ChevronDown size={20} />
                </button>
              </div>

              {/* Modal Search */}
              <div className="p-4 bg-page">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" size={14} />
                  <input
                    type="text"
                    placeholder="Search by series or test name…"
                    value={modalSearch}
                    onChange={e => setModalSearch(e.target.value)}
                    className="w-full bg-surface border border-line rounded-xl py-2.5 pl-10 pr-4 text-sm text-fg placeholder-muted focus:outline-none focus:border-muted transition-colors"
                    autoFocus
                  />
                </div>
              </div>

              {/* Modal Grouped List with Robust Per-Series Sticky Headers */}
              <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {(() => {
                  const filtered = testList.filter(t =>
                    t.testName.toLowerCase().includes(modalSearch.toLowerCase()) ||
                    (t.seriesName?.toLowerCase().includes(modalSearch.toLowerCase()))
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="py-12 text-center text-subtle text-sm">No tests found matching "{modalSearch}"</div>
                    );
                  }

                  const groups = filtered.reduce((acc, item) => {
                    const g = item.seriesName || "Other";
                    if (!acc[g]) acc[g] = [];
                    acc[g].push(item);
                    return acc;
                  }, {});

                  return Object.entries(groups).map(([series, tests]) => (
                    <div key={series} className="relative">
                      {/* Robust Sticky Header - Pushes previous header out naturally */}
                      <div className="sticky top-0 z-30 bg-surface border-b border-line py-3.5 px-6 shadow-md backdrop-blur-md">
                        <h3 className="text-[10px] font-black text-fg uppercase tracking-[0.2em] truncate">
                          {series}
                        </h3>
                      </div>

                      <table className="w-full text-left border-collapse table-fixed">
                        <tbody>
                          {tests.map((t, tIdx) => {
                            const isActive = t.testName === selectedTest?.testName && t.testId === selectedTest?.testId;
                            return (
                              <tr
                                key={`${t.testId}-${t.testName}-${tIdx}`}
                                onClick={() => selectTest(t)}
                                className={`group hover:bg-surface cursor-pointer transition-all border-b border-line last:border-0 ${isActive ? 'bg-surface' : ''}`}
                              >
                                <td className="py-4 px-8 text-[13px] font-medium text-fg group-hover:pl-10 transition-all duration-300 truncate">
                                  {t.testName}
                                </td>
                                <td className="py-4 px-8 text-right w-[120px]">
                                  <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-lg border transition-all inline-block whitespace-nowrap ${isActive ? 'bg-solid text-solid-fg border-solid shadow-[0_0_20px_rgba(0,0,0,0.2)] scale-105' : 'bg-surface border-line text-subtle group-hover:border-muted group-hover:text-fg'}`}>
                                    {isActive ? 'Active' : 'Select'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}

          {/* ── Search bar ── */}
        <div className="relative mb-5">
          <input
            type="text"
            placeholder="Search by name…"
            value={nameQuery}
            onChange={e => setNameQuery(e.target.value)}
            className="w-full px-4 py-2.5 pl-9 rounded-lg bg-surface border border-line text-sm text-fg placeholder-muted focus:outline-none focus:border-muted transition-colors"
          />
          {isSearching
            ? <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-line border-t-transparent rounded-full animate-spin" />
            : <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={12} />}
        </div>

        {/* ── Rankings list ── */}
        {isLoading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : displayList.length === 0 ? (
          <p className="text-center text-subtle py-16 text-sm">
            {searchResults !== null ? `No results for "${nameQuery}"` : 'No data available.'}
          </p>
        ) : (
          <div className="space-y-1">
            {displayList.map((r, idx) => {
              const isMe = userId && String(r.userId) === String(userId);
              return (
                <div
                  key={`${r._id ?? r.userId ?? r.rank}-${idx}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isMe ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-elevated'} transition-colors`}
                >


                  {/* Avatar */}
                  <img
                    src={r.userImage}
                    alt={r.userName}
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.userName)}&background=27272a&color=fff`; }}
                    className="w-8 h-8 rounded-full object-cover border border-line flex-shrink-0"
                  />

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isMe ? 'text-blue-500' : 'text-fg'}`}>
                      {r.userName}
                      {r.rank <= 3 && <span className={`ml-2 text-xs ${medalClass(r.rank)}`}>#{r.rank}</span>}
                      {isMe && <span className="ml-1.5 text-xs text-blue-500">you</span>}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                      {r.testName && (
                        <div className="flex items-center gap-1 bg-surface px-1.5 py-0.5 rounded border border-line">
                          <span className="text-[8px] text-subtle font-bold uppercase tracking-widest">Test:</span>
                          <span className="text-[9px] text-fg font-medium uppercase truncate max-w-[80px] sm:max-w-none">{r.testName}</span>
                        </div>
                      )}
                      {r.seriesName && (
                        <div className="flex items-center gap-1 bg-surface px-1.5 py-0.5 rounded border border-line">
                          <span className="text-[8px] text-subtle font-bold uppercase tracking-widest">Series:</span>
                          <span className="text-[9px] text-fg font-medium uppercase truncate max-w-[80px] sm:max-w-none">{r.seriesName}</span>
                        </div>
                      )}
                      {r.attemptDate && (
                        <span className="text-[10px] text-subtle ml-auto sm:ml-0">
                          {new Date(r.attemptDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-semibold text-fg">{r.score}</span>
                    <span className="text-xs text-subtle ml-1">pts</span>
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs bg-surface border border-line text-muted hover:text-fg hover:border-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span className="text-xs text-subtle">
              <span className="text-fg font-semibold">{page}</span> / {pagination.totalPages}
            </span>
            <button
              onClick={() => changePage(1)} disabled={!pagination.hasNextPage}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs bg-surface border border-line text-muted hover:text-fg hover:border-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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