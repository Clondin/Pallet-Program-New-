import { create } from 'zustand'
import type {
  Brand,
  CameraPreset,
  DisplayEnvironment,
  Holiday,
  PalletType,
  TrayFace,
  UnitSystem,
  ViewMode,
} from '../types'

const APP_SETTINGS_STORAGE_KEY = 'palletforge-app-settings'

export interface AppSettings {
  // General
  companyName: string
  defaultBrand: Brand | ''
  unitSystem: UnitSystem

  // Pallet Defaults
  defaultPalletType: PalletType
  defaultTierCount: number
  defaultHoliday: Holiday
  defaultLipColor: string

  // Editor
  defaultViewMode: ViewMode
  defaultFace: TrayFace
  defaultCameraPreset: CameraPreset
  editorGridColumns: number

  // 3D Viewer
  show3DSlotGrid: boolean
  show3DHeader: boolean
  displayEnvironment: DisplayEnvironment

  // Data
  autoSaveProject: boolean

  // Builder
  defaultLaborCost: number
}

const DEFAULT_SETTINGS: AppSettings = {
  // General
  companyName: '',
  defaultBrand: '',
  unitSystem: 'imperial',

  // Pallet Defaults
  defaultPalletType: 'full',
  defaultTierCount: 4,
  defaultHoliday: 'none',
  defaultLipColor: '#1E3A8A',

  // Editor
  defaultViewMode: '2d',
  defaultFace: 'front',
  defaultCameraPreset: 'isometric',
  editorGridColumns: 6,

  // 3D Viewer
  show3DSlotGrid: true,
  show3DHeader: true,
  displayEnvironment: 'retail',

  // Data
  autoSaveProject: true,

  // Builder
  defaultLaborCost: 75,
}

function clampGridColumns(value: number) {
  return Math.min(8, Math.max(4, Math.round(value)))
}

function clampTierCount(value: number) {
  return Math.min(6, Math.max(2, Math.round(value)))
}

function sanitizeSettings(
  partial?: Partial<AppSettings> | null
): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...partial,
    editorGridColumns: clampGridColumns(
      partial?.editorGridColumns ?? DEFAULT_SETTINGS.editorGridColumns
    ),
    defaultTierCount: clampTierCount(
      partial?.defaultTierCount ?? DEFAULT_SETTINGS.defaultTierCount
    ),
  }
}

function readPersistedSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(APP_SETTINGS_STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return sanitizeSettings(JSON.parse(raw) as Partial<AppSettings>)
  } catch {
    localStorage.removeItem(APP_SETTINGS_STORAGE_KEY)
    return DEFAULT_SETTINGS
  }
}

function persistSettings(settings: AppSettings) {
  localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

interface AppSettingsState {
  settings: AppSettings
  updateSettings: (updates: Partial<AppSettings>) => void
  resetSettings: () => void
}

export const useAppSettingsStore = create<AppSettingsState>((set) => ({
  settings: readPersistedSettings(),
  updateSettings: (updates) =>
    set((state) => {
      const settings = sanitizeSettings({ ...state.settings, ...updates })
      persistSettings(settings)
      return { settings }
    }),
  resetSettings: () =>
    set(() => {
      persistSettings(DEFAULT_SETTINGS)
      return { settings: DEFAULT_SETTINGS }
    }),
}))

export function getAppSettingsSnapshot() {
  return useAppSettingsStore.getState().settings
}

export { APP_SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS }
