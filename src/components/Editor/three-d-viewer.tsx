import { useDisplayStore } from '../../stores/display-store'
import { PalletDisplay } from '../PalletDisplay'
import { PalletNavigator } from './pallet-navigator'
import { useAppSettingsStore } from '../../stores/app-settings-store'

export function ThreeDViewer() {
  const currentProject = useDisplayStore(s => s.currentProject)
  const selectedProductId = useDisplayStore(s => s.selectedProductId)
  const ghostProduct = useDisplayStore(s => s.ghostProduct)
  const pickerSelectedProduct = useDisplayStore(s => s.pickerSelectedProduct)
  const cameraPreset = useDisplayStore(s => s.cameraPreset)
  const selectProduct = useDisplayStore(s => s.selectProduct)
  const selectSlot = useDisplayStore(s => s.selectSlot)
  const setGhostProduct = useDisplayStore(s => s.setGhostProduct)
  const setPickerProduct = useDisplayStore(s => s.setPickerProduct)
  const placeProduct = useDisplayStore(s => s.placeProduct)
  const show3DSlotGrid = useAppSettingsStore((s) => s.settings.show3DSlotGrid)
  const show3DHeader = useAppSettingsStore((s) => s.settings.show3DHeader)
  const displayEnvironment = useAppSettingsStore(
    (s) => s.settings.displayEnvironment
  )

  if (!currentProject) return null

  return (
    <div className="w-full h-full relative">
      <PalletDisplay
        tierCount={currentProject.tierCount}
        palletType={currentProject.palletType}
        branding={currentProject.branding}
        placedProducts={currentProject.placements}
        ghostProduct={ghostProduct}
        selectedProductId={selectedProductId}
        onProductClick={(id) => selectProduct(id === selectedProductId ? null : id)}
        onSlotClick={(tierId, slotIndex) => {
          const slotId = `${tierId}-${slotIndex}`
          if (pickerSelectedProduct) {
            placeProduct(pickerSelectedProduct, slotId)
            setPickerProduct(null)
            setGhostProduct(null)
            selectSlot(null)
            return
          }

          selectSlot(slotId)
        }}
        onSlotHover={(tierId, slotIndex) => {
          if (pickerSelectedProduct) {
            setGhostProduct({
              slotId: `${tierId}-${slotIndex}`,
              width: pickerSelectedProduct.width,
              height: pickerSelectedProduct.height,
              depth: pickerSelectedProduct.depth,
              color: pickerSelectedProduct.brandColor,
              label: pickerSelectedProduct.name,
              isValid: true,
            })
          }
        }}
        onSlotHoverEnd={() => setGhostProduct(null)}
        cameraPreset={cameraPreset}
        lipColor={currentProject.lipColor}
        showSlotGrid={show3DSlotGrid}
        showHeader={show3DHeader}
        environment={displayEnvironment}
      />

      {/* Pallet Navigator — same widget as 2D, also controls camera in 3D */}
      <div className="absolute top-20 left-4 z-20">
        <PalletNavigator />
      </div>
    </div>
  )
}
