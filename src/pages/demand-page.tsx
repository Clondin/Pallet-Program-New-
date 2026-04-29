import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, Download, TrendingUp } from 'lucide-react'
import { useDisplayStore } from '../stores/display-store'
import { useSeasonStore } from '../stores/season-store'
import { useCatalogStore } from '../stores/catalog-store'
import { buildRollupData, type RollupRow } from '../lib/program-rollup'
import { buildCsv, downloadCsv } from '../lib/csv'

type SortKey = 'swing' | 'total' | 'item' | 'name'

export function DemandPage() {
  const seasons = useSeasonStore((state) => state.seasons)
  const projects = useDisplayStore((state) => state.projects)
  const products = useCatalogStore((state) => state.products)

  const [seasonId, setSeasonId] = useState<string>('')
  const [comparisonSeasonId, setComparisonSeasonId] = useState<string>('')
  const [buyerFilter, setBuyerFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<SortKey>('swing')

  const seasonPallets = useMemo(() => {
    if (!seasonId) return []
    return projects.filter((p) => p.seasonId === seasonId)
  }, [projects, seasonId])

  const comparisonPallets = useMemo(() => {
    if (!comparisonSeasonId) return []
    return projects.filter((p) => p.seasonId === comparisonSeasonId)
  }, [projects, comparisonSeasonId])

  const currentRows = useMemo(
    () => buildRollupData(seasonPallets, products),
    [seasonPallets, products],
  )
  const priorRows = useMemo(
    () => buildRollupData(comparisonPallets, products),
    [comparisonPallets, products],
  )

  const priorByProduct = useMemo(() => {
    const map = new Map<string, RollupRow>()
    for (const row of priorRows) map.set(row.productId, row)
    return map
  }, [priorRows])

  const buyerOptions = useMemo(() => {
    const set = new Set<string>()
    for (const row of currentRows) if (row.buyer) set.add(row.buyer)
    for (const row of priorRows) if (row.buyer) set.add(row.buyer)
    return Array.from(set).sort()
  }, [currentRows, priorRows])

  // Build the unified item list (union of current and prior season items)
  const merged = useMemo(() => {
    const map = new Map<string, RollupRow>()
    for (const row of currentRows) map.set(row.productId, row)
    for (const row of priorRows) {
      if (!map.has(row.productId)) map.set(row.productId, row)
    }
    return Array.from(map.values())
  }, [currentRows, priorRows])

  const filtered = useMemo(() => {
    if (!buyerFilter) return merged
    return merged.filter((row) => row.buyer === buyerFilter)
  }, [merged, buyerFilter])

  const enriched = useMemo(() => {
    return filtered.map((row) => {
      const current = currentRows.find((r) => r.productId === row.productId)?.totalCases ?? 0
      const prior = priorByProduct.get(row.productId)?.totalCases ?? 0
      const delta = current - prior
      const pct = prior === 0 ? (current === 0 ? 0 : Infinity) : (delta / prior) * 100
      return { row, current, prior, delta, pct }
    })
  }, [filtered, currentRows, priorByProduct])

  const sorted = useMemo(() => {
    const copy = [...enriched]
    switch (sortBy) {
      case 'swing':
        copy.sort((a, b) => {
          const aPct = isFinite(a.pct) ? Math.abs(a.pct) : Number.MAX_SAFE_INTEGER
          const bPct = isFinite(b.pct) ? Math.abs(b.pct) : Number.MAX_SAFE_INTEGER
          return bPct - aPct
        })
        break
      case 'total':
        copy.sort((a, b) => b.current - a.current)
        break
      case 'item':
        copy.sort((a, b) =>
          (a.row.kaycoItemNumber || '').localeCompare(b.row.kaycoItemNumber || ''),
        )
        break
      case 'name':
        copy.sort((a, b) => a.row.productName.localeCompare(b.row.productName))
        break
    }
    return copy
  }, [enriched, sortBy])

  const totals = useMemo(() => {
    return sorted.reduce(
      (acc, e) => ({
        current: acc.current + e.current,
        prior: acc.prior + e.prior,
      }),
      { current: 0, prior: 0 },
    )
  }, [sorted])

  const totalDelta = totals.current - totals.prior
  const totalPct =
    totals.prior === 0
      ? totals.current === 0
        ? 0
        : Infinity
      : (totalDelta / totals.prior) * 100

  const handleExport = () => {
    const seasonLabel = seasons.find((s) => s.id === seasonId)?.name ?? 'Season'
    const priorLabel =
      seasons.find((s) => s.id === comparisonSeasonId)?.name ?? 'No comparison'
    const headers = [
      'Item #',
      'Description',
      'Brand',
      'Buyer',
      `${seasonLabel} cases`,
      `${priorLabel} cases`,
      'Δ cases',
      '% change',
    ]
    const rows = sorted.map((e) => [
      e.row.kaycoItemNumber || '',
      e.row.productName,
      e.row.brand,
      e.row.buyer,
      e.current,
      e.prior,
      e.delta,
      isFinite(e.pct) ? e.pct.toFixed(1) + '%' : 'new',
    ])
    downloadCsv(
      `demand-${seasonLabel.replace(/\s+/g, '-').toLowerCase()}.csv`,
      buildCsv(headers, rows),
    )
  }

  const selectableSeasons = seasons
    .filter((s) => !s.archived)
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="px-10 py-10 max-w-[1500px]">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-wider text-[#999] flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3" />
          Demand
        </p>
        <h1 className="text-[28px] font-semibold tracking-display text-[#171717] mt-1">
          Aggregate cases & swings
        </h1>
        <p className="text-[13px] text-[#666] mt-2">
          Total cases per item across all programs in a season, with prior-year comparison.
        </p>
      </div>

      <div className="bg-white shadow-card rounded-xl p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#999] mb-2">Season</p>
          <select
            value={seasonId}
            onChange={(event) => setSeasonId(event.target.value)}
            className="w-full text-[14px] font-semibold text-[#171717] px-3 py-2 shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none"
          >
            <option value="">Select a season…</option>
            {selectableSeasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
          {selectableSeasons.length === 0 && (
            <p className="text-[12px] text-[#888] mt-2">
              No seasons yet.{' '}
              <Link to="/seasons" className="text-[#0a72ef] hover:underline">
                Create one →
              </Link>
            </p>
          )}
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#999] mb-2">
            Compare to (prior year)
          </p>
          <select
            value={comparisonSeasonId}
            onChange={(event) => setComparisonSeasonId(event.target.value)}
            disabled={!seasonId}
            className="w-full text-[14px] font-semibold text-[#171717] px-3 py-2 shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none disabled:opacity-50"
          >
            <option value="">No comparison</option>
            {seasons
              .filter((entry) => entry.id !== seasonId)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name}
                  {season.archived ? ' (archived)' : ''}
                </option>
              ))}
          </select>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#999] mb-2">Buyer</p>
          <select
            value={buyerFilter}
            onChange={(event) => setBuyerFilter(event.target.value)}
            disabled={!seasonId}
            className="w-full text-[14px] font-semibold text-[#171717] px-3 py-2 shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none disabled:opacity-50"
          >
            <option value="">All buyers</option>
            {buyerOptions.map((buyer) => (
              <option key={buyer} value={buyer}>
                {buyer}
              </option>
            ))}
          </select>
        </div>
      </div>

      {seasonId && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Stat label="Items" value={String(sorted.length)} />
            <Stat label="Total cases" value={totals.current.toLocaleString()} />
            <Stat
              label="Prior cases"
              value={comparisonSeasonId ? totals.prior.toLocaleString() : '—'}
            />
            <Stat
              label="Δ vs prior"
              value={
                comparisonSeasonId
                  ? `${totalDelta >= 0 ? '+' : ''}${totalDelta.toLocaleString()} (${
                      isFinite(totalPct) ? `${totalPct >= 0 ? '+' : ''}${totalPct.toFixed(1)}%` : 'new'
                    })`
                  : '—'
              }
              tone={
                comparisonSeasonId
                  ? totalDelta > 0
                    ? 'pos'
                    : totalDelta < 0
                      ? 'neg'
                      : 'neutral'
                  : 'neutral'
              }
            />
          </div>

          <div className="bg-white shadow-card rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f0f0f0] flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-[#171717]">Items</h3>
              <button
                onClick={handleExport}
                disabled={sorted.length === 0}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md shadow-border text-[12px] font-medium text-[#555] hover:bg-[#fafafa] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            {sorted.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-[13px] text-[#888]">No items yet for this season.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-[#888] text-left bg-[#fafafa]">
                      <SortHeader
                        active={sortBy === 'item'}
                        onClick={() => setSortBy('item')}
                      >
                        Item #
                      </SortHeader>
                      <SortHeader
                        active={sortBy === 'name'}
                        onClick={() => setSortBy('name')}
                      >
                        Description
                      </SortHeader>
                      <th className="py-2.5 px-4 font-medium uppercase tracking-wider text-[10px]">
                        Buyer
                      </th>
                      <SortHeader
                        active={sortBy === 'total'}
                        onClick={() => setSortBy('total')}
                        align="right"
                      >
                        Cases
                      </SortHeader>
                      {comparisonSeasonId && (
                        <>
                          <th className="py-2.5 px-4 font-medium uppercase tracking-wider text-[10px] text-right">
                            Prior
                          </th>
                          <th className="py-2.5 px-4 font-medium uppercase tracking-wider text-[10px] text-right">
                            Δ cases
                          </th>
                          <SortHeader
                            active={sortBy === 'swing'}
                            onClick={() => setSortBy('swing')}
                            align="right"
                          >
                            % change
                          </SortHeader>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map(({ row, current, prior, delta, pct }) => {
                      const tone = delta > 0 ? 'pos' : delta < 0 ? 'neg' : 'neutral'
                      return (
                        <tr
                          key={row.productId}
                          className="border-t border-[#f0f0f0] hover:bg-[#fafafa]"
                        >
                          <td className="py-2 px-4 font-mono text-[#666] tabular-nums whitespace-nowrap">
                            {row.kaycoItemNumber || '—'}
                          </td>
                          <td className="py-2 px-4 text-[#171717] font-medium">
                            {row.productName}
                            {row.brand && (
                              <span className="ml-2 text-[10px] text-[#999] capitalize font-normal">
                                {row.brand}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-4 text-[#666] uppercase text-[11px]">
                            {row.buyer || '—'}
                          </td>
                          <td className="py-2 px-4 text-right font-semibold text-[#171717] tabular-nums">
                            {current}
                          </td>
                          {comparisonSeasonId && (
                            <>
                              <td className="py-2 px-4 text-right text-[#888] tabular-nums">
                                {prior}
                              </td>
                              <td
                                className={`py-2 px-4 text-right tabular-nums font-medium ${toneClass(tone)}`}
                              >
                                {delta === 0
                                  ? '0'
                                  : `${delta > 0 ? '+' : ''}${delta}`}
                              </td>
                              <td
                                className={`py-2 px-4 text-right tabular-nums font-medium ${toneClass(tone)}`}
                              >
                                <span className="inline-flex items-center gap-1">
                                  {delta !== 0 && (
                                    delta > 0 ? (
                                      <ArrowUp className="w-3 h-3" />
                                    ) : (
                                      <ArrowDown className="w-3 h-3" />
                                    )
                                  )}
                                  {!isFinite(pct)
                                    ? 'new'
                                    : `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`}
                                </span>
                              </td>
                            </>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string
  tone?: 'pos' | 'neg' | 'neutral'
}) {
  return (
    <div className="bg-white shadow-card rounded-xl px-5 py-4">
      <p className="text-[10px] font-medium uppercase tracking-wider text-[#999]">{label}</p>
      <p className={`text-[18px] font-semibold tabular-nums tracking-tight mt-2 ${toneClass(tone)}`}>
        {value}
      </p>
    </div>
  )
}

function SortHeader({
  children,
  active,
  onClick,
  align = 'left',
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  align?: 'left' | 'right'
}) {
  return (
    <th
      className={`py-2.5 px-4 font-medium uppercase tracking-wider text-[10px] ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1 ${
          active ? 'text-[#171717]' : 'text-[#888] hover:text-[#171717]'
        } transition-colors`}
      >
        {children}
      </button>
    </th>
  )
}

function toneClass(tone: 'pos' | 'neg' | 'neutral') {
  if (tone === 'pos') return 'text-emerald-700'
  if (tone === 'neg') return 'text-red-700'
  return 'text-[#171717]'
}
