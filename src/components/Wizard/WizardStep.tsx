import { motion } from 'motion/react'

interface WizardStepProps {
  direction: number
  children: React.ReactNode
}

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

export function WizardStep({ direction, children }: WizardStepProps) {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="absolute inset-0 overflow-y-auto px-8 py-6"
    >
      {children}
    </motion.div>
  )
}
