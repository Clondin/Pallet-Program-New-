import React, { useMemo, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { PlacedProduct, TierConfig } from '../../types'
import { ProductRenderer } from './products/ProductRenderer'

interface PlacedProductsProps {
  products: PlacedProduct[]
  tiers: TierConfig[]
  selectedProductId?: string | null
  onProductClick?: (productId: string) => void
}

export const PlacedProducts: React.FC<PlacedProductsProps> = ({
  products,
  tiers,
  selectedProductId,
  onProductClick,
}) => {
  // Preload all .glb models
  useEffect(() => {
    const modelUrls = products
      .map((p) => p.modelUrl)
      .filter((url): url is string => !!url)

    const uniqueUrls = [...new Set(modelUrls)]
    uniqueUrls.forEach((url) => useGLTF.preload(url))
  }, [products])

  // Map slotIds to world positions
  const slotPositions = useMemo(() => {
    const positions = new Map<string, [number, number, number]>()
    const platformThickness = 1

    tiers.forEach((tier) => {
      const gridSize = tier.slotGridSize

      const frontTrayWidth = tier.width
      const frontTrayDepth = tier.shelfDepth
      const frontCols = Math.floor(frontTrayWidth / gridSize)
      const frontRows = Math.floor(frontTrayDepth / gridSize)
      const frontStartX = -(frontCols * gridSize) / 2 + gridSize / 2
      const frontCenterZ = tier.depth / 2 - frontTrayDepth / 2
      const frontStartZ = frontCenterZ - (frontRows * gridSize) / 2 + gridSize / 2

      let slotIndex = 0

      // Front tray
      for (let r = 0; r < frontRows; r++) {
        for (let c = 0; c < frontCols; c++) {
          positions.set(`${tier.id}-${slotIndex++}`, [
            frontStartX + c * gridSize,
            tier.yOffset + platformThickness,
            frontStartZ + r * gridSize,
          ])
        }
      }

      // Back tray
      const backCenterZ = -tier.depth / 2 + frontTrayDepth / 2
      const backStartZ = backCenterZ - (frontRows * gridSize) / 2 + gridSize / 2
      for (let r = 0; r < frontRows; r++) {
        for (let c = 0; c < frontCols; c++) {
          positions.set(`${tier.id}-${slotIndex++}`, [
            frontStartX + c * gridSize,
            tier.yOffset + platformThickness,
            backStartZ + r * gridSize,
          ])
        }
      }

      // Left tray
      const sideTrayWidth = tier.shelfDepth
      const sideTrayDepth = tier.depth - frontTrayDepth * 2
      const sideCols = Math.floor(sideTrayWidth / gridSize)
      const sideRows = Math.floor(sideTrayDepth / gridSize)
      const leftCenterX = -tier.width / 2 + sideTrayWidth / 2
      const leftStartX = leftCenterX - (sideCols * gridSize) / 2 + gridSize / 2
      const sideStartZ = -(sideRows * gridSize) / 2 + gridSize / 2

      for (let r = 0; r < sideRows; r++) {
        for (let c = 0; c < sideCols; c++) {
          positions.set(`${tier.id}-${slotIndex++}`, [
            leftStartX + c * gridSize,
            tier.yOffset + platformThickness,
            sideStartZ + r * gridSize,
          ])
        }
      }

      // Right tray
      const rightCenterX = tier.width / 2 - sideTrayWidth / 2
      const rightStartX = rightCenterX - (sideCols * gridSize) / 2 + gridSize / 2
      for (let r = 0; r < sideRows; r++) {
        for (let c = 0; c < sideCols; c++) {
          positions.set(`${tier.id}-${slotIndex++}`, [
            rightStartX + c * gridSize,
            tier.yOffset + platformThickness,
            sideStartZ + r * gridSize,
          ])
        }
      }
    })

    return positions
  }, [tiers])

  return (
    <group position={[0, 6, 0]}>
      {products.map((product) => {
        const position = slotPositions.get(product.slotId)
        if (!position) return null

        return (
          <ProductRenderer
            key={product.id}
            product={product}
            position={position}
            isSelected={product.id === selectedProductId}
            onClick={() => onProductClick?.(product.id)}
          />
        )
      })}
    </group>
  )
}
