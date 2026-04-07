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
  const editorGridColumns = useAppSettingsStore((s) => s.settings.editorGridColumns)

  const palletType = currentProject?.palletType ?? 'full'
  const isHalf = palletType === 'half'
  const tiers = useTierConfig(currentProject?.tierCount ?? 4, 60, palletType)

  const tierSlots = useMemo(() => {
    // Half pallets are always front-only
    const face = isHalf ? 'front' : activeFace
    return tiers.map(tier => ({
      tier,
      slots: generate2DSlotGrid(tier, face, editorGridColumns),
    }))
  }, [tiers, activeFace, editorGridColumns, isHalf])

  if (!currentProject) return null

  return (
    <div className="h-full flex items-center justify-center relative bg-[#fafafa]">
      {/* Pallet Navigator - top left overlay */}
      <div className="absolute top-20 left-12 z-20">
        <PalletNavigator />
      </div>

      {/* Shelf container */}
      <div className="relative w-full max-w-4xl px-12 pt-20">
        {/* Half pallet label */}
        {isHalf && (
          <div className="text-center mb-3">
            <span className="text-[11px] font-medium text-[#888] uppercase tracking-wider">Front Face</span>
          </div>
        )}

        {/* The Shelf Frame */}
        <div className="bg-white shadow-card rounded p-1">
          {/* Shelf Tiers (Bottom-to-Top) */}
          <div className="flex flex-col-reverse gap-1">
            {tierSlots.map(({ tier, slots }, idx) => {
              const colCount = new Set(slots.map(s => s.col)).size
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
                  <ShelfLipBar
                    text={currentProject.branding?.lipText ?? 'ALL YOUR HOLIDAY NEEDS'}
                    color={currentProject.lipColor}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Shadow Depth */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[90%] h-4 bg-black/[0.04] blur-xl rounded-full" />
      </div>

      {/* Status bar */}
      <EditorStatusBar activeFace={isHalf ? 'front' : activeFace} />
    </div>
  )
}
