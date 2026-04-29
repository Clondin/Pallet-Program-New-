import { useState } from 'react'
import { Pencil, Plus, Trash2, UserPlus, Users } from 'lucide-react'
import { useSalespersonStore } from '../stores/salesperson-store'
import { useRetailerStore } from '../stores/retailer-store'

export function AssignmentsPage() {
  const salespeople = useSalespersonStore((state) => state.salespeople)
  const createSalesperson = useSalespersonStore((state) => state.createSalesperson)
  const renameSalesperson = useSalespersonStore((state) => state.renameSalesperson)
  const deleteSalesperson = useSalespersonStore((state) => state.deleteSalesperson)
  const toggleRetailer = useSalespersonStore((state) => state.toggleRetailer)
  const retailers = useRetailerStore((state) => state.retailers)

  const [draftName, setDraftName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleCreate = () => {
    const name = draftName.trim()
    if (!name) return
    createSalesperson(name)
    setDraftName('')
  }

  const sortedSalespeople = salespeople.slice().sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="px-10 py-10 max-w-[1100px]">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-wider text-[#999] flex items-center gap-1.5">
          <Users className="w-3 h-3" />
          Manager
        </p>
        <h1 className="text-[28px] font-semibold tracking-display text-[#171717] mt-1">
          Assignments
        </h1>
        <p className="text-[13px] text-[#666] mt-2">
          Map salesmen to the retailers they own. Each salesman sees only their retailers when
          they switch to the Salesman role.
        </p>
      </div>

      <div className="bg-white shadow-card rounded-xl p-5 mb-6">
        <p className="text-[12px] font-medium text-[#555] mb-2">Add salesman</p>
        <div className="flex gap-2">
          <input
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleCreate()
            }}
            placeholder="Salesman name"
            className="flex-1 px-3 py-2 text-[13px] shadow-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none"
          />
          <button
            onClick={handleCreate}
            disabled={draftName.trim().length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#171717] text-white text-[13px] font-medium hover:bg-[#333] transition-colors disabled:opacity-40"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>

      {sortedSalespeople.length === 0 ? (
        <div className="bg-white shadow-card rounded-xl p-12 text-center">
          <Users className="w-8 h-8 text-[#ccc] mx-auto mb-3" />
          <p className="text-[14px] font-semibold text-[#171717]">No salesmen yet</p>
          <p className="text-[12px] text-[#888] mt-1">Add your first salesman above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedSalespeople.map((sp) => {
            const isEditing = editingId === sp.id
            return (
              <div key={sp.id} className="bg-white shadow-card rounded-xl p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  {isEditing ? (
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      onBlur={() => {
                        renameSalesperson(sp.id, editingName)
                        setEditingId(null)
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          renameSalesperson(sp.id, editingName)
                          setEditingId(null)
                        }
                        if (event.key === 'Escape') setEditingId(null)
                      }}
                      className="text-[16px] font-semibold shadow-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none"
                    />
                  ) : (
                    <p className="text-[16px] font-semibold text-[#171717]">{sp.name}</p>
                  )}
                  <div className="flex items-center gap-1">
                    <p className="text-[11px] text-[#888] mr-2">
                      {sp.retailerIds.length} retailer{sp.retailerIds.length === 1 ? '' : 's'}
                    </p>
                    {!isEditing && (
                      <button
                        onClick={() => {
                          setEditingId(sp.id)
                          setEditingName(sp.name)
                        }}
                        className="p-2 rounded-md text-[#888] hover:text-[#171717] hover:bg-[#fafafa] transition-colors"
                        title="Rename"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete salesman "${sp.name}"?`)) {
                          deleteSalesperson(sp.id)
                        }
                      }}
                      className="p-2 rounded-md text-[#c0392b] hover:bg-[#c0392b]/5 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {retailers.length === 0 ? (
                    <p className="text-[12px] text-[#888]">
                      No retailers in the system yet.
                    </p>
                  ) : (
                    retailers.map((retailer) => {
                      const assigned = sp.retailerIds.includes(retailer.id)
                      return (
                        <button
                          key={retailer.id}
                          onClick={() => toggleRetailer(sp.id, retailer.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                            assigned
                              ? 'bg-[#171717] text-white'
                              : 'bg-[#fafafa] text-[#666] hover:bg-[#f0f0f0]'
                          }`}
                        >
                          {assigned && <Plus className="w-3 h-3 rotate-45" />}
                          {retailer.name}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
