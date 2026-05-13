import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { ProgramMatrix } from '../components/Assortment/program-matrix'
import { useCatalogStore } from '../stores/catalog-store'
import { useDisplayStore } from '../stores/display-store'
import { useRetailerStore } from '../stores/retailer-store'
import { useSeasonStore } from '../stores/season-store'
import { useRoleHref } from '../lib/role-href'
import { useRoleStore } from '../stores/role-store'
import { useConfirm } from '../components/ConfirmDialog'
import type { Holiday, PalletType } from '../types'

const HOLIDAY_LABELS: Record<Holiday, string> = {
  'rosh-hashanah': 'Rosh Hashanah',
  pesach: 'Pesach',
  sukkos: 'Sukkos',
  none: 'Everyday',
}

export function ProgramRollupPage() {
  const { retailerId, season: seasonParam } = useParams()
  const navigate = useNavigate()
  const roleHref = useRoleHref()
  const role = useRoleStore((state) => state.role)
  const retailer = useRetailerStore((state) =>
    retailerId ? state.getRetailer(retailerId) : undefined,
  )
  const allProjects = useDisplayStore((state) => state.projects)
  const pallets = useMemo(
    () =>
      retailerId
        ? allProjects
            .filter((project) => project.retailerId === retailerId)
            .sort((a, b) => b.updatedAt - a.updatedAt)
        : [],
    [allProjects, retailerId],
  )
  const products = useCatalogStore((state) => state.products)
  const seasons = useSeasonStore((state) => state.seasons)
  const updateAssortmentForProject = useDisplayStore(
    (state) => state.updateAssortmentForProject,
  )
  const updateQuantityForProject = useDisplayStore(
    (state) => state.updateQuantityForProject,
  )
  const createProject = useDisplayStore((state) => state.createProject)
  const deleteProject = useDisplayStore((state) => state.deleteProject)
  const { confirm, dialog } = useConfirm()
  const [busy, setBusy] = useState<PalletType | null>(null)

  // The URL `season` param holds either a Season id (new) or a Holiday family
  // string (legacy). Match both so existing "Program summary" links keep
  // working.
  const seasonRecord = useMemo(
    () => seasons.find((s) => s.id === seasonParam) ?? null,
    [seasons, seasonParam],
  )

  const seasonPallets = useMemo(() => {
    if (!seasonParam) return []
    if (seasonRecord) {
      return pallets.filter((pallet) => pallet.seasonId === seasonRecord.id)
    }
    return pallets.filter((pallet) => pallet.season === seasonParam)
  }, [pallets, seasonParam, seasonRecord])

  const halfPallet = useMemo(
    () => seasonPallets.find((p) => p.palletType === 'half') ?? null,
    [seasonPallets],
  )
  const fullPallet = useMemo(
    () => seasonPallets.find((p) => p.palletType === 'full') ?? null,
    [seasonPallets],
  )

  if (!retailer || !retailerId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-[13px] text-[#888]">Retailer not found</p>
      </div>
    )
  }

  const seasonLabel =
    seasonRecord?.name ??
    (seasonParam && seasonParam in HOLIDAY_LABELS
      ? HOLIDAY_LABELS[seasonParam as Holiday]
      : seasonParam ?? 'Program')

  const referencePallet = seasonPallets[0]
  const seasonHoliday: Holiday = (referencePallet?.season ??
    (seasonParam && seasonParam in HOLIDAY_LABELS
      ? (seasonParam as Holiday)
      : 'none')) as Holiday
  const seasonIdForNew: string | null =
    seasonRecord?.id ?? referencePallet?.seasonId ?? null

  const handleAddPallet = (type: PalletType) => {
    setBusy(type)
    try {
      createProject(
        `${seasonLabel} ${type === 'full' ? 'Full' : 'Half'} — ${retailer.name}`,
        {
          palletType: type,
          season: seasonHoliday,
          retailerId,
          seasonId: seasonIdForNew,
        },
        retailer.defaultTierCount ?? 4,
      )
    } finally {
      setBusy(null)
    }
  }

  const handleRemovePallet = async (type: PalletType) => {
    const pallet = type === 'half' ? halfPallet : fullPallet
    if (!pallet) return
    const ok = await confirm({
      title: `Remove the ${type} pallet from this program?`,
      description:
        'The pallet and its assortment are removed. The other pallet stays as-is.',
      confirmLabel: 'Remove pallet',
      destructive: true,
    })
    if (!ok) return
    deleteProject(pallet.id)
  }

  const isReadOnly = role === 'builder'

  const totalPallets =
    (halfPallet?.quantity ?? 0) + (fullPallet?.quantity ?? 0)
  const skuCount = new Set([
    ...(halfPallet?.assortment.map((e) => e.productId) ?? []),
    ...(fullPallet?.assortment.map((e) => e.productId) ?? []),
  ]).size

  return (
    <div className="px-10 py-10 max-w-[1500px]">
      <button
        onClick={() => navigate(roleHref(`/retailers/${retailerId}`))}
        className="flex items-center gap-1.5 text-[#777] hover:text-[#171717] text-[12px] font-medium mb-5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {retailer.name}
      </button>

      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-wider text-[#999]">Program</p>
        <h1 className="text-[28px] font-semibold tracking-display text-[#171717] mt-1">
          {retailer.name} — {seasonLabel}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mt-3 text-[12px] text-[#666]">
          <span className="px-2 py-1 rounded-md bg-[#f5f5f5] font-medium">
            {seasonPallets.length} pallet type{seasonPallets.length === 1 ? '' : 's'}
          </span>
          <span className="px-2 py-1 rounded-md bg-[#f5f5f5] font-medium">
            {totalPallets} pallet{totalPallets === 1 ? '' : 's'} requested
          </span>
          <span className="px-2 py-1 rounded-md bg-[#f5f5f5] font-medium">
            {skuCount} SKUs
          </span>
        </div>
      </div>

      {seasonPallets.length === 0 ? (
        <div className="bg-white shadow-card rounded-xl py-16 px-8 text-center">
          <p className="text-[15px] font-semibold text-[#171717]">
            No pallets yet
          </p>
          <p className="text-[12px] text-[#888] mt-2 max-w-md mx-auto">
            Choose which pallet types to include in the {seasonLabel} program
            for {retailer.name}.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => handleAddPallet('half')}
              disabled={busy === 'half'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#171717] text-white text-[13px] font-medium hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Add half pallet
            </button>
            <button
              onClick={() => handleAddPallet('full')}
              disabled={busy === 'full'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#171717] text-white text-[13px] font-medium hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Add full pallet
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            {!halfPallet && (
              <button
                onClick={() => handleAddPallet('half')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-[#555] shadow-border hover:bg-[#fafafa] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add half pallet
              </button>
            )}
            {!fullPallet && (
              <button
                onClick={() => handleAddPallet('full')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-[#555] shadow-border hover:bg-[#fafafa] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add full pallet
              </button>
            )}
            <div className="ml-auto flex items-center gap-3 text-[11px] text-[#888]">
              {halfPallet && (
                <Link
                  to={roleHref(`/retailers/${retailerId}/pallets/${halfPallet.id}`)}
                  className="hover:text-[#171717] transition-colors"
                >
                  Open half pallet detail →
                </Link>
              )}
              {fullPallet && (
                <Link
                  to={roleHref(`/retailers/${retailerId}/pallets/${fullPallet.id}`)}
                  className="hover:text-[#171717] transition-colors"
                >
                  Open full pallet detail →
                </Link>
              )}
            </div>
          </div>

          <ProgramMatrix
            halfPallet={halfPallet}
            fullPallet={fullPallet}
            retailer={retailer}
            products={products}
            readOnly={isReadOnly}
            onCellChange={(palletId, productId, cases) =>
              updateAssortmentForProject(palletId, productId, cases)
            }
            onQuantityChange={(palletId, quantity) =>
              updateQuantityForProject(palletId, quantity)
            }
          />

          {(halfPallet || fullPallet) && !isReadOnly && (
            <div className="mt-6 flex items-center gap-2">
              {halfPallet && (
                <button
                  onClick={() => handleRemovePallet('half')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-[#c0392b] hover:bg-red-50 transition-colors"
                >
                  Remove half pallet
                </button>
              )}
              {fullPallet && (
                <button
                  onClick={() => handleRemovePallet('full')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-[#c0392b] hover:bg-red-50 transition-colors"
                >
                  Remove full pallet
                </button>
              )}
            </div>
          )}
        </>
      )}
      {dialog}
    </div>
  )
}
