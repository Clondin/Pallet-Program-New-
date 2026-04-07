import { Info } from 'lucide-react'

import type { WizardState, WizardAction } from '../wizardTypes'

interface PalletTypeStepProps {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
}

function FullPalletIllustration() {
  return (
    <div className="relative flex h-[72px] w-[72px] items-center justify-center">
      {/* Pallet base */}
      <div
        className="h-[52px] w-[52px] rounded-sm"
        style={{ backgroundColor: '#D4A574' }}
      />
      {/* Shelf lines — all 4 sides */}
      <div
        className="absolute left-[6px] top-[10px] h-[52px] w-[3px] rounded-full"
        style={{ backgroundColor: '#2563EB' }}
      />
      <div
        className="absolute right-[6px] top-[10px] h-[52px] w-[3px] rounded-full"
        style={{ backgroundColor: '#2563EB' }}
      />
      <div
        className="absolute left-[10px] top-[6px] h-[3px] w-[52px] rounded-full"
        style={{ backgroundColor: '#2563EB' }}
      />
      <div
        className="absolute bottom-[6px] left-[10px] h-[3px] w-[52px] rounded-full"
        style={{ backgroundColor: '#2563EB' }}
      />
    </div>
  )
}

function HalfPalletIllustration() {
  return (
    <div className="relative flex h-[72px] w-[72px] items-center justify-center">
      {/* Pallet base */}
      <div
        className="h-[52px] w-[52px] rounded-sm"
        style={{ backgroundColor: '#D4A574' }}
      />
      {/* Front shelves */}
      <div
        className="absolute bottom-[6px] left-[10px] h-[3px] w-[52px] rounded-full"
        style={{ backgroundColor: '#2563EB' }}
      />
      {/* Branded side panels */}
      <div
        className="absolute left-[6px] top-[10px] h-[52px] w-[3px] rounded-full"
        style={{ backgroundColor: '#8B5CF6' }}
      />
      <div
        className="absolute right-[6px] top-[10px] h-[52px] w-[3px] rounded-full"
        style={{ backgroundColor: '#8B5CF6' }}
      />
      {/* Dashed back */}
      <div
        className="absolute left-[10px] top-[6px] h-[3px] w-[52px]"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, #94A3B8 0px, #94A3B8 4px, transparent 4px, transparent 8px)',
        }}
      />
    </div>
  )
}

function RadioCircle({ selected }: { selected: boolean }) {
  return (
    <div
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
      style={{
        borderColor: selected ? '#2563EB' : '#E2E8F0',
      }}
    >
      {selected && (
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: '#2563EB' }}
        />
      )}
    </div>
  )
}

export function PalletTypeStep({ state, dispatch }: PalletTypeStepProps) {
  const isFullSelected = state.palletType === 'full'
  const isHalfSelected = state.palletType === 'half'

  return (
    <div className="flex flex-col gap-3">
      <h3
        className="font-semibold"
        style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}
      >
        Choose Display Type
      </h3>

      <div className="flex flex-col gap-3">
        {/* Full Pallet Card */}
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_PALLET_TYPE', palletType: 'full' })}
          className="relative flex w-full cursor-pointer items-center rounded-lg border-2 p-4 text-left transition-colors"
          style={{
            minHeight: '120px',
            borderColor: isFullSelected ? '#2563EB' : '#E2E8F0',
            backgroundColor: isFullSelected ? '#EFF6FF' : '#FFFFFF',
          }}
        >
          <div className="flex w-[40%] items-center justify-center">
            <FullPalletIllustration />
          </div>
          <div className="flex w-[60%] flex-col gap-1 pr-8">
            <span
              className="font-bold"
              style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}
            >
              Full Pallet
            </span>
            <span style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
              Shelves on all 4 sides — ideal for center-aisle or island placement
            </span>
            <span style={{ fontSize: '11px', color: '#94A3B8', lineHeight: '1.4' }}>
              4 configurable walls · Best for Walmart, Costco floor displays
            </span>
          </div>
          <div className="absolute right-4 top-4">
            <RadioCircle selected={isFullSelected} />
          </div>
        </button>

        {/* Half Pallet Card */}
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_PALLET_TYPE', palletType: 'half' })}
          className="relative flex w-full cursor-pointer items-center rounded-lg border-2 p-4 text-left transition-colors"
          style={{
            minHeight: '120px',
            borderColor: isHalfSelected ? '#2563EB' : '#E2E8F0',
            backgroundColor: isHalfSelected ? '#EFF6FF' : '#FFFFFF',
          }}
        >
          <div className="flex w-[40%] items-center justify-center">
            <HalfPalletIllustration />
          </div>
          <div className="flex w-[60%] flex-col gap-1 pr-8">
            <span
              className="font-bold"
              style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}
            >
              Half Pallet
            </span>
            <span style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
              Front shelves with branded side panels — designed for against-wall placement
            </span>
            <span style={{ fontSize: '11px', color: '#94A3B8', lineHeight: '1.4' }}>
              1 shelf wall + 2 branded panels + open back · Best for endcaps, wall units
            </span>
          </div>
          <div className="absolute right-4 top-4">
            <RadioCircle selected={isHalfSelected} />
          </div>
        </button>
      </div>

      {/* Info box */}
      <div
        className="flex items-center gap-2 rounded-lg p-3"
        style={{ backgroundColor: '#EFF6FF' }}
      >
        <Info size={14} style={{ color: '#2563EB', flexShrink: 0 }} />
        <span style={{ fontSize: '11px', color: '#64748B' }}>
          You can customize individual walls in Step 3
        </span>
      </div>
    </div>
  )
}
