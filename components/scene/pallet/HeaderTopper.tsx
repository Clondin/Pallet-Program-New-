"use client";

import { useMemo } from "react";
import { ExtrudeGeometry, Shape, ShapeGeometry } from "three";

import { createHeaderTexture } from "@/lib/textureFactory";

interface HeaderTopperProps {
  width: number;
  depth: number;
  height: number;
  label: string;
  subtitle?: string;
  bgColor?: string;
  textColor?: string;
  variant?: "full" | "half";
}

export function HeaderTopper({
  width,
  depth,
  height,
  label,
  subtitle,
  bgColor = "#00b3ca",
  textColor = "#ffffff",
  variant = "half",
}: HeaderTopperProps) {
  const pxPerUnit = 64;
  const texWidth = Math.max(512, Math.round(width * pxPerUnit));
  const texHeight = Math.round(height * pxPerUnit);

  // Rounded top corners matching the die-cut headboard profile
  const cornerRadius = Math.min(height * 0.2, 2.5);

  const roundedShape = useMemo(() => {
    const shape = new Shape();
    const w = width / 2;
    const h = height / 2;
    const r = cornerRadius;

    shape.moveTo(-w, -h);
    shape.lineTo(w, -h);
    shape.lineTo(w, h - r);
    shape.quadraticCurveTo(w, h, w - r, h);
    shape.lineTo(-w + r, h);
    shape.quadraticCurveTo(-w, h, -w, h - r);
    shape.closePath();
    return shape;
  }, [width, height, cornerRadius]);

  // Front face: flat textured shape
  const frontGeo = useMemo(() => {
    const geo = new ShapeGeometry(roundedShape);
    const uvAttr = geo.getAttribute("uv");
    const posAttr = geo.getAttribute("position");
    const w = width / 2;
    const h = height / 2;
    for (let i = 0; i < uvAttr.count; i++) {
      uvAttr.setXY(i, (posAttr.getX(i) + w) / width, (posAttr.getY(i) + h) / height);
    }
    uvAttr.needsUpdate = true;
    return geo;
  }, [roundedShape, width, height]);

  // Body: extruded shape for cardboard structure
  const bodyGeo = useMemo(() => {
    const geo = new ExtrudeGeometry(roundedShape, { depth, bevelEnabled: false });
    geo.translate(0, 0, -depth / 2);
    geo.computeVertexNormals();
    return geo;
  }, [roundedShape, depth]);

  const texture = useMemo(
    () => createHeaderTexture(label, bgColor, textColor, texWidth, texHeight, subtitle, variant),
    [label, bgColor, textColor, subtitle, variant, texWidth, texHeight],
  );

  return (
    <group>
      {/* Textured front face */}
      <mesh castShadow position={[0, 0, depth / 2 + 0.01]} receiveShadow>
        <primitive object={frontGeo} attach="geometry" />
        <meshStandardMaterial map={texture} roughness={0.65} />
      </mesh>
      {/* Body: cyan to blend with back wall below */}
      <mesh castShadow geometry={bodyGeo} receiveShadow>
        <meshStandardMaterial color={bgColor} roughness={0.7} />
      </mesh>
    </group>
  );
}
