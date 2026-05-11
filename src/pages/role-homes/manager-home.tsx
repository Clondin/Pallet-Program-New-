import { Link } from 'react-router-dom'
import {
  ArrowLeftRight,
  ArrowRight,
  Briefcase,
  Building2,
  CalendarRange,
  Eye,
  HardHat,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useDisplayStore } from '../../stores/display-store'
import { useRetailerStore } from '../../stores/retailer-store'
import { useSeasonStore } from '../../stores/season-store'
import { StatusPill, STATUS_LABELS } from '../../components/Status/status-pill'
import { PendingRequestsPanel } from '../../components/PendingRequests/pending-requests-panel'
import type { PalletStatus } from '../../types'

const STAT_TILES: { status: PalletStatus; label: string }[] = [
  { status: 'draft', label: 'Drafts' },
  { status: 'ready', label: 'Ready' },
  { status: 'in_build', label: 'In Build' },
  { status: 'built', label: 'Built' },
]

export function ManagerHome() {
  const projects = useDisplayStore((state) => state.projects)
  const retailers = useRetailerStore((state) => state.retailers)
  const seasons = useSeasonStore((state) => state.seasons)

  const activeRetailers = retailers.filter((r) => r.status === 'active').length
  const activeSeasons = seasons.filter((s) => !s.archived).length

  const counts: Record<PalletStatus, number> = {
    draft: 0,
    ready: 0,
    in_build: 0,
    built: 0,
  }
  for (const project of projects) {
    counts[project.status] = (counts[project.status] ?? 0) + 1
  }

  return (
    <div className="px-10 py-10 max-w-[1400px]">
      <div className="mb-10">
        <p className="text-[11px] uppercase tracking-wider text-[#999]">Manager dashboard</p>
        <h1 className="text-[32px] font-semibold tracking-display text-[#171717] mt-1">
          Program operations
        </h1>
        <p className="text-[13px] text-[#666] mt-2 max-w-2xl">
          Cross-program status, master data, and orchestration. Other roles see slices of this view
          tailored to what they do.
        </p>
      </div>

      {/* Status tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {STAT_TILES.map(({ status, label }) => (
          <div key={status} className="bg-white shadow-card rounded-xl px-5 py-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#999]">
                {label}
              </p>
              <StatusPill status={status} />
            </div>
            <p className="text-[28px] font-semibold text-[#171717] tabular-nums tracking-tight">
              {counts[status]}
            </p>
            <p className="text-[11px] text-[#999] mt-1">
              {label === STATUS_LABELS[status] ? 'pallets' : ''}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-10">
        <PendingRequestsPanel />
      </div>

      {/* View as another role */}
      <div className="mb-10">
        <p className="text-[11px] uppercase tracking-wider text-[#999] mb-3 flex items-center gap-1.5">
          <Eye className="w-3 h-3" />
          See what each role sees
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ViewAsTile to="/manager/views/salesman" icon={Briefcase} title="Salesman view" subtitle="Pick a salesperson, see their pallets" />
          <ViewAsTile to="/manager/views/builder" icon={HardHat} title="Builder view" subtitle="What's ready, in build, sorted by deadline" />
          <ViewAsTile to="/manager/views/buyer" icon={ShoppingCart} title="Buyer view" subtitle="Demand swings vs prior season" />
        </div>
      </div>

      {/* Quick links */}
      <div>
        <p className="text-[11px] uppercase tracking-wider text-[#999] mb-3">Setup &amp; operations</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickLink
            to="/manager/retailers"
            icon={Building2}
            title="Programs"
            subtitle={`${activeRetailers} active`}
          />
          <QuickLink
            to="/manager/catalog"
            icon={Package}
            title="Catalog"
            subtitle="Master items"
          />
          <QuickLink
            to="/manager/seasons"
            icon={CalendarRange}
            title="Seasons"
            subtitle={`${activeSeasons} active`}
          />
          <QuickLink
            to="/manager/builders"
            icon={HardHat}
            title="Build Queue"
            subtitle="By location (kanban)"
          />
          <QuickLink
            to="/manager/demand"
            icon={TrendingUp}
            title="Demand"
            subtitle="Aggregates & swings"
          />
          <QuickLink
            to="/manager/transfers"
            icon={ArrowLeftRight}
            title="Transfers"
            subtitle="Inventory & movements"
          />
          <QuickLink
            to="/manager/assignments"
            icon={Users}
            title="Assignments"
            subtitle="Salesmen ↔ retailers"
          />
        </div>
      </div>
    </div>
  )
}

function QuickLink({
  to,
  icon: Icon,
  title,
  subtitle,
}: {
  to: string
  icon: typeof Building2
  title: string
  subtitle: string
}) {
  return (
    <Link
      to={to}
      className="group bg-white shadow-card hover:shadow-elevated transition-all rounded-xl px-5 py-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#fafafa] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#666]" />
        </div>
        <ArrowRight className="w-4 h-4 text-[#ccc] group-hover:text-[#171717] group-hover:translate-x-0.5 transition-all" />
      </div>
      <p className="text-[15px] font-semibold text-[#171717] mt-4">{title}</p>
      <p className="text-[12px] text-[#888] mt-0.5">{subtitle}</p>
    </Link>
  )
}

function ViewAsTile({
  to,
  icon: Icon,
  title,
  subtitle,
}: {
  to: string
  icon: typeof Briefcase
  title: string
  subtitle: string
}) {
  return (
    <Link
      to={to}
      className="group bg-[#171717] text-white rounded-xl px-5 py-5 hover:bg-[#222] transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/[0.08] flex items-center justify-center">
          <Icon className="w-4 h-4 text-white/70" />
        </div>
        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
      </div>
      <p className="text-[15px] font-semibold mt-4">{title}</p>
      <p className="text-[12px] text-white/60 mt-0.5">{subtitle}</p>
    </Link>
  )
}
