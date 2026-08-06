import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const InstructorSection = () => {
  return (
    <section className="section-pad border-t border-line bg-page">
      <div className="page-shell">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-semibold text-fg tracking-tight leading-tight">
            Built for serious aspirants
          </h2>
          <p className="text-base text-muted leading-relaxed">
            Realistic mock tests, clear analytics, and a mobile-ready experience so you can prepare anytime.
          </p>

          <ul className="flex flex-wrap justify-center gap-2 pt-1">
            {['Real-time analytics', 'Expert curated', 'Mobile ready'].map((item) => (
              <li
                key={item}
                className="px-4 py-2 rounded-full bg-surface text-sm text-muted"
              >
                {item}
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <Link to="/mocktest" className="btn-primary">
              Explore mock tests
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InstructorSection
