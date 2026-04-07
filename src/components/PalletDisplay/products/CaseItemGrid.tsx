import { Suspense, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import type { CaseConfig, PackagingType } from '../../../types'
import {
  CASE_WALL_THICKNESS,
  buildScaledModelClone,
  calculateItemPositions,
  getCaseCellDimensions,
} from './caseUtils'

interface CaseItemGridProps {
  unitModelUrl: string
  packaging?: PackagingType
  unitDimensions: { width: number; height: number; depth: number }
  caseDimensions: { width: number; height: number; depth: number }
  layout: CaseConfig['layout']
  padding: number
}

function CaseItemGridInner({
  unitModelUrl,
  packaging,
  unitDimensions,
  caseDimensions,
  layout,
  padding,
}: CaseItemGridProps) {
  const gltf = useGLTF(unitModelUrl)
  const cell = getCaseCellDimensions(
    caseDimensions,
    layout,
    padding,
    CASE_WALL_THICKNESS
  )
  const positions = useMemo(
    () =>
      calculateItemPositions(
        caseDimensions,
        unitDimensions,
        layout,
        padding,
        CASE_WALL_THICKNESS
      ),
    [
      caseDimensions.width,
      caseDimensions.height,
      caseDimensions.depth,
      unitDimensions.width,
      unitDimensions.height,
      unitDimensions.depth,
      layout.cols,
      layout.rows,
      layout.layers,
      padding,
    ]
  )

  const scaledUnit = useMemo(
    () =>
      buildScaledModelClone({
        scene: gltf.scene,
        packaging,
        targetDimensions: {
          width: cell.width - padding,
          height: cell.height - padding,
          depth: cell.depth - padding,
        },
      }),
    [cell.depth, cell.height, cell.width, gltf.scene, packaging, padding]
  )

  const clones = useMemo(
    () => positions.map(() => scaledUnit.clone(true)),
    [
      positions,
      scaledUnit,
    ]
  )

  useEffect(() => {
    return () => {
      clones.forEach((clone) => {
        clone.traverse((child) => {
          const mesh = child as THREE.Mesh
          if (mesh.geometry) mesh.geometry.dispose()
          if (mesh.material) {
            const materials = Array.isArray(mesh.material)
              ? mesh.material
              : [mesh.material]
            materials.forEach((m) => m.dispose())
          }
        })
      })
    }
  }, [clones])

  return (
    <group>
      {clones.map((clone, index) => (
        <primitive
          key={`${unitModelUrl}-${index}`}
          object={clone}
          position={positions[index]}
        />
      ))}
    </group>
  )
}

export function CaseItemGrid(props: CaseItemGridProps) {
  return (
    <Suspense fallback={null}>
      <CaseItemGridInner {...props} />
    </Suspense>
  )
}
