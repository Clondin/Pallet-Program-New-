import type {
  PalletConfig,
  Product,
  WallConfig,
  WallFace,
} from '../types'
import { SHELF_SIDE_INSET } from './constants'
import { resolveProductDimensions } from './dimensionEngine'

export function getWallWidth(
  wallFace: WallFace,
  palletConfig: PalletConfig,
) {
  return wallFace === 'front' || wallFace === 'back'
    ? palletConfig.base.width - SHELF_SIDE_INSET * 2
    : palletConfig.base.depth - SHELF_SIDE_INSET * 2
}

export function getColSpan(
  productWidth: number,
  wallConfig: WallConfig,
  wallFace: WallFace,
  palletConfig: PalletConfig,
): number {
  const wallWidth = getWallWidth(wallFace, palletConfig)
  const cellWidth = wallWidth / wallConfig.gridColumns

  return Math.max(
    1,
    Math.min(wallConfig.gridColumns, Math.ceil(productWidth / cellWidth)),
  )
}

export function getEffectiveColSpan(
  product: Product,
  displayMode: 'face-out' | 'spine-out',
  wallConfig: WallConfig,
  wallFace: WallFace,
  palletConfig: PalletConfig,
  allProducts: Product[],
): number {
  const dimensions = resolveProductDimensions(product, allProducts)
  const effectiveWidth =
    displayMode === 'spine-out' ? dimensions.depth : dimensions.width

  return getColSpan(effectiveWidth, wallConfig, wallFace, palletConfig)
}
