import { useMemo } from 'react'
import { TierConfig, SlotGridItem } from '../../types'
import { useDisplayStore } from '../../stores/display-store'
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
  const currentProject = useDisplayStore((s) => s.currentProject)
  const visibleSlots = useMemo(() => {
    const sortedSlots = [...slots].sort((a, b) => a.row - b.row || a.col - b.col)
    const rows = new Map<number, SlotGridItem[]>()

    sortedSlots.forEach((slot) => {
      const rowSlots = rows.get(slot.row) ?? []
      rowSlots.push(slot)
      rows.set(slot.row, rowSlots)
    })

    return [...rows.entries()]
      .sort((a, b) => a[0] - b[0])
      .flatMap(([, rowSlots]) => {
        let coveredUntil = -1

        return rowSlots.flatMap((slot) => {
          if (slot.col <= coveredUntil) {
            return []
          }

          const placement = currentProject?.placements.find(
            (candidate) => candidate.slotId === slot.slotId,
          )
          const span = Math.max(
            1,
            Math.min(colCount - slot.col, placement?.colSpan ?? 1),
          )

          coveredUntil = placement ? slot.col + span - 1 : coveredUntil

          return [{ slot, span }]
        })
      })
  }, [colCount, currentProject?.placements, slots])

  return (
    <div
      className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${colCount || 1}, 1fr)`,
        height: `${height}px`,
      }}
    >
      {slots.length > 0 ? (
        visibleSlots.map(({ slot, span }) => (
          <GridCell key={slot.slotId} slot={slot} colSpan={span} />
        ))
      ) : (
        <div className="col-span-full flex items-center justify-center text-[11px] text-[#ccc]">
          No slots on this face
        </div>
      )}
    </div>
  )
}
