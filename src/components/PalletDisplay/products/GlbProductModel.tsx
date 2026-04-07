import React, { useMemo, useState, Suspense } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { PlacedProduct } from '../../../types'
import { BasicBoxProduct } from './BasicBoxProduct'
import { TexturedBoxProduct } from './TexturedBoxProduct'

interface GlbProductModelProps {
  product: PlacedProduct
  position: [number, number, number]
  rotation?: [number, number, number]
  onClick?: () => void
  onPointerOver?: () => void
  onPointerOut?: () => void
}

const GlbModelInner: React.FC<GlbProductModelProps & { onError: () => void }> = ({
  product,
  position,
  rotation = [0, 0, 0],
  onClick,
  onPointerOver,
  onPointerOut,
  onError,
}) => {
  let gltf: ReturnType<typeof useGLTF>
  try {
    gltf = useGLTF(product.modelUrl!)
  } catch {
    onError()
    return null
  }

  const scaledScene = useMemo(() => {
    const clone = gltf.scene.clone()

    // Compute bounding box
    const bbox = new THREE.Box3().setFromObject(clone)
    const modelSize = new THREE.Vector3()
    bbox.getSize(modelSize)

    // Prevent division by zero
    if (modelSize.x === 0 || modelSize.y === 0 || modelSize.z === 0) return clone

    const scaleX = product.width / modelSize.x
    const scaleY = product.height / modelSize.y
    const scaleZ = product.depth / modelSize.z

    // Box-shaped packaging: non-uniform, organic: uniform
    const isBoxLike = product.packaging === 'box' || product.packaging === 'tin'

    if (isBoxLike) {
      clone.scale.set(scaleX, scaleY, scaleZ)
    } else {
      const uniformScale = Math.min(scaleX, scaleY, scaleZ)
      clone.scale.set(uniformScale, uniformScale, uniformScale)
    }

    // Re-center: bottom at y=0, centered horizontally
    const newBbox = new THREE.Box3().setFromObject(clone)
    clone.position.y -= newBbox.min.y

    const newCenter = new THREE.Vector3()
    newBbox.getCenter(newCenter)
    clone.position.x -= newCenter.x
    clone.position.z -= newCenter.z

    // Fix AI-generated material issues
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial
        if (mat.roughness !== undefined) {
          mat.roughness = Math.max(mat.roughness, 0.5)
        }
        if (mat.metalness !== undefined) {
          mat.metalness = Math.min(mat.metalness, 0.1)
        }
        if (mat.envMapIntensity !== undefined) {
          mat.envMapIntensity = 0.3
        }
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    return clone
  }, [gltf.scene, product.width, product.height, product.depth, product.packaging])

  return (
    <primitive
      object={scaledScene}
      position={position}
      rotation={rotation}
      onClick={(e: THREE.Event) => {
        ;(e as any).stopPropagation?.()
        onClick?.()
      }}
      onPointerOver={(e: THREE.Event) => {
        ;(e as any).stopPropagation?.()
        onPointerOver?.()
      }}
      onPointerOut={(e: THREE.Event) => {
        ;(e as any).stopPropagation?.()
        onPointerOut?.()
      }}
    />
  )
}

export const GlbProductModel: React.FC<GlbProductModelProps> = (props) => {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    // Fall back to textured box or basic box
    if (props.product.imageUrl) {
      return <TexturedBoxProduct {...props} />
    }
    return <BasicBoxProduct {...props} />
  }

  return (
    <Suspense
      fallback={<BasicBoxProduct {...props} />}
    >
      <GlbErrorBoundary onError={() => setHasError(true)}>
        <GlbModelInner {...props} onError={() => setHasError(true)} />
      </GlbErrorBoundary>
    </Suspense>
  )
}

class GlbErrorBoundary extends React.Component<
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
