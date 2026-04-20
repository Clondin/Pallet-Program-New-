import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ProgramMatrix } from '../components/Assortment/program-matrix'
import { buildRollupData } from '../lib/program-rollup'
import { useCatalogStore } from '../stores/catalog-store'
import { useDisplayStore } from '../stores/display-store'
import { useRetailerStore } from '../stores/retailer-store'
import type { Holiday } from '../types'

const HOLIDAY_LABELS: Record<Holiday, string> = {
  'rosh-hashanah': 'Rosh Hashanah',
  pesach: 'Pesach',
  sukkos: 'Sukkos',
  none: 'Everyday',
}

export function ProgramRollupPage() {
  const { retailerId, season } = useParams()
  const navigate = useNavigate()
  const retailer = useRetailerStore((state) =>
    retailerId ? state.getRetailer(retailerId) : undefined,
  )
  const pallets = useDisplayStore((state) =>
    retailerId ? state.getProjectsForRetailer(retailerId) : [],
  )
  const products = useCatalogStore((state) => state.products)

  const seasonPallets = useMemo(
    () => pallets.filter((pallet) => pallet.season === season),
    [pallets, season],
  )

  const rollupRows = useMemo(
    () => buildRollupData(seasonPallets, products),
    [products, seasonPallets],
  )

  if (!retailer || !retailerId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-[13px] text-[#888]">Retailer not found</p>
      </div>
    )
  }

  const seasonLabel =
    season && season in HOLIDAY_LABELS
      ? HOLIDAY_LABELS[season as Holiday]
      : season ?? 'Program'

  return (
    <div className="px-10 py-10 max-w-[1400px]">
      <button
        onClick={() => navigate(`/retailers/${retailerId}`)}
        className="flex items-center gap-1.5 text-[#777] hover:text-[#171717] text-[12px] font-medium mb-5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {retailer.name}
      </button>

      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-wider text-[#999]">Program Summary</p>
        <h1 className="text-[28px] font-semibold tracking-display text-[#171717] mt-1">
          {retailer.name} — {seasonLabel}
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-3 text-[12px] text-[#666]">
          <span className="px-2 py-1 rounded-md bg-[#f5f5f5] font-medium">
            {seasonPallets.length} pallets
          </span>
          <span className="px-2 py-1 rounded-md bg-[#f5f5f5] font-medium">
            {rollupRows.length} SKUs
          </span>
          <span className="px-2 py-1 rounded-md bg-[#f5f5f5] font-medium">
            {rollupRows.reduce((sum, row) => sum + row.totalCases, 0)} total cases
          </span>
        </div>
      </div>

      <ProgramMatrix pallets={seasonPallets} rows={rollupRows} />
    </div>
  )
}
