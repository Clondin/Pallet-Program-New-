import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {RetailersPage} from './retailers-page'
import {useRetailerStore} from '../stores/retailer-store'
import {makeRetailer, renderWithRouter} from '../test/test-utils'

describe('RetailersPage', () => {
  beforeEach(() => {
    useRetailerStore.getState().setRetailers([
      makeRetailer({
        id: 'ret-1',
        name: 'Alpha Stores',
        tier: 'enterprise',
        status: 'active',
        headquartersCity: 'Queens',
      }),
      makeRetailer({
        id: 'ret-2',
        name: 'Beta Market',
        tier: 'premium',
        status: 'pending',
        headquartersCity: 'Miami',
      }),
    ])
  })

  it('filters retailers and supports add, edit, and delete flows', async () => {
    const user = userEvent.setup()
    renderWithRouter(<RetailersPage />, {route: '/retailers'})

    await user.type(screen.getByPlaceholderText('Search retailers, cities, managers...'), 'Queens')
    expect(screen.getByText('Alpha Stores')).toBeInTheDocument()
    expect(screen.queryByText('Beta Market')).not.toBeInTheDocument()

    await user.clear(screen.getByPlaceholderText('Search retailers, cities, managers...'))
    await user.click(screen.getByRole('button', {name: /Add Retailer/i}))

    await user.type(screen.getByPlaceholderText('e.g. Walmart'), 'Gamma Wholesale')
    await user.click(screen.getAllByRole('button', {name: /^Add Retailer$/i})[1])

    expect(useRetailerStore.getState().retailers.some((retailer) => retailer.name === 'Gamma Wholesale')).toBe(true)

    await user.click(screen.getAllByRole('button', {name: /Edit/i})[0])
    const nameInput = screen.getByDisplayValue('Alpha Stores')
    await user.clear(nameInput)
    await user.type(nameInput, 'Alpha Updated')
    await user.click(screen.getByRole('button', {name: /Save Changes/i}))

    expect(useRetailerStore.getState().getRetailer('ret-1')?.name).toBe('Alpha Updated')

    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await user.click(screen.getByRole('button', {name: 'Delete Alpha Updated'}))

    expect(useRetailerStore.getState().retailers).toHaveLength(2)
    expect(useRetailerStore.getState().getRetailer('ret-1')).toBeUndefined()
  })
})
