import { useState } from 'react'
import { Save, X } from 'lucide-react'
import type { Brand, Holiday } from '../../types'
import { BRAND_COLORS } from '../../lib/mock-data'
import { useCatalogStore } from '../../stores/catalog-store'

const BRANDS: Brand[] = ['tuscanini', 'kedem', 'gefen', 'liebers', 'haddar', 'osem']
const HOLIDAYS: Holiday[] = ['rosh-hashanah', 'pesach', 'sukkos', 'none']
const HOLIDAY_LABELS: Record<string, string> = {
  'rosh-hashanah': 'RH',
  pesach: 'PESACH',
  sukkos: 'SUKKOS',
  none: 'NONE',
}
const dimensionFields = ['width', 'height', 'depth', 'weight'] as const

interface AddProductFormProps {
  onClose: () => void
}

export function AddProductForm({ onClose }: AddProductFormProps) {
  const { addProduct } = useCatalogStore()

  const [form, setForm] = useState({
    name: '',
    sku: '',
    brand: 'tuscanini' as Brand,
    category: '',
    width: 0,
    height: 0,
    depth: 0,
    weight: 0,
    holiday: 'none' as string,
  })

  const handleSubmit = () => {
    if (!form.name || !form.sku) return
    const tags: Holiday[] = form.holiday === 'none' ? [] : [form.holiday as Holiday]
    addProduct({
      id: `prod-${Date.now()}`,
      name: form.name,
      sku: form.sku,
      brand: form.brand,
      brandColor: BRAND_COLORS[form.brand],
      category: form.category,
      width: form.width,
      height: form.height,
      depth: form.depth,
      weight: form.weight,
      holidayTags: tags,
    })
    onClose()
  }

  return (
    <tr className="bg-[#0a72ef]/[0.02]" style={{ boxShadow: '0 1px 0 0 rgba(10,114,239,0.1)' }}>
      <td colSpan={7} className="px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-semibold text-[#171717]">New Product</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-[#f5f5f5] text-[#999]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4 max-w-4xl">
          <div className="col-span-2">
            <label className="text-[10px] font-medium uppercase tracking-wider text-[#999] mb-1 block">Product Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Extra Virgin Olive Oil 750ml"
              className="w-full px-3 py-2 text-[13px] shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none placeholder:text-[#ccc]" />
          </div>
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-[#999] mb-1 block">SKU</label>
            <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="e.g. TUS-EVOO-750"
              className="w-full px-3 py-2 text-[13px] font-mono shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none placeholder:text-[#ccc]" />
          </div>
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-[#999] mb-1 block">Brand</label>
            <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value as Brand })}
              className="w-full px-3 py-2 text-[13px] shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none capitalize">
              {BRANDS.map((b) => <option key={b} value={b} className="capitalize">{b}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-[#999] mb-1 block">Category</label>
            <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Oils"
              className="w-full px-3 py-2 text-[13px] shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none placeholder:text-[#ccc]" />
          </div>
          {dimensionFields.map((field) => (
            <div key={field}>
              <label className="text-[10px] font-medium uppercase tracking-wider text-[#999] mb-1 block">
                {field === 'weight' ? 'Weight (lb)' : `${field.charAt(0).toUpperCase() + field.slice(1)} (in)`}
              </label>
              <input type="number" step="0.1"
                value={form[field] || ''}
                onChange={(e) => setForm({ ...form, [field]: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-[13px] shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none tabular-nums" />
            </div>
          ))}
          <div className="col-span-4">
            <label className="text-[10px] font-medium uppercase tracking-wider text-[#999] mb-2 block">Holiday</label>
            <div className="flex gap-3">
              {HOLIDAYS.map((h) => (
                <label key={h} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="new-product-holiday" value={h} checked={form.holiday === h}
                    onChange={() => setForm({ ...form, holiday: h })} className="accent-[#171717]" />
                  <span className="text-[12px] text-[#555] capitalize">{HOLIDAY_LABELS[h]}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="col-span-4 flex gap-2 pt-2">
            <div className="w-full text-[11px] text-[#777] mb-1">
              Adding a product creates the single SKU plus auto-generated 6-pack, 12-pack, and 24-pack case variants.
            </div>
          </div>
          <div className="col-span-4 flex gap-2">
            <button onClick={handleSubmit}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#171717] text-white text-[12px] font-medium rounded-md hover:bg-[#333] transition-colors">
              <Save className="w-3 h-3" /> Add Product
            </button>
            <button onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 shadow-border bg-white text-[#555] text-[12px] font-medium rounded-md hover:bg-[#fafafa] transition-colors">
              <X className="w-3 h-3" /> Cancel
            </button>
          </div>
        </div>
      </td>
    </tr>
  )
}
