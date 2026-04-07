import type { PlacementSuggestion, Product } from '../types'
import { getEffectiveColSpan } from './colSpanCalculator'
import type {
  PlacementValidationContext,
  PlacementValidationInput,
} from './spatialValidator'
import { validatePlacementCore } from './spatialValidator'

export function findAlternativePlacements(
  product: Product,
  originalPlacement: PlacementValidationInput,
  context: PlacementValidationContext,
  ignoreId?: string,
) {
  const suggestions: PlacementSuggestion[] = []
  const wallFaces = Object.keys(context.wallConfigs) as Array<keyof typeof context.wallConfigs>

  if (originalPlacement.displayMode === 'face-out') {
    const rotatedColSpan = getEffectiveColSpan(
      product,
      'spine-out',
      context.wallConfigs[originalPlacement.wall],
      originalPlacement.wall,
      context.palletConfig,
      context.allProducts,
    )

    const rotatedResult = validatePlacementCore(
      product,
      {
        ...originalPlacement,
        colSpan: rotatedColSpan,
        displayMode: 'spine-out',
      },
      context,
      ignoreId,
    )

    if (rotatedResult.valid) {
      suggestions.push({
        type: 'rotate',
        message: 'Rotate to spine-out — fits at same position',
        displayMode: 'spine-out',
        wall: originalPlacement.wall,
        tier: originalPlacement.tier,
        gridCol: originalPlacement.gridCol,
        priority: 1,
      })
    }
  }

  const sameWall = context.wallConfigs[originalPlacement.wall]
  if (sameWall.type === 'shelves') {
    for (
      let gridCol = 0;
      gridCol <= sameWall.gridColumns - originalPlacement.colSpan;
      gridCol += 1
    ) {
      if (gridCol === originalPlacement.gridCol) continue
      const result = validatePlacementCore(
        product,
        { ...originalPlacement, gridCol },
        context,
        ignoreId,
      )
      if (result.valid) {
        suggestions.push({
          type: 'alternative-position',
          message: `Column ${gridCol + 1} on Tier ${originalPlacement.tier} (${originalPlacement.wall} wall)`,
          wall: originalPlacement.wall,
          tier: originalPlacement.tier,
          gridCol,
          priority: 2,
        })
      }
    }
  }

  for (const tier of context.tierConfigs) {
    if (tier.id === originalPlacement.tier) continue

    for (
      let gridCol = 0;
      gridCol <= sameWall.gridColumns - originalPlacement.colSpan;
      gridCol += 1
    ) {
      const result = validatePlacementCore(
        product,
        { ...originalPlacement, tier: tier.id, gridCol },
        context,
        ignoreId,
      )

      if (result.valid) {
        suggestions.push({
          type: 'alternative-tier',
          message: `Tier ${tier.id} column ${gridCol + 1} (${originalPlacement.wall} wall)`,
          wall: originalPlacement.wall,
          tier: tier.id,
          gridCol,
          priority: 3,
        })
        break
      }
    }
  }

  for (const wall of wallFaces) {
    if (wall === originalPlacement.wall) continue
    const wallConfig = context.wallConfigs[wall]
    if (wallConfig.type !== 'shelves') continue

    const colSpan = getEffectiveColSpan(
      product,
      originalPlacement.displayMode,
      wallConfig,
      wall,
      context.palletConfig,
      context.allProducts,
    )

    for (const tier of context.tierConfigs) {
      for (let gridCol = 0; gridCol <= wallConfig.gridColumns - colSpan; gridCol += 1) {
        const result = validatePlacementCore(
          product,
          {
            wall,
            tier: tier.id,
            gridCol,
            colSpan,
            quantity: originalPlacement.quantity,
            displayMode: originalPlacement.displayMode,
          },
          context,
          ignoreId,
        )
        if (result.valid) {
          suggestions.push({
            type: 'alternative-wall',
            message: `${wall[0].toUpperCase()}${wall.slice(1)} wall, Tier ${tier.id}, column ${gridCol + 1}`,
            wall,
            tier: tier.id,
            gridCol,
            priority: 4,
          })
          break
        }
      }
      if (suggestions.some((suggestion) => suggestion.wall === wall)) {
        break
      }
    }
  }

  return suggestions.sort((a, b) => a.priority - b.priority).slice(0, 5)
}
