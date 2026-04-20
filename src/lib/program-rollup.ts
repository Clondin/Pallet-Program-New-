import type { DisplayProject, Product } from '../types'
import { getUnitsPerCase } from './assortment-utils'

export interface RollupRow {
  productId: string
  productName: string
  sku: string
  brand: string
  unitsPerCase: number | null
  palletCases: Map<string, number>
  totalCases: number
  totalUnits: number | null
}

export function buildRollupData(
  pallets: DisplayProject[],
  products: Product[],
): RollupRow[] {
  const productMap = new Map(products.map((product) => [product.id, product]))
  const rows = new Map<string, RollupRow>()

  for (const pallet of pallets) {
    for (const entry of pallet.assortment) {
      if (entry.cases <= 0) continue

      let row = rows.get(entry.productId)
      if (!row) {
        const product = productMap.get(entry.productId)
        row = {
          productId: entry.productId,
          productName: product?.name ?? entry.productId,
          sku: product?.sku ?? '',
          brand: product?.brand ?? '',
          unitsPerCase: product ? getUnitsPerCase(product) : null,
          palletCases: new Map(),
          totalCases: 0,
          totalUnits: null,
        }
        rows.set(entry.productId, row)
      }

      row.palletCases.set(pallet.id, entry.cases)
      row.totalCases += entry.cases

      if (row.unitsPerCase) {
        row.totalUnits = (row.totalUnits ?? 0) + entry.cases * row.unitsPerCase
      }
    }
  }

  return Array.from(rows.values()).sort(
    (left, right) =>
      left.brand.localeCompare(right.brand) ||
      left.productName.localeCompare(right.productName),
  )
}
