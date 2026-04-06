import {
  Pencil,
  Trash2,
  MapPin,
  Package,
  ChevronRight,
  Star,
  Clock,
  AlertCircle,
} from 'lucide-react'
import type { Retailer, Brand } from '../../types'
import { BRAND_COLORS } from '../../lib/mock-data'

const RETAILER_GRADIENT: Record<string, string> = {
  Walmart: 'from-[#0071DC] to-[#004F9A]',
  Costco: 'from-[#E31837] to-[#B71234]',
  ShopRite: 'from-[#D4213D] to-[#A8192F]',
  'Stop & Shop': 'from-[#E21A2C] to-[#B51523]',
  Kroger: 'from-[#0268B1] to-[#01548D]',
  'Whole Foods': 'from-[#00674B] to-[#004D38]',
  ALDI: 'from-[#00005F] to-[#000040]',
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

function fmtCurrency(v: number) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`
  return `$${v}`
}

interface RetailerCardProps {
  retailer: Retailer
  onClick: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function RetailerCard({ retailer, onClick, onEdit, onDelete }: RetailerCardProps) {
  const {
    id, name, status, tier, storeCount, headquartersCity, headquartersState,
    performance, authorizedItems, compliance, regions,
  } = retailer

  const gradient = RETAILER_GRADIENT[name] ?? 'from-[#555] to-[#333]'
  const tierCfg = TIER_LABEL[tier] ?? TIER_LABEL.standard

  const authorizedCount = authorizedItems.filter((i) => i.status === 'authorized').length
  const pendingCount = authorizedItems.filter((i) => i.status === 'pending').length
  const complianceIssues = compliance.filter((c) => c.status === 'action-required').length

  const brandSet = new Set(
    authorizedItems.filter((i) => i.status === 'authorized').map((i) => i.brand)
  )
  const brands = Array.from(brandSet).slice(0, 5) as Brand[]

  return (
    <div
      onClick={() => onClick(id)}
      className="group bg-white rounded-lg shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Header band — compact gradient */}
      <div className={`bg-gradient-to-r ${gradient} px-5 py-3.5 relative`}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-white tracking-tight-sm">{name}</h3>
            {tier === 'enterprise' && (
              <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-[6px] h-[6px] rounded-full ${STATUS_DOT[status]}`} />
            <span className="text-[10px] font-medium text-white/70 capitalize">{status}</span>
          </div>
        </div>
        <div className="relative flex items-center gap-1 mt-0.5 text-white/50">
          <MapPin className="w-2.5 h-2.5" />
          <span className="text-[11px]">
            {headquartersCity}, {headquartersState}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {/* KPI row — tabular numerals */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { label: 'YTD Revenue', value: performance.totalRevenueYTD > 0 ? fmtCurrency(performance.totalRevenueYTD) : '—' },
            { label: 'Stores', value: storeCount.toLocaleString() },
            { label: 'Fill Rate', value: performance.fillRate > 0 ? `${performance.fillRate}%` : '—' },
          ].map((kpi) => (
            <div key={kpi.label}>
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#999]">
                {kpi.label}
              </p>
              <p className="text-[16px] font-semibold text-[#171717] tabular-nums tracking-tight-sm mt-0.5">
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        {/* Items + alerts row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <Package className="w-3 h-3 text-[#999]" />
            <span className="text-[11px] font-medium text-[#555]">
              {authorizedCount} SKUs
            </span>
          </div>
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-amber-700 bg-amber-50">
              <Clock className="w-2.5 h-2.5" />
              {pendingCount} pending
            </span>
          )}
          {complianceIssues > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-red-700 bg-red-50">
              <AlertCircle className="w-2.5 h-2.5" />
              {complianceIssues}
            </span>
          )}
        </div>

        {/* Brand dots */}
        {brands.length > 0 && (
          <div className="flex items-center gap-1 mb-4">
            {brands.map((brand) => (
              <div
                key={brand}
                className="w-[18px] h-[18px] rounded-full shadow-ring"
                style={{ backgroundColor: BRAND_COLORS[brand] }}
                title={brand.charAt(0).toUpperCase() + brand.slice(1)}
              />
            ))}
            {brandSet.size > 5 && (
              <span className="text-[10px] text-[#999] ml-0.5">+{brandSet.size - 5}</span>
            )}
          </div>
        )}

        {/* Compliance bar — minimal */}
        {performance.displayComplianceScore > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-[#999]">Compliance</span>
              <span
                className="text-[11px] font-semibold tabular-nums"
                style={{
                  color:
                    performance.displayComplianceScore >= 90
                      ? '#15803d'
                      : performance.displayComplianceScore >= 80
                      ? '#b45309'
                      : '#dc2626',
                }}
              >
                {performance.displayComplianceScore}%
              </span>
            </div>
            <div className="h-[3px] bg-[#f0f0f0] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${performance.displayComplianceScore}%`,
                  backgroundColor:
                    performance.displayComplianceScore >= 90
                      ? '#22c55e'
                      : performance.displayComplianceScore >= 80
                      ? '#f59e0b'
                      : '#ef4444',
                }}
              />
            </div>
          </div>
        )}

        {/* Tags row — refined pills */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          <span
            className="px-2 py-[2px] rounded text-[10px] font-medium"
            style={{ color: tierCfg.color, backgroundColor: `${tierCfg.color}0a` }}
          >
            {tierCfg.text}
          </span>
          {regions.slice(0, 2).map((region) => (
            <span
              key={region}
              className="px-2 py-[2px] rounded text-[10px] font-medium text-[#888] bg-[#f5f5f5]"
            >
              {region}
            </span>
          ))}
          {regions.length > 2 && (
            <span className="text-[10px] text-[#bbb]">+{regions.length - 2}</span>
          )}
        </div>

        {/* Footer — shadow divider */}
        <div className="flex items-center justify-between pt-3" style={{ boxShadow: '0 -1px 0 0 rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(id) }}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#888] hover:text-[#0a72ef] hover:bg-[#0a72ef]/5 rounded transition-colors"
            >
              <Pencil className="w-2.5 h-2.5" />
              Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(id) }}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#888] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>
          <span className="flex items-center gap-0.5 text-[11px] font-medium text-[#0a72ef] opacity-0 group-hover:opacity-100 transition-opacity">
            Details
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  )
}
