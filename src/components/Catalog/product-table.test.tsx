import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it} from 'vitest'
import {ProductTable} from './product-table'
import {makeProduct, renderWithRouter} from '../../test/test-utils'

describe('ProductTable', () => {
  it('paginates results and moves between pages', async () => {
    const user = userEvent.setup()
    const products = Array.from({length: 11}, (_, index) =>
      makeProduct({
        id: `prod-${index + 1}`,
        name: `Product ${index + 1}`,
        sku: `SKU-${index + 1}`,
      })
    )

    renderWithRouter(<ProductTable products={products} showAddForm={false} onCloseAddForm={() => {}} />)

    expect(screen.getByText('Showing 1–10 of 11')).toBeInTheDocument()
    expect(screen.getByText('Product 10')).toBeInTheDocument()
    expect(screen.queryByText('Product 11')).not.toBeInTheDocument()

    await user.click(screen.getAllByRole('button').at(-1)!)

    expect(screen.getByText('Showing 11–11 of 11')).toBeInTheDocument()
    expect(screen.getByText('Product 11')).toBeInTheDocument()
  })
})
