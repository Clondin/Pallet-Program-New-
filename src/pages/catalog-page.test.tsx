import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it} from 'vitest'
import {CatalogPage} from './catalog-page'
import {useCatalogStore} from '../stores/catalog-store'
import {renderWithRouter} from '../test/test-utils'

describe('CatalogPage', () => {
  it('loads mock products, filters them, and adds a new product', async () => {
    const user = userEvent.setup()
    renderWithRouter(<CatalogPage />, {route: '/catalog'})

    await waitFor(() => {
      expect(useCatalogStore.getState().products.length).toBeGreaterThan(0)
    })

    expect(screen.getByText(/products in workspace/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', {name: 'Holiday Tagged'}))
    expect(screen.getByText('Matzo Ball Mix')).toBeInTheDocument()

    await user.click(screen.getByRole('button', {name: 'All Products'}))
    await user.type(screen.getByPlaceholderText('Search by name, SKU or brand...'), 'Tea Biscuits')
    expect(screen.getByText('Tea Biscuits')).toBeInTheDocument()
    expect(screen.queryByText('Matzo Ball Mix')).not.toBeInTheDocument()

    await user.clear(screen.getByPlaceholderText('Search by name, SKU or brand...'))
    await user.click(screen.getByRole('button', {name: /New Product/i}))

    await user.type(screen.getByPlaceholderText('e.g. Extra Virgin Olive Oil 750ml'), 'New Honey Cake')
    await user.type(screen.getByPlaceholderText('e.g. TUS-EVOO-750'), 'CAKE-123')
    await user.type(screen.getByPlaceholderText('e.g. Oils'), 'Bakery')
    await user.click(screen.getByRole('radio', {name: 'RH'}))
    await user.click(screen.getByRole('button', {name: /Add Product/i}))

    expect(useCatalogStore.getState().products.some((product) => product.name === 'New Honey Cake')).toBe(true)

    await user.type(screen.getByPlaceholderText('Search by name, SKU or brand...'), 'New Honey Cake')
    expect(screen.getByText('New Honey Cake')).toBeInTheDocument()
  })
})
