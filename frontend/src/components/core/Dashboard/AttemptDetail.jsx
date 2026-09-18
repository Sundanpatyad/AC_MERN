import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, CheckCircle2, XCircle, MinusCircle, HelpCircle } from 'lucide-react';
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

const normaliseOption = (opt) => {
  if (typeof opt === 'string') return { text: opt, image: '' };
  return { text: opt?.text || '', image: opt?.image || '' };
};

const optionValue = (opt) => {
  const { text, image } = normaliseOption(opt);
  return text || image;
};

function AnswerBox({ label, value, tone }) {
  const toneClass =
    tone === 'correct' ? GREEN : tone === 'incorrect' ? RED : tone === 'skipped' ? SKIP : 'text-fg';
  return (
    <div className="rounded-xl border border-line bg-page p-3.5">
      <p className="text-[11px] uppercase tracking-wider text-subtle font-medium">{label}</p>
      <p className={`mt-1.5 text-sm font-medium whitespace-pre-line ${toneClass}`}>
        {formatMultiline(value) || '—'}
      </p>
    </div>
  );
}

function QuestionCard({ item, index }) {
  const type = item.type || 'skipped';
  const isAttempted = item.isAttempted ?? (type === 'correct' || type === 'incorrect');

  const badge =
    type === 'correct'
      ? {
          icon: CheckCircle2,
          label: 'Attempted · Correct',
          className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        }
      : type === 'incorrect'
        ? {
            icon: XCircle,
            label: 'Attempted · Incorrect',
            className: 'bg-red-500/15 text-red-400 border-red-500/30',
          }
        : {
            icon: MinusCircle,
            label: 'Not Attempted',
            className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          };
  const Icon = badge.icon;
  const qNo = (item.questionIndex ?? index) + 1;

  const displayUserAnswer = isAttempted && item.userAnswer && item.userAnswer !== 'Not answered'
    ? item.userAnswer
    : 'Not Attempted';

  const displayCorrectAnswer = item.correctAnswer || (type === 'correct' ? item.userAnswer : '') || '—';

  return (
    <article className="rounded-2xl border border-line bg-surface p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-elevated text-subtle border border-line tracking-wider">
            Q{String(qNo).padStart(2, '0')}
          </span>
          <span className="text-xs text-subtle font-medium">
            {item.questionType || 'MCQ'}
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.className}`}
        >
          <Icon className="w-3.5 h-3.5" />
          {badge.label}
        </span>
      </div>

      {item.questionImage ? (
        <img
          src={item.questionImage}
          alt={`Question ${qNo}`}
          className="w-full max-h-60 object-contain rounded-xl border border-line bg-page"
        />
      ) : null}

      {item.questionText ? (
        <p className="text-fg text-[15px] leading-relaxed whitespace-pre-line font-medium">
          {formatMultiline(item.questionText)}
        </p>
      ) : null}

      {item.questionType === 'MATCH' && item.leftColumn?.length && item.rightColumn?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-line bg-page p-3 space-y-1">
            <p className="text-xs text-subtle font-medium mb-2 uppercase tracking-wider">Column A</p>
            {item.leftColumn.map((col, i) => (
              <p key={`l-${i}`} className="text-muted">
                {String.fromCharCode(97 + i)}. {formatMultiline(String(col).replace(/^[a-z]\)\s*/i, ''))}
              </p>
            ))}
          </div>
          <div className="rounded-xl border border-line bg-page p-3 space-y-1">
            <p className="text-xs text-subtle font-medium mb-2 uppercase tracking-wider">Column B</p>
            {item.rightColumn.map((col, i) => (
              <p key={`r-${i}`} className="text-muted">
                {i + 1}. {formatMultiline(String(col).replace(/^\d+\)\s*/, ''))}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      {Array.isArray(item.options) && item.options.length > 0 ? (
        <div className="space-y-2 pt-1">
          <p className="text-xs uppercase tracking-wider text-subtle font-medium">Options</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {item.options
              .slice(0, item.questionType === 'MATCH' ? 4 : item.options.length)
              .map((opt, optIdx) => {
                const optVal = optionValue(opt);
                const optText = normaliseOption(opt).text;
                const optImg = normaliseOption(opt).image;
                const optLabel = String.fromCharCode(65 + optIdx);

                const isUserChoice =
                  isAttempted &&
                  item.userAnswer &&
                  (String(item.userAnswer).trim() === String(optVal).trim() ||
                    String(item.userAnswer).trim() === String(optIdx));

                const isRightChoice =
                  item.correctAnswer &&
                  (String(item.correctAnswer).trim() === String(optVal).trim() ||
                    String(item.correctAnswer).trim() === String(optIdx));

                let borderClass = 'border-line bg-page text-muted';
                if (isRightChoice) {
                  borderClass = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
                } else if (isUserChoice && !isRightChoice) {
                  borderClass = 'border-red-500/40 bg-red-500/10 text-red-300';
                }

                return (
                  <div
                    key={optIdx}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-sm transition-all ${borderClass}`}
                  >
                    <span
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                        isRightChoice
                          ? 'border-emerald-500 bg-emerald-500 text-black'
                          : isUserChoice
                            ? 'border-red-500 bg-red-500 text-white'
                            : 'border-line bg-surface text-subtle'
                      }`}
                    >
                      {optLabel}
                    </span>
                    <div className="flex-1 min-w-0">
                      {optImg ? (
                        <img
                          src={optImg}
                          alt={`Option ${optLabel}`}
                          className="max-h-20 object-contain rounded mb-1"
                        />
                      ) : null}
                      {optText ? <p className="leading-snug">{optText}</p> : null}
                    </div>
                    {isRightChoice ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                        Correct
                      </span>
                    ) : isUserChoice ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 shrink-0">
                        Your choice
                      </span>
                    ) : null}
                  </div>
                );
              })}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <AnswerBox
          label="Your answer"
          value={displayUserAnswer}
          tone={isAttempted ? type : 'skipped'}
        />
        <AnswerBox
          label="Correct answer"
          value={displayCorrectAnswer}
          tone="correct"
        />
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
  const [filter, setFilter] = useState('all');

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
      ...(attempt.correctAnswers || []).map((a) => ({ ...a, type: a.type || 'correct', isAttempted: true })),
      ...(attempt.incorrectAnswerDetails || []).map((a) => ({ ...a, type: a.type || 'incorrect', isAttempted: true })),
      ...(attempt.skippedAnswerDetails || []).map((a) => ({ ...a, type: a.type || 'skipped', isAttempted: false })),
    ].sort((a, b) => (a.questionIndex ?? 0) - (b.questionIndex ?? 0));
  }, [attempt]);

  const correctCount = useMemo(() => {
    if (attempt?.correctCount !== undefined) return attempt.correctCount;
    return questions.filter((q) => q.type === 'correct').length;
  }, [attempt, questions]);

  const incorrectCount = useMemo(() => {
    if (attempt?.incorrectAnswers !== undefined) return Number(attempt.incorrectAnswers);
    return questions.filter((q) => q.type === 'incorrect').length;
  }, [attempt, questions]);

  const skippedCount = useMemo(() => {
    if (attempt?.skippedAnswers !== undefined) return Number(attempt.skippedAnswers);
    return questions.filter((q) => q.type === 'skipped').length;
  }, [attempt, questions]);

  const attemptedCount = correctCount + incorrectCount;
  const totalQuestions = questions.length || attempt?.totalQuestions || 0;

  const filteredQuestions = useMemo(() => {
    if (filter === 'attempted') {
      return questions.filter((q) => q.type === 'correct' || q.type === 'incorrect' || q.isAttempted);
    }
    if (filter === 'correct') {
      return questions.filter((q) => q.type === 'correct');
    }
    if (filter === 'incorrect') {
      return questions.filter((q) => q.type === 'incorrect');
    }
    if (filter === 'unattempted') {
      return questions.filter((q) => q.type === 'skipped' || !q.isAttempted);
    }
    return questions;
  }, [questions, filter]);

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

  const pct =
    totalQuestions > 0
      ? Math.round((Math.max(0, Number(attempt.score)) / totalQuestions) * 100)
      : 0;

  const filterTabs = [
    { key: 'all', label: 'All Questions', count: totalQuestions },
    { key: 'attempted', label: 'Attempted', count: attemptedCount },
    { key: 'correct', label: 'Correct', count: correctCount },
    { key: 'incorrect', label: 'Incorrect', count: incorrectCount },
    { key: 'unattempted', label: 'Not Attempted', count: skippedCount },
  ];

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
              {formatScore(attempt.score)} / {totalQuestions}
            </p>
          </div>
          <div className="rounded-xl border border-line bg-page p-3">
            <p className="text-xs text-subtle">Accuracy</p>
            <p className="mt-1 text-lg font-semibold text-fg">{pct}%</p>
          </div>
          <div className="rounded-xl border border-line bg-page p-3">
            <p className="text-xs text-subtle">Attempted</p>
            <p className="mt-1 text-lg font-semibold text-fg">
              {attemptedCount} <span className="text-xs font-normal text-muted">/ {totalQuestions}</span>
            </p>
          </div>
          <div className="rounded-xl border border-line bg-page p-3">
            <p className="text-xs text-subtle">Correct / Incorrect</p>
            <p className="mt-1 text-lg font-semibold text-fg">
              <span className={GREEN}>{correctCount}</span>
              {' · '}
              <span className={RED}>{incorrectCount}</span>
              {' · '}
              <span className={SKIP}>{skippedCount} unattempted</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-solid text-solid-fg border-solid shadow-sm'
                  : 'bg-surface text-muted border-line hover:text-fg hover:bg-elevated'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-black/20 text-solid-fg' : 'bg-page text-subtle'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Questions list */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-line bg-surface p-6 space-y-2">
            <HelpCircle className="w-8 h-8 text-muted mx-auto" />
            <p className="text-sm font-medium text-fg">No questions in this filter</p>
            <p className="text-xs text-muted">Select another tab to view other questions.</p>
          </div>
        ) : (
          filteredQuestions.map((item, index) => (
            <QuestionCard key={`${item.questionIndex ?? index}-${index}`} item={item} index={index} />
          ))
        )}
      </div>
    </div>
  );
}
