import type { AssortmentEntry, DisplayProject, Product, Retailer } from '../types'

export interface AssortmentRow {
  productId: string
  productName: string
  sku: string
  upc: string
  kaycoItemNumber: string
  buyer: string
  brand: string
  unitsPerCase: number | null
  casePrice: number | null
  cases: number
  totalUnits: number | null
  totalRevenue: number | null
  status: 'authorized' | 'pending' | 'discontinued'
}

export function getUnitsPerCase(product: Product): number | null {
  if (typeof product.unitsPerCase === 'number' && product.unitsPerCase > 0) {
    return product.unitsPerCase
  }

  if (product.caseConfig) {
    const { cols, rows, layers } = product.caseConfig.layout
    return cols * rows * layers
  }

  return null
}

export function computeAssortmentTotals(
  assortment: AssortmentEntry[],
  products: Product[],
  retailer?: Retailer,
): {
  totalCases: number
  totalUnits: number
  totalSKUs: number
  totalRevenue: number
} {
  const productMap = new Map(products.map((product) => [product.id, product]))
  const priceMap = retailer
    ? new Map(
        retailer.authorizedItems
          .filter((item) => typeof item.casePrice === 'number')
          .map((item) => [item.productId, item.casePrice as number]),
      )
    : new Map<string, number>()
  let totalCases = 0
  let totalUnits = 0
  let totalSKUs = 0
  let totalRevenue = 0

  for (const entry of assortment) {
    if (entry.cases <= 0) continue

    totalCases += entry.cases
    totalSKUs += 1

    const product = productMap.get(entry.productId)
    if (!product) continue

    const unitsPerCase = getUnitsPerCase(product)
    if (unitsPerCase) {
      totalUnits += entry.cases * unitsPerCase
    }

    const price = priceMap.get(entry.productId)
    if (typeof price === 'number') {
      totalRevenue += entry.cases * price
    }
  }

  return { totalCases, totalUnits, totalSKUs, totalRevenue }
}

export function getPalletQuantity(project: DisplayProject | undefined | null): number {
  if (!project) return 1
  const raw = project.quantity
  if (typeof raw !== 'number' || !Number.isFinite(raw) || raw < 1) return 1
  return Math.floor(raw)
}

export function buildAssortmentRows(
  retailer: Retailer,
  project: DisplayProject,
  products: Product[],
): AssortmentRow[] {
  const productMap = new Map(products.map((product) => [product.id, product]))
  const assortmentMap = new Map(
    project.assortment.map((entry) => [entry.productId, entry.cases]),
  )

  return retailer.authorizedItems
    .filter((item) => item.status === 'authorized' || item.status === 'pending')
    .map((item) => {
      const product = productMap.get(item.productId)
      const unitsPerCase = product ? getUnitsPerCase(product) : null
      const cases = assortmentMap.get(item.productId) ?? 0

      const casePrice = typeof item.casePrice === 'number' ? item.casePrice : null
      const brandLabel =
        product?.brandCode ??
        (item.brand && item.brand !== 'other'
          ? item.brand
          : product?.brand && product.brand !== 'other'
            ? product.brand
            : '')
      return {
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        upc: product?.upc ?? '',
        kaycoItemNumber: product?.kaycoItemNumber ?? '',
        buyer: product?.buyer ?? '',
        brand: brandLabel || item.brand,
        unitsPerCase,
        casePrice,
        cases,
        totalUnits: unitsPerCase && cases > 0 ? unitsPerCase * cases : null,
        totalRevenue: casePrice !== null && cases > 0 ? casePrice * cases : null,
        status: (item.status === 'authorized' ? 'authorized' : 'pending') as 'authorized' | 'pending',
      }
    })
    .sort((left, right) => {
      // Authorized rows first, then pending.
      if (left.status !== right.status) {
        return left.status === 'authorized' ? -1 : 1
      }
      return (
        left.brand.localeCompare(right.brand) ||
        left.productName.localeCompare(right.productName)
      )
    })
}
