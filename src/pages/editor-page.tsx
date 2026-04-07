import { useDisplayStore } from '../stores/display-store'
import { ThreeDViewer } from '../components/Editor/three-d-viewer'
import { GridEditor } from '../components/Editor/grid-editor'
import { ProductPickerModal } from '../components/Editor/product-picker-modal'
import { Package } from 'lucide-react'

export function EditorPage() {
  const viewMode = useDisplayStore(s => s.viewMode)
  const currentProject = useDisplayStore(s => s.currentProject)

  if (!currentProject) {
    return (
      <div className="flex-1 h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <Package size={40} className="mx-auto text-[#333] mb-4" />
          <p className="text-[15px] text-[#666] font-medium">No pallet loaded</p>
          <p className="text-[12px] text-[#444] mt-1">
            Click <span className="text-white font-medium">New Pallet</span> in the sidebar to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 h-screen relative">
        {viewMode === '3d' ? <ThreeDViewer /> : <GridEditor />}
      </div>
      <ProductPickerModal />
    </>
  )
}
