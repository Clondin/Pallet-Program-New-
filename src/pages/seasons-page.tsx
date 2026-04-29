import { useMemo, useState } from 'react'
import { Archive, ArchiveRestore, CalendarRange, Pencil, Plus, Trash2 } from 'lucide-react'
import { useSeasonStore } from '../stores/season-store'
import { useDisplayStore } from '../stores/display-store'
import { computeConfirmByDate, formatDate } from '../lib/deadline'

export function SeasonsPage() {
  const seasons = useSeasonStore((state) => state.seasons)
  const createSeason = useSeasonStore((state) => state.createSeason)
  const renameSeason = useSeasonStore((state) => state.renameSeason)
  const updateHolidayDate = useSeasonStore((state) => state.updateHolidayDate)
  const archiveSeason = useSeasonStore((state) => state.archiveSeason)
  const unarchiveSeason = useSeasonStore((state) => state.unarchiveSeason)
  const deleteSeason = useSeasonStore((state) => state.deleteSeason)
  const projects = useDisplayStore((state) => state.projects)

  const [draftName, setDraftName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  const palletCountBySeason = useMemo(() => {
    const counts = new Map<string, number>()
    for (const project of projects) {
      if (!project.seasonId) continue
      counts.set(project.seasonId, (counts.get(project.seasonId) ?? 0) + 1)
    }
    return counts
  }, [projects])

  const visibleSeasons = useMemo(() => {
    const filtered = seasons.filter((season) => (showArchived ? true : !season.archived))
    return filtered.slice().sort((a, b) => a.name.localeCompare(b.name))
  }, [seasons, showArchived])

  const handleCreate = () => {
    const name = draftName.trim()
    if (!name) return
    createSeason(name)
    setDraftName('')
  }

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id)
    setEditingName(name)
  }

  const handleSaveEdit = () => {
    if (!editingId) return
    renameSeason(editingId, editingName)
    setEditingId(null)
    setEditingName('')
  }

  const handleAttemptDelete = (seasonId: string, seasonName: string) => {
    const palletCount = palletCountBySeason.get(seasonId) ?? 0
    if (palletCount > 0) {
      const choice = window.confirm(
        `"${seasonName}" has ${palletCount} pallet${palletCount === 1 ? '' : 's'} assigned.\n\nClick OK to archive instead (pallets keep their season tag).\nClick Cancel to keep it active.`,
      )
      if (choice) archiveSeason(seasonId)
      return
    }

    const confirmDelete = window.confirm(`Delete season "${seasonName}"? This cannot be undone.`)
    if (confirmDelete) deleteSeason(seasonId)
  }

  return (
    <div className="px-10 py-10 max-w-[900px]">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-wider text-[#999]">Planning</p>
        <h1 className="text-[28px] font-semibold tracking-display text-[#171717] mt-1">Seasons</h1>
        <p className="text-[13px] text-[#666] mt-2">
          Create seasons to group pallets together. Tag a pallet with a season so warehouse builders
          and salesmen can pick by it.
        </p>
      </div>

      <div className="bg-white shadow-card rounded-xl p-5 mb-6">
        <p className="text-[12px] font-medium text-[#555] mb-2">Create a new season</p>
        <div className="flex gap-2">
          <input
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleCreate()
            }}
            placeholder='e.g. "Pesach 2026"'
            className="flex-1 px-3 py-2 text-[13px] shadow-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none"
          />
          <button
            onClick={handleCreate}
            disabled={draftName.trim().length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#171717] text-white text-[13px] font-medium hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            Create
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-medium text-[#555]">
          {visibleSeasons.length} {showArchived ? 'total' : 'active'}
        </p>
        <label className="flex items-center gap-2 text-[12px] text-[#666] cursor-pointer">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(event) => setShowArchived(event.target.checked)}
          />
          Show archived
        </label>
      </div>

      {visibleSeasons.length === 0 ? (
        <div className="bg-white shadow-card rounded-xl p-10 text-center">
          <CalendarRange className="w-8 h-8 text-[#ccc] mx-auto mb-3" />
          <p className="text-[13px] text-[#666]">No seasons yet. Create one above to get started.</p>
        </div>
      ) : (
        <div className="bg-white shadow-card rounded-xl divide-y divide-[#f0f0f0]">
          {visibleSeasons.map((season) => {
            const palletCount = palletCountBySeason.get(season.id) ?? 0
            const isEditing = editingId === season.id

            return (
              <div
                key={season.id}
                className={`px-5 py-4 flex items-center justify-between gap-4 ${
                  season.archived ? 'opacity-60' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') handleSaveEdit()
                        if (event.key === 'Escape') {
                          setEditingId(null)
                          setEditingName('')
                        }
                      }}
                      className="w-full px-2 py-1 text-[14px] font-semibold shadow-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none"
                    />
                  ) : (
                    <p className="text-[14px] font-semibold text-[#171717] truncate">
                      {season.name}
                      {season.archived && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider text-[#999] font-medium">
                          archived
                        </span>
                      )}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="text-[11px] text-[#888]">
                      {palletCount} pallet{palletCount === 1 ? '' : 's'}
                    </span>
                    <label className="flex items-center gap-2 text-[11px] text-[#888]">
                      <span>Holiday date:</span>
                      <input
                        type="date"
                        value={
                          season.holidayDate
                            ? new Date(season.holidayDate).toISOString().slice(0, 10)
                            : ''
                        }
                        onChange={(event) => {
                          const value = event.target.value
                          if (!value) {
                            updateHolidayDate(season.id, undefined)
                            return
                          }
                          const [y, m, d] = value.split('-').map(Number)
                          updateHolidayDate(
                            season.id,
                            new Date(y, m - 1, d, 12).getTime(),
                          )
                        }}
                        className="px-2 py-1 text-[11px] shadow-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none"
                      />
                    </label>
                    {season.holidayDate && (
                      <span className="text-[11px] text-[#666]">
                        Confirm by{' '}
                        <span className="font-medium text-[#171717]">
                          {formatDate(computeConfirmByDate(season.holidayDate))}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!isEditing && (
                    <button
                      onClick={() => handleStartEdit(season.id, season.name)}
                      title="Rename"
                      className="p-2 rounded-md text-[#888] hover:text-[#171717] hover:bg-[#f5f5f5] transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {season.archived ? (
                    <button
                      onClick={() => unarchiveSeason(season.id)}
                      title="Unarchive"
                      className="p-2 rounded-md text-[#888] hover:text-[#171717] hover:bg-[#f5f5f5] transition-colors"
                    >
                      <ArchiveRestore className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => archiveSeason(season.id)}
                      title="Archive"
                      className="p-2 rounded-md text-[#888] hover:text-[#171717] hover:bg-[#f5f5f5] transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleAttemptDelete(season.id, season.name)}
                    title="Delete"
                    className="p-2 rounded-md text-[#c0392b] hover:bg-[#c0392b]/5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
