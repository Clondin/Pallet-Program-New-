import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import { useDisplayStore } from '../../stores/display-store'
import { useRetailerStore } from '../../stores/retailer-store'
import {
  compareSeasonsByHolidayDate,
  useSeasonStore,
} from '../../stores/season-store'
import { useRoleHref } from '../../lib/role-href'
import type { Holiday, PalletType, Retailer, Season } from '../../types'

interface StartProgramWizardProps {
  open: boolean
  onClose: () => void
  /** Pin the wizard to a single retailer (skips the retailer step). */
  pinnedRetailerId?: string
  /** Filter the retailer step to a subset (used for salesman scoping). */
  allowedRetailerIds?: string[]
}

const HOLIDAY_OPTIONS: { value: Holiday; label: string }[] = [
  { value: 'rosh-hashanah', label: 'Rosh Hashanah' },
  { value: 'pesach', label: 'Pesach' },
  { value: 'sukkos', label: 'Sukkos' },
  { value: 'none', label: 'Everyday' },
]

type Step = 'retailer' | 'season' | 'types' | 'review'

export function StartProgramWizard({
  open,
  onClose,
  pinnedRetailerId,
  allowedRetailerIds,
}: StartProgramWizardProps) {
  const navigate = useNavigate()
  const roleHref = useRoleHref()
  const retailers = useRetailerStore((state) => state.retailers)
  const seasons = useSeasonStore((state) => state.seasons)
  const createSeason = useSeasonStore((state) => state.createSeason)
  const createProject = useDisplayStore((state) => state.createProject)

  const allowedRetailers = useMemo(() => {
    let list = retailers.filter((r) => r.status !== 'inactive')
    if (allowedRetailerIds) {
      const allow = new Set(allowedRetailerIds)
      list = list.filter((r) => allow.has(r.id))
    }
    if (pinnedRetailerId) {
      list = list.filter((r) => r.id === pinnedRetailerId)
    }
    return list.slice().sort((a, b) => a.name.localeCompare(b.name))
  }, [retailers, allowedRetailerIds, pinnedRetailerId])

  const activeSeasons = useMemo(
    () => seasons.filter((s) => !s.archived).slice().sort(compareSeasonsByHolidayDate),
    [seasons],
  )

  const initialStep: Step = pinnedRetailerId ? 'season' : 'retailer'

  const [step, setStep] = useState<Step>(initialStep)
  const [retailerId, setRetailerId] = useState<string>(pinnedRetailerId ?? '')
  const [seasonId, setSeasonId] = useState<string>('')
  const [newSeasonName, setNewSeasonName] = useState('')
  const [holiday, setHoliday] = useState<Holiday>('rosh-hashanah')
  const [includeHalf, setIncludeHalf] = useState(false)
  const [includeFull, setIncludeFull] = useState(true)

  useEffect(() => {
    if (!open) return
    setStep(pinnedRetailerId ? 'season' : 'retailer')
    setRetailerId(pinnedRetailerId ?? '')
    setSeasonId('')
    setNewSeasonName('')
    setHoliday('rosh-hashanah')
    setIncludeHalf(false)
    setIncludeFull(true)
  }, [open, pinnedRetailerId])

  if (!open) return null

  const retailer: Retailer | undefined = retailers.find((r) => r.id === retailerId)
  const season: Season | undefined = seasons.find((s) => s.id === seasonId)

  const isLastStep = step === 'review'
  const canAdvanceRetailer = retailerId !== ''
  const canAdvanceSeason =
    seasonId !== '' || newSeasonName.trim().length > 0
  const canAdvanceTypes = includeHalf || includeFull

  const steps: Step[] = pinnedRetailerId
    ? ['season', 'types', 'review']
    : ['retailer', 'season', 'types', 'review']
  const stepIndex = steps.indexOf(step)

  function goNext() {
    if (step === 'retailer' && canAdvanceRetailer) setStep('season')
    else if (step === 'season' && canAdvanceSeason) setStep('types')
    else if (step === 'types' && canAdvanceTypes) setStep('review')
  }

  function goBack() {
    const prev = steps[stepIndex - 1]
    if (prev) setStep(prev)
  }

  function handleCreate() {
    if (!retailer) return
    let effectiveSeason: Season | undefined = season
    if (!effectiveSeason) {
      const name = newSeasonName.trim()
      if (!name) return
      effectiveSeason = createSeason(name)
    }
    const seasonLabel = effectiveSeason.name
    const types: PalletType[] = []
    if (includeHalf) types.push('half')
    if (includeFull) types.push('full')

    for (const type of types) {
      createProject(
        `${seasonLabel} ${type === 'full' ? 'Full' : 'Half'} — ${retailer.name}`,
        {
          palletType: type,
          season: holiday,
          retailerId: retailer.id,
          seasonId: effectiveSeason.id,
        },
        retailer.defaultTierCount ?? 4,
      )
    }

    onClose()
    navigate(
      roleHref(`/retailers/${retailer.id}/program/${effectiveSeason.id}`),
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[640px] mx-4 shadow-elevated rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
          <div>
            <h2 className="text-[16px] font-semibold text-[#171717]">
              Start a program
            </h2>
            <p className="text-[11px] text-[#888] mt-1">
              {stepIndex + 1} of {steps.length}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-md hover:bg-[#fafafa] text-[#ccc] hover:text-[#666] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-6 min-h-[260px]">
          {step === 'retailer' && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#999] mb-3">
                Retailer
              </p>
              {allowedRetailers.length === 0 ? (
                <p className="text-[12px] text-[#888]">
                  No retailers available.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto">
                  {allowedRetailers.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRetailerId(r.id)}
                      className={`flex items-center justify-between px-4 py-3 rounded-md text-left transition-colors ${
                        retailerId === r.id
                          ? 'bg-[#171717] text-white'
                          : 'bg-[#fafafa] hover:bg-[#f0f0f0] text-[#171717]'
                      }`}
                    >
                      <span className="text-[14px] font-medium">{r.name}</span>
                      {retailerId === r.id && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'season' && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#999] mb-3">
                Season
              </p>
              {activeSeasons.length > 0 && (
                <div className="grid grid-cols-1 gap-2 mb-4 max-h-[200px] overflow-y-auto">
                  {activeSeasons.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSeasonId(s.id)
                        setNewSeasonName('')
                      }}
                      className={`flex items-center justify-between px-4 py-3 rounded-md text-left transition-colors ${
                        seasonId === s.id
                          ? 'bg-[#171717] text-white'
                          : 'bg-[#fafafa] hover:bg-[#f0f0f0] text-[#171717]'
                      }`}
                    >
                      <span className="text-[13px] font-medium">{s.name}</span>
                      {seasonId === s.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
              <div>
                <p className="text-[11px] font-medium text-[#666] mb-2">
                  Or create a new season
                </p>
                <input
                  type="text"
                  value={newSeasonName}
                  onChange={(e) => {
                    setNewSeasonName(e.target.value)
                    if (e.target.value.trim()) setSeasonId('')
                  }}
                  placeholder="e.g. Rosh Hashanah 2026"
                  className="w-full px-3 py-2 text-[13px] shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none placeholder:text-[#aaa]"
                />
              </div>
              <div className="mt-5">
                <p className="text-[10px] uppercase tracking-wider text-[#999] mb-2">
                  Holiday family
                </p>
                <div className="flex flex-wrap gap-2">
                  {HOLIDAY_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setHoliday(value)}
                      className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                        holiday === value
                          ? 'bg-[#171717] text-white'
                          : 'bg-[#fafafa] hover:bg-[#f0f0f0] text-[#555]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'types' && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#999] mb-3">
                Pallet types
              </p>
              <p className="text-[12px] text-[#888] mb-4">
                Pick which pallet sizes are part of this program. You can edit
                quantities and assortment after creation.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIncludeHalf((v) => !v)}
                  className={`flex flex-col items-start gap-2 px-4 py-4 rounded-lg text-left transition-colors ${
                    includeHalf
                      ? 'bg-[#171717] text-white'
                      : 'bg-[#fafafa] hover:bg-[#f0f0f0] text-[#171717]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {includeHalf ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="w-4 h-4 rounded-full shadow-border" />
                    )}
                    <span className="text-[14px] font-semibold">
                      Half pallet
                    </span>
                  </div>
                  <span
                    className={`text-[11px] ${
                      includeHalf ? 'text-white/70' : 'text-[#888]'
                    }`}
                  >
                    48 × 20 footprint
                  </span>
                </button>
                <button
                  onClick={() => setIncludeFull((v) => !v)}
                  className={`flex flex-col items-start gap-2 px-4 py-4 rounded-lg text-left transition-colors ${
                    includeFull
                      ? 'bg-[#171717] text-white'
                      : 'bg-[#fafafa] hover:bg-[#f0f0f0] text-[#171717]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {includeFull ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="w-4 h-4 rounded-full shadow-border" />
                    )}
                    <span className="text-[14px] font-semibold">
                      Full pallet
                    </span>
                  </div>
                  <span
                    className={`text-[11px] ${
                      includeFull ? 'text-white/70' : 'text-[#888]'
                    }`}
                  >
                    48 × 40 footprint
                  </span>
                </button>
              </div>
            </div>
          )}

          {step === 'review' && retailer && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#999] mb-3">
                Review
              </p>
              <div className="space-y-3">
                <Row label="Retailer" value={retailer.name} />
                <Row
                  label="Season"
                  value={season?.name ?? (newSeasonName.trim() || '—')}
                />
                <Row
                  label="Pallets"
                  value={[
                    includeHalf ? 'Half' : null,
                    includeFull ? 'Full' : null,
                  ]
                    .filter(Boolean)
                    .join(' + ')}
                />
              </div>
              <p className="text-[11px] text-[#888] mt-5">
                You'll land on the program matrix where you can fill in cases
                per item for each pallet type and set how many pallets to
                build.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[#f0f0f0] bg-[#fafafa]">
          {stepIndex > 0 ? (
            <button
              onClick={goBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-[#555] hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          ) : (
            <span />
          )}
          {isLastStep ? (
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#171717] text-white text-[13px] font-medium hover:bg-[#333] transition-colors"
            >
              Create program
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={
                (step === 'retailer' && !canAdvanceRetailer) ||
                (step === 'season' && !canAdvanceSeason) ||
                (step === 'types' && !canAdvanceTypes)
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#171717] text-white text-[13px] font-medium hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[11px] uppercase tracking-wider text-[#bbb]">
        {label}
      </span>
      <span className="text-[13px] font-medium text-[#171717] text-right">
        {value || '—'}
      </span>
    </div>
  )
}
