import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
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
  tone,
}: {
  cases: number
  onCommit: (value: number) => void
  disabled?: boolean
  tone: 'half' | 'full'
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

  const filled = cases > 0
  const bg =
    tone === 'half'
      ? filled
        ? 'bg-emerald-50 ring-emerald-200'
        : 'bg-white ring-[#eee]'
      : filled
        ? 'bg-blue-50 ring-blue-200'
        : 'bg-white ring-[#eee]'

  return (
    <input
      type="text"
      inputMode="decimal"
      value={draft}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      placeholder="0"
      className={`w-[72px] h-8 px-2 text-[13px] text-right tabular-nums rounded-md ring-1 focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/40 disabled:bg-[#fafafa] disabled:text-[#999] ${bg}`}
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
      className="w-[60px] h-7 px-2 text-[13px] font-semibold text-center tabular-nums rounded-md bg-white ring-1 ring-[#eee] focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/40 disabled:bg-[#fafafa] disabled:text-[#999]"
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
  const [search, setSearch] = useState('')
  const [filledOnly, setFilledOnly] = useState(false)

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  )

  // All authorized items for this retailer become rows by default. Plus any
  // pallet assortment entries that happen to fall outside the authorized list
  // (legacy/edge cases) so a salesman never loses sight of what's already
  // assigned.
  const allRowIds = useMemo(() => {
    const ids = new Set<string>()
    for (const item of retailer.authorizedItems) {
      if (item.status === 'authorized') ids.add(item.productId)
    }
    halfPallet?.assortment.forEach((entry) => ids.add(entry.productId))
    fullPallet?.assortment.forEach((entry) => ids.add(entry.productId))
    return ids
  }, [retailer.authorizedItems, halfPallet, fullPallet])

  const rows: MatrixRow[] = useMemo(() => {
    return Array.from(allRowIds)
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
  }, [allRowIds, halfPallet, fullPallet, productMap])

  const halfQty = halfPallet?.quantity ?? 1
  const fullQty = fullPallet?.quantity ?? 1

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (filledOnly && row.halfCases === 0 && row.fullCases === 0) return false
      if (!query) return true
      return (
        row.productName.toLowerCase().includes(query) ||
        row.kaycoItemNumber.toLowerCase().includes(query) ||
        row.upc.toLowerCase().includes(query) ||
        row.brand.toLowerCase().includes(query)
      )
    })
  }, [rows, search, filledOnly])

  const totals = useMemo(() => {
    let halfCases = 0
    let fullCases = 0
    let totalCases = 0
    let totalUnits = 0
    for (const row of rows) {
      const h = row.halfCases * halfQty
      const f = row.fullCases * fullQty
      halfCases += h
      fullCases += f
      totalCases += h + f
      if (row.unitsPerCase) totalUnits += (h + f) * row.unitsPerCase
    }
    return { halfCases, fullCases, totalCases, totalUnits }
  }, [rows, halfQty, fullQty])

  const filledCount = useMemo(
    () => rows.filter((r) => r.halfCases > 0 || r.fullCases > 0).length,
    [rows],
  )

  return (
    <div className="space-y-3">
      {/* Toolbar */}
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
            checked={filledOnly}
            onChange={(e) => setFilledOnly(e.target.checked)}
            className="accent-[#171717]"
          />
          Filled only
        </label>
        <div className="ml-auto text-[11px] text-[#888] tabular-nums">
          {filledCount} of {rows.length} items have cases
        </div>
      </div>

      {/* Matrix */}
      <div className="bg-white shadow-card rounded-xl overflow-hidden">
        <div className="overflow-auto max-h-[70vh]">
          <table className="w-full border-separate border-spacing-0">
            <thead className="sticky top-0 z-20 bg-white">
              {/* Group header row */}
              <tr>
                <th
                  className="text-left text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-6 pt-3 pb-1 sticky left-0 bg-white z-10"
                  colSpan={4}
                  style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.04)' }}
                />
                {halfPallet && (
                  <th
                    colSpan={1}
                    className="text-center text-[10px] font-semibold uppercase tracking-wider text-emerald-700 px-3 pt-3 pb-1 bg-emerald-50/60"
                    style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.04)' }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>Half pallet</span>
                      <span className="inline-flex items-center gap-1 text-emerald-600/70 text-[9px] normal-case">
                        qty
                        <QuantityInput
                          value={halfPallet.quantity ?? 1}
                          disabled={readOnly}
                          onCommit={(next) =>
                            onQuantityChange?.(halfPallet.id, next)
                          }
                        />
                      </span>
                    </div>
                  </th>
                )}
                {fullPallet && (
                  <th
                    colSpan={1}
                    className="text-center text-[10px] font-semibold uppercase tracking-wider text-blue-700 px-3 pt-3 pb-1 bg-blue-50/60"
                    style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.04)' }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>Full pallet</span>
                      <span className="inline-flex items-center gap-1 text-blue-600/70 text-[9px] normal-case">
                        qty
                        <QuantityInput
                          value={fullPallet.quantity ?? 1}
                          disabled={readOnly}
                          onCommit={(next) =>
                            onQuantityChange?.(fullPallet.id, next)
                          }
                        />
                      </span>
                    </div>
                  </th>
                )}
                <th
                  colSpan={2}
                  className="bg-white"
                  style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.04)' }}
                />
              </tr>
              {/* Column header row */}
              <tr className="bg-white">
                <th className="text-left text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-6 py-2 sticky left-0 bg-white z-10">
                  Product
                </th>
                <th className="text-left text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-3 py-2">
                  UPC
                </th>
                <th className="text-left text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-3 py-2">
                  Kayco #
                </th>
                <th className="text-right text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-3 py-2">
                  Pack
                </th>
                {halfPallet && (
                  <th className="text-right text-[10px] font-medium uppercase tracking-wider text-emerald-700/70 px-3 py-2 bg-emerald-50/60">
                    Cases / pallet
                  </th>
                )}
                {fullPallet && (
                  <th className="text-right text-[10px] font-medium uppercase tracking-wider text-blue-700/70 px-3 py-2 bg-blue-50/60">
                    Cases / pallet
                  </th>
                )}
                <th className="text-right text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-3 py-2">
                  Total Cases
                </th>
                <th className="text-right text-[10px] font-medium uppercase tracking-wider text-[#bbb] px-6 py-2">
                  Total Units
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6 + (halfPallet ? 1 : 0) + (fullPallet ? 1 : 0)}
                    className="px-6 py-10 text-center text-[12px] text-[#888]"
                  >
                    {rows.length === 0
                      ? `No authorized items for ${retailer.name} yet. Ask your manager to authorize items.`
                      : 'No items match your filters.'}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const orderCases =
                    row.halfCases * halfQty + row.fullCases * fullQty
                  const orderUnits = row.unitsPerCase
                    ? orderCases * row.unitsPerCase
                    : null
                  return (
                    <tr
                      key={row.productId}
                      className="hover:bg-[#fafafa] transition-colors"
                      style={{ boxShadow: '0 -1px 0 0 rgba(0,0,0,0.04)' }}
                    >
                      <td className="px-6 py-2 sticky left-0 bg-white group-hover:bg-[#fafafa] z-10">
                        <p className="text-[13px] font-medium text-[#171717]">
                          {row.productName}
                        </p>
                        {row.brand && (
                          <p className="text-[10px] text-[#999] capitalize">
                            {row.brand}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-[#888] font-mono">
                        {row.upc || '—'}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-[#888] font-mono">
                        {row.kaycoItemNumber || '—'}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-[#888] text-right tabular-nums">
                        {row.unitsPerCase ?? '—'}
                      </td>
                      {halfPallet && (
                        <td className="px-3 py-2 text-right bg-emerald-50/30">
                          <CellInput
                            tone="half"
                            cases={row.halfCases}
                            disabled={readOnly}
                            onCommit={(value) =>
                              onCellChange?.(halfPallet.id, row.productId, value)
                            }
                          />
                        </td>
                      )}
                      {fullPallet && (
                        <td className="px-3 py-2 text-right bg-blue-50/30">
                          <CellInput
                            tone="full"
                            cases={row.fullCases}
                            disabled={readOnly}
                            onCommit={(value) =>
                              onCellChange?.(fullPallet.id, row.productId, value)
                            }
                          />
                        </td>
                      )}
                      <td className="px-3 py-2 text-[13px] font-semibold text-[#171717] text-right tabular-nums">
                        {orderCases || '—'}
                      </td>
                      <td className="px-6 py-2 text-[13px] font-medium text-[#171717] text-right tabular-nums">
                        {orderUnits ?? '—'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="sticky bottom-0 z-10">
                <tr className="bg-[#fafafa]" style={{ boxShadow: '0 -1px 0 0 rgba(0,0,0,0.06)' }}>
                  <td
                    className="px-6 py-3 text-[12px] font-semibold text-[#171717] sticky left-0 bg-[#fafafa] z-10"
                    colSpan={4}
                  >
                    Order totals
                  </td>
                  {halfPallet && (
                    <td className="px-3 py-3 text-[13px] font-semibold text-emerald-800 text-right tabular-nums bg-emerald-50">
                      {totals.halfCases || '—'}
                    </td>
                  )}
                  {fullPallet && (
                    <td className="px-3 py-3 text-[13px] font-semibold text-blue-800 text-right tabular-nums bg-blue-50">
                      {totals.fullCases || '—'}
                    </td>
                  )}
                  <td className="px-3 py-3 text-[13px] font-semibold text-[#171717] text-right tabular-nums">
                    {totals.totalCases || '—'}
                  </td>
                  <td className="px-6 py-3 text-[13px] font-semibold text-[#171717] text-right tabular-nums">
                    {totals.totalUnits || '—'}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
