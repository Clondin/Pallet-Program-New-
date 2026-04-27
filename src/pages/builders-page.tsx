import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Boxes, HardHat, Package } from 'lucide-react'
import { useDisplayStore } from '../stores/display-store'
import { useSeasonStore } from '../stores/season-store'
import { useCatalogStore } from '../stores/catalog-store'
import { useRetailerStore } from '../stores/retailer-store'
import { buildRollupData, type RollupRow } from '../lib/program-rollup'
import type { BuildLocation } from '../types'

const LOCATION_LABELS: Record<BuildLocation, string> = {
  hook: 'Hook',
  goshen: 'Goshen',
  'third-party': '3rd Party',
}

function formatDelta(delta: number | null): { text: string; tone: 'pos' | 'neg' | 'zero' | 'na' } {
  if (delta === null) return { text: '—', tone: 'na' }
  if (delta === 0) return { text: '0', tone: 'zero' }
  if (delta > 0) return { text: `+${delta}`, tone: 'pos' }
  return { text: `${delta}`, tone: 'neg' }
}

export function BuildersPage() {
  const seasons = useSeasonStore((state) => state.seasons)
  const projects = useDisplayStore((state) => state.projects)
  const products = useCatalogStore((state) => state.products)
  const retailers = useRetailerStore((state) => state.retailers)

  const [seasonId, setSeasonId] = useState<string>('')
  const [comparisonSeasonId, setComparisonSeasonId] = useState<string>('')
  const [locationFilter, setLocationFilter] = useState<BuildLocation | 'all' | 'unassigned'>('all')

  const allSeasonPallets = useMemo(() => {
    if (!seasonId) return []
    return projects.filter((project) => project.seasonId === seasonId)
  }, [projects, seasonId])

  const seasonPallets = useMemo(() => {
    if (locationFilter === 'all') return allSeasonPallets
    if (locationFilter === 'unassigned') {
      return allSeasonPallets.filter((p) => !p.buildLocation)
    }
    return allSeasonPallets.filter((p) => p.buildLocation === locationFilter)
  }, [allSeasonPallets, locationFilter])

  const comparisonPallets = useMemo(() => {
    if (!comparisonSeasonId) return []
    return projects.filter((project) => project.seasonId === comparisonSeasonId)
  }, [projects, comparisonSeasonId])

  const rollupRows = useMemo(
    () => buildRollupData(seasonPallets, products),
    [seasonPallets, products],
  )

  const comparisonRows = useMemo(
    () => buildRollupData(comparisonPallets, products),
    [comparisonPallets, products],
  )

  const comparisonByProduct = useMemo(() => {
    const map = new Map<string, RollupRow>()
    for (const row of comparisonRows) {
      map.set(row.productId, row)
    }
    return map
  }, [comparisonRows])

  // Retailers represented in the season (only show columns for retailers who have a pallet)
  const retailersInSeason = useMemo(() => {
    const ids = new Set<string>()
    for (const pallet of seasonPallets) ids.add(pallet.retailerId)
    return retailers
      .filter((retailer) => ids.has(retailer.id))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [seasonPallets, retailers])

  // Sort rows by Kayco item # numerically when possible, else alphabetically
  const sortedRows = useMemo(() => {
    return rollupRows.slice().sort((a, b) => {
      const ka = parseInt(a.kaycoItemNumber, 10)
      const kb = parseInt(b.kaycoItemNumber, 10)
      if (!isNaN(ka) && !isNaN(kb)) return ka - kb
      return (a.kaycoItemNumber || a.productName).localeCompare(b.kaycoItemNumber || b.productName)
    })
  }, [rollupRows])

  const totalCases = rollupRows.reduce((sum, row) => sum + row.totalCases, 0)
  const priorTotalCases = comparisonRows.reduce((sum, row) => sum + row.totalCases, 0)
  const totalDelta = comparisonSeasonId ? totalCases - priorTotalCases : null

  const halfPallets = seasonPallets.filter((p) => p.palletType === 'half').length
  const fullPallets = seasonPallets.filter((p) => p.palletType === 'full').length

  const selectableSeasons = seasons
    .filter((season) => !season.archived)
    .sort((a, b) => a.name.localeCompare(b.name))

  const toneClass = (tone: 'pos' | 'neg' | 'zero' | 'na') => {
    if (tone === 'pos') return 'text-emerald-600'
    if (tone === 'neg') return 'text-red-600'
    if (tone === 'zero') return 'text-[#999]'
    return 'text-[#bbb]'
  }

  return (
    <div className="px-10 py-10 max-w-[1600px]">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-wider text-[#999] flex items-center gap-1.5">
          <HardHat className="w-3 h-3" />
          Warehouse build
        </p>
        <h1 className="text-[28px] font-semibold tracking-display text-[#171717] mt-1">Builders</h1>
        <p className="text-[13px] text-[#666] mt-2">
          Full view of every pallet in a season, pivoted by retailer with optional prior-year
          comparison.
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
          <p className="text-[11px] uppercase tracking-wider text-[#999] mb-2">Build location</p>
          <select
            value={locationFilter}
            onChange={(event) =>
              setLocationFilter(event.target.value as BuildLocation | 'all' | 'unassigned')
            }
            disabled={!seasonId}
            className="w-full text-[14px] font-semibold text-[#171717] px-3 py-2 shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none disabled:opacity-50"
          >
            <option value="all">All locations</option>
            <option value="hook">Hook</option>
            <option value="goshen">Goshen</option>
            <option value="third-party">3rd Party Location</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>
      </div>

      {seasonId && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white shadow-card rounded-xl px-5 py-4">
              <div className="flex items-center gap-2 text-[#777]">
                <Boxes className="w-4 h-4" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Half pallets</span>
              </div>
              <p className="text-[18px] font-semibold text-[#171717] mt-3 tabular-nums">
                {halfPallets}
              </p>
            </div>
            <div className="bg-white shadow-card rounded-xl px-5 py-4">
              <div className="flex items-center gap-2 text-[#777]">
                <Boxes className="w-4 h-4" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Full pallets</span>
              </div>
              <p className="text-[18px] font-semibold text-[#171717] mt-3 tabular-nums">
                {fullPallets}
              </p>
            </div>
            <div className="bg-white shadow-card rounded-xl px-5 py-4">
              <div className="flex items-center gap-2 text-[#777]">
                <Package className="w-4 h-4" />
                <span className="text-[11px] font-medium uppercase tracking-wider">SKUs</span>
              </div>
              <p className="text-[18px] font-semibold text-[#171717] mt-3 tabular-nums">
                {sortedRows.length}
              </p>
            </div>
            <div className="bg-white shadow-card rounded-xl px-5 py-4">
              <div className="flex items-center gap-2 text-[#777]">
                <Boxes className="w-4 h-4" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Total cases</span>
              </div>
              <p className="text-[18px] font-semibold text-[#171717] mt-3 tabular-nums">
                {totalCases}
                {totalDelta !== null && (
                  <span
                    className={`ml-2 text-[12px] font-medium ${toneClass(formatDelta(totalDelta).tone)}`}
                  >
                    {formatDelta(totalDelta).text}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="bg-white shadow-card rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f0f0f0] flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-[#171717]">Build manifest</h3>
              <p className="text-[11px] text-[#888]">
                {retailersInSeason.length} retailer{retailersInSeason.length === 1 ? '' : 's'} ·{' '}
                {sortedRows.length} item{sortedRows.length === 1 ? '' : 's'}
              </p>
            </div>

            {sortedRows.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-[13px] text-[#888]">
                  No assortment data yet for pallets in this season.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-[#888] text-left bg-[#fafafa]">
                      <th className="py-2.5 px-4 font-medium uppercase tracking-wider text-[10px]">
                        Item #
                      </th>
                      <th className="py-2.5 px-4 font-medium uppercase tracking-wider text-[10px]">
                        Description
                      </th>
                      <th className="py-2.5 px-4 font-medium uppercase tracking-wider text-[10px]">
                        Buyer
                      </th>
                      {retailersInSeason.map((retailer) => (
                        <th
                          key={retailer.id}
                          className="py-2.5 px-4 font-medium uppercase tracking-wider text-[10px] text-right bg-[#eff6ff]/50"
                        >
                          {retailer.name}
                        </th>
                      ))}
                      <th className="py-2.5 px-4 font-medium uppercase tracking-wider text-[10px] text-right bg-[#eff6ff]">
                        Total
                      </th>
                      {comparisonSeasonId && (
                        <th className="py-2.5 px-4 font-medium uppercase tracking-wider text-[10px] text-right bg-[#fef3c7]/40">
                          Δ vs prior
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRows.map((row) => {
                      const priorRow = comparisonByProduct.get(row.productId)
                      const priorTotal = priorRow?.totalCases ?? null
                      const delta =
                        comparisonSeasonId && priorTotal !== null
                          ? row.totalCases - priorTotal
                          : null
                      const formattedDelta = formatDelta(delta)

                      return (
                        <tr
                          key={row.productId}
                          className="border-t border-[#f0f0f0] hover:bg-[#fafafa] transition-colors"
                        >
                          <td className="py-2 px-4 font-mono text-[#666] tabular-nums whitespace-nowrap">
                            {row.kaycoItemNumber || '—'}
                          </td>
                          <td className="py-2 px-4 text-[#171717] font-medium">
                            {row.productName}
                            {row.brand && (
                              <span className="ml-2 text-[10px] text-[#999] font-normal capitalize">
                                {row.brand}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-4 text-[#666] uppercase text-[11px]">
                            {row.buyer || '—'}
                          </td>
                          {retailersInSeason.map((retailer) => {
                            const cases = row.retailerCases.get(retailer.id) ?? 0
                            return (
                              <td
                                key={retailer.id}
                                className="py-2 px-4 text-right tabular-nums bg-[#eff6ff]/30"
                                style={{ color: cases > 0 ? '#171717' : '#ddd' }}
                              >
                                {cases || '—'}
                              </td>
                            )
                          })}
                          <td className="py-2 px-4 text-right font-semibold text-[#171717] tabular-nums bg-[#eff6ff]">
                            {row.totalCases}
                          </td>
                          {comparisonSeasonId && (
                            <td
                              className={`py-2 px-4 text-right tabular-nums font-medium bg-[#fef3c7]/40 ${toneClass(formattedDelta.tone)}`}
                            >
                              {formattedDelta.text}
                            </td>
                          )}
                        </tr>
                      )
                    })}

                    {/* Items present in comparison season but not in current season */}
                    {comparisonSeasonId &&
                      comparisonRows
                        .filter((row) => !rollupRows.some((r) => r.productId === row.productId))
                        .map((row) => {
                          const delta = -row.totalCases
                          const formattedDelta = formatDelta(delta)
                          return (
                            <tr
                              key={`prior-only-${row.productId}`}
                              className="border-t border-[#f0f0f0] bg-[#fafafa]/60"
                            >
                              <td className="py-2 px-4 font-mono text-[#999] tabular-nums whitespace-nowrap">
                                {row.kaycoItemNumber || '—'}
                              </td>
                              <td className="py-2 px-4 text-[#999] italic">
                                {row.productName}
                                <span className="ml-2 text-[10px] text-[#bbb] uppercase tracking-wider">
                                  prior only
                                </span>
                              </td>
                              <td className="py-2 px-4 text-[#999] uppercase text-[11px]">
                                {row.buyer || '—'}
                              </td>
                              {retailersInSeason.map((retailer) => (
                                <td
                                  key={retailer.id}
                                  className="py-2 px-4 text-right text-[#ddd] bg-[#eff6ff]/30"
                                >
                                  —
                                </td>
                              ))}
                              <td className="py-2 px-4 text-right text-[#999] tabular-nums bg-[#eff6ff]">
                                0
                              </td>
                              <td
                                className={`py-2 px-4 text-right tabular-nums font-medium bg-[#fef3c7]/40 ${toneClass(formattedDelta.tone)}`}
                              >
                                {formattedDelta.text}
                              </td>
                            </tr>
                          )
                        })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[#171717] bg-white">
                      <td colSpan={3} className="py-2.5 px-4 font-semibold text-[#171717]">
                        Total
                      </td>
                      {retailersInSeason.map((retailer) => {
                        const sum = sortedRows.reduce(
                          (acc, row) => acc + (row.retailerCases.get(retailer.id) ?? 0),
                          0,
                        )
                        return (
                          <td
                            key={retailer.id}
                            className="py-2.5 px-4 text-right font-semibold text-[#171717] tabular-nums bg-[#eff6ff]/50"
                          >
                            {sum}
                          </td>
                        )
                      })}
                      <td className="py-2.5 px-4 text-right font-semibold text-[#171717] tabular-nums bg-[#eff6ff]">
                        {totalCases}
                      </td>
                      {comparisonSeasonId && (
                        <td
                          className={`py-2.5 px-4 text-right tabular-nums font-semibold bg-[#fef3c7]/40 ${toneClass(formatDelta(totalDelta).tone)}`}
                        >
                          {formatDelta(totalDelta).text}
                        </td>
                      )}
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Pallet list — collapsible / secondary */}
          <div className="mt-6 bg-white shadow-card rounded-xl p-5">
            <h3 className="text-[15px] font-semibold text-[#171717] mb-3">
              Pallets in season ({seasonPallets.length})
            </h3>
            {seasonPallets.length === 0 ? (
              <p className="text-[12px] text-[#888]">No pallets tagged with this season yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {seasonPallets.map((pallet) => {
                  const retailer = retailers.find((r) => r.id === pallet.retailerId)
                  const cases = pallet.assortment.reduce((sum, e) => sum + e.cases, 0)
                  const locationLabel = pallet.buildLocation
                    ? LOCATION_LABELS[pallet.buildLocation]
                    : null
                  return (
                    <Link
                      key={pallet.id}
                      to={`/retailers/${pallet.retailerId}/pallets/${pallet.id}`}
                      className="p-3 rounded-lg bg-[#fafafa] hover:bg-[#f0f0f0] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[13px] font-medium text-[#171717] truncate">
                          {pallet.name}
                        </p>
                        {locationLabel && (
                          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-[#171717] text-white uppercase tracking-wider font-medium">
                            {locationLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#888] mt-0.5">
                        {retailer?.name ?? '—'} · {pallet.palletType} · {cases} cases
                      </p>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
