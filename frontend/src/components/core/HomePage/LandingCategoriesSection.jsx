import React, { useMemo } from "react"
import { Link } from "react-router-dom"
import { useCategories } from "../../../hooks/useCategories"

const slugify = (value) =>
  (value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")

export default function LandingCategoriesSection() {
  const { data, isLoading } = useCategories()

  const categories = useMemo(() => {
    const list = Array.isArray(data) ? data : []
    return list.slice(0, 8)
  }, [data])

  return (
    <section className="section-pad border-t border-line bg-page">
      <div className="page-shell">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-10">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-semibold text-fg tracking-tight">
              Choose your course track
            </h2>
            <p className="text-sm md:text-base text-muted max-w-2xl">
              Pick your exam and start practicing with structured mock tests and
              learning paths.
            </p>
          </div>

          <Link to="/catalog" className="btn-secondary w-fit">
            Explore catalog
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-line bg-surface h-24"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {categories.map((cat) => (
              <Link
                key={cat?._id || cat?.name}
                to={`/catalog/${slugify(cat?.name)}`}
                className="group rounded-2xl border border-line bg-surface p-4 hover:bg-elevated transition-colors"
              >
                <div className="h-10 w-10 rounded-2xl bg-elevated border border-line flex items-center justify-center">
                  <span className="text-fg font-semibold text-sm">+</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-fg group-hover:text-solid-fg transition-colors line-clamp-1">
                  {cat?.name}
                </h3>
                <p className="mt-1 text-xs text-muted line-clamp-1">
                  Practice with mock tests
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

