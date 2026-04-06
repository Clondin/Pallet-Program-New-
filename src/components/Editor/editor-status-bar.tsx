import { useMemo } from 'react'
import { useDisplayStore } from '../../stores/display-store'
import { useTierConfig } from '../../hooks/useTierConfig'
import { generateSlotGrid } from '../../lib/slot-utils'

interface EditorStatusBarProps {
  activeFace: string
}

export function EditorStatusBar({ activeFace }: EditorStatusBarProps) {
  const currentProject = useDisplayStore((s) => s.currentProject)
  const tiers = useTierConfig(currentProject?.tierCount ?? 4)

  const placedCount = currentProject?.placements?.length ?? 0
  const tierCount = currentProject?.tierCount ?? 0
  const totalSlots = useMemo(
    () =>
      tiers.reduce((sum, tier) => {
        return sum + generateSlotGrid(tier).filter((slot) => slot.face === activeFace).length
      }, 0),
    [activeFace, tiers]
  )
  const weight = currentProject?.placements?.reduce(
    (sum, p) => sum + Math.round(p.width * p.height * p.depth * 0.03),
    0
  ) ?? 0

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
      <div className="flex items-center gap-4 bg-[#111] text-white px-5 py-2 rounded-lg shadow-elevated">
        {/* Status indicator */}
        <div className="flex items-center gap-2 pr-4" style={{ boxShadow: '1px 0 0 0 rgba(255,255,255,0.08)' }}>
          <div className="w-[6px] h-[6px] rounded-full bg-emerald-500" />
          <span className="text-[11px] font-medium capitalize">{activeFace}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 text-[11px] font-medium text-[#888]">
          <span>
            <span className="text-white tabular-nums">{placedCount}</span> of{' '}
            <span className="text-white tabular-nums">{totalSlots}</span> slots
          </span>
          <span>
            <span className="text-white tabular-nums">{tierCount}</span> tiers
          </span>
          <span>
            <span className="text-white tabular-nums">{weight}</span> lbs
          </span>
        </div>
      </div>
    </div>
  )
}
