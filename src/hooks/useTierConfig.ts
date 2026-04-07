import { useMemo } from 'react';
import { TierConfig, PalletType } from '../types';
import { buildTierConfigs } from '../lib/shelfCoordinates';

export function useTierConfig(
  tierCount: number = 4,
  maxDisplayHeight: number = 60,
  palletType: PalletType = 'full'
): TierConfig[] {
  return useMemo(
    () => buildTierConfigs(tierCount, maxDisplayHeight, palletType),
    [tierCount, maxDisplayHeight, palletType],
  );
}
