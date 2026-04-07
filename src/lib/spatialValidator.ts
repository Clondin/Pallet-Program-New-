import type {
  FullValidationResult,
  PalletConfig,
  PlacementSuggestion,
  PlacedProduct,
  Product,
  TierConfig,
  WallConfig,
  WallFace,
} from '../types'
import { PALLET_WEIGHT_LIMIT } from './constants'
import { resolveProductDimensions, resolveProductWeight } from './dimensionEngine'
import { findAlternativePlacements } from './placementSuggestions'
import { derivePlacementFromSlotId } from './shelfCoordinates'

export interface ValidationResult {
  valid: boolean
  reason?: string
  suggestions?: PlacementSuggestion[]
}

export interface PlacementValidationContext {
  palletConfig: PalletConfig
  palletType: 'full' | 'half'
  tierConfigs: TierConfig[]
  wallConfigs: Record<WallFace, WallConfig>
  existingPlacements: PlacedProduct[]
  allProducts: Product[]
}

export interface PlacementValidationInput {
  wall: WallFace
  tier: number
  gridCol: number
  colSpan: number
  quantity: number
  displayMode: 'face-out' | 'spine-out'
}

function resolvePlacementFootprint(
  placement: Pick<
    PlacedProduct,
    'slotId' | 'wall' | 'tier' | 'gridCol' | 'colSpan' | 'displayMode'
  >,
  context: PlacementValidationContext,
) {
  if (
    placement.wall &&
    placement.tier &&
    placement.gridCol !== undefined
  ) {
    return {
      wall: placement.wall,
      tier: placement.tier,
      gridCol: placement.gridCol,
      colSpan: placement.colSpan ?? 1,
      displayMode: placement.displayMode ?? 'face-out',
    }
  }

  const derived = derivePlacementFromSlotId(
    placement.slotId,
    context.tierConfigs,
    context.palletType,
  )

  if (!derived) return null

  return {
    wall: derived.wall,
    tier: derived.tier,
    gridCol: derived.gridCol,
    colSpan: placement.colSpan ?? 1,
    displayMode: placement.displayMode ?? 'face-out',
  }
}

export function validateHeight(
  productHeight: number,
  tierConfig: TierConfig,
  tolerance: number = 0.5,
): ValidationResult {
  if (productHeight <= tierConfig.trayHeight + tolerance) {
    return { valid: true }
  }

  return {
    valid: false,
    reason: `Product is ${productHeight}" tall but Tier ${tierConfig.id} is only ${tierConfig.trayHeight}" tall. Product needs at least ${(productHeight - tolerance).toFixed(1)}" of clearance.`,
  }
}

export function validateWidth(
  gridCol: number,
  colSpan: number,
  totalColumns: number,
): ValidationResult {
  if (gridCol + colSpan <= totalColumns) {
    return { valid: true }
  }

  return {
    valid: false,
    reason: `Product spans ${colSpan} columns starting at column ${gridCol + 1}, but the wall only has ${totalColumns} columns. Product overflows by ${gridCol + colSpan - totalColumns} column(s).`,
  }
}

export function validateDepth(
  productDepth: number,
  shelfDepth: number,
  displayMode: 'face-out' | 'spine-out',
  productWidth: number,
  tolerance: number = 1,
): ValidationResult {
  const effectiveDepth =
    displayMode === 'spine-out' ? productWidth : productDepth

  if (effectiveDepth <= shelfDepth + tolerance) {
    return { valid: true }
  }

  return {
    valid: false,
    reason: `Product is ${effectiveDepth}" deep (${displayMode}) but shelf tray is only ${shelfDepth}" deep. Try rotating to ${displayMode === 'face-out' ? 'spine-out' : 'face-out'} or placing on a deeper shelf.`,
  }
}

export function validateNoCollision(
  wall: WallFace,
  tier: number,
  gridCol: number,
  colSpan: number,
  existingPlacements: PlacedProduct[],
  context: PlacementValidationContext,
  ignoreId?: string,
): ValidationResult {
  const newStart = gridCol
  const newEnd = gridCol + colSpan - 1

  const conflict = existingPlacements.find((placement) => {
    if (ignoreId && placement.id === ignoreId) return false

    const footprint = resolvePlacementFootprint(placement, context)
    if (!footprint) return false
    if (footprint.wall !== wall || footprint.tier !== tier) return false

    const existingStart = footprint.gridCol
    const existingEnd = footprint.gridCol + footprint.colSpan - 1
    return newStart <= existingEnd && existingStart <= newEnd
  })

  if (!conflict) {
    return { valid: true }
  }

  const conflictFootprint = resolvePlacementFootprint(conflict, context)
  return {
    valid: false,
    reason: `Columns ${gridCol + 1}-${gridCol + colSpan} on Tier ${tier} are occupied by placement at columns ${(conflictFootprint?.gridCol ?? 0) + 1}-${(conflictFootprint?.gridCol ?? 0) + (conflictFootprint?.colSpan ?? 1)}.`,
  }
}

export function validateWeight(
  newProductWeight: number,
  newQuantity: number,
  existingPlacements: PlacedProduct[],
  context: PlacementValidationContext,
  maxWeight: number = PALLET_WEIGHT_LIMIT,
): ValidationResult {
  const currentWeight = existingPlacements.reduce((sum, placement) => {
    const sourceProduct = placement.sourceProductId
      ? context.allProducts.find((product) => product.id === placement.sourceProductId)
      : undefined

    if (!sourceProduct) return sum

    return sum + resolveProductWeight(sourceProduct, context.allProducts) * (placement.quantity ?? 1)
  }, 0)

  const addedWeight = newProductWeight * newQuantity
  const newTotalWeight = currentWeight + addedWeight

  if (newTotalWeight <= maxWeight) {
    return { valid: true }
  }

  const remaining = maxWeight - currentWeight
  const maxQuantityThatFits = Math.max(0, Math.floor(remaining / newProductWeight))

  return {
    valid: false,
    reason: `Adding ${newQuantity} units (${addedWeight.toFixed(1)} lbs) would exceed the ${maxWeight} lb limit. Current weight: ${currentWeight.toFixed(1)} lbs. Remaining capacity: ${remaining.toFixed(1)} lbs.`,
    suggestions:
      maxQuantityThatFits > 0
        ? [
            {
              type: 'reduce-quantity',
              message: `Place ${maxQuantityThatFits} unit${maxQuantityThatFits === 1 ? '' : 's'} instead of ${newQuantity}`,
              maxQuantity: maxQuantityThatFits,
              priority: 1,
            },
          ]
        : undefined,
  }
}

export function validateWallType(
  wall: WallFace,
  wallConfig: WallConfig,
): ValidationResult {
  if (wallConfig.type === 'shelves') {
    return { valid: true }
  }

  return {
    valid: false,
    reason: `The ${wall} wall is configured as "${wallConfig.type}" — products can only be placed on shelf walls.`,
  }
}

export function validatePlacementCore(
  product: Product,
  placement: PlacementValidationInput,
  context: PlacementValidationContext,
  ignoreId?: string,
) {
  const dimensions = resolveProductDimensions(product, context.allProducts)
  const tierConfig = context.tierConfigs.find((tier) => tier.id === placement.tier)
  const wallConfig = context.wallConfigs[placement.wall]
  const errors: Array<{ rule: string; reason: string }> = []
  const warnings: Array<{ rule: string; reason: string }> = []
  const suggestions: PlacementSuggestion[] = []

  if (!tierConfig) {
    return {
      valid: false,
      errors: [{ rule: 'tier', reason: `Tier ${placement.tier} not found.` }],
      warnings,
      suggestions,
    }
  }

  const wallTypeResult = validateWallType(placement.wall, wallConfig)
  if (!wallTypeResult.valid) {
    errors.push({ rule: 'wall-type', reason: wallTypeResult.reason! })
  }

  const heightResult = validateHeight(dimensions.height, tierConfig)
  if (!heightResult.valid) {
    errors.push({ rule: 'height', reason: heightResult.reason! })
  } else if (dimensions.height > tierConfig.trayHeight * 0.9) {
    warnings.push({
      rule: 'height-tight',
      reason: `Product is ${dimensions.height}" tall in a ${tierConfig.trayHeight}" tray — tight fit.`,
    })
  }

  const widthResult = validateWidth(
    placement.gridCol,
    placement.colSpan,
    wallConfig.gridColumns,
  )
  if (!widthResult.valid) {
    errors.push({ rule: 'width', reason: widthResult.reason! })
  }

  const depthResult = validateDepth(
    dimensions.depth,
    tierConfig.shelfDepth || 10,
    placement.displayMode,
    dimensions.width,
  )
  if (!depthResult.valid) {
    errors.push({ rule: 'depth', reason: depthResult.reason! })
  }

  const collisionResult = validateNoCollision(
    placement.wall,
    placement.tier,
    placement.gridCol,
    placement.colSpan,
    context.existingPlacements,
    context,
    ignoreId,
  )
  if (!collisionResult.valid) {
    errors.push({ rule: 'collision', reason: collisionResult.reason! })
  }

  const maxWeight = context.palletConfig.maxWeight ?? PALLET_WEIGHT_LIMIT
  const weightResult = validateWeight(
    resolveProductWeight(product, context.allProducts),
    placement.quantity,
    context.existingPlacements,
    context,
    maxWeight,
  )
  if (!weightResult.valid) {
    errors.push({ rule: 'weight', reason: weightResult.reason! })
    if (weightResult.suggestions) suggestions.push(...weightResult.suggestions)
  }

  const currentWeight = context.existingPlacements.reduce((sum, existing) => {
    const sourceProduct = existing.sourceProductId
      ? context.allProducts.find((product) => product.id === existing.sourceProductId)
      : undefined
    if (!sourceProduct) return sum
    return sum + resolveProductWeight(sourceProduct, context.allProducts) * (existing.quantity ?? 1)
  }, 0)
  const projectedWeight = currentWeight + resolveProductWeight(product, context.allProducts) * placement.quantity

  if (projectedWeight > maxWeight * 0.8 && projectedWeight <= maxWeight) {
    warnings.push({
      rule: 'weight',
      reason: `Pallet is at ${((projectedWeight / maxWeight) * 100).toFixed(0)}% weight capacity.`,
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  }
}

export function validatePlacement(
  product: Product,
  placement: PlacementValidationInput,
  context: PlacementValidationContext,
  ignoreId?: string,
): FullValidationResult {
  const result = validatePlacementCore(product, placement, context, ignoreId)

  if (!result.valid) {
    const alternatives = findAlternativePlacements(
      product,
      placement,
      context,
      ignoreId,
    )
    return {
      ...result,
      suggestions: [...result.suggestions, ...alternatives].slice(0, 5),
    }
  }

  return result
}
