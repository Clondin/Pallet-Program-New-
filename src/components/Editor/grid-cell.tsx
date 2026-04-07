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
        className="bg-[#f5f5f5]/50 cursor-pointer transition-all group/cell hover:bg-[#f0f0f0]"
        style={{ border: '1px dashed rgba(0,0,0,0.12)' }}
      >
        <div className="flex items-center justify-center h-full opacity-0 group-hover/cell:opacity-100 transition-opacity">
          <Plus size={14} className="text-[#bbb]" />
        </div>
      </div>
    )
  }

  // Filled slot
  return (
    <div
      onClick={handleClick}
      className={`relative flex flex-col items-center justify-end p-2 cursor-pointer transition-all overflow-hidden group/cell ${
        isSelected
          ? 'bg-white shadow-elevated z-10'
          : 'bg-[#f8f8f8] hover:bg-[#f0f0f0]'
      }`}
      style={isSelected ? { boxShadow: '0 0 0 2px #0a72ef, 0px 4px 12px rgba(50,50,93,0.08)' } : undefined}
    >
      {/* Top color bar */}
      <div
        className="absolute top-0 left-0 w-full h-[3px]"
        style={{ backgroundColor: isSelected ? '#0a72ef' : placement.color }}
      />

      {/* Settings badge (selected) */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            selectSlot(slot.slotId)
            openPicker()
          }}
          className="absolute -top-0.5 right-1 bg-[#0a72ef] text-white p-0.5 rounded-full hover:bg-[#0860c4] transition-colors"
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
            backgroundColor: placement.color + '12',
            boxShadow: `inset 0 0 0 1px ${placement.color}30`,
          }}
        >
          <span
            className="text-[8px] font-semibold text-center leading-tight px-1 line-clamp-3"
            style={{ color: placement.color }}
          >
            {placement.label}
          </span>
        </div>
      )}

      {/* Label below */}
      <div
        className={`text-[9px] font-medium mt-2 text-center leading-none truncate w-full ${
          isSelected ? 'text-[#0a72ef]' : 'text-[#555]'
        }`}
      >
        {placement.label}
      </div>
    </div>
  )
}
