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

  it('clamps tier count between 2 and 6', () => {
    useAppSettingsStore.getState().updateSettings({ defaultTierCount: 0 })
    expect(getAppSettingsSnapshot().defaultTierCount).toBe(2)

    useAppSettingsStore.getState().updateSettings({ defaultTierCount: 10 })
    expect(getAppSettingsSnapshot().defaultTierCount).toBe(6)

    useAppSettingsStore.getState().updateSettings({ defaultTierCount: 4 })
    expect(getAppSettingsSnapshot().defaultTierCount).toBe(4)
  })

  it('persists new general and pallet default fields', () => {
    useAppSettingsStore.getState().updateSettings({
      companyName: 'KAYCO',
      defaultBrand: 'kedem',
      unitSystem: 'metric',
      defaultPalletType: 'half',
      defaultHoliday: 'pesach',
      defaultLipColor: '#FF0000',
    })

    const snapshot = getAppSettingsSnapshot()
    expect(snapshot.companyName).toBe('KAYCO')
    expect(snapshot.defaultBrand).toBe('kedem')
    expect(snapshot.unitSystem).toBe('metric')
    expect(snapshot.defaultPalletType).toBe('half')
    expect(snapshot.defaultHoliday).toBe('pesach')
    expect(snapshot.defaultLipColor).toBe('#FF0000')

    const persisted = JSON.parse(localStorage.getItem(APP_SETTINGS_STORAGE_KEY)!)
    expect(persisted.companyName).toBe('KAYCO')
    expect(persisted.defaultLipColor).toBe('#FF0000')
  })

  it('resets settings back to defaults', () => {
    useAppSettingsStore.getState().updateSettings({
      autoSaveProject: false,
      defaultFace: 'right',
      companyName: 'Test Corp',
      defaultBrand: 'tuscanini',
    })

    useAppSettingsStore.getState().resetSettings()

    expect(useAppSettingsStore.getState().settings).toEqual(DEFAULT_SETTINGS)
    expect(JSON.parse(localStorage.getItem(APP_SETTINGS_STORAGE_KEY)!)).toEqual(DEFAULT_SETTINGS)
  })
})
