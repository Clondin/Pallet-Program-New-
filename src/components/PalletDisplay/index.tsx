import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PalletDisplayProps } from '../../types';
import { PalletDisplayScene } from './PalletDisplayScene';

export const PalletDisplay: React.FC<PalletDisplayProps> = (props) => {
  const initialCameraPosition = props.initialCameraPosition || [72, 48, 72];

  return (
    <div style={{ width: '100%', height: '100%', background: '#f0f0f0' }}>
      <Canvas
        shadows
        camera={{ position: initialCameraPosition, fov: 45 }}
        gl={{ antialias: true, toneMappingExposure: 1.2 }}
      >
        <Suspense fallback={null}>
          <PalletDisplayScene {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default PalletDisplay;
