import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text, Edges, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { PlacedProduct } from '../../types';

interface ProductCaseProps {
  product: PlacedProduct;
  position: [number, number, number];
  isSelected: boolean;
  onClick: (productId: string) => void;
}

export const ProductCase: React.FC<ProductCaseProps> = ({ product, position, isSelected, onClick }) => {
  const [hovered, setHovered] = React.useState(false);
  const highlightRef = useRef<THREE.Group>(null);
  const pillRef = useRef<THREE.Group>(null);

  // Materials
  const boxMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: product.color,
      roughness: 0.7,
      metalness: 0.05,
    });
  }, [product.color]);

  const topMaterial = useMemo(() => {
    const baseColor = new THREE.Color(product.color);
    const lighterColor = baseColor.clone().lerp(new THREE.Color('#FFFFFF'), 0.2);
    return new THREE.MeshStandardMaterial({
      color: lighterColor,
      roughness: 0.7,
      metalness: 0.05,
    });
  }, [product.color]);

  // Animation for selection highlight
  useFrame((state, delta) => {
    const targetScale = isSelected ? 1 : 0;
    if (highlightRef.current) {
      highlightRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 10);
    }
    if (pillRef.current) {
      pillRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 10);
    }
  });

  return (
    <group 
      position={[position[0], position[1] + product.height / 2, position[2]]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
      onClick={(e) => { e.stopPropagation(); onClick(product.id); }}
    >
      {/* The Box */}
      <RoundedBox
        args={[product.width, product.height, product.depth]}
        radius={0.3}
        smoothness={4}
        castShadow
        receiveShadow
      >
        {/* Apply lighter material to the top face (index 2 in standard BoxGeometry) */}
        <primitive object={boxMaterial} attach="material-0" />
        <primitive object={boxMaterial} attach="material-1" />
        <primitive object={topMaterial} attach="material-2" />
        <primitive object={boxMaterial} attach="material-3" />
        <primitive object={boxMaterial} attach="material-4" />
        <primitive object={boxMaterial} attach="material-5" />
      </RoundedBox>

      {/* Hover Outline */}
      {hovered && !isSelected && (
        <Edges
          scale={1.01}
          color="white"
          transparent
          opacity={0.4}
        />
      )}

      {/* Selected Highlight */}
      <group ref={highlightRef} scale={0}>
        <Edges
          scale={1.02}
          color="#3B7DD8"
          linewidth={2}
        />
        <mesh>
          <boxGeometry args={[product.width + 0.2, product.height + 0.2, product.depth + 0.2]} />
          <meshBasicMaterial 
            color="#3B7DD8" 
            transparent 
            opacity={0.15} 
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Floating Action Pill */}
      <group ref={pillRef} scale={0} position={[0, product.height / 2 + 3, 0]}>
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          {/* Pill background */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.8, 3.2, 4, 16]} />
            <meshBasicMaterial color="#1F2937" />
          </mesh>
          
          {/* Icons (simplified as small colored circles for now) */}
          <mesh position={[-1.2, 0, 0.1]}>
            <circleGeometry args={[0.4, 16]} />
            <meshBasicMaterial color="#4B5563" />
          </mesh>
          <mesh position={[0, 0, 0.1]}>
            <circleGeometry args={[0.4, 16]} />
            <meshBasicMaterial color="#4B5563" />
          </mesh>
          <mesh position={[1.2, 0, 0.1]}>
            <circleGeometry args={[0.4, 16]} />
            <meshBasicMaterial color="#EF4444" />
          </mesh>
        </Billboard>
      </group>

      {/* Front Face Text */}
      <group position={[0, 0, product.depth / 2 + 0.01]}>
        <Text
          position={[0, product.height / 2 - 1.5, 0]}
          fontSize={1.2}
          color="#FFFFFF"
          anchorX="center"
          anchorY="top"
          maxWidth={product.width - 1}
          textAlign="center"
        >
          {product.label}
        </Text>
        <Text
          position={[0, product.height / 2 - 3.5, 0]}
          fontSize={0.8}
          color="#FFFFFF"
          fillOpacity={0.5}
          anchorX="center"
          anchorY="top"
        >
          {product.sku}
        </Text>
      </group>
    </group>
  );
};
