import { useEffect, useMemo, useRef, useState } from 'react'
import { Minus, Package, Plus } from 'lucide-react'
import { useCatalogStore } from '../../stores/catalog-store'
import { useDisplayStore } from '../../stores/display-store'
import { useRetailerStore } from '../../stores/retailer-store'
import {
  buildAssortmentRows,
  computeAssortmentTotals,
} from '../../lib/assortment-utils'
import type { DisplayProject, Retailer } from '../../types'

interface AssortmentTableProps {
  project: DisplayProject
  retailer: Retailer
}

export function AssortmentTable({ project, retailer }: AssortmentTableProps) {
  const [search, setSearch] = useState('')
  const products = useCatalogStore((state) => state.products)
  const updateAssortment = useDisplayStore((state) => state.updateAssortment)
  const populateFromAssortment = useDisplayStore((state) => state.populateFromAssortment)
  const updateAuthorizedItemCasePrice = useRetailerStore(
    (state) => state.updateAuthorizedItemCasePrice,
  )

  // Auto-populate pallet when assortment changes
  const prevAssortmentRef = useRef(JSON.stringify(project.assortment))
  useEffect(() => {
    const current = JSON.stringify(project.assortment)
    if (current !== prevAssortmentRef.current) {
      prevAssortmentRef.current = current
      populateFromAssortment()
    }
  }, [project.assortment, populateFromAssortment])

  const rows = useMemo(
    () => buildAssortmentRows(retailer, project, products),
    [products, project, retailer],
  )

  const filteredRows = useMemo(() => {
    if (!search) return rows

    const query = search.toLowerCase()
    return rows.filter(
      (row) =>
        row.productName.toLowerCase().includes(query) ||
        row.sku.toLowerCase().includes(query),
    )
  }, [rows, search])

  const totals = useMemo(
    () => computeAssortmentTotals(project.assortment, products, retailer),
    [products, project.assortment, retailer],
  )

  return (
    <div className="bg-white shadow-card rounded-xl overflow-hidden">
      <div className="px-6 pt-5 pb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-[#171717]">Assortment</h3>
          <p className="text-[12px] text-[#888] mt-1">
            {totals.totalSKUs} SKUs · {totals.totalCases} cases · {totals.totalUnits} units
          </p>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products..."
          className="w-full sm:w-[220px] px-3 py-1.5 text-[12px] shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-[#f0f0f0]">
              <th className="text-left text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-6 py-3">
                Product
              </th>
              <th className="text-left text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-4 py-3">
                UPC
              </th>
              <th className="text-left text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-4 py-3">
                Kayco #
              </th>
              <th className="text-right text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-4 py-3">
                Pack
              </th>
              <th className="text-right text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-4 py-3">
                Case Price
              </th>
              <th className="text-right text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-4 py-3">
                Cases
              </th>
              <th className="text-right text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-4 py-3">
                Revenue
              </th>
              <th className="text-right text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-6 py-3">
                Total Units
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center">
                  <Package className="w-6 h-6 text-[#ccc] mx-auto mb-2" />
                  <p className="text-[12px] text-[#888]">No authorized products found</p>
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr
                  key={row.productId}
                  className="border-t border-[#f5f5f5] hover:bg-[#fafafa] transition-colors"
                >
                  <td className="px-6 py-3">
                    <p className="text-[13px] font-medium text-[#171717]">
                      {row.productName}
                    </p>
                    <p className="text-[11px] text-[#999]">{row.brand}</p>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#666] font-mono">{row.upc || '—'}</td>
                  <td className="px-4 py-3 text-[12px] text-[#666] font-mono">
                    {row.kaycoItemNumber || '—'}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#666] text-right tabular-nums">
                    {row.unitsPerCase ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-[12px] text-[#999]">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={row.casePrice ?? ''}
                        onChange={(event) => {
                          const val = event.target.value.replace(/[^0-9.]/g, '')
                          if (val === '') {
                            updateAuthorizedItemCasePrice(retailer.id, row.productId, null)
                            return
                          }
                          const num = parseFloat(val)
                          updateAuthorizedItemCasePrice(
                            retailer.id,
                            row.productId,
                            isNaN(num) ? null : num,
                          )
                        }}
                        placeholder="0.00"
                        className="w-[64px] h-7 px-2 text-[12px] text-right tabular-nums shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-0">
                      <button
                        onClick={() => updateAssortment(row.productId, Math.max(0, row.cases - 1))}
                        className="flex items-center justify-center w-7 h-7 rounded-l-md border border-[#e5e5e5] bg-[#fafafa] hover:bg-[#f0f0f0] text-[#666] transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={row.cases || ''}
                        onChange={(event) => {
                          const val = event.target.value.replace(/\D/g, '')
                          updateAssortment(row.productId, parseInt(val, 10) || 0)
                        }}
                        placeholder="0"
                        className="w-[44px] h-7 px-1 text-[13px] text-center tabular-nums border-y border-[#e5e5e5] bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:border-transparent"
                      />
                      <button
                        onClick={() => updateAssortment(row.productId, row.cases + 1)}
                        className="flex items-center justify-center w-7 h-7 rounded-r-md border border-[#e5e5e5] bg-[#fafafa] hover:bg-[#f0f0f0] text-[#666] transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] font-medium text-[#171717] text-right tabular-nums">
                    {row.totalRevenue !== null
                      ? `$${row.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : '—'}
                  </td>
                  <td className="px-6 py-3 text-[13px] font-medium text-[#171717] text-right tabular-nums">
                    {row.totalUnits ?? '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {filteredRows.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-[#e5e5e5] bg-[#fafafa]">
                <td
                  className="px-6 py-3 text-[12px] font-semibold text-[#171717]"
                  colSpan={5}
                >
                  Totals
                </td>
                <td className="px-4 py-3 text-[13px] font-semibold text-[#171717] text-right tabular-nums">
                  {totals.totalCases}
                </td>
                <td className="px-4 py-3 text-[13px] font-semibold text-[#171717] text-right tabular-nums">
                  {totals.totalRevenue > 0
                    ? `$${totals.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : '—'}
                </td>
                <td className="px-6 py-3 text-[13px] font-semibold text-[#171717] text-right tabular-nums">
                  {totals.totalUnits}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
