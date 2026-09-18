import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { getAttemptById } from '../../../services/operations/profileAPI';

const GREEN = 'text-emerald-400';
const RED = 'text-red-400';
const SKIP = 'text-amber-400';

const formatMultiline = (value) => String(value ?? '').replace(/\\n/g, '\n');

const formatScore = (score) => {
  const n = Number(score);
  if (Number.isNaN(n)) return '0';
  return n % 1 === 0 ? String(n) : n.toFixed(2);
};

function AnswerBox({ label, value, tone }) {
  const toneClass =
    tone === 'correct' ? GREEN : tone === 'incorrect' ? RED : tone === 'skipped' ? SKIP : 'text-fg';
  return (
    <div className="rounded-xl border border-line bg-page p-3">
      <p className="text-[11px] uppercase tracking-wider text-subtle font-medium">{label}</p>
      <p className={`mt-1 text-sm font-medium whitespace-pre-line ${toneClass}`}>
        {formatMultiline(value) || '—'}
      </p>
    </div>
  );
}

function QuestionCard({ item, index }) {
  const type = item.type || 'skipped';
  const badge =
    type === 'correct'
      ? { icon: CheckCircle2, label: 'Correct', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' }
      : type === 'incorrect'
        ? { icon: XCircle, label: 'Incorrect', className: 'bg-red-500/15 text-red-400 border-red-500/30' }
        : { icon: MinusCircle, label: 'Skipped', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
  const Icon = badge.icon;
  const qNo = (item.questionIndex ?? index) + 1;

  return (
    <article className="rounded-2xl border border-line bg-surface p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-subtle tracking-widest">
          {String(qNo).padStart(2, '0')}
        </p>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${badge.className}`}>
          <Icon className="w-3.5 h-3.5" />
          {badge.label}
        </span>
      </div>

      {item.questionImage ? (
        <img
          src={item.questionImage}
          alt={`Question ${qNo}`}
          className="w-full max-h-56 object-contain rounded-xl border border-line bg-page"
        />
      ) : null}

      {item.questionText ? (
        <p className="text-fg text-[15px] leading-relaxed whitespace-pre-line">
          {formatMultiline(item.questionText)}
        </p>
      ) : null}

      {item.questionType === 'MATCH' && item.leftColumn?.length && item.rightColumn?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-line bg-page p-3 space-y-1">
            <p className="text-xs text-subtle font-medium mb-2">Column A</p>
            {item.leftColumn.map((col, i) => (
              <p key={`l-${i}`} className="text-muted">
                {String.fromCharCode(97 + i)}. {formatMultiline(String(col).replace(/^[a-z]\)\s*/i, ''))}
              </p>
            ))}
          </div>
          <div className="rounded-xl border border-line bg-page p-3 space-y-1">
            <p className="text-xs text-subtle font-medium mb-2">Column B</p>
            {item.rightColumn.map((col, i) => (
              <p key={`r-${i}`} className="text-muted">
                {i + 1}. {formatMultiline(String(col).replace(/^\d+\)\s*/, ''))}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnswerBox
          label="Your answer"
          value={item.userAnswer || 'Not answered'}
          tone={type}
        />
        {(type === 'incorrect' || type === 'skipped') ? (
          <AnswerBox
            label="Correct answer"
            value={item.correctAnswer}
            tone="correct"
          />
        ) : (
          <AnswerBox
            label="Correct answer"
            value={item.correctAnswer || item.userAnswer}
            tone="correct"
          />
        )}
      </div>
    </article>
  );
}

export default function AttemptDetail() {
  const { attemptId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [attemptId]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!token || !attemptId) return;
      setLoading(true);
      const data = await getAttemptById(token, attemptId);
      if (!cancelled) {
        setAttempt(data);
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [token, attemptId]);

  const questions = useMemo(() => {
    if (!attempt) return [];
    if (Array.isArray(attempt.allQuestionsReview) && attempt.allQuestionsReview.length) {
      return attempt.allQuestionsReview;
    }
    return [
      ...(attempt.correctAnswers || []).map((a) => ({ ...a, type: a.type || 'correct' })),
      ...(attempt.incorrectAnswerDetails || []).map((a) => ({ ...a, type: a.type || 'incorrect' })),
      ...(attempt.skippedAnswerDetails || []).map((a) => ({ ...a, type: a.type || 'skipped' })),
    ].sort((a, b) => (a.questionIndex ?? 0) - (b.questionIndex ?? 0));
  }, [attempt]);

  if (loading) {
    return <p className="text-center text-muted py-16 text-sm">Loading attempt…</p>;
  }

  if (!attempt) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-4">
        <p className="text-fg font-medium">Attempt not found</p>
        <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard/attempts')}>
          Back to attempts
        </button>
      </div>
    );
  }

  const correctCount = attempt.correctCount ?? (attempt.correctAnswers?.length || 0);
  const incorrectCount = Number(attempt.incorrectAnswers) || (attempt.incorrectAnswerDetails?.length || 0);
  const skippedCount = Number(attempt.skippedAnswers) || (attempt.skippedAnswerDetails?.length || 0);
  const pct =
    attempt.totalQuestions > 0
      ? Math.round((Math.max(0, Number(attempt.score)) / attempt.totalQuestions) * 100)
      : 0;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/attempts"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All attempts
        </Link>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-fg">{attempt.testName}</h1>
          {attempt.mockTestSeries?.seriesName ? (
            <p className="mt-1 text-sm text-muted">{attempt.mockTestSeries.seriesName}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-line bg-page p-3">
            <p className="text-xs text-subtle">Score</p>
            <p className="mt-1 text-lg font-semibold text-fg">
              {formatScore(attempt.score)} / {attempt.totalQuestions}
            </p>
          </div>
          <div className="rounded-xl border border-line bg-page p-3">
            <p className="text-xs text-subtle">Accuracy</p>
            <p className="mt-1 text-lg font-semibold text-fg">{pct}%</p>
          </div>
          <div className="rounded-xl border border-line bg-page p-3">
            <p className="text-xs text-subtle">Correct</p>
            <p className={`mt-1 text-lg font-semibold ${GREEN}`}>{correctCount}</p>
          </div>
          <div className="rounded-xl border border-line bg-page p-3">
            <p className="text-xs text-subtle">Incorrect / Skip</p>
            <p className="mt-1 text-lg font-semibold text-fg">
              <span className={RED}>{incorrectCount}</span>
              {' · '}
              <span className={SKIP}>{skippedCount}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-fg px-1">
          All questions · {correctCount} correct · {incorrectCount} incorrect · {skippedCount} skipped
        </h2>
        {questions.length === 0 ? (
          <p className="text-sm text-muted rounded-2xl border border-line bg-surface p-6">
            Detailed answers were not saved for this older attempt. New attempts will show full review here.
          </p>
        ) : (
          questions.map((item, index) => (
            <QuestionCard key={`${item.questionIndex ?? index}-${index}`} item={item} index={index} />
          ))
        )}
      </div>
    </div>
  );
}
