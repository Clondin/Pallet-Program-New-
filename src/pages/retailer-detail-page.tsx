import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Boxes,
  Building2,
  ChevronRight,
  Globe,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  Shield,
  Star,
  User,
} from 'lucide-react'
import { useRetailerStore } from '../stores/retailer-store'
import { useDisplayStore } from '../stores/display-store'
import { PalletWizard } from '../components/Wizard/PalletWizard'
import type { WizardPalletConfig } from '../components/Wizard/wizardTypes'
import { BRAND_COLORS } from '../lib/mock-data'
import type { Brand, DisplayProject, Holiday, Retailer } from '../types'

type Tab = 'pallets' | 'overview' | 'items' | 'contacts' | 'compliance'

const TABS: { value: Tab; label: string }[] = [
  { value: 'pallets', label: 'Pallets' },
  { value: 'overview', label: 'Overview' },
  { value: 'items', label: 'Items' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'compliance', label: 'Compliance' },
]

const TIER_LABEL: Record<string, { text: string; color: string }> = {
  enterprise: { text: 'Enterprise', color: '#7c3aed' },
  premium: { text: 'Premium', color: '#0a72ef' },
  standard: { text: 'Standard', color: '#666' },
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  authorized: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  discontinued: { bg: 'bg-[#f5f5f5]', text: 'text-[#999]', dot: 'bg-[#ccc]' },
  compliant: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'action-required': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  'pending-review': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  inactive: { bg: 'bg-[#f5f5f5]', text: 'text-[#999]', dot: 'bg-[#ccc]' },
}

function formatHoliday(holiday: Holiday) {
  if (holiday === 'none') return 'Everyday'
  return holiday
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function fmtCurrency(v: number) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`
  return `$${v}`
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_COLORS[status] ?? STATUS_COLORS.inactive
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status.replace(/-/g, ' ')}
    </span>
  )
}

function PalletCard({ pallet, retailerId }: { pallet: DisplayProject; retailerId: string }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/retailers/${retailerId}/pallets/${pallet.id}`)}
      className="group bg-white shadow-card rounded-lg p-4 hover:shadow-elevated transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[14px] font-semibold text-[#171717]">{pallet.name}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] font-medium text-[#888]">
              {formatHoliday(pallet.holiday)}
            </span>
            <span className="text-[#ddd]">/</span>
            <span className="text-[11px] font-medium text-[#888] capitalize">
              {pallet.palletType}
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#ccc] group-hover:text-[#0a72ef] transition-colors mt-1" />
      </div>

      <div className="flex items-center gap-4 mt-4 text-[11px] text-[#999]">
        <span className="tabular-nums">{pallet.placements.length} products</span>
        <span className="tabular-nums">{pallet.tierCount} tiers</span>
        <span className="ml-auto tabular-nums">{formatDate(pallet.updatedAt)}</span>
      </div>
    </div>
  )
}

function OverviewTab({ retailer }: { retailer: Retailer }) {
  const brandSet = new Set(
    retailer.authorizedItems.filter((i) => i.status === 'authorized').map((i) => i.brand)
  )
  const brands = Array.from(brandSet) as Brand[]

  return (
    <div className="space-y-6">
      {/* Info grid */}
      <div className="bg-white shadow-card rounded-lg">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Headquarters', value: `${retailer.headquartersCity}, ${retailer.headquartersState}` },
            { label: 'Stores', value: retailer.storeCount.toLocaleString() },
            { label: 'Account Manager', value: retailer.accountManager },
            { label: 'Contract', value: `${retailer.contractStart} — ${retailer.contractEnd || 'Ongoing'}` },
          ].map((item, i) => (
            <div
              key={item.label}
              className="px-5 py-4"
              style={i > 0 ? { boxShadow: '-1px 0 0 0 rgba(0,0,0,0.04)' } : undefined}
            >
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#bbb]">{item.label}</p>
              <p className="text-[13px] font-medium text-[#171717] mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance */}
        <div className="bg-white shadow-card rounded-lg p-5">
          <h3 className="text-[13px] font-semibold text-[#171717] mb-4">Performance</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'YTD Revenue', value: fmtCurrency(retailer.performance.totalRevenueYTD) },
              { label: 'Fill Rate', value: `${retailer.performance.fillRate}%` },
              { label: 'On-Time', value: `${retailer.performance.onTimeDelivery}%` },
              { label: 'MTD Revenue', value: fmtCurrency(retailer.performance.totalRevenueMTD) },
              { label: 'Avg Order', value: fmtCurrency(retailer.performance.avgOrderValue) },
              { label: 'Return Rate', value: `${retailer.performance.returnRate}%` },
            ].map((m) => (
              <div key={m.label}>
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#bbb]">{m.label}</p>
                <p className="text-[14px] font-semibold text-[#171717] tabular-nums mt-0.5">{m.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Regions + Brands */}
        <div className="bg-white shadow-card rounded-lg p-5">
          <h3 className="text-[13px] font-semibold text-[#171717] mb-4">Regions</h3>
          <div className="flex flex-wrap gap-1.5 mb-5">
            {retailer.regions.map((region) => (
              <span key={region} className="px-2.5 py-1 rounded-md bg-[#f5f5f5] text-[11px] font-medium text-[#555]">
                {region}
              </span>
            ))}
          </div>
          <h3 className="text-[13px] font-semibold text-[#171717] mb-3">Brands</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {brands.map((brand) => (
              <span
                key={brand}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-white"
                style={{ backgroundColor: BRAND_COLORS[brand] }}
              >
                {brand.charAt(0).toUpperCase() + brand.slice(1)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {retailer.notes && (
        <div className="bg-white shadow-card rounded-lg p-5">
          <h3 className="text-[13px] font-semibold text-[#171717] mb-2">Notes</h3>
          <p className="text-[13px] text-[#555] leading-relaxed">{retailer.notes}</p>
        </div>
      )}
    </div>
  )
}

function ItemsTab({ retailer }: { retailer: Retailer }) {
  const grouped = useMemo(() => {
    const map = new Map<string, typeof retailer.authorizedItems>()
    for (const item of retailer.authorizedItems) {
      const key = item.status
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return map
  }, [retailer.authorizedItems])

  const order = ['authorized', 'pending', 'discontinued']

  return (
    <div className="bg-white shadow-card rounded-lg overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_100px_100px_90px] gap-4 px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-[#bbb]" style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.04)' }}>
        <span>Product</span>
        <span className="text-right">Monthly Units</span>
        <span className="text-right">Margin</span>
        <span className="text-right">Status</span>
      </div>

      {order.map((status) => {
        const items = grouped.get(status)
        if (!items?.length) return null

        return items.map((item) => (
          <div
            key={`${item.productId}-${item.sku}`}
            className="grid grid-cols-[1fr_100px_100px_90px] gap-4 px-5 py-3 items-center hover:bg-[#fafafa] transition-colors"
            style={{ boxShadow: '0 -1px 0 0 rgba(0,0,0,0.03)' }}
          >
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-[#171717] truncate">{item.productName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-[#999] font-mono">{item.sku}</span>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: BRAND_COLORS[item.brand as Brand] }}
                />
              </div>
            </div>
            <p className="text-[12px] text-[#555] tabular-nums text-right">
              {item.avgMonthlyUnits > 0 ? item.avgMonthlyUnits.toLocaleString() : '--'}
            </p>
            <p className="text-[12px] text-[#555] tabular-nums text-right">
              {item.marginPercent > 0 ? `${item.marginPercent}%` : '--'}
            </p>
            <div className="text-right">
              <StatusBadge status={item.status} />
            </div>
          </div>
        ))
      })}
    </div>
  )
}

function ContactsTab({ retailer }: { retailer: Retailer }) {
  return (
    <div className="bg-white shadow-card rounded-lg overflow-hidden">
      {retailer.contacts.map((contact, i) => (
        <div
          key={contact.id}
          className="flex items-center gap-5 px-5 py-4"
          style={i > 0 ? { boxShadow: '0 -1px 0 0 rgba(0,0,0,0.04)' } : undefined}
        >
          <div className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center shrink-0">
            <span className="text-[12px] font-semibold text-[#888]">
              {contact.name.split(' ').map((n) => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-[#171717]">{contact.name}</p>
              {contact.isPrimary && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#0a72ef]/10 text-[#0a72ef]">Primary</span>
              )}
            </div>
            <p className="text-[11px] text-[#888] mt-0.5">{contact.title}</p>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-[#555] shrink-0">
            <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 hover:text-[#0a72ef] transition-colors">
              <Mail className="w-3.5 h-3.5" />
              {contact.email}
            </a>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#bbb]" />
              {contact.phone}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ComplianceTab({ retailer }: { retailer: Retailer }) {
  return (
    <div className="bg-white shadow-card rounded-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_120px_120px_100px] gap-4 px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-[#bbb]" style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.04)' }}>
        <span>Requirement</span>
        <span>Last Audit</span>
        <span>Next Audit</span>
        <span className="text-right">Status</span>
      </div>

      {retailer.compliance.map((record) => (
        <div
          key={record.id}
          className="grid grid-cols-[1fr_120px_120px_100px] gap-4 px-5 py-3.5 items-center"
          style={{ boxShadow: '0 -1px 0 0 rgba(0,0,0,0.03)' }}
        >
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-[#171717] truncate">{record.requirement}</p>
            {record.notes && (
              <p className="text-[11px] text-[#999] mt-0.5 truncate">{record.notes}</p>
            )}
          </div>
          <p className="text-[12px] text-[#555]">{record.lastAuditDate}</p>
          <p className="text-[12px] text-[#555]">{record.nextAuditDate}</p>
          <div className="text-right">
            <StatusBadge status={record.status} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function RetailerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const retailer = useRetailerStore((state) => state.getRetailer(id ?? ''))
  const projects = useDisplayStore((state) => state.projects)
  const pallets = useMemo(
    () => projects.filter((p) => p.retailerId === (id ?? '')).sort((a, b) => b.updatedAt - a.updatedAt),
    [projects, id],
  )
  const [activeTab, setActiveTab] = useState<Tab>('pallets')
  const [wizardOpen, setWizardOpen] = useState(false)
  const createProject = useDisplayStore((state) => state.createProject)

  const handleWizardComplete = (config: WizardPalletConfig) => {
    const project = createProject(
      config.name,
      {
        palletType: config.type === 'custom' ? 'full' : config.type,
        season: 'none',
        retailerId: id ?? '',
      },
      config.display.tierCount,
    )
    setWizardOpen(false)
    navigate(`/retailers/${id}/pallets/${project.id}`)
  }

  const tierCfg = TIER_LABEL[retailer?.tier ?? 'standard']

  const authorizedCount = retailer?.authorizedItems.filter((i) => i.status === 'authorized').length ?? 0

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

  return (
    <div className="px-10 py-10 max-w-[1400px]">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/retailers')}
        className="flex items-center gap-1.5 text-[#999] hover:text-[#171717] text-[12px] font-medium mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Retailers
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-semibold tracking-display text-[#171717]">
              {retailer.name}
            </h1>
            {retailer.tier === 'enterprise' && (
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            )}
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ color: tierCfg.color, backgroundColor: `${tierCfg.color}10` }}
            >
              {tierCfg.text}
            </span>
            <StatusBadge status={retailer.status} />
          </div>
          <div className="flex items-center gap-4 mt-2 text-[12px] text-[#888]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {retailer.headquartersCity}, {retailer.headquartersState}
            </span>
            {retailer.website && (
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {retailer.website}
              </span>
            )}
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {retailer.accountManager}
            </span>
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {authorizedCount} SKUs
            </span>
          </div>
        </div>

        <button
          onClick={() => setWizardOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#171717] text-white text-[13px] font-medium hover:bg-[#333] transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          New Pallet
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 mb-6" style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.06)' }}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-3 text-[13px] font-medium transition-colors relative ${
              activeTab === tab.value ? 'text-[#171717]' : 'text-[#999] hover:text-[#555]'
            }`}
          >
            {tab.label}
            {activeTab === tab.value && (
              <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#171717] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'pallets' && (
        <>
          {pallets.length === 0 ? (
            <div className="bg-white shadow-card rounded-lg py-16 text-center">
              <Boxes className="w-7 h-7 text-[#ccc] mx-auto mb-3" />
              <p className="text-[14px] font-medium text-[#171717]">No pallets yet</p>
              <p className="text-[12px] text-[#888] mt-1 mb-5">
                Create the first pallet for {retailer.name}
              </p>
              <button
                onClick={() => setWizardOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#171717] text-white text-[12px] font-medium hover:bg-[#333] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New Pallet
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {pallets.map((pallet) => (
                <PalletCard key={pallet.id} pallet={pallet} retailerId={retailer.id} />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'overview' && <OverviewTab retailer={retailer} />}
      {activeTab === 'items' && <ItemsTab retailer={retailer} />}
      {activeTab === 'contacts' && <ContactsTab retailer={retailer} />}
      {activeTab === 'compliance' && <ComplianceTab retailer={retailer} />}

      <PalletWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onComplete={handleWizardComplete}
      />
    </div>
  )
}
