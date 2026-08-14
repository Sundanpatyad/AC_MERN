import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { FaYoutube } from 'react-icons/fa'
import { ArrowRight, Check, Clock3 } from 'lucide-react'

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

const RESULT = {
  score: 78,
  total: 100,
  rank: 12,
  of: 2840,
  correct: 82,
  wrong: 11,
  skipped: 7,
  accuracy: 88,
  topics: [
    { name: 'History', pct: 86 },
    { name: 'Math', pct: 64 },
    { name: 'GK', pct: 72 },
    { name: 'Reasoning', pct: 81 },
  ],
  trend: [54, 61, 58, 67, 71, 78],
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']
const EASE = [0.16, 1, 0.3, 1]

function Sparkline({ values }) {
  const w = 200
  const h = 48
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const coords = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - 4 - ((v - min) / range) * (h - 8)
    return [x, y]
  })
  const line = coords.map(([x, y]) => `${x},${y}`).join(' ')
  const area = `M0,${h} ${coords.map(([x, y]) => `L${x},${y}`).join(' ')} L${w},${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-11 w-full" aria-hidden="true">
      <path d={area} className="fill-brand/15" />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="text-brand"
      />
    </svg>
  )
}

function TopicBars({ topics, reduceMotion }) {
  return (
    <div className="grid gap-2">
      {topics.map((row, i) => (
        <div key={row.name} className="grid grid-cols-[minmax(0,1fr)_2.4rem] items-center gap-2">
          <div>
            <div className="mb-1 flex justify-between text-[10px] leading-none">
              <span className="text-subtle">{row.name}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-line">
              <motion.div
                className="h-full rounded-full bg-fg"
                initial={reduceMotion ? false : { width: 0 }}
                animate={{ width: `${row.pct}%` }}
                transition={{ duration: 0.65, delay: 0.08 + i * 0.06, ease: EASE }}
              />
            </div>
          </div>
          <span className="text-right text-[10px] font-medium tabular-nums text-muted">{row.pct}%</span>
        </div>
      ))}
    </div>
  )
}

function PlatformMock() {
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState(reduceMotion ? 'result' : 'browse')
  const [qIndex, setQIndex] = useState(reduceMotion ? 1 : 0)
  const [selected, setSelected] = useState(reduceMotion ? 2 : null)
  const [answered, setAnswered] = useState(reduceMotion ? [0, 1] : [])
  const [timer, setTimer] = useState(29 * 60 + 9)

  useEffect(() => {
    if (reduceMotion) return undefined
    let cancelled = false
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

    const run = async () => {
      while (!cancelled) {
        setPhase('browse')
        setQIndex(0)
        setSelected(null)
        setAnswered([])
        setTimer(29 * 60 + 50)
        await sleep(2400)
        if (cancelled) break

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
          await sleep(380)
        }
        if (cancelled) break

        setPhase('result')
        await sleep(4200)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [reduceMotion])

  useEffect(() => {
    if (reduceMotion || phase !== 'attempt') return undefined
    const id = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [phase, reduceMotion])

  const mins = String(Math.floor(timer / 60)).padStart(2, '0')
  const secs = String(timer % 60).padStart(2, '0')
  const current = DEMO_QUESTIONS[qIndex]
  const progress =
    ((answered.length + (selected !== null ? 0.4 : 0)) / DEMO_QUESTIONS.length) * 100

  const stats = [
    { label: 'Correct', value: RESULT.correct },
    { label: 'Wrong', value: RESULT.wrong },
    { label: 'Skipped', value: RESULT.skipped },
    { label: 'Accuracy', value: `${RESULT.accuracy}%` },
  ]

  return (
    <div
      className="relative mx-auto w-[min(78vw,268px)] lg:w-full lg:max-w-none"
      role="img"
      aria-label="Preview of a timed mock test and scorecard"
    >
      <div className="relative lg:[perspective:2000px]">
        <motion.div
          className="relative lg:[transform-style:preserve-3d]"
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <motion.div
            className="relative lg:[transform-style:preserve-3d]"
            animate={reduceMotion ? { y: 0 } : { y: [0, -10, 0] }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 11, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <div
              className="relative overflow-hidden rounded-[2.4rem] p-[10px] ring-1 ring-black/15 dark:ring-white/10 lg:rounded-[1.6rem] lg:p-[9px] lg:[transform:rotateX(6deg)_rotateY(-10deg)]"
              style={{
                background: 'linear-gradient(160deg, #2a2820 0%, #12110d 48%, #0c0b08 100%)',
                boxShadow: '0 32px 64px -24px rgba(0,0,0,0.45)',
              }}
            >
              <div className="pointer-events-none absolute inset-x-10 top-0 z-30 hidden h-px bg-gradient-to-r from-transparent via-fg/40 to-transparent lg:block" />
              <div className="pointer-events-none absolute left-1/2 top-[5px] z-30 hidden h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-[#3a382e] lg:block" />

              <div className="relative aspect-[9/17.8] overflow-hidden rounded-[1.85rem] bg-page lg:aspect-[16/11] lg:min-h-[400px] lg:rounded-[1.15rem]">
                <div className="pointer-events-none absolute left-1/2 top-[8px] z-30 h-[21px] w-[72px] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] lg:hidden" />
                <div className="absolute inset-x-0 top-0 z-10 grid h-[38px] grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)] items-center px-3 lg:flex lg:h-auto lg:grid-cols-none lg:justify-between lg:px-5 lg:py-3">
                  <span className="hidden truncate text-[10px] font-medium uppercase tracking-[0.22em] text-subtle lg:inline">
                    Awakening
                  </span>
                  <span className="truncate text-[10px] font-medium tabular-nums text-subtle lg:hidden">
                    9:41
                  </span>
                  <span className="lg:hidden" aria-hidden="true" />
                  <span
                    className={`inline-flex min-w-0 items-center justify-self-end gap-1 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums lg:gap-1.5 lg:px-2.5 lg:py-1 lg:text-[11px] ${
                      phase === 'attempt' ? 'bg-brand/15 text-fg' : 'bg-elevated text-muted'
                    }`}
                  >
                    <Clock3
                      size={11}
                      className={`hidden lg:block ${phase === 'attempt' ? 'text-brand' : 'text-subtle'}`}
                    />
                    {mins}:{secs}
                    {phase === 'attempt' && !reduceMotion && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand animate-pulse" />
                    )}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {phase === 'browse' && (
                    <motion.div
                      key="browse"
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="absolute inset-0 flex flex-col gap-3 overflow-hidden px-3.5 pb-9 pt-[46px] lg:gap-4 lg:px-5 lg:pb-5 lg:pt-14"
                    >
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">JKSSB · Full mock</p>
                        <h3 className="mt-1 text-[1.2rem] font-semibold leading-tight tracking-tight text-fg lg:text-[1.55rem]">
                          Constable Practice Set
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { n: '100', l: 'Questions' },
                          { n: '90', l: 'Minutes' },
                          { n: '2.8k', l: 'Attempts' },
                          { n: 'Live', l: 'Ranking' },
                        ].map((item) => (
                          <div key={item.l} className="rounded-xl border border-line bg-surface px-3 py-2.5">
                            <p className="text-[15px] font-semibold tabular-nums text-fg">{item.n}</p>
                            <p className="mt-0.5 text-[10px] text-subtle">{item.l}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                        <span className="text-sm tabular-nums text-fg">₹99</span>
                        <span className="rounded-full bg-solid px-4 py-2 text-[12px] font-semibold text-solid-fg">
                          Start test
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {phase === 'attempt' && (
                    <motion.div
                      key="attempt"
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="absolute inset-0 flex flex-col overflow-hidden px-3.5 pb-9 pt-[46px] lg:px-5 lg:pb-5 lg:pt-14"
                    >
                      <div className="mb-3 h-[2px] overflow-hidden rounded-full bg-line">
                        <motion.div
                          className="h-full rounded-full bg-brand"
                          animate={{ width: `${Math.min(100, progress)}%` }}
                          transition={{ duration: 0.45, ease: EASE }}
                        />
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={current.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.28, ease: EASE }}
                          className="flex min-h-0 flex-1 flex-col gap-3"
                        >
                          <p className="text-[13px] leading-snug text-fg lg:text-[16px]">
                            <span className="mr-2 text-subtle">{qIndex + 1}/3</span>
                            {current.text}
                          </p>
                          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                            {current.options.map((opt, idx) => {
                              const isSelected = selected === idx
                              return (
                                <div
                                  key={opt}
                                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[12px] leading-snug transition-colors duration-300 lg:text-[13px] ${
                                    isSelected
                                      ? 'border-fg/20 bg-solid text-solid-fg'
                                      : 'border-line bg-surface text-muted'
                                  }`}
                                >
                                  <span
                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                                      isSelected ? 'bg-page text-fg' : 'bg-elevated text-subtle'
                                    }`}
                                  >
                                    {isSelected ? <Check size={11} strokeWidth={3} /> : OPTION_LABELS[idx]}
                                  </span>
                                  <span className="line-clamp-2">{opt}</span>
                                </div>
                              )
                            })}
                          </div>
                          <div className="mt-auto flex items-center justify-between pt-1">
                            <span className="rounded-full border border-line px-3 py-1.5 text-[11px] text-muted">
                              Previous
                            </span>
                            <span className="rounded-full bg-solid px-4 py-1.5 text-[11px] font-semibold text-solid-fg">
                              Next
                            </span>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {phase === 'result' && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="absolute inset-0 overflow-hidden px-3.5 pb-9 pt-[46px] lg:px-5 lg:pb-5 lg:pt-14"
                    >
                      <div className="grid h-full min-h-0 grid-cols-1 grid-rows-[auto_auto_1fr] gap-3 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-4">
                        <div className="lg:col-span-1">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Scorecard</p>
                          <div className="mt-1 flex items-end justify-between gap-3">
                            <h3 className="text-[2rem] font-semibold leading-none tracking-tight text-fg tabular-nums lg:text-[2.6rem]">
                              {RESULT.score}
                              <span className="text-[0.95rem] font-medium text-subtle lg:text-lg">
                                /{RESULT.total}
                              </span>
                            </h3>
                            <p className="pb-0.5 text-[11px] text-muted lg:text-[12px]">
                              Rank {RESULT.rank}
                              <span className="text-subtle"> / {RESULT.of.toLocaleString()}</span>
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 lg:col-start-1 lg:row-start-2 lg:content-start">
                          {stats.map((item) => (
                            <div key={item.label} className="rounded-xl border border-line bg-surface px-2.5 py-2">
                              <p className="text-[10px] text-subtle">{item.label}</p>
                              <p className="mt-0.5 text-[14px] font-semibold tabular-nums text-fg">{item.value}</p>
                            </div>
                          ))}
                        </div>

                        <div className="grid min-h-0 grid-rows-[auto_1fr] gap-3 lg:col-start-2 lg:row-span-2">
                          <div className="rounded-xl border border-line bg-surface px-2.5 py-2">
                            <p className="text-[10px] text-subtle">Last 6 attempts</p>
                            <Sparkline values={RESULT.trend} />
                          </div>
                          <div className="min-h-0 rounded-xl border border-line bg-surface px-2.5 py-2">
                            <p className="mb-2 text-[10px] text-subtle">By topic</p>
                            <TopicBars topics={RESULT.topics} reduceMotion={reduceMotion} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pointer-events-none absolute bottom-2 left-1/2 z-30 h-[4px] w-24 -translate-x-1/2 rounded-full bg-fg/25 lg:hidden" />
                <div className="noise-overlay pointer-events-none absolute inset-0 z-20 opacity-[0.08] mix-blend-overlay dark:opacity-[0.18]" />
              </div>
            </div>

            <div
              aria-hidden="true"
              className="mx-auto mt-1 h-5 w-[70%] rounded-[100%] bg-black/20 blur-xl dark:bg-black/40 lg:mt-2 lg:h-8 lg:blur-2xl"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

const HeroSection = () => {
  const { token } = useSelector((state) => state.auth)
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative flex w-full items-start overflow-hidden bg-page lg:min-h-[100dvh] lg:items-center">
      <div className="page-shell relative z-[1] w-full pb-8 pt-24 md:pb-12 md:pt-28 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8 xl:gap-14">
          <div className="space-y-6 text-center md:space-y-7 lg:text-left">
            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.04, ease: EASE }}
              className="text-[2.35rem] font-semibold leading-[1.06] tracking-tight text-fg sm:text-5xl md:text-[3.4rem]"
            >
              Prepare with purpose.
              <br />
              <span className="font-medium text-muted">Succeed with clarity.</span>
            </motion.h1>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
              className="mx-auto max-w-[38ch] text-base leading-relaxed text-muted md:text-lg lg:mx-0"
            >
              Exam-style mocks, instant feedback, and a clearer next attempt.
            </motion.p>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16, ease: EASE }}
              className="flex flex-col justify-center gap-3 pt-1 sm:flex-row lg:justify-start"
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

          <div className="w-full pb-2 lg:pb-0">
            <PlatformMock />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
