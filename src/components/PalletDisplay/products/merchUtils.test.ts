import { describe, expect, it } from 'vitest'
import { deriveMerchBlockLayout } from './merchUtils'

describe('merchUtils', () => {
  it('packs short box products into dense merch blocks', () => {
    const layout = deriveMerchBlockLayout(
      {
        width: 6,
        height: 3,
        depth: 2,
        packaging: 'box',
        category: 'Snacks',
        label: 'Tea Biscuits',
        sku: 'KED-TBSC-1',
      },
      { width: 7.33, height: 14, depth: 10 },
    )

    expect(layout.facings).toBe(1)
    expect(layout.rows).toBeGreaterThan(1)
    expect(layout.layers).toBeGreaterThan(1)
    expect(layout.positions.length).toBe(
      layout.facings * layout.rows * layout.layers,
    )
  })

  it('keeps cases as a single merch unit', () => {
    const layout = deriveMerchBlockLayout(
      {
        width: 11.8,
        height: 10.4,
        depth: 8.05,
        packaging: 'box',
        caseConfig: {
          unitProductId: 'u',
          layout: { cols: 3, rows: 2, layers: 1 },
          caseStyle: 'open-top',
          innerPadding: 0.25,
          dividers: true,
        },
      },
      { width: 15, height: 14, depth: 10 },
    )

    expect(layout.renderStyle).toBe('case')
    expect(layout.positions).toHaveLength(1)
  })

  it('front-packs bottles with minimal variation', () => {
    const layout = deriveMerchBlockLayout(
      {
        width: 3.5,
        height: 12,
        depth: 3.5,
        packaging: 'bottle',
        category: 'Beverages',
        label: 'Kedem Grape Juice',
        sku: 'KED-GJ-1L',
      },
      { width: 14.66, height: 14, depth: 10 },
    )

    expect(layout.rows).toBeLessThanOrEqual(2)
    expect(layout.layers).toBe(1)
    expect(layout.positions[0]?.position[2]).toBeGreaterThan(1)
    expect(Math.abs(layout.positions[0]?.rotation[1] ?? 0)).toBeLessThan(0.02)
  })
})
