import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createWoodMaterial } from './materials/woodMaterial';

interface PalletProps {
  width?: number;
  depth?: number;
  height?: number;
}

export const Pallet: React.FC<PalletProps> = ({ width = 48, depth = 40, height = 6 }) => {
  const deckBoardThickness = 0.625;
  const deckBoardWidth = 3.5;
  const stringerWidth = 1.5;
  const stringerHeight = 3.5;

  // 7 top deck boards
  const topDeckPositions = useMemo(() => {
    const positions = [];
    const spacing = (width - deckBoardWidth) / 6;
    for (let i = 0; i < 7; i++) {
      positions.push(-width / 2 + deckBoardWidth / 2 + i * spacing);
    }
    return positions;
  }, [width]);

  // 3 stringers (running along X, spaced along Z)
  const stringerPositions = useMemo(() => {
    return [
      -depth / 2 + stringerWidth / 2,
      0,
      depth / 2 - stringerWidth / 2,
    ];
  }, [depth]);

  // 3 bottom boards (running along X, spaced along Z)
  const bottomBoardPositions = useMemo(() => {
    return [
      -depth / 2 + deckBoardWidth / 2,
      0,
      depth / 2 - deckBoardWidth / 2,
    ];
  }, [depth]);

  const bottomMaterials = useMemo(() => bottomBoardPositions.map(() => createWoodMaterial()), [bottomBoardPositions]);
  const stringerMaterials = useMemo(() => stringerPositions.map(() => createWoodMaterial()), [stringerPositions]);
  const topMaterials = useMemo(() => topDeckPositions.map(() => createWoodMaterial()), [topDeckPositions]);

  // Materials for visual polish
  const gapMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#5C3A0A', transparent: true, opacity: 0.4, depthWrite: false }), []);
  const aoMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.15, depthWrite: false }), []);

  return (
    <group position={[0, 0, 0]}>
      {/* Ambient Occlusion at base */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width + 2, depth + 2]} />
        <primitive object={aoMat} attach="material" />
      </mesh>

      {/* Bottom Boards */}
      {bottomBoardPositions.map((z, i) => (
        <mesh
          key={`bottom-${i}`}
          position={[0, deckBoardThickness / 2, z]}
          material={bottomMaterials[i]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[width, deckBoardThickness, deckBoardWidth]} />
        </mesh>
      ))}

      {/* Stringers */}
      {stringerPositions.map((z, i) => (
        <mesh
          key={`stringer-${i}`}
          position={[0, deckBoardThickness + stringerHeight / 2, z]}
          material={stringerMaterials[i]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[width, stringerHeight, stringerWidth]} />
        </mesh>
      ))}

      {/* Top Deck Boards */}
      {topDeckPositions.map((x, i) => (
        <React.Fragment key={`top-${i}`}>
          <mesh
            position={[x, deckBoardThickness + stringerHeight + deckBoardThickness / 2, 0]}
            material={topMaterials[i]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[deckBoardWidth, deckBoardThickness, depth]} />
          </mesh>
          
          {/* Gap line (except after the last board) */}
          {i < topDeckPositions.length - 1 && (
            <mesh
              position={[x + deckBoardWidth / 2 + (topDeckPositions[i+1] - x - deckBoardWidth) / 2, deckBoardThickness + stringerHeight + deckBoardThickness + 0.01, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[(topDeckPositions[i+1] - x - deckBoardWidth), depth]} />
              <primitive object={gapMat} attach="material" />
            </mesh>
          )}
        </React.Fragment>
      ))}
    </group>
  );
};
