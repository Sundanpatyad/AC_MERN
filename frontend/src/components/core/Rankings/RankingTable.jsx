import React, { useState } from 'react';
import { FaSearch, FaCrown } from 'react-icons/fa';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * RankingTable — minimal, clean, performant
 *
 * Props:
 *  testName          – label shown above the table
 *  rankings          – current page data
 *  searchResults     – null = not searching | array = search results
 *  isSearching       – spinner flag
 *  nameSearchQuery   – controlled search value
 *  onNameSearch      – setter
 *  page / totalPages / hasNextPage / hasPrevPage / onPageChange – pagination
 *  userId            – current user id (highlights their row)
 */
const RankingTable = ({
  testName = '',
  rankings = [],
  searchResults = null,
  isSearching = false,
  nameSearchQuery = '',
  onNameSearch,
  page = 1,
  totalPages = 1,
  hasNextPage = false,
  hasPrevPage = false,
  onPageChange,
  userId,
}) => {
  const displayList = searchResults !== null ? searchResults : rankings;

  const medalColor = (rank) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-zinc-400';
    if (rank === 3) return 'text-orange-400';
    return 'text-zinc-600';
  };

  return (
    <div className="w-full font-inter">

      {/* ── Test name heading ── */}
      {testName && (
        <h2 className="text-base font-semibold text-zinc-400 mb-4 truncate">
          {testName}
        </h2>
      )}

      {/* ── Name Search ── */}
      <div className="relative mb-5">
        <input
          type="text"
          placeholder="Search by name…"
          value={nameSearchQuery}
          onChange={e => onNameSearch?.(e.target.value)}
          className="w-full px-4 py-2.5 pl-10 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
        />
        {isSearching ? (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={13} />
        )}
        {nameSearchQuery && searchResults !== null && (
          <p className="mt-1.5 text-xs text-zinc-600 pl-1">
            {searchResults.length === 0
              ? `No results for "${nameSearchQuery}"`
              : `${searchResults.length} result${searchResults.length > 1 ? 's' : ''}`}
          </p>
        )}
      </div>

      {/* ── Table ── */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[2rem_1fr_auto] sm:grid-cols-[3rem_1fr_auto_auto] gap-x-3 px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800 text-xs font-medium text-zinc-500 uppercase tracking-wider">
          <span>#</span>
          <span>Name</span>
          <span className="hidden sm:block text-center">Date</span>
          <span className="text-right">Score</span>
        </div>

        {/* Rows */}
        {displayList.length === 0 && !isSearching ? (
          <div className="text-center py-12 text-zinc-600 text-sm">
            {searchResults !== null ? `No results for "${nameSearchQuery}"` : 'No data on this page.'}
          </div>
        ) : (
          <div>
            {displayList.map((r) => {
              const isMe = userId && String(r.userId) === String(userId);
              return (
                <div
                  key={r.userId ? String(r.userId) : r.rank}
                  className={`grid grid-cols-[2rem_1fr_auto] sm:grid-cols-[3rem_1fr_auto_auto] gap-x-3 px-4 py-3 border-b border-zinc-800/60 last:border-0 items-center transition-colors ${
                    isMe ? 'bg-blue-950/40' : 'hover:bg-zinc-900/60'
                  }`}
                >
                  {/* Rank */}
                  <div className={`text-sm font-bold ${medalColor(r.rank)}`}>
                    {r.rank <= 3 ? <FaCrown size={14} className="inline" /> : null}
                    <span className={r.rank <= 3 ? 'ml-1' : ''}>{r.rank}</span>
                  </div>

                  {/* Avatar + Name */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={r.userImage}
                      alt={r.userName}
                      onError={e => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.userName)}&background=3f3f46&color=fff`;
                      }}
                      className="w-8 h-8 rounded-full object-cover border border-zinc-700 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${isMe ? 'text-blue-300' : 'text-zinc-200'}`}>
                        {r.userName} {isMe && <span className="text-xs text-blue-400">(you)</span>}
                      </p>
                    </div>
                  </div>

                  {/* Date (hidden on small screens) */}
                  <div className="hidden sm:block text-xs text-zinc-600 text-center whitespace-nowrap">
                    {r.attemptDate
                      ? new Date(r.attemptDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                      : '—'}
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">{r.score}</span>
                    <span className="text-xs text-zinc-600 ml-1">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {searchResults === null && totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => onPageChange?.(-1)}
            disabled={!hasPrevPage}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span className="text-sm text-zinc-500">
            <span className="text-white font-semibold">{page}</span> / {totalPages}
          </span>
          <button
            onClick={() => onPageChange?.(1)}
            disabled={!hasNextPage}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default RankingTable;