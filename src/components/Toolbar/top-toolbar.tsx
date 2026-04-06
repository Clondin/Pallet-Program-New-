import { useState, useRef, useEffect } from 'react'
import { Undo2, Redo2, ChevronDown } from 'lucide-react'
import { useDisplayStore } from '../../stores/display-store'
import { TrayFace } from '../../types'
import { useTierConfig } from '../../hooks/useTierConfig'
import { generateSlotGrid } from '../../lib/slot-utils'
import { useAppSettingsStore } from '../../stores/app-settings-store'

const faceLabels: Record<TrayFace, string> = {
  front: 'Front Wall',
  back: 'Back Wall',
  left: 'Left Wall',
  right: 'Right Wall',
}

export function TopToolbar() {
  const viewMode = useDisplayStore(s => s.viewMode)
  const setViewMode = useDisplayStore(s => s.setViewMode)
  const activeFace = useDisplayStore(s => s.activeFace)
  const setActiveFace = useDisplayStore(s => s.setActiveFace)
  const undo = useDisplayStore(s => s.undo)
  const redo = useDisplayStore(s => s.redo)
  const historyIndex = useDisplayStore(s => s.historyIndex)
  const historyLength = useDisplayStore(s => s.history.length)
  const currentProject = useDisplayStore(s => s.currentProject)
  const editorGridColumns = useAppSettingsStore(
    (s) => s.settings.editorGridColumns
  )
  const tiers = useTierConfig(currentProject?.tierCount ?? 4)

  const [faceOpen, setFaceOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < historyLength - 1

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFaceOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSave = () => {
    const project = useDisplayStore.getState().currentProject
    if (!project) return
    localStorage.setItem('palletforge-project', JSON.stringify(project))
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const actualColCount = Math.max(
    0,
    ...tiers.map((tier) => {
      const faceSlots = generateSlotGrid(tier).filter((slot) => slot.face === activeFace)
      return new Set(faceSlots.map((slot) => slot.col)).size
    })
  )
  const colCount = viewMode === '2d' ? editorGridColumns : actualColCount

  return (
    <div className="fixed top-0 left-[200px] right-0 z-40 flex justify-center px-8">
      <div className="mt-4 mx-auto max-w-fit px-5 py-2 bg-white/90 backdrop-blur-md shadow-card rounded-lg flex items-center gap-6">
        {/* 2D/3D Toggle */}
        <div className="flex items-center shadow-ring rounded-md overflow-hidden">
          <button
            onClick={() => setViewMode('2d')}
            className={`text-[11px] font-medium px-4 py-1.5 transition-colors ${
              viewMode === '2d' ? 'bg-[#171717] text-white' : 'bg-white text-[#666] hover:bg-[#fafafa]'
            }`}
          >
            2D
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`text-[11px] font-medium px-4 py-1.5 transition-colors ${
              viewMode === '3d' ? 'bg-[#171717] text-white' : 'bg-white text-[#666] hover:bg-[#fafafa]'
            }`}
          >
            3D
          </button>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-4 text-[#999]" style={{ boxShadow: '-1px 0 0 0 rgba(0,0,0,0.06)', paddingLeft: '1.5rem' }}>
          {/* Face Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setFaceOpen(!faceOpen)}
              className="flex items-center gap-1.5 cursor-pointer hover:text-[#0a72ef] transition-colors"
            >
              <span className="text-[12px] font-medium text-[#171717]">
                {faceLabels[activeFace]}
              </span>
              <ChevronDown size={13} className="text-[#999]" />
            </button>

            {faceOpen && (
              <div className="absolute top-full mt-2 left-0 bg-white shadow-elevated rounded-lg py-1 min-w-[140px] z-50">
                {(Object.keys(faceLabels) as TrayFace[]).map(face => (
                  <button
                    key={face}
                    onClick={() => { setActiveFace(face); setFaceOpen(false) }}
                    className={`w-full text-left px-4 py-2 text-[12px] font-medium transition-colors ${
                      activeFace === face ? 'text-[#0a72ef] bg-[#0a72ef]/5' : 'text-[#555] hover:bg-[#fafafa]'
                    }`}
                  >
                    {faceLabels[face]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-2">
            <button
              onClick={undo} disabled={!canUndo}
              className={`p-1 rounded transition-colors ${canUndo ? 'text-[#555] hover:text-[#0a72ef] hover:bg-[#0a72ef]/5' : 'text-[#ddd]'}`}
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={redo} disabled={!canRedo}
              className={`p-1 rounded transition-colors ${canRedo ? 'text-[#555] hover:text-[#0a72ef] hover:bg-[#0a72ef]/5' : 'text-[#ddd]'}`}
            >
              <Redo2 size={16} />
            </button>
          </div>

          {/* Column count */}
          <div className="flex items-center gap-1.5" style={{ boxShadow: '-1px 0 0 0 rgba(0,0,0,0.06)', paddingLeft: '1rem' }}>
            <span className="text-[11px] font-medium text-[#999]">Cols</span>
            <span className="text-[11px] font-semibold text-[#171717] tabular-nums">{colCount}</span>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="bg-[#171717] text-white text-[12px] font-medium px-5 py-1.5 rounded-md hover:bg-[#333] transition-colors active:scale-[0.97]"
        >
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>
    </div>
  )
}
