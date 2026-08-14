const MAX_LEN = 56
const SUCCESS_MS = 2000
const ERROR_MS = 2400
const INFO_MS = 2000

let seq = 0
let current = null
let hideTimer = null
const listeners = new Set()

function emit() {
  listeners.forEach((fn) => fn(current))
}

function clip(message) {
  const text = String(message ?? '').trim()
  if (!text) return ''
  if (text.length <= MAX_LEN) return text
  return `${text.slice(0, MAX_LEN - 1)}…`
}

function durationFor(type, options) {
  if (type === 'loading') return Infinity
  if (typeof options?.duration === 'number') return options.duration
  if (type === 'error') return ERROR_MS
  if (type === 'success') return SUCCESS_MS
  return INFO_MS
}

function scheduleHide(id, duration) {
  clearTimeout(hideTimer)
  if (duration === Infinity) return
  hideTimer = setTimeout(() => dismiss(id), duration)
}

function show(type, message, options = {}) {
  const text = clip(message)
  if (!text) return current?.id ?? null

  const id = options.id || `t_${++seq}`

  if (current && current.message === text && current.type === type) {
    scheduleHide(current.id, durationFor(type, options))
    return current.id
  }

  current = { id, type, message: text }
  emit()
  scheduleHide(id, durationFor(type, options))
  return id
}

function dismiss(id) {
  if (!current) return
  if (id && current.id !== id) return
  clearTimeout(hideTimer)
  hideTimer = null
  current = null
  emit()
}

function toast(message, options) {
  return show('info', message, options)
}

toast.success = (message, options) => show('success', message, options)
toast.error = (message, options) => show('error', message, options)
toast.loading = (message, options) => show('loading', message, options)
toast.dismiss = dismiss

export function subscribeToast(listener) {
  listeners.add(listener)
  listener(current)
  return () => listeners.delete(listener)
}

export { toast }
export default toast
