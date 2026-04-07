import { useMemo } from 'react'
import * as THREE from 'three'
import type { CaseConfig } from '../../../types'
import {
  CASE_DIVIDER_THICKNESS,
  CASE_WALL_THICKNESS,
  getCaseCellDimensions,
  getInteriorDimensions,
} from './caseUtils'

interface CaseDividersProps {
  caseDimensions: { width: number; height: number; depth: number }
  layout: CaseConfig['layout']
  padding: number
}

export function CaseDividers({
  caseDimensions,
  layout,
  padding,
}: CaseDividersProps) {
  const wallThickness = CASE_WALL_THICKNESS
  const dividerThickness = CASE_DIVIDER_THICKNESS
  const interior = getInteriorDimensions(caseDimensions, padding, wallThickness)
  const dividerHeight = interior.height
  const cell = getCaseCellDimensions(caseDimensions, layout, padding, wallThickness)

  const dividerMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#D4B07A',
        roughness: 0.9,
        metalness: 0.01,
      }),
    []
  )

  return (
    <group>
      {Array.from({ length: Math.max(layout.cols - 1, 0) }, (_, index) => {
        const column = index + 1
        const x = -interior.width / 2 + column * cell.width
        return (
          <mesh
            key={`col-${column}`}
            position={[x, dividerHeight / 2 + wallThickness, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[dividerThickness, dividerHeight, interior.depth]} />
            <primitive object={dividerMaterial} attach="material" />
          </mesh>
        )
      })}

      {Array.from({ length: Math.max(layout.rows - 1, 0) }, (_, index) => {
        const row = index + 1
        const z = -interior.depth / 2 + row * cell.depth
        return (
          <mesh
            key={`row-${row}`}
            position={[0, dividerHeight / 2 + wallThickness, z]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[interior.width, dividerHeight, dividerThickness]} />
            <primitive object={dividerMaterial} attach="material" />
          </mesh>
        )
      })}
    </group>
  )
}
