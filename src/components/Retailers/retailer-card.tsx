import { ArrowUpRight } from 'lucide-react'
import type { Retailer } from '../../types'
import { useDisplayStore } from '../../stores/display-store'

const STATUS_STYLE = {
  active: { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  pending: { dot: 'bg-amber-400', text: 'text-amber-700' },
  inactive: { dot: 'bg-[#ccc]', text: 'text-[#999]' },
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
  const { id, name, status, authorizedItems } = retailer
  const statusStyle = STATUS_STYLE[status]
  const projects = useDisplayStore((state) => state.projects)
  const retailerPallets = projects.filter((p) => p.retailerId === id)
  const halfPallets = retailerPallets.filter((p) => p.palletType === 'half').length
  const fullPallets = retailerPallets.filter((p) => p.palletType === 'full').length
  const uniqueProductIds = new Set<string>()
  for (const pallet of retailerPallets) {
    for (const entry of pallet.assortment) {
      if (entry.cases > 0) uniqueProductIds.add(entry.productId)
    }
  }
  const itemCount = uniqueProductIds.size

  const priceByProduct = new Map<string, number>()
  for (const item of authorizedItems) {
    if (typeof item.casePrice === 'number') {
      priceByProduct.set(item.productId, item.casePrice)
    }
  }
  let computedRevenue = 0
  for (const pallet of retailerPallets) {
    for (const entry of pallet.assortment) {
      const price = priceByProduct.get(entry.productId)
      if (typeof price === 'number' && entry.cases > 0) {
        computedRevenue += price * entry.cases
      }
    }
  }

  return (
    <div
      onClick={() => onClick(id)}
      className="group relative bg-white rounded-xl shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer overflow-hidden p-5"
    >
      {/* Top row: name + status pill + arrow */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h3 className="text-[16px] font-semibold text-[#171717] truncate">{name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-[6px] h-[6px] rounded-full ${statusStyle.dot}`} />
            <span className={`text-[10px] font-medium capitalize ${statusStyle.text}`}>
              {status}
            </span>
          </div>
        </div>
        <div className="shrink-0 w-7 h-7 rounded-full bg-[#fafafa] group-hover:bg-[#171717] flex items-center justify-center transition-colors">
          <ArrowUpRight className="w-3.5 h-3.5 text-[#999] group-hover:text-white transition-colors" />
        </div>
      </div>

      {/* Revenue — hero stat */}
      <div className="mb-4">
        <p className="text-[10px] font-medium text-[#999] uppercase tracking-wider">Revenue</p>
        <p className="text-[24px] font-semibold text-[#171717] tabular-nums tracking-tight mt-0.5">
          {fmtCurrency(computedRevenue)}
        </p>
      </div>

      {/* Pallet breakdown */}
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-[#fafafa] p-3">
        <div>
          <p className="text-[9px] font-medium text-[#999] uppercase tracking-wider">Half</p>
          <p className="text-[14px] font-semibold text-[#171717] tabular-nums mt-0.5">
            {halfPallets}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-medium text-[#999] uppercase tracking-wider">Full</p>
          <p className="text-[14px] font-semibold text-[#171717] tabular-nums mt-0.5">
            {fullPallets}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-medium text-[#999] uppercase tracking-wider">Items</p>
          <p className="text-[14px] font-semibold text-[#171717] tabular-nums mt-0.5">
            {itemCount}
          </p>
        </div>
      </div>

    </div>
  )
}
