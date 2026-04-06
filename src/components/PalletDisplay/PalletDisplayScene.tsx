import React, { useMemo } from 'react';
import { OrbitControls } from '@react-three/drei';
import { PalletDisplayProps } from '../../types';
import { useTierConfig } from '../../hooks/useTierConfig';
import { useSlotInteraction } from '../../hooks/useSlotInteraction';
import { useCameraPresets } from '../../hooks/useCameraPresets';
import { Pallet } from './Pallet';
import { DisplayStructure } from './DisplayStructure';
import { RetailEnvironment } from './RetailEnvironment';
import { GhostProduct } from './GhostProduct';
import { PlacedProducts } from './PlacedProducts';

export const PalletDisplayScene: React.FC<PalletDisplayProps> = ({
  tierCount = 4,
  palletDimensions = { width: 48, depth: 40, height: 6 },
  maxDisplayHeight = 60,
  lipColor = '#3B7DD8',
  branding,
  placedProducts = [],
  ghostProduct = null,
  selectedProductId = null,
  onSlotClick,
  onSlotHover,
  onSlotHoverEnd,
  onProductClick,
  autoRotate = false,
  cameraPreset,
  showSlotGrid = true,
  showHeader = true,
  environment = 'retail',
}) => {
  const tiers = useTierConfig(tierCount, maxDisplayHeight);
  
  const {
    hoveredSlot,
    selectedSlot,
    handlePointerOver,
    handlePointerOut,
    handleClick,
  } = useSlotInteraction(onSlotClick, onSlotHover, onSlotHoverEnd);

  const { isAnimating } = useCameraPresets(cameraPreset);

  // Calculate ghost product position if needed
  const ghostPosition = useMemo(() => {
    if (!ghostProduct) return null;
    
    const platformThickness = 1;
    const palletHeight = 6;
    
    for (const tier of tiers) {
      const gridSize = tier.slotGridSize;
      const frontTrayWidth = tier.width;
      const frontTrayDepth = tier.shelfDepth;
      const frontCols = Math.floor(frontTrayWidth / gridSize);
      const frontRows = Math.floor(frontTrayDepth / gridSize);
      const frontStartX = - (frontCols * gridSize) / 2 + gridSize / 2;
      const frontCenterZ = tier.depth / 2 - frontTrayDepth / 2;
      const frontStartZ = frontCenterZ - (frontRows * gridSize) / 2 + gridSize / 2;

      let slotIndex = 0;

      // Front tray
      for (let r = 0; r < frontRows; r++) {
        for (let c = 0; c < frontCols; c++) {
          if (`${tier.id}-${slotIndex}` === ghostProduct.slotId) {
            return [
              frontStartX + c * gridSize,
              palletHeight + tier.yOffset + platformThickness,
              frontStartZ + r * gridSize
            ] as [number, number, number];
          }
          slotIndex++;
        }
      }

      // Back tray
      const backCenterZ = -tier.depth / 2 + frontTrayDepth / 2;
      const backStartZ = backCenterZ - (frontRows * gridSize) / 2 + gridSize / 2;
      for (let r = 0; r < frontRows; r++) {
        for (let c = 0; c < frontCols; c++) {
          if (`${tier.id}-${slotIndex}` === ghostProduct.slotId) {
            return [
              frontStartX + c * gridSize,
              palletHeight + tier.yOffset + platformThickness,
              backStartZ + r * gridSize
            ] as [number, number, number];
          }
          slotIndex++;
        }
      }

      // Left tray
      const sideTrayWidth = tier.shelfDepth;
      const sideTrayDepth = tier.depth - frontTrayDepth * 2;
      const sideCols = Math.floor(sideTrayWidth / gridSize);
      const sideRows = Math.floor(sideTrayDepth / gridSize);
      const leftCenterX = -tier.width / 2 + sideTrayWidth / 2;
      const leftStartX = leftCenterX - (sideCols * gridSize) / 2 + gridSize / 2;
      const sideStartZ = - (sideRows * gridSize) / 2 + gridSize / 2;

      for (let r = 0; r < sideRows; r++) {
        for (let c = 0; c < sideCols; c++) {
          if (`${tier.id}-${slotIndex}` === ghostProduct.slotId) {
            return [
              leftStartX + c * gridSize,
              palletHeight + tier.yOffset + platformThickness,
              sideStartZ + r * gridSize
            ] as [number, number, number];
          }
          slotIndex++;
        }
      }

      // Right tray
      const rightCenterX = tier.width / 2 - sideTrayWidth / 2;
      const rightStartX = rightCenterX - (sideCols * gridSize) / 2 + gridSize / 2;
      for (let r = 0; r < sideRows; r++) {
        for (let c = 0; c < sideCols; c++) {
          if (`${tier.id}-${slotIndex}` === ghostProduct.slotId) {
            return [
              rightStartX + c * gridSize,
              palletHeight + tier.yOffset + platformThickness,
              sideStartZ + r * gridSize
            ] as [number, number, number];
          }
          slotIndex++;
        }
      }
    }
    return null;
  }, [ghostProduct, tiers]);

  return (
    <>
      <RetailEnvironment environmentType={environment} />
      
      <group position={[0, 0, 0]}>
        <Pallet
          width={palletDimensions.width}
          depth={palletDimensions.depth}
          height={palletDimensions.height}
        />
        
        <DisplayStructure
          tiers={tiers}
          lipColor={lipColor}
          branding={branding}
          showSlotGrid={showSlotGrid}
          showHeader={showHeader}
          hoveredSlot={hoveredSlot}
          selectedSlot={selectedSlot}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        />

        <PlacedProducts 
          products={placedProducts} 
          tiers={tiers} 
          selectedProductId={selectedProductId}
          onProductClick={onProductClick}
        />

        {ghostProduct && ghostPosition && (
          <GhostProduct product={ghostProduct} position={ghostPosition} />
        )}
      </group>

      <OrbitControls
        makeDefault
        enabled={!isAnimating}
        minDistance={36}
        maxDistance={180}
        minPolarAngle={10 * (Math.PI / 180)}
        maxPolarAngle={85 * (Math.PI / 180)}
        enableDamping
        dampingFactor={0.05}
        autoRotate={autoRotate}
        target={[0, 24, 0]}
      />
    </>
  );
};
