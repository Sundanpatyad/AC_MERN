import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { subscribeToast, toast as toastApi } from '@/utils/toast'

const DOT = {
  success: 'bg-emerald-500',
  error: 'bg-brand',
  loading: 'bg-subtle animate-pulse',
  info: 'bg-fg/50',
}

export default function Toaster() {
  const [toast, setToast] = useState(null)

  useEffect(() => subscribeToast(setToast), [])

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-20 z-[200] flex justify-center px-4"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="wait">
        {toast && (
          <motion.button
            key={toast.id}
            type="button"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => toastApi.dismiss(toast.id)}
            className="pointer-events-auto inline-flex max-w-[min(92vw,22rem)] items-center gap-2.5 rounded-full border border-line bg-surface/95 px-3.5 py-2 text-left shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-md"
          >
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[toast.type] || DOT.info}`} />
            <span className="truncate text-[13px] font-medium leading-none text-fg">
              {toast.message}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
