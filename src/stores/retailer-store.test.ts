import { describe, expect, it } from 'vitest'
import { useRetailerStore } from './retailer-store'
import { makeRetailer } from '../test/test-utils'

describe('retailer-store', () => {
  it('adds, updates, and removes authorized items', () => {
    useRetailerStore.getState().setRetailers([makeRetailer({ id: 'ret-1', authorizedItems: [] })])

    useRetailerStore.getState().addAuthorizedItem('ret-1', {
      productId: 'prod-1',
      productName: 'Extra Virgin Olive Oil 750ml',
      sku: 'TUS-EVOO-750',
      brand: 'tuscanini',
      status: 'authorized',
      authorizedDate: '2026-04-19',
      avgMonthlyUnits: 0,
      marginPercent: 0,
    })

    expect(useRetailerStore.getState().getRetailer('ret-1')?.authorizedItems).toHaveLength(1)

    useRetailerStore.getState().updateAuthorizedItemStatus('ret-1', 'prod-1', 'pending')
    expect(useRetailerStore.getState().getRetailer('ret-1')?.authorizedItems[0]?.status).toBe(
      'pending',
    )

    useRetailerStore.getState().removeAuthorizedItem('ret-1', 'prod-1')
    expect(useRetailerStore.getState().getRetailer('ret-1')?.authorizedItems).toHaveLength(0)
  })
})
