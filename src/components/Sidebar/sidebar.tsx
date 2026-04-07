import { NavLink } from 'react-router-dom'
import { Building2, Package, Settings, HelpCircle, PenLine } from 'lucide-react'
import { useDisplayStore } from '../../stores/display-store'
import { useRetailerStore } from '../../stores/retailer-store'

const navItems = [
  { to: '/retailers', label: 'Retailers', icon: Building2 },
  { to: '/catalog', label: 'Catalog', icon: Package },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
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

  return (
    <aside className="w-[200px] h-screen fixed left-0 top-0 bg-[#111] flex flex-col py-6 px-3 z-50">
      <div className="mb-8 px-3">
        <h1 className="text-[16px] font-semibold text-white tracking-display">PalletForge</h1>
        <p className="text-[10px] font-medium text-[#666] mt-1 truncate">
          Retailer-first pallet planning
        </p>
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
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
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
