import { LayoutGrid } from 'lucide-react'
import { useDisplayStore } from '../../stores/display-store'
import { useNavigate } from 'react-router-dom'

export function EmptyState() {
  const createProject = useDisplayStore(s => s.createProject)
  const navigate = useNavigate()

  const handleCreate = () => {
    createProject('New Palette', 'ret-1', 'rosh-hashanah', 4)
    navigate('/editor')
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-[#fafafa]">
      <div className="text-center max-w-md">
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-lg shadow-card bg-white">
          <LayoutGrid size={28} className="text-[#ccc]" />
        </div>
        <h2 className="text-[20px] font-semibold text-[#171717] mb-2 tracking-heading">
          Create a palette to get started
        </h2>
        <p className="text-[14px] text-[#888] mb-8 leading-relaxed">
          Set up your palette first, then browse the catalog and place products on the grid.
        </p>
        <button
          onClick={handleCreate}
          className="bg-[#171717] hover:bg-[#333] text-white px-6 py-2.5 rounded-md text-[13px] font-medium transition-colors active:scale-[0.97] inline-flex items-center gap-2"
        >
          <LayoutGrid size={14} />
          Create Palette
        </button>
      </div>
    </div>
  )
}
