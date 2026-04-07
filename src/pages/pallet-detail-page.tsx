import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Boxes, CalendarDays, Package, PenLine, Store } from 'lucide-react'
import { BrandingPreview } from '../components/Branding/branding-preview'
import { ColorPickerField } from '../components/Branding/color-picker-field'
import { useDisplayStore } from '../stores/display-store'
import { useRetailerStore } from '../stores/retailer-store'
import type { Holiday } from '../types'

function formatHoliday(holiday: Holiday) {
  if (holiday === 'none') return 'Everyday'
  return holiday
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Boxes
  label: string
  value: string
}) {
  return (
    <div className="bg-white shadow-card rounded-xl px-5 py-4">
      <div className="flex items-center gap-2 text-[#777]">
        <Icon className="w-4 h-4" />
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-[18px] font-semibold text-[#171717] mt-3">{value}</p>
    </div>
  )
}

export function PalletDetailPage() {
  const { retailerId, palletId } = useParams()
  const navigate = useNavigate()
  const pallet = useDisplayStore((state) =>
    palletId ? state.getProject(palletId) : undefined
  )
  const currentProjectId = useDisplayStore((state) => state.currentProject?.id)
  const selectProject = useDisplayStore((state) => state.selectProject)
  const updateBranding = useDisplayStore((state) => state.updateBranding)
  const updateLipColor = useDisplayStore((state) => state.updateLipColor)
  const retailer = useRetailerStore((state) =>
    retailerId ? state.getRetailer(retailerId) : undefined
  )

  useEffect(() => {
    if (palletId && currentProjectId !== palletId) {
      selectProject(palletId)
    }
  }, [palletId, currentProjectId, selectProject])

  if (!pallet || !retailerId || !retailer) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Boxes className="w-10 h-10 text-[#ccc] mb-3" />
        <h3 className="text-[15px] font-semibold text-[#333]">Pallet not found</h3>
        <button
          onClick={() => navigate('/retailers')}
          className="mt-3 px-4 py-1.5 text-[13px] font-medium text-[#0a72ef] hover:bg-[#0a72ef]/5 rounded-md transition-colors"
        >
          Back to Retailers
        </button>
      </div>
    )
  }

  return (
    <div className="px-10 py-10 max-w-[1300px]">
      <button
        onClick={() => navigate(`/retailers/${retailerId}`)}
        className="flex items-center gap-1.5 text-[#777] hover:text-[#171717] text-[12px] font-medium mb-5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {retailer.name}
      </button>

      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#999]">Pallet</p>
          <h1 className="text-[28px] font-semibold tracking-display text-[#171717] mt-1">
            {pallet.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-[12px] text-[#666]">
            <span className="px-2 py-1 rounded-md bg-[#f5f5f5] font-medium">
              {formatHoliday(pallet.holiday)}
            </span>
            <span className="px-2 py-1 rounded-md bg-[#f5f5f5] font-medium capitalize">
              {pallet.palletType} pallet
            </span>
          </div>
        </div>

        <Link
          to={`/retailers/${retailerId}/pallets/${pallet.id}/editor`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#171717] text-white text-[13px] font-medium hover:bg-[#333] transition-colors"
        >
          <PenLine className="w-3.5 h-3.5" />
          Open Editor
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Stat icon={Store} label="Retailer" value={retailer.name} />
        <Stat icon={Package} label="Products" value={String(pallet.placements.length)} />
        <Stat icon={Boxes} label="Tiers" value={String(pallet.tierCount)} />
        <Stat
          icon={CalendarDays}
          label="Updated"
          value={new Date(pallet.updatedAt).toLocaleDateString('en-US')}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-6">
        <div className="space-y-6">
          <BrandingPreview branding={pallet.branding} lipColor={pallet.lipColor} />

          <div className="bg-white shadow-card rounded-xl p-6">
            <h3 className="text-[15px] font-semibold text-[#171717]">Branding</h3>
            <p className="text-[12px] text-[#888] mt-1">
              Branding is owned by this pallet, not globally.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
              <ColorPickerField
                label="Header Background"
                value={pallet.branding.headerBackgroundColor || '#00A3C7'}
                onChange={(color) => updateBranding({ headerBackgroundColor: color })}
              />
              <ColorPickerField
                label="Lip Color"
                value={pallet.lipColor}
                onChange={updateLipColor}
              />
              <ColorPickerField
                label="Header Text Color"
                value={pallet.branding.headerTextColor || '#FFFFFF'}
                onChange={(color) => updateBranding({ headerTextColor: color })}
              />
              <ColorPickerField
                label="Lip Text Color"
                value={pallet.branding.lipTextColor || '#FFFFFF'}
                onChange={(color) => updateBranding({ lipTextColor: color })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
              <div>
                <label className="block text-[12px] font-medium text-[#555] mb-2">
                  Header Text
                </label>
                <textarea
                  value={pallet.branding.headerText || ''}
                  onChange={(event) =>
                    updateBranding({ headerText: event.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 text-[13px] shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none resize-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#555] mb-2">
                  Lip Text
                </label>
                <input
                  value={pallet.branding.lipText || ''}
                  onChange={(event) =>
                    updateBranding({ lipText: event.target.value })
                  }
                  className="w-full px-3 py-2 text-[13px] shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-card rounded-xl p-6">
          <h3 className="text-[15px] font-semibold text-[#171717]">Pallet Summary</h3>
          <div className="grid grid-cols-2 gap-4 mt-5">
            <div className="rounded-lg bg-[#fafafa] px-4 py-4">
              <p className="text-[10px] uppercase tracking-wider text-[#999]">Holiday</p>
              <p className="text-[14px] font-semibold text-[#171717] mt-1">
                {formatHoliday(pallet.holiday)}
              </p>
            </div>
            <div className="rounded-lg bg-[#fafafa] px-4 py-4">
              <p className="text-[10px] uppercase tracking-wider text-[#999]">Structure</p>
              <p className="text-[14px] font-semibold text-[#171717] mt-1 capitalize">
                {pallet.palletType} pallet
              </p>
            </div>
            <div className="rounded-lg bg-[#fafafa] px-4 py-4">
              <p className="text-[10px] uppercase tracking-wider text-[#999]">Tiers</p>
              <p className="text-[14px] font-semibold text-[#171717] mt-1">
                {pallet.tierCount}
              </p>
            </div>
            <div className="rounded-lg bg-[#fafafa] px-4 py-4">
              <p className="text-[10px] uppercase tracking-wider text-[#999]">Products</p>
              <p className="text-[14px] font-semibold text-[#171717] mt-1">
                {pallet.placements.length}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6" style={{ boxShadow: '0 -1px 0 0 rgba(0,0,0,0.06)' }}>
            <h4 className="text-[13px] font-semibold text-[#171717]">Placed products</h4>
            {pallet.placements.length === 0 ? (
              <p className="text-[12px] text-[#888] mt-3">
                No products placed yet. Open the editor to start building the pallet.
              </p>
            ) : (
              <div className="grid gap-3 mt-4">
                {pallet.placements.map((placement) => (
                  <div
                    key={placement.id}
                    className="rounded-lg bg-[#fafafa] px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-[13px] font-medium text-[#171717]">
                        {placement.label}
                      </p>
                      <p className="text-[11px] text-[#888] mt-1">{placement.sku}</p>
                    </div>
                    <span className="text-[11px] font-medium text-[#666]">
                      Slot {placement.slotId}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
