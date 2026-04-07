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
  User,
} from 'lucide-react'
import { useRetailerStore } from '../stores/retailer-store'
import { useDisplayStore } from '../stores/display-store'
import { PalletCreationWizard } from '../components/PalletCreationWizard'
import type { DisplayProject, Holiday, Retailer } from '../types'

type Tab = 'pallets' | 'overview' | 'items' | 'contacts' | 'compliance'

const TABS: { value: Tab; label: string }[] = [
  { value: 'pallets', label: 'Pallets' },
  { value: 'overview', label: 'Overview' },
  { value: 'items', label: 'Authorized Items' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'compliance', label: 'Compliance' },
]

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
    year: 'numeric',
  })
}

function PpStat({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="bg-white shadow-card rounded-lg px-5 py-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-[#999]">{label}</p>
      <p className="text-[20px] font-semibold text-[#171717] mt-1">{value}</p>
      <p className="text-[12px] text-[#888] mt-1">{helper}</p>
    </div>
  )
}

function PalletCard({
  pallet,
  retailerId,
}: {
  pallet: DisplayProject
  retailerId: string
}) {
  const navigate = useNavigate()

  return (
    <div className="bg-white shadow-card rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[16px] font-semibold text-[#171717]">{pallet.name}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="px-2 py-1 rounded-md bg-[#f5f5f5] text-[11px] font-medium text-[#555]">
              {formatHoliday(pallet.holiday)}
            </span>
            <span className="px-2 py-1 rounded-md bg-[#f5f5f5] text-[11px] font-medium text-[#555] capitalize">
              {pallet.palletType} pallet
            </span>
          </div>
        </div>

        <button
          onClick={() =>
            navigate(`/retailers/${retailerId}/pallets/${pallet.id}`)
          }
          className="text-[12px] font-medium text-[#0a72ef] hover:text-[#0759bb] transition-colors inline-flex items-center gap-1"
        >
          Open
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-5">
        <div className="rounded-lg bg-[#fafafa] px-3 py-3">
          <p className="text-[10px] uppercase tracking-wider text-[#999]">Products</p>
          <p className="text-[15px] font-semibold text-[#171717] mt-1">
            {pallet.placements.length}
          </p>
        </div>
        <div className="rounded-lg bg-[#fafafa] px-3 py-3">
          <p className="text-[10px] uppercase tracking-wider text-[#999]">Tiers</p>
          <p className="text-[15px] font-semibold text-[#171717] mt-1">
            {pallet.tierCount}
          </p>
        </div>
        <div className="rounded-lg bg-[#fafafa] px-3 py-3">
          <p className="text-[10px] uppercase tracking-wider text-[#999]">Updated</p>
          <p className="text-[15px] font-semibold text-[#171717] mt-1">
            {formatDate(pallet.updatedAt)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <button
          onClick={() =>
            navigate(`/retailers/${retailerId}/pallets/${pallet.id}`)
          }
          className="px-3 py-2 rounded-md text-[12px] font-medium shadow-border bg-white text-[#555] hover:bg-[#fafafa] transition-colors"
        >
          Details
        </button>
        <button
          onClick={() =>
            navigate(`/retailers/${retailerId}/pallets/${pallet.id}/editor`)
          }
          className="px-3 py-2 rounded-md text-[12px] font-medium bg-[#171717] text-white hover:bg-[#333] transition-colors"
        >
          Open Editor
        </button>
      </div>
    </div>
  )
}

function OverviewTab({ retailer, palletCount }: { retailer: Retailer; palletCount: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
      <div className="bg-white shadow-card rounded-xl p-6">
        <h3 className="text-[15px] font-semibold text-[#171717]">Retailer Context</h3>
        <div className="grid grid-cols-2 gap-4 mt-5">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#999]">Headquarters</p>
            <p className="text-[14px] font-medium text-[#171717] mt-1">
              {retailer.headquartersCity}, {retailer.headquartersState}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#999]">Stores</p>
            <p className="text-[14px] font-medium text-[#171717] mt-1">
              {retailer.storeCount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#999]">Default tier count</p>
            <p className="text-[14px] font-medium text-[#171717] mt-1">
              {retailer.defaultTierCount}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#999]">Pallets in app</p>
            <p className="text-[14px] font-medium text-[#171717] mt-1">{palletCount}</p>
          </div>
        </div>
        {retailer.notes && (
          <div className="mt-6 pt-6" style={{ boxShadow: '0 -1px 0 0 rgba(0,0,0,0.06)' }}>
            <p className="text-[11px] uppercase tracking-wider text-[#999]">Notes</p>
            <p className="text-[13px] text-[#555] mt-2 leading-relaxed">{retailer.notes}</p>
          </div>
        )}
      </div>

      <div className="bg-white shadow-card rounded-xl p-6">
        <h3 className="text-[15px] font-semibold text-[#171717]">Regions</h3>
        <div className="flex flex-wrap gap-2 mt-4">
          {retailer.regions.map((region) => (
            <span
              key={region}
              className="px-2.5 py-1.5 rounded-md bg-[#f5f5f5] text-[12px] font-medium text-[#555]"
            >
              {region}
            </span>
          ))}
        </div>
        <div className="mt-6 pt-6" style={{ boxShadow: '0 -1px 0 0 rgba(0,0,0,0.06)' }}>
          <p className="text-[11px] uppercase tracking-wider text-[#999]">Performance</p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-lg bg-[#fafafa] px-3 py-3">
              <p className="text-[10px] uppercase tracking-wider text-[#999]">YTD Revenue</p>
              <p className="text-[14px] font-semibold text-[#171717] mt-1">
                ${Math.round(retailer.performance.totalRevenueYTD / 1000)}K
              </p>
            </div>
            <div className="rounded-lg bg-[#fafafa] px-3 py-3">
              <p className="text-[10px] uppercase tracking-wider text-[#999]">Display Score</p>
              <p className="text-[14px] font-semibold text-[#171717] mt-1">
                {retailer.performance.displayComplianceScore}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ItemsTab({ retailer }: { retailer: Retailer }) {
  return (
    <div className="bg-white shadow-card rounded-xl overflow-hidden">
      <div className="px-6 py-5">
        <h3 className="text-[15px] font-semibold text-[#171717]">Authorized Items</h3>
      </div>
      <div style={{ boxShadow: '0 -1px 0 0 rgba(0,0,0,0.06)' }}>
        {retailer.authorizedItems.map((item) => (
          <div
            key={`${item.productId}-${item.sku}`}
            className="px-6 py-4 flex items-center justify-between gap-4"
            style={{ boxShadow: '0 -1px 0 0 rgba(0,0,0,0.04)' }}
          >
            <div>
              <p className="text-[13px] font-medium text-[#171717]">{item.productName}</p>
              <p className="text-[12px] text-[#888] mt-1">{item.sku}</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-medium text-[#555] capitalize">{item.status}</p>
              <p className="text-[11px] text-[#999] mt-1">
                {item.avgMonthlyUnits.toLocaleString()} avg monthly units
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContactsTab({ retailer }: { retailer: Retailer }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {retailer.contacts.map((contact) => (
        <div key={contact.id} className="bg-white shadow-card rounded-xl p-5">
          <p className="text-[15px] font-semibold text-[#171717]">{contact.name}</p>
          <p className="text-[12px] text-[#888] mt-1">{contact.title}</p>
          <div className="mt-4 space-y-2 text-[12px] text-[#555]">
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              {contact.email}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" />
              {contact.phone}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function ComplianceTab({ retailer }: { retailer: Retailer }) {
  return (
    <div className="grid gap-4">
      {retailer.compliance.map((record) => (
        <div key={record.id} className="bg-white shadow-card rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[15px] font-semibold text-[#171717]">{record.requirement}</p>
              <p className="text-[12px] text-[#888] mt-1">{record.notes ?? 'No notes'}</p>
            </div>
            <span className="px-2 py-1 rounded-md bg-[#f5f5f5] text-[11px] font-medium text-[#555] capitalize">
              {record.status}
            </span>
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
  const pallets = useDisplayStore((state) => state.getProjectsForRetailer(id ?? ''))
  const [activeTab, setActiveTab] = useState<Tab>('pallets')
  const [wizardOpen, setWizardOpen] = useState(false)

  const stats = useMemo(() => {
    const productCount = pallets.reduce(
      (sum, pallet) => sum + pallet.placements.length,
      0
    )
    return {
      pallets: pallets.length,
      products: productCount,
      holidays: new Set(pallets.map((pallet) => pallet.holiday)).size,
    }
  }, [pallets])

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
      <button
        onClick={() => navigate('/retailers')}
        className="flex items-center gap-1.5 text-[#777] hover:text-[#171717] text-[12px] font-medium mb-5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Retailers
      </button>

      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-[28px] font-semibold tracking-display text-[#171717]">
            {retailer.name}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-[13px] text-[#666] flex-wrap">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {retailer.headquartersCity}, {retailer.headquartersState}
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              {retailer.website}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {retailer.accountManager}
            </span>
          </div>
        </div>

        <button
          onClick={() => setWizardOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#171717] text-white text-[13px] font-medium hover:bg-[#333] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Pallet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <PpStat
          label="Pallets"
          value={String(stats.pallets)}
          helper="Built for this retailer"
        />
        <PpStat
          label="Placed Products"
          value={String(stats.products)}
          helper="Across all active pallets"
        />
        <PpStat
          label="Authorized SKUs"
          value={String(retailer.authorizedItems.length)}
          helper="Available to this retailer"
        />
        <PpStat
          label="Holiday Modes"
          value={String(stats.holidays)}
          helper="Distinct seasonal setups"
        />
      </div>

      <div className="flex items-center gap-0 mb-8" style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.06)' }}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-3 text-[13px] font-medium transition-colors relative ${
              activeTab === tab.value ? 'text-[#171717]' : 'text-[#888] hover:text-[#555]'
            }`}
          >
            {tab.label}
            {activeTab === tab.value && (
              <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#171717] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'pallets' && (
        <>
          {pallets.length === 0 ? (
            <div className="bg-white shadow-card rounded-xl py-20 text-center">
              <Boxes className="w-8 h-8 text-[#ccc] mx-auto mb-4" />
              <p className="text-[15px] font-medium text-[#171717]">No pallets yet</p>
              <p className="text-[12px] text-[#888] mt-2">
                Create the first pallet for {retailer.name}.
              </p>
              <button
                onClick={() => setWizardOpen(true)}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#171717] text-white text-[13px] font-medium hover:bg-[#333] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New Pallet
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {pallets.map((pallet) => (
                <PalletCard key={pallet.id} pallet={pallet} retailerId={retailer.id} />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'overview' && (
        <OverviewTab retailer={retailer} palletCount={stats.pallets} />
      )}

      {activeTab === 'items' && <ItemsTab retailer={retailer} />}

      {activeTab === 'contacts' && <ContactsTab retailer={retailer} />}

      {activeTab === 'compliance' && <ComplianceTab retailer={retailer} />}

      <PalletCreationWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        retailerId={retailer.id}
      />
    </div>
  )
}
