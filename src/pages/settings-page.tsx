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

type SettingsTab = 'editor' | 'viewer' | 'persistence'

const TABS: { value: SettingsTab; label: string; icon: typeof SlidersHorizontal }[] = [
  { value: 'editor', label: 'Editor Defaults', icon: SlidersHorizontal },
  { value: 'viewer', label: '3D Viewer', icon: Boxes },
  { value: 'persistence', label: 'Persistence', icon: Save },
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
          className={`px-3 py-2 text-[12px] font-medium rounded-md transition-all ${
            value === option.value
              ? 'bg-[#171717] text-white'
              : 'shadow-border bg-white text-[#555] hover:bg-[#fafafa]'
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
  const [activeTab, setActiveTab] = useState<SettingsTab>('editor')

  const handleReset = () => {
    resetSettings()
    setResetNotice(true)
    window.setTimeout(() => setResetNotice(false), 1800)
  }

  return (
    <div className="px-10 py-0 max-w-[1200px] mx-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-[#fafafa] pt-8 pb-0">
        <div className="flex items-start justify-between gap-6 mb-0">
          <div>
            <h2 className="text-[24px] font-semibold tracking-display text-[#171717]">
              Settings
            </h2>
            <p className="text-[13px] text-[#888] mt-1">
              Configure editor defaults, 3D viewer behavior, and persistence. Changes apply immediately.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-[12px] font-medium text-[#555] shadow-border bg-white rounded-md hover:bg-[#fafafa] transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            {resetNotice ? 'Defaults Restored' : 'Reset Defaults'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 mt-6 -mb-px" style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.06)' }}>
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-[13px] font-medium transition-colors relative ${
                activeTab === tab.value
                  ? 'text-[#171717]'
                  : 'text-[#888] hover:text-[#555]'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {activeTab === tab.value && (
                <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#171717] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="pt-8 pb-12">
        {/* ===== Editor Defaults ===== */}
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="bg-white shadow-card rounded-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: '#0a72ef0a' }}>
                  <SlidersHorizontal className="w-4 h-4 text-[#0a72ef]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#171717] tracking-tight-sm">Editor Defaults</h3>
                  <p className="text-[12px] text-[#888]">Initial editor state for new or reopened pallets.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[12px] font-medium text-[#555] mb-3">Default View</label>
                  <ChoicePills value={settings.defaultViewMode} options={viewModes} onChange={(defaultViewMode) => updateSettings({ defaultViewMode })} />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#555] mb-3">Default Face</label>
                  <ChoicePills value={settings.defaultFace} options={faces} onChange={(defaultFace) => updateSettings({ defaultFace })} />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#555] mb-3">Default Camera</label>
                  <ChoicePills value={settings.defaultCameraPreset} options={cameras} onChange={(defaultCameraPreset) => updateSettings({ defaultCameraPreset })} />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <label className="text-[12px] font-medium text-[#555]">2D Grid Columns</label>
                    <span className="text-[12px] font-semibold text-[#171717] tabular-nums">{settings.editorGridColumns}</span>
                  </div>
                  <input
                    type="range" min={4} max={8} step={1}
                    value={settings.editorGridColumns}
                    onChange={(e) => updateSettings({ editorGridColumns: Number(e.target.value) })}
                    className="w-full accent-[#171717]"
                  />
                  <p className="text-[11px] text-[#999] mt-2">Controls placement columns in the 2D editor.</p>
                </div>
              </div>
            </div>

            {/* Sidebar: Current Profile */}
            <div className="bg-[#111] text-white rounded-lg p-6 overflow-hidden relative h-fit">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/[0.03]" />
              <div className="relative">
                <p className="text-[10px] font-medium uppercase tracking-wider text-white/40 mb-3">
                  Current Profile
                </p>
                <div className="space-y-3">
                  {[
                    { label: 'View opens in', value: settings.defaultViewMode.toUpperCase() },
                    { label: 'Default face', value: settings.defaultFace },
                    { label: '2D columns', value: String(settings.editorGridColumns) },
                    { label: '3D environment', value: settings.displayEnvironment },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3 text-[13px]">
                      <span className="text-white/50">{row.label}</span>
                      <span className="font-medium capitalize tabular-nums">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5" style={{ boxShadow: '0 -1px 0 0 rgba(255,255,255,0.08)' }}>
                  <p className="text-[11px] text-white/40 leading-relaxed">
                    Baseline: {DEFAULT_SETTINGS.defaultViewMode.toUpperCase()} / {DEFAULT_SETTINGS.defaultFace} / {DEFAULT_SETTINGS.editorGridColumns} columns / {DEFAULT_SETTINGS.displayEnvironment} scene.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== 3D Viewer ===== */}
        {activeTab === 'viewer' && (
          <div className="max-w-3xl">
            <div className="bg-white shadow-card rounded-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: '#7c3aed0a' }}>
                  <Boxes className="w-4 h-4 text-[#7c3aed]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#171717] tracking-tight-sm">3D Viewer</h3>
                  <p className="text-[12px] text-[#888]">Control structure and context in the 3D scene.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => updateSettings({ show3DSlotGrid: !settings.show3DSlotGrid })}
                    className={`text-left rounded-lg p-5 transition-colors ${
                      settings.show3DSlotGrid ? 'bg-[#0a72ef]/5 shadow-card' : 'bg-[#fafafa] shadow-border'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Grid3X3 className="w-3.5 h-3.5 text-[#555]" />
                      <span className="text-[13px] font-medium text-[#171717]">Slot Grid Overlay</span>
                    </div>
                    <p className="text-[11px] text-[#888]">{settings.show3DSlotGrid ? 'Enabled' : 'Hidden'} in the 3D scene.</p>
                  </button>

                  <button
                    onClick={() => updateSettings({ show3DHeader: !settings.show3DHeader })}
                    className={`text-left rounded-lg p-5 transition-colors ${
                      settings.show3DHeader ? 'bg-[#0a72ef]/5 shadow-card' : 'bg-[#fafafa] shadow-border'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-3.5 h-3.5 text-[#555]" />
                      <span className="text-[13px] font-medium text-[#171717]">Header Topper</span>
                    </div>
                    <p className="text-[11px] text-[#888]">{settings.show3DHeader ? 'Visible' : 'Hidden'} above the pallet.</p>
                  </button>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#555] mb-3">Scene Environment</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {environments.map((env) => (
                      <button
                        key={env.value}
                        onClick={() => updateSettings({ displayEnvironment: env.value })}
                        className={`rounded-lg p-5 text-left transition-all ${
                          settings.displayEnvironment === env.value
                            ? 'bg-[#171717] text-white shadow-elevated'
                            : 'bg-[#fafafa] text-[#555] shadow-border hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Camera className="w-3.5 h-3.5" />
                          <span className="text-[13px] font-medium">{env.label}</span>
                        </div>
                        <p className={`text-[11px] ${settings.displayEnvironment === env.value ? 'text-white/60' : 'text-[#999]'}`}>
                          {env.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== Persistence ===== */}
        {activeTab === 'persistence' && (
          <div className="max-w-3xl">
            <div className="bg-white shadow-card rounded-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: '#15803d0a' }}>
                  <Save className="w-4 h-4 text-[#15803d]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#171717] tracking-tight-sm">Persistence</h3>
                  <p className="text-[12px] text-[#888]">Control how the editor saves pallet data.</p>
                </div>
              </div>

              <button
                onClick={() => updateSettings({ autoSaveProject: !settings.autoSaveProject })}
                className={`w-full rounded-lg p-5 text-left transition-colors ${
                  settings.autoSaveProject ? 'bg-[#15803d]/5 shadow-card' : 'bg-[#fafafa] shadow-border'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-medium text-[#171717]">Project Auto-Save</p>
                    <p className="text-[12px] text-[#888] mt-1">Sync changes to local storage automatically.</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-medium ${
                    settings.autoSaveProject ? 'bg-[#15803d] text-white' : 'bg-[#f0f0f0] text-[#888]'
                  }`}>
                    {settings.autoSaveProject ? 'On' : 'Off'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
