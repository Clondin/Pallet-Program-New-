import { Clock, AlertTriangle } from 'lucide-react'
import { formatDeadlineCountdown } from '../../lib/deadline'

const TONE_STYLES = {
  normal: 'bg-[#f5f5f5] text-[#666]',
  soon: 'bg-amber-50 text-amber-700',
  urgent: 'bg-orange-50 text-orange-700',
  overdue: 'bg-red-50 text-red-700',
} as const

export function DeadlineChip({
  confirmByMs,
  size = 'md',
}: {
  confirmByMs: number
  size?: 'sm' | 'md'
}) {
  const { label, tone } = formatDeadlineCountdown(confirmByMs)
  const padding = size === 'sm' ? 'px-1.5 py-[2px]' : 'px-2 py-0.5'
  const Icon = tone === 'overdue' ? AlertTriangle : Clock

  return (
    <span
      className={`inline-flex items-center gap-1 ${padding} rounded text-[10px] font-medium ${TONE_STYLES[tone]}`}
    >
      <Icon className="w-2.5 h-2.5" />
      {label}
    </span>
  )
}
