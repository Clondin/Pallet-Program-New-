import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MoreHorizontal, Plus } from 'lucide-react'
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
  const [menuOpen, setMenuOpen] = useState(false)

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
    setMenuOpen(false)
  }

  const handleRemovePallet = async (type: PalletType) => {
    const pallet = type === 'half' ? halfPallet : fullPallet
    if (!pallet) return
    setMenuOpen(false)
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
  const isSalesman = role === 'salesman'

  return (
    <div className="px-8 py-6 max-w-[1500px] mx-auto">
      {/* Compact header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(roleHref(`/retailers/${retailerId}`))}
            className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[12px] font-medium text-[#777] hover:text-[#171717] hover:bg-[#fafafa] transition-colors"
            title={`Back to ${retailer.name}`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {retailer.name}
          </button>
          <span className="text-[#ddd]">/</span>
          <h1 className="text-[18px] font-semibold tracking-tight text-[#171717] truncate">
            {seasonLabel}
          </h1>
        </div>

        {!isReadOnly && (
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-[#555] shadow-border hover:bg-[#fafafa] transition-colors"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
              Program actions
            </button>
            {menuOpen && (
              <>
                <button
                  className="fixed inset-0 z-30 cursor-default"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden
                />
                <div className="absolute right-0 top-full mt-1 w-[220px] bg-white shadow-elevated rounded-md py-1 z-40">
                  {!halfPallet && (
                    <MenuItem onClick={() => handleAddPallet('half')}>
                      <Plus className="w-3.5 h-3.5" />
                      Add half pallet
                    </MenuItem>
                  )}
                  {!fullPallet && (
                    <MenuItem onClick={() => handleAddPallet('full')}>
                      <Plus className="w-3.5 h-3.5" />
                      Add full pallet
                    </MenuItem>
                  )}
                  {!isSalesman && halfPallet && (
                    <MenuItem
                      onClick={() =>
                        navigate(
                          roleHref(
                            `/retailers/${retailerId}/pallets/${halfPallet.id}`,
                          ),
                        )
                      }
                    >
                      Open half pallet detail
                    </MenuItem>
                  )}
                  {!isSalesman && fullPallet && (
                    <MenuItem
                      onClick={() =>
                        navigate(
                          roleHref(
                            `/retailers/${retailerId}/pallets/${fullPallet.id}`,
                          ),
                        )
                      }
                    >
                      Open full pallet detail
                    </MenuItem>
                  )}
                  {(halfPallet || fullPallet) && <Divider />}
                  {halfPallet && (
                    <MenuItem
                      destructive
                      onClick={() => handleRemovePallet('half')}
                    >
                      Remove half pallet
                    </MenuItem>
                  )}
                  {fullPallet && (
                    <MenuItem
                      destructive
                      onClick={() => handleRemovePallet('full')}
                    >
                      Remove full pallet
                    </MenuItem>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {seasonPallets.length === 0 ? (
        <div className="bg-white shadow-card rounded-xl py-16 px-8 text-center">
          <p className="text-[15px] font-semibold text-[#171717]">
            No pallets yet
          </p>
          <p className="text-[12px] text-[#888] mt-2 max-w-md mx-auto">
            Choose which pallet types to include in this program.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => handleAddPallet('half')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#171717] text-white text-[13px] font-medium hover:bg-[#333] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add half pallet
            </button>
            <button
              onClick={() => handleAddPallet('full')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#171717] text-white text-[13px] font-medium hover:bg-[#333] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add full pallet
            </button>
          </div>
        </div>
      ) : (
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
      )}
      {dialog}
    </div>
  )
}

function MenuItem({
  children,
  onClick,
  destructive,
}: {
  children: React.ReactNode
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full inline-flex items-center gap-2 px-3 py-2 text-left text-[12px] font-medium transition-colors ${
        destructive
          ? 'text-[#c0392b] hover:bg-red-50'
          : 'text-[#171717] hover:bg-[#fafafa]'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="h-px bg-[#f0f0f0] my-1" />
}
