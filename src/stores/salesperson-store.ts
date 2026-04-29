import { create } from 'zustand'
import type { Salesperson } from '../types'

interface SalespersonState {
  salespeople: Salesperson[]
  setSalespeople: (salespeople: Salesperson[]) => void
  createSalesperson: (name: string) => Salesperson
  renameSalesperson: (id: string, name: string) => void
  deleteSalesperson: (id: string) => void
  setRetailers: (id: string, retailerIds: string[]) => void
  toggleRetailer: (id: string, retailerId: string) => void
}

export const useSalespersonStore = create<SalespersonState>((set) => ({
  salespeople: [],

  setSalespeople: (salespeople) => set({ salespeople }),

  createSalesperson: (name) => {
    const trimmed = name.trim()
    const salesperson: Salesperson = {
      id: crypto.randomUUID(),
      name: trimmed.length === 0 ? 'Untitled' : trimmed,
      retailerIds: [],
      createdAt: Date.now(),
    }
    set((state) => ({ salespeople: [...state.salespeople, salesperson] }))
    return salesperson
  },

  renameSalesperson: (id, name) => {
    const trimmed = name.trim()
    if (trimmed.length === 0) return
    set((state) => ({
      salespeople: state.salespeople.map((sp) =>
        sp.id === id ? { ...sp, name: trimmed } : sp,
      ),
    }))
  },

  deleteSalesperson: (id) =>
    set((state) => ({
      salespeople: state.salespeople.filter((sp) => sp.id !== id),
    })),

  setRetailers: (id, retailerIds) =>
    set((state) => ({
      salespeople: state.salespeople.map((sp) =>
        sp.id === id ? { ...sp, retailerIds } : sp,
      ),
    })),

  toggleRetailer: (id, retailerId) =>
    set((state) => ({
      salespeople: state.salespeople.map((sp) => {
        if (sp.id !== id) return sp
        const has = sp.retailerIds.includes(retailerId)
        return {
          ...sp,
          retailerIds: has
            ? sp.retailerIds.filter((r) => r !== retailerId)
            : [...sp.retailerIds, retailerId],
        }
      }),
    })),
}))
