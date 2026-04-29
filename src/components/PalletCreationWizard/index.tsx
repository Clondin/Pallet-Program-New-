import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, ArrowRight, CalendarRange, Check, Plus, X } from 'lucide-react'
import { useDisplayStore } from '../../stores/display-store'
import { useRetailerStore } from '../../stores/retailer-store'
import { compareSeasonsByHolidayDate, useSeasonStore } from '../../stores/season-store'
import { useAppSettingsStore } from '../../stores/app-settings-store'
import type { Holiday, PalletType, RetailerTier } from '../../types'

const SEASONS: { label: string; value: Holiday; icon: string }[] = [
  { label: 'Rosh Hashanah', value: 'rosh-hashanah', icon: '🍎' },
  { label: 'Pesach', value: 'pesach', icon: '🫓' },
  { label: 'Sukkos', value: 'sukkos', icon: '🌿' },
  { label: 'Everyday', value: 'none', icon: '📦' },
]

const tierColors: Record<RetailerTier, string> = {
  enterprise: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  premium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  standard: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-10">
      {Array.from({ length: total }, (_, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === current
                ? 'bg-white scale-125'
                : index < current
                  ? 'bg-white/60'
                  : 'bg-white/20'
            }`}
          />
          {index < total - 1 && (
            <div
              className={`w-8 h-px transition-colors duration-300 ${
                index < current ? 'bg-white/40' : 'bg-white/10'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function SelectionCard({
  selected,
  onClick,
  children,
  className = '',
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative rounded-xl border p-6 text-left transition-all duration-200
        cursor-pointer group w-full
        ${
          selected
            ? 'border-white/40 bg-white/[0.08] ring-1 ring-white/20'
            : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
        }
        ${className}
      `}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white flex items-center justify-center">
          <Check size={12} className="text-[#111]" />
        </div>
      )}
      {children}
    </button>
  )
}

type PalletOption = {
  value: PalletType
  label: string
  size: string
  blockClass: string
}

const PALLET_OPTIONS: PalletOption[] = [
  { value: 'half', label: 'Half Pallet', size: '24" x 20"', blockClass: 'w-7 h-16' },
  { value: 'full', label: 'Full Pallet', size: '48" x 40"', blockClass: 'w-14 h-16' },
]

function PalletTypeCarousel({
  value,
  onChange,
}: {
  value: PalletType
  onChange: (next: PalletType) => void
}) {
  const activeIndex = PALLET_OPTIONS.findIndex((option) => option.value === value)

  const goPrev = () => {
    const next = (activeIndex - 1 + PALLET_OPTIONS.length) % PALLET_OPTIONS.length
    onChange(PALLET_OPTIONS[next].value)
  }
  const goNext = () => {
    const next = (activeIndex + 1) % PALLET_OPTIONS.length
    onChange(PALLET_OPTIONS[next].value)
  }

  return (
    <div className="flex flex-col items-center justify-center pt-2">
      <div
        className="relative h-[300px] w-full flex items-center justify-center"
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {PALLET_OPTIONS.map((option, index) => {
            const offset = index - activeIndex
            const isActive = offset === 0
            const x = offset * 180
            const rotY = offset * -38
            const scale = isActive ? 1 : 0.78
            const opacity = isActive ? 1 : 0.45
            const z = isActive ? 2 : 1

            return (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                animate={{
                  x,
                  rotateY: rotY,
                  scale,
                  opacity,
                }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                style={{
                  zIndex: z,
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center',
                }}
                className={`absolute w-[220px] rounded-2xl border p-7 text-center transition-colors ${
                  isActive
                    ? 'border-white/40 bg-white/[0.08] ring-1 ring-white/20 shadow-2xl'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06] cursor-pointer'
                }`}
              >
                {isActive && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                    <Check size={12} className="text-[#111]" />
                  </div>
                )}
                <div className="flex flex-col items-center gap-5 py-3">
                  <div className="w-20 h-24 rounded-md border-2 border-dashed border-white/30 flex items-center justify-center">
                    <div className={`${option.blockClass} bg-white/20 rounded-sm`} />
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-white">{option.label}</p>
                    <p className="text-[12px] text-[#666] mt-1">{option.size}</p>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-2">
        <button
          type="button"
          onClick={goPrev}
          className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.12] hover:border-white/30 text-white/70 hover:text-white flex items-center justify-center transition-colors"
          aria-label="Previous pallet type"
        >
          <ArrowLeft size={14} />
        </button>
        <div className="flex items-center gap-1.5">
          {PALLET_OPTIONS.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-label={option.label}
              className={`h-1.5 rounded-full transition-all ${
                index === activeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={goNext}
          className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.12] hover:border-white/30 text-white/70 hover:text-white flex items-center justify-center transition-colors"
          aria-label="Next pallet type"
        >
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}

interface PalletCreationWizardProps {
  open: boolean
  onClose: () => void
  retailerId?: string
  allowedRetailerIds?: string[]
}

export function PalletCreationWizard({
  open,
  onClose,
  retailerId: pinnedRetailerId,
  allowedRetailerIds,
}: PalletCreationWizardProps) {
  const navigate = useNavigate()
  const lastUsedConfig = useDisplayStore((state) => state.lastUsedConfig)
  const createProject = useDisplayStore((state) => state.createProject)
  const allRetailers = useRetailerStore((state) => state.retailers)
  const retailers = useMemo(() => {
    if (!allowedRetailerIds) return allRetailers
    const allowed = new Set(allowedRetailerIds)
    return allRetailers.filter((retailer) => allowed.has(retailer.id))
  }, [allRetailers, allowedRetailerIds])
  const seasons = useSeasonStore((state) => state.seasons)
  const createSeason = useSeasonStore((state) => state.createSeason)
  const appSettings = useAppSettingsStore((s) => s.settings)

  const retailerSelectionRequired = !pinnedRetailerId
  const steps = retailerSelectionRequired
    ? ['Pallet Type', 'Season', 'Retailer', 'Name']
    : ['Pallet Type', 'Season', 'Name']

  const seasonStepIndex = 1
  const retailerStepIndex = retailerSelectionRequired ? 2 : -1

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [palletType, setPalletType] = useState<PalletType>(
    lastUsedConfig?.palletType ?? appSettings.defaultPalletType
  )
  const [season, setSeason] = useState<Holiday>(
    lastUsedConfig?.season ?? appSettings.defaultHoliday
  )
  const isRetailerAllowed = useCallback(
    (id: string | undefined | null) => {
      if (!id) return false
      if (!allowedRetailerIds) return true
      return allowedRetailerIds.includes(id)
    },
    [allowedRetailerIds],
  )
  const [retailerId, setRetailerId] = useState<string>(
    pinnedRetailerId ?? (isRetailerAllowed(lastUsedConfig?.retailerId) ? lastUsedConfig?.retailerId ?? '' : '')
  )
  const [seasonId, setSeasonId] = useState<string | null>(
    lastUsedConfig?.seasonId ?? null
  )
  const [name, setName] = useState('')

  const selectedRetailer = retailers.find((retailer) => retailer.id === retailerId)

  const selectedSeasonName = seasonId
    ? seasons.find((entry) => entry.id === seasonId)?.name
    : null

  const defaultName = useMemo(() => {
    if (!selectedRetailer) return ''
    const prefix = selectedSeasonName ?? 'Pallet'
    return `${prefix} - ${selectedRetailer.name}`
  }, [selectedSeasonName, selectedRetailer])

  useEffect(() => {
    if (!open) return

    const seeded = pinnedRetailerId ?? lastUsedConfig?.retailerId ?? ''
    const nextRetailerId = isRetailerAllowed(seeded) ? seeded : ''
    setStep(0)
    setDirection(1)
    setPalletType(lastUsedConfig?.palletType ?? appSettings.defaultPalletType)
    setSeason(lastUsedConfig?.season ?? appSettings.defaultHoliday)
    setRetailerId(nextRetailerId)
    setSeasonId(lastUsedConfig?.seasonId ?? null)
  }, [open, lastUsedConfig, pinnedRetailerId, isRetailerAllowed, appSettings.defaultPalletType, appSettings.defaultHoliday])

  useEffect(() => {
    if (!open) return
    setName(defaultName)
  }, [defaultName, open])

  const canProceed = useMemo(() => {
    const nameStepIndex = steps.length - 1

    if (step === 0) return !!palletType
    if (step === seasonStepIndex) return true
    if (step === retailerStepIndex) return !!retailerId
    if (step === nameStepIndex) return name.trim().length > 0
    return false
  }, [step, palletType, retailerId, name, seasonStepIndex, retailerStepIndex, steps.length])

  const goNext = useCallback(() => {
    if (step < steps.length - 1) {
      setDirection(1)
      setStep((current) => current + 1)
    }
  }, [step, steps.length])

  const goBack = useCallback(() => {
    if (step > 0) {
      setDirection(-1)
      setStep((current) => current - 1)
    }
  }, [step])

  const handleCreate = useCallback(() => {
    if (!retailerId || !name.trim()) return

    const retailer = retailers.find((entry) => entry.id === retailerId)
    const project = createProject(
      name.trim(),
      { palletType, season, retailerId, seasonId },
      retailer?.defaultTierCount ?? 4
    )

    onClose()
    navigate(`/retailers/${retailerId}/pallets/${project.id}`)
  }, [retailerId, name, retailers, palletType, season, seasonId, createProject, navigate, onClose])

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl mx-6 bg-[#161616] border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#555] hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-2">
          <h1 className="text-[22px] font-semibold text-white tracking-tight">
            New Pallet
          </h1>
          <p className="text-[13px] text-[#666] mt-1">{steps[step]}</p>
        </div>

        <StepIndicator current={step} total={steps.length} />

        <div className="relative overflow-hidden min-h-[320px]">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 0 && (
              <motion.div
                key="step-0"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <PalletTypeCarousel value={palletType} onChange={setPalletType} />
              </motion.div>
            )}

            {step === seasonStepIndex && (
              <motion.div
                key="step-season"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="space-y-3 max-h-[340px] overflow-y-auto pr-1"
              >
                <SelectionCard
                  selected={seasonId === null}
                  onClick={() => setSeasonId(null)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-white/[0.06] flex items-center justify-center">
                      <CalendarRange size={16} className="text-white/40" />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-white">No season</p>
                      <p className="text-[11px] text-[#777] mt-0.5">
                        Tag this pallet with a season later.
                      </p>
                    </div>
                  </div>
                </SelectionCard>

                {seasons
                  .filter((entry) => !entry.archived)
                  .slice()
                  .sort(compareSeasonsByHolidayDate)
                  .map((entry) => (
                    <SelectionCard
                      key={entry.id}
                      selected={seasonId === entry.id}
                      onClick={() => setSeasonId(entry.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-white/[0.08] flex items-center justify-center">
                          <CalendarRange size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-white">{entry.name}</p>
                        </div>
                      </div>
                    </SelectionCard>
                  ))}

                <button
                  onClick={() => {
                    const name = window.prompt('Name for the new season:')
                    if (!name || !name.trim()) return
                    const created = createSeason(name)
                    setSeasonId(created.id)
                  }}
                  className="w-full rounded-xl border border-dashed border-white/[0.12] hover:border-white/30 hover:bg-white/[0.04] p-4 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-white/[0.06] flex items-center justify-center">
                      <Plus size={16} className="text-white/60" />
                    </div>
                    <p className="text-[14px] font-medium text-white/80">Create new season…</p>
                  </div>
                </button>
              </motion.div>
            )}

            {retailerSelectionRequired && step === retailerStepIndex && (
              <motion.div
                key="step-retailer"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="space-y-3"
              >
                {retailers
                  .filter((retailer) =>
                    !allowedRetailerIds || allowedRetailerIds.includes(retailer.id),
                  )
                  .map((retailer) => (
                  <SelectionCard
                    key={retailer.id}
                    selected={retailer.id === retailerId}
                    onClick={() => setRetailerId(retailer.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[15px] font-medium text-white">{retailer.name}</p>
                        <p className="text-[12px] text-[#777] mt-1">
                          {retailer.headquartersCity}, {retailer.headquartersState}
                        </p>
                        <p className="text-[12px] text-[#666] mt-1">
                          {retailer.storeCount.toLocaleString()} stores
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-md border text-[11px] font-medium ${tierColors[retailer.tier]}`}
                      >
                        {retailer.tier}
                      </span>
                    </div>
                  </SelectionCard>
                ))}
              </motion.div>
            )}

            {step === steps.length - 1 && (
              <motion.div
                key="step-name"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="max-w-xl mx-auto pt-10"
              >
                <div className="mb-6 rounded-xl bg-white/[0.04] border border-white/[0.08] p-5">
                  <p className="text-[11px] uppercase tracking-wider text-[#777]">Retailer</p>
                  <p className="text-[15px] font-medium text-white mt-1">
                    {selectedRetailer?.name ?? 'Select a retailer'}
                  </p>
                  <p className="text-[12px] text-[#777] mt-3">
                    Season:{' '}
                    {seasonId
                      ? seasons.find((entry) => entry.id === seasonId)?.name ?? '—'
                      : 'None'}
                  </p>
                </div>

                <label className="block text-[12px] font-medium text-[#aaa] mb-2">
                  Pallet name
                </label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter pallet name"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <p className="text-[12px] text-[#666] mt-3">
                  This pallet will automatically live inside the selected retailer.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={goBack}
            disabled={step === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-[12px] font-medium text-[#bbb] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={goNext}
              disabled={!canProceed}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-[12px] font-medium bg-white text-[#111] hover:bg-[#eee] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={!canProceed}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-[12px] font-medium bg-white text-[#111] hover:bg-[#eee] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Create Pallet
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
