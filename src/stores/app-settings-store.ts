import { create } from 'zustand'
import type {
  CameraPreset,
  DisplayEnvironment,
  TrayFace,
  ViewMode,
} from '../types'

const APP_SETTINGS_STORAGE_KEY = 'palletforge-app-settings'

export interface AppSettings {
  autoSaveProject: boolean
  defaultViewMode: ViewMode
  defaultFace: TrayFace
  defaultCameraPreset: CameraPreset
  editorGridColumns: number
  show3DSlotGrid: boolean
  show3DHeader: boolean
  displayEnvironment: DisplayEnvironment
}

const DEFAULT_SETTINGS: AppSettings = {
  autoSaveProject: true,
  defaultViewMode: '2d',
  defaultFace: 'front',
  defaultCameraPreset: 'isometric',
  editorGridColumns: 6,
  show3DSlotGrid: true,
  show3DHeader: true,
  displayEnvironment: 'retail',
}

function clampGridColumns(value: number) {
  return Math.min(8, Math.max(4, Math.round(value)))
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
