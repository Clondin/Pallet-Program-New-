import type { InventoryInfoItem } from './inventory-info-import'

let inventoryInfoPromise: Promise<InventoryInfoItem[]> | null = null

export function loadInventoryInfo() {
  inventoryInfoPromise ??= fetch('/data/inventory-info.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Inventory info data could not be loaded')
      }
      return response.json() as Promise<InventoryInfoItem[]>
    })
    .catch(() => [])

  return inventoryInfoPromise
}
