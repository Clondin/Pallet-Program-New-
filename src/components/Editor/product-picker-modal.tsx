import { useState, useEffect } from 'react'
import { X, Search, Check } from 'lucide-react'
import { useDisplayStore } from '../../stores/display-store'
import { useCatalogStore } from '../../stores/catalog-store'
import { Product, Brand } from '../../types'
import { BRAND_COLORS } from '../../lib/mock-data'

const brands: { key: Brand; label: string }[] = [
  { key: 'tuscanini', label: 'Tuscanini' },
  { key: 'kedem', label: 'Kedem' },
  { key: 'gefen', label: 'Gefen' },
  { key: 'liebers', label: "Lieber's" },
  { key: 'haddar', label: 'Haddar' },
  { key: 'osem', label: 'Osem' },
]

export function ProductPickerModal() {
  const isOpen = useDisplayStore(s => s.isPickerOpen)
  const closePicker = useDisplayStore(s => s.closePicker)
  const selectedSlotId = useDisplayStore(s => s.selectedSlotId)
  const placeProduct = useDisplayStore(s => s.placeProduct)
  const pickerSelectedProduct = useDisplayStore(s => s.pickerSelectedProduct)
  const setPickerProduct = useDisplayStore(s => s.setPickerProduct)

  const searchQuery = useCatalogStore(s => s.searchQuery)
  const setSearchQuery = useCatalogStore(s => s.setSearchQuery)
  const brandFilter = useCatalogStore(s => s.brandFilter)
  const setBrandFilter = useCatalogStore(s => s.setBrandFilter)
  const filteredProducts = useCatalogStore(s => s.filteredProducts)

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const resetFilters = () => {
    setSearchQuery('')
    setBrandFilter(null)
  }

  const handleClose = () => {
    closePicker()
    setSelectedProduct(null)
    setPickerProduct(null)
    resetFilters()
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
      if (e.key === 'Enter' && selectedProduct && selectedSlotId) {
        placeProduct(selectedProduct, selectedSlotId)
        setSelectedProduct(null)
        setPickerProduct(null)
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, closePicker, selectedProduct, selectedSlotId, placeProduct, setPickerProduct])

  useEffect(() => {
    if (isOpen) {
      setSelectedProduct(pickerSelectedProduct)
    }
  }, [isOpen, pickerSelectedProduct])

  if (!isOpen) return null

  const filtered = filteredProducts()

  const handlePlace = () => {
    if (selectedProduct && selectedSlotId) {
      placeProduct(selectedProduct, selectedSlotId)
      setSelectedProduct(null)
      setPickerProduct(null)
      resetFilters()
    }
  }

  const handleStartPlacement = () => {
    if (!selectedProduct) return
    setPickerProduct(selectedProduct)
    closePicker()
    setSelectedProduct(null)
    resetFilters()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[560px] mx-4 max-h-[80vh] flex flex-col shadow-elevated rounded-lg overflow-hidden">
        {/* Header */}
        <header className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold text-[#171717] tracking-tight-sm">Product Catalog</h2>
            <button onClick={handleClose} className="p-1 rounded-md text-[#ccc] hover:text-[#888] hover:bg-[#f5f5f5] transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, SKU, or brand..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#fafafa] text-[13px] shadow-border rounded-md placeholder:text-[#aaa] focus:ring-2 focus:ring-[#0a72ef]/20 focus:outline-none focus:shadow-none"
            />
          </div>

          {/* Brand filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setBrandFilter(null)}
              className={`text-[10px] font-medium px-3 py-1.5 rounded-md transition-colors ${
                !brandFilter ? 'bg-[#171717] text-white' : 'bg-[#f5f5f5] text-[#666] hover:bg-[#eee]'
              }`}
            >
              All
            </button>
            {brands.map(b => (
              <button
                key={b.key}
                onClick={() => setBrandFilter(brandFilter === b.key ? null : b.key)}
                className={`text-[10px] font-medium px-3 py-1.5 rounded-md transition-colors ${
                  brandFilter === b.key
                    ? 'text-white'
                    : 'bg-[#f5f5f5] text-[#666] hover:bg-[#eee]'
                }`}
                style={brandFilter === b.key ? { backgroundColor: BRAND_COLORS[b.key] } : undefined}
              >
                {b.label}
              </button>
            ))}
          </div>
        </header>

        {/* Product list */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-1.5">
          {filtered.map(product => {
            const isSelected = selectedProduct?.id === product.id
            return (
              <div
                key={product.id}
                onClick={() => {
                  const nextSelection = isSelected ? null : product
                  setSelectedProduct(nextSelection)
                  setPickerProduct(nextSelection)
                }}
                className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white shadow-card ring-2 ring-[#0a72ef]'
                    : 'hover:bg-[#fafafa]'
                }`}
              >
                <div className="w-9 h-9 rounded-md bg-[#f5f5f5] flex items-center justify-center relative overflow-hidden shrink-0">
                  <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: product.brandColor }} />
                  <span className="text-[8px] font-semibold text-[#999]">{product.sku.slice(0, 3)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: product.brandColor }} />
                    <span className="text-[10px] font-medium text-[#888] capitalize">{product.brand}</span>
                  </div>
                  <div className="text-[13px] font-medium text-[#171717] truncate">{product.name}</div>
                  <div className="text-[10px] text-[#bbb] font-mono">{product.sku}</div>
                </div>
                <div className="text-[10px] text-[#bbb] text-right shrink-0 tabular-nums">
                  <div>{product.width}" x {product.height}" x {product.depth}"</div>
                  <div>{product.weight} lbs</div>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#0a72ef] text-white flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-[13px] text-[#999]">No products found</div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 flex items-center justify-between gap-4" style={{ boxShadow: '0 -1px 0 0 rgba(0,0,0,0.06)' }}>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-[#999]">
              {selectedProduct ? 'Selected' : 'No selection'}
            </span>
            {selectedProduct && (
              <span className="text-[12px] font-medium text-[#171717]">{selectedProduct.name}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleClose}
              className="px-4 py-2 text-[12px] font-medium text-[#888] hover:text-[#555] transition-colors">
              Cancel
            </button>
            <button
              onClick={selectedSlotId ? handlePlace : handleStartPlacement}
              disabled={!selectedProduct}
              className={`px-6 py-2 text-[12px] font-medium rounded-md transition-all ${
                selectedProduct
                  ? 'bg-[#171717] text-white hover:bg-[#333]'
                  : 'bg-[#f5f5f5] text-[#ccc] cursor-not-allowed'
              }`}
            >
              {selectedSlotId ? 'Place Product' : 'Choose Slot'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
