import React, { useMemo } from 'react'
import { RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'
import { PlacedProduct } from '../../../types'

interface BasicBoxProductProps {
  product: PlacedProduct
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  onClick?: () => void
  onPointerOver?: () => void
  onPointerOut?: () => void
}

export const BasicBoxProduct: React.FC<BasicBoxProductProps> = ({
  product,
  position,
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  const brandColor = useMemo(() => new THREE.Color(product.color), [product.color])
  const topColor = useMemo(
    () => brandColor.clone().lerp(new THREE.Color('#ffffff'), 0.2),
    [brandColor],
  )

  const boxMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: brandColor,
        roughness: 0.7,
        metalness: 0.05,
      }),
    [brandColor],
  )

  const topMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: topColor,
        roughness: 0.8,
        metalness: 0.02,
      }),
    [topColor],
  )

  const bottomMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: brandColor,
        roughness: 0.9,
        metalness: 0.0,
      }),
    [brandColor],
  )

  const adjustedPosition: [number, number, number] = [0, product.height / 2, 0]

  const fontSize = Math.max(product.width * 0.08, 0.6)
  const skuFontSize = Math.max(product.width * 0.06, 0.4)

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        onPointerOver?.()
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        onPointerOut?.()
      }}
    >
      <group position={adjustedPosition}>
      <RoundedBox
        args={[product.width, product.height, product.depth]}
        radius={0.2}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <primitive object={boxMaterial} attach="material-0" />
        <primitive object={boxMaterial} attach="material-1" />
        <primitive object={topMaterial} attach="material-2" />
        <primitive object={bottomMaterial} attach="material-3" />
        <primitive object={boxMaterial} attach="material-4" />
        <primitive object={boxMaterial} attach="material-5" />
      </RoundedBox>

      {/* Front face text */}
      <Text
        position={[0, 1, product.depth / 2 + 0.05]}
        fontSize={fontSize}
        color="white"
        maxWidth={product.width * 0.85}
        textAlign="center"
        anchorY="middle"
      >
        {product.label}
      </Text>
      <Text
        position={[0, -1, product.depth / 2 + 0.05]}
        fontSize={skuFontSize}
        color="white"
        fillOpacity={0.6}
        maxWidth={product.width * 0.85}
        textAlign="center"
        anchorY="middle"
      >
        {product.sku}
      </Text>
      </group>
    </group>
  )
}
