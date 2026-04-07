import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { GhostProduct as GhostProductType } from '../../types';

interface GhostProductProps {
  product: GhostProductType;
  position: [number, number, number];
}

export const GhostProduct: React.FC<GhostProductProps> = ({ product, position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const dashedEdgesRef = useRef<THREE.LineSegments>(null);

  // Bobbing animation
  useFrame((state) => {
    if (groupRef.current) {
      // 1" amplitude, 2 second period sine wave on Y position
      const time = state.clock.getElapsedTime();
      const yOffset = Math.sin(time * Math.PI) * 1;
      groupRef.current.position.y = position[1] + yOffset;
    }
  });

  const edgeGeometry = useMemo(
    () => new THREE.BoxGeometry(product.width, product.height, product.depth),
    [product.width, product.height, product.depth]
  )

  const dashedEdgesGeometry = useMemo(
    () => new THREE.EdgesGeometry(edgeGeometry),
    [edgeGeometry]
  )

  const color = product.isValid ? '#22C55E' : '#EF4444';

  useEffect(() => {
    dashedEdgesRef.current?.computeLineDistances()
  }, [dashedEdgesGeometry])
  
  // Oscillating scale for invalid state
  useFrame((state) => {
    if (groupRef.current && !product.isValid) {
      const time = state.clock.getElapsedTime();
      // Pulsing between 1.0 and 1.03 scale on a 500ms loop
      const scale = 1.0 + (Math.sin(time * Math.PI * 4) * 0.5 + 0.5) * 0.03;
      groupRef.current.scale.set(scale, scale, scale);
    } else if (groupRef.current) {
      groupRef.current.scale.set(1, 1, 1);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1], position[2]]}
      rotation={product.rotation ?? [0, 0, 0]}
    >
      {/* Semi-transparent box */}
      <mesh position={[0, product.height / 2, 0]}>
        <boxGeometry args={[product.width, product.height, product.depth]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.35} 
        />
      </mesh>

      {/* Subtle glow */}
      <mesh position={[0, product.height / 2, 0]}>
        <boxGeometry args={[product.width + 0.1, product.height + 0.1, product.depth + 0.1]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.2} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Dashed edges */}
      <lineSegments ref={dashedEdgesRef} position={[0, product.height / 2, 0]}>
        <primitive object={dashedEdgesGeometry} attach="geometry" />
        <lineDashedMaterial 
          color={color} 
          dashSize={1} 
          gapSize={0.5} 
          linewidth={2} 
        />
      </lineSegments>

      {/* Product label */}
      {product.label && (
        <Text
          position={[0, product.height / 2, product.depth / 2 + 0.1]}
          fontSize={1.5} // roughly 8px equivalent in world units depending on camera
          color="#FFFFFF"
          fillOpacity={0.6}
          anchorX="center"
          anchorY="middle"
        >
          {product.label}
        </Text>
      )}

      {!product.isValid && product.errorReason && (
        <Text
          position={[0, product.height + 2, 0]}
          fontSize={1}
          color="#FCA5A5"
          maxWidth={Math.max(product.width * 2, 18)}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
        >
          {product.errorReason}
        </Text>
      )}
    </group>
  );
};
