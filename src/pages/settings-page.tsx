import {
  Boxes,
  Building2,
  Camera,
  Database,
  Download,
  Eye,
  Grid3X3,
  Palette,
  RefreshCcw,
  Ruler,
  Save,
  SlidersHorizontal,
  Trash2,
  Upload,
} from 'lucide-react'
import { useRef, useState } from 'react'
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
import {
  DEFAULT_SETTINGS,
  useAppSettingsStore,
} from '../stores/app-settings-store'
import { BRAND_COLORS } from '../lib/mock-data'

/* ─── option data ─── */

const brands: { value: Brand | ''; label: string; color?: string }[] = [
  { value: '', label: 'None' },
  { value: 'tuscanini', label: 'Tuscanini', color: BRAND_COLORS.tuscanini },
  { value: 'kedem', label: 'Kedem', color: BRAND_COLORS.kedem },
  { value: 'gefen', label: 'Gefen', color: BRAND_COLORS.gefen },
  { value: 'liebers', label: "Lieber's", color: BRAND_COLORS.liebers },
  { value: 'haddar', label: 'Haddar', color: BRAND_COLORS.haddar },
  { value: 'osem', label: 'Osem', color: BRAND_COLORS.osem },
]

const unitSystems: { value: UnitSystem; label: string; hint: string }[] = [
  { value: 'imperial', label: 'Imperial', hint: 'in / lb' },
  { value: 'metric', label: 'Metric', hint: 'cm / kg' },
]

const palletTypes: { value: PalletType; label: string; size: string }[] = [
  { value: 'full', label: 'Full Pallet', size: '48" x 40"' },
  { value: 'half', label: 'Half Pallet', size: '24" x 20"' },
]

const holidays: { value: Holiday; label: string; icon: string }[] = [
  { value: 'none', label: 'Everyday', icon: '📦' },
  { value: 'rosh-hashanah', label: 'Rosh Hashanah', icon: '🍎' },
  { value: 'pesach', label: 'Pesach', icon: '🫓' },
  { value: 'sukkos', label: 'Sukkos', icon: '🌿' },
]

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

/* ─── tab config ─── */

type SettingsTab = 'general' | 'pallet' | 'editor' | 'viewer' | 'data'

const TABS: { value: SettingsTab; label: string; icon: typeof Building2 }[] = [
  { value: 'general', label: 'General', icon: Building2 },
  { value: 'pallet', label: 'Pallet Defaults', icon: Palette },
  { value: 'editor', label: 'Editor', icon: SlidersHorizontal },
  { value: 'viewer', label: '3D Viewer', icon: Boxes },
  { value: 'data', label: 'Data', icon: Database },
]

/* ─── localStorage keys (for export / clear) ─── */

const ALL_STORAGE_KEYS = [
  'palletforge-app-settings',
  'palletforge-pallets',
  'palletforge-project',
  'palletforge-active-pallet-id',
  'palletforge-products',
  'palletforge-retailers',
  'lastUsedConfig',
]

/* ─── shared components ─── */

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

function SectionCard({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  children,
}: {
  icon: typeof Building2
  iconColor: string
  iconBg: string
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white shadow-card rounded-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-[#171717] tracking-tight-sm">
            {title}
          </h3>
          <p className="text-[12px] text-[#888]">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function ToggleCard({
  icon: Icon,
  label,
  description,
  active,
  onClick,
}: {
  icon: typeof Eye
  label: string
  description: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-lg p-5 transition-colors w-full ${
        active ? 'bg-[#0a72ef]/5 shadow-card' : 'bg-[#fafafa] shadow-border'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-[#555]" />
        <span className="text-[13px] font-medium text-[#171717]">{label}</span>
      </div>
      <p className="text-[11px] text-[#888]">{description}</p>
    </button>
  )
}

/* ─── main page ─── */

export function SettingsPage() {
  const settings = useAppSettingsStore((s) => s.settings)
  const updateSettings = useAppSettingsStore((s) => s.updateSettings)
  const resetSettings = useAppSettingsStore((s) => s.resetSettings)
  const [resetNotice, setResetNotice] = useState(false)
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [clearConfirm, setClearConfirm] = useState(false)
  const [importNotice, setImportNotice] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleReset = () => {
    resetSettings()
    setResetNotice(true)
    window.setTimeout(() => setResetNotice(false), 1800)
  }

  const handleClearAllData = () => {
    if (!clearConfirm) {
      setClearConfirm(true)
      window.setTimeout(() => setClearConfirm(false), 3000)
      return
    }
    ALL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
    setClearConfirm(false)
    window.location.reload()
  }

  const handleExport = () => {
    const data: Record<string, unknown> = {}
    ALL_STORAGE_KEYS.forEach((key) => {
      const raw = localStorage.getItem(key)
      if (raw) {
        try {
          data[key] = JSON.parse(raw)
        } catch {
          data[key] = raw
        }
      }
    })

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `palletforge-export-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as Record<string, unknown>
        let keysRestored = 0
        Object.entries(data).forEach(([key, value]) => {
          if (ALL_STORAGE_KEYS.includes(key)) {
            localStorage.setItem(
              key,
              typeof value === 'string' ? value : JSON.stringify(value)
            )
            keysRestored++
          }
        })
        setImportNotice(`Restored ${keysRestored} data sets. Reloading...`)
        window.setTimeout(() => window.location.reload(), 1200)
      } catch {
        setImportNotice('Invalid file format.')
        window.setTimeout(() => setImportNotice(null), 2500)
      }
    }
    reader.readAsText(file)

    // reset the input so the same file can be re-imported
    event.target.value = ''
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
              Configure your workspace, pallet defaults, editor behavior, and data. Changes apply immediately.
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
        <div
          className="flex items-center gap-0 mt-6 -mb-px overflow-x-auto"
          style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.06)' }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
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
        {/* ===== General ===== */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <SectionCard
              icon={Building2}
              iconColor="#0a72ef"
              iconBg="#0a72ef0a"
              title="General"
              subtitle="Company identity and measurement preferences."
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-[12px] font-medium text-[#555] mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) =>
                      updateSettings({ companyName: e.target.value })
                    }
                    placeholder="e.g. KAYCO, Kedem Foods"
                    className="w-full px-3 py-2.5 rounded-md text-[13px] bg-white shadow-border text-[#171717] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#171717]/10"
                  />
                  <p className="text-[11px] text-[#999] mt-1.5">
                    Used in branding defaults and exports.
                  </p>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#555] mb-3">
                    Default Brand
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {brands.map((brand) => (
                      <button
                        key={brand.value}
                        onClick={() =>
                          updateSettings({ defaultBrand: brand.value })
                        }
                        className={`inline-flex items-center gap-2 px-3 py-2 text-[12px] font-medium rounded-md transition-all ${
                          settings.defaultBrand === brand.value
                            ? 'bg-[#171717] text-white'
                            : 'shadow-border bg-white text-[#555] hover:bg-[#fafafa]'
                        }`}
                      >
                        {brand.color && (
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: brand.color }}
                          />
                        )}
                        {brand.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#999] mt-2">
                    Pre-selects brand filter in the catalog.
                  </p>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#555] mb-3">
                    Unit System
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {unitSystems.map((unit) => (
                      <button
                        key={unit.value}
                        onClick={() =>
                          updateSettings({ unitSystem: unit.value })
                        }
                        className={`rounded-lg p-4 text-left transition-all ${
                          settings.unitSystem === unit.value
                            ? 'bg-[#171717] text-white shadow-elevated'
                            : 'bg-[#fafafa] text-[#555] shadow-border hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Ruler className="w-3.5 h-3.5" />
                          <span className="text-[13px] font-medium">
                            {unit.label}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] ${
                            settings.unitSystem === unit.value
                              ? 'text-white/60'
                              : 'text-[#999]'
                          }`}
                        >
                          {unit.hint}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Sidebar: Current Profile */}
            <div className="bg-[#111] text-white rounded-lg p-6 overflow-hidden relative h-fit">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/[0.03]" />
              <div className="relative">
                <p className="text-[10px] font-medium uppercase tracking-wider text-white/40 mb-3">
                  Current Profile
                </p>
                <div className="space-y-3">
                  {[
                    {
                      label: 'Company',
                      value: settings.companyName || 'Not set',
                    },
                    {
                      label: 'Brand',
                      value: settings.defaultBrand
                        ? brands.find((b) => b.value === settings.defaultBrand)
                            ?.label ?? settings.defaultBrand
                        : 'None',
                    },
                    { label: 'Units', value: settings.unitSystem },
                    {
                      label: 'Pallet type',
                      value:
                        settings.defaultPalletType === 'full'
                          ? 'Full (48x40)'
                          : 'Half (24x20)',
                    },
                    {
                      label: 'Default tiers',
                      value: String(settings.defaultTierCount),
                    },
                    {
                      label: 'View opens in',
                      value: settings.defaultViewMode.toUpperCase(),
                    },
                    {
                      label: '3D environment',
                      value: settings.displayEnvironment,
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-3 text-[13px]"
                    >
                      <span className="text-white/50">{row.label}</span>
                      <span className="font-medium capitalize tabular-nums">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== Pallet Defaults ===== */}
        {activeTab === 'pallet' && (
          <div className="max-w-3xl">
            <SectionCard
              icon={Palette}
              iconColor="#c2410c"
              iconBg="#c2410c0a"
              title="Pallet Defaults"
              subtitle="Starting values when creating a new pallet. The wizard will still let you override."
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-[12px] font-medium text-[#555] mb-3">
                    Default Pallet Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {palletTypes.map((pt) => (
                      <button
                        key={pt.value}
                        onClick={() =>
                          updateSettings({ defaultPalletType: pt.value })
                        }
                        className={`rounded-lg p-5 text-left transition-all ${
                          settings.defaultPalletType === pt.value
                            ? 'bg-[#171717] text-white shadow-elevated'
                            : 'bg-[#fafafa] text-[#555] shadow-border hover:bg-white'
                        }`}
                      >
                        <p className="text-[13px] font-medium">{pt.label}</p>
                        <p
                          className={`text-[11px] mt-1 ${
                            settings.defaultPalletType === pt.value
                              ? 'text-white/60'
                              : 'text-[#999]'
                          }`}
                        >
                          {pt.size}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <label className="text-[12px] font-medium text-[#555]">
                      Default Tier Count
                    </label>
                    <span className="text-[12px] font-semibold text-[#171717] tabular-nums">
                      {settings.defaultTierCount}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={6}
                    step={1}
                    value={settings.defaultTierCount}
                    onChange={(e) =>
                      updateSettings({
                        defaultTierCount: Number(e.target.value),
                      })
                    }
                    className="w-full accent-[#171717]"
                  />
                  <div className="flex justify-between text-[10px] text-[#bbb] mt-1 px-0.5">
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                    <span>6</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#555] mb-3">
                    Default Holiday / Season
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {holidays.map((h) => (
                      <button
                        key={h.value}
                        onClick={() =>
                          updateSettings({ defaultHoliday: h.value })
                        }
                        className={`rounded-lg p-4 text-center transition-all ${
                          settings.defaultHoliday === h.value
                            ? 'bg-[#171717] text-white shadow-elevated'
                            : 'bg-[#fafafa] text-[#555] shadow-border hover:bg-white'
                        }`}
                      >
                        <span className="text-xl block mb-1">{h.icon}</span>
                        <p className="text-[12px] font-medium">{h.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#555] mb-2">
                    Default Lip Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.defaultLipColor}
                      onChange={(e) =>
                        updateSettings({ defaultLipColor: e.target.value })
                      }
                      className="w-10 h-10 rounded-md border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.defaultLipColor}
                      onChange={(e) =>
                        updateSettings({ defaultLipColor: e.target.value })
                      }
                      className="w-28 px-3 py-2 rounded-md text-[13px] font-mono bg-white shadow-border text-[#171717] uppercase focus:outline-none focus:ring-2 focus:ring-[#171717]/10"
                    />
                  </div>
                  <p className="text-[11px] text-[#999] mt-1.5">
                    Applied to the shelf lip on new pallets.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ===== Editor ===== */}
        {activeTab === 'editor' && (
          <div className="max-w-3xl">
            <SectionCard
              icon={SlidersHorizontal}
              iconColor="#0a72ef"
              iconBg="#0a72ef0a"
              title="Editor"
              subtitle="Initial editor state for new or reopened pallets."
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-[12px] font-medium text-[#555] mb-3">
                    Default View
                  </label>
                  <ChoicePills
                    value={settings.defaultViewMode}
                    options={viewModes}
                    onChange={(defaultViewMode) =>
                      updateSettings({ defaultViewMode })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#555] mb-3">
                    Default Face
                  </label>
                  <ChoicePills
                    value={settings.defaultFace}
                    options={faces}
                    onChange={(defaultFace) => updateSettings({ defaultFace })}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#555] mb-3">
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
                    <label className="text-[12px] font-medium text-[#555]">
                      2D Grid Columns
                    </label>
                    <span className="text-[12px] font-semibold text-[#171717] tabular-nums">
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
                      updateSettings({
                        editorGridColumns: Number(e.target.value),
                      })
                    }
                    className="w-full accent-[#171717]"
                  />
                  <p className="text-[11px] text-[#999] mt-2">
                    Controls placement columns in the 2D editor.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ===== 3D Viewer ===== */}
        {activeTab === 'viewer' && (
          <div className="max-w-3xl">
            <SectionCard
              icon={Boxes}
              iconColor="#7c3aed"
              iconBg="#7c3aed0a"
              title="3D Viewer"
              subtitle="Control structure and context in the 3D scene."
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ToggleCard
                    icon={Grid3X3}
                    label="Slot Grid Overlay"
                    description={`${settings.show3DSlotGrid ? 'Enabled' : 'Hidden'} in the 3D scene.`}
                    active={settings.show3DSlotGrid}
                    onClick={() =>
                      updateSettings({
                        show3DSlotGrid: !settings.show3DSlotGrid,
                      })
                    }
                  />
                  <ToggleCard
                    icon={Eye}
                    label="Header Topper"
                    description={`${settings.show3DHeader ? 'Visible' : 'Hidden'} above the pallet.`}
                    active={settings.show3DHeader}
                    onClick={() =>
                      updateSettings({ show3DHeader: !settings.show3DHeader })
                    }
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#555] mb-3">
                    Scene Environment
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {environments.map((env) => (
                      <button
                        key={env.value}
                        onClick={() =>
                          updateSettings({ displayEnvironment: env.value })
                        }
                        className={`rounded-lg p-5 text-left transition-all ${
                          settings.displayEnvironment === env.value
                            ? 'bg-[#171717] text-white shadow-elevated'
                            : 'bg-[#fafafa] text-[#555] shadow-border hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Camera className="w-3.5 h-3.5" />
                          <span className="text-[13px] font-medium">
                            {env.label}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] ${
                            settings.displayEnvironment === env.value
                              ? 'text-white/60'
                              : 'text-[#999]'
                          }`}
                        >
                          {env.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ===== Data ===== */}
        {activeTab === 'data' && (
          <div className="max-w-3xl space-y-6">
            <SectionCard
              icon={Save}
              iconColor="#15803d"
              iconBg="#15803d0a"
              title="Persistence"
              subtitle="Control how the editor saves pallet data."
            >
              <ToggleCard
                icon={Save}
                label="Project Auto-Save"
                description={
                  settings.autoSaveProject
                    ? 'Syncing changes to local storage automatically.'
                    : 'Auto-save is off. Changes may be lost on reload.'
                }
                active={settings.autoSaveProject}
                onClick={() =>
                  updateSettings({
                    autoSaveProject: !settings.autoSaveProject,
                  })
                }
              />
            </SectionCard>

            <SectionCard
              icon={Database}
              iconColor="#6366f1"
              iconBg="#6366f10a"
              title="Import & Export"
              subtitle="Back up or restore all app data (pallets, products, retailers, settings)."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-3 rounded-lg p-5 bg-[#fafafa] shadow-border hover:bg-white transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-md bg-[#6366f1]/10 flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4 text-[#6366f1]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#171717]">
                      Export Data
                    </p>
                    <p className="text-[11px] text-[#888] mt-0.5">
                      Download a JSON backup file.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-3 rounded-lg p-5 bg-[#fafafa] shadow-border hover:bg-white transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-md bg-[#6366f1]/10 flex items-center justify-center shrink-0">
                    <Upload className="w-4 h-4 text-[#6366f1]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#171717]">
                      Import Data
                    </p>
                    <p className="text-[11px] text-[#888] mt-0.5">
                      Restore from a JSON backup.
                    </p>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                />
              </div>
              {importNotice && (
                <p className="text-[12px] text-[#6366f1] mt-3 font-medium">
                  {importNotice}
                </p>
              )}
            </SectionCard>

            <SectionCard
              icon={Trash2}
              iconColor="#dc2626"
              iconBg="#dc26260a"
              title="Danger Zone"
              subtitle="Irreversible actions. Proceed with caution."
            >
              <button
                onClick={handleClearAllData}
                className={`w-full rounded-lg p-5 text-left transition-all ${
                  clearConfirm
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-[#fafafa] shadow-border hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p
                      className={`text-[14px] font-medium ${clearConfirm ? 'text-red-600' : 'text-[#171717]'}`}
                    >
                      {clearConfirm
                        ? 'Click again to confirm'
                        : 'Clear All Data'}
                    </p>
                    <p
                      className={`text-[12px] mt-1 ${clearConfirm ? 'text-red-500' : 'text-[#888]'}`}
                    >
                      {clearConfirm
                        ? 'This will permanently delete all pallets, products, retailers, and settings.'
                        : 'Remove all locally stored data and reset to defaults.'}
                    </p>
                  </div>
                  <Trash2
                    className={`w-4 h-4 shrink-0 ${clearConfirm ? 'text-red-500' : 'text-[#ccc]'}`}
                  />
                </div>
              </button>
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  )
}
