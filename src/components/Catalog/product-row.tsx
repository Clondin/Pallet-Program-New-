import { useState } from 'react'
import { ChevronRight, MoreVertical, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '../../types'
import { BRAND_COLORS } from '../../lib/mock-data'
import { useCatalogStore } from '../../stores/catalog-store'

const HOLIDAY_LABELS: Record<string, string> = {
  'rosh-hashanah': 'RH',
  pesach: 'PESACH',
  sukkos: 'SUKKOS',
  none: 'NONE',
}

const HOLIDAY_COLORS: Record<string, { color: string; bg: string }> = {
  'rosh-hashanah': { color: '#15803d', bg: '#f0fdf4' },
  pesach: { color: '#0a72ef', bg: '#eff6ff' },
  sukkos: { color: '#b45309', bg: '#fffbeb' },
  none: { color: '#999', bg: '#f5f5f5' },
}

interface ProductRowProps {
  product: Product
}

export function ProductRow({ product }: ProductRowProps) {
  const navigate = useNavigate()
  const deleteProduct = useCatalogStore((s) => s.deleteProduct)
  const [showMenu, setShowMenu] = useState(false)

  const brandColor = BRAND_COLORS[product.brand]
  const holidayTag = product.holidayTags.length > 0 ? product.holidayTags[0] : 'none'
  const holidayStyle = HOLIDAY_COLORS[holidayTag] ?? HOLIDAY_COLORS.none

  return (
    <tr
      className="group cursor-pointer transition-colors hover:bg-[#fafafa]"
      style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.03)' }}
      onClick={() => navigate(`/catalog/${product.id}`)}
    >
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center text-white text-[9px] font-semibold uppercase shrink-0"
            style={{ backgroundColor: brandColor }}
          >
            {product.brand.slice(0, 2)}
          </div>
          <div>
            <div className="text-[13px] font-medium text-[#171717]">{product.name}</div>
            <div className="text-[11px] text-[#999] font-mono">{product.sku}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brandColor }} />
          <span className="text-[12px] font-medium text-[#555] capitalize">{product.brand}</span>
        </div>
      </td>
      <td className="px-5 py-3">
        <span className="text-[12px] text-[#555]">{product.category}</span>
      </td>
      <td className="px-5 py-3">
        <span className="text-[11px] text-[#888] font-mono tabular-nums">
          {product.width}" × {product.height}" × {product.depth}"
        </span>
      </td>
      <td className="px-5 py-3">
        <span className="text-[12px] text-[#888] tabular-nums">{product.weight} lb</span>
      </td>
      <td className="px-5 py-3">
        <span
          className="text-[10px] font-medium px-2 py-[2px] rounded"
          style={{ color: holidayStyle.color, backgroundColor: holidayStyle.bg }}
        >
          {HOLIDAY_LABELS[holidayTag]}
        </span>
      </td>
      <td className="px-5 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <div className="relative">
            <button
              className="p-1 rounded-md hover:bg-[#f5f5f5] text-[#ccc] hover:text-[#888] transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu((current) => !current)
              }}
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white shadow-elevated rounded-lg z-20 py-1 w-36">
                <button
                  className="w-full text-left px-3 py-2 text-[12px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteProduct(product.id)
                    setShowMenu(false)
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-[#bbb] transition-transform group-hover:translate-x-0.5" />
        </div>
      </td>
    </tr>
  )
}
