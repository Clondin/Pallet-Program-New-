interface ShelfLipBarProps {
  text: string
  color: string
}

export function ShelfLipBar({ text, color }: ShelfLipBarProps) {
  return (
    <div
      className="h-[22px] overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: color }}
    >
      <span className="text-[10px] font-semibold italic text-white/70 tracking-[0.3em] uppercase">
        {text}
      </span>
    </div>
  )
}
