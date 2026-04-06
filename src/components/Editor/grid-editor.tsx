import { useMemo } from 'react'
import { useDisplayStore } from '../../stores/display-store'
import { useTierConfig } from '../../hooks/useTierConfig'
import { generate2DSlotGrid } from '../../lib/slot-utils'
import { TierRow } from './tier-row'
import { ShelfLipBar } from './shelf-lip-bar'
import { PalletNavigator } from './pallet-navigator'
import { EditorStatusBar } from './editor-status-bar'
import { useAppSettingsStore } from '../../stores/app-settings-store'

export function GridEditor() {
  const currentProject = useDisplayStore(s => s.currentProject)
  const activeFace = useDisplayStore(s => s.activeFace)
  const setActiveFace = useDisplayStore(s => s.setActiveFace)
  const editorGridColumns = useAppSettingsStore((s) => s.settings.editorGridColumns)

  const tiers = useTierConfig(currentProject?.tierCount ?? 4)

  const tierSlots = useMemo(() => {
    return tiers.map(tier => ({
      tier,
      slots: generate2DSlotGrid(tier, activeFace, editorGridColumns),
    }))
  }, [tiers, activeFace, editorGridColumns])

  if (!currentProject) return null

  return (
    <div className="h-full flex items-center justify-center relative bg-[#F8F7F5]">
      {/* Pallet Navigator - top left overlay */}
      <div className="absolute top-20 left-12 z-20">
        <PalletNavigator />
      </div>

      {/* Shelf container */}
      <div className="relative w-full max-w-4xl px-12 pt-20">
        {/* The Shelf Frame */}
        <div className="bg-white border border-[#E8E4DE] rounded-sm p-1 shadow-2xl shadow-slate-900/5">
          {/* Shelf Tiers (Bottom-to-Top) */}
          <div className="flex flex-col-reverse gap-1">
            {tierSlots.map(({ tier, slots }, idx) => {
              const colCount = new Set(slots.map(s => s.col)).size
              const maxRow =
                slots.length > 0 ? Math.max(...slots.map(s => s.row)) : 0
              const maxCol = colCount > 0 ? colCount : 1

              return (
                <div key={tier.id}>
                  <TierRow
                    tier={tier}
                    slots={slots}
                    colCount={maxCol}
                    tierIndex={idx}
                    totalTiers={tierSlots.length}
                  />
                  {/* Shelf Lip Strip */}
                  <ShelfLipBar
                    text={
                      currentProject.branding?.lipText ?? 'ALL YOUR HOLIDAY NEEDS'
                    }
                    color={currentProject.lipColor}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Shadow Depth */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[90%] h-4 bg-slate-900/5 blur-xl rounded-full" />
      </div>

      {/* Status bar - bottom center */}
      <EditorStatusBar activeFace={activeFace} />
    </div>
  )
}
