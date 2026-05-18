import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { DisplayProject, Product, Retailer } from '../../types'

interface ProgramItemPickerProps {
  halfPallet: DisplayProject | null
  fullPallet: DisplayProject | null
  retailer: Retailer
  products: Product[]
  readOnly?: boolean
  onToggle: (palletId: string, productId: string, selected: boolean) => void
}

function getSelectedSet(pallet: DisplayProject | null): Set<string> {
  if (!pallet) return new Set()
  if (pallet.selectedProductIds) return new Set(pallet.selectedProductIds)
  return new Set(pallet.assortment.map((entry) => entry.productId))
}

export function ProgramItemPicker({
  halfPallet,
  fullPallet,
  retailer,
  products,
  readOnly,
  onToggle,
}: ProgramItemPickerProps) {
  const [search, setSearch] = useState('')
  const [selectedOnly, setSelectedOnly] = useState(false)

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  )

  const halfSelected = useMemo(() => getSelectedSet(halfPallet), [halfPallet])
  const fullSelected = useMemo(() => getSelectedSet(fullPallet), [fullPallet])

  const authorizedMap = useMemo(
    () => new Map(retailer.authorizedItems.map((item) => [item.productId, item])),
    [retailer.authorizedItems],
  )

  const rows = useMemo(() => {
    const ids = new Set<string>()
    for (const item of retailer.authorizedItems) {
      if (item.status === 'authorized') ids.add(item.productId)
    }
    halfSelected.forEach((id) => ids.add(id))
    fullSelected.forEach((id) => ids.add(id))

    return Array.from(ids)
      .map((id) => {
        const product = productMap.get(id)
        const auth = authorizedMap.get(id)
        return {
          id,
          name: product?.name ?? id,
          upc: product?.upc ?? '',
          kaycoItemNumber: product?.kaycoItemNumber ?? '',
          retailerItemNumber: auth?.sku ?? '',
          unitsPerCase: product?.unitsPerCase ?? null,
          brand: product?.brandCode || product?.brand || '',
        }
      })
      .sort(
        (a, b) =>
          a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name),
      )
  }, [retailer.authorizedItems, productMap, authorizedMap, halfSelected, fullSelected])

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return rows.filter((row) => {
      const onHalf = halfSelected.has(row.id)
      const onFull = fullSelected.has(row.id)
      if (selectedOnly && !onHalf && !onFull) return false
      if (!query) return true
      return (
        row.name.toLowerCase().includes(query) ||
        row.kaycoItemNumber.toLowerCase().includes(query) ||
        row.retailerItemNumber.toLowerCase().includes(query) ||
        row.upc.toLowerCase().includes(query) ||
        row.brand.toLowerCase().includes(query)
      )
    })
  }, [rows, search, selectedOnly, halfSelected, fullSelected])

  const halfCount = halfSelected.size
  const fullCount = fullSelected.size

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[260px] max-w-[480px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${rows.length} items by name, Kayco #, UPC, brand…`}
            className="w-full pl-9 pr-9 h-9 text-[13px] shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none placeholder:text-[#aaa]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#666]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <label className="inline-flex items-center gap-1.5 text-[12px] text-[#555] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={selectedOnly}
            onChange={(e) => setSelectedOnly(e.target.checked)}
            className="accent-[#171717]"
          />
          Selected only
        </label>
        <div className="ml-auto flex items-center gap-3 text-[11px] text-[#666] tabular-nums">
          {halfPallet && (
            <span>
              Half: <span className="font-semibold text-emerald-700">{halfCount}</span>
            </span>
          )}
          {fullPallet && (
            <span>
              Full: <span className="font-semibold text-blue-700">{fullCount}</span>
            </span>
          )}
        </div>
      </div>

      <div className="bg-white shadow-card rounded-xl overflow-hidden">
        <div className="overflow-auto max-h-[70vh]">
          <table className="w-full border-separate border-spacing-0">
            <thead className="sticky top-0 z-10 bg-white">
              <tr>
                <th className="text-left text-[10px] font-medium uppercase tracking-wider text-[#999] px-6 py-3 bg-white border-b border-[#f0f0f0]">
                  Product
                </th>
                <th className="text-left text-[10px] font-medium uppercase tracking-wider text-[#999] px-3 py-3 bg-white border-b border-[#f0f0f0]">
                  Brand
                </th>
                <th className="text-left text-[10px] font-medium uppercase tracking-wider text-[#999] px-3 py-3 bg-white border-b border-[#f0f0f0]">
                  UPC
                </th>
                <th className="text-left text-[10px] font-medium uppercase tracking-wider text-[#999] px-3 py-3 bg-white border-b border-[#f0f0f0]">
                  Kayco #
                </th>
                <th className="text-left text-[10px] font-medium uppercase tracking-wider text-[#999] px-3 py-3 bg-white border-b border-[#f0f0f0]">
                  Retailer #
                </th>
                <th className="text-right text-[10px] font-medium uppercase tracking-wider text-[#999] px-3 py-3 bg-white border-b border-[#f0f0f0]">
                  Pack
                </th>
                {halfPallet && (
                  <th className="text-center text-[10px] font-medium uppercase tracking-wider text-emerald-700 px-3 py-3 bg-white border-b border-[#f0f0f0] w-[90px]">
                    Half
                  </th>
                )}
                {fullPallet && (
                  <th className="text-center text-[10px] font-medium uppercase tracking-wider text-blue-700 px-3 py-3 bg-white border-b border-[#f0f0f0] w-[90px]">
                    Full
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6 + (halfPallet ? 1 : 0) + (fullPallet ? 1 : 0)}
                    className="px-6 py-12 text-center text-[12px] text-[#888]"
                  >
                    {rows.length === 0
                      ? `No authorized items for ${retailer.name} yet.`
                      : 'No items match your search.'}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const onHalf = halfSelected.has(row.id)
                  const onFull = fullSelected.has(row.id)
                  const bothOn =
                    (!halfPallet || onHalf) && (!fullPallet || onFull)
                  const rowSelected = onHalf || onFull
                  const toggleBoth = () => {
                    if (readOnly) return
                    // Clicking the row fills in both pallets unless they're
                    // already both selected, in which case it clears them.
                    const target = !bothOn
                    if (halfPallet && onHalf !== target) {
                      onToggle(halfPallet.id, row.id, target)
                    }
                    if (fullPallet && onFull !== target) {
                      onToggle(fullPallet.id, row.id, target)
                    }
                  }
                  return (
                    <tr
                      key={row.id}
                      onClick={toggleBoth}
                      className={`group transition-colors ${
                        readOnly ? '' : 'cursor-pointer'
                      } ${rowSelected ? 'bg-[#fafafa]' : 'hover:bg-[#fafafa]'}`}
                      style={{ boxShadow: '0 -1px 0 0 rgba(0,0,0,0.04)' }}
                    >
                      <td className="px-6 py-2.5">
                        <p className="text-[13px] text-[#171717]">{row.name}</p>
                      </td>
                      <td className="px-3 py-2.5 text-[11px] text-[#777] capitalize">
                        {row.brand || '—'}
                      </td>
                      <td className="px-3 py-2.5 text-[11px] text-[#888] font-mono">
                        {row.upc || '—'}
                      </td>
                      <td className="px-3 py-2.5 text-[11px] text-[#888] font-mono">
                        {row.kaycoItemNumber || '—'}
                      </td>
                      <td className="px-3 py-2.5 text-[11px] text-[#888] font-mono">
                        {row.retailerItemNumber || '—'}
                      </td>
                      <td className="px-3 py-2.5 text-[11px] text-[#888] text-right tabular-nums">
                        {row.unitsPerCase ?? '—'}
                      </td>
                      {halfPallet && (
                        <td
                          className="px-3 py-2.5 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <PickerCheck
                            checked={onHalf}
                            tone="half"
                            disabled={readOnly}
                            onChange={(next) => onToggle(halfPallet.id, row.id, next)}
                          />
                        </td>
                      )}
                      {fullPallet && (
                        <td
                          className="px-3 py-2.5 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <PickerCheck
                            checked={onFull}
                            tone="full"
                            disabled={readOnly}
                            onChange={(next) => onToggle(fullPallet.id, row.id, next)}
                          />
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function PickerCheck({
  checked,
  tone,
  disabled,
  onChange,
}: {
  checked: boolean
  tone: 'half' | 'full'
  disabled?: boolean
  onChange: (next: boolean) => void
}) {
  const accent = tone === 'half' ? 'accent-emerald-600' : 'accent-blue-600'
  return (
    <label className="inline-flex items-center justify-center cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className={`w-4 h-4 ${accent}`}
      />
    </label>
  )
}
