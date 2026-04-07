import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDisplayStore } from '../stores/display-store'
import { ThreeDViewer } from '../components/Editor/three-d-viewer'
import { GridEditor } from '../components/Editor/grid-editor'
import { ProductPickerModal } from '../components/Editor/product-picker-modal'
import { Package } from 'lucide-react'

export function EditorPage() {
  const { palletId, retailerId } = useParams()
  const viewMode = useDisplayStore((state) => state.viewMode)
  const currentProject = useDisplayStore((state) => state.currentProject)
  const selectProject = useDisplayStore((state) => state.selectProject)

  useEffect(() => {
    if (palletId && currentProject?.id !== palletId) {
      selectProject(palletId)
    }
  }, [palletId, currentProject?.id, selectProject])

  if (!currentProject) {
    return (
      <div className="flex-1 h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <Package size={40} className="mx-auto text-[#333] mb-4" />
          <p className="text-[15px] text-[#666] font-medium">No pallet loaded</p>
          <p className="text-[12px] text-[#444] mt-1">
            Open a retailer and create a pallet to start building.
          </p>
          <Link
            to="/retailers"
            className="inline-flex mt-4 px-4 py-2 rounded-md bg-white text-[#111] text-[12px] font-medium hover:bg-[#eee] transition-colors"
          >
            Go to Retailers
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {retailerId && palletId && (
        <div className="absolute left-[232px] top-5 z-30">
          <Link
            to={`/retailers/${retailerId}/pallets/${palletId}`}
            className="inline-flex items-center px-3 py-1.5 rounded-md bg-white/90 backdrop-blur text-[12px] font-medium text-[#555] hover:text-[#171717] transition-colors"
          >
            Back to pallet
          </Link>
        </div>
      )}
      <div className="flex-1 h-screen relative">
        {viewMode === '3d' ? <ThreeDViewer /> : <GridEditor />}
      </div>
      <ProductPickerModal />
    </>
  )
}
