import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Building2,
  ArrowUpDown,
  Store,
  DollarSign,
  Package,
} from 'lucide-react'
import { useRetailerStore } from '../stores/retailer-store'
import { RetailerCard } from '../components/Retailers/retailer-card'
import { RetailerForm } from '../components/Retailers/retailer-form'
import type { Retailer, RetailerStatus, RetailerTier } from '../types'

const STATUS_FILTERS: { value: RetailerStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
]

type SortKey = 'name' | 'revenue' | 'stores' | 'items'

export function RetailersPage() {
  const { retailers, addRetailer, updateRetailer, deleteRetailer } = useRetailerStore()
  const navigate = useNavigate()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRetailerId, setEditingRetailerId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<RetailerStatus | 'all'>('all')
  const [tierFilter, setTierFilter] = useState<RetailerTier | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortKey>('revenue')

  const editingRetailer = editingRetailerId
    ? retailers.find((r) => r.id === editingRetailerId) ?? null
    : null

  const filteredRetailers = useMemo(() => {
    let result = [...retailers]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.headquartersCity.toLowerCase().includes(q) ||
          r.headquartersState.toLowerCase().includes(q) ||
          r.accountManager.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') result = result.filter((r) => r.status === statusFilter)
    if (tierFilter !== 'all') result = result.filter((r) => r.tier === tierFilter)

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name)
        case 'revenue': return b.performance.totalRevenueYTD - a.performance.totalRevenueYTD
        case 'stores': return b.storeCount - a.storeCount
        case 'items': return b.authorizedItems.length - a.authorizedItems.length
        default: return 0
      }
    })
    return result
  }, [retailers, searchQuery, statusFilter, tierFilter, sortBy])

  const stats = useMemo(() => {
    const active = retailers.filter((r) => r.status === 'active')
    return {
      totalRetailers: retailers.length,
      activeRetailers: active.length,
      totalRevenue: active.reduce((sum, r) => sum + r.performance.totalRevenueYTD, 0),
      totalStores: active.reduce((sum, r) => sum + r.storeCount, 0),
      totalAuthorizedItems: active.reduce(
        (sum, r) => sum + r.authorizedItems.filter((i) => i.status === 'authorized').length,
        0
      ),
    }
  }, [retailers])

  function handleAdd() {
    setEditingRetailerId(null)
    setIsFormOpen(true)
  }

  function handleEdit(id: string) {
    setEditingRetailerId(id)
    setIsFormOpen(true)
  }

  function handleDelete(id: string) {
    const retailer = retailers.find((r) => r.id === id)
    if (!retailer) return
    if (!window.confirm(`Delete "${retailer.name}"? This cannot be undone.`)) return
    deleteRetailer(id)
  }

  function handleSave(data: Omit<Retailer, 'id'> & { id?: string }) {
    if (data.id) {
      const { id, ...updates } = data
      updateRetailer(id, updates)
    } else {
      addRetailer({ ...data, id: `ret-${Date.now()}` } as Retailer)
    }
    setIsFormOpen(false)
    setEditingRetailerId(null)
  }

  function handleCancel() {
    setIsFormOpen(false)
    setEditingRetailerId(null)
  }

  function handleCardClick(id: string) {
    navigate(`/retailers/${id}`)
  }

  function fmtCurrency(value: number) {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
  }

  return (
    <div className="px-10 py-10 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h2 className="text-[28px] font-semibold tracking-display text-[#171717]">
            Retailers
          </h2>
          <p className="text-[14px] text-[#666] mt-1">
            Manage retail accounts, authorized items, and display configurations
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-[#171717] hover:bg-[#333] rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Retailer
        </button>
      </div>

      {/* Summary Stats — shadow-as-border, no CSS borders */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Store, label: 'Active Retailers', value: String(stats.activeRetailers), sub: `${stats.totalRetailers} total`, color: '#0a72ef' },
          { icon: DollarSign, label: 'YTD Revenue', value: fmtCurrency(stats.totalRevenue), sub: 'across active accounts', color: '#15803d' },
          { icon: Building2, label: 'Store Reach', value: stats.totalStores.toLocaleString(), sub: 'locations served', color: '#7c3aed' },
          { icon: Package, label: 'Active SKUs', value: String(stats.totalAuthorizedItems), sub: 'authorized items', color: '#b45309' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="shadow-card bg-white rounded-lg p-5 hover:shadow-card-hover transition-shadow duration-200"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}0a` }}
              >
                <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
              </div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#888]">
                {stat.label}
              </span>
            </div>
            <p className="text-[22px] font-semibold tracking-heading text-[#171717] tabular-nums">
              {stat.value}
            </p>
            <p className="text-[12px] text-[#999] mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters — refined, no heavy borders */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px] max-w-[360px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search retailers, cities, managers..."
            className="w-full pl-9 pr-4 py-2 text-[13px] shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none placeholder:text-[#aaa]"
          />
        </div>

        {/* Status segmented control */}
        <div className="flex items-center shadow-ring rounded-md overflow-hidden">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-3.5 py-[7px] text-[12px] font-medium transition-colors ${
                statusFilter === value
                  ? 'bg-[#171717] text-white'
                  : 'bg-white text-[#666] hover:bg-[#fafafa]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tier select */}
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value as RetailerTier | 'all')}
          className="shadow-border rounded-md px-3 py-[7px] text-[12px] font-medium text-[#555] bg-white focus:outline-none cursor-pointer"
        >
          <option value="all">All Tiers</option>
          <option value="enterprise">Enterprise</option>
          <option value="premium">Premium</option>
          <option value="standard">Standard</option>
        </select>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-1.5">
          <ArrowUpDown className="w-3 h-3 text-[#999]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="text-[12px] font-medium text-[#555] bg-transparent border-none focus:outline-none cursor-pointer"
          >
            <option value="revenue">Revenue</option>
            <option value="name">Name</option>
            <option value="stores">Stores</option>
            <option value="items">Items</option>
          </select>
        </div>
      </div>

      {/* Count */}
      <p className="text-[11px] text-[#999] mb-5">
        {filteredRetailers.length} of {retailers.length} retailers
      </p>

      {/* Grid */}
      {filteredRetailers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 rounded-lg shadow-card flex items-center justify-center mb-4 bg-white">
            <Building2 className="w-5 h-5 text-[#ccc]" />
          </div>
          <p className="text-[14px] font-medium text-[#555]">No retailers found</p>
          <p className="text-[12px] text-[#999] mt-1">
            {searchQuery || statusFilter !== 'all' || tierFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Add your first retailer to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredRetailers.map((retailer) => (
            <RetailerCard
              key={retailer.id}
              retailer={retailer}
              onClick={handleCardClick}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <RetailerForm retailer={editingRetailer} onSave={handleSave} onCancel={handleCancel} />
      )}
    </div>
  )
}
