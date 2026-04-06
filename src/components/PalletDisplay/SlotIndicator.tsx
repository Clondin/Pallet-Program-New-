import React, { useMemo } from 'react';
import * as THREE from 'three';
import { getSlotMaterialHover, getSlotMaterialSelected } from './materials/slotMaterial';

interface SlotIndicatorProps {
  tierId: number;
  slotIndex: number;
  position: [number, number, number];
  width: number;
  depth: number;
  isHovered: boolean;
  isSelected: boolean;
  onPointerOver: (tierId: number, slotIndex: number, position: [number, number, number], e: any) => void;
  onPointerOut: (e: any) => void;
  onClick: (tierId: number, slotIndex: number, position: [number, number, number], e: any) => void;
}

export const SlotIndicator: React.FC<SlotIndicatorProps> = ({
  tierId,
  slotIndex,
  position,
  width,
  depth,
  isHovered,
  isSelected,
  onPointerOver,
  onPointerOut,
  onClick,
}) => {
  const hoverMat = useMemo(() => getSlotMaterialHover(), []);
  const selectedMat = useMemo(() => getSlotMaterialSelected(), []);

  return (
    <group position={position}>
      {/* Invisible hit box for raycasting */}
      <mesh
        position={[0, 0.025, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={(e) => onPointerOver(tierId, slotIndex, position, e)}
        onPointerOut={onPointerOut}
        onClick={(e) => onClick(tierId, slotIndex, position, e)}
      >
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Fill for hover/selected */}
      {(isHovered || isSelected) && (
        <mesh position={[0, isSelected ? 0.05 : 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width, depth]} />
          <primitive object={isSelected ? selectedMat : hoverMat} attach="material" />
        </mesh>
      )}
    </group>
  );
};
