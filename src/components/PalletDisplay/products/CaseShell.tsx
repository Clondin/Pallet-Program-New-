import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { CASE_WALL_THICKNESS } from './caseUtils'
import { getCardboardMaterial } from '../materials/cardboardMaterial'

interface CaseShellProps {
  dimensions: { width: number; height: number; depth: number }
  style: 'open-top' | 'closed' | 'tray'
  color: string
}

function createTintMaterial(color: string, roughness = 0.8) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.02,
  })
}

export function CaseShell({ dimensions, style, color }: CaseShellProps) {
  const wallThickness = CASE_WALL_THICKNESS
  const wallHeight =
    style === 'tray'
      ? Math.max(dimensions.height * 0.4, wallThickness * 3)
      : Math.max(dimensions.height - wallThickness, wallThickness * 3)
  const frontWallHeight =
    style === 'closed'
      ? wallHeight
      : style === 'tray'
        ? Math.max(Math.min(wallHeight * 0.35, 2.5), wallThickness * 2)
        : Math.max(Math.min(wallHeight * 0.28, 3), wallThickness * 2)
  const stripHeight = Math.min(1, wallHeight * 0.45)
  const frontStripHeight = Math.min(0.75, frontWallHeight * 0.5)

  const cardboardMaterial = useMemo(() => getCardboardMaterial().clone(), [])
  const innerMaterial = useMemo(() => {
    const material = getCardboardMaterial().clone()
    material.color = material.color.clone().multiplyScalar(0.9)
    return material
  }, [])
  const stripMaterial = useMemo(() => createTintMaterial(color, 0.75), [color])

  useEffect(() => {
    return () => {
      cardboardMaterial.dispose()
      innerMaterial.dispose()
      stripMaterial.dispose()
    }
  }, [cardboardMaterial, innerMaterial, stripMaterial])

  const frontWallArgs: [number, number, number] = [
    dimensions.width,
    frontWallHeight,
    wallThickness,
  ]
  const backWallArgs: [number, number, number] = [
    dimensions.width,
    wallHeight,
    wallThickness,
  ]
  const sideArgs: [number, number, number] = [
    wallThickness,
    wallHeight,
    dimensions.depth,
  ]

  const wallCenterY = wallThickness + wallHeight / 2
  const frontWallCenterY = wallThickness + frontWallHeight / 2
  const bottomY = wallThickness / 2
  const topPanelY = dimensions.height - wallThickness / 2
  const topStripY = wallThickness + wallHeight - stripHeight / 2
  const frontStripY = wallThickness + frontWallHeight - frontStripHeight / 2
  const innerPlaneY = wallCenterY
  const frontInnerPlaneY = frontWallCenterY

  return (
    <group>
      <mesh position={[0, bottomY, 0]} receiveShadow castShadow={false}>
        <boxGeometry args={[dimensions.width, wallThickness, dimensions.depth]} />
        <primitive object={cardboardMaterial} attach="material" />
      </mesh>

      <mesh position={[0, frontWallCenterY, dimensions.depth / 2 - wallThickness / 2]} castShadow receiveShadow>
        <boxGeometry args={frontWallArgs} />
        <primitive object={cardboardMaterial} attach="material" />
      </mesh>
      <mesh position={[0, frontInnerPlaneY, dimensions.depth / 2 - wallThickness]} receiveShadow>
        <planeGeometry args={[dimensions.width, frontWallHeight]} />
        <primitive object={innerMaterial} attach="material" />
      </mesh>

      <mesh position={[0, wallCenterY, -dimensions.depth / 2 + wallThickness / 2]} castShadow receiveShadow>
        <boxGeometry args={backWallArgs} />
        <primitive object={cardboardMaterial} attach="material" />
      </mesh>
      <mesh
        position={[0, innerPlaneY, -dimensions.depth / 2 + wallThickness]}
        rotation={[0, Math.PI, 0]}
        receiveShadow
      >
        <planeGeometry args={[dimensions.width, wallHeight]} />
        <primitive object={innerMaterial} attach="material" />
      </mesh>

      <mesh position={[-dimensions.width / 2 + wallThickness / 2, wallCenterY, 0]} castShadow receiveShadow>
        <boxGeometry args={sideArgs} />
        <primitive object={cardboardMaterial} attach="material" />
      </mesh>
      <mesh
        position={[-dimensions.width / 2 + wallThickness, innerPlaneY, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[dimensions.depth, wallHeight]} />
        <primitive object={innerMaterial} attach="material" />
      </mesh>

      <mesh position={[dimensions.width / 2 - wallThickness / 2, wallCenterY, 0]} castShadow receiveShadow>
        <boxGeometry args={sideArgs} />
        <primitive object={cardboardMaterial} attach="material" />
      </mesh>
      <mesh
        position={[dimensions.width / 2 - wallThickness, innerPlaneY, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[dimensions.depth, wallHeight]} />
        <primitive object={innerMaterial} attach="material" />
      </mesh>

      <mesh position={[0, frontStripY, dimensions.depth / 2 - wallThickness / 2 - 0.001]} castShadow receiveShadow>
        <boxGeometry args={[dimensions.width, frontStripHeight, wallThickness + 0.01]} />
        <primitive object={stripMaterial} attach="material" />
      </mesh>
      <mesh position={[0, topStripY, -dimensions.depth / 2 + wallThickness / 2 + 0.001]} castShadow receiveShadow>
        <boxGeometry args={[dimensions.width, stripHeight, wallThickness + 0.01]} />
        <primitive object={stripMaterial} attach="material" />
      </mesh>
      <mesh position={[-dimensions.width / 2 + wallThickness / 2, topStripY, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness + 0.01, stripHeight, dimensions.depth]} />
        <primitive object={stripMaterial} attach="material" />
      </mesh>
      <mesh position={[dimensions.width / 2 - wallThickness / 2, topStripY, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness + 0.01, stripHeight, dimensions.depth]} />
        <primitive object={stripMaterial} attach="material" />
      </mesh>

      {style === 'closed' && (
        <mesh position={[0, topPanelY, 0]} castShadow receiveShadow>
          <boxGeometry args={[dimensions.width, wallThickness, dimensions.depth]} />
          <primitive object={cardboardMaterial} attach="material" />
        </mesh>
      )}
    </group>
  )
}
