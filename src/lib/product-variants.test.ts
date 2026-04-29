import { describe, expect, it } from 'vitest'
import { makeProduct } from '../test/test-utils'
import { normalizeProductsWithVariants } from './product-variants'

describe('normalizeProductsWithVariants', () => {
  it('does not create fake generated case variants', () => {
    const products = normalizeProductsWithVariants([
      makeProduct({
        id: 'prod-rounded-case',
        sku: 'ROUND',
        weight: 4.79,
        width: 4.4,
        depth: 4.4,
        height: 10.5,
      }),
    ])

    expect(products).toHaveLength(1)
    expect(products[0].id).toBe('prod-rounded-case')
  })
})
