import {fireEvent, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it} from 'vitest'
import {SettingsPage} from './settings-page'
import {DEFAULT_SETTINGS, useAppSettingsStore} from '../stores/app-settings-store'
import {renderWithRouter} from '../test/test-utils'

describe('SettingsPage', () => {
  it('updates general settings', async () => {
    const user = userEvent.setup()
    renderWithRouter(<SettingsPage />, {route: '/settings'})

    // General tab is active by default
    const companyInput = screen.getByPlaceholderText(/KAYCO/i)
    await user.clear(companyInput)
    await user.type(companyInput, 'Test Corp')
    await user.click(screen.getByRole('button', {name: /Kedem/i}))
    await user.click(screen.getByRole('button', {name: /Metric/i}))

    expect(useAppSettingsStore.getState().settings).toMatchObject({
      companyName: 'Test Corp',
      defaultBrand: 'kedem',
      unitSystem: 'metric',
    })
  })

  it('updates pallet default settings', async () => {
    const user = userEvent.setup()
    renderWithRouter(<SettingsPage />, {route: '/settings'})

    await user.click(screen.getByRole('button', {name: /Pallet Defaults/i}))
    await user.click(screen.getByRole('button', {name: /Half Pallet/i}))
    await user.click(screen.getByRole('button', {name: /Pesach/i}))

    expect(useAppSettingsStore.getState().settings).toMatchObject({
      defaultPalletType: 'half',
      defaultHoliday: 'pesach',
    })
  })

  it('updates editor and viewer settings and resets to defaults', async () => {
    const user = userEvent.setup()
    renderWithRouter(<SettingsPage />, {route: '/settings'})

    // Editor tab
    await user.click(screen.getByRole('button', {name: /^Editor$/i}))
    await user.click(screen.getByRole('button', {name: '3D first'}))
    await user.click(screen.getByRole('button', {name: 'Right'}))
    await user.click(screen.getByRole('button', {name: 'Top'}))
    fireEvent.change(screen.getByRole('slider'), {target: {value: '8'}})

    // 3D Viewer tab
    await user.click(screen.getByRole('button', {name: /3D Viewer/i}))
    await user.click(screen.getByRole('button', {name: /Slot Grid Overlay/i}))
    await user.click(screen.getByRole('button', {name: /Studio/i}))

    // Data tab
    await user.click(screen.getByRole('button', {name: /^Data$/i}))
    await user.click(screen.getByRole('button', {name: /Project Auto-Save/i}))

    expect(useAppSettingsStore.getState().settings).toMatchObject({
      defaultViewMode: '3d',
      defaultFace: 'right',
      defaultCameraPreset: 'top',
      editorGridColumns: 8,
      show3DSlotGrid: false,
      displayEnvironment: 'studio',
      autoSaveProject: false,
    })

    // Reset
    await user.click(screen.getByRole('button', {name: /Reset Defaults/i}))
    expect(screen.getByRole('button', {name: /Defaults Restored/i})).toBeInTheDocument()
    expect(useAppSettingsStore.getState().settings).toEqual(DEFAULT_SETTINGS)
  })
})
