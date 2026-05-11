import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Retailer } from '../../types'
import { useRetailerStore } from '../../stores/retailer-store'

interface RetailerFormProps {
  retailer?: Retailer | null
  onSave: (data: Omit<Retailer, 'id'> & { id?: string }) => void
  onCancel: () => void
}

const DEFAULT_TIER_COUNT = 4
const DEFAULT_MAX_HEIGHT = 60
const DEFAULT_PALLET_DIMENSIONS = { width: 48, depth: 40, height: 6 }

export function RetailerForm({ retailer, onSave, onCancel }: RetailerFormProps) {
  const existingRetailers = useRetailerStore((state) => state.retailers)
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (retailer) {
      setName(retailer.name)
      setNotes(retailer.notes ?? '')
    }
  }, [retailer])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    const normalized = trimmed.toLowerCase()
    const conflict = existingRetailers.find(
      (r) => r.name.trim().toLowerCase() === normalized && r.id !== retailer?.id,
    )
    if (conflict) {
      setError(`A program named "${conflict.name}" already exists.`)
      return
    }
    setError(null)

    onSave({
      ...(retailer ? { id: retailer.id } : {}),
      name: name.trim(),
      defaultTierCount: retailer?.defaultTierCount ?? DEFAULT_TIER_COUNT,
      maxDisplayHeight: retailer?.maxDisplayHeight ?? DEFAULT_MAX_HEIGHT,
      palletDimensions: retailer?.palletDimensions ?? DEFAULT_PALLET_DIMENSIONS,
      notes: notes.trim() || undefined,
      status: retailer?.status ?? 'active',
      tier: retailer?.tier ?? 'standard',
      storeCount: retailer?.storeCount ?? 0,
      regions: retailer?.regions ?? [],
      headquartersCity: retailer?.headquartersCity ?? '',
      headquartersState: retailer?.headquartersState ?? '',
      accountManager: retailer?.accountManager ?? '',
      contractStart: retailer?.contractStart ?? new Date().toISOString().split('T')[0],
      contractEnd: retailer?.contractEnd ?? '',
      website: retailer?.website ?? '',
      contacts: retailer?.contacts ?? [],
      authorizedItems: retailer?.authorizedItems ?? [],
      compliance: retailer?.compliance ?? [],
      performance: retailer?.performance ?? {
        totalRevenueMTD: 0,
        totalRevenueYTD: 0,
        avgOrderValue: 0,
        fillRate: 0,
        onTimeDelivery: 0,
        returnRate: 0,
        displayComplianceScore: 0,
      },
      displayHistory: retailer?.displayHistory ?? [],
      tags: retailer?.tags ?? [],
    })
  }

  const inputClass = 'w-full px-3 py-2 text-[13px] shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white shadow-elevated rounded-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4" style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.06)' }}>
          <h3 className="text-[15px] font-semibold text-[#171717] tracking-tight-sm">
            {retailer ? 'Edit Program' : 'Add Program'}
          </h3>
          <button
            onClick={onCancel}
            className="p-1 rounded-md hover:bg-[#f5f5f5] text-[#ccc] hover:text-[#888] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-[#555] mb-1">Name</label>
            <input
              autoFocus
              type="text" value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError(null)
              }}
              placeholder="e.g. Walmart" className={inputClass} required
            />
            {error && (
              <p className="text-[11px] text-red-600 mt-1.5">{error}</p>
            )}
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#555] mb-1">Notes</label>
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder="Optional notes..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel}
              className="px-4 py-2 text-[12px] font-medium text-[#888] hover:text-[#555] rounded-md transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="px-4 py-2 text-[12px] font-medium text-white bg-[#171717] rounded-md hover:bg-[#333] transition-colors">
              {retailer ? 'Save' : 'Add Program'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
