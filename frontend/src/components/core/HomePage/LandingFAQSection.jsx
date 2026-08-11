import React, { useState } from "react"
import { ChevronDown } from "lucide-react"

const FAQS = [
  {
    q: "Do I need prior coaching to start?",
    a: "No. Our mock tests and learning structure are designed to help you build a strong foundation and improve steadily.",
  },
  {
    q: "Are the mock tests exam-realistic?",
    a: "Yes. Questions follow exam patterns and difficulty levels, so your practice translates directly to your actual attempt.",
  },
  {
    q: "How does progress tracking work?",
    a: "After every test, you get insights on performance so you can focus on the topics that need improvement.",
  },
  {
    q: "Can I study on mobile?",
    a: "Absolutely. The platform is mobile-ready so you can practice anytime and track progress on the go.",
  },
  {
    q: "Is there any refund policy?",
    a: "Checkout support includes standard payment flows. If you have a specific case, contact our support team and we’ll help.",
  },
]

export default function LandingFAQSection() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="section-pad border-t border-line bg-page">
      <div className="page-shell">
        <div className="space-y-2 mb-8">
          <h2 className="text-3xl md:text-4xl font-semibold text-fg tracking-tight">
            Questions, answered
          </h2>
          <p className="text-sm md:text-base text-muted max-w-2xl">
            Everything you need to know about preparing with Awakening Classes.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((item, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={item.q}
                className="rounded-2xl border border-line bg-surface overflow-hidden"
              >
                <button
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-fg">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-muted leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

