import { useRef } from 'react'

interface ColorPickerFieldProps {
  label: string
  value: string
  onChange: (color: string) => void
}

export function ColorPickerField({ label, value, onChange }: ColorPickerFieldProps) {
  const colorInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-medium text-[#555]">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="w-9 h-9 rounded-md shadow-border cursor-pointer shrink-0 hover:shadow-card-hover transition-shadow"
          style={{ backgroundColor: value }}
          onClick={() => colorInputRef.current?.click()}
        />
        <input
          ref={colorInputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
        <input
          type="text"
          value={value.toUpperCase()}
          onChange={(e) => {
            const v = e.target.value
            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v)
          }}
          onBlur={(e) => {
            const v = e.target.value
            if (!/^#[0-9A-Fa-f]{6}$/.test(v)) onChange(value)
          }}
          className="flex-1 px-3 py-2 text-[13px] font-mono shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none tabular-nums"
          placeholder="#000000"
        />
      </div>
    </div>
  )
}
