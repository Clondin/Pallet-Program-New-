import React, { useCallback } from 'react'

interface DimensionInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  unit?: string
  min?: number
  max?: number
  hint?: string
}

export function DimensionInput({
  label,
  value,
  onChange,
  unit = 'in',
  min,
  max,
  hint,
}: DimensionInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      if (raw === '') return

      let num = parseFloat(raw)
      if (isNaN(num)) return

      if (min !== undefined && num < min) num = min
      if (max !== undefined && num > max) num = max

      onChange(num)
    },
    [onChange, min, max]
  )

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const raw = e.target.value
      let num = parseFloat(raw)
      if (isNaN(num)) {
        num = min ?? 0
      }
      if (min !== undefined && num < min) num = min
      if (max !== undefined && num > max) num = max
      onChange(num)
    },
    [onChange, min, max]
  )

  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: '#94A3B8' }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          min={min}
          max={max}
          className="h-12 w-full rounded-lg border text-center text-base font-semibold outline-none transition-colors focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
          style={{
            backgroundColor: '#F8FAFC',
            borderColor: '#E2E8F0',
            color: '#0F172A',
            fontSize: '16px',
            fontWeight: 600,
          }}
        />
        {unit && (
          <span
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: '#94A3B8', fontSize: '12px' }}
          >
            {unit}
          </span>
        )}
      </div>
      {hint && (
        <span style={{ color: '#CBD5E1', fontSize: '9px' }}>{hint}</span>
      )}
    </div>
  )
}
