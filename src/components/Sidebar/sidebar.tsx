import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { PenLine, Package, Building2, Palette, Settings, HelpCircle, Plus } from 'lucide-react'
import { useDisplayStore } from '../../stores/display-store'
import { PalletCreationWizard } from '../PalletCreationWizard'

const navItems = [
  { to: '/editor', label: 'Editor', icon: PenLine },
  { to: '/catalog', label: 'Catalog', icon: Package },
  { to: '/retailers', label: 'Retailers', icon: Building2 },
  { to: '/branding', label: 'Branding', icon: Palette },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const currentProject = useDisplayStore(s => s.currentProject)
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <aside className="w-[200px] h-screen fixed left-0 top-0 bg-[#111] flex flex-col py-6 px-3 z-50">
      {/* Logo */}
      <div className="mb-8 px-3">
        <h1 className="text-[16px] font-semibold text-white tracking-display">PalletForge</h1>
        <p className="text-[10px] font-medium text-[#666] mt-1 truncate">
          {currentProject?.name ?? 'No project loaded'}
        </p>
      </div>

      {/* New Pallet Button */}
      <button
        onClick={() => setWizardOpen(true)}
        className="mb-4 mx-1 w-[calc(100%-8px)] py-2 text-[12px] font-medium rounded-md transition-all active:scale-[0.97] flex items-center justify-center gap-2 bg-white text-[#111] hover:bg-[#eee] cursor-pointer"
      >
        <Plus size={13} />
        New Pallet
      </button>

      {/* Current project indicator */}
      {currentProject && (
        <div className="mb-4 mx-1 px-3 py-2 rounded-md bg-white/[0.05] border border-white/[0.08]">
          <p className="text-[10px] font-medium text-[#666] uppercase tracking-wider">Current</p>
          <p className="text-[12px] font-medium text-white truncate mt-0.5">
            {currentProject.name}
          </p>
          <p className="text-[10px] text-[#555] mt-0.5">
            {currentProject.tierCount} tiers &middot; {currentProject.placements.length} products
          </p>
        </div>
      )}

      {/* Nav Links */}
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

      {/* Bottom */}
      <div className="pt-5 mt-5 px-1 space-y-0.5" style={{ boxShadow: '0 -1px 0 0 rgba(255,255,255,0.06)' }}>
        <button className="flex items-center gap-3 px-3 py-2 rounded-md text-[#666] hover:text-[#999] hover:bg-white/[0.04] transition-colors duration-150 w-full">
          <HelpCircle size={14} />
          <span className="text-[11px] font-medium">Support</span>
        </button>
      </div>

      {/* Wizard Modal */}
      <PalletCreationWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </aside>
  )
}
