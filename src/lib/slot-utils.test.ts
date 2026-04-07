import {describe, expect, it} from 'vitest'
import {generate2DSlotGrid, generateSlotGrid} from './slot-utils'
import type {TierConfig} from '../types'

const tier: TierConfig = {
  id: 1,
  width: 46,
  depth: 38,
  height: 14,
  shelfDepth: 10,
  trayHeight: 14,
  yOffset: 0,
  slotGridSize: 6,
}

describe('slot-utils', () => {
  it('generates 2D slots with face-specific slot ids and even columns', () => {
    const slots = generate2DSlotGrid(tier, 'back', 4)

    expect(slots).toHaveLength(4)
    expect(slots[0]).toMatchObject({
      slotId: '1-1000',
      slotIndex: 1000,
      face: 'back',
      col: 0,
      row: 0,
    })
    expect(slots.at(-1)).toMatchObject({
      slotId: '1-1003',
      slotIndex: 1003,
      col: 3,
    })
    expect(slots.map((slot) => slot.position[0])).toEqual([-17.25, -5.75, 5.75, 17.25])
  })

  it('generates all four faces for a full pallet', () => {
    const slots = generateSlotGrid(tier, 'full')
    const counts = slots.reduce<Record<string, number>>((acc, slot) => {
      acc[slot.face] = (acc[slot.face] ?? 0) + 1
      return acc
    }, {})

    expect(slots).toHaveLength(20)
    expect(counts).toEqual({
      front: 7,
      back: 7,
      left: 3,
      right: 3,
    })
    expect(slots[0]).toMatchObject({
      slotId: '1-0',
      face: 'front',
      row: 0,
      col: 0,
      position: [-18, 1, 14],
    })
  })

  it('limits half pallets to the front tray only', () => {
    const slots = generateSlotGrid(tier, 'half')

    expect(slots).toHaveLength(7)
    expect(new Set(slots.map((slot) => slot.face))).toEqual(new Set(['front']))
  })
})
