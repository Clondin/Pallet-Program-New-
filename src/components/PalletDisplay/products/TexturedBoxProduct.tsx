import React, { useMemo, useState } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { PlacedProduct } from '../../../types'
import { BasicBoxProduct } from './BasicBoxProduct'

interface TexturedBoxProductProps {
  product: PlacedProduct
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  onClick?: () => void
  onPointerOver?: () => void
  onPointerOut?: () => void
}

const TexturedBoxInner: React.FC<TexturedBoxProductProps> = ({
  product,
  position,
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  const frontTexture = useTexture(product.imageUrl!)

  useMemo(() => {
    frontTexture.colorSpace = THREE.SRGBColorSpace
    frontTexture.minFilter = THREE.LinearFilter
  }, [frontTexture])

  const materials = useMemo(() => {
    const brandColor = new THREE.Color(product.color)
    const topColor = brandColor.clone().lerp(new THREE.Color('#ffffff'), 0.2)

    const side = new THREE.MeshStandardMaterial({
      color: brandColor,
      roughness: 0.7,
      metalness: 0.05,
    })
    const top = new THREE.MeshStandardMaterial({
      color: topColor,
      roughness: 0.8,
      metalness: 0.02,
    })
    const bottom = new THREE.MeshStandardMaterial({
      color: brandColor,
      roughness: 0.9,
      metalness: 0.0,
    })
    const front = new THREE.MeshStandardMaterial({
      map: frontTexture,
      roughness: 0.6,
      metalness: 0.02,
    })

    return [side, side.clone(), top, bottom, front, side.clone()]
  }, [product.color, frontTexture])

  const adjustedPosition: [number, number, number] = [0, product.height / 2, 0]

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
      <mesh position={adjustedPosition} castShadow receiveShadow>
        <boxGeometry args={[product.width, product.height, product.depth]} />
        {materials.map((mat, i) => (
          <primitive key={i} object={mat} attach={`material-${i}`} />
        ))}
      </mesh>
    </group>
  )
}

export const TexturedBoxProduct: React.FC<TexturedBoxProductProps> = (props) => {
  const [hasError, setHasError] = useState(false)

  if (hasError || !props.product.imageUrl) {
    return <BasicBoxProduct {...props} />
  }

  return (
    <ErrorBoundary onError={() => setHasError(true)}>
      <TexturedBoxInner {...props} />
    </ErrorBoundary>
  )
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}
