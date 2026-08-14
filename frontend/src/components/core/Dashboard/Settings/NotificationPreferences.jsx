import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { toast } from "@/utils/toast"
import {
  disablePushNotifications,
  enablePushNotifications,
} from "../../../../services/pushNotifications"
import {
  fetchNotificationPrefs,
  saveNotificationPrefs,
} from "../../../../services/operations/notificationAPI"

const DEFAULTS = {
  pushEnabled: true,
  testReminders: true,
  rankUpdates: true,
  promotions: false,
}

const ROWS = [
  {
    key: "pushEnabled",
    label: "Push notifications",
    hint: "Master switch for all alerts",
  },
  {
    key: "testReminders",
    label: "Test reminders",
    hint: "Upcoming mocks and deadlines",
  },
  {
    key: "rankUpdates",
    label: "Rank updates",
    hint: "When leaderboard positions change",
  },
  {
    key: "promotions",
    label: "Promotions",
    hint: "Offers and new series",
  },
]

export default function NotificationPreferences() {
  const { token } = useSelector((state) => state.auth)
  const [prefs, setPrefs] = useState(DEFAULTS)
  const [ready, setReady] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!token) return
    ;(async () => {
      const data = await fetchNotificationPrefs(token)
      if (data) setPrefs({ ...DEFAULTS, ...data })
      setReady(true)
    })()
  }, [token])

  const update = async (key, value) => {
    const next = { ...prefs, [key]: value }
    if (key === "pushEnabled") {
      if (!value) {
        next.testReminders = false
        next.rankUpdates = false
        next.promotions = false
        await disablePushNotifications(token)
      } else {
        await enablePushNotifications(token)
      }
    }

    setPrefs(next)
    setSaving(true)
    const saved = await saveNotificationPrefs(next, token)
    setSaving(false)
    if (saved) {
      setPrefs(saved)
      toast.success("Saved")
    }
  }

  return (
    <div className="my-10 flex flex-col gap-y-6 rounded-md border-[1px] border-line bg-surface p-8 px-12">
      <div>
        <h2 className="text-lg font-semibold text-fg">Notifications</h2>
        <p className="mt-1 text-sm text-subtle">
          Control which alerts you receive on web and mobile. Preferences sync to your account.
          {saving ? " Saving…" : ""}
        </p>
      </div>

      <div className="flex flex-col divide-y divide-line">
        {ROWS.map((row) => {
          const disabled =
            !ready || (row.key !== "pushEnabled" && !prefs.pushEnabled)
          return (
            <div
              key={row.key}
              className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div>
                <p className="font-medium text-fg">{row.label}</p>
                <p className="text-sm text-subtle">{row.hint}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={!!prefs[row.key]}
                disabled={disabled}
                onClick={() => update(row.key, !prefs[row.key])}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-40 ${
                  prefs[row.key] ? "bg-yellow-50" : "bg-elevated"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-page transition-transform ${
                    prefs[row.key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
