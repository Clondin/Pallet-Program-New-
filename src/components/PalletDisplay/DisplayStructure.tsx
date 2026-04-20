import React from 'react';
import { TierConfig, DisplayBranding, PalletType } from '../../types';
import { Tier } from './Tier';
import { HeaderTopper } from './HeaderTopper';

interface DisplayStructureProps {
  tiers: TierConfig[];
  palletType?: PalletType;
  lipColor?: string;
  branding?: DisplayBranding;
  showSlotGrid?: boolean;
  showHeader?: boolean;
  slotsOnly?: boolean;
  hoveredSlot: string | null;
  selectedSlot: string | null;
  onPointerOver: (tierId: number, slotIndex: number, position: [number, number, number], e: any) => void;
  onPointerOut: (e: any) => void;
  onClick: (tierId: number, slotIndex: number, position: [number, number, number], e: any) => void;
}

export const DisplayStructure: React.FC<DisplayStructureProps> = ({
  tiers,
  palletType = 'full',
  lipColor,
  branding,
  showSlotGrid,
  showHeader,
  slotsOnly = false,
  hoveredSlot,
  selectedSlot,
  onPointerOver,
  onPointerOut,
  onClick,
}) => {
  // Pallet height is 6, so we start the structure at y=6
  const palletHeight = 6;
  const platformThickness = 1;

  const totalHeight = tiers.reduce((acc, tier) => acc + tier.trayHeight + platformThickness, 0);

  return (
    <group position={[0, palletHeight, 0]}>
      {tiers.map((tier) => (
        <Tier
          key={tier.id}
          config={tier}
          palletType={palletType}
          lipColor={lipColor}
          branding={branding}
          showSlotGrid={showSlotGrid}
          slotsOnly={slotsOnly}
          hoveredSlot={hoveredSlot}
          selectedSlot={selectedSlot}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
          onClick={onClick}
        />
      ))}

      {showHeader && !slotsOnly && (
        <HeaderTopper
          yPosition={totalHeight}
          text={branding?.headerText}
          textColor={branding?.headerTextColor}
          backgroundColor={branding?.headerBackgroundColor}
        />
      )}
    </group>
  );
};
