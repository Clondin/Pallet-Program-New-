import {fireEvent, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it, vi} from 'vitest'
import {SettingsPage} from './settings-page'
import {DEFAULT_SETTINGS, useAppSettingsStore} from '../stores/app-settings-store'
import {renderWithRouter} from '../test/test-utils'

describe('SettingsPage', () => {
  it('updates settings across tabs and resets them to defaults', async () => {
    const user = userEvent.setup()

    renderWithRouter(<SettingsPage />, {route: '/settings'})

    await user.click(screen.getByRole('button', {name: '3D first'}))
    await user.click(screen.getByRole('button', {name: 'Right'}))
    await user.click(screen.getByRole('button', {name: 'Top'}))
    fireEvent.change(screen.getByRole('slider'), {target: {value: '8'}})

    await user.click(screen.getByRole('button', {name: /3D Viewer/i}))
    await user.click(screen.getByRole('button', {name: /Slot Grid Overlay/i}))
    await user.click(screen.getByRole('button', {name: /Studio/i}))

    await user.click(screen.getByRole('button', {name: /Persistence/i}))
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

    await user.click(screen.getByRole('button', {name: /Reset Defaults/i}))
    expect(screen.getByRole('button', {name: /Defaults Restored/i})).toBeInTheDocument()
    expect(useAppSettingsStore.getState().settings).toEqual(DEFAULT_SETTINGS)
  })
})
