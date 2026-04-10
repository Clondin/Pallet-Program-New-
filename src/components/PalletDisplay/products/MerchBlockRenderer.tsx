import React, { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { PlacedProduct } from '../../../types'
import { buildScaledModelClone } from './caseUtils'
import { TexturedBoxProduct } from './TexturedBoxProduct'
import { BasicBoxProduct } from './BasicBoxProduct'
import type { MerchBlockLayout } from './merchUtils'

interface MerchBlockRendererProps {
  product: PlacedProduct
  layout: MerchBlockLayout
  onClick?: () => void
  onPointerOver?: () => void
  onPointerOut?: () => void
}

export const MerchBlockRenderer: React.FC<MerchBlockRendererProps> = ({
  product,
  layout,
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  if (product.modelUrl) {
    return (
      <GlbMerchBlock
        product={product}
        layout={layout}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      />
    )
  }

  if (product.imageUrl) {
    return (
      <>
        {layout.positions.map((entry, index) => (
          <TexturedBoxProduct
            key={`${product.id}-textured-${index}`}
            product={product}
            position={entry.position}
            rotation={entry.rotation}
            scale={entry.scale}
            onClick={onClick}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
          />
        ))}
      </>
    )
  }

  return (
    <>
      {layout.positions.map((entry, index) => (
        <BasicBoxProduct
          key={`${product.id}-basic-${index}`}
          product={product}
          position={entry.position}
          rotation={entry.rotation}
          scale={entry.scale}
          onClick={onClick}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
        />
      ))}
    </>
  )
}

const GlbMerchBlock: React.FC<MerchBlockRendererProps> = ({
  product,
  layout,
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  const gltf = useGLTF(product.modelUrl!)

  const scaledPrototype = useMemo(
    () =>
      buildScaledModelClone({
        scene: gltf.scene,
        packaging: product.packaging,
        targetDimensions: {
          width: product.width,
          height: product.height,
          depth: product.depth,
        },
      }),
    [gltf.scene, product.depth, product.height, product.packaging, product.width],
  )

  return (
    <>
      {layout.positions.map((entry, index) => (
        <group
          key={`${product.id}-glb-${index}`}
          position={entry.position}
          rotation={entry.rotation}
          scale={entry.scale}
          onClick={(event) => {
            event.stopPropagation()
            onClick?.()
          }}
          onPointerOver={(event) => {
            event.stopPropagation()
            onPointerOver?.()
          }}
          onPointerOut={(event) => {
            event.stopPropagation()
            onPointerOut?.()
          }}
        >
          <primitive object={scaledPrototype.clone()} />
        </group>
      ))}
    </>
  )
}
