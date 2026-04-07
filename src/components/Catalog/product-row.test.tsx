import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it, vi} from 'vitest'
import {ProductRow} from './product-row'
import {useCatalogStore} from '../../stores/catalog-store'
import {makeProduct} from '../../test/test-utils'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('ProductRow', () => {
  it('navigates on row click and deletes from the overflow menu without navigating', async () => {
    const user = userEvent.setup()
    const product = makeProduct({id: 'prod-row', name: 'Row Product'})
    useCatalogStore.getState().setProducts([product])

    render(
      <table>
        <tbody>
          <ProductRow product={product} />
        </tbody>
      </table>
    )

    await user.click(screen.getByText('Row Product'))
    expect(navigateMock).toHaveBeenCalledWith('/catalog/prod-row')

    navigateMock.mockClear()
    await user.click(screen.getByRole('button', {name: /More actions for Row Product/i}))
    await user.click(screen.getByRole('button', {name: /Delete/i}))

    expect(useCatalogStore.getState().getProduct('prod-row')).toBeUndefined()
    expect(navigateMock).not.toHaveBeenCalled()
  })
})
