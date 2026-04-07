import * as THREE from 'three'
import type { CaseConfig, PackagingType, Product } from '../../../types'
import { calculateCaseDimensions as calculateResolvedCaseDimensions } from '../../../lib/dimensionEngine'

export const CASE_WALL_THICKNESS = 0.15
export const CASE_DIVIDER_THICKNESS = 0.08

export function getCaseItemCount(layout: CaseConfig['layout']) {
  return layout.cols * layout.rows * layout.layers
}

export function getCaseWeight(unitWeight: number, layout: CaseConfig['layout']) {
  return unitWeight * getCaseItemCount(layout) + 1.5
}

export function calculateCaseDimensions(
  unitDimensions: { width: number; height: number; depth: number },
  layout: CaseConfig['layout'],
  padding = 0.25,
  wallThickness = CASE_WALL_THICKNESS
) {
  const dimensions = calculateResolvedCaseDimensions(
    {
      ...unitDimensions,
      source: 'manual',
    },
    layout,
    padding,
    false,
  )

  return {
    width: dimensions.width,
    height: dimensions.height,
    depth: dimensions.depth,
  }
}

export function generateCaseVariants(unitProduct: Product) {
  const configs = [
    {
      label: '6-Pack',
      layout: { cols: 3, rows: 2, layers: 1 },
    },
    {
      label: '12-Pack',
      layout: { cols: 4, rows: 3, layers: 1 },
    },
    {
      label: '24-Pack',
      layout: { cols: 4, rows: 3, layers: 2 },
    },
  ] satisfies Array<{
    label: string
    layout: CaseConfig['layout']
  }>

  return configs.map((config) => {
    const { width, height, depth } = calculateCaseDimensions(
      {
        width: unitProduct.width,
        height: unitProduct.height,
        depth: unitProduct.depth,
      },
      config.layout
    )

    return {
      name: `${unitProduct.name} (${config.label})`,
      width,
      height,
      depth,
      caseConfig: {
        unitProductId: unitProduct.id,
        layout: config.layout,
        caseStyle: config.layout.layers > 1 ? 'closed' : 'open-top',
        innerPadding: 0.25,
        dividers:
          unitProduct.packaging === 'bottle' || unitProduct.packaging === 'jar',
      } satisfies CaseConfig,
    }
  })
}

export function getInteriorDimensions(
  caseDimensions: { width: number; height: number; depth: number },
  padding: number,
  wallThickness = CASE_WALL_THICKNESS
) {
  return {
    width: caseDimensions.width - wallThickness * 2 - padding * 2,
    depth: caseDimensions.depth - wallThickness * 2 - padding * 2,
    height: caseDimensions.height - wallThickness - padding,
  }
}

export function getCaseCellDimensions(
  caseDimensions: { width: number; height: number; depth: number },
  layout: CaseConfig['layout'],
  padding: number,
  wallThickness = CASE_WALL_THICKNESS
) {
  const interior = getInteriorDimensions(caseDimensions, padding, wallThickness)
  return {
    width: interior.width / layout.cols,
    depth: interior.depth / layout.rows,
    height: interior.height / layout.layers,
  }
}

export function calculateItemPositions(
  caseDimensions: { width: number; height: number; depth: number },
  unitDimensions: { width: number; height: number; depth: number },
  layout: CaseConfig['layout'],
  padding: number,
  wallThickness = CASE_WALL_THICKNESS
): Array<[number, number, number]> {
  const positions: Array<[number, number, number]> = []
  const cell = getCaseCellDimensions(caseDimensions, layout, padding, wallThickness)
  const interior = getInteriorDimensions(caseDimensions, padding, wallThickness)

  const startX = -interior.width / 2 + cell.width / 2
  const startZ = -interior.depth / 2 + cell.depth / 2
  const startY = wallThickness + padding

  for (let layer = 0; layer < layout.layers; layer += 1) {
    for (let row = 0; row < layout.rows; row += 1) {
      for (let col = 0; col < layout.cols; col += 1) {
        positions.push([
          startX + col * cell.width,
          startY + layer * unitDimensions.height,
          startZ + row * cell.depth,
        ])
      }
    }
  }

  return positions
}

export function buildScaledModelClone({
  scene,
  packaging,
  targetDimensions,
}: {
  scene: THREE.Object3D
  packaging?: PackagingType
  targetDimensions: { width: number; height: number; depth: number }
}) {
  const clone = scene.clone(true)
  const bbox = new THREE.Box3().setFromObject(clone)
  const modelSize = new THREE.Vector3()
  bbox.getSize(modelSize)

  if (modelSize.x === 0 || modelSize.y === 0 || modelSize.z === 0) {
    return clone
  }

  const scaleX = targetDimensions.width / modelSize.x
  const scaleY = targetDimensions.height / modelSize.y
  const scaleZ = targetDimensions.depth / modelSize.z
  const preserveProportions =
    packaging === 'bottle' || packaging === 'jar' || packaging === 'bag'

  if (preserveProportions) {
    const uniformScale = Math.min(scaleX, scaleY, scaleZ)
    clone.scale.set(uniformScale, uniformScale, uniformScale)
  } else {
    clone.scale.set(scaleX, scaleY, scaleZ)
  }

  const nextBox = new THREE.Box3().setFromObject(clone)
  const center = new THREE.Vector3()
  nextBox.getCenter(center)

  clone.position.x -= center.x
  clone.position.z -= center.z
  clone.position.y -= nextBox.min.y

  clone.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material]

      const clonedMaterials = materials.map((material) => {
        if (material instanceof THREE.MeshStandardMaterial) {
          const cloned = material.clone()
          cloned.roughness = Math.max(cloned.roughness ?? 0.6, 0.5)
          cloned.metalness = Math.min(cloned.metalness ?? 0.1, 0.1)
          cloned.envMapIntensity = Math.min(
            cloned.envMapIntensity ?? 0.3,
            0.3
          )
          return cloned
        }
        return material
      })
      child.material = Array.isArray(child.material)
        ? clonedMaterials
        : clonedMaterials[0]

      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return clone
}
