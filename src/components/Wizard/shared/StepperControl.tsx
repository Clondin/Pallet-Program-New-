import React, { useCallback } from 'react'
import { Minus, Plus } from 'lucide-react'

interface StepperControlProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export function StepperControl({
  label,
  value,
  onChange,
  min,
  max,
}: StepperControlProps) {
  const atMin = min !== undefined && value <= min
  const atMax = max !== undefined && value >= max

  const decrement = useCallback(() => {
    if (atMin) return
    onChange(value - 1)
  }, [value, onChange, atMin])

  const increment = useCallback(() => {
    if (atMax) return
    onChange(value + 1)
  }, [value, onChange, atMax])

  return (
    <div className="flex items-center justify-between">
      <span
        className="text-xs font-medium"
        style={{ color: '#0F172A', fontSize: '12px', fontWeight: 500 }}
      >
        {label}
      </span>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={decrement}
          disabled={atMin}
          className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
          style={{ backgroundColor: '#F1F5F9' }}
          onMouseEnter={(e) => {
            if (!atMin)
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                '#E2E8F0'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              '#F1F5F9'
          }}
          aria-label={`Decrease ${label}`}
        >
          <Minus
            size={14}
            className={atMin ? 'opacity-40' : ''}
            style={{ color: '#0F172A' }}
          />
        </button>

        <span
          className="w-8 text-center text-xl font-bold tabular-nums"
          style={{ color: '#0F172A', fontSize: '20px', fontWeight: 700 }}
        >
          {value}
        </span>

        <button
          type="button"
          onClick={increment}
          disabled={atMax}
          className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
          style={{ backgroundColor: '#F1F5F9' }}
          onMouseEnter={(e) => {
            if (!atMax)
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                '#E2E8F0'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              '#F1F5F9'
          }}
          aria-label={`Increase ${label}`}
        >
          <Plus
            size={14}
            className={atMax ? 'opacity-40' : ''}
            style={{ color: '#0F172A' }}
          />
        </button>
      </div>
    </div>
  )
}
