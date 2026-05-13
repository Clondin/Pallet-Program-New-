import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { Plus, Search, Trash2, X } from 'lucide-react'
import type { DisplayProject, Product, Retailer } from '../../types'
import { getUnitsPerCase } from '../../lib/assortment-utils'

interface ProgramMatrixProps {
  halfPallet: DisplayProject | null
  fullPallet: DisplayProject | null
  retailer: Retailer
  products: Product[]
  readOnly?: boolean
  onCellChange?: (palletId: string, productId: string, cases: number) => void
  onQuantityChange?: (palletId: string, quantity: number) => void
}

interface MatrixRow {
  productId: string
  productName: string
  upc: string
  kaycoItemNumber: string
  brand: string
  unitsPerCase: number | null
  halfCases: number
  fullCases: number
}

function casesToDraft(cases: number) {
  return cases > 0 ? String(cases) : ''
}

function CellInput({
  cases,
  onCommit,
  disabled,
}: {
  cases: number
  onCommit: (value: number) => void
  disabled?: boolean
}) {
  const [draft, setDraft] = useState(() => casesToDraft(cases))

  useEffect(() => {
    const parsed = parseFloat(draft)
    const current = isNaN(parsed) ? 0 : parsed
    if (current !== cases) setDraft(casesToDraft(cases))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cases])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    let val = event.target.value.replace(/[^\d.]/g, '')
    const firstDot = val.indexOf('.')
    if (firstDot !== -1) {
      val =
        val.slice(0, firstDot + 1) +
        val.slice(firstDot + 1).replace(/\./g, '')
    }
    setDraft(val)
    const num = parseFloat(val)
    onCommit(isNaN(num) ? 0 : num)
  }

  function handleBlur() {
    setDraft(casesToDraft(cases))
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={draft}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      placeholder="0"
      className="w-[64px] h-7 px-2 text-[12px] text-right tabular-nums shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none disabled:bg-[#fafafa] disabled:text-[#999]"
    />
  )
}

function QuantityInput({
  value,
  onCommit,
  disabled,
}: {
  value: number
  onCommit: (next: number) => void
  disabled?: boolean
}) {
  const [draft, setDraft] = useState(() => String(value))

  useEffect(() => {
    const parsed = parseInt(draft, 10)
    if ((isNaN(parsed) ? 0 : parsed) !== value) setDraft(String(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <input
      type="text"
      inputMode="numeric"
      value={draft}
      onChange={(e) => {
        const val = e.target.value.replace(/\D/g, '')
        setDraft(val)
        const num = parseInt(val, 10)
        if (!isNaN(num) && num >= 1) onCommit(num)
      }}
      onBlur={() => setDraft(String(value))}
      disabled={disabled}
      className="w-[64px] h-7 px-2 text-[13px] font-semibold text-center tabular-nums shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none disabled:bg-[#fafafa] disabled:text-[#999]"
    />
  )
}

export function ProgramMatrix({
  halfPallet,
  fullPallet,
  retailer,
  products,
  readOnly,
  onCellChange,
  onQuantityChange,
}: ProgramMatrixProps) {
  const [extraVisibleIds, setExtraVisibleIds] = useState<Set<string>>(new Set())
  const [pickerOpen, setPickerOpen] = useState(false)
  const [search, setSearch] = useState('')

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  )

  const rows: MatrixRow[] = useMemo(() => {
    const ids = new Set<string>()
    halfPallet?.assortment.forEach((entry) => ids.add(entry.productId))
    fullPallet?.assortment.forEach((entry) => ids.add(entry.productId))
    extraVisibleIds.forEach((id) => ids.add(id))

    return Array.from(ids)
      .map<MatrixRow>((id) => {
        const product = productMap.get(id)
        const halfCases =
          halfPallet?.assortment.find((entry) => entry.productId === id)?.cases ?? 0
        const fullCases =
          fullPallet?.assortment.find((entry) => entry.productId === id)?.cases ?? 0
        return {
          productId: id,
          productName: product?.name ?? id,
          upc: product?.upc ?? '',
          kaycoItemNumber: product?.kaycoItemNumber ?? '',
          brand: product?.brandCode || product?.brand || '',
          unitsPerCase: product ? getUnitsPerCase(product) : null,
          halfCases,
          fullCases,
        }
      })
      .sort(
        (left, right) =>
          left.brand.localeCompare(right.brand) ||
          left.productName.localeCompare(right.productName),
      )
  }, [halfPallet, fullPallet, extraVisibleIds, productMap])

  const halfQty = halfPallet?.quantity ?? 1
  const fullQty = fullPallet?.quantity ?? 1

  const totals = useMemo(() => {
    let totalCases = 0
    let totalUnits = 0
    for (const row of rows) {
      const cases = row.halfCases * halfQty + row.fullCases * fullQty
      totalCases += cases
      if (row.unitsPerCase) totalUnits += cases * row.unitsPerCase
    }
    return { totalCases, totalUnits }
  }, [rows, halfQty, fullQty])

  const authorizedIds = useMemo(
    () => retailer.authorizedItems.filter((i) => i.status === 'authorized').map((i) => i.productId),
    [retailer.authorizedItems],
  )

  const pickerOptions = useMemo(() => {
    const onTable = new Set(rows.map((r) => r.productId))
    const query = search.trim().toLowerCase()
    return authorizedIds
      .filter((id) => !onTable.has(id))
      .map((id) => productMap.get(id))
      .filter((product): product is Product => Boolean(product))
      .filter((product) => {
        if (!query) return true
        return (
          product.name.toLowerCase().includes(query) ||
          (product.kaycoItemNumber ?? '').toLowerCase().includes(query) ||
          (product.upc ?? '').toLowerCase().includes(query) ||
          (product.brandCode ?? '').toLowerCase().includes(query)
        )
      })
      .slice(0, 50)
  }, [authorizedIds, productMap, rows, search])

  function addItem(productId: string) {
    setExtraVisibleIds((prev) => new Set(prev).add(productId))
    setSearch('')
  }

  function removeRow(productId: string) {
    if (halfPallet) onCellChange?.(halfPallet.id, productId, 0)
    if (fullPallet) onCellChange?.(fullPallet.id, productId, 0)
    setExtraVisibleIds((prev) => {
      const next = new Set(prev)
      next.delete(productId)
      return next
    })
  }

  const palletColumns: { pallet: DisplayProject | null; label: string }[] = [
    { pallet: halfPallet, label: 'Half pallet' },
    { pallet: fullPallet, label: 'Full pallet' },
  ]

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setPickerOpen((v) => !v)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#171717] text-white text-[12px] font-medium hover:bg-[#333] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add item
          </button>
          {pickerOpen && (
            <div className="relative flex-1 min-w-[300px] max-w-[460px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999]" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search authorized items by name, Kayco #, UPC…"
                className="w-full pl-9 pr-9 py-2 text-[13px] shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none placeholder:text-[#aaa]"
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
              {search && (
                <div className="absolute z-20 mt-1 w-full max-h-72 overflow-y-auto bg-white shadow-elevated rounded-md">
                  {pickerOptions.length === 0 ? (
                    <p className="px-3 py-3 text-[12px] text-[#888]">No matches.</p>
                  ) : (
                    pickerOptions.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addItem(product.id)}
                        className="w-full px-3 py-2 text-left hover:bg-[#fafafa] transition-colors"
                      >
                        <p className="text-[12px] font-medium text-[#171717] truncate">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-[#999] font-mono mt-0.5">
                          {product.kaycoItemNumber ? `Kayco #${product.kaycoItemNumber}` : ''}
                          {product.upc ? ` · UPC ${product.upc}` : ''}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-white shadow-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f0f0f0]">
                <th className="text-left text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-6 py-3 sticky left-0 bg-white z-10">
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
                {palletColumns.map(({ pallet, label }) =>
                  pallet ? (
                    <th
                      key={label}
                      className="text-right text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-4 py-3 min-w-[120px]"
                    >
                      <div className="flex flex-col items-end gap-1.5">
                        <span>{label}</span>
                        <div className="flex items-center gap-1 normal-case">
                          <span className="text-[9px] text-[#bbb] font-normal">
                            qty
                          </span>
                          <QuantityInput
                            value={pallet.quantity ?? 1}
                            disabled={readOnly}
                            onCommit={(next) =>
                              onQuantityChange?.(pallet.id, next)
                            }
                          />
                        </div>
                      </div>
                    </th>
                  ) : null,
                )}
                <th className="text-right text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-4 py-3">
                  Total Cases
                </th>
                <th className="text-right text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-6 py-3">
                  Total Units
                </th>
                {!readOnly && <th className="w-10" />}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6 + palletColumns.filter((c) => c.pallet).length}
                    className="px-6 py-12 text-center text-[12px] text-[#888]"
                  >
                    No items yet. Click <strong>Add item</strong> above to start building this program.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const orderCases =
                    row.halfCases * halfQty + row.fullCases * fullQty
                  const orderUnits = row.unitsPerCase
                    ? orderCases * row.unitsPerCase
                    : null
                  return (
                    <tr
                      key={row.productId}
                      className="border-t border-[#f5f5f5] hover:bg-[#fafafa] transition-colors"
                    >
                      <td className="px-6 py-2.5 sticky left-0 bg-white z-10">
                        <p className="text-[13px] font-medium text-[#171717]">
                          {row.productName}
                        </p>
                        {row.brand && (
                          <p className="text-[11px] text-[#999] capitalize">
                            {row.brand}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-[#666] font-mono">
                        {row.upc || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-[#666] font-mono">
                        {row.kaycoItemNumber || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-[#666] text-right tabular-nums">
                        {row.unitsPerCase ?? '—'}
                      </td>
                      {halfPallet && (
                        <td className="px-4 py-2.5 text-right">
                          <CellInput
                            cases={row.halfCases}
                            disabled={readOnly}
                            onCommit={(value) =>
                              onCellChange?.(halfPallet.id, row.productId, value)
                            }
                          />
                        </td>
                      )}
                      {fullPallet && (
                        <td className="px-4 py-2.5 text-right">
                          <CellInput
                            cases={row.fullCases}
                            disabled={readOnly}
                            onCommit={(value) =>
                              onCellChange?.(fullPallet.id, row.productId, value)
                            }
                          />
                        </td>
                      )}
                      <td className="px-4 py-2.5 text-[13px] font-semibold text-[#171717] text-right tabular-nums">
                        {orderCases || '—'}
                      </td>
                      <td className="px-6 py-2.5 text-[13px] font-medium text-[#171717] text-right tabular-nums">
                        {orderUnits ?? '—'}
                      </td>
                      {!readOnly && (
                        <td className="px-2 py-2.5 text-right">
                          <button
                            onClick={() => removeRow(row.productId)}
                            aria-label={`Remove ${row.productName}`}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md text-[#bbb] hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-[#e5e5e5] bg-[#fafafa]">
                  <td
                    className="px-6 py-3 text-[12px] font-semibold text-[#171717] sticky left-0 bg-[#fafafa] z-10"
                    colSpan={4}
                  >
                    Order totals
                  </td>
                  {halfPallet && (
                    <td className="px-4 py-3 text-[13px] font-semibold text-[#171717] text-right tabular-nums">
                      {rows.reduce(
                        (sum, row) => sum + row.halfCases * halfQty,
                        0,
                      ) || '—'}
                    </td>
                  )}
                  {fullPallet && (
                    <td className="px-4 py-3 text-[13px] font-semibold text-[#171717] text-right tabular-nums">
                      {rows.reduce(
                        (sum, row) => sum + row.fullCases * fullQty,
                        0,
                      ) || '—'}
                    </td>
                  )}
                  <td className="px-4 py-3 text-[13px] font-semibold text-[#171717] text-right tabular-nums">
                    {totals.totalCases || '—'}
                  </td>
                  <td className="px-6 py-3 text-[13px] font-semibold text-[#171717] text-right tabular-nums">
                    {totals.totalUnits || '—'}
                  </td>
                  {!readOnly && <td />}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
