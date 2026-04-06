import { useState, useCallback } from 'react';

export function useSlotInteraction(
  onSlotClick?: (tierId: number, slotIndex: number, position: [number, number, number]) => void,
  onSlotHover?: (tierId: number, slotIndex: number, position: [number, number, number]) => void,
  onSlotHoverEnd?: () => void
) {
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const handlePointerOver = useCallback((tierId: number, slotIndex: number, position: [number, number, number], e: any) => {
    e.stopPropagation();
    const id = `${tierId}-${slotIndex}`;
    setHoveredSlot(id);
    if (onSlotHover) onSlotHover(tierId, slotIndex, position);
  }, [onSlotHover]);

  const handlePointerOut = useCallback((e: any) => {
    e.stopPropagation();
    setHoveredSlot(null);
    if (onSlotHoverEnd) onSlotHoverEnd();
  }, [onSlotHoverEnd]);

  const handleClick = useCallback((tierId: number, slotIndex: number, position: [number, number, number], e: any) => {
    e.stopPropagation();
    const id = `${tierId}-${slotIndex}`;
    setSelectedSlot(id);
    if (onSlotClick) onSlotClick(tierId, slotIndex, position);
  }, [onSlotClick]);

  return {
    hoveredSlot,
    selectedSlot,
    handlePointerOver,
    handlePointerOut,
    handleClick,
  };
}
