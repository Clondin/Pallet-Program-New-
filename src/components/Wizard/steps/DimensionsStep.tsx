import { AlertTriangle } from 'lucide-react'

import type { WizardState, WizardAction, DimensionPreset } from '../wizardTypes'
import { DimensionInput } from '../shared/DimensionInput'

interface DimensionsStepProps {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
}

const PRESETS: { value: DimensionPreset; label: string }[] = [
  { value: '48x40', label: '48 × 40 GMA' },
  { value: '48x48', label: '48 × 48' },
  { value: '42x42', label: '42 × 42' },
  { value: '48x42', label: '48 × 42' },
  { value: 'custom', label: 'Custom' },
]

export function DimensionsStep({ state, dispatch }: DimensionsStepProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Section header */}
      <h3
        className="font-semibold"
        style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}
      >
        Base Dimensions
      </h3>

      {/* Preset pills */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const isSelected = state.preset === p.value
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => dispatch({ type: 'SET_PRESET', preset: p.value })}
              className="rounded-full px-4 transition-colors hover:bg-[#E2E8F0]"
              style={{
                height: '36px',
                fontSize: '12px',
                fontWeight: 500,
                backgroundColor: isSelected ? '#2563EB' : '#F1F5F9',
                color: isSelected ? '#FFFFFF' : '#64748B',
              }}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      {/* Dimension inputs row */}
      <div className="grid grid-cols-3 gap-3">
        <DimensionInput
          label="Width"
          value={state.baseWidth}
          onChange={(value) =>
            dispatch({ type: 'SET_DIMENSION', field: 'baseWidth', value })
          }
          min={30}
          max={60}
        />
        <DimensionInput
          label="Depth"
          value={state.baseDepth}
          onChange={(value) =>
            dispatch({ type: 'SET_DIMENSION', field: 'baseDepth', value })
          }
          min={30}
          max={60}
        />
        <DimensionInput
          label="Height"
          value={state.baseHeight}
          onChange={(value) =>
            dispatch({ type: 'SET_DIMENSION', field: 'baseHeight', value })
          }
          min={4}
          max={8}
          hint="Pallet base"
        />
      </div>

      {/* Max Display Height */}
      <div className="flex flex-col gap-1">
        <label
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: '#94A3B8' }}
        >
          Max Display Height (including pallet)
        </label>
        <div className="relative">
          <input
            type="number"
            value={state.maxHeight}
            onChange={(e) => {
              const num = parseFloat(e.target.value)
              if (!isNaN(num)) {
                dispatch({ type: 'SET_DIMENSION', field: 'maxHeight', value: num })
              }
            }}
            min={30}
            max={96}
            className="h-12 w-full rounded-lg border text-center text-base font-semibold outline-none transition-colors focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            style={{
              backgroundColor: '#F8FAFC',
              borderColor: '#E2E8F0',
              color: '#0F172A',
              fontSize: '16px',
              fontWeight: 600,
            }}
          />
          <span
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: '#94A3B8', fontSize: '12px' }}
          >
            in
          </span>
        </div>
        <span style={{ color: '#94A3B8', fontSize: '10px' }}>
          Total height from floor to top of header. Standard retail max is 60&quot;.
        </span>

        {/* Height warning */}
        {state.maxHeight > 72 && (
          <div className="mt-1 flex items-center gap-1.5">
            <AlertTriangle size={13} style={{ color: '#D97706', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: '#D97706', fontWeight: 500 }}>
              Exceeds standard retail height guidelines
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
