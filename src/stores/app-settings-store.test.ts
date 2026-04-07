import {describe, expect, it} from 'vitest'
import {
  APP_SETTINGS_STORAGE_KEY,
  DEFAULT_SETTINGS,
  getAppSettingsSnapshot,
  useAppSettingsStore,
} from './app-settings-store'

describe('app-settings-store', () => {
  it('updates settings, clamps grid columns, and persists to localStorage', () => {
    useAppSettingsStore.getState().updateSettings({
      defaultViewMode: '3d',
      editorGridColumns: 99,
      show3DHeader: false,
    })

    expect(getAppSettingsSnapshot()).toMatchObject({
      defaultViewMode: '3d',
      editorGridColumns: 8,
      show3DHeader: false,
    })

    expect(JSON.parse(localStorage.getItem(APP_SETTINGS_STORAGE_KEY)!)).toMatchObject({
      defaultViewMode: '3d',
      editorGridColumns: 8,
      show3DHeader: false,
    })
  })

  it('resets settings back to defaults', () => {
    useAppSettingsStore.getState().updateSettings({
      autoSaveProject: false,
      defaultFace: 'right',
    })

    useAppSettingsStore.getState().resetSettings()

    expect(useAppSettingsStore.getState().settings).toEqual(DEFAULT_SETTINGS)
    expect(JSON.parse(localStorage.getItem(APP_SETTINGS_STORAGE_KEY)!)).toEqual(DEFAULT_SETTINGS)
  })
})
