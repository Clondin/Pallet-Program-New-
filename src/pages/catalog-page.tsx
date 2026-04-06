import { useState, useEffect } from 'react'
import { Search, Plus, Upload } from 'lucide-react'
import { useCatalogStore } from '../stores/catalog-store'
import { BRAND_COLORS, mockProducts } from '../lib/mock-data'
import { ProductTable } from '../components/Catalog/product-table'
import type { Brand } from '../types'

const BRANDS: { key: Brand; label: string }[] = [
  { key: 'tuscanini', label: 'Tuscanini' },
  { key: 'kedem', label: 'Kedem' },
  { key: 'gefen', label: 'Gefen' },
  { key: 'liebers', label: "Lieber's" },
  { key: 'haddar', label: 'Haddar' },
  { key: 'osem', label: 'Osem' },
]

type Tab = 'all' | 'holiday' | 'untagged'

const tabLabels: Record<Tab, string> = {
  all: 'All Products',
  holiday: 'Holiday Tagged',
  untagged: 'Untagged',
}

export function CatalogPage() {
  const {
    products,
    searchQuery,
    brandFilter,
    setProducts,
    setSearchQuery,
    setBrandFilter,
    filteredProducts,
  } = useCatalogStore()

  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (products.length === 0) {
      setProducts(mockProducts)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = filteredProducts().filter((product) => {
    if (activeTab === 'holiday') return product.holidayTags.length > 0
    if (activeTab === 'untagged') return product.holidayTags.length === 0
    return true
  })
  const productCount = filtered.length

  return (
    <div className="px-10 py-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h2 className="text-[28px] font-semibold tracking-display text-[#171717]">
            Product Catalog
          </h2>
          <p className="text-[14px] text-[#666] mt-1">
            {productCount} products in workspace
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-[12px] font-medium text-[#555] shadow-border bg-white rounded-md hover:bg-[#fafafa] transition-colors">
            <Upload className="w-3.5 h-3.5" />
            Import CSV
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-[12px] font-medium text-white bg-[#171717] rounded-md hover:bg-[#333] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Product
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {/* Tab segmented control */}
          <div className="flex items-center shadow-ring rounded-md overflow-hidden">
            {(['all', 'holiday', 'untagged'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-[7px] text-[12px] font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-[#171717] text-white'
                    : 'bg-white text-[#666] hover:bg-[#fafafa]'
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999]" />
            <input
              type="text"
              placeholder="Search by name, SKU or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-[13px] w-72 shadow-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none placeholder:text-[#aaa]"
            />
          </div>
        </div>

        {/* Brand filter pills */}
        <div className="flex items-center gap-1.5">
          {BRANDS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setBrandFilter(brandFilter === key ? null : key)}
              className={`px-2.5 py-1 text-[10px] font-medium rounded transition-all ${
                brandFilter === key
                  ? 'text-white shadow-sm'
                  : 'text-white/80 opacity-50 hover:opacity-80'
              }`}
              style={{ backgroundColor: BRAND_COLORS[key] }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <ProductTable
        products={filtered}
        showAddForm={showAddForm}
        onCloseAddForm={() => setShowAddForm(false)}
      />
    </div>
  )
}
