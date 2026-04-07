import React, { useState } from 'react'
import { PlacedProduct } from '../../../types'
import { GlbProductModel } from './GlbProductModel'
import { TexturedBoxProduct } from './TexturedBoxProduct'
import { BasicBoxProduct } from './BasicBoxProduct'
import { ProductHoverEffect } from './ProductHoverEffect'

interface ProductRendererProps {
  product: PlacedProduct
  position: [number, number, number]
  rotation?: [number, number, number]
  isSelected?: boolean
  isHovered?: boolean
  onClick?: () => void
  onPointerOver?: () => void
  onPointerOut?: () => void
}

export const ProductRenderer: React.FC<ProductRendererProps> = ({
  product,
  position,
  rotation = [0, 0, 0],
  isSelected = false,
  onClick,
}) => {
  const [hovered, setHovered] = useState(false)

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
    >
      {renderProduct()}
    </ProductHoverEffect>
  )
}
