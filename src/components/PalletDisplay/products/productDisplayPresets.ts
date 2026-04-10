import type { PlacedProduct } from '../../../types'

export interface ProductDisplayPreset {
  gap: number
  widthFill: number
  depthFill: number
  heightFill: number
  facingsCap: number
  rowsCap: number
  layersCap: number
  rowCompression: number
  layerCompression: number
  frontPackRatio: number
  xJitter: number
  zJitter: number
  yJitter: number
  yawJitter: number
  pitchJitter: number
  stackLeanPerRow: number
  stackLeanPerLayer: number
}

const DEFAULT_PRESET: ProductDisplayPreset = {
  gap: 0.14,
  widthFill: 0.98,
  depthFill: 0.95,
  heightFill: 1.02,
  facingsCap: 4,
  rowsCap: 3,
  layersCap: 2,
  rowCompression: 0.72,
  layerCompression: 0.82,
  frontPackRatio: 0.78,
  xJitter: 0.08,
  zJitter: 0.06,
  yJitter: 0.03,
  yawJitter: 0.04,
  pitchJitter: 0.02,
  stackLeanPerRow: 0.02,
  stackLeanPerLayer: 0.025,
}

type ProductPresetInput = Pick<
  PlacedProduct,
  'packaging' | 'label' | 'sku' | 'category' | 'caseConfig'
>

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term))
}

export function resolveProductDisplayPreset(
  product: ProductPresetInput,
): ProductDisplayPreset {
  if (product.caseConfig) {
    return {
      ...DEFAULT_PRESET,
      gap: 0,
      facingsCap: 1,
      rowsCap: 1,
      layersCap: 1,
      frontPackRatio: 0.9,
      xJitter: 0,
      zJitter: 0,
      yJitter: 0,
      yawJitter: 0,
      pitchJitter: 0,
      stackLeanPerRow: 0,
      stackLeanPerLayer: 0,
    }
  }

  const packaging = product.packaging ?? 'box'
  const label = product.label?.toLowerCase() ?? ''
  const sku = product.sku?.toLowerCase() ?? ''
  const category = product.category?.toLowerCase() ?? ''
  const combined = `${label} ${sku} ${category}`.trim()

  if (packaging === 'bottle') {
    return {
      ...DEFAULT_PRESET,
      gap: 0.06,
      widthFill: 0.995,
      depthFill: 0.9,
      heightFill: 1,
      facingsCap: 4,
      rowsCap: 2,
      layersCap: 1,
      rowCompression: 0.9,
      layerCompression: 1,
      frontPackRatio: 0.9,
      xJitter: 0.03,
      zJitter: 0.02,
      yJitter: 0.01,
      yawJitter: 0.015,
      pitchJitter: 0,
      stackLeanPerRow: 0,
      stackLeanPerLayer: 0,
    }
  }

  if (packaging === 'jar' || includesAny(combined, ['spread', 'sauce', 'condiment'])) {
    return {
      ...DEFAULT_PRESET,
      gap: 0.08,
      widthFill: 0.99,
      depthFill: 0.92,
      heightFill: 1,
      facingsCap: 4,
      rowsCap: 2,
      layersCap: 1,
      rowCompression: 0.84,
      layerCompression: 1,
      frontPackRatio: 0.88,
      xJitter: 0.03,
      zJitter: 0.03,
      yJitter: 0.01,
      yawJitter: 0.018,
      pitchJitter: 0,
      stackLeanPerRow: 0,
      stackLeanPerLayer: 0,
    }
  }

  if (packaging === 'bag') {
    return {
      ...DEFAULT_PRESET,
      gap: 0.07,
      widthFill: 0.99,
      depthFill: 0.97,
      heightFill: 1.08,
      facingsCap: 5,
      rowsCap: 4,
      layersCap: 3,
      rowCompression: 0.54,
      layerCompression: 0.52,
      frontPackRatio: 0.94,
      xJitter: 0.08,
      zJitter: 0.05,
      yJitter: 0.04,
      yawJitter: 0.04,
      pitchJitter: 0.05,
      stackLeanPerRow: 0.05,
      stackLeanPerLayer: 0.04,
    }
  }

  if (includesAny(combined, ['tea biscuit', 'biscuit', 'cookie', 'cracker', 'snack'])) {
    return {
      ...DEFAULT_PRESET,
      gap: 0.09,
      widthFill: 0.99,
      depthFill: 0.9,
      heightFill: 1.04,
      facingsCap: 3,
      rowsCap: 2,
      layersCap: 2,
      rowCompression: 0.68,
      layerCompression: 0.78,
      frontPackRatio: 0.9,
      xJitter: 0.04,
      zJitter: 0.03,
      yJitter: 0.02,
      yawJitter: 0.025,
      pitchJitter: 0.01,
      stackLeanPerRow: 0.01,
      stackLeanPerLayer: 0.015,
    }
  }

  if (includesAny(combined, ['ramen', 'noodle', 'pasta'])) {
    return {
      ...DEFAULT_PRESET,
      gap: 0.08,
      widthFill: 0.995,
      depthFill: 0.96,
      heightFill: 1.06,
      facingsCap: 4,
      rowsCap: 3,
      layersCap: 3,
      rowCompression: 0.62,
      layerCompression: 0.62,
      frontPackRatio: 0.92,
      xJitter: 0.05,
      zJitter: 0.04,
      yJitter: 0.03,
      yawJitter: 0.03,
      pitchJitter: 0.035,
      stackLeanPerRow: 0.035,
      stackLeanPerLayer: 0.03,
    }
  }

  return {
    ...DEFAULT_PRESET,
    gap: packaging === 'tin' ? 0.08 : DEFAULT_PRESET.gap,
    frontPackRatio: packaging === 'box' ? 0.85 : DEFAULT_PRESET.frontPackRatio,
  }
}

