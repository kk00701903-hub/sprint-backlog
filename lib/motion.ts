import type { Transition } from 'framer-motion'

export const springPresets: Record<string, Transition> = {
  gentle: { type: 'spring', stiffness: 200, damping: 30 },
  snappy: { type: 'spring', stiffness: 400, damping: 40 },
  bounce: { type: 'spring', stiffness: 300, damping: 20 },
}
export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}
export const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
}
