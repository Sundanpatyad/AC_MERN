import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ClipboardList, ChevronRight, Clock, Target } from 'lucide-react';
import { getUserAttempts } from '../../../services/operations/profileAPI';

const formatScore = (score) => {
  const n = Number(score);
  if (Number.isNaN(n)) return '0';
  return n % 1 === 0 ? String(n) : n.toFixed(2);
};

const formatDuration = (seconds) => {
  const s = Math.max(0, Number(seconds) || 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
};

export default function MyAttempts() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [stats, setStats] = useState({ totalAttempts: 0, averageScore: '0.00' });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!token) return;
      setLoading(true);
      const res = await getUserAttempts(token, { page, limit });
      if (cancelled) return;
      if (res?.success) {
        setAttempts(res.attempts || []);
        setPagination(res.pagination || { page, totalPages: 1, total: 0 });
        setStats({
          totalAttempts: res.user?.totalAttempts || 0,
          averageScore: res.user?.averageScore || '0.00',
        });
      } else {
        setAttempts([]);
      }
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [token, page]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5">
      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-elevated border border-line">
            <ClipboardList className="w-5 h-5 text-fg" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-fg">
              Attempts
            </h1>
            <p className="mt-1 text-sm text-muted">
              All your previous mock test attempts. Open any attempt to review answers.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-line bg-page p-4">
            <p className="text-xs text-subtle">Total attempts</p>
            <p className="mt-1 text-2xl font-semibold text-fg">{stats.totalAttempts}</p>
          </div>
          <div className="rounded-xl border border-line bg-page p-4">
            <p className="text-xs text-subtle">Average score</p>
            <p className="mt-1 text-2xl font-semibold text-fg">{stats.averageScore}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-muted text-sm">Loading attempts…</p>
        ) : attempts.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-fg font-medium">No attempts yet</p>
            <p className="mt-1 text-sm text-muted">Take a mock test to see your history here.</p>
            <button
              type="button"
              onClick={() => navigate('/mocktest')}
              className="btn-primary mt-5"
            >
              Browse mock tests
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {attempts.map((attempt) => {
              const date = new Date(attempt.attemptDate || attempt.createdAt);
              const seriesName = attempt.mockTestSeries?.seriesName;
              return (
                <li key={attempt._id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/attempts/${attempt._id}`)}
                    className="w-full text-left px-5 sm:px-6 py-4 hover:bg-elevated/60 transition-colors flex items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-fg truncate">
                        {attempt.testName}
                      </p>
                      {seriesName ? (
                        <p className="text-xs text-muted mt-0.5 truncate">{seriesName}</p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-subtle">
                        <span className="inline-flex items-center gap-1">
                          <Target className="w-3.5 h-3.5" />
                          Score {formatScore(attempt.score)} / {attempt.totalQuestions}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDuration(attempt.timeTaken)}
                        </span>
                        <span>
                          {attempt.correctCount ?? 0} correct · {attempt.incorrectAnswers ?? 0} incorrect
                          {(attempt.skippedAnswers ?? 0) > 0
                            ? ` · ${attempt.skippedAnswers} skipped`
                            : ''}
                        </span>
                        <span>
                          {date.toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted shrink-0" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn-secondary disabled:opacity-40"
          >
            Previous
          </button>
          <p className="text-sm text-muted">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <button
            type="button"
            disabled={page >= pagination.totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
            className="btn-secondary disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
