import React, { useMemo, Suspense } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { PlacedProduct } from '../../../types'
import { BasicBoxProduct } from './BasicBoxProduct'
import { TexturedBoxProduct } from './TexturedBoxProduct'
import { buildScaledModelClone } from './caseUtils'

interface GlbProductModelProps {
  product: PlacedProduct
  position: [number, number, number]
  rotation?: [number, number, number]
  onClick?: () => void
  onPointerOver?: () => void
  onPointerOut?: () => void
}

const GlbModelInner: React.FC<GlbProductModelProps> = ({
  product,
  position,
  rotation = [0, 0, 0],
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  const gltf = useGLTF(product.modelUrl!)

  const scaledScene = useMemo(() => {
    return buildScaledModelClone({
      scene: gltf.scene,
      packaging: product.packaging,
      targetDimensions: {
        width: product.width,
        height: product.height,
        depth: product.depth,
      },
    })
  }, [gltf.scene, product.width, product.height, product.depth, product.packaging])

  return (
    <primitive
      object={scaledScene}
      position={position}
      rotation={rotation}
      onClick={(e: any) => {
        e.stopPropagation?.()
        onClick?.()
      }}
      onPointerOver={(e: any) => {
        e.stopPropagation?.()
        onPointerOver?.()
      }}
      onPointerOut={(e: any) => {
        e.stopPropagation?.()
        onPointerOut?.()
      }}
    />
  )
}

function FallbackRenderer(props: GlbProductModelProps) {
  if (props.product.imageUrl) {
    return <TexturedBoxProduct {...props} />
  }
  return <BasicBoxProduct {...props} />
}

class GlbErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

export const GlbProductModel: React.FC<GlbProductModelProps> = (props) => {
  const fallback = <FallbackRenderer {...props} />

  return (
    <GlbErrorBoundary fallback={fallback}>
      <Suspense fallback={<BasicBoxProduct {...props} />}>
        <GlbModelInner {...props} />
      </Suspense>
    </GlbErrorBoundary>
  )
}
