import React, { useCallback } from 'react'
import { Grid3x3, Palette, DoorOpen, Minus, Plus } from 'lucide-react'

import type { WizardState, WizardAction, WallType } from '../wizardTypes'
import type { WallFace } from '../../../types'
import { StepperControl } from '../shared/StepperControl'
import { SegmentedControl } from '../shared/SegmentedControl'
import { WallOutline } from '../shared/WallOutline'
import { DimensionInput } from '../shared/DimensionInput'

interface ShelfConfigStepProps {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
}

const WALL_TYPE_OPTIONS = [
  { value: 'shelves', label: 'Shelves', icon: <Grid3x3 size={14} /> },
  { value: 'branded-panel', label: 'Branded', icon: <Palette size={14} /> },
  { value: 'open', label: 'Open', icon: <DoorOpen size={14} /> },
]

const WALL_DOT_COLORS: Record<WallType, string> = {
  shelves: '#2563EB',
  'branded-panel': '#00A3C7',
  open: '#94A3B8',
}

const WALL_ORDER: { key: WallFace; label: string }[] = [
  { key: 'front', label: 'Front' },
  { key: 'right', label: 'Right' },
  { key: 'back', label: 'Back' },
  { key: 'left', label: 'Left' },
]

export function ShelfConfigStep({ state, dispatch }: ShelfConfigStepProps) {
  const handleTierCountChange = useCallback(
    (count: number) => {
      dispatch({ type: 'SET_TIER_COUNT', count })
    },
    [dispatch]
  )

  const handleTierHeightChange = useCallback(
    (tierIndex: number, height: number) => {
      dispatch({ type: 'SET_TIER_HEIGHT', tierIndex, height })
    },
    [dispatch]
  )

  const handleWallTypeChange = useCallback(
    (wall: WallFace, wallType: string) => {
      dispatch({ type: 'SET_WALL_TYPE', wall, wallType: wallType as WallType })
    },
    [dispatch]
  )

  const handleWallColumnsChange = useCallback(
    (wall: WallFace, delta: number) => {
      const current = state.walls[wall].gridColumns
      const next = Math.min(8, Math.max(3, current + delta))
      dispatch({ type: 'SET_WALL_COLUMNS', wall, columns: next })
    },
    [dispatch, state.walls]
  )

  const totalTierHeight =
    state.tierHeights.reduce((s, h) => s + h, 0) + state.tierCount
  const totalWithPallet = totalTierHeight + state.baseHeight
  const exceeds = totalWithPallet > state.maxHeight

  // Tiers displayed top-to-bottom (highest index first)
  const tierIndices = Array.from({ length: state.tierCount }, (_, i) => i).reverse()

  return (
    <div className="flex flex-col gap-6 overflow-y-auto" style={{ maxHeight: '450px' }}>
      {/* Section A: Tiers */}
      <div className="flex flex-col gap-3">
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
          Tiers
        </h3>

        <StepperControl
          label="Number of Tiers"
          value={state.tierCount}
          onChange={handleTierCountChange}
          min={2}
          max={6}
        />

        <div className="flex flex-col gap-2">
          {tierIndices.map((tierIndex) => {
            const tierNum = tierIndex + 1
            const isBase = tierIndex === 0
            const isTop = tierIndex === state.tierCount - 1
            const height = state.tierHeights[tierIndex] ?? 10

            return (
              <div key={tierIndex} className="flex items-center gap-3">
                {/* Label */}
                <div className="w-[72px] shrink-0">
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                    Tier {tierNum}
                  </span>
                  {isBase && (
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}> (Base)</span>
                  )}
                  {isTop && (
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}> (Top)</span>
                  )}
                </div>

                {/* Range slider */}
                <input
                  type="range"
                  min={5}
                  max={18}
                  value={height}
                  onChange={(e) =>
                    handleTierHeightChange(tierIndex, parseInt(e.target.value, 10))
                  }
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full accent-blue-600"
                  style={{ backgroundColor: '#E2E8F0' }}
                />

                {/* Numeric input */}
                <input
                  type="number"
                  min={5}
                  max={18}
                  value={height}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10)
                    if (!isNaN(val)) handleTierHeightChange(tierIndex, val)
                  }}
                  className="h-8 w-[48px] shrink-0 rounded-md border text-center text-sm font-semibold outline-none transition-colors focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderColor: '#E2E8F0',
                    color: '#0F172A',
                  }}
                />
              </div>
            )
          })}
        </div>

        {/* Total height */}
        <div className="flex flex-col gap-1">
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            Total display height: {totalTierHeight}&quot; (+ {state.baseHeight}&quot; pallet ={' '}
            {totalWithPallet}&quot; total)
          </span>
          {exceeds && (
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '11px', color: '#DC2626' }}>
                &#9888; Exceeds max height of {state.maxHeight}&quot; by{' '}
                {totalWithPallet - state.maxHeight}&quot;
              </span>
              <button
                type="button"
                onClick={() => dispatch({ type: 'AUTO_FIT_TIERS' })}
                className="text-xs font-medium underline transition-colors hover:opacity-80"
                style={{ color: '#2563EB', fontSize: '11px' }}
              >
                Auto-fit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full" style={{ backgroundColor: '#E2E8F0' }} />

      {/* Section B: Wall Configuration */}
      <div className="flex flex-col gap-3">
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
          Wall Configuration
        </h3>

        <div className="flex justify-center">
          <WallOutline walls={state.walls} />
        </div>

        <div className="flex flex-col gap-2">
          {WALL_ORDER.map(({ key, label }) => {
            const wall = state.walls[key]
            return (
              <div key={key} className="flex items-center gap-3">
                {/* Wall name with dot */}
                <div className="flex w-[56px] shrink-0 items-center gap-1.5">
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: WALL_DOT_COLORS[wall.type] }}
                  />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                    {label}
                  </span>
                </div>

                {/* Segmented control */}
                <div className="flex-1">
                  <SegmentedControl
                    options={WALL_TYPE_OPTIONS}
                    value={wall.type}
                    onChange={(val) => handleWallTypeChange(key, val)}
                  />
                </div>

                {/* Grid columns mini stepper (shelves only) */}
                {wall.type === 'shelves' ? (
                  <div className="flex shrink-0 items-center gap-1">
                    <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>
                      Cols:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleWallColumnsChange(key, -1)}
                      disabled={wall.gridColumns <= 3}
                      className="flex h-6 w-6 items-center justify-center rounded transition-colors"
                      style={{ backgroundColor: '#F1F5F9' }}
                    >
                      <Minus
                        size={10}
                        className={wall.gridColumns <= 3 ? 'opacity-40' : ''}
                        style={{ color: '#0F172A' }}
                      />
                    </button>
                    <span
                      className="w-5 text-center text-xs font-semibold tabular-nums"
                      style={{ color: '#0F172A' }}
                    >
                      {wall.gridColumns}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleWallColumnsChange(key, 1)}
                      disabled={wall.gridColumns >= 8}
                      className="flex h-6 w-6 items-center justify-center rounded transition-colors"
                      style={{ backgroundColor: '#F1F5F9' }}
                    >
                      <Plus
                        size={10}
                        className={wall.gridColumns >= 8 ? 'opacity-40' : ''}
                        style={{ color: '#0F172A' }}
                      />
                    </button>
                  </div>
                ) : (
                  <div className="w-[88px] shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full" style={{ backgroundColor: '#E2E8F0' }} />

      {/* Shelf Tray Depth */}
      <div className="flex flex-col gap-1">
        <DimensionInput
          label="Shelf Tray Depth"
          value={state.shelfDepth}
          onChange={(depth) => dispatch({ type: 'SET_SHELF_DEPTH', depth })}
          min={6}
          max={14}
          hint="6–14 in"
        />
        <span style={{ fontSize: '10px', color: '#94A3B8' }}>
          How deep each shelf tray extends from the wall.
        </span>
      </div>
    </div>
  )
}
