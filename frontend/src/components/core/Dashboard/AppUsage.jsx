import { useEffect, useMemo, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { apiConnector } from "../../../services/apiConnector"
import { studyMaterialEndPoints } from "../../../services/apis"

const formatDuration = (ms = 0) => {
  const total = Math.max(0, Math.round(ms / 1000))
  if (total < 60) return `${total}s`
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  if (minutes < 60) return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins ? `${hours}h ${mins}m` : `${hours}h`
}

const parseIstDate = (dateKey) => new Date(`${dateKey}T00:00:00+05:30`)

const weekday = (dateKey) =>
  parseIstDate(dateKey).toLocaleDateString("en-IN", { weekday: "short" })

const fullDateLabel = (dateKey, todayKey) => {
  const pretty = parseIstDate(dateKey).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  return dateKey === todayKey ? `Today · ${pretty}` : pretty
}

const monthTitle = (year, month) =>
  new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })

const currentIstMonth = () => {
  const key = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).format(new Date())
  const [year, month] = key.split("-").map(Number)
  return { year, month }
}

const shiftMonth = (year, month, delta) => {
  const next = new Date(Date.UTC(year, month - 1 + delta, 1))
  return { year: next.getUTCFullYear(), month: next.getUTCMonth() + 1 }
}

const monthValue = (year, month) => year * 12 + month

export default function AppUsage() {
  const { token } = useSelector((state) => state.auth)
  const now = currentIstMonth()
  const [view, setView] = useState(now)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [studentsOnly, setStudentsOnly] = useState(true)
  const [selectedDate, setSelectedDate] = useState("")
  const [query, setQuery] = useState("")
  const selectedChipRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const month = `${view.year}-${String(view.month).padStart(2, "0")}`
        const response = await apiConnector(
          "GET",
          studyMaterialEndPoints.ADMIN_APP_USAGE,
          null,
          { Authorization: `Bearer ${token}` },
          { month, studentsOnly }
        )
        if (!response?.data?.success) {
          throw new Error(response?.data?.message || "Failed to load")
        }
        if (!cancelled) {
          const payload = response.data.data
          setData(payload)
          const today = payload.today || ""
          const inThisMonth = payload.days?.some((day) => day.date === today)
          setSelectedDate((current) => {
            if (current && payload.days?.some((day) => day.date === current)) return current
            if (inThisMonth) return today
            return payload.days?.[0]?.date || ""
          })
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || err?.message || "Could not load tester activity.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [token, studentsOnly, view.year, view.month])

  useEffect(() => {
    selectedChipRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    })
  }, [selectedDate, data])

  const todayKey = data?.today || ""
  const needle = query.trim().toLowerCase()
  const canGoNext = monthValue(view.year, view.month) < monthValue(now.year, now.month)

  const selectedDay = useMemo(
    () => (data?.days || []).find((day) => day.date === selectedDate) || null,
    [data, selectedDate]
  )

  const users = useMemo(() => {
    const list = selectedDay?.users || []
    if (!needle) return list
    return list.filter((user) =>
      [user.firstName, user.lastName, user.email].join(" ").toLowerCase().includes(needle)
    )
  }, [selectedDay, needle])

  const goMonth = (delta) => {
    const next = shiftMonth(view.year, view.month, delta)
    if (delta > 0 && monthValue(next.year, next.month) > monthValue(now.year, now.month)) return
    setSelectedDate("")
    setView(next)
  }

  return (
    <div className="flex w-full items-start">
      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="mb-2 text-4xl font-bold text-fg text-center lg:text-left">
          Tester activity
        </h1>
        <p className="mb-8 text-sm text-muted text-center lg:text-left max-w-2xl">
          Full month view. Change month, then pick a date to see who signed in or
          opened the mobile app. Website logins are not counted.
        </p>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStudentsOnly(true)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              studentsOnly ? "border-solid bg-solid text-solid-fg" : "border-line text-muted"
            }`}
          >
            Students
          </button>
          <button
            type="button"
            onClick={() => setStudentsOnly(false)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              !studentsOnly ? "border-solid bg-solid text-solid-fg" : "border-line text-muted"
            }`}
          >
            Everyone
          </button>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or email"
            className="ml-auto min-w-[220px] rounded-xl border border-line bg-surface px-3 py-2 text-sm text-fg outline-none"
          />
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => goMonth(-1)}
            className="h-10 w-10 rounded-full border border-line text-fg hover:bg-elevated"
            aria-label="Previous month"
          >
            ‹
          </button>
          <p className="text-lg font-semibold text-fg">{monthTitle(view.year, view.month)}</p>
          <button
            type="button"
            onClick={() => goMonth(1)}
            disabled={!canGoNext}
            className="h-10 w-10 rounded-full border border-line text-fg hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : error ? (
          <p className="text-sm text-brand">{error}</p>
        ) : (
          <>
            <div className="mb-6 -mx-1 overflow-x-auto pb-1 [scrollbar-width:thin]">
              <div className="flex min-w-max gap-2 px-1">
                {(data?.days || []).map((day) => {
                  const active = day.date === selectedDate
                  const future = todayKey && day.date > todayKey
                  return (
                    <button
                      key={day.date}
                      ref={active ? selectedChipRef : null}
                      type="button"
                      onClick={() => setSelectedDate(day.date)}
                      className={`flex w-[76px] shrink-0 flex-col items-center rounded-2xl border px-2 py-3 transition-colors ${
                        active
                          ? "border-solid bg-solid text-solid-fg"
                          : "border-line bg-surface text-muted hover:border-muted"
                      } ${future && !active ? "opacity-45" : ""}`}
                    >
                      <span className={`text-[11px] uppercase tracking-wide ${active ? "text-solid-fg/70" : "text-subtle"}`}>
                        {day.date === todayKey ? "Today" : weekday(day.date)}
                      </span>
                      <span className="mt-1 text-xl font-semibold leading-none">
                        {parseIstDate(day.date).getDate()}
                      </span>
                      <span className={`mt-1.5 text-[11px] ${active ? "text-solid-fg/70" : "text-subtle"}`}>
                        {day.uniqueUsers} {day.uniqueUsers === 1 ? "user" : "users"}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold text-fg">
                {selectedDate ? fullDateLabel(selectedDate, todayKey) : "Select a date"}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {selectedDay
                  ? `${selectedDay.uniqueUsers} ${selectedDay.uniqueUsers === 1 ? "tester" : "testers"} · ${selectedDay.uniqueLogins} login · ${selectedDay.openEvents} opens · ${formatDuration(selectedDay.totalDurationMs)}`
                  : "No activity loaded."}
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              {users.length === 0 ? (
                <p className="px-5 py-8 text-sm text-muted">
                  Is date par kisi ne login ya app open nahi kiya.
                </p>
              ) : (
                users.map((user) => (
                  <div
                    key={user.userId}
                    className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-fg">
                        {[user.firstName, user.lastName].filter(Boolean).join(" ") || "Student"}
                      </p>
                      <p className="text-xs text-subtle">{user.email}</p>
                    </div>
                    <div className="text-right text-sm text-muted">
                      <p>
                        {user.loginCount > 0 ? `Login × ${user.loginCount}` : "Open only"}
                        {" · "}
                        {user.openCount} open
                      </p>
                      <p className="text-xs text-subtle">{formatDuration(user.totalDurationMs)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
