import { Plus, Settings } from 'lucide-react'
import { useDisplayStore } from '../../stores/display-store'
import { SlotGridItem } from '../../types'

interface GridCellProps {
  slot: SlotGridItem
}

export function GridCell({ slot }: GridCellProps) {
  const currentProject = useDisplayStore(s => s.currentProject)
  const selectedSlotId = useDisplayStore(s => s.selectedSlotId)
  const selectSlot = useDisplayStore(s => s.selectSlot)
  const openPicker = useDisplayStore(s => s.openPicker)

  const placement = currentProject?.placements.find(
    p => p.slotId === slot.slotId
  )
  const isSelected = selectedSlotId === slot.slotId

  const handleClick = () => {
    if (placement) {
      selectSlot(isSelected ? null : slot.slotId)
    } else {
      selectSlot(slot.slotId)
      openPicker()
    }
  }

  // Empty slot
  if (!placement) {
    return (
      <div
        onClick={handleClick}
        className="bg-[#F5F3F0]/40 border border-dashed border-slate-300 cursor-pointer transition-all group/cell hover:bg-[#F5F3F0]/70 hover:border-slate-400"
      >
        <div className="flex items-center justify-center h-full opacity-0 group-hover/cell:opacity-100 transition-opacity">
          <Plus size={16} className="text-slate-400" />
        </div>
      </div>
    )
  }

  // Filled slot — matches reference HTML pattern
  return (
    <div
      onClick={handleClick}
      className={`relative flex flex-col items-center justify-end p-2 cursor-pointer transition-all overflow-hidden group/cell ${
        isSelected
          ? 'bg-white border-2 border-blue-600 shadow-lg z-10'
          : 'bg-[#f4f3f1] hover:bg-[#eeedeb]'
      }`}
    >
      {/* Top color bar */}
      <div
        className="absolute top-0 left-0 w-full h-1.5"
        style={{ backgroundColor: isSelected ? '#2563eb' : placement.color }}
      />

      {/* Settings badge (selected) — opens picker to replace product */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            selectSlot(slot.slotId)
            openPicker()
          }}
          className="absolute -top-0.5 right-1 bg-blue-600 text-white p-0.5 rounded-full shadow hover:bg-blue-700 transition-colors"
        >
          <Settings size={10} />
        </button>
      )}

      {/* Product image or colored placeholder */}
      {placement.imageUrl ? (
        <img
          src={placement.imageUrl}
          alt={placement.label}
          className="w-16 h-20 object-contain drop-shadow-md"
        />
      ) : (
        <div
          className="w-14 h-16 rounded flex items-center justify-center"
          style={{
            backgroundColor: placement.color + '20',
            border: `1px solid ${placement.color}50`,
          }}
        >
          <span
            className="text-[8px] font-bold text-center leading-tight px-1 line-clamp-3"
            style={{ color: placement.color }}
          >
            {placement.label}
          </span>
        </div>
      )}

      {/* Label below */}
      <div
        className={`text-[9px] font-bold mt-2 text-center leading-none truncate w-full ${
          isSelected ? 'text-blue-600' : 'text-slate-700'
        }`}
      >
        {placement.label}
      </div>
    </div>
  )
}
