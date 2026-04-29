import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useCatalogStore } from '../../stores/catalog-store'
import { useRetailerStore } from '../../stores/retailer-store'
import type { Retailer } from '../../types'

export function RequestItemModal({
  retailer,
  onClose,
}: {
  retailer: Retailer
  onClose: () => void
}) {
  const products = useCatalogStore((state) => state.products)
  const addAuthorizedItem = useRetailerStore((state) => state.addAuthorizedItem)
  const [search, setSearch] = useState('')

  const existingProductIds = useMemo(
    () => new Set(retailer.authorizedItems.map((item) => item.productId)),
    [retailer.authorizedItems],
  )

  const candidates = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products
      .filter((product) => !existingProductIds.has(product.id))
      .filter((product) => {
        if (!query) return true
        return (
          product.name.toLowerCase().includes(query) ||
          (product.kaycoItemNumber ?? '').toLowerCase().includes(query) ||
          (product.upc ?? '').toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query)
        )
      })
      .slice(0, 30)
  }, [products, existingProductIds, search])

  const handleRequest = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return
    addAuthorizedItem(retailer.id, {
      productId,
      productName: product.name,
      sku: product.sku,
      brand: product.brand,
      status: 'pending',
      authorizedDate: new Date().toISOString().slice(0, 10),
      avgMonthlyUnits: 0,
      marginPercent: 0,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-elevated w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="px-5 py-4 border-b border-[#f0f0f0] flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-[#171717]">Request item</h3>
            <p className="text-[12px] text-[#888] mt-0.5">
              Pick from the master catalog. The request will be pending until the manager approves
              for {retailer.name}.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#888] hover:text-[#171717] hover:bg-[#fafafa]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999]" />
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, Kayco #, UPC, brand…"
              className="w-full pl-9 pr-4 py-2 text-[13px] shadow-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a72ef]/30 focus:shadow-none placeholder:text-[#aaa]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {candidates.length === 0 ? (
            <p className="text-[12px] text-[#888] py-8 text-center">
              {search
                ? 'No matching items found.'
                : 'Start typing to search the master catalog.'}
            </p>
          ) : (
            <div className="space-y-2">
              {candidates.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleRequest(product.id)}
                  className="w-full text-left rounded-lg p-3 hover:bg-[#fafafa] transition-colors"
                >
                  <p className="text-[13px] font-medium text-[#171717]">{product.name}</p>
                  <p className="text-[11px] text-[#888] mt-1 font-mono">
                    {[
                      product.kaycoItemNumber && `Kayco #${product.kaycoItemNumber}`,
                      product.upc && `UPC ${product.upc}`,
                      product.brand,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
