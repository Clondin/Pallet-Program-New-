import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { getHeaderMaterial } from './materials/cardboardMaterial';

interface HeaderTopperProps {
  yPosition: number;
  text?: string;
  textColor?: string;
  backgroundColor?: string;
}

export const HeaderTopper: React.FC<HeaderTopperProps> = ({ 
  yPosition, 
  text, 
  textColor = '#FFFFFF', 
  backgroundColor 
}) => {
  const defaultHeaderMaterial = useMemo(() => getHeaderMaterial(), []);
  
  const headerMaterial = useMemo(() => {
    if (backgroundColor) {
      return new THREE.MeshStandardMaterial({ color: backgroundColor, roughness: 0.8 });
    }
    return defaultHeaderMaterial;
  }, [backgroundColor, defaultHeaderMaterial]);

  const width = 36;
  const height = 12;
  const thickness = 1.5;

  // Create a trapezoidal shape
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-width / 2, 0);
    s.lineTo(width / 2, 0);
    s.lineTo(width / 2 - 2, height);
    s.lineTo(-width / 2 + 2, height);
    s.lineTo(-width / 2, 0);
    return s;
  }, [width, height]);

  const extrudeSettings = {
    steps: 1,
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 2,
  };

  return (
    <group position={[0, yPosition, 0]}>
      {/* The topper itself, tilted back 15 degrees */}
      <group rotation={[-15 * (Math.PI / 180), 0, 0]}>
        <mesh
          position={[0, 0, -thickness / 2]}
          material={headerMaterial}
          castShadow
          receiveShadow
        >
          <extrudeGeometry args={[shape, extrudeSettings]} />
        </mesh>
        
        {text && (
          <Text
            position={[0, height / 2, thickness / 2 + 0.05]}
            fontSize={4}
            color={textColor}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            maxWidth={width - 4}
            textAlign="center"
          >
            {text}
          </Text>
        )}
      </group>
    </group>
  );
};
