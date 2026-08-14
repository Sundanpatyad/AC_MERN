import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { FaYoutube } from 'react-icons/fa'
import { ArrowRight, Clock3, Check, BarChart3, BookOpen, Trophy } from 'lucide-react'

const DEMO_QUESTIONS = [
  {
    id: 1,
    text: 'Who wrote the national anthem of India?',
    options: [
      'Bankim Chandra Chatterjee',
      'Rabindranath Tagore',
      'Mahatma Gandhi',
      'Subhas Chandra Bose',
    ],
    correct: 1,
  },
  {
    id: 2,
    text: 'Which is the smallest prime number?',
    options: ['0', '1', '2', '3'],
    correct: 2,
  },
  {
    id: 3,
    text: 'In which year did India gain independence?',
    options: ['1945', '1947', '1950', '1952'],
    correct: 1,
  },
]

const STEPS = [
  { key: 'browse', label: 'Browse', icon: BookOpen },
  { key: 'attempt', label: 'Attempt', icon: Clock3 },
  { key: 'result', label: 'Result', icon: Trophy },
]

const OPTION_LABELS = ['A', 'B', 'C', 'D']

function PlatformMock() {
  const [phase, setPhase] = useState('browse') // browse | attempt | result
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState([])
  const [timer, setTimer] = useState(29 * 60 + 50)

  // Auto-play timeline
  useEffect(() => {
    let cancelled = false
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

    const run = async () => {
      while (!cancelled) {
        // Browse
        setPhase('browse')
        setQIndex(0)
        setSelected(null)
        setAnswered([])
        setTimer(29 * 60 + 50)
        await sleep(2200)
        if (cancelled) break

        // Attempt each question
        setPhase('attempt')
        for (let i = 0; i < DEMO_QUESTIONS.length; i++) {
          if (cancelled) break
          setQIndex(i)
          setSelected(null)
          await sleep(900)
          if (cancelled) break
          setSelected(DEMO_QUESTIONS[i].correct)
          await sleep(1100)
          if (cancelled) break
          setAnswered((prev) => Array.from(new Set([...prev, i])))
          setTimer((t) => Math.max(0, t - 18))
          await sleep(500)
        }
        if (cancelled) break

        // Result
        setPhase('result')
        await sleep(2800)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  // Tick timer visually during attempt
  useEffect(() => {
    if (phase !== 'attempt') return undefined
    const id = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [phase])

  const mins = String(Math.floor(timer / 60)).padStart(2, '0')
  const secs = String(timer % 60).padStart(2, '0')
  const current = DEMO_QUESTIONS[qIndex]
  const progress = ((answered.length + (selected !== null ? 0.35 : 0)) / DEMO_QUESTIONS.length) * 100

  return (
    <div className="relative w-full">
      <div
        aria-hidden="true"
        className="absolute -inset-8 rounded-[2.5rem] bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.08),transparent_55%),radial-gradient(ellipse_at_80%_80%,rgba(255,0,0,0.12),transparent_50%)] pointer-events-none"
      />

      <div className="relative rounded-2xl border border-line bg-surface overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.5)]">
        {/* Chrome */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3 bg-[#1a1a1a]">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
          </div>
          <div className="flex-1 rounded-lg border border-line bg-page px-3 py-1.5 text-[11px] text-subtle truncate tracking-wide">
            awakeningclasses.in/{phase === 'browse' ? 'mocktest' : phase === 'attempt' ? 'attempt-test' : 'mock-result'}
          </div>
          <div className="hidden sm:flex items-center gap-1">
            {STEPS.map((s) => {
              const active = s.key === phase
              const Icon = s.icon
              return (
                <span
                  key={s.key}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                    active ? 'bg-solid text-solid-fg' : 'text-subtle'
                  }`}
                >
                  <Icon size={10} />
                  {s.label}
                </span>
              )
            })}
          </div>
        </div>

        <div className="relative min-h-[340px] sm:min-h-[380px] bg-page">
          <AnimatePresence mode="wait">
            {phase === 'browse' && (
              <motion.div
                key="browse"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 p-5 sm:p-6"
              >
                <div className="flex items-end justify-between mb-5">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-subtle">Library</p>
                    <h3 className="text-lg sm:text-xl font-semibold text-fg mt-1">Popular mock tests</h3>
                  </div>
                  <span className="text-[11px] text-muted">View all →</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: 'JKSSB Patwari Full Set', meta: '40 Q · 60 min', price: '₹199', hot: true },
                    { title: 'Naib Tehsildar Drill', meta: '50 Q · 75 min', price: 'Free', hot: false },
                    { title: 'Current Affairs Weekly', meta: '30 Q · 30 min', price: '₹99', hot: false },
                    { title: 'Reasoning Speed Pack', meta: '35 Q · 40 min', price: '₹149', hot: false },
                  ].map((card, i) => (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * i, duration: 0.35 }}
                      className={`rounded-xl border p-3.5 ${
                        card.hot
                          ? 'border-solid/30 bg-solid/5 ring-1 ring-solid/10'
                          : 'border-line bg-surface'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-fg leading-snug">{card.title}</p>
                          <p className="text-[11px] text-subtle mt-1">{card.meta}</p>
                        </div>
                        {card.hot && (
                          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-brand-fg bg-brand px-1.5 py-0.5 rounded">
                            Start
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-fg">{card.price}</span>
                        <span className="text-[11px] text-muted">Exam-style</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {phase === 'attempt' && (
              <motion.div
                key="attempt"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 grid grid-cols-[72px_1fr] sm:grid-cols-[84px_1fr]"
              >
                <aside className="border-r border-line bg-surface/40 p-3 sm:p-3.5">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-subtle mb-3">Q</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DEMO_QUESTIONS.map((_, i) => {
                      const isCurrent = i === qIndex
                      const isDone = answered.includes(i)
                      return (
                        <div
                          key={i}
                          className={`h-7 w-7 sm:h-8 sm:w-8 rounded-md text-[11px] font-medium flex items-center justify-center border transition-colors ${
                            isCurrent
                              ? 'bg-solid text-solid-fg border-solid'
                              : isDone
                                ? 'bg-elevated text-fg border-line'
                                : 'bg-transparent text-muted border-line'
                          }`}
                        >
                          {i + 1}
                        </div>
                      )
                    })}
                    {[4, 5, 6, 7].map((n) => (
                      <div
                        key={n}
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-md text-[11px] text-subtle/50 border border-line/60 flex items-center justify-center"
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </aside>

                <div className="p-4 sm:p-5 flex flex-col">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-[11px] text-subtle uppercase tracking-[0.12em]">Live attempt</p>
                      <p className="text-sm font-semibold text-fg">JKSSB Practice · Set 01</p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-medium text-fg tabular-nums">
                      <Clock3 size={12} className="text-brand" />
                      {mins}:{secs}
                    </div>
                  </div>

                  <div className="h-1 rounded-full bg-elevated overflow-hidden mb-4">
                    <motion.div
                      className="h-full bg-brand rounded-full"
                      animate={{ width: `${Math.min(100, progress)}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current.id}
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.28 }}
                      className="space-y-3 flex-1"
                    >
                      <p className="text-[13px] sm:text-sm text-fg leading-relaxed">
                        <span className="text-subtle mr-2">Q{qIndex + 1}.</span>
                        {current.text}
                      </p>

                      <div className="space-y-2">
                        {current.options.map((opt, idx) => {
                          const isSelected = selected === idx
                          return (
                            <div
                              key={opt}
                              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[12px] sm:text-[13px] transition-all duration-300 ${
                                isSelected
                                  ? 'border-solid/50 bg-solid/10 text-fg scale-[1.01]'
                                  : 'border-line bg-surface/50 text-muted'
                              }`}
                            >
                              <span
                                className={`h-6 w-6 shrink-0 rounded-full border flex items-center justify-center text-[11px] font-semibold ${
                                  isSelected
                                    ? 'border-solid bg-solid text-solid-fg'
                                    : 'border-line text-subtle'
                                }`}
                              >
                                {isSelected ? <Check size={12} strokeWidth={3} /> : OPTION_LABELS[idx]}
                              </span>
                              {opt}
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <div className="flex items-center justify-between pt-3 mt-auto">
                    <span className="text-[11px] text-subtle">
                      {answered.length} of {DEMO_QUESTIONS.length} answered
                    </span>
                    <div className="flex gap-2">
                      <span className="rounded-lg border border-line px-3 py-1.5 text-[11px] text-muted">Previous</span>
                      <span className="rounded-lg bg-solid text-solid-fg px-3 py-1.5 text-[11px] font-semibold">
                        {qIndex === DEMO_QUESTIONS.length - 1 && selected !== null ? 'Submit' : 'Next'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 p-5 sm:p-6 flex flex-col"
              >
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-subtle">Result ready</p>
                    <h3 className="text-lg sm:text-xl font-semibold text-fg mt-1">Your performance</h3>
                  </div>
                  <div className="rounded-xl border border-line bg-surface px-3 py-2 text-right">
                    <p className="text-[10px] text-subtle uppercase tracking-wider">Score</p>
                    <p className="text-xl font-semibold text-fg tabular-nums">3/3</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 mb-5">
                  {[
                    { label: 'Accuracy', value: '100%' },
                    { label: 'Time used', value: '54s' },
                    { label: 'Rank', value: '#12' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      className="rounded-xl border border-line bg-surface p-3"
                    >
                      <p className="text-[10px] text-subtle uppercase tracking-wider">{stat.label}</p>
                      <p className="text-base sm:text-lg font-semibold text-fg mt-1 tabular-nums">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="rounded-xl border border-line bg-surface p-4 flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 size={14} className="text-muted" />
                    <p className="text-sm font-medium text-fg">Topic gaps</p>
                  </div>
                  {[
                    { topic: 'History', pct: 100 },
                    { topic: 'Math', pct: 100 },
                    { topic: 'GK', pct: 100 },
                  ].map((row, i) => (
                    <div key={row.topic} className="mb-3 last:mb-0">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-muted">{row.topic}</span>
                        <span className="text-fg tabular-nums">{row.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-elevated overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-solid"
                          initial={{ width: 0 }}
                          animate={{ width: `${row.pct}%` }}
                          transition={{ duration: 0.7, delay: 0.15 + i * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating captions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.3 }}
          className="absolute -bottom-4 left-4 sm:left-6 rounded-xl border border-line bg-elevated/95 backdrop-blur px-3.5 py-2.5 shadow-lg"
        >
          <p className="text-[10px] uppercase tracking-[0.14em] text-subtle">
            {phase === 'browse' && 'Step 1'}
            {phase === 'attempt' && 'Step 2'}
            {phase === 'result' && 'Step 3'}
          </p>
          <p className="text-xs sm:text-sm text-fg font-medium mt-0.5">
            {phase === 'browse' && 'Pick an exam-style mock test'}
            {phase === 'attempt' && 'Answer under real time pressure'}
            {phase === 'result' && 'See score, rank & weak topics'}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

const HeroSection = () => {
  const { token } = useSelector((state) => state.auth)

  return (
    <section className="relative min-h-[100dvh] w-full flex items-start lg:items-center bg-page overflow-hidden">
      <div className="page-shell pt-28 pb-12 md:pt-24 md:pb-14 lg:py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left space-y-6 md:space-y-7">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-4xl sm:text-5xl md:text-6xl font-semibold text-fg tracking-tight leading-[1.08]"
            >
              Prepare with purpose.
              <br />
              <span className="text-muted font-medium">Succeed with clarity.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base md:text-lg text-muted max-w-md mx-auto lg:mx-0 leading-relaxed"
            >
              Practice exam-style mock tests, get instant feedback, and improve with every attempt.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-1"
            >
              {token ? (
                <>
                  <Link to="/dashboard/enrolled-courses" className="btn-primary">
                    My courses
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="https://www.youtube.com/@awakeningclasses"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    <FaYoutube size={16} className="text-brand" />
                    Lectures
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup" className="btn-primary">
                    Get started
                    <ArrowRight size={16} />
                  </Link>
                  <Link to="/mocktest" className="btn-secondary">
                    Browse tests
                  </Link>
                </>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="w-full max-w-lg mx-auto lg:max-w-none pb-8"
          >
            <PlatformMock />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
