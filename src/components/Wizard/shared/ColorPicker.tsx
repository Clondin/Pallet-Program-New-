import React, { useCallback } from 'react'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
  quickPicks?: string[]
}

const DEFAULT_QUICK_PICKS = [
  '#2563EB',
  '#00A3C7',
  '#DC2626',
  '#059669',
  '#7C3AED',
  '#0F172A',
]

export function ColorPicker({
  label,
  value,
  onChange,
  quickPicks = DEFAULT_QUICK_PICKS,
}: ColorPickerProps) {
  const handleHexChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      if (raw.match(/^#?[0-9A-Fa-f]{0,6}$/)) {
        onChange(raw.startsWith('#') ? raw : `#${raw}`)
      }
    },
    [onChange]
  )

  const handleSwatchClick = useCallback(
    (color: string) => {
      onChange(color)
    },
    [onChange]
  )

  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: '#94A3B8' }}
      >
        {label}
      </label>

      <div className="flex items-center gap-2">
        <div
          className="h-6 w-6 shrink-0 rounded border"
          style={{
            backgroundColor: value,
            borderColor: '#E2E8F0',
          }}
        />
        <input
          type="text"
          value={value}
          onChange={handleHexChange}
          maxLength={7}
          className="h-9 flex-1 rounded-lg border px-3 text-sm font-medium outline-none transition-colors focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
          style={{
            backgroundColor: '#F8FAFC',
            borderColor: '#E2E8F0',
            color: '#0F172A',
          }}
        />
      </div>

      <div className="flex items-center gap-1.5">
        {quickPicks.map((color) => {
          const isActive =
            value.toLowerCase() === color.toLowerCase()
          return (
            <button
              key={color}
              type="button"
              onClick={() => handleSwatchClick(color)}
              className={`h-6 w-6 rounded border transition-all hover:scale-110 ${
                isActive
                  ? 'ring-2 ring-[#2563EB] ring-offset-1'
                  : 'border-transparent hover:border-[#E2E8F0]'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          )
        })}
      </div>
    </div>
  )
}
