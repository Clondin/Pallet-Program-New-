import React, { useRef, useState, useEffect, useCallback } from 'react'

interface SegmentOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface SegmentedControlProps {
  options: SegmentOption[]
  value: string
  onChange: (value: string) => void
}

export function SegmentedControl({
  options,
  value,
  onChange,
}: SegmentedControlProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  const updateIndicator = useCallback(() => {
    if (!containerRef.current) return
    const activeIndex = options.findIndex((o) => o.value === value)
    if (activeIndex === -1) return

    const buttons = containerRef.current.querySelectorAll<HTMLButtonElement>(
      '[data-segment]'
    )
    const activeButton = buttons[activeIndex]
    if (!activeButton) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const buttonRect = activeButton.getBoundingClientRect()

    setIndicator({
      left: buttonRect.left - containerRect.left,
      width: buttonRect.width,
    })
  }, [options, value])

  useEffect(() => {
    updateIndicator()
  }, [updateIndicator])

  return (
    <div
      ref={containerRef}
      className="relative flex rounded-lg p-1"
      style={{ backgroundColor: '#F1F5F9' }}
    >
      <div
        className="absolute top-1 rounded-md shadow-sm transition-all duration-200 ease-out"
        style={{
          left: `${indicator.left}px`,
          width: `${indicator.width}px`,
          height: 'calc(100% - 8px)',
          backgroundColor: '#2563EB',
        }}
      />

      {options.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            data-segment
            onClick={() => onChange(option.value)}
            className="relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200"
            style={{
              color: isActive ? '#FFFFFF' : '#64748B',
            }}
          >
            {option.icon && (
              <span className="flex items-center">{option.icon}</span>
            )}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
