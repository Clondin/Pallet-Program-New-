import React, { useState } from 'react'
import { PlacedProduct } from '../../../types'
import { getOrientationRotation } from '../../../lib/orientation-presets'
import { GlbProductModel } from './GlbProductModel'
import { TexturedBoxProduct } from './TexturedBoxProduct'
import { BasicBoxProduct } from './BasicBoxProduct'
import { ProductHoverEffect } from './ProductHoverEffect'

interface ProductRendererProps {
  product: PlacedProduct
  position: [number, number, number]
  isSelected?: boolean
  onClick?: () => void
  onRotate?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
}

export const ProductRenderer: React.FC<ProductRendererProps> = ({
  product,
  position,
  isSelected = false,
  onClick,
  onRotate,
  onDuplicate,
  onDelete,
}) => {
  const [hovered, setHovered] = useState(false)
  const rotation = getOrientationRotation(product.orientation)

  const sharedProps = {
    product,
    position,
    rotation,
    onClick,
    onPointerOver: () => setHovered(true),
    onPointerOut: () => setHovered(false),
  }

  const renderProduct = () => {
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
      onRotate={onRotate}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
    >
      {renderProduct()}
    </ProductHoverEffect>
  )
}
