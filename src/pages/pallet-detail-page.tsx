import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Boxes, CalendarDays, Copy, Package, PenLine, Store, Trash2 } from 'lucide-react'
import { AssortmentTable } from '../components/Assortment/assortment-table'
import { CommentsThread } from '../components/Comments/comments-thread'
import { StatusPill, STATUS_LABELS } from '../components/Status/status-pill'
import { DeadlineChip } from '../components/Deadline/deadline-chip'
import { computeConfirmByDate } from '../lib/deadline'
import type { PalletStatus } from '../types'
import { useCatalogStore } from '../stores/catalog-store'
import { useDisplayStore } from '../stores/display-store'
import { useRetailerStore } from '../stores/retailer-store'
import { compareSeasonsByHolidayDate, useSeasonStore } from '../stores/season-store'

function formatDateInputValue(timestamp?: number) {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateInputValue(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day, 12).getTime()
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
  const setPalletType = useDisplayStore((state) => state.setPalletType)
  const updateName = useDisplayStore((state) => state.updateName)
  const updateSeasonId = useDisplayStore((state) => state.updateSeasonId)
  const updateBuildLocation = useDisplayStore((state) => state.updateBuildLocation)
  const updateLaborCost = useDisplayStore((state) => state.updateLaborCost)
  const updateStatus = useDisplayStore((state) => state.updateStatus)
  const deleteProject = useDisplayStore((state) => state.deleteProject)
  const duplicateProject = useDisplayStore((state) => state.duplicateProject)
  const updateShipByDate = useDisplayStore((state) => state.updateShipByDate)
  const retailer = useRetailerStore((state) =>
    retailerId ? state.getRetailer(retailerId) : undefined
  )
  const seasons = useSeasonStore((state) => state.seasons)
  const createSeason = useSeasonStore((state) => state.createSeason)
  const products = useCatalogStore((state) => state.products)

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
          <input
            value={pallet.name}
            onChange={(e) => updateName(e.target.value)}
            className="text-[28px] font-semibold tracking-display text-[#171717] mt-1 bg-transparent border-none outline-none focus:ring-2 focus:ring-[#0a72ef]/30 rounded-md px-1 -mx-1 w-full"
          />
          <div className="flex flex-wrap items-center gap-2 mt-3 text-[12px] text-[#666]">
            <StatusPill status={pallet.status} />
            {(() => {
              const season = pallet.seasonId
                ? seasons.find((s) => s.id === pallet.seasonId)
                : undefined
              if (!season?.holidayDate || pallet.status === 'built') return null
              return <DeadlineChip confirmByMs={computeConfirmByDate(season.holidayDate)} />
            })()}
            {pallet.seasonId && (
              <span className="px-2 py-1 rounded-md bg-[#f5f5f5] font-medium">
                {seasons.find((s) => s.id === pallet.seasonId)?.name ?? 'Season'}
              </span>
            )}
            <span className="px-2 py-1 rounded-md bg-[#f5f5f5] font-medium capitalize">
              {pallet.palletType} pallet
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              const newName = window.prompt(
                'Name for the duplicate pallet:',
                `${pallet.name} (copy)`,
              )
              if (!newName || !newName.trim()) return
              const seasonOptions = seasons.filter((s) => !s.archived)
              let nextSeasonId: string | null = pallet.seasonId
              if (seasonOptions.length > 0) {
                const list = seasonOptions
                  .map((s, i) => `${i + 1}. ${s.name}`)
                  .join('\n')
                const choice = window.prompt(
                  `Pick a season for the copy (or leave blank to keep "${
                    seasons.find((s) => s.id === pallet.seasonId)?.name ?? 'unassigned'
                  }"):\n\n${list}\n\nEnter a number or leave blank.`,
                )
                if (choice && choice.trim() !== '') {
                  const idx = parseInt(choice, 10) - 1
                  if (!isNaN(idx) && idx >= 0 && idx < seasonOptions.length) {
                    nextSeasonId = seasonOptions[idx].id
                  }
                }
              }
              const clone = duplicateProject(pallet.id, {
                name: newName.trim(),
                seasonId: nextSeasonId,
              })
              if (clone) {
                navigate(`/retailers/${clone.retailerId}/pallets/${clone.id}`)
              }
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-[#555] text-[13px] font-medium hover:bg-[#fafafa] transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicate
          </button>
          <button
            onClick={() => {
              if (
                window.confirm(`Delete pallet "${pallet.name}"? This cannot be undone.`)
              ) {
                deleteProject(pallet.id)
                navigate(`/retailers/${retailerId}`)
              }
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-[#c0392b] text-[13px] font-medium hover:bg-[#c0392b]/5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
          <Link
            to={`/retailers/${retailerId}/pallets/${pallet.id}/editor`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#171717] text-white text-[13px] font-medium hover:bg-[#333] transition-colors"
          >
            <PenLine className="w-3.5 h-3.5" />
            Open Editor
          </Link>
        </div>
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

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white shadow-card rounded-xl p-6">
          <h3 className="text-[15px] font-semibold text-[#171717]">Pallet Summary</h3>
          <div className="grid grid-cols-2 gap-4 mt-5">
            <div className="rounded-lg bg-[#fafafa] px-4 py-4 col-span-2">
              <p className="text-[10px] uppercase tracking-wider text-[#999] mb-2">Status</p>
              <select
                value={pallet.status}
                onChange={(e) => updateStatus(e.target.value as PalletStatus)}
                className="w-full text-[14px] font-semibold text-[#171717] bg-transparent border-none outline-none cursor-pointer focus:ring-2 focus:ring-[#0a72ef]/30 rounded-md -ml-1 pl-1"
              >
                {(['draft', 'ready', 'in_build', 'built'] as PalletStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-lg bg-[#fafafa] px-4 py-4">
              <p className="text-[10px] uppercase tracking-wider text-[#999] mb-2">Structure</p>
              <select
                value={pallet.palletType}
                onChange={(e) => setPalletType(e.target.value as 'full' | 'half')}
                className="w-full text-[14px] font-semibold text-[#171717] bg-transparent border-none outline-none cursor-pointer focus:ring-2 focus:ring-[#0a72ef]/30 rounded-md capitalize -ml-1 pl-1"
              >
                <option value="full">Full Pallet</option>
                <option value="half">Half Pallet</option>
              </select>
            </div>
            <div className="rounded-lg bg-[#fafafa] px-4 py-4">
              <p className="text-[10px] uppercase tracking-wider text-[#999] mb-2">Season</p>
              <select
                value={pallet.seasonId ?? ''}
                onChange={(event) => {
                  const value = event.target.value
                  if (value === '__new__') {
                    const name = window.prompt('Name for the new season:')
                    if (!name || !name.trim()) return
                    const created = createSeason(name)
                    updateSeasonId(created.id)
                    return
                  }
                  updateSeasonId(value === '' ? null : value)
                }}
                className="w-full text-[14px] font-semibold text-[#171717] bg-transparent border-none outline-none cursor-pointer focus:ring-2 focus:ring-[#0a72ef]/30 rounded-md -ml-1 pl-1"
              >
                <option value="">Unassigned</option>
                {seasons
                  .filter((season) => !season.archived || season.id === pallet.seasonId)
                  .slice()
                  .sort(compareSeasonsByHolidayDate)
                  .map((season) => (
                    <option key={season.id} value={season.id}>
                      {season.name}
                      {season.archived ? ' (archived)' : ''}
                    </option>
                  ))}
                <option value="__new__">+ Create new season…</option>
              </select>
            </div>
            <div className="rounded-lg bg-[#fafafa] px-4 py-4">
              <p className="text-[10px] uppercase tracking-wider text-[#999]">Tiers</p>
              <p className="text-[14px] font-semibold text-[#171717] mt-1">
                {pallet.tierCount}
              </p>
            </div>
            <div className="rounded-lg bg-[#fafafa] px-4 py-4">
              <p className="text-[10px] uppercase tracking-wider text-[#999] mb-2">Build location</p>
              <select
                value={pallet.buildLocation ?? ''}
                onChange={(event) => {
                  const value = event.target.value
                  updateBuildLocation(value === '' ? null : (value as 'hook' | 'goshen' | 'third-party'))
                }}
                className="w-full text-[14px] font-semibold text-[#171717] bg-transparent border-none outline-none cursor-pointer focus:ring-2 focus:ring-[#0a72ef]/30 rounded-md -ml-1 pl-1"
              >
                <option value="">Unassigned</option>
                <option value="hook">Hook</option>
                <option value="goshen">Goshen</option>
                <option value="third-party">3rd Party Location</option>
              </select>
            </div>
            <div className="rounded-lg bg-[#fafafa] px-4 py-4">
              <p className="text-[10px] uppercase tracking-wider text-[#999] mb-2">Labor cost</p>
              <div className="flex items-center gap-1">
                <span className="text-[14px] font-semibold text-[#999]">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={pallet.laborCost ?? ''}
                  onChange={(event) => {
                    const val = event.target.value.replace(/[^0-9.]/g, '')
                    if (val === '') {
                      updateLaborCost(null)
                      return
                    }
                    const num = parseFloat(val)
                    updateLaborCost(isNaN(num) ? null : num)
                  }}
                  placeholder="75"
                  className="flex-1 text-[14px] font-semibold text-[#171717] bg-transparent border-none outline-none focus:ring-2 focus:ring-[#0a72ef]/30 rounded-md -ml-1 pl-1"
                />
              </div>
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
                {pallet.placements.map((placement) => {
                  const product = products.find((p) => p.id === placement.sourceProductId)
                  const upc = product?.upc
                  const kayco = product?.kaycoItemNumber
                  return (
                  <div
                    key={placement.id}
                    className="rounded-lg bg-[#fafafa] px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-[13px] font-medium text-[#171717]">
                        {placement.label}
                      </p>
                      <p className="text-[11px] text-[#888] mt-1 font-mono">
                        {upc || kayco
                          ? [upc && `UPC ${upc}`, kayco && `Kayco #${kayco}`]
                              .filter(Boolean)
                              .join(' · ')
                          : '— no UPC / Kayco # set'}
                      </p>
                    </div>
                    <span className="text-[11px] font-medium text-[#666]">
                      Slot {placement.slotId}
                    </span>
                  </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <label className="text-[12px] font-medium text-[#555]">Ship By</label>
        <input
          type="date"
          value={formatDateInputValue(pallet.shipByDate)}
          onChange={(event) =>
            updateShipByDate(
              event.target.value ? parseDateInputValue(event.target.value) : undefined,
            )
          }
          className="px-3 py-1.5 text-[13px] shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none w-full sm:w-auto"
        />
      </div>

      <div className="mt-6">
        <AssortmentTable project={pallet} retailer={retailer} />
      </div>

      <div className="mt-6">
        <CommentsThread palletId={pallet.id} />
      </div>
    </div>
  )
}
