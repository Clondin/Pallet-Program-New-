import React, { useCallback } from 'react'

import type { WizardState, WizardAction } from '../wizardTypes'
import { ColorPicker } from '../shared/ColorPicker'

interface BrandingStepProps {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
}

const BRAND_OPTIONS = [
  'Tuscanini',
  'Kedem',
  "Lieber's",
  'Haddar',
  'Gefen',
  'Paskesz',
  'Manischewitz',
  'Osem',
]

export function BrandingStep({ state, dispatch }: BrandingStepProps) {
  const handleLipTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: 'SET_LIP_TEXT', text: e.target.value })
    },
    [dispatch]
  )

  const handleHeaderTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: 'SET_HEADER_TEXT', text: e.target.value })
    },
    [dispatch]
  )

  const handlePanelTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: 'SET_PANEL_TEXT', text: e.target.value })
    },
    [dispatch]
  )

  const hasBrandedPanels = Object.values(state.walls).some(
    (w) => w.type === 'branded-panel'
  )

  return (
    <div className="flex flex-col gap-6 overflow-y-auto" style={{ maxHeight: '450px' }}>
      {/* Section A: Shelf Lip Branding */}
      <div className="flex flex-col gap-3">
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
          Shelf Lip Branding
        </h3>

        <ColorPicker
          label="Lip Color"
          value={state.lipColor}
          onChange={(color) => dispatch({ type: 'SET_LIP_COLOR', color })}
        />

        {/* Lip text */}
        <div className="flex flex-col gap-1">
          <label
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: '#94A3B8' }}
          >
            Lip Text
          </label>
          <input
            type="text"
            value={state.lipText}
            onChange={handleLipTextChange}
            maxLength={50}
            placeholder="ALL YOUR HOLIDAY NEEDS"
            className="h-10 w-full rounded-lg border px-3 text-sm outline-none transition-colors focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            style={{
              backgroundColor: '#F8FAFC',
              borderColor: '#E2E8F0',
              color: '#0F172A',
              fontSize: '14px',
            }}
          />
          <span style={{ fontSize: '9px', color: '#CBD5E1' }}>
            {state.lipText.length} / 50 chars
          </span>
        </div>

        {/* Lip text color toggle */}
        <div className="flex flex-col gap-1">
          <label
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: '#94A3B8' }}
          >
            Lip Text Color
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_LIP_TEXT_COLOR', color: '#FFFFFF' })}
              className="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor:
                  state.lipTextColor === '#FFFFFF' ? '#2563EB' : '#F1F5F9',
                color: state.lipTextColor === '#FFFFFF' ? '#FFFFFF' : '#64748B',
              }}
            >
              White
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_LIP_TEXT_COLOR', color: '#1E293B' })}
              className="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor:
                  state.lipTextColor === '#1E293B' ? '#2563EB' : '#F1F5F9',
                color: state.lipTextColor === '#1E293B' ? '#FFFFFF' : '#64748B',
              }}
            >
              Dark
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full" style={{ backgroundColor: '#E2E8F0' }} />

      {/* Section B: Header Topper */}
      <div className="flex flex-col gap-3">
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
          Header Topper
        </h3>

        {/* Toggle switch */}
        <div className="flex items-center justify-between">
          <span style={{ fontSize: '12px', fontWeight: 500, color: '#0F172A' }}>
            Show Header Topper
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={state.headerEnabled}
            onClick={() =>
              dispatch({ type: 'SET_HEADER_ENABLED', enabled: !state.headerEnabled })
            }
            className="relative shrink-0 rounded-full transition-colors duration-200"
            style={{
              width: '44px',
              height: '24px',
              backgroundColor: state.headerEnabled ? '#2563EB' : '#CBD5E1',
            }}
          >
            <span
              className="absolute top-0.5 block rounded-full bg-white shadow transition-transform duration-200"
              style={{
                width: '20px',
                height: '20px',
                transform: state.headerEnabled
                  ? 'translateX(22px)'
                  : 'translateX(2px)',
              }}
            />
          </button>
        </div>

        {state.headerEnabled && (
          <>
            {/* Header text */}
            <div className="flex flex-col gap-1">
              <label
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: '#94A3B8' }}
              >
                Header Text
              </label>
              <input
                type="text"
                value={state.headerText}
                onChange={handleHeaderTextChange}
                placeholder="Header text..."
                className="h-10 w-full rounded-lg border px-3 text-sm outline-none transition-colors focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                style={{
                  backgroundColor: '#F8FAFC',
                  borderColor: '#E2E8F0',
                  color: '#0F172A',
                  fontSize: '14px',
                }}
              />
            </div>

            <ColorPicker
              label="Header Color"
              value={state.headerColor}
              onChange={(color) => dispatch({ type: 'SET_HEADER_COLOR', color })}
            />
          </>
        )}
      </div>

      {/* Section C: Branded Panels (conditional) */}
      {hasBrandedPanels && (
        <>
          {/* Divider */}
          <div className="h-px w-full" style={{ backgroundColor: '#E2E8F0' }} />

          <div className="flex flex-col gap-3">
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
              Branded Panels
            </h3>

            <ColorPicker
              label="Panel Color"
              value={state.panelColor}
              onChange={(color) => dispatch({ type: 'SET_PANEL_COLOR', color })}
            />

            {/* Panel text */}
            <div className="flex flex-col gap-1">
              <label
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: '#94A3B8' }}
              >
                Panel Text
              </label>
              <input
                type="text"
                value={state.panelText}
                onChange={handlePanelTextChange}
                placeholder="Panel text..."
                className="h-10 w-full rounded-lg border px-3 text-sm outline-none transition-colors focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                style={{
                  backgroundColor: '#F8FAFC',
                  borderColor: '#E2E8F0',
                  color: '#0F172A',
                  fontSize: '14px',
                }}
              />
            </div>

            {/* Featured brands */}
            <div className="flex flex-col gap-2">
              <label
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: '#94A3B8' }}
              >
                Featured Brands
              </label>
              <div className="flex flex-wrap gap-2">
                {BRAND_OPTIONS.map((brand) => {
                  const isActive = state.featuredBrands.includes(brand)
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => dispatch({ type: 'TOGGLE_BRAND', brand })}
                      className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: isActive ? '#2563EB' : '#F1F5F9',
                        color: isActive ? '#FFFFFF' : '#64748B',
                        borderColor: isActive ? '#2563EB' : '#E2E8F0',
                        fontSize: '12px',
                      }}
                    >
                      {brand}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
