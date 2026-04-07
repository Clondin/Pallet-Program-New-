import type {
  PalletConfig,
  ProductDimensions,
  TierConfig,
  TrayFace,
  WallConfig,
  WallFace,
  PalletType,
} from '../types'
import {
  DEFAULT_GRID_COLUMNS,
  DEFAULT_SHELF_DEPTH,
  PLATFORM_THICKNESS,
  SHELF_SIDE_INSET,
} from './constants'

export interface ShelfPosition {
  position: [number, number, number]
  rotation: [number, number, number]
  availableSpace: {
    width: number
    height: number
    depth: number
  }
}

export interface DerivedPlacement {
  wall: WallFace
  tier: number
  gridCol: number
  row: number
  slotIndex: number
}

const FACE_OFFSETS: Record<TrayFace, number> = {
  front: 0,
  back: 1000,
  left: 2000,
  right: 3000,
}

export function buildTierConfigs(
  tierCount: number = 4,
  _maxDisplayHeight: number = 60,
  palletType: PalletType = 'full',
): TierConfig[] {
  const count = Math.max(2, Math.min(6, tierCount))
  const width = 46
  const depth = palletType === 'half' ? 20 : 38
  const shelfDepth = DEFAULT_SHELF_DEPTH
  const baseTrayHeight = 14
  const topTrayHeight = 7
  const baseSlotSize = 6
  const topSlotSize = 4
  const tiers: TierConfig[] = []

  let currentY = 0

  for (let i = 0; i < count; i += 1) {
    const progress = count > 1 ? i / (count - 1) : 0
    const trayHeight =
      baseTrayHeight - progress * (baseTrayHeight - topTrayHeight)
    const slotGridSize =
      baseSlotSize - progress * (baseSlotSize - topSlotSize)

    tiers.push({
      id: i + 1,
      width,
      depth,
      height: trayHeight,
      shelfDepth,
      trayHeight,
      yOffset: currentY,
      slotGridSize,
    })

    currentY += trayHeight + PLATFORM_THICKNESS
  }

  return tiers
}

export function createDefaultWallConfigs(
  palletType: PalletType,
  gridColumns: number = DEFAULT_GRID_COLUMNS,
): Record<WallFace, WallConfig> {
  return {
    front: { type: 'shelves', gridColumns },
    back: { type: palletType === 'half' ? 'branded-panel' : 'shelves', gridColumns },
    left: { type: palletType === 'half' ? 'branded-panel' : 'shelves', gridColumns },
    right: { type: palletType === 'half' ? 'branded-panel' : 'shelves', gridColumns },
  }
}

export function parseSlotId(slotId: string) {
  const [tierPart, slotPart] = slotId.split('-')
  const tier = Number.parseInt(tierPart, 10)
  const slotIndex = Number.parseInt(slotPart, 10)

  if (Number.isNaN(tier) || Number.isNaN(slotIndex)) {
    return null
  }

  return { tier, slotIndex }
}

export function derivePlacementFromSlotId(
  slotId: string,
  tierConfigs: TierConfig[],
  palletType: PalletType,
): DerivedPlacement | null {
  const parsed = parseSlotId(slotId)
  if (!parsed) return null

  const tier = tierConfigs.find((entry) => entry.id === parsed.tier)
  if (!tier) return null

  if (parsed.slotIndex >= FACE_OFFSETS.back) {
    const wall = (Object.entries(FACE_OFFSETS).find(
      ([, offset], index, entries) =>
        parsed.slotIndex >= offset &&
        (index === entries.length - 1 || parsed.slotIndex < entries[index + 1][1]),
    )?.[0] ?? 'front') as WallFace

    return {
      wall,
      tier: parsed.tier,
      gridCol: parsed.slotIndex - FACE_OFFSETS[wall],
      row: 0,
      slotIndex: parsed.slotIndex,
    }
  }

  const gridSize = tier.slotGridSize
  const frontCols = Math.floor(tier.width / gridSize)
  const frontRows = Math.max(1, Math.floor(tier.shelfDepth / gridSize))
  const frontCount = frontCols * frontRows

  if (parsed.slotIndex < frontCount) {
    return {
      wall: 'front',
      tier: parsed.tier,
      gridCol: parsed.slotIndex % frontCols,
      row: Math.floor(parsed.slotIndex / frontCols),
      slotIndex: parsed.slotIndex,
    }
  }

  if (palletType === 'half') return null

  const backStart = frontCount
  const backCount = frontCount
  if (parsed.slotIndex < backStart + backCount) {
    const local = parsed.slotIndex - backStart
    return {
      wall: 'back',
      tier: parsed.tier,
      gridCol: local % frontCols,
      row: Math.floor(local / frontCols),
      slotIndex: parsed.slotIndex,
    }
  }

  const sideCols = Math.max(1, Math.floor(tier.shelfDepth / gridSize))
  const sideRows = Math.max(
    1,
    Math.floor((tier.depth - tier.shelfDepth * 2) / gridSize),
  )
  const sideCount = sideCols * sideRows
  const leftStart = backStart + backCount

  if (parsed.slotIndex < leftStart + sideCount) {
    const local = parsed.slotIndex - leftStart
    return {
      wall: 'left',
      tier: parsed.tier,
      gridCol: Math.floor(local / sideCols),
      row: local % sideCols,
      slotIndex: parsed.slotIndex,
    }
  }

  const rightStart = leftStart + sideCount
  if (parsed.slotIndex < rightStart + sideCount) {
    const local = parsed.slotIndex - rightStart
    return {
      wall: 'right',
      tier: parsed.tier,
      gridCol: Math.floor(local / sideCols),
      row: local % sideCols,
      slotIndex: parsed.slotIndex,
    }
  }

  return null
}

export function getShelfPosition(
  placement: {
    wall: WallFace
    tier: number
    gridCol: number
    colSpan: number
    displayMode: 'face-out' | 'spine-out'
  },
  productDimensions: ProductDimensions,
  palletConfig: PalletConfig,
  tierConfigs: TierConfig[],
  wallConfig: WallConfig,
): ShelfPosition {
  const tier = tierConfigs.find((entry) => entry.id === placement.tier)
  if (!tier) {
    throw new Error(`Tier ${placement.tier} not found`)
  }

  const shelfDepth = tier.shelfDepth || DEFAULT_SHELF_DEPTH
  const wallWidth =
    placement.wall === 'front' || placement.wall === 'back'
      ? palletConfig.base.width - SHELF_SIDE_INSET * 2
      : palletConfig.base.depth - SHELF_SIDE_INSET * 2

  const cellWidth = wallWidth / wallConfig.gridColumns
  const slotWidth = cellWidth * placement.colSpan
  const yBase = palletConfig.base.height + tier.yOffset + PLATFORM_THICKNESS
  const slotCenter =
    -wallWidth / 2 + placement.gridCol * cellWidth + slotWidth / 2

  const displayHalfWidth = (palletConfig.base.width - SHELF_SIDE_INSET * 2) / 2
  const displayHalfDepth = (palletConfig.base.depth - SHELF_SIDE_INSET * 2) / 2

  let position: [number, number, number]
  let rotation: [number, number, number]

  switch (placement.wall) {
    case 'front':
      position = [slotCenter, yBase, displayHalfDepth - shelfDepth / 2]
      rotation = [0, 0, 0]
      break
    case 'back':
      position = [-slotCenter, yBase, -(displayHalfDepth - shelfDepth / 2)]
      rotation = [0, Math.PI, 0]
      break
    case 'left':
      position = [-(displayHalfWidth - shelfDepth / 2), yBase, -slotCenter]
      rotation = [0, Math.PI / 2, 0]
      break
    case 'right':
      position = [displayHalfWidth - shelfDepth / 2, yBase, slotCenter]
      rotation = [0, -Math.PI / 2, 0]
      break
  }

  if (placement.displayMode === 'spine-out') {
    rotation = [rotation[0], rotation[1] + Math.PI / 2, rotation[2]]
  }

  const effectiveDepth =
    placement.displayMode === 'spine-out'
      ? productDimensions.width
      : productDimensions.depth

  return {
    position,
    rotation,
    availableSpace: {
      width: slotWidth,
      height: tier.trayHeight,
      depth: Math.max(shelfDepth, effectiveDepth),
    },
  }
}
