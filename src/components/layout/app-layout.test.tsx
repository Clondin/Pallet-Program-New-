import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it, vi} from 'vitest'
import {MemoryRouter, Route, Routes, useNavigate} from 'react-router-dom'
import {AppLayout} from './app-layout'
import {useDisplayStore} from '../../stores/display-store'

vi.mock('../Sidebar/sidebar', () => ({
  Sidebar: () => <div>Sidebar Stub</div>,
}))

vi.mock('../Toolbar/top-toolbar', () => ({
  TopToolbar: () => <div>Toolbar Stub</div>,
}))

function EditorScreen() {
  const navigate = useNavigate()
  return (
    <div>
      <div>Editor Screen</div>
      <button onClick={() => navigate('/catalog')}>Go Catalog</button>
    </div>
  )
}

describe('AppLayout', () => {
  it('shows the toolbar on editor routes and resets editor UI when leaving the editor', async () => {
    const user = userEvent.setup()

    useDisplayStore.setState({
      selectedSlotId: '1-0',
      selectedProductId: 'placed-1',
      ghostProduct: {
        slotId: '1-0',
        width: 1,
        height: 1,
        depth: 1,
        color: '#000',
        isValid: true,
      },
      isPickerOpen: true,
    })

    render(
      <MemoryRouter initialEntries={['/editor']}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/editor" element={<EditorScreen />} />
            <Route path="/catalog" element={<div>Catalog Screen</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Toolbar Stub')).toBeInTheDocument()

    await user.click(screen.getByRole('button', {name: 'Go Catalog'}))

    expect(screen.queryByText('Toolbar Stub')).not.toBeInTheDocument()
    expect(useDisplayStore.getState().selectedSlotId).toBeNull()
    expect(useDisplayStore.getState().selectedProductId).toBeNull()
    expect(useDisplayStore.getState().ghostProduct).toBeNull()
    expect(useDisplayStore.getState().isPickerOpen).toBe(false)
  })
})
