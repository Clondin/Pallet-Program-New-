import { useMemo } from 'react'
import { Check, Inbox, X } from 'lucide-react'
import { useRetailerStore } from '../../stores/retailer-store'
import { useCatalogStore } from '../../stores/catalog-store'

export function PendingRequestsPanel() {
  const retailers = useRetailerStore((state) => state.retailers)
  const updateAuthorizedItemStatus = useRetailerStore(
    (state) => state.updateAuthorizedItemStatus,
  )
  const removeAuthorizedItem = useRetailerStore((state) => state.removeAuthorizedItem)
  const products = useCatalogStore((state) => state.products)

  const productById = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  )

  const requests = useMemo(() => {
    const out: {
      retailerId: string
      retailerName: string
      productId: string
      productName: string
      kaycoItemNumber?: string
      brand: string
    }[] = []
    for (const retailer of retailers) {
      for (const item of retailer.authorizedItems) {
        if (item.status !== 'pending') continue
        const product = productById.get(item.productId)
        out.push({
          retailerId: retailer.id,
          retailerName: retailer.name,
          productId: item.productId,
          productName: item.productName,
          kaycoItemNumber: product?.kaycoItemNumber,
          brand: item.brand,
        })
      }
    }
    return out
  }, [retailers, productById])

  if (requests.length === 0) {
    return (
      <div className="bg-white shadow-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Inbox className="w-4 h-4 text-[#666]" />
          <h3 className="text-[14px] font-semibold text-[#171717]">Pending item requests</h3>
        </div>
        <p className="text-[12px] text-[#888] mt-1">
          When salesmen request items off the master catalog, they'll show up here for approval.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-card rounded-xl">
      <div className="px-5 py-4 border-b border-[#f0f0f0] flex items-center gap-2">
        <Inbox className="w-4 h-4 text-[#666]" />
        <h3 className="text-[14px] font-semibold text-[#171717]">Pending item requests</h3>
        <span className="text-[11px] text-[#888]">({requests.length})</span>
      </div>
      <div className="divide-y divide-[#f0f0f0]">
        {requests.map((req) => (
          <div
            key={`${req.retailerId}-${req.productId}`}
            className="px-5 py-3 flex items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#171717] truncate">
                {req.productName}
              </p>
              <p className="text-[11px] text-[#888] mt-0.5">
                For <span className="font-medium text-[#171717]">{req.retailerName}</span>
                {req.kaycoItemNumber && ` · Kayco #${req.kaycoItemNumber}`}
                {req.brand && ` · ${req.brand}`}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() =>
                  updateAuthorizedItemStatus(req.retailerId, req.productId, 'authorized')
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[12px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Approve
              </button>
              <button
                onClick={() => removeAuthorizedItem(req.retailerId, req.productId)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[12px] font-medium text-[#c0392b] hover:bg-[#c0392b]/5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
