"use client";

import { useMemo } from "react";

import { createStripTexture } from "@/lib/textureFactory";

interface StripDividerProps {
  width: number;
  height: number;
  text: string;
  bgColor: string;
  textColor?: string;
  variant?: "full" | "half";
}

export function StripDivider({ width, height, text, bgColor, textColor = "#ffffff", variant = "half" }: StripDividerProps) {
  const pxPerUnit = 64;
  const texWidth = Math.max(512, Math.round((width + 0.2) * pxPerUnit));
  const texHeight = Math.round(height * pxPerUnit);

  const texture = useMemo(
    () => createStripTexture(text, bgColor, textColor, texWidth, texHeight, variant),
    [text, bgColor, textColor, variant, texWidth, texHeight],
  );

  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[width + 0.2, height, 0.3]} />
      <meshStandardMaterial map={texture} roughness={0.6} />
    </mesh>
  );
}
