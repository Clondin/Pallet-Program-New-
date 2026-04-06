import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Globe,
  Star,
  Calendar,
  User,
  Phone,
  Mail,
  Package,
  Shield,
  Clock,
  DollarSign,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  ChevronRight,
  BarChart3,
  Layers,
  FileText,
  Users,
  Search,
  TrendingUp,
} from 'lucide-react'
import { useRetailerStore } from '../stores/retailer-store'
import { BRAND_COLORS } from '../lib/mock-data'
import type { Brand, AuthorizedItem, Retailer } from '../types'

type Tab = 'overview' | 'items' | 'contacts' | 'compliance' | 'displays'

const TABS: { value: Tab; label: string; icon: typeof BarChart3 }[] = [
  { value: 'overview', label: 'Overview', icon: BarChart3 },
  { value: 'items', label: 'Authorized Items', icon: Package },
  { value: 'contacts', label: 'Contacts', icon: Users },
  { value: 'compliance', label: 'Compliance', icon: Shield },
  { value: 'displays', label: 'Display History', icon: Layers },
]

const RETAILER_GRADIENT: Record<string, string> = {
  Walmart: 'from-[#0071DC] via-[#005BB5] to-[#004F9A]',
  Costco: 'from-[#E31837] via-[#CC1530] to-[#B71234]',
  ShopRite: 'from-[#D4213D] via-[#BE1D36] to-[#A8192F]',
  'Stop & Shop': 'from-[#E21A2C] via-[#CC1726] to-[#B51523]',
  Kroger: 'from-[#0268B1] via-[#025D9E] to-[#01548D]',
  'Whole Foods': 'from-[#00674B] via-[#005A42] to-[#004D38]',
  ALDI: 'from-[#00005F] via-[#000050] to-[#000040]',
}

const STATUS_DOT = {
  active: 'bg-emerald-500',
  pending: 'bg-amber-400',
  inactive: 'bg-[#ccc]',
}

const TIER_LABEL: Record<string, { text: string; color: string }> = {
  enterprise: { text: 'Enterprise', color: '#7c3aed' },
  premium: { text: 'Premium', color: '#0a72ef' },
  standard: { text: 'Standard', color: '#666' },
}

const ITEM_STATUS = {
  authorized: { label: 'Authorized', color: '#15803d', bg: '#f0fdf4', icon: CheckCircle2 },
  pending: { label: 'Pending', color: '#b45309', bg: '#fffbeb', icon: Clock },
  discontinued: { label: 'Discontinued', color: '#888', bg: '#f5f5f5', icon: XCircle },
}

const COMPLIANCE_STATUS = {
  compliant: { label: 'Compliant', color: '#15803d', bg: '#f0fdf4', icon: CheckCircle2 },
  'action-required': { label: 'Action Required', color: '#dc2626', bg: '#fef2f2', icon: AlertCircle },
  'pending-review': { label: 'Pending Review', color: '#b45309', bg: '#fffbeb', icon: AlertTriangle },
}

const DISPLAY_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: '#15803d', bg: '#f0fdf4' },
  draft: { label: 'Draft', color: '#666', bg: '#f5f5f5' },
  completed: { label: 'Completed', color: '#0a72ef', bg: '#eff6ff' },
}

function fmtCurrency(v: number) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`
  return `$${v.toLocaleString()}`
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysUntil(s: string) {
  return Math.ceil((new Date(s).getTime() - Date.now()) / 86400000)
}

export function RetailerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const retailer = useRetailerStore((s) => s.getRetailer(id ?? ''))
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [itemSearch, setItemSearch] = useState('')
  const [itemStatusFilter, setItemStatusFilter] = useState<'all' | 'authorized' | 'pending' | 'discontinued'>('all')

  if (!retailer) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Building2 className="w-10 h-10 text-[#ccc] mb-3" />
        <h3 className="text-[15px] font-semibold text-[#333]">Retailer not found</h3>
        <button
          onClick={() => navigate('/retailers')}
          className="mt-3 px-4 py-1.5 text-[13px] font-medium text-[#0a72ef] hover:bg-[#0a72ef]/5 rounded-md transition-colors"
        >
          Back to Retailers
        </button>
      </div>
    )
  }

  const {
    name, status, tier, storeCount, headquartersCity, headquartersState,
    accountManager, contractStart, contractEnd, website, regions, performance,
    authorizedItems, contacts, compliance, displayHistory, notes, tags,
    defaultTierCount, maxDisplayHeight, palletDimensions,
  } = retailer

  const gradient = RETAILER_GRADIENT[name] ?? 'from-[#555] via-[#444] to-[#333]'
  const tierCfg = TIER_LABEL[tier] ?? TIER_LABEL.standard
  const contractDays = daysUntil(contractEnd)

  const filteredItems = useMemo(() => {
    let items = [...authorizedItems]
    if (itemSearch) {
      const q = itemSearch.toLowerCase()
      items = items.filter((i) => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q))
    }
    if (itemStatusFilter !== 'all') items = items.filter((i) => i.status === itemStatusFilter)
    return items
  }, [authorizedItems, itemSearch, itemStatusFilter])

  const brandBreakdown = useMemo(() => {
    const map = new Map<Brand, { count: number; totalUnits: number }>()
    authorizedItems.filter((i) => i.status === 'authorized').forEach((item) => {
      const e = map.get(item.brand) ?? { count: 0, totalUnits: 0 }
      map.set(item.brand, { count: e.count + 1, totalUnits: e.totalUnits + item.avgMonthlyUnits })
    })
    return Array.from(map.entries()).sort((a, b) => b[1].totalUnits - a[1].totalUnits)
  }, [authorizedItems])

  return (
    <div className="max-w-[1400px]">
      {/* ── Hero ── */}
      <div className={`bg-gradient-to-r ${gradient} px-10 pt-7 pb-5 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.03] rounded-full -translate-y-[300px] translate-x-[200px]" />

        <div className="relative">
          <button
            onClick={() => navigate('/retailers')}
            className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-[12px] font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Retailers
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <h1 className="text-[26px] font-semibold text-white tracking-display">{name}</h1>
                {tier === 'enterprise' && <Star className="w-4 h-4 text-amber-300 fill-amber-300" />}
                <span className="flex items-center gap-1.5 px-2 py-[2px] rounded text-[10px] font-medium bg-white/10 text-white/80 capitalize">
                  <span className={`w-[5px] h-[5px] rounded-full ${STATUS_DOT[status]}`} />
                  {status}
                </span>
                <span
                  className="px-2 py-[2px] rounded text-[10px] font-medium"
                  style={{ color: 'white', backgroundColor: `${tierCfg.color}33` }}
                >
                  {tierCfg.text}
                </span>
              </div>
              <div className="flex items-center gap-4 text-white/50 text-[12px]">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{headquartersCity}, {headquartersState}</span>
                <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{website}</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{accountManager}</span>
              </div>
            </div>

            <div className="text-right text-white/40 text-[11px]">
              <div className="flex items-center gap-1.5 justify-end">
                <Calendar className="w-3 h-3" />
                {fmtDate(contractStart)} — {fmtDate(contractEnd)}
              </div>
              {contractDays > 0 && contractDays < 180 && (
                <span className="inline-flex items-center gap-1 mt-1 text-amber-300 text-[10px] font-medium">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {contractDays}d remaining
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Bar ── */}
      <div className="px-10 -mt-3.5 mb-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {[
            { label: 'YTD Revenue', value: performance.totalRevenueYTD > 0 ? fmtCurrency(performance.totalRevenueYTD) : '—' },
            { label: 'MTD Revenue', value: performance.totalRevenueMTD > 0 ? fmtCurrency(performance.totalRevenueMTD) : '—' },
            { label: 'Avg Order', value: performance.avgOrderValue > 0 ? fmtCurrency(performance.avgOrderValue) : '—' },
            { label: 'Stores', value: storeCount.toLocaleString() },
            { label: 'Fill Rate', value: performance.fillRate > 0 ? `${performance.fillRate}%` : '—' },
            { label: 'On-Time', value: performance.onTimeDelivery > 0 ? `${performance.onTimeDelivery}%` : '—' },
            { label: 'Returns', value: performance.returnRate > 0 ? `${performance.returnRate}%` : '—' },
          ].map((s) => (
            <div key={s.label} className="bg-white shadow-card rounded-lg px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#999] mb-0.5">{s.label}</p>
              <p className="text-[16px] font-semibold text-[#171717] tabular-nums tracking-tight-sm">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="px-10 mb-8">
        <div className="flex items-center gap-0" style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.06)' }}>
          {TABS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all -mb-[1px] ${
                activeTab === value
                  ? 'text-[#171717] border-[#171717]'
                  : 'text-[#999] border-transparent hover:text-[#555]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {value === 'items' && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#f5f5f5] text-[#888]">
                  {authorizedItems.length}
                </span>
              )}
              {value === 'compliance' && compliance.some((c) => c.status === 'action-required') && (
                <span className="w-[6px] h-[6px] rounded-full bg-red-500 ml-0.5" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-10 pb-12">
        {activeTab === 'overview' && <OverviewTab retailer={retailer} brandBreakdown={brandBreakdown} />}
        {activeTab === 'items' && (
          <ItemsTab
            items={filteredItems} allItems={authorizedItems} search={itemSearch}
            onSearchChange={setItemSearch} statusFilter={itemStatusFilter}
            onStatusFilterChange={setItemStatusFilter}
          />
        )}
        {activeTab === 'contacts' && <ContactsTab retailer={retailer} />}
        {activeTab === 'compliance' && <ComplianceTab retailer={retailer} />}
        {activeTab === 'displays' && <DisplaysTab retailer={retailer} />}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   OVERVIEW
   ═══════════════════════════════════════ */
function OverviewTab({ retailer, brandBreakdown }: { retailer: Retailer; brandBreakdown: [Brand, { count: number; totalUnits: number }][] }) {
  const { performance, regions, notes, tags, defaultTierCount, maxDisplayHeight, palletDimensions, compliance, displayHistory } = retailer
  const totalUnits = brandBreakdown.reduce((sum, [, d]) => sum + d.totalUnits, 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Brand Mix */}
        <div className="bg-white shadow-card rounded-lg p-6">
          <h3 className="text-[14px] font-semibold text-[#171717] tracking-tight-sm mb-5">Brand Mix — Monthly Units</h3>
          <div className="space-y-3">
            {brandBreakdown.map(([brand, data]) => {
              const pct = totalUnits > 0 ? (data.totalUnits / totalUnits) * 100 : 0
              return (
                <div key={brand} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: BRAND_COLORS[brand] }} />
                  <span className="text-[12px] font-medium text-[#555] w-16 capitalize">{brand}</span>
                  <div className="flex-1 h-[22px] bg-[#f8f8f8] rounded overflow-hidden">
                    <div
                      className="h-full rounded flex items-center justify-end pr-2 transition-all duration-700"
                      style={{ width: `${Math.max(pct, 6)}%`, backgroundColor: BRAND_COLORS[brand] }}
                    >
                      <span className="text-[10px] font-semibold text-white tabular-nums">
                        {data.totalUnits.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-[#999] w-12 text-right tabular-nums">
                    {data.count} SKU{data.count !== 1 ? 's' : ''}
                  </span>
                </div>
              )
            })}
            {brandBreakdown.length === 0 && (
              <p className="text-[13px] text-[#999] text-center py-6">No authorized items yet</p>
            )}
          </div>
        </div>

        {/* Display Config */}
        <div className="bg-white shadow-card rounded-lg p-6">
          <h3 className="text-[14px] font-semibold text-[#171717] tracking-tight-sm mb-5">Display Configuration</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Default Tiers', value: String(defaultTierCount) },
              { label: 'Max Height', value: `${maxDisplayHeight}"` },
              { label: 'Pallet Footprint', value: `${palletDimensions.width}" × ${palletDimensions.depth}"` },
              { label: 'Pallet Height', value: `${palletDimensions.height}"` },
            ].map((c) => (
              <div key={c.label} className="bg-[#fafafa] rounded-md p-4 text-center">
                <p className="text-[20px] font-semibold text-[#171717] tabular-nums tracking-tight-sm">{c.value}</p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#999] mt-1">{c.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Gauges */}
        {performance.displayComplianceScore > 0 && (
          <div className="bg-white shadow-card rounded-lg p-6">
            <h3 className="text-[14px] font-semibold text-[#171717] tracking-tight-sm mb-5">Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: 'Fill Rate', value: performance.fillRate, target: 95 },
                { label: 'On-Time', value: performance.onTimeDelivery, target: 95 },
                { label: 'Compliance', value: performance.displayComplianceScore, target: 90 },
                { label: 'Return Rate', value: performance.returnRate, target: 2, inverted: true },
              ].map((m) => {
                const ok = m.inverted ? m.value <= m.target : m.value >= m.target
                const stroke = ok ? '#22c55e' : '#f59e0b'
                const dash = m.inverted ? Math.max(0, 100 - (m.value / m.target) * 50) : m.value
                return (
                  <div key={m.label} className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f0f0f0" strokeWidth="2.5" />
                        <circle
                          cx="18" cy="18" r="15.9" fill="none" stroke={stroke} strokeWidth="2.5"
                          strokeDasharray={`${dash} 100`} strokeLinecap="round"
                          className="animate-gauge"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[13px] font-semibold text-[#171717] tabular-nums">{m.value}%</span>
                      </div>
                    </div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[#999]">{m.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        <SidebarSection title="Regions">
          <div className="flex flex-wrap gap-1.5">
            {regions.map((r) => (
              <span key={r} className="px-2.5 py-1 rounded text-[11px] font-medium text-[#555] bg-[#f5f5f5]">{r}</span>
            ))}
          </div>
        </SidebarSection>

        {tags.length > 0 && (
          <SidebarSection title="Tags">
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="px-2.5 py-1 rounded text-[11px] font-medium text-[#0a72ef] bg-[#0a72ef]/5">{t}</span>
              ))}
            </div>
          </SidebarSection>
        )}

        <SidebarSection title="Compliance">
          <div className="space-y-2">
            {compliance.map((c) => {
              const cfg = COMPLIANCE_STATUS[c.status]
              const Icon = cfg.icon
              return (
                <div key={c.id} className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cfg.color }} />
                  <span className="text-[11px] text-[#555] truncate">{c.requirement}</span>
                </div>
              )
            })}
          </div>
        </SidebarSection>

        {notes && (
          <SidebarSection title="Notes">
            <p className="text-[12px] text-[#666] leading-[1.6]">{notes}</p>
          </SidebarSection>
        )}

        {displayHistory.length > 0 && (
          <SidebarSection title="Recent Displays">
            <div className="space-y-2">
              {displayHistory.slice(0, 3).map((dh) => {
                const ds = DISPLAY_STATUS[dh.status] ?? DISPLAY_STATUS.draft
                return (
                  <div key={dh.id} className="flex items-center justify-between py-1.5" style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.03)' }}>
                    <div>
                      <p className="text-[11px] font-medium text-[#333]">{dh.projectName}</p>
                      <p className="text-[10px] text-[#999]">{fmtDate(dh.createdAt)}</p>
                    </div>
                    <span className="px-1.5 py-[1px] rounded text-[9px] font-medium" style={{ color: ds.color, backgroundColor: ds.bg }}>
                      {ds.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </SidebarSection>
        )}
      </div>
    </div>
  )
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white shadow-card rounded-lg p-5">
      <h4 className="text-[12px] font-semibold text-[#171717] tracking-tight-sm mb-3">{title}</h4>
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════
   ITEMS
   ═══════════════════════════════════════ */
function ItemsTab({
  items, allItems, search, onSearchChange, statusFilter, onStatusFilterChange,
}: {
  items: AuthorizedItem[]; allItems: AuthorizedItem[]; search: string
  onSearchChange: (v: string) => void
  statusFilter: 'all' | 'authorized' | 'pending' | 'discontinued'
  onStatusFilterChange: (v: 'all' | 'authorized' | 'pending' | 'discontinued') => void
}) {
  const counts = {
    authorized: allItems.filter((i) => i.status === 'authorized').length,
    pending: allItems.filter((i) => i.status === 'pending').length,
    discontinued: allItems.filter((i) => i.status === 'discontinued').length,
  }

  return (
    <div>
      {/* Stat chips */}
      <div className="flex items-center gap-3 mb-6">
        {[
          { label: 'Authorized', count: counts.authorized, color: '#15803d', bg: '#f0fdf4' },
          { label: 'Pending', count: counts.pending, color: '#b45309', bg: '#fffbeb' },
          { label: 'Discontinued', count: counts.discontinued, color: '#888', bg: '#f5f5f5' },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-2 px-4 py-2.5 rounded-lg" style={{ backgroundColor: c.bg }}>
            <span className="text-[18px] font-semibold tabular-nums" style={{ color: c.color }}>{c.count}</span>
            <span className="text-[11px] font-medium" style={{ color: c.color }}>{c.label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-[340px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999]" />
          <input
            type="text" value={search} onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, SKU, or brand..."
            className="w-full pl-9 pr-4 py-2 text-[13px] shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none placeholder:text-[#aaa]"
          />
        </div>
        <div className="flex items-center shadow-ring rounded-md overflow-hidden">
          {(['all', 'authorized', 'pending', 'discontinued'] as const).map((v) => (
            <button
              key={v} onClick={() => onStatusFilterChange(v)}
              className={`px-3 py-[6px] text-[11px] font-medium capitalize transition-colors ${
                statusFilter === v ? 'bg-[#171717] text-white' : 'bg-white text-[#666] hover:bg-[#fafafa]'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-card rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.06)' }}>
              {['Product', 'Brand', 'Status', 'Avg Monthly', 'Margin', 'Auth Date', 'Last Order'].map((h, i) => (
                <th key={h} className={`px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-[#999] ${i >= 3 ? 'text-right' : 'text-left'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const st = ITEM_STATUS[item.status]
              const StIcon = st.icon
              return (
                <tr key={item.productId} className="hover:bg-[#fafafa] transition-colors" style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.03)' }}>
                  <td className="px-5 py-3">
                    <p className="text-[13px] font-medium text-[#171717]">{item.productName}</p>
                    <p className="text-[11px] text-[#999] font-mono">{item.sku}</p>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BRAND_COLORS[item.brand] }} />
                      <span className="text-[12px] font-medium text-[#555] capitalize">{item.brand}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded text-[10px] font-medium" style={{ color: st.color, backgroundColor: st.bg }}>
                      <StIcon className="w-2.5 h-2.5" />
                      {st.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-[13px] font-medium text-[#171717] tabular-nums">
                      {item.avgMonthlyUnits > 0 ? item.avgMonthlyUnits.toLocaleString() : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={`text-[13px] font-medium tabular-nums ${
                      item.marginPercent >= 35 ? 'text-[#15803d]' : item.marginPercent >= 25 ? 'text-[#171717]' : 'text-[#b45309]'
                    }`}>
                      {item.marginPercent}%
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right"><span className="text-[11px] text-[#999]">{fmtDate(item.authorizedDate)}</span></td>
                  <td className="px-5 py-3 text-right"><span className="text-[11px] text-[#999]">{item.lastOrderDate ? fmtDate(item.lastOrderDate) : '—'}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="py-16 text-center">
            <Package className="w-7 h-7 text-[#ddd] mx-auto mb-2" />
            <p className="text-[13px] text-[#999]">No items match your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   CONTACTS
   ═══════════════════════════════════════ */
function ContactsTab({ retailer }: { retailer: Retailer }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {retailer.contacts.map((c) => (
        <div
          key={c.id}
          className={`bg-white rounded-lg p-5 transition-shadow ${
            c.isPrimary ? 'shadow-elevated' : 'shadow-card hover:shadow-card-hover'
          }`}
        >
          {c.isPrimary && (
            <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded text-[10px] font-medium text-[#0a72ef] bg-[#0a72ef]/5 mb-3">
              <Star className="w-2.5 h-2.5 fill-[#0a72ef]" />
              Primary
            </span>
          )}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[13px] font-semibold text-[#888]">
              {c.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#171717]">{c.name}</p>
              <p className="text-[11px] text-[#888]">{c.title}</p>
            </div>
          </div>
          <div className="space-y-2">
            <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-[12px] text-[#555] hover:text-[#0a72ef] transition-colors">
              <Mail className="w-3 h-3 text-[#bbb]" />{c.email}
            </a>
            <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-[12px] text-[#555] hover:text-[#0a72ef] transition-colors">
              <Phone className="w-3 h-3 text-[#bbb]" />{c.phone}
            </a>
          </div>
        </div>
      ))}
      {retailer.contacts.length === 0 && (
        <div className="col-span-full py-16 text-center">
          <Users className="w-7 h-7 text-[#ddd] mx-auto mb-2" />
          <p className="text-[13px] text-[#999]">No contacts on file</p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════
   COMPLIANCE
   ═══════════════════════════════════════ */
function ComplianceTab({ retailer }: { retailer: Retailer }) {
  const actionRequired = retailer.compliance.filter((c) => c.status === 'action-required')
  const pendingReview = retailer.compliance.filter((c) => c.status === 'pending-review')
  const compliant = retailer.compliance.filter((c) => c.status === 'compliant')

  const groups = [
    { title: 'Action Required', items: actionRequired },
    { title: 'Pending Review', items: pendingReview },
    { title: 'Compliant', items: compliant },
  ].filter((g) => g.items.length > 0)

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-card rounded-lg p-6 flex items-center gap-6">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f0f0f0" strokeWidth="2.5" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke={retailer.performance.displayComplianceScore >= 90 ? '#22c55e' : retailer.performance.displayComplianceScore >= 80 ? '#f59e0b' : '#ef4444'}
              strokeWidth="2.5"
              strokeDasharray={`${retailer.performance.displayComplianceScore} 100`}
              strokeLinecap="round" className="animate-gauge"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[17px] font-semibold text-[#171717] tabular-nums">
              {retailer.performance.displayComplianceScore > 0 ? `${retailer.performance.displayComplianceScore}%` : '—'}
            </span>
          </div>
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-[#171717] tracking-tight-sm">Overall Compliance</h3>
          <p className="text-[12px] text-[#888] mt-0.5">
            {retailer.compliance.length} requirements &middot;{' '}
            {actionRequired.length > 0
              ? <span className="text-red-600 font-medium">{actionRequired.length} need attention</span>
              : <span className="text-[#15803d] font-medium">All clear</span>}
          </p>
        </div>
      </div>

      {groups.map(({ title, items }) => (
        <div key={title}>
          <h4 className="text-[11px] font-medium uppercase tracking-wider text-[#999] mb-3">{title} ({items.length})</h4>
          <div className="space-y-2">
            {items.map((r) => {
              const cfg = COMPLIANCE_STATUS[r.status]
              const Icon = cfg.icon
              return (
                <div key={r.id} className="bg-white shadow-card rounded-lg p-4 flex items-start gap-3 hover:shadow-card-hover transition-shadow">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.bg }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#171717]">{r.requirement}</p>
                    {r.notes && <p className="text-[11px] text-[#888] mt-1">{r.notes}</p>}
                    <div className="flex items-center gap-4 mt-1.5 text-[10px] text-[#bbb]">
                      <span>Last: {fmtDate(r.lastAuditDate)}</span>
                      <span>
                        Next: {fmtDate(r.nextAuditDate)}
                        {daysUntil(r.nextAuditDate) < 60 && daysUntil(r.nextAuditDate) > 0 && (
                          <span className="text-amber-600 font-medium ml-1">({daysUntil(r.nextAuditDate)}d)</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-[2px] rounded text-[10px] font-medium flex-shrink-0" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                    {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════
   DISPLAYS
   ═══════════════════════════════════════ */
function DisplaysTab({ retailer }: { retailer: Retailer }) {
  const HOLIDAY_LABELS: Record<string, string> = { 'rosh-hashanah': 'Rosh Hashanah', pesach: 'Pesach', sukkos: 'Sukkos', none: 'General' }

  if (retailer.displayHistory.length === 0) {
    return (
      <div className="py-20 text-center">
        <Layers className="w-8 h-8 text-[#ddd] mx-auto mb-2" />
        <p className="text-[13px] font-medium text-[#555]">No display projects yet</p>
        <p className="text-[11px] text-[#999] mt-1">Create a new display for this retailer</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {retailer.displayHistory.map((dh) => {
        const ds = DISPLAY_STATUS[dh.status] ?? DISPLAY_STATUS.draft
        return (
          <div key={dh.id} className="bg-white shadow-card rounded-lg px-5 py-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow cursor-pointer group">
            <div className="w-10 h-10 rounded-md bg-[#f5f5f5] flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4 text-[#bbb]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[13px] font-medium text-[#171717]">{dh.projectName}</p>
                <span className="px-1.5 py-[1px] rounded text-[9px] font-medium" style={{ color: ds.color, backgroundColor: ds.bg }}>{ds.label}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#999]">
                <span>{HOLIDAY_LABELS[dh.holiday] ?? dh.holiday}</span>
                <span>{dh.tierCount} tiers</span>
                <span>{dh.productCount} products</span>
                <span>{fmtDate(dh.createdAt)}</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#ddd] group-hover:text-[#0a72ef] transition-colors" />
          </div>
        )
      })}
    </div>
  )
}
