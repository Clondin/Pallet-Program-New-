import type { TierConfig, SlotGridItem, TrayFace } from '../types'

const platformThickness = 1

/**
 * Generate a uniform 2D grid for the editor view.
 * All faces get the same column count (based on tier width / fixed grid size).
 * This keeps the 2D shelf looking consistent regardless of which face is selected.
 */
export function generate2DSlotGrid(
  config: TierConfig,
  face: TrayFace,
  cols: number = 6
): SlotGridItem[] {
  const slots: SlotGridItem[] = []
  // Use a face-specific offset so slot IDs don't collide across faces
  const faceOffsets: Record<TrayFace, number> = {
    front: 0,
    back: 1000,
    left: 2000,
    right: 3000,
  }
  const baseIndex = faceOffsets[face]
  const gridSize = config.width / cols

  for (let c = 0; c < cols; c++) {
    const slotIndex = baseIndex + c
    const startX = -(cols * gridSize) / 2 + gridSize / 2
    slots.push({
      slotId: `${config.id}-${slotIndex}`,
      tierId: config.id,
      slotIndex,
      face,
      row: 0,
      col: c,
      position: [
        startX + c * gridSize,
        platformThickness,
        0,
      ],
      width: gridSize * 0.9,
      depth: gridSize * 0.9,
    })
  }

  return slots
}

/** Generate the full 3D slot grid (different dimensions per face for the 3D view). */
export function generateSlotGrid(config: TierConfig): SlotGridItem[] {
  const slots: SlotGridItem[] = []
  let slotIndex = 0
  const gridSize = config.slotGridSize

  // Front tray
  const frontTrayWidth = config.width
  const frontTrayDepth = config.shelfDepth
  const frontCols = Math.floor(frontTrayWidth / gridSize)
  const frontRows = Math.floor(frontTrayDepth / gridSize)
  const frontStartX = -(frontCols * gridSize) / 2 + gridSize / 2
  const frontCenterZ = config.depth / 2 - frontTrayDepth / 2
  const frontStartZ = frontCenterZ - (frontRows * gridSize) / 2 + gridSize / 2

  for (let r = 0; r < frontRows; r++) {
    for (let c = 0; c < frontCols; c++) {
      slots.push({
        slotId: `${config.id}-${slotIndex}`,
        tierId: config.id,
        slotIndex,
        face: 'front' as TrayFace,
        row: r,
        col: c,
        position: [
          frontStartX + c * gridSize,
          platformThickness,
          frontStartZ + r * gridSize,
        ],
        width: gridSize * 0.9,
        depth: gridSize * 0.9,
      })
      slotIndex++
    }
  }

  // Back tray
  const backCenterZ = -config.depth / 2 + frontTrayDepth / 2
  const backStartZ = backCenterZ - (frontRows * gridSize) / 2 + gridSize / 2

  for (let r = 0; r < frontRows; r++) {
    for (let c = 0; c < frontCols; c++) {
      slots.push({
        slotId: `${config.id}-${slotIndex}`,
        tierId: config.id,
        slotIndex,
        face: 'back' as TrayFace,
        row: r,
        col: c,
        position: [
          frontStartX + c * gridSize,
          platformThickness,
          backStartZ + r * gridSize,
        ],
        width: gridSize * 0.9,
        depth: gridSize * 0.9,
      })
      slotIndex++
    }
  }

  // Left tray (between front and back trays)
  const sideTrayWidth = config.shelfDepth
  const sideTrayDepth = config.depth - frontTrayDepth * 2
  const sideCols = Math.floor(sideTrayWidth / gridSize)
  const sideRows = Math.floor(sideTrayDepth / gridSize)
  const leftCenterX = -config.width / 2 + sideTrayWidth / 2
  const leftStartX = leftCenterX - (sideCols * gridSize) / 2 + gridSize / 2
  const sideStartZ = -(sideRows * gridSize) / 2 + gridSize / 2

  for (let r = 0; r < sideRows; r++) {
    for (let c = 0; c < sideCols; c++) {
      slots.push({
        slotId: `${config.id}-${slotIndex}`,
        tierId: config.id,
        slotIndex,
        face: 'left' as TrayFace,
        row: r,
        col: c,
        position: [
          leftStartX + c * gridSize,
          platformThickness,
          sideStartZ + r * gridSize,
        ],
        width: gridSize * 0.9,
        depth: gridSize * 0.9,
      })
      slotIndex++
    }
  }

  // Right tray
  const rightCenterX = config.width / 2 - sideTrayWidth / 2
  const rightStartX = rightCenterX - (sideCols * gridSize) / 2 + gridSize / 2

  for (let r = 0; r < sideRows; r++) {
    for (let c = 0; c < sideCols; c++) {
      slots.push({
        slotId: `${config.id}-${slotIndex}`,
        tierId: config.id,
        slotIndex,
        face: 'right' as TrayFace,
        row: r,
        col: c,
        position: [
          rightStartX + c * gridSize,
          platformThickness,
          sideStartZ + r * gridSize,
        ],
        width: gridSize * 0.9,
        depth: gridSize * 0.9,
      })
      slotIndex++
    }
  }

  return slots
}
