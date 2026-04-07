import { TierConfig, SlotGridItem } from '../../types'
import { GridCell } from './grid-cell'

interface TierRowProps {
  tier: TierConfig
  slots: SlotGridItem[]
  colCount: number
  tierIndex: number
  totalTiers: number
}

const tierHeights = [140, 120, 120, 100, 100, 80]

export function TierRow({
  tier,
  slots,
  colCount,
  tierIndex,
  totalTiers,
}: TierRowProps) {
  const height = tierHeights[tierIndex] ?? 100

  return (
    <div
      className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${colCount || 1}, 1fr)`,
        height: `${height}px`,
      }}
    >
      {slots.length > 0 ? (
        slots
          .sort((a, b) => a.row - b.row || a.col - b.col)
          .map(slot => <GridCell key={slot.slotId} slot={slot} />)
      ) : (
        <div className="col-span-full flex items-center justify-center text-[11px] text-[#ccc]">
          No slots on this face
        </div>
      )}
    </div>
  )
}
