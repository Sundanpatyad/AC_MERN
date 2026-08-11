import React from "react"
import { ArrowRight, CheckCircle2 } from "lucide-react"

const STEPS = [
  {
    title: "Pick your exam track",
    description:
      "Choose the course/category you want to prepare for and start with a clear learning path.",
  },
  {
    title: "Practice with mock tests",
    description:
      "Solve exam-style questions with realistic difficulty and time pressure.",
  },
  {
    title: "Get insights instantly",
    description:
      "Understand your strengths and gaps with progress analytics after every test.",
  },
  {
    title: "Repeat and improve",
    description:
      "Use the insights to focus the right topics and keep raising your scores.",
  },
]

export default function LandingHowItWorksSection() {
  return (
    <section className="section-pad border-t border-line bg-page">
      <div className="page-shell">
        <div className="space-y-3 mb-10 text-center lg:text-left">
          <h2 className="text-3xl md:text-4xl font-semibold text-fg tracking-tight">
            How preparation works
          </h2>
          <p className="text-sm md:text-base text-muted max-w-2xl mx-auto lg:mx-0">
            Simple steps, consistent practice, and clear feedback—built for learners
            who want results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {STEPS.map((step, idx) => (
            <div
              key={step.title}
              className="rounded-2xl border border-line bg-surface p-5 sm:p-6 hover:bg-elevated transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="h-10 w-10 rounded-2xl bg-elevated border border-line flex items-center justify-center">
                    <span className="text-sm font-semibold text-fg">{idx + 1}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute left-1/2 top-full mt-2 w-px h-6 bg-line" />
                  )}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-fg">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">
                    {step.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    <span>Progress-driven learning</span>
                  </div>
                </div>
              </div>

              {idx % 2 === 0 && (
                <div className="mt-5 hidden sm:flex items-center gap-2 text-brand">
                  <ArrowRight className="w-4 h-4" />
                  <span>Keep moving forward</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

