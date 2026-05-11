import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { PalletDisplayProps } from '../../types';
import { PalletDisplayScene } from './PalletDisplayScene';

const FOV_DEG = 45;

// Frame the pallet so it fits the viewport regardless of aspect ratio.
// On narrow / portrait viewports the horizontal FOV is the binding axis,
// so we push the camera back further. Without this the camera position
// is fixed at [72, 48, 72] which looks great on a wide laptop but is
// too zoomed in on narrower windows or when the layout takes up less
// horizontal room.
function computeInitialCameraPosition(): [number, number, number] {
  if (typeof window === 'undefined') return [72, 48, 72];

  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  const halfV = Math.tan((FOV_DEG * Math.PI) / 180 / 2);
  const halfH = halfV * aspect;

  // Conservative bounding half-extents for a full 4-tier pallet display.
  const halfWidth = 28;
  const halfHeight = 36;
  const halfDepth = 24;

  const distForVertical = halfHeight / halfV;
  const distForHorizontal = Math.max(halfWidth, halfDepth) / halfH;
  const distance = Math.max(distForVertical, distForHorizontal) * 1.3;

  const xz = distance * 0.6;
  const y = distance * 0.42;
  return [xz, y, xz];
}

export const PalletDisplay: React.FC<PalletDisplayProps> = (props) => {
  const initialCameraPosition = useMemo(
    () => props.initialCameraPosition ?? computeInitialCameraPosition(),
    [props.initialCameraPosition],
  );

  return (
    <div style={{ width: '100%', height: '100%', background: '#f0f0f0' }}>
      <Canvas
        shadows
        camera={{ position: initialCameraPosition, fov: FOV_DEG }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, toneMappingExposure: 1.2, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <PalletDisplayScene {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default PalletDisplay;
