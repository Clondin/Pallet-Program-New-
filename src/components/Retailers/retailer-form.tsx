import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Retailer } from '../../types'

interface RetailerFormProps {
  retailer?: Retailer | null
  onSave: (data: Omit<Retailer, 'id'> & { id?: string }) => void
  onCancel: () => void
}

export function RetailerForm({ retailer, onSave, onCancel }: RetailerFormProps) {
  const [name, setName] = useState('')
  const [defaultTierCount, setDefaultTierCount] = useState(4)
  const [maxDisplayHeight, setMaxDisplayHeight] = useState(60)
  const [palletWidth, setPalletWidth] = useState(48)
  const [palletDepth, setPalletDepth] = useState(40)
  const [palletHeight, setPalletHeight] = useState(6)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (retailer) {
      setName(retailer.name)
      setDefaultTierCount(retailer.defaultTierCount)
      setMaxDisplayHeight(retailer.maxDisplayHeight)
      setPalletWidth(retailer.palletDimensions.width)
      setPalletDepth(retailer.palletDimensions.depth)
      setPalletHeight(retailer.palletDimensions.height)
      setNotes(retailer.notes ?? '')
    }
  }, [retailer])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    onSave({
      ...(retailer ? { id: retailer.id } : {}),
      name: name.trim(),
      defaultTierCount,
      maxDisplayHeight,
      palletDimensions: { width: palletWidth, depth: palletDepth, height: palletHeight },
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
      <div className="bg-white shadow-elevated rounded-lg w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4" style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.06)' }}>
          <h3 className="text-[15px] font-semibold text-[#171717] tracking-tight-sm">
            {retailer ? 'Edit Retailer' : 'Add Retailer'}
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
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Walmart" className={inputClass} required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#555] mb-1">Default Tiers</label>
              <input
                type="number" min={2} max={6} value={defaultTierCount}
                onChange={(e) => setDefaultTierCount(Number(e.target.value))}
                className={`${inputClass} tabular-nums`}
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#555] mb-1">Max Height (in)</label>
              <input
                type="number" value={maxDisplayHeight}
                onChange={(e) => setMaxDisplayHeight(Number(e.target.value))}
                className={`${inputClass} tabular-nums`}
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#555] mb-2">Pallet Dimensions (in)</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Width', value: palletWidth, set: setPalletWidth },
                { label: 'Depth', value: palletDepth, set: setPalletDepth },
                { label: 'Height', value: palletHeight, set: setPalletHeight },
              ].map((d) => (
                <div key={d.label}>
                  <label className="block text-[10px] font-medium text-[#999] mb-1">{d.label}</label>
                  <input
                    type="number" value={d.value}
                    onChange={(e) => d.set(Number(e.target.value))}
                    className={`${inputClass} tabular-nums`}
                  />
                </div>
              ))}
            </div>
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
              {retailer ? 'Save Changes' : 'Add Retailer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
