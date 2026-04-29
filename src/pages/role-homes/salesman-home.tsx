import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase, Plus, X } from 'lucide-react'
import { useDisplayStore } from '../../stores/display-store'
import { useRetailerStore } from '../../stores/retailer-store'
import { useSeasonStore } from '../../stores/season-store'
import { useSalespersonStore } from '../../stores/salesperson-store'
import { StatusPill } from '../../components/Status/status-pill'
import { DeadlineChip } from '../../components/Deadline/deadline-chip'
import { computeConfirmByDate } from '../../lib/deadline'
import type { PalletStatus } from '../../types'

const STATUS_ORDER: PalletStatus[] = ['draft', 'ready', 'in_build', 'built']

export function SalesmanHome() {
  const projects = useDisplayStore((state) => state.projects)
  const retailers = useRetailerStore((state) => state.retailers)
  const seasons = useSeasonStore((state) => state.seasons)
  const salespeople = useSalespersonStore((state) => state.salespeople)

  const [activeSalespersonId, setActiveSalespersonId] = useState<string>('')
  const [pinnedRetailerIds, setPinnedRetailerIds] = useState<Set<string>>(new Set())

  const retailerById = useMemo(
    () => new Map(retailers.map((r) => [r.id, r])),
    [retailers],
  )
  const seasonById = useMemo(
    () => new Map(seasons.map((s) => [s.id, s])),
    [seasons],
  )

  const activeSalesperson = activeSalespersonId
    ? salespeople.find((sp) => sp.id === activeSalespersonId)
    : null

  const scopedRetailerIds = useMemo(() => {
    if (activeSalesperson) return new Set(activeSalesperson.retailerIds)
    if (pinnedRetailerIds.size > 0) return pinnedRetailerIds
    return null
  }, [activeSalesperson, pinnedRetailerIds])

  const scopedProjects = useMemo(() => {
    if (!scopedRetailerIds) return projects
    return projects.filter((p) => scopedRetailerIds.has(p.retailerId))
  }, [projects, scopedRetailerIds])

  const groupedByStatus = useMemo(() => {
    const groups: Record<PalletStatus, typeof projects> = {
      draft: [],
      ready: [],
      in_build: [],
      built: [],
    }
    for (const project of scopedProjects) {
      groups[project.status].push(project)
    }
    for (const status of STATUS_ORDER) {
      groups[status].sort((a, b) => b.updatedAt - a.updatedAt)
    }
    return groups
  }, [scopedProjects])

  const togglePinned = (retailerId: string) => {
    setPinnedRetailerIds((current) => {
      const next = new Set(current)
      if (next.has(retailerId)) next.delete(retailerId)
      else next.add(retailerId)
      return next
    })
  }

  const visibleRetailers = useMemo(() => {
    if (activeSalesperson) {
      return retailers.filter((r) => activeSalesperson.retailerIds.includes(r.id))
    }
    return retailers
  }, [retailers, activeSalesperson])

  return (
    <div className="px-10 py-10 max-w-[1400px]">
      <div className="mb-10 flex items-start justify-between gap-6 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#999] flex items-center gap-1.5">
            <Briefcase className="w-3 h-3" />
            Salesman home
          </p>
          <h1 className="text-[32px] font-semibold tracking-display text-[#171717] mt-1">
            Your pallets
          </h1>
          <p className="text-[13px] text-[#666] mt-2 max-w-2xl">
            Drafts in progress, pallets ready for the warehouse, and what's already built.
          </p>
        </div>
        <Link
          to="/retailers"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#171717] text-white text-[13px] font-medium hover:bg-[#333] transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          New Pallet
        </Link>
      </div>

      {/* Salesperson + retailer filters */}
      {salespeople.length > 0 && (
        <div className="bg-white shadow-card rounded-xl p-4 mb-5 flex items-center gap-3 flex-wrap">
          <span className="text-[11px] uppercase tracking-wider text-[#999]">I am</span>
          <select
            value={activeSalespersonId}
            onChange={(event) => {
              setActiveSalespersonId(event.target.value)
              setPinnedRetailerIds(new Set())
            }}
            className="px-3 py-1.5 text-[12px] font-medium shadow-border rounded-md bg-white focus:outline-none cursor-pointer"
          >
            <option value="">Anyone (all retailers)</option>
            {salespeople.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.name}
              </option>
            ))}
          </select>
          {activeSalesperson && (
            <span className="text-[11px] text-[#888]">
              {activeSalesperson.retailerIds.length} retailer
              {activeSalesperson.retailerIds.length === 1 ? '' : 's'} assigned
            </span>
          )}
        </div>
      )}

      {!activeSalesperson && retailers.length > 0 && (
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-wider text-[#999] mb-2">
            Filter to retailers
          </p>
          <div className="flex flex-wrap gap-2">
            {visibleRetailers.map((retailer) => {
              const pinned = pinnedRetailerIds.has(retailer.id)
              return (
                <button
                  key={retailer.id}
                  onClick={() => togglePinned(retailer.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                    pinned
                      ? 'bg-[#171717] text-white'
                      : 'bg-white shadow-border text-[#555] hover:bg-[#fafafa]'
                  }`}
                >
                  {retailer.name}
                  {pinned && <X className="w-3 h-3" />}
                </button>
              )
            })}
            {pinnedRetailerIds.size > 0 && (
              <button
                onClick={() => setPinnedRetailerIds(new Set())}
                className="text-[11px] text-[#888] hover:text-[#171717] underline ml-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {scopedProjects.length === 0 ? (
        <div className="bg-white shadow-card rounded-xl p-16 text-center">
          <Briefcase className="w-8 h-8 text-[#ccc] mx-auto mb-4" />
          <p className="text-[15px] font-semibold text-[#171717]">No pallets yet</p>
          <p className="text-[13px] text-[#888] mt-2 max-w-md mx-auto">
            {scopedRetailerIds
              ? 'No pallets for the selected retailers. Pick a program to start one.'
              : 'Pick a program and start your first pallet for the season.'}
          </p>
          <Link
            to="/retailers"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#171717] text-white text-[13px] font-medium hover:bg-[#333] transition-colors mt-5"
          >
            Browse programs
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {STATUS_ORDER.map((status) => {
            const items = groupedByStatus[status]
            if (items.length === 0) return null
            return (
              <section key={status}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <StatusPill status={status} />
                    <p className="text-[13px] text-[#666]">
                      {items.length} {items.length === 1 ? 'pallet' : 'pallets'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {items.map((pallet) => {
                    const retailer = retailerById.get(pallet.retailerId)
                    const season = pallet.seasonId
                      ? seasonById.get(pallet.seasonId)
                      : undefined
                    const cases = pallet.assortment.reduce((s, e) => s + e.cases, 0)
                    const confirmBy = season?.holidayDate
                      ? computeConfirmByDate(season.holidayDate)
                      : null
                    return (
                      <Link
                        key={pallet.id}
                        to={`/retailers/${pallet.retailerId}/pallets/${pallet.id}`}
                        className="group bg-white shadow-card hover:shadow-elevated transition-all rounded-xl p-5"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <p className="text-[14px] font-semibold text-[#171717] truncate">
                            {pallet.name}
                          </p>
                          <ArrowRight className="w-3.5 h-3.5 text-[#ccc] group-hover:text-[#171717] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                        <p className="text-[11px] text-[#888]">
                          {retailer?.name ?? '—'}
                          {season ? ` · ${season.name}` : ''}
                        </p>
                        <div className="flex items-center gap-3 mt-3 text-[11px] text-[#666]">
                          <span className="capitalize">{pallet.palletType}</span>
                          <span>·</span>
                          <span>{pallet.assortment.length} SKUs</span>
                          <span>·</span>
                          <span>{cases} cases</span>
                        </div>
                        {confirmBy && pallet.status !== 'built' && (
                          <div className="mt-3">
                            <DeadlineChip confirmByMs={confirmBy} size="sm" />
                          </div>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
