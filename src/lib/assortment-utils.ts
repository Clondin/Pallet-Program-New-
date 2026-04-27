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
    .filter((item) => item.status === 'authorized')
    .map((item) => {
      const product = productMap.get(item.productId)
      const unitsPerCase = product ? getUnitsPerCase(product) : null
      const cases = assortmentMap.get(item.productId) ?? 0

      const casePrice = typeof item.casePrice === 'number' ? item.casePrice : null
      return {
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        upc: product?.upc ?? '',
        kaycoItemNumber: product?.kaycoItemNumber ?? '',
        buyer: product?.buyer ?? '',
        brand: item.brand,
        unitsPerCase,
        casePrice,
        cases,
        totalUnits: unitsPerCase && cases > 0 ? unitsPerCase * cases : null,
        totalRevenue: casePrice !== null && cases > 0 ? casePrice * cases : null,
      }
    })
    .sort(
      (left, right) =>
        left.brand.localeCompare(right.brand) ||
        left.productName.localeCompare(right.productName),
    )
}
