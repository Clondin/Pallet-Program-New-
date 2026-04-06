import React, { useMemo } from 'react';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

interface RetailEnvironmentProps {
  environmentType?: 'retail' | 'studio' | 'clean';
}

export const RetailEnvironment: React.FC<RetailEnvironmentProps> = ({ environmentType = 'retail' }) => {
  // Create a subtle tile grid texture for the floor
  const floorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#D1D5DB'; // Base floor color
      context.fillRect(0, 0, 1024, 1024);
      
      context.strokeStyle = '#C0C4C8'; // Tile line color
      context.lineWidth = 2;
      
      const tileSize = 64;
      context.beginPath();
      for (let x = 0; x <= 1024; x += tileSize) {
        context.moveTo(x, 0);
        context.lineTo(x, 1024);
      }
      for (let y = 0; y <= 1024; y += tileSize) {
        context.moveTo(0, y);
        context.lineTo(1024, y);
      }
      context.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(20, 20); // Repeat across the large plane
    return texture;
  }, []);

  return (
    <>
      {/* Ambient Light */}
      <ambientLight intensity={0.3} color="#FFFFFF" />

      {/* Key Light: Warm-white from upper-front-right */}
      <directionalLight
        position={[100, 150, 100]}
        intensity={1.2}
        color="#FFF8F0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={400}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={-0.0001}
      />

      {/* Fill Light: Cool-white from upper-back-left */}
      <directionalLight
        position={[-100, 100, -100]}
        intensity={0.4}
        color="#F0F4FF"
      />

      {/* Overhead Fluorescent Simulation */}
      <spotLight
        position={[0, 150, 50]}
        angle={Math.PI / 3}
        penumbra={0.5}
        intensity={2}
        color="#FFFFFF"
        castShadow={false}
      />
      <spotLight
        position={[0, 150, -50]}
        angle={Math.PI / 3}
        penumbra={0.5}
        intensity={2}
        color="#FFFFFF"
        castShadow={false}
      />

      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial
          map={floorTexture}
          color="#FFFFFF" // Base color is in the texture
          roughness={0.55}
          metalness={0.08}
        />
      </mesh>

      {/* Environment Map for reflections */}
      <Environment preset="city" environmentIntensity={0.2} />
      
      {/* Background Fog for depth */}
      <fog attach="fog" args={['#E5E7EB', 150, 400]} />
    </>
  );
};
