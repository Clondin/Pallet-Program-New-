import {
  Boxes,
  Camera,
  Eye,
  Grid3X3,
  RefreshCcw,
  Save,
  SlidersHorizontal,
} from 'lucide-react'
import { useState } from 'react'
import type {
  CameraPreset,
  DisplayEnvironment,
  TrayFace,
  ViewMode,
} from '../types'
import {
  DEFAULT_SETTINGS,
  useAppSettingsStore,
} from '../stores/app-settings-store'

const viewModes: { value: ViewMode; label: string }[] = [
  { value: '2d', label: '2D first' },
  { value: '3d', label: '3D first' },
]

const faces: { value: TrayFace; label: string }[] = [
  { value: 'front', label: 'Front' },
  { value: 'back', label: 'Back' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
]

const cameras: { value: CameraPreset; label: string }[] = [
  { value: 'isometric', label: 'Isometric' },
  { value: 'front', label: 'Front' },
  { value: 'side', label: 'Side' },
  { value: 'top', label: 'Top' },
]

const environments: { value: DisplayEnvironment; label: string; description: string }[] = [
  { value: 'retail', label: 'Retail', description: 'Shelved, realistic aisle context.' },
  { value: 'studio', label: 'Studio', description: 'Clean neutral product-review lighting.' },
  { value: 'clean', label: 'Clean', description: 'Minimal backdrop with less visual noise.' },
]

function ChoicePills<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (next: T) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-2 text-sm font-semibold rounded-xl transition-all ${
            value === option.value
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function SettingsPage() {
  const settings = useAppSettingsStore((s) => s.settings)
  const updateSettings = useAppSettingsStore((s) => s.updateSettings)
  const resetSettings = useAppSettingsStore((s) => s.resetSettings)
  const [resetNotice, setResetNotice] = useState(false)

  const handleReset = () => {
    resetSettings()
    setResetNotice(true)
    window.setTimeout(() => setResetNotice(false), 1800)
  }

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            App Settings
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Configure editor defaults, 3D viewer behavior, and persistence for the workspace.
            Changes save immediately and apply to new editor sessions.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          {resetNotice ? 'Defaults Restored' : 'Reset Defaults'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.85fr] gap-6">
        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Editor Defaults</h3>
                <p className="text-sm text-slate-500">
                  These settings control the initial editor state for new or reopened projects.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Default View
                </label>
                <ChoicePills
                  value={settings.defaultViewMode}
                  options={viewModes}
                  onChange={(defaultViewMode) => updateSettings({ defaultViewMode })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Default Face
                </label>
                <ChoicePills
                  value={settings.defaultFace}
                  options={faces}
                  onChange={(defaultFace) => updateSettings({ defaultFace })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Default Camera
                </label>
                <ChoicePills
                  value={settings.defaultCameraPreset}
                  options={cameras}
                  onChange={(defaultCameraPreset) =>
                    updateSettings({ defaultCameraPreset })
                  }
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <label className="text-sm font-semibold text-slate-700">
                    2D Grid Columns
                  </label>
                  <span className="text-sm font-bold text-slate-900">
                    {settings.editorGridColumns}
                  </span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={8}
                  step={1}
                  value={settings.editorGridColumns}
                  onChange={(e) =>
                    updateSettings({ editorGridColumns: Number(e.target.value) })
                  }
                  className="w-full accent-blue-600"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Controls the number of placement columns shown in the 2D editor.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">3D Viewer</h3>
                <p className="text-sm text-slate-500">
                  Control how much structure and context the 3D scene shows.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() =>
                    updateSettings({ show3DSlotGrid: !settings.show3DSlotGrid })
                  }
                  className={`text-left rounded-2xl border p-4 transition-colors ${
                    settings.show3DSlotGrid
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Grid3X3 className="w-4 h-4" />
                    <span className="text-sm font-bold text-slate-900">
                      Slot Grid Overlay
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {settings.show3DSlotGrid ? 'Enabled' : 'Hidden'} in the 3D scene.
                  </p>
                </button>

                <button
                  onClick={() =>
                    updateSettings({ show3DHeader: !settings.show3DHeader })
                  }
                  className={`text-left rounded-2xl border p-4 transition-colors ${
                    settings.show3DHeader
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-bold text-slate-900">
                      Header Topper
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {settings.show3DHeader ? 'Visible' : 'Hidden'} above the pallet.
                  </p>
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Scene Environment
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {environments.map((environment) => (
                    <button
                      key={environment.value}
                      onClick={() =>
                        updateSettings({
                          displayEnvironment: environment.value,
                        })
                      }
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        settings.displayEnvironment === environment.value
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Camera className="w-4 h-4" />
                        <span className="text-sm font-bold">
                          {environment.label}
                        </span>
                      </div>
                      <p
                        className={`text-xs ${
                          settings.displayEnvironment === environment.value
                            ? 'text-white/70'
                            : 'text-slate-500'
                        }`}
                      >
                        {environment.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Save className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Persistence</h3>
                <p className="text-sm text-slate-500">
                  Control how aggressively the editor saves project data.
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                updateSettings({ autoSaveProject: !settings.autoSaveProject })
              }
              className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                settings.autoSaveProject
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Project Auto-Save
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    When enabled, project changes sync to local storage automatically.
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    settings.autoSaveProject
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {settings.autoSaveProject ? 'On' : 'Off'}
                </span>
              </div>
            </button>
          </section>

          <section className="bg-slate-900 text-white rounded-2xl p-6 overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/5" />
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 mb-3">
                Current Profile
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-white/60">View opens in</span>
                  <span className="font-bold uppercase">
                    {settings.defaultViewMode}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-white/60">Default face</span>
                  <span className="font-bold capitalize">
                    {settings.defaultFace}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-white/60">2D columns</span>
                  <span className="font-bold">{settings.editorGridColumns}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-white/60">3D environment</span>
                  <span className="font-bold capitalize">
                    {settings.displayEnvironment}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10">
                <p className="text-xs text-white/60 leading-relaxed">
                  Default baseline:
                  {' '}
                  {DEFAULT_SETTINGS.defaultViewMode.toUpperCase()} /{' '}
                  {DEFAULT_SETTINGS.defaultFace} /{' '}
                  {DEFAULT_SETTINGS.editorGridColumns} columns /{' '}
                  {DEFAULT_SETTINGS.displayEnvironment} scene.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
