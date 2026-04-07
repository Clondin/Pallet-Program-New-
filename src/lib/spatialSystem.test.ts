import { describe, expect, it } from 'vitest'
import type { PalletConfig, Product, ProductDimensions, TierConfig, WallConfig } from '../types'
import { calculateCaseDimensions, resolveProductDimensions } from './dimensionEngine'
import { getEffectiveColSpan } from './colSpanCalculator'
import { createDefaultWallConfigs, getShelfPosition } from './shelfCoordinates'
import { validatePlacement } from './spatialValidator'

const palletConfig: PalletConfig = {
  base: {
    width: 48,
    depth: 40,
    height: 6,
  },
  maxWeight: 2500,
}

const tierConfigs: TierConfig[] = [
  {
    id: 1,
    width: 46,
    depth: 38,
    height: 14,
    shelfDepth: 10,
    trayHeight: 14,
    yOffset: 0,
    slotGridSize: 6,
  },
  {
    id: 2,
    width: 46,
    depth: 38,
    height: 12,
    shelfDepth: 10,
    trayHeight: 12,
    yOffset: 15,
    slotGridSize: 5.5,
  },
  {
    id: 4,
    width: 46,
    depth: 38,
    height: 7,
    shelfDepth: 10,
    trayHeight: 7,
    yOffset: 40,
    slotGridSize: 4,
  },
]

const wallConfigs: Record<'front' | 'back' | 'left' | 'right', WallConfig> =
  createDefaultWallConfigs('full', 6)

const singleBottle: Product = {
  id: 'ked-bottle',
  name: 'Kedem 1L',
  sku: 'KED-1L',
  brand: 'kedem',
  brandColor: '#991B1B',
  category: 'Juice',
  width: 3.5,
  height: 12,
  depth: 3.5,
  weight: 3,
  packaging: 'bottle',
  holidayTags: ['none'],
}

const twelvePack: Product = {
  id: 'ked-case-12',
  name: 'Kedem 12 Pack',
  sku: 'KED-12',
  brand: 'kedem',
  brandColor: '#991B1B',
  category: 'Juice',
  width: 0,
  height: 0,
  depth: 0,
  weight: 0,
  packaging: 'box',
  holidayTags: ['none'],
  caseConfig: {
    unitProductId: 'ked-bottle',
    layout: { cols: 4, rows: 3, layers: 1 },
    caseStyle: 'open-top',
    innerPadding: 0.25,
    dividers: true,
  },
}

describe('spatial system', () => {
  it('calculates case dimensions and honors manual overrides', () => {
    const dimensions = calculateCaseDimensions(
      {
        width: singleBottle.width,
        height: singleBottle.height,
        depth: singleBottle.depth,
        source: 'manual',
      },
      { cols: 4, rows: 3, layers: 1 },
      0.25,
      true,
    )

    expect(dimensions.source).toBe('calculated')
    expect(dimensions.width).toBeCloseTo(15.79, 2)
    expect(dimensions.depth).toBeCloseTo(11.96, 2)

    const overridden = resolveProductDimensions(
      {
        ...twelvePack,
        caseConfig: {
          ...twelvePack.caseConfig!,
          dimensionOverride: { width: 12 },
        },
      },
      [singleBottle, twelvePack],
    )

    expect(overridden.width).toBe(12)
    expect(overridden.source).toBe('manual')
  })

  it('rejects tall products from short trays and suggests better tiers', () => {
    const result = validatePlacement(
      singleBottle,
      {
        wall: 'front',
        tier: 4,
        gridCol: 0,
        colSpan: getEffectiveColSpan(
          singleBottle,
          'face-out',
          wallConfigs.front,
          'front',
          palletConfig,
          [singleBottle, twelvePack],
        ),
        quantity: 1,
        displayMode: 'face-out',
      },
      {
        palletConfig,
        palletType: 'full',
        tierConfigs,
        wallConfigs,
        existingPlacements: [],
        allProducts: [singleBottle, twelvePack],
      },
    )

    expect(result.valid).toBe(false)
    expect(result.errors[0].rule).toBe('height')
    expect(result.suggestions.some((suggestion) => suggestion.type === 'alternative-tier')).toBe(true)
  })

  it('rejects width overflow near the end of the wall', () => {
    const colSpan = getEffectiveColSpan(
      twelvePack,
      'face-out',
      wallConfigs.front,
      'front',
      palletConfig,
      [singleBottle, twelvePack],
    )

    const result = validatePlacement(
      twelvePack,
      {
        wall: 'front',
        tier: 1,
        gridCol: 5,
        colSpan,
        quantity: 1,
        displayMode: 'face-out',
      },
      {
        palletConfig,
        palletType: 'full',
        tierConfigs,
        wallConfigs,
        existingPlacements: [],
        allProducts: [singleBottle, twelvePack],
      },
    )

    expect(result.valid).toBe(false)
    expect(result.errors.some((error) => error.rule === 'width')).toBe(true)
  })

  it('uses spine-out rotation to reduce col span when depth is smaller than width', () => {
    const wideProduct: Product = {
      ...singleBottle,
      id: 'wide-box',
      width: 12,
      depth: 6,
      packaging: 'box',
    }

    const faceOut = getEffectiveColSpan(
      wideProduct,
      'face-out',
      wallConfigs.front,
      'front',
      palletConfig,
      [wideProduct],
    )
    const spineOut = getEffectiveColSpan(
      wideProduct,
      'spine-out',
      wallConfigs.front,
      'front',
      palletConfig,
      [wideProduct],
    )

    expect(faceOut).toBe(2)
    expect(spineOut).toBe(1)
  })

  it('returns outward-facing shelf transforms for side walls', () => {
    const position = getShelfPosition(
      {
        wall: 'right',
        tier: 1,
        gridCol: 2,
        colSpan: 1,
        displayMode: 'face-out',
      },
      {
        width: 8,
        height: 4,
        depth: 6,
        source: 'manual',
      } satisfies ProductDimensions,
      palletConfig,
      tierConfigs,
      wallConfigs.right,
    )

    expect(position.rotation).toEqual([0, -Math.PI / 2, 0])
    expect(position.position[0]).toBeGreaterThan(0)
  })
})
