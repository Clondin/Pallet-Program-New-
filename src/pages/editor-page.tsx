import { useDisplayStore } from '../stores/display-store'
import { ThreeDViewer } from '../components/Editor/three-d-viewer'
import { GridEditor } from '../components/Editor/grid-editor'
import { EmptyState } from '../components/Editor/empty-state'
import { ProductPickerModal } from '../components/Editor/product-picker-modal'

export function EditorPage() {
  const viewMode = useDisplayStore(s => s.viewMode)
  const currentProject = useDisplayStore(s => s.currentProject)

  if (!currentProject) {
    return (
      <>
        <EmptyState />
        <ProductPickerModal />
      </>
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
