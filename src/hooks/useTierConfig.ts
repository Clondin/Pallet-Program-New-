import { useMemo } from 'react';
import { TierConfig } from '../types';

export function useTierConfig(tierCount: number = 4, maxDisplayHeight: number = 60): TierConfig[] {
  return useMemo(() => {
    const count = Math.max(2, Math.min(6, tierCount));
    
    // Constant dimensions for all tiers
    const width = 46;
    const depth = 38;
    const shelfDepth = 10;
    
    // Tray height ranges
    const baseTrayHeight = 14;
    const topTrayHeight = 7;

    // Slot grid sizes
    const baseSlotSize = 6;
    const topSlotSize = 4;

    const tiers: TierConfig[] = [];
    let currentY = 0; // Starts from top of pallet (which is at y=6)
    const platformThickness = 1;

    for (let i = 0; i < count; i++) {
      const progress = count > 1 ? i / (count - 1) : 0;
      
      const trayHeight = baseTrayHeight - progress * (baseTrayHeight - topTrayHeight);
      const slotGridSize = baseSlotSize - progress * (baseSlotSize - topSlotSize);
      
      tiers.push({
        id: i + 1,
        width,
        depth,
        height: trayHeight,
        shelfDepth,
        trayHeight,
        yOffset: currentY,
        slotGridSize,
      });
      
      currentY += trayHeight + platformThickness;
    }

    return tiers;
  }, [tierCount, maxDisplayHeight]);
}
