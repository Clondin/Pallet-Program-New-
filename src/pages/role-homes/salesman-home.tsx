import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase, Plus, UserCircle2 } from 'lucide-react'
import { useDisplayStore } from '../../stores/display-store'
import { useRetailerStore } from '../../stores/retailer-store'
import { useSeasonStore } from '../../stores/season-store'
import { useSalespersonStore } from '../../stores/salesperson-store'
import { useRoleStore } from '../../stores/role-store'
import { StatusPill } from '../../components/Status/status-pill'
import { DeadlineChip } from '../../components/Deadline/deadline-chip'
import { PalletCreationWizard } from '../../components/PalletCreationWizard'
import { computeConfirmByDate } from '../../lib/deadline'
import type { PalletStatus } from '../../types'

const STATUS_ORDER: PalletStatus[] = ['draft', 'ready', 'in_build', 'built']

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function SalesmanHome() {
  const projects = useDisplayStore((state) => state.projects)
  const retailers = useRetailerStore((state) => state.retailers)
  const seasons = useSeasonStore((state) => state.seasons)
  const salespeople = useSalespersonStore((state) => state.salespeople)
  const activeSalespersonId = useRoleStore((state) => state.activeSalespersonId)
  const setActiveSalespersonId = useRoleStore((state) => state.setActiveSalespersonId)

  const [wizardOpen, setWizardOpen] = useState(false)

  const activeSalesperson = activeSalespersonId
    ? salespeople.find((sp) => sp.id === activeSalespersonId) ?? null
    : null

  const retailerById = useMemo(
    () => new Map(retailers.map((r) => [r.id, r])),
    [retailers],
  )
  const seasonById = useMemo(
    () => new Map(seasons.map((s) => [s.id, s])),
    [seasons],
  )

  const scopedRetailerIds = useMemo(
    () => new Set(activeSalesperson?.retailerIds ?? []),
    [activeSalesperson],
  )

  const scopedProjects = useMemo(() => {
    if (!activeSalesperson) return []
    return projects.filter((p) => scopedRetailerIds.has(p.retailerId))
  }, [projects, scopedRetailerIds, activeSalesperson])

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

  // Hero state when no salesperson is picked yet.
  if (!activeSalesperson) {
    return (
      <div className="px-8 py-16 max-w-[840px] mx-auto">
        <p className="text-[11px] uppercase tracking-wider text-[#999] flex items-center gap-1.5">
          <Briefcase className="w-3 h-3" />
          Salesman
        </p>
        <h1 className="text-[32px] font-semibold tracking-display text-[#171717] mt-2">
          Who's working today?
        </h1>
        <p className="text-[14px] text-[#666] mt-2 max-w-lg">
          Pick your name to scope the app to your retailers. You can switch later from the top-right.
        </p>

        {salespeople.length === 0 ? (
          <div className="mt-10 bg-white shadow-card rounded-2xl p-12 text-center">
            <UserCircle2 className="w-9 h-9 text-[#ccc] mx-auto mb-3" />
            <p className="text-[14px] text-[#666]">
              No salespeople have been added yet. Ask your manager to set up the team.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {salespeople.map((sp) => (
              <button
                key={sp.id}
                onClick={() => setActiveSalespersonId(sp.id)}
                className="group bg-white shadow-card hover:shadow-elevated transition-all rounded-xl p-5 flex items-center gap-4 text-left"
              >
                <span className="w-12 h-12 rounded-full bg-[#171717] text-white text-[14px] font-semibold flex items-center justify-center shrink-0">
                  {initialsOf(sp.name)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-[#171717] truncate">
                    {sp.name}
                  </p>
                  <p className="text-[12px] text-[#888] mt-0.5">
                    {sp.retailerIds.length} retailer
                    {sp.retailerIds.length === 1 ? '' : 's'} assigned
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#ccc] group-hover:text-[#171717] group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="px-8 py-10 max-w-[1280px] mx-auto">
      <div className="mb-8 flex items-start justify-between gap-6 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#999]">
            Hello, {activeSalesperson.name.split(' ')[0]}
          </p>
          <h1 className="text-[28px] font-semibold tracking-display text-[#171717] mt-1">
            Your pallets
          </h1>
          <p className="text-[13px] text-[#666] mt-2 max-w-2xl">
            {activeSalesperson.retailerIds.length} retailer
            {activeSalesperson.retailerIds.length === 1 ? '' : 's'} assigned · drafts in progress, pallets ready for the warehouse, and what's already built.
          </p>
        </div>
        <button
          onClick={() => setWizardOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#171717] text-white text-[13px] font-medium hover:bg-[#333] transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          New Pallet
        </button>
      </div>

      {scopedProjects.length === 0 ? (
        <div className="bg-white shadow-card rounded-2xl p-16 text-center">
          <Briefcase className="w-9 h-9 text-[#ccc] mx-auto mb-4" />
          <p className="text-[15px] font-semibold text-[#171717]">No pallets yet</p>
          <p className="text-[13px] text-[#888] mt-2 max-w-md mx-auto">
            Start your first pallet for the season. It'll show up here grouped by status.
          </p>
          <button
            onClick={() => setWizardOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#171717] text-white text-[13px] font-medium hover:bg-[#333] transition-colors mt-5"
          >
            <Plus className="w-3.5 h-3.5" />
            New Pallet
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {STATUS_ORDER.map((status) => {
            const items = groupedByStatus[status]
            if (items.length === 0) return null
            return (
              <section key={status}>
                <div className="flex items-center gap-3 mb-4">
                  <StatusPill status={status} />
                  <p className="text-[13px] text-[#666]">
                    {items.length} {items.length === 1 ? 'pallet' : 'pallets'}
                  </p>
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
                        to={`/salesman/retailers/${pallet.retailerId}/pallets/${pallet.id}`}
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

      <PalletCreationWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        allowedRetailerIds={activeSalesperson.retailerIds}
      />
    </div>
  )
}
