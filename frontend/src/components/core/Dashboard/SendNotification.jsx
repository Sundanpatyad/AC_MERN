import { useState } from "react"
import { useSelector } from "react-redux"
import { sendPushNotification } from "../../../services/operations/notificationAPI"

const CATEGORIES = [
  {
    id: "testReminders",
    label: "Test reminders",
    hint: "Upcoming mocks and deadlines",
  },
  {
    id: "rankUpdates",
    label: "Rank updates",
    hint: "Leaderboard position changes",
  },
  {
    id: "promotions",
    label: "Promotions",
    hint: "Offers and new series",
  },
  {
    id: "general",
    label: "General",
    hint: "Any user with push enabled",
  },
]

export default function SendNotification() {
  const { token } = useSelector((state) => state.auth)

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [category, setCategory] = useState("testReminders")
  const [target, setTarget] = useState("all") // 'all' | 'email'
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    if (target === "email" && !email.trim()) return

    setIsSubmitting(true)
    try {
      const payload =
        target === "all"
          ? {
              title: title.trim(),
              body: body.trim(),
              broadcast: true,
              category,
            }
          : {
              title: title.trim(),
              body: body.trim(),
              email: email.trim(),
              category,
            }

      const result = await sendPushNotification(payload, token)
      if (result?.success) {
        setTitle("")
        setBody("")
        if (target === "email") setEmail("")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex w-full items-start gap-x-8">
      <div className="flex flex-1 flex-col">
        <h1 className="mb-4 text-4xl font-bold text-fg text-center lg:text-left">
          Send Notification
        </h1>
        <p className="mb-10 text-sm text-muted text-center lg:text-left">
          Choose a type matching the toggles in the app/web notification settings.
          Users who disabled that type will be skipped.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
          <div className="rounded-2xl border border-line bg-surface p-8 shadow-2xl space-y-6">
            <h2 className="text-2xl font-bold text-fg mb-2">Message</h2>

            <div className="space-y-2">
              <label htmlFor="notif-title" className="block text-sm font-medium text-fg">
                Title <sup className="text-pink-400">*</sup>
              </label>
              <input
                id="notif-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={120}
                placeholder="e.g. New mock test available"
                className="w-full px-4 py-3 rounded-lg bg-page border border-line text-fg placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="notif-body" className="block text-sm font-medium text-fg">
                Description <sup className="text-pink-400">*</sup>
              </label>
              <textarea
                id="notif-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={4}
                maxLength={500}
                placeholder="Write the notification message..."
                className="w-full px-4 py-3 rounded-lg bg-page border border-line text-fg placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-y"
              />
            </div>

            <div className="space-y-3">
              <p className="block text-sm font-medium text-fg">Notification type</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORIES.map((item) => (
                  <label
                    key={item.id}
                    className={`cursor-pointer rounded-lg border px-4 py-3 transition-all ${
                      category === item.id
                        ? "border-blue-500 bg-blue-500/10 text-fg"
                        : "border-line bg-page text-muted hover:border-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={item.id}
                      checked={category === item.id}
                      onChange={() => setCategory(item.id)}
                      className="sr-only"
                    />
                    <span className="font-semibold">{item.label}</span>
                    <span className="block text-xs text-muted mt-1">{item.hint}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="block text-sm font-medium text-fg">Send to</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <label
                  className={`flex-1 cursor-pointer rounded-lg border px-4 py-3 transition-all ${
                    target === "all"
                      ? "border-blue-500 bg-blue-500/10 text-fg"
                      : "border-line bg-page text-muted hover:border-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="target"
                    value="all"
                    checked={target === "all"}
                    onChange={() => setTarget("all")}
                    className="sr-only"
                  />
                  <span className="font-semibold">All users</span>
                  <span className="block text-xs text-muted mt-1">
                    Everyone with a registered push device
                  </span>
                </label>

                <label
                  className={`flex-1 cursor-pointer rounded-lg border px-4 py-3 transition-all ${
                    target === "email"
                      ? "border-blue-500 bg-blue-500/10 text-fg"
                      : "border-line bg-page text-muted hover:border-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="target"
                    value="email"
                    checked={target === "email"}
                    onChange={() => setTarget("email")}
                    className="sr-only"
                  />
                  <span className="font-semibold">Single user</span>
                  <span className="block text-xs text-muted mt-1">
                    Target one account by email
                  </span>
                </label>
              </div>
            </div>

            {target === "email" && (
              <div className="space-y-2">
                <label htmlFor="notif-email" className="block text-sm font-medium text-fg">
                  User email <sup className="text-pink-400">*</sup>
                </label>
                <input
                  id="notif-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="student@example.com"
                  className="w-full px-4 py-3 rounded-lg bg-page border border-line text-fg placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {isSubmitting ? "Sending..." : "Send notification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
