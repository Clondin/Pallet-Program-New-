import React, { useMemo } from 'react';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import { getLipMaterial } from './materials/cardboardMaterial';

interface ShelfLipProps {
  width: number;
  color?: string;
  text?: string;
  textColor?: string;
}

export const ShelfLip: React.FC<ShelfLipProps> = ({ width, color = '#3B7DD8', text, textColor = '#FFFFFF' }) => {
  const lipMaterial = useMemo(() => getLipMaterial(color), [color]);
  const thickness = 0.5;
  const height = 2;

  // Groove material (slightly darker than lip color)
  const grooveMaterial = useMemo(() => {
    const baseColor = new THREE.Color(color);
    const hsl = { h: 0, s: 0, l: 0 };
    baseColor.getHSL(hsl);
    const darkerColor = new THREE.Color().setHSL(hsl.h, hsl.s, Math.max(0, hsl.l - 0.15));
    return new THREE.MeshStandardMaterial({ color: darkerColor, roughness: 0.9 });
  }, [color]);

  // Repeating text
  const textElements = useMemo(() => {
    if (!text) return null;
    
    // Estimate text width (rough approximation: 0.6 units per character at size 0.8)
    const charWidth = 0.6;
    const separator = "  ·  ";
    const fullText = text + separator;
    const textWidth = fullText.length * charWidth;
    
    const repeatCount = Math.max(1, Math.floor(width / textWidth));
    const elements = [];
    
    const startX = -width / 2 + (width / repeatCount) / 2;
    
    for (let i = 0; i < repeatCount; i++) {
      elements.push(
        <Text
          key={i}
          position={[startX + i * (width / repeatCount), 0, thickness / 2 + 0.01]}
          fontSize={0.8}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {text}
          {i < repeatCount - 1 ? separator : ''}
        </Text>
      );
    }
    
    // Add one more separator at the end if it's repeating
    if (repeatCount > 1) {
      elements.push(
        <Text
          key="last-sep"
          position={[startX + (repeatCount - 1) * (width / repeatCount) + (text.length * charWidth) / 2 + (separator.length * charWidth) / 2, 0, thickness / 2 + 0.01]}
          fontSize={0.8}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {separator.trim()}
        </Text>
      );
    }

    // Actually, a simpler way is to just repeat the string itself
    const repeatedString = Array(repeatCount).fill(text).join(separator);

    return (
      <Text
        position={[0, 0, thickness / 2 + 0.01]}
        fontSize={0.8}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        maxWidth={width - 1}
        textAlign="center"
      >
        {repeatedString}
      </Text>
    );
  }, [text, width, textColor, thickness]);

  return (
    <group>
      <RoundedBox args={[width, height, thickness]} radius={0.02} smoothness={2} material={lipMaterial} castShadow receiveShadow />
      
      {/* Subtle horizontal groove */}
      <mesh position={[0, 0, thickness / 2 + 0.005]}>
        <planeGeometry args={[width, 0.15]} />
        <primitive object={grooveMaterial} attach="material" />
      </mesh>

      {textElements}
    </group>
  );
};
