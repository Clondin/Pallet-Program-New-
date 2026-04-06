import React, { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { TierConfig, DisplayBranding } from '../../types';
import { getCardboardMaterial } from './materials/cardboardMaterial';
import { getSlotMaterialGhost } from './materials/slotMaterial';
import { ShelfLip } from './ShelfLip';
import { SlotIndicator } from './SlotIndicator';

interface TierProps {
  config: TierConfig;
  lipColor?: string;
  branding?: DisplayBranding;
  showSlotGrid?: boolean;
  hoveredSlot: string | null;
  selectedSlot: string | null;
  onPointerOver: (tierId: number, slotIndex: number, position: [number, number, number], e: any) => void;
  onPointerOut: (e: any) => void;
  onClick: (tierId: number, slotIndex: number, position: [number, number, number], e: any) => void;
}

export const Tier: React.FC<TierProps> = ({
  config,
  lipColor,
  branding,
  showSlotGrid = true,
  hoveredSlot,
  selectedSlot,
  onPointerOver,
  onPointerOut,
  onClick,
}) => {
  const cardboardMaterial = useMemo(() => getCardboardMaterial(), []);
  const ghostMat = useMemo(() => getSlotMaterialGhost(), []);
  
  const platformThickness = 1;
  const innerWidth = Math.max(2, config.width - config.shelfDepth * 2);
  const innerDepth = Math.max(2, config.depth - config.shelfDepth * 2);
  const wallThickness = 0.75;

  // Generate slots for the 4 trays
  const slots = useMemo(() => {
    const generatedSlots = [];
    let slotIndex = 0;
    const gridSize = config.slotGridSize;

    // Front tray
    const frontTrayWidth = config.width;
    const frontTrayDepth = config.shelfDepth;
    const frontCols = Math.floor(frontTrayWidth / gridSize);
    const frontRows = Math.floor(frontTrayDepth / gridSize);
    const frontStartX = - (frontCols * gridSize) / 2 + gridSize / 2;
    const frontCenterZ = config.depth / 2 - frontTrayDepth / 2;
    const frontStartZ = frontCenterZ - (frontRows * gridSize) / 2 + gridSize / 2;

    for (let r = 0; r < frontRows; r++) {
      for (let c = 0; c < frontCols; c++) {
        generatedSlots.push({
          index: slotIndex++,
          position: [frontStartX + c * gridSize, platformThickness, frontStartZ + r * gridSize] as [number, number, number],
          width: gridSize * 0.9,
          depth: gridSize * 0.9,
        });
      }
    }

    // Back tray
    const backCenterZ = -config.depth / 2 + frontTrayDepth / 2;
    const backStartZ = backCenterZ - (frontRows * gridSize) / 2 + gridSize / 2;
    for (let r = 0; r < frontRows; r++) {
      for (let c = 0; c < frontCols; c++) {
        generatedSlots.push({
          index: slotIndex++,
          position: [frontStartX + c * gridSize, platformThickness, backStartZ + r * gridSize] as [number, number, number],
          width: gridSize * 0.9,
          depth: gridSize * 0.9,
        });
      }
    }

    // Left tray (between front and back trays)
    const sideTrayWidth = config.shelfDepth;
    const sideTrayDepth = config.depth - frontTrayDepth * 2;
    const sideCols = Math.floor(sideTrayWidth / gridSize);
    const sideRows = Math.floor(sideTrayDepth / gridSize);
    const leftCenterX = -config.width / 2 + sideTrayWidth / 2;
    const leftStartX = leftCenterX - (sideCols * gridSize) / 2 + gridSize / 2;
    const sideStartZ = - (sideRows * gridSize) / 2 + gridSize / 2;

    for (let r = 0; r < sideRows; r++) {
      for (let c = 0; c < sideCols; c++) {
        generatedSlots.push({
          index: slotIndex++,
          position: [leftStartX + c * gridSize, platformThickness, sideStartZ + r * gridSize] as [number, number, number],
          width: gridSize * 0.9,
          depth: gridSize * 0.9,
        });
      }
    }

    // Right tray
    const rightCenterX = config.width / 2 - sideTrayWidth / 2;
    const rightStartX = rightCenterX - (sideCols * gridSize) / 2 + gridSize / 2;
    for (let r = 0; r < sideRows; r++) {
      for (let c = 0; c < sideCols; c++) {
        generatedSlots.push({
          index: slotIndex++,
          position: [rightStartX + c * gridSize, platformThickness, sideStartZ + r * gridSize] as [number, number, number],
          width: gridSize * 0.9,
          depth: gridSize * 0.9,
        });
      }
    }

    return generatedSlots;
  }, [config]);

  const ghostLinesObject = useMemo(() => {
    const points: THREE.Vector3[] = [];
    slots.forEach(slot => {
      const hw = slot.width / 2;
      const hd = slot.depth / 2;
      const x = slot.position[0];
      const y = slot.position[1] + 0.01;
      const z = slot.position[2];
      
      const p1 = new THREE.Vector3(x - hw, y, z - hd);
      const p2 = new THREE.Vector3(x + hw, y, z - hd);
      const p3 = new THREE.Vector3(x + hw, y, z + hd);
      const p4 = new THREE.Vector3(x - hw, y, z + hd);
      
      points.push(p1, p2, p2, p3, p3, p4, p4, p1);
    });
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const lineSegments = new THREE.LineSegments(geo, ghostMat);
    lineSegments.computeLineDistances();
    return lineSegments;
  }, [slots, ghostMat]);

  // Materials for visual polish
  const edgeDarkeningMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#8B6914', transparent: true, opacity: 0.3, depthWrite: false }), []);
  const aoMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.15, depthWrite: false }), []);

  return (
    <group position={[0, config.yOffset, 0]}>
      {/* Base Platform */}
      <RoundedBox
        args={[config.width, platformThickness, config.depth]}
        radius={0.2}
        smoothness={4}
        position={[0, platformThickness / 2, 0]}
        material={cardboardMaterial}
        castShadow
        receiveShadow
      />

      {/* Edge darkening on platform */}
      <mesh position={[0, platformThickness + 0.01, config.depth / 2 - 0.125]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[config.width, 0.25]} />
        <primitive object={edgeDarkeningMat} attach="material" />
      </mesh>
      <mesh position={[0, platformThickness + 0.01, -config.depth / 2 + 0.125]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[config.width, 0.25]} />
        <primitive object={edgeDarkeningMat} attach="material" />
      </mesh>
      <mesh position={[-config.width / 2 + 0.125, platformThickness + 0.01, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[config.depth, 0.25]} />
        <primitive object={edgeDarkeningMat} attach="material" />
      </mesh>
      <mesh position={[config.width / 2 - 0.125, platformThickness + 0.01, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[config.depth, 0.25]} />
        <primitive object={edgeDarkeningMat} attach="material" />
      </mesh>

      {/* Hollow Center Column (4 thin walls) */}
      {/* Front inner wall */}
      <RoundedBox
        args={[innerWidth, config.trayHeight, wallThickness]}
        radius={0.1}
        smoothness={4}
        position={[0, config.trayHeight / 2 + platformThickness, innerDepth / 2 - wallThickness / 2]}
        material={cardboardMaterial}
        castShadow
        receiveShadow
      />
      {/* Back inner wall */}
      <RoundedBox
        args={[innerWidth, config.trayHeight, wallThickness]}
        radius={0.1}
        smoothness={4}
        position={[0, config.trayHeight / 2 + platformThickness, -innerDepth / 2 + wallThickness / 2]}
        material={cardboardMaterial}
        castShadow
        receiveShadow
      />
      {/* Left inner wall */}
      <RoundedBox
        args={[wallThickness, config.trayHeight, innerDepth - wallThickness * 2]}
        radius={0.1}
        smoothness={4}
        position={[-innerWidth / 2 + wallThickness / 2, config.trayHeight / 2 + platformThickness, 0]}
        material={cardboardMaterial}
        castShadow
        receiveShadow
      />
      {/* Right inner wall */}
      <RoundedBox
        args={[wallThickness, config.trayHeight, innerDepth - wallThickness * 2]}
        radius={0.1}
        smoothness={4}
        position={[innerWidth / 2 - wallThickness / 2, config.trayHeight / 2 + platformThickness, 0]}
        material={cardboardMaterial}
        castShadow
        receiveShadow
      />

      {/* Edge darkening on top of inner walls */}
      <mesh position={[0, config.trayHeight + platformThickness + 0.01, innerDepth / 2 - wallThickness / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[innerWidth, wallThickness]} />
        <primitive object={edgeDarkeningMat} attach="material" />
      </mesh>
      <mesh position={[0, config.trayHeight + platformThickness + 0.01, -innerDepth / 2 + wallThickness / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[innerWidth, wallThickness]} />
        <primitive object={edgeDarkeningMat} attach="material" />
      </mesh>
      <mesh position={[-innerWidth / 2 + wallThickness / 2, config.trayHeight + platformThickness + 0.01, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[innerDepth - wallThickness * 2, wallThickness]} />
        <primitive object={edgeDarkeningMat} attach="material" />
      </mesh>
      <mesh position={[innerWidth / 2 - wallThickness / 2, config.trayHeight + platformThickness + 0.01, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[innerDepth - wallThickness * 2, wallThickness]} />
        <primitive object={edgeDarkeningMat} attach="material" />
      </mesh>

      {/* Ambient Occlusion strips at base of inner walls */}
      <mesh position={[0, platformThickness + 0.01, innerDepth / 2 + 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[innerWidth, 1]} />
        <primitive object={aoMat} attach="material" />
      </mesh>
      <mesh position={[0, platformThickness + 0.01, -innerDepth / 2 - 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[innerWidth, 1]} />
        <primitive object={aoMat} attach="material" />
      </mesh>
      <mesh position={[-innerWidth / 2 - 0.5, platformThickness + 0.01, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[innerDepth, 1]} />
        <primitive object={aoMat} attach="material" />
      </mesh>
      <mesh position={[innerWidth / 2 + 0.5, platformThickness + 0.01, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[innerDepth, 1]} />
        <primitive object={aoMat} attach="material" />
      </mesh>

      {/* Shelf Lips - positioned at the outer edge, sitting on the platform */}
      {/* Height is 2, so center is at platformThickness + 1 */}
      {/* Thickness is 0.5, so offset by 0.25 from the edge */}
      <group position={[0, platformThickness + 1, config.depth / 2 - 0.25]}>
        <ShelfLip width={config.width} color={lipColor} text={branding?.lipText} textColor={branding?.lipTextColor} />
      </group>
      <group position={[0, platformThickness + 1, -config.depth / 2 + 0.25]} rotation={[0, Math.PI, 0]}>
        <ShelfLip width={config.width} color={lipColor} text={branding?.lipText} textColor={branding?.lipTextColor} />
      </group>
      <group position={[-config.width / 2 + 0.25, platformThickness + 1, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <ShelfLip width={config.depth - 1} color={lipColor} text={branding?.lipText} textColor={branding?.lipTextColor} />
      </group>
      <group position={[config.width / 2 - 0.25, platformThickness + 1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <ShelfLip width={config.depth - 1} color={lipColor} text={branding?.lipText} textColor={branding?.lipTextColor} />
      </group>

      {/* Slots */}
      {showSlotGrid && (
        <>
          <primitive object={ghostLinesObject} />
          {slots.map((slot) => {
            const id = `${config.id}-${slot.index}`;
            return (
              <SlotIndicator
                key={id}
                tierId={config.id}
                slotIndex={slot.index}
                position={slot.position}
                width={slot.width}
                depth={slot.depth}
                isHovered={hoveredSlot === id}
                isSelected={selectedSlot === id}
                onPointerOver={onPointerOver}
                onPointerOut={onPointerOut}
                onClick={onClick}
              />
            );
          })}
        </>
      )}
    </group>
  );
};
