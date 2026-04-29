import { NavLink } from 'react-router-dom'
import {
  Building2,
  CalendarRange,
  CheckCircle2,
  HardHat,
  HelpCircle,
  Home,
  Package,
  PenLine,
  TrendingUp,
} from 'lucide-react'
import { useDisplayStore } from '../../stores/display-store'
import { useRetailerStore } from '../../stores/retailer-store'
import { ROLE_LABELS, useRoleStore } from '../../stores/role-store'
import type { Role } from '../../types'

const ROLE_OPTIONS: Role[] = ['salesman', 'buyer', 'builder', 'manager']

interface NavItem {
  to: string
  label: string
  icon: typeof Building2
  roles?: Role[]
}

const navItems: NavItem[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/retailers', label: 'Programs', icon: Building2 },
  { to: '/catalog', label: 'Catalog', icon: Package },
  { to: '/seasons', label: 'Seasons', icon: CalendarRange },
  { to: '/builders', label: 'Build Queue', icon: HardHat },
  { to: '/demand', label: 'Demand', icon: TrendingUp, roles: ['buyer', 'manager'] },
]

export function Sidebar() {
  const role = useRoleStore((state) => state.role)
  const setRole = useRoleStore((state) => state.setRole)
  const currentProject = useDisplayStore((state) => state.currentProject)
  const currentRetailer = useRetailerStore((state) =>
    currentProject ? state.getRetailer(currentProject.retailerId) : undefined
  )

  const currentPalletHref =
    currentProject
      ? `/retailers/${currentProject.retailerId}/pallets/${currentProject.id}`
      : null
  const currentEditorHref =
    currentProject
      ? `/retailers/${currentProject.retailerId}/pallets/${currentProject.id}/editor`
      : null

  const visibleNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role),
  )

  return (
    <aside className="w-[220px] h-screen fixed left-0 top-0 bg-[#0e0e0e] flex flex-col py-6 px-3 z-50">
      <div className="mb-5 px-3">
        <h1 className="text-[16px] font-semibold text-white tracking-display">PalletForge</h1>
        <p className="text-[10px] font-medium text-[#666] mt-1 truncate">
          Pallet program planning
        </p>
      </div>

      {/* Role picker */}
      <div className="mx-1 mb-5 px-3 py-3 rounded-md bg-white/[0.04] border border-white/[0.06]">
        <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-[#666]">
          <CheckCircle2 className="w-3 h-3" />
          Active role
        </div>
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as Role)}
          className="mt-2 w-full bg-transparent text-[13px] font-semibold text-white border-none outline-none cursor-pointer focus:ring-2 focus:ring-white/20 rounded -ml-1 pl-1 appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23999'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.25rem center',
            backgroundSize: '1rem',
            paddingRight: '1.25rem',
          }}
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option} value={option} className="bg-[#1a1a1a]">
              {ROLE_LABELS[option]}
            </option>
          ))}
        </select>
      </div>

      {currentProject && currentPalletHref && currentEditorHref && (
        <div className="mb-5 mx-1 px-3 py-3 rounded-md bg-white/[0.05] border border-white/[0.08]">
          <p className="text-[10px] font-medium text-[#666] uppercase tracking-wider">
            Current Pallet
          </p>
          <p className="text-[12px] font-medium text-white mt-1 line-clamp-2">
            {currentProject.name}
          </p>
          <p className="text-[10px] text-[#555] mt-1">
            {currentRetailer?.name ?? 'Unknown retailer'}
          </p>
          <p className="text-[10px] text-[#555] mt-0.5">
            {currentProject.tierCount} tiers · {currentProject.placements.length} products
          </p>

          <div className="mt-3 grid gap-2">
            <NavLink
              to={currentPalletHref}
              className="px-2.5 py-2 rounded-md text-[11px] font-medium bg-white/[0.06] text-[#ddd] hover:bg-white/[0.1] transition-colors"
            >
              Pallet Details
            </NavLink>
            <NavLink
              to={currentEditorHref}
              className="px-2.5 py-2 rounded-md text-[11px] font-medium bg-white text-[#111] hover:bg-[#eee] transition-colors flex items-center justify-center gap-2"
            >
              <PenLine size={12} />
              Open Editor
            </NavLink>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-0.5 px-1">
        {visibleNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-150 ${
                isActive
                  ? 'text-white bg-white/[0.08]'
                  : 'text-[#777] hover:text-[#ccc] hover:bg-white/[0.04]'
              }`
            }
          >
            <Icon size={16} />
            <span className="text-[13px] font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div
        className="pt-5 mt-5 px-1 space-y-0.5"
        style={{ boxShadow: '0 -1px 0 0 rgba(255,255,255,0.06)' }}
      >
        <button className="flex items-center gap-3 px-3 py-2 rounded-md text-[#666] hover:text-[#999] hover:bg-white/[0.04] transition-colors duration-150 w-full">
          <HelpCircle size={14} />
          <span className="text-[11px] font-medium">Support</span>
        </button>
      </div>
    </aside>
  )
}
