import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TierRow } from './tier-row'
import { useDisplayStore } from '../../stores/display-store'
import { makeProject } from '../../test/test-utils'
import type { SlotGridItem, TierConfig } from '../../types'

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

const slots: SlotGridItem[] = [
  { slotId: '1-0', tierId: 1, slotIndex: 0, face: 'front', row: 0, col: 0, position: [0, 0, 0], width: 6, depth: 6 },
  { slotId: '1-1', tierId: 1, slotIndex: 1, face: 'front', row: 0, col: 1, position: [0, 0, 0], width: 6, depth: 6 },
  { slotId: '1-2', tierId: 1, slotIndex: 2, face: 'front', row: 0, col: 2, position: [0, 0, 0], width: 6, depth: 6 },
]

describe('TierRow', () => {
  it('renders spanning placements once and applies the grid span', () => {
    useDisplayStore.setState({
      currentProject: makeProject({
        placements: [
          {
            id: 'placed-1',
            slotId: '1-0',
            width: 12,
            height: 6,
            depth: 6,
            color: '#991B1B',
            label: 'Wide Case',
            sku: 'WIDE',
            colSpan: 2,
          },
        ],
      }),
    })

    const { container } = render(
      <TierRow
        tier={tier}
        slots={slots}
        colCount={3}
        tierIndex={0}
        totalTiers={1}
      />,
    )

    expect(screen.getAllByText('Wide Case')).toHaveLength(2)
    expect(container.querySelectorAll('[style*="grid-column: span 2"]').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('svg').length).toBe(1)
  })
})
