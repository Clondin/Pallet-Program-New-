import { useMemo, useState } from 'react'
import { Search, Plus, Upload, X } from 'lucide-react'
import { useCatalogStore } from '../stores/catalog-store'
import { ProductTable } from '../components/Catalog/product-table'

function getBrandLabel(product: { brandCode?: string; brand: string }) {
  return product.brandCode ?? product.brand
}

export function CatalogPage() {
  const {
    products,
    searchQuery,
    setSearchQuery,
    filteredProducts,
  } = useCatalogStore()

  const [showAddForm, setShowAddForm] = useState(false)
  const [brandFilter, setBrandFilter] = useState<string>('')

  const brandOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const product of products) {
      const label = getBrandLabel(product)
      counts.set(label, (counts.get(label) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([label, count]) => ({ label, count }))
  }, [products])

  const filtered = filteredProducts().filter((product) => {
    if (brandFilter && getBrandLabel(product) !== brandFilter) return false
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
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
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

          {/* Brand filter */}
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="px-3 py-[7px] text-[12px] font-medium text-[#555] shadow-border rounded-md bg-white focus:outline-none cursor-pointer"
          >
            <option value="">All brands</option>
            {brandOptions.map(({ label, count }) => (
              <option key={label} value={label}>
                {label} ({count})
              </option>
            ))}
          </select>

          {(searchQuery || brandFilter) && (
            <button
              onClick={() => {
                setSearchQuery('')
                setBrandFilter('')
              }}
              className="inline-flex items-center gap-1.5 px-3 py-[7px] text-[12px] font-medium text-[#666] hover:text-[#171717] hover:bg-[#fafafa] rounded-md transition-colors"
            >
              <X className="w-3 h-3" />
              Clear filters
            </button>
          )}
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
