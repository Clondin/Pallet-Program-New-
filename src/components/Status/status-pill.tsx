import type { PalletStatus } from '../../types'

export const STATUS_LABELS: Record<PalletStatus, string> = {
  draft: 'Draft',
  ready: 'Ready',
  in_build: 'In Build',
  built: 'Built',
}

const STATUS_COLORS: Record<PalletStatus, { dot: string; bg: string; text: string }> = {
  draft: { dot: 'bg-[#999]', bg: 'bg-[#f5f5f5]', text: 'text-[#666]' },
  ready: { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  in_build: { dot: 'bg-[#0a72ef]', bg: 'bg-[#eff6ff]', text: 'text-[#0a72ef]' },
  built: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
}

export function StatusPill({
  status,
  size = 'md',
}: {
  status: PalletStatus
  size?: 'sm' | 'md'
}) {
  const colors = STATUS_COLORS[status]
  const padding = size === 'sm' ? 'px-1.5 py-[2px]' : 'px-2 py-0.5'
  const text = size === 'sm' ? 'text-[10px]' : 'text-[10px]'

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${padding} rounded-full ${colors.bg} ${colors.text} ${text} font-medium uppercase tracking-wider`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {STATUS_LABELS[status]}
    </span>
  )
}
