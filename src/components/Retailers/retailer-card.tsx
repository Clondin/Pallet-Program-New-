import {
  MapPin,
  Package,
  ChevronRight,
  Star,
} from 'lucide-react'
import type { Retailer, Brand } from '../../types'
import { BRAND_COLORS } from '../../lib/mock-data'

const STATUS_STYLE = {
  active: { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  pending: { dot: 'bg-amber-400', text: 'text-amber-700' },
  inactive: { dot: 'bg-[#ccc]', text: 'text-[#999]' },
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

export function RetailerCard({ retailer, onClick }: RetailerCardProps) {
  const { id, name, status, tier, storeCount, headquartersCity, headquartersState, performance, authorizedItems } = retailer
  const tierCfg = TIER_LABEL[tier] ?? TIER_LABEL.standard
  const statusStyle = STATUS_STYLE[status]
  const authorizedCount = authorizedItems.filter((i) => i.status === 'authorized').length

  const brandSet = new Set(
    authorizedItems.filter((i) => i.status === 'authorized').map((i) => i.brand)
  )
  const brands = Array.from(brandSet).slice(0, 4) as Brand[]

  return (
    <div
      onClick={() => onClick(id)}
      className="group bg-white rounded-lg shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer overflow-hidden"
    >
      <div className="px-5 py-4">
        {/* Top row: name + status */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-[15px] font-semibold text-[#171717] truncate">{name}</h3>
            {tier === 'enterprise' && (
              <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`w-[6px] h-[6px] rounded-full ${statusStyle.dot}`} />
            <span className={`text-[10px] font-medium capitalize ${statusStyle.text}`}>{status}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-[#999] mb-4">
          <MapPin className="w-3 h-3" />
          <span className="text-[11px]">{headquartersCity}, {headquartersState}</span>
          <span className="mx-1 text-[#ddd]">/</span>
          <span
            className="text-[10px] font-medium"
            style={{ color: tierCfg.color }}
          >
            {tierCfg.text}
          </span>
        </div>

        {/* Metrics row */}
        <div className="flex items-center gap-5 mb-4">
          <div>
            <p className="text-[10px] font-medium text-[#bbb] uppercase tracking-wider">Revenue</p>
            <p className="text-[15px] font-semibold text-[#171717] tabular-nums mt-0.5">
              {performance.totalRevenueYTD > 0 ? fmtCurrency(performance.totalRevenueYTD) : '--'}
            </p>
          </div>
          <div className="w-px h-7 bg-[#f0f0f0]" />
          <div>
            <p className="text-[10px] font-medium text-[#bbb] uppercase tracking-wider">Stores</p>
            <p className="text-[15px] font-semibold text-[#171717] tabular-nums mt-0.5">
              {storeCount.toLocaleString()}
            </p>
          </div>
          <div className="w-px h-7 bg-[#f0f0f0]" />
          <div>
            <p className="text-[10px] font-medium text-[#bbb] uppercase tracking-wider">SKUs</p>
            <p className="text-[15px] font-semibold text-[#171717] tabular-nums mt-0.5">
              {authorizedCount}
            </p>
          </div>
        </div>

        {/* Bottom row: brands + arrow */}
        <div className="flex items-center justify-between pt-3" style={{ boxShadow: '0 -1px 0 0 rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-1">
            {brands.map((brand) => (
              <div
                key={brand}
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: BRAND_COLORS[brand] }}
                title={brand.charAt(0).toUpperCase() + brand.slice(1)}
              />
            ))}
            {brandSet.size > 4 && (
              <span className="text-[10px] text-[#bbb] ml-0.5">+{brandSet.size - 4}</span>
            )}
            {brands.length > 0 && (
              <span className="flex items-center gap-1 ml-2">
                <Package className="w-3 h-3 text-[#ccc]" />
                <span className="text-[10px] text-[#bbb]">{authorizedCount}</span>
              </span>
            )}
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#ccc] group-hover:text-[#0a72ef] transition-colors" />
        </div>
      </div>
    </div>
  )
}
