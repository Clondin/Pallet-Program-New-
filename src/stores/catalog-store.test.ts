import {beforeEach, describe, expect, it} from 'vitest'
import {useCatalogStore} from './catalog-store'
import {makeProduct} from '../test/test-utils'

describe('catalog-store', () => {
  beforeEach(() => {
    useCatalogStore.getState().setProducts([
      makeProduct({
        id: 'prod-a',
        name: 'Olive Oil',
        sku: 'OIL-1',
        brand: 'tuscanini',
        brandColor: '#1B4D3E',
        category: 'Oils',
        holidayTags: ['rosh-hashanah'],
      }),
      makeProduct({
        id: 'prod-b',
        name: 'Matzo Meal',
        sku: 'MATZO-2',
        brand: 'kedem',
        brandColor: '#991B1B',
        category: 'Baking',
        holidayTags: ['pesach'],
      }),
      makeProduct({
        id: 'prod-c',
        name: 'Everyday Pasta',
        sku: 'PASTA-3',
        brand: 'osem',
        brandColor: '#059669',
        category: 'Pasta',
      }),
    ])
  })

  it('filters by search text, brand, category, and holiday', () => {
    const store = useCatalogStore.getState()

    store.setSearchQuery('matzo')
    expect(store.filteredProducts().some((product) => product.id === 'prod-b')).toBe(true)

    store.setSearchQuery('')
    store.setBrandFilter('kedem')
    store.setCategoryFilter('Baking')
    store.setHolidayFilter('pesach')

    expect(store.filteredProducts().some((product) => product.id === 'prod-b')).toBe(true)
  })

  it('adds, updates, deletes, and fetches products', () => {
    const store = useCatalogStore.getState()

    store.addProduct(
      makeProduct({
        id: 'prod-new',
        name: 'Grape Juice',
        sku: 'JUICE-4',
      })
    )
    expect(store.getProduct('prod-new')?.name).toBe('Grape Juice')
    expect(store.getProduct('prod-new-case-6')).toBeUndefined()
    expect(store.getProduct('prod-new-case-12')).toBeUndefined()
    expect(store.getProduct('prod-new-case-24')).toBeUndefined()

    store.updateProduct('prod-new', {category: 'Beverages'})
    expect(store.getProduct('prod-new')?.category).toBe('Beverages')

    store.deleteProduct('prod-new')
    expect(store.getProduct('prod-new')).toBeUndefined()
  })
})
