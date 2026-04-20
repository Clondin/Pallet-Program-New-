"use client";

import { useMemo } from "react";
import * as THREE from "three";

import type { PalletConfig } from "@/types/pallet";

function createWoodMaterial() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");

  let rBase = 160 + Math.random() * 40;
  let gBase = 117 + Math.random() * 35;
  let bBase = 32 + Math.random() * 16;

  // 20% chance of weathering (gray tint)
  if (Math.random() < 0.2) {
    rBase = rBase * 0.7 + 128 * 0.3;
    gBase = gBase * 0.7 + 128 * 0.3;
    bBase = bBase * 0.7 + 128 * 0.3;
  }

  if (context) {
    context.fillStyle = `rgb(${rBase}, ${gBase}, ${bBase})`;
    context.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 3000; i++) {
      context.fillStyle = `rgba(90, 40, 10, ${Math.random() * 0.25})`;
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const w = Math.random() * 150 + 50;
      const h = Math.random() * 6 + 2;
      context.fillRect(x, y, w, h);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(`rgb(${Math.floor(rBase)}, ${Math.floor(gBase)}, ${Math.floor(bBase)})`),
    roughness: 0.85,
    map: texture,
  });
}

export function PalletBase({ pallet }: { pallet: PalletConfig }) {
  const width = pallet.base.width;
  const depth = pallet.base.depth;
  const deckBoardThickness = 0.625;
  const deckBoardWidth = 3.5;
  const stringerWidth = 1.5;
  const stringerHeight = 3.5;

  const topDeckPositions = useMemo(() => {
    const positions = [];
    const spacing = (width - deckBoardWidth) / 6;
    for (let i = 0; i < 7; i++) {
      positions.push(-width / 2 + deckBoardWidth / 2 + i * spacing);
    }
    return positions;
  }, [width]);

  const stringerPositions = useMemo(
    () => [-depth / 2 + stringerWidth / 2, 0, depth / 2 - stringerWidth / 2],
    [depth],
  );

  const bottomBoardPositions = useMemo(
    () => [-depth / 2 + deckBoardWidth / 2, 0, depth / 2 - deckBoardWidth / 2],
    [depth],
  );

  const bottomMaterials = useMemo(() => bottomBoardPositions.map(() => createWoodMaterial()), [bottomBoardPositions]);
  const stringerMaterials = useMemo(() => stringerPositions.map(() => createWoodMaterial()), [stringerPositions]);
  const topMaterials = useMemo(() => topDeckPositions.map(() => createWoodMaterial()), [topDeckPositions]);

  const gapMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#5C3A0A", transparent: true, opacity: 0.4, depthWrite: false }),
    [],
  );
  const aoMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.15, depthWrite: false }),
    [],
  );

  return (
    <group position={[0, 0, 0]}>
      {/* Ambient occlusion at base */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width + 2, depth + 2]} />
        <primitive object={aoMat} attach="material" />
      </mesh>

      {/* Bottom boards */}
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

      {/* Top deck boards */}
      {topDeckPositions.map((x, i) => (
        <group key={`top-${i}`}>
          <mesh
            position={[x, deckBoardThickness + stringerHeight + deckBoardThickness / 2, 0]}
            material={topMaterials[i]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[deckBoardWidth, deckBoardThickness, depth]} />
          </mesh>

          {/* Gap line between boards */}
          {i < topDeckPositions.length - 1 && (
            <mesh
              position={[
                x + deckBoardWidth / 2 + (topDeckPositions[i + 1] - x - deckBoardWidth) / 2,
                deckBoardThickness + stringerHeight + deckBoardThickness + 0.01,
                0,
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[topDeckPositions[i + 1] - x - deckBoardWidth, depth]} />
              <primitive object={gapMat} attach="material" />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
