import { useReducer, useCallback, useMemo, useState, Suspense } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Canvas } from '@react-three/fiber'
import { X, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import {
  WizardState,
  WizardAction,
  WizardPalletConfig,
  WizardStep as WizardStepNum,
  getInitialWizardState,
  wizardReducer,
} from './wizardTypes'
import { WizardStep } from './WizardStep'
import { PalletTypeStep } from './steps/PalletTypeStep'
import { DimensionsStep } from './steps/DimensionsStep'
import { ShelfConfigStep } from './steps/ShelfConfigStep'
import { BrandingStep } from './steps/BrandingStep'
import { PalletWizardPreview } from './preview/PalletWizardPreview'

interface PalletWizardProps {
  open: boolean
  onClose: () => void
  onComplete: (config: WizardPalletConfig) => void
  initialState?: Partial<WizardState>
  editMode?: boolean
}

const STEP_LABELS = ['Pallet Type', 'Dimensions', 'Shelf & Walls', 'Branding']

export function PalletWizard({
  open,
  onClose,
  onComplete,
  initialState,
  editMode = false,
}: PalletWizardProps) {
  const [state, dispatch] = useReducer(
    wizardReducer,
    { ...getInitialWizardState(), ...initialState },
  )
  const [direction, setDirection] = useState(1)
  const [showConfirmClose, setShowConfirmClose] = useState(false)

  const step = state.currentStep

  const goNext = useCallback(() => {
    if (step < 4) {
      setDirection(1)
      dispatch({ type: 'SET_STEP', step: (step + 1) as WizardStepNum })
    }
  }, [step])

  const goBack = useCallback(() => {
    if (step > 1) {
      setDirection(-1)
      dispatch({ type: 'SET_STEP', step: (step - 1) as WizardStepNum })
    }
  }, [step])

  const handleClose = useCallback(() => {
    setShowConfirmClose(true)
  }, [])

  const confirmClose = useCallback(() => {
    setShowConfirmClose(false)
    onClose()
  }, [onClose])

  const handleCreate = useCallback(() => {
    const totalTierHeight =
      state.tierHeights.reduce((s, h) => s + h, 0) + state.tierCount

    const isCustom =
      state.palletType === 'full' &&
      Object.values(state.walls).every((w) => w.type === 'shelves')
        ? state.palletType
        : state.palletType === 'half' &&
            state.walls.front.type === 'shelves' &&
            state.walls.back.type === 'open' &&
            state.walls.left.type === 'branded-panel' &&
            state.walls.right.type === 'branded-panel'
          ? state.palletType
          : 'custom'

    const config: WizardPalletConfig = {
      id: crypto.randomUUID(),
      name: `${state.palletType === 'full' ? 'Full' : 'Half'} ${state.baseWidth}×${state.baseDepth}`,
      type: isCustom,
      base: {
        width: state.baseWidth,
        depth: state.baseDepth,
        height: state.baseHeight,
        preset: state.preset,
      },
      display: {
        tierCount: state.tierCount,
        maxHeight: state.maxHeight,
        tiers: state.tierHeights.map((h, i) => ({ id: i + 1, trayHeight: h })),
        walls: {
          front: { ...state.walls.front, backgroundColor: state.panelColor },
          back: { ...state.walls.back, backgroundColor: state.panelColor },
          left: { ...state.walls.left, backgroundColor: state.panelColor },
          right: { ...state.walls.right, backgroundColor: state.panelColor },
        },
        shelfDepth: state.shelfDepth,
        header: {
          enabled: state.headerEnabled,
          text: state.headerText,
          color: state.headerColor,
        },
      },
      branding: {
        lipColor: state.lipColor,
        lipText: state.lipText,
        lipTextColor: state.lipTextColor,
        panelColor: state.panelColor,
        panelText: state.panelText,
        featuredBrands: state.featuredBrands,
      },
    }

    onComplete(config)
  }, [state, onComplete])

  const previewTiers = useMemo(
    () => state.tierHeights.map((h, i) => ({ id: i + 1, trayHeight: h })),
    [state.tierHeights],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)' }}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative flex flex-col bg-white rounded-2xl overflow-hidden"
        style={{
          width: 900,
          height: 620,
          boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 shrink-0"
          style={{ height: 56, borderBottom: '1px solid #E2E8F0' }}
        >
          <h2 className="text-[16px] font-bold" style={{ color: '#0F172A' }}>
            {editMode ? 'Edit Pallet Display' : 'Create New Pallet Display'}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-[12px]" style={{ color: '#94A3B8' }}>
              Step {step} of 4
            </span>
            <button
              onClick={handleClose}
              className="flex items-center justify-center rounded-md transition-colors hover:bg-gray-100"
              style={{ width: 32, height: 32, color: '#94A3B8' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Split panel body */}
        <div className="flex flex-1 min-h-0">
          {/* Left: Configuration */}
          <div className="relative flex-[55] min-w-0" style={{ borderRight: '1px solid #E2E8F0' }}>
            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 && (
                <WizardStep key="step-1" direction={direction}>
                  <PalletTypeStep state={state} dispatch={dispatch} />
                </WizardStep>
              )}
              {step === 2 && (
                <WizardStep key="step-2" direction={direction}>
                  <DimensionsStep state={state} dispatch={dispatch} />
                </WizardStep>
              )}
              {step === 3 && (
                <WizardStep key="step-3" direction={direction}>
                  <ShelfConfigStep state={state} dispatch={dispatch} />
                </WizardStep>
              )}
              {step === 4 && (
                <WizardStep key="step-4" direction={direction}>
                  <BrandingStep state={state} dispatch={dispatch} />
                </WizardStep>
              )}
            </AnimatePresence>
          </div>

          {/* Right: 3D Preview */}
          <div className="flex-[45] min-w-0" style={{ background: '#1A1A2E' }}>
            <Canvas
              camera={{ position: [60, 40, 60], fov: 45 }}
              gl={{ antialias: true }}
              style={{ width: '100%', height: '100%' }}
            >
              <Suspense fallback={null}>
                <PalletWizardPreview
                  palletType={state.palletType}
                  baseWidth={state.baseWidth}
                  baseDepth={state.baseDepth}
                  baseHeight={state.baseHeight}
                  tiers={previewTiers}
                  walls={state.walls}
                  shelfDepth={state.shelfDepth}
                  lipColor={state.lipColor}
                  lipText={state.lipText}
                  headerEnabled={state.headerEnabled}
                  headerText={state.headerText}
                  headerColor={state.headerColor}
                  panelColor={state.panelColor}
                  maxHeight={state.maxHeight}
                />
              </Suspense>
            </Canvas>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 shrink-0"
          style={{
            height: 64,
            background: '#FAFBFC',
            borderTop: '1px solid #E2E8F0',
          }}
        >
          {/* Back button */}
          <div style={{ width: 100 }}>
            {step > 1 && (
              <button
                onClick={goBack}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:text-gray-900"
                style={{ color: '#64748B' }}
              >
                <ArrowLeft size={14} />
                Back
              </button>
            )}
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className="rounded-full transition-all duration-300"
                style={{
                  width: s === step ? 10 : 8,
                  height: s === step ? 10 : 8,
                  background: s <= step ? '#2563EB' : '#E2E8F0',
                }}
              />
            ))}
          </div>

          {/* Next / Create button */}
          <div style={{ width: 160 }} className="flex justify-end">
            {step < 4 ? (
              <button
                onClick={goNext}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-[13px] font-medium text-white transition-colors hover:opacity-90"
                style={{ background: '#2563EB' }}
              >
                Next
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg text-[13px] font-medium text-white transition-colors hover:opacity-90"
                style={{ background: '#2563EB' }}
              >
                <Sparkles size={14} />
                {editMode ? 'Update Pallet' : 'Create Pallet'}
              </button>
            )}
          </div>
        </div>

        {/* Confirm close dialog */}
        {showConfirmClose && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 rounded-2xl">
            <div className="bg-white rounded-xl p-6 shadow-xl max-w-xs text-center">
              <p className="text-[14px] font-semibold text-gray-900 mb-2">
                Discard changes?
              </p>
              <p className="text-[12px] text-gray-500 mb-5">
                Your wizard progress will be lost.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowConfirmClose(false)}
                  className="px-4 py-2 rounded-lg text-[12px] font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Keep editing
                </button>
                <button
                  onClick={confirmClose}
                  className="px-4 py-2 rounded-lg text-[12px] font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
