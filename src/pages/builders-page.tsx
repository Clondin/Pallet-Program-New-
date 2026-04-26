import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Boxes, HardHat, Package } from 'lucide-react'
import { useDisplayStore } from '../stores/display-store'
import { useSeasonStore } from '../stores/season-store'
import { useCatalogStore } from '../stores/catalog-store'
import { useRetailerStore } from '../stores/retailer-store'
import { buildRollupData } from '../lib/program-rollup'

export function BuildersPage() {
  const seasons = useSeasonStore((state) => state.seasons)
  const projects = useDisplayStore((state) => state.projects)
  const products = useCatalogStore((state) => state.products)
  const retailers = useRetailerStore((state) => state.retailers)

  const [seasonId, setSeasonId] = useState<string>('')
  const [selectedPalletIds, setSelectedPalletIds] = useState<Set<string>>(new Set())

  const seasonPallets = useMemo(() => {
    if (!seasonId) return []
    return projects
      .filter((project) => project.seasonId === seasonId)
      .sort((a, b) => b.updatedAt - a.updatedAt)
  }, [projects, seasonId])

  const effectivePallets = useMemo(() => {
    if (selectedPalletIds.size === 0) return seasonPallets
    return seasonPallets.filter((pallet) => selectedPalletIds.has(pallet.id))
  }, [seasonPallets, selectedPalletIds])

  const rollupRows = useMemo(
    () => buildRollupData(effectivePallets, products),
    [effectivePallets, products],
  )

  const retailerById = useMemo(
    () => new Map(retailers.map((retailer) => [retailer.id, retailer])),
    [retailers],
  )

  const totalCases = rollupRows.reduce((sum, row) => sum + row.totalCases, 0)
  const totalUnits = rollupRows.reduce(
    (sum, row) => sum + (row.totalUnits ?? 0),
    0,
  )

  const togglePallet = (palletId: string) => {
    setSelectedPalletIds((current) => {
      const next = new Set(current)
      if (next.has(palletId)) {
        next.delete(palletId)
      } else {
        next.add(palletId)
      }
      return next
    })
  }

  const clearSelection = () => setSelectedPalletIds(new Set())

  const selectableSeasons = seasons
    .filter((season) => !season.archived)
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="px-10 py-10 max-w-[1400px]">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-wider text-[#999] flex items-center gap-1.5">
          <HardHat className="w-3 h-3" />
          Warehouse build
        </p>
        <h1 className="text-[28px] font-semibold tracking-display text-[#171717] mt-1">Builders</h1>
        <p className="text-[13px] text-[#666] mt-2">
          Pick a season to see every pallet in it and the total cases per SKU you need to pull.
        </p>
      </div>

      <div className="bg-white shadow-card rounded-xl p-5 mb-6">
        <p className="text-[11px] uppercase tracking-wider text-[#999] mb-2">Season</p>
        <select
          value={seasonId}
          onChange={(event) => {
            setSeasonId(event.target.value)
            clearSelection()
          }}
          className="w-full max-w-md text-[14px] font-semibold text-[#171717] px-3 py-2 shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none"
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

      {seasonId && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white shadow-card rounded-xl px-5 py-4">
              <div className="flex items-center gap-2 text-[#777]">
                <Boxes className="w-4 h-4" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Pallets</span>
              </div>
              <p className="text-[18px] font-semibold text-[#171717] mt-3">
                {effectivePallets.length}
                {selectedPalletIds.size > 0 && (
                  <span className="text-[12px] text-[#888] ml-2">of {seasonPallets.length}</span>
                )}
              </p>
            </div>
            <div className="bg-white shadow-card rounded-xl px-5 py-4">
              <div className="flex items-center gap-2 text-[#777]">
                <Package className="w-4 h-4" />
                <span className="text-[11px] font-medium uppercase tracking-wider">SKUs</span>
              </div>
              <p className="text-[18px] font-semibold text-[#171717] mt-3">{rollupRows.length}</p>
            </div>
            <div className="bg-white shadow-card rounded-xl px-5 py-4">
              <div className="flex items-center gap-2 text-[#777]">
                <Boxes className="w-4 h-4" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Total Cases</span>
              </div>
              <p className="text-[18px] font-semibold text-[#171717] mt-3">
                {totalCases}
                {totalUnits > 0 && (
                  <span className="text-[12px] text-[#888] ml-2">
                    ({totalUnits.toLocaleString()} units)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[0.85fr_1.15fr] gap-6">
            <div className="bg-white shadow-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-semibold text-[#171717]">Pallets in season</h3>
                {selectedPalletIds.size > 0 && (
                  <button
                    onClick={clearSelection}
                    className="text-[11px] text-[#0a72ef] hover:underline"
                  >
                    Clear ({selectedPalletIds.size})
                  </button>
                )}
              </div>

              {seasonPallets.length === 0 ? (
                <p className="text-[12px] text-[#888]">
                  No pallets are tagged with this season yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {seasonPallets.map((pallet) => {
                    const retailer = retailerById.get(pallet.retailerId)
                    const cases = pallet.assortment.reduce((sum, e) => sum + e.cases, 0)
                    const checked =
                      selectedPalletIds.size === 0 || selectedPalletIds.has(pallet.id)
                    return (
                      <label
                        key={pallet.id}
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                          selectedPalletIds.has(pallet.id)
                            ? 'border-[#0a72ef]/40 bg-[#0a72ef]/5'
                            : 'border-transparent bg-[#fafafa] hover:bg-[#f0f0f0]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPalletIds.has(pallet.id)}
                          onChange={() => togglePallet(pallet.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/retailers/${pallet.retailerId}/pallets/${pallet.id}`}
                            className="text-[13px] font-semibold text-[#171717] hover:text-[#0a72ef] truncate block"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {pallet.name}
                          </Link>
                          <p className="text-[11px] text-[#888] mt-0.5">
                            {retailer?.name ?? 'Unknown retailer'} · {pallet.assortment.length} SKUs · {cases} cases
                          </p>
                        </div>
                        {!checked && (
                          <span className="text-[10px] text-[#bbb] uppercase">excluded</span>
                        )}
                      </label>
                    )
                  })}
                </div>
              )}

              {seasonPallets.length > 0 && (
                <p className="text-[11px] text-[#888] mt-3">
                  Tip: check pallets to roll up only those. Leaving all unchecked rolls up everything.
                </p>
              )}
            </div>

            <div className="bg-white shadow-card rounded-xl p-5">
              <h3 className="text-[15px] font-semibold text-[#171717] mb-3">
                Build manifest — cases per SKU
              </h3>

              {rollupRows.length === 0 ? (
                <p className="text-[12px] text-[#888]">
                  No assortment data yet for these pallets.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-[#888] text-left">
                        <th className="py-2 pr-3 font-medium">Brand</th>
                        <th className="py-2 pr-3 font-medium">Product</th>
                        <th className="py-2 pr-3 font-medium">UPC</th>
                        <th className="py-2 pr-3 font-medium">Kayco #</th>
                        <th className="py-2 pr-3 font-medium text-right">Cases</th>
                        <th className="py-2 font-medium text-right">Units</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rollupRows.map((row) => (
                        <tr
                          key={row.productId}
                          className="border-t border-[#f0f0f0]"
                        >
                          <td className="py-2 pr-3 text-[#666]">{row.brand}</td>
                          <td className="py-2 pr-3 text-[#171717] font-medium">
                            {row.productName}
                          </td>
                          <td className="py-2 pr-3 text-[#888] font-mono text-[11px]">
                            {row.upc || '—'}
                          </td>
                          <td className="py-2 pr-3 text-[#888] font-mono text-[11px]">
                            {row.kaycoItemNumber || '—'}
                          </td>
                          <td className="py-2 pr-3 text-right font-semibold text-[#171717]">
                            {row.totalCases}
                          </td>
                          <td className="py-2 text-right text-[#666]">
                            {row.totalUnits != null ? row.totalUnits.toLocaleString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-[#171717]">
                        <td colSpan={4} className="py-2 pr-3 font-semibold text-[#171717]">
                          Total
                        </td>
                        <td className="py-2 pr-3 text-right font-semibold text-[#171717]">
                          {totalCases}
                        </td>
                        <td className="py-2 text-right font-semibold text-[#171717]">
                          {totalUnits > 0 ? totalUnits.toLocaleString() : '—'}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
