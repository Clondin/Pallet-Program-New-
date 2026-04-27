import { create } from 'zustand'
import { AuthorizedItem, Retailer } from '../types'

interface RetailerState {
  retailers: Retailer[]
  setRetailers: (retailers: Retailer[]) => void
  addRetailer: (retailer: Retailer) => void
  updateRetailer: (id: string, updates: Partial<Retailer>) => void
  deleteRetailer: (id: string) => void
  addAuthorizedItem: (retailerId: string, item: AuthorizedItem) => void
  removeAuthorizedItem: (retailerId: string, productId: string) => void
  updateAuthorizedItemStatus: (
    retailerId: string,
    productId: string,
    status: AuthorizedItem['status'],
  ) => void
  updateAuthorizedItemCasePrice: (
    retailerId: string,
    productId: string,
    casePrice: number | null,
  ) => void
  getRetailer: (id: string) => Retailer | undefined
}

export const useRetailerStore = create<RetailerState>((set, get) => ({
  retailers: [],
  setRetailers: (retailers) => set({ retailers }),
  addRetailer: (retailer) => set(s => ({ retailers: [...s.retailers, retailer] })),
  updateRetailer: (id, updates) => set(s => ({
    retailers: s.retailers.map(r => r.id === id ? { ...r, ...updates } : r)
  })),
  deleteRetailer: (id) => set(s => ({
    retailers: s.retailers.filter(r => r.id !== id)
  })),
  addAuthorizedItem: (retailerId, item) =>
    set((state) => ({
      retailers: state.retailers.map((retailer) => {
        if (retailer.id !== retailerId) return retailer
        if (retailer.authorizedItems.some((existing) => existing.productId === item.productId)) {
          return retailer
        }

        return {
          ...retailer,
          authorizedItems: [...retailer.authorizedItems, item],
        }
      }),
    })),
  removeAuthorizedItem: (retailerId, productId) =>
    set((state) => ({
      retailers: state.retailers.map((retailer) =>
        retailer.id === retailerId
          ? {
              ...retailer,
              authorizedItems: retailer.authorizedItems.filter(
                (item) => item.productId !== productId,
              ),
            }
          : retailer,
      ),
    })),
  updateAuthorizedItemStatus: (retailerId, productId, status) =>
    set((state) => ({
      retailers: state.retailers.map((retailer) =>
        retailer.id === retailerId
          ? {
              ...retailer,
              authorizedItems: retailer.authorizedItems.map((item) =>
                item.productId === productId ? { ...item, status } : item,
              ),
            }
          : retailer,
      ),
    })),
  updateAuthorizedItemCasePrice: (retailerId, productId, casePrice) =>
    set((state) => ({
      retailers: state.retailers.map((retailer) =>
        retailer.id === retailerId
          ? {
              ...retailer,
              authorizedItems: retailer.authorizedItems.map((item) =>
                item.productId === productId
                  ? {
                      ...item,
                      casePrice: casePrice === null ? undefined : casePrice,
                    }
                  : item,
              ),
            }
          : retailer,
      ),
    })),
  getRetailer: (id) => get().retailers.find(r => r.id === id),
}))
