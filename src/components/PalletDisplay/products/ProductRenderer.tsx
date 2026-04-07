import React, { useState } from 'react'
import { PlacedProduct, Product } from '../../../types'
import { getOrientationRotation } from '../../../lib/orientation-presets'
import { GlbProductModel } from './GlbProductModel'
import { TexturedBoxProduct } from './TexturedBoxProduct'
import { BasicBoxProduct } from './BasicBoxProduct'
import { ProductHoverEffect } from './ProductHoverEffect'
import { ProductCase } from './ProductCase'

interface ProductRendererProps {
  product: PlacedProduct
  products: Product[]
  position: [number, number, number]
  rotation?: [number, number, number]
  isSelected?: boolean
  onClick?: () => void
  onRotate?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
}

export const ProductRenderer: React.FC<ProductRendererProps> = ({
  product,
  products,
  position,
  rotation: baseRotation = [0, 0, 0],
  isSelected = false,
  onClick,
  onRotate,
  onDuplicate,
  onDelete,
}) => {
  const [hovered, setHovered] = useState(false)
  const orientationRotation = getOrientationRotation(product.orientation)
  const rotation: [number, number, number] = [
    baseRotation[0] + orientationRotation[0],
    baseRotation[1] + orientationRotation[1],
    baseRotation[2] + orientationRotation[2],
  ]

  const sharedProps = {
    product,
    position: [0, 0, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    onClick,
    onPointerOver: () => setHovered(true),
    onPointerOut: () => setHovered(false),
  }

  const renderProduct = () => {
    if (product.caseConfig) {
      const unitProduct = products.find(
        (catalogProduct) => catalogProduct.id === product.caseConfig?.unitProductId
      )
      if (unitProduct) {
        return (
          <ProductCase
            {...sharedProps}
            unitProduct={unitProduct}
          />
        )
      }
    }
    if (product.modelUrl) {
      return <GlbProductModel {...sharedProps} />
    }
    if (product.imageUrl) {
      return <TexturedBoxProduct {...sharedProps} />
    }
    return <BasicBoxProduct {...sharedProps} />
  }

  return (
    <ProductHoverEffect
      isSelected={isSelected}
      isHovered={hovered}
      productWidth={product.width}
      productHeight={product.height}
      productDepth={product.depth}
      position={position}
      rotation={rotation}
      onRotate={onRotate}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
    >
      {renderProduct()}
    </ProductHoverEffect>
  )
}
