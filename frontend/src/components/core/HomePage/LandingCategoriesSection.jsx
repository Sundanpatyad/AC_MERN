import React from "react"
import { Link } from "react-router-dom"

const tracks = [
  {
    title: "Mock Tests",
    description: "Exam-style practice with instant feedback.",
    to: "/mocktest",
  },
  {
    title: "Study Material",
    description: "PDFs and notes for focused revision.",
    to: "/study-material",
  },
]

export default function LandingCategoriesSection() {
  return (
    <section className="section-pad border-t border-line bg-page">
      <div className="page-shell">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-10">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-semibold text-fg tracking-tight">
              Start preparing
            </h2>
            <p className="text-sm md:text-base text-muted max-w-2xl">
              Practice with structured mock tests and revise with study material.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-3xl">
          {tracks.map((track) => (
            <Link
              key={track.to}
              to={track.to}
              className="group rounded-2xl border border-line bg-surface p-5 hover:bg-elevated transition-colors"
            >
              <div className="h-10 w-10 rounded-2xl bg-elevated border border-line flex items-center justify-center">
                <span className="text-fg font-semibold text-sm">→</span>
              </div>
              <h3 className="mt-3 text-base font-semibold text-fg group-hover:text-solid-fg transition-colors">
                {track.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{track.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
