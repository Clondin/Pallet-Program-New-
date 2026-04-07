import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import { useDisplayStore } from '../../stores/display-store'
import { useRetailerStore } from '../../stores/retailer-store'
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

interface PalletCreationWizardProps {
  open: boolean
  onClose: () => void
  retailerId?: string
}

export function PalletCreationWizard({
  open,
  onClose,
  retailerId: pinnedRetailerId,
}: PalletCreationWizardProps) {
  const navigate = useNavigate()
  const lastUsedConfig = useDisplayStore((state) => state.lastUsedConfig)
  const createProject = useDisplayStore((state) => state.createProject)
  const retailers = useRetailerStore((state) => state.retailers)

  const retailerSelectionRequired = !pinnedRetailerId
  const steps = retailerSelectionRequired
    ? ['Pallet Type', 'Holiday', 'Retailer', 'Name']
    : ['Pallet Type', 'Holiday', 'Name']

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [palletType, setPalletType] = useState<PalletType>(
    lastUsedConfig?.palletType ?? 'full'
  )
  const [season, setSeason] = useState<Holiday>(lastUsedConfig?.season ?? 'none')
  const [retailerId, setRetailerId] = useState<string>(
    pinnedRetailerId ?? lastUsedConfig?.retailerId ?? ''
  )
  const [name, setName] = useState('')

  const selectedRetailer = retailers.find((retailer) => retailer.id === retailerId)

  const defaultName = useMemo(() => {
    if (!selectedRetailer) return ''
    const seasonLabel = SEASONS.find((entry) => entry.value === season)?.label ?? 'Everyday'
    return `${seasonLabel} - ${selectedRetailer.name}`
  }, [season, selectedRetailer])

  useEffect(() => {
    if (!open) return

    const nextRetailerId = pinnedRetailerId ?? lastUsedConfig?.retailerId ?? ''
    setStep(0)
    setDirection(1)
    setPalletType(lastUsedConfig?.palletType ?? 'full')
    setSeason(lastUsedConfig?.season ?? 'none')
    setRetailerId(nextRetailerId)
  }, [open, lastUsedConfig, pinnedRetailerId])

  useEffect(() => {
    if (!open) return
    setName(defaultName)
  }, [defaultName, open])

  const canProceed = useMemo(() => {
    const retailerStepIndex = retailerSelectionRequired ? 2 : -1
    const nameStepIndex = steps.length - 1

    if (step === 0) return !!palletType
    if (step === 1) return !!season
    if (step === retailerStepIndex) return !!retailerId
    if (step === nameStepIndex) return name.trim().length > 0
    return false
  }, [step, palletType, season, retailerId, name, retailerSelectionRequired, steps.length])

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
      { palletType, season, retailerId },
      retailer?.defaultTierCount ?? 4
    )

    onClose()
    navigate(`/retailers/${retailerId}/pallets/${project.id}`)
  }, [retailerId, name, retailers, palletType, season, createProject, navigate, onClose])

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
                className="grid grid-cols-2 gap-4"
              >
                <SelectionCard
                  selected={palletType === 'half'}
                  onClick={() => setPalletType('half')}
                >
                  <div className="flex flex-col items-center text-center gap-4 py-4">
                    <div className="w-16 h-20 rounded-md border-2 border-dashed border-white/30 flex items-center justify-center">
                      <div className="w-6 h-14 bg-white/20 rounded-sm" />
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-white">Half Pallet</p>
                      <p className="text-[12px] text-[#666] mt-1">24&quot; x 20&quot;</p>
                    </div>
                  </div>
                </SelectionCard>

                <SelectionCard
                  selected={palletType === 'full'}
                  onClick={() => setPalletType('full')}
                >
                  <div className="flex flex-col items-center text-center gap-4 py-4">
                    <div className="w-16 h-20 rounded-md border-2 border-dashed border-white/30 flex items-center justify-center">
                      <div className="w-12 h-14 bg-white/20 rounded-sm" />
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-white">Full Pallet</p>
                      <p className="text-[12px] text-[#666] mt-1">48&quot; x 40&quot;</p>
                    </div>
                  </div>
                </SelectionCard>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="grid grid-cols-2 gap-4"
              >
                {SEASONS.map((entry) => (
                  <SelectionCard
                    key={entry.value}
                    selected={season === entry.value}
                    onClick={() => setSeason(entry.value)}
                  >
                    <div className="flex flex-col items-center text-center gap-3 py-3">
                      <span className="text-3xl">{entry.icon}</span>
                      <p className="text-[15px] font-medium text-white">{entry.label}</p>
                    </div>
                  </SelectionCard>
                ))}
              </motion.div>
            )}

            {retailerSelectionRequired && step === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="space-y-3"
              >
                {retailers.map((retailer) => (
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
                    Holiday: {SEASONS.find((entry) => entry.value === season)?.label ?? 'Everyday'}
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
