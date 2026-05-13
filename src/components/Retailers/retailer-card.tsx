import { ArrowUpRight, Pencil, Trash2 } from 'lucide-react'
import type { Retailer } from '../../types'
import { useDisplayStore } from '../../stores/display-store'

const STATUS_STYLE = {
  active: { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  pending: { dot: 'bg-amber-400', text: 'text-amber-700' },
  inactive: { dot: 'bg-[#ccc]', text: 'text-[#999]' },
}

interface RetailerCardProps {
  retailer: Retailer
  onClick: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function RetailerCard({ retailer, onClick, onEdit, onDelete }: RetailerCardProps) {
  const { id, name, status } = retailer
  const statusStyle = STATUS_STYLE[status]
  const projects = useDisplayStore((state) => state.projects)
  const retailerPallets = projects.filter((p) => p.retailerId === id)

  const palletCount = retailerPallets.reduce((sum, p) => sum + (p.quantity ?? 1), 0)
  const itemIds = new Set<string>()
  let caseCount = 0
  for (const pallet of retailerPallets) {
    const qty = pallet.quantity ?? 1
    for (const entry of pallet.assortment) {
      if (entry.cases > 0) {
        itemIds.add(entry.productId)
        caseCount += entry.cases * qty
      }
    }
  }
  const itemCount = itemIds.size

  const isEmpty = retailerPallets.length === 0

  return (
    <div
      onClick={() => onClick(id)}
      className={`group relative rounded-xl shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer overflow-hidden p-5 ${
        isEmpty
          ? 'bg-[#fafafa] border border-dashed border-[#e5e5e5]'
          : 'bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className={`text-[16px] font-semibold truncate ${
              isEmpty ? 'text-[#666]' : 'text-[#171717]'
            }`}
          >
            {name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-[6px] h-[6px] rounded-full ${statusStyle.dot}`} />
            <span className={`text-[10px] font-medium capitalize ${statusStyle.text}`}>
              {status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(id)
            }}
            className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full bg-[#fafafa] hover:bg-[#f0f0f0] flex items-center justify-center transition-all"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5 text-[#888]" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(id)
            }}
            className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full bg-[#fafafa] hover:bg-red-50 flex items-center justify-center transition-all"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#c0392b]" />
          </button>
          <div className="w-7 h-7 rounded-full bg-[#fafafa] group-hover:bg-[#171717] flex items-center justify-center transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#999] group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>

      {isEmpty ? (
        <p className="mt-4 text-[12px] italic text-[#aaa]">No pallets yet</p>
      ) : (
        <div className="flex items-center gap-3 mt-4 text-[12px] text-[#666] tabular-nums">
          <span>
            {palletCount} pallet{palletCount === 1 ? '' : 's'}
          </span>
          <span className="text-[#ddd]">·</span>
          <span>
            {itemCount} item{itemCount === 1 ? '' : 's'}
          </span>
          <span className="text-[#ddd]">·</span>
          <span>
            {caseCount} case{caseCount === 1 ? '' : 's'}
          </span>
        </div>
      )}
    </div>
  )
}
