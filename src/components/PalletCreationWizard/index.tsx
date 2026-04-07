import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, Box, Layers, Package, X } from 'lucide-react'
import { useDisplayStore } from '../../stores/display-store'
import { useRetailerStore } from '../../stores/retailer-store'
import type { PalletType, Holiday, RetailerTier } from '../../types'

const STEPS = ['Pallet Type', 'Season', 'Retailer'] as const

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
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === current
                ? 'bg-white scale-125'
                : i < current
                  ? 'bg-white/60'
                  : 'bg-white/20'
            }`}
          />
          {i < total - 1 && (
            <div
              className={`w-8 h-px transition-colors duration-300 ${
                i < current ? 'bg-white/40' : 'bg-white/10'
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
        ${selected
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
}

export function PalletCreationWizard({ open, onClose }: PalletCreationWizardProps) {
  const navigate = useNavigate()
  const lastUsedConfig = useDisplayStore(s => s.lastUsedConfig)
  const createProject = useDisplayStore(s => s.createProject)
  const retailers = useRetailerStore(s => s.retailers)

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [palletType, setPalletType] = useState<PalletType>(
    lastUsedConfig?.palletType ?? 'full'
  )
  const [season, setSeason] = useState<Holiday>(
    lastUsedConfig?.season ?? 'none'
  )
  const [retailerId, setRetailerId] = useState<string>(
    lastUsedConfig?.retailerId ?? ''
  )

  useEffect(() => {
    if (open) {
      setStep(0)
      setDirection(1)
      setPalletType(lastUsedConfig?.palletType ?? 'full')
      setSeason(lastUsedConfig?.season ?? 'none')
      setRetailerId(lastUsedConfig?.retailerId ?? '')
    }
  }, [open])

  const canProceed = useMemo(() => {
    if (step === 0) return !!palletType
    if (step === 1) return !!season
    if (step === 2) return !!retailerId
    return false
  }, [step, palletType, season, retailerId])

  const goNext = useCallback(() => {
    if (step < 2) {
      setDirection(1)
      setStep(s => s + 1)
    }
  }, [step])

  const goBack = useCallback(() => {
    if (step > 0) {
      setDirection(-1)
      setStep(s => s - 1)
    }
  }, [step])

  const handleCreate = useCallback(() => {
    if (!retailerId) return

    const retailer = retailers.find(r => r.id === retailerId)
    const seasonLabel = SEASONS.find(s => s.value === season)?.label ?? 'New'
    const name = `${seasonLabel} — ${retailer?.name ?? 'Pallet'}`

    createProject(
      name,
      { palletType, season, retailerId },
      retailer?.defaultTierCount ?? 4
    )
    onClose()
    navigate('/editor')
  }, [retailerId, retailers, season, palletType, createProject, navigate, onClose])

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-6 bg-[#161616] border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#555] hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-[22px] font-semibold text-white tracking-tight">
            New Pallet Project
          </h1>
          <p className="text-[13px] text-[#666] mt-1">
            {STEPS[step]}
          </p>
        </div>

        <StepIndicator current={step} total={3} />

        {/* Step Content */}
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
                {SEASONS.map(s => (
                  <SelectionCard
                    key={s.value}
                    selected={season === s.value}
                    onClick={() => setSeason(s.value)}
                  >
                    <div className="flex flex-col items-center text-center gap-3 py-3">
                      <span className="text-3xl">{s.icon}</span>
                      <p className="text-[15px] font-medium text-white">{s.label}</p>
                    </div>
                  </SelectionCard>
                ))}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="space-y-3 max-h-[300px] overflow-y-auto pr-1"
              >
                {retailers.length === 0 ? (
                  <div className="text-center py-12">
                    <Layers size={32} className="mx-auto text-[#444] mb-3" />
                    <p className="text-[14px] text-[#666]">No retailers configured</p>
                    <p className="text-[12px] text-[#555] mt-1">
                      Add retailers in the Retailers section first.
                    </p>
                  </div>
                ) : (
                  retailers.map(r => {
                    const authorizedCount = r.authorizedItems?.filter(
                      i => i.status === 'authorized'
                    ).length ?? 0

                    return (
                      <SelectionCard
                        key={r.id}
                        selected={retailerId === r.id}
                        onClick={() => setRetailerId(r.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center">
                              <Box size={16} className="text-[#888]" />
                            </div>
                            <div>
                              <p className="text-[14px] font-medium text-white">{r.name}</p>
                              <p className="text-[11px] text-[#666] mt-0.5">
                                {authorizedCount} authorized item{authorizedCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                              tierColors[r.tier] ?? tierColors.standard
                            }`}
                          >
                            {r.tier}
                          </span>
                        </div>
                      </SelectionCard>
                    )
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={goBack}
            disabled={step === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
              step === 0
                ? 'text-[#444] cursor-not-allowed'
                : 'text-[#999] hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <ArrowLeft size={14} />
            Back
          </button>

          {step < 2 ? (
            <button
              onClick={goNext}
              disabled={!canProceed}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                canProceed
                  ? 'bg-white text-[#111] hover:bg-[#eee] active:scale-[0.97]'
                  : 'bg-white/10 text-[#555] cursor-not-allowed'
              }`}
            >
              Next
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={!canProceed}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                canProceed
                  ? 'bg-white text-[#111] hover:bg-[#eee] active:scale-[0.97]'
                  : 'bg-white/10 text-[#555] cursor-not-allowed'
              }`}
            >
              Create Pallet
              <Check size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
