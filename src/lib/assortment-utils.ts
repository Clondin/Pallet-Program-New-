import type { AssortmentEntry, DisplayProject, Product, Retailer } from '../types'

export interface AssortmentRow {
  productId: string
  productName: string
  sku: string
  brand: string
  unitsPerCase: number | null
  cases: number
  totalUnits: number | null
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
): { totalCases: number; totalUnits: number; totalSKUs: number } {
  const productMap = new Map(products.map((product) => [product.id, product]))
  let totalCases = 0
  let totalUnits = 0
  let totalSKUs = 0

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
  }

  return { totalCases, totalUnits, totalSKUs }
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

      return {
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        brand: item.brand,
        unitsPerCase,
        cases,
        totalUnits: unitsPerCase && cases > 0 ? unitsPerCase * cases : null,
      }
    })
    .sort(
      (left, right) =>
        left.brand.localeCompare(right.brand) ||
        left.productName.localeCompare(right.productName),
    )
}
