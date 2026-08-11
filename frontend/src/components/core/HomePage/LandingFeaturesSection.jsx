import React from "react"
import {
  BookOpen,
  LineChart,
  ShieldCheck,
  Smartphone,
  Timer,
  Sparkles,
} from "lucide-react"

const FEATURES = [
  {
    title: "Exam-focused content",
    description:
      "Curated lessons built around the patterns that show up in real competitive exams.",
    Icon: BookOpen,
  },
  {
    title: "Smart progress tracking",
    description:
      "Clear analytics after every test so you always know what to study next.",
    Icon: LineChart,
  },
  {
    title: "Trust & safety",
    description:
      "Your learning journey stays secure with protected access and clean checkout flows.",
    Icon: ShieldCheck,
  },
  {
    title: "Learn anytime",
    description:
      "Mobile-ready experience designed for quick practice on the go.",
    Icon: Smartphone,
  },
  {
    title: "Time-bound practice",
    description:
      "Mock tests that improve speed, accuracy, and exam-style decision making.",
    Icon: Timer,
  },
  {
    title: "Guided learning",
    description:
      "Step-by-step structure that helps you stay consistent and confident.",
    Icon: Sparkles,
  },
]

export default function LandingFeaturesSection() {
  return (
    <section className="section-pad border-t border-line bg-page">
      <div className="page-shell">
        <div className="space-y-3 mb-10 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-semibold text-fg tracking-tight">
            A learning platform built for results
          </h2>
          <p className="text-sm md:text-base text-muted max-w-2xl mx-auto md:mx-0">
            Everything you need to prepare: focused mock tests, structured learning,
            and progress insights in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map(({ title, description, Icon }) => (
            <div
              key={title}
              className="rounded-2xl border border-line bg-surface p-5 sm:p-6 hover:bg-elevated transition-colors"
            >
              <div className="w-11 h-11 rounded-2xl bg-elevated border border-line flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-fg" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-fg">
                {title}
              </h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

