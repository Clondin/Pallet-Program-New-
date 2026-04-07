import { describe, expect, it } from 'vitest'
import {
  calculateCaseDimensions,
  calculateItemPositions,
  getCaseItemCount,
  getCaseWeight,
} from './caseUtils'

describe('caseUtils', () => {
  it('calculates case dimensions and total item count from a layout', () => {
    const dimensions = calculateCaseDimensions(
      { width: 3.5, height: 10, depth: 3.5 },
      { cols: 3, rows: 2, layers: 1 }
    )

    expect(dimensions.width).toBeCloseTo(11.8)
    expect(dimensions.height).toBeCloseTo(10.4)
    expect(dimensions.depth).toBeCloseTo(8.05)
    expect(getCaseItemCount({ cols: 3, rows: 2, layers: 1 })).toBe(6)
    expect(getCaseWeight(2.4, { cols: 3, rows: 2, layers: 1 })).toBeCloseTo(15.9)
  })

  it('places items in a stable grid inside the case interior', () => {
    const positions = calculateItemPositions(
      { width: 11.8, height: 10.4, depth: 7.85 },
      { width: 3.5, height: 10, depth: 3.5 },
      { cols: 3, rows: 2, layers: 1 },
      0.25
    )

    expect(positions).toHaveLength(6)
    expect(positions[0][0]).toBeLessThan(positions[1][0])
    expect(positions[0][2]).toBeLessThan(positions[3][2])
    expect(positions[0][1]).toBeCloseTo(0.4)
  })
})
