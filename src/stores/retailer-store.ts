import { create } from 'zustand'
import { Retailer } from '../types'

interface RetailerState {
  retailers: Retailer[]
  setRetailers: (retailers: Retailer[]) => void
  addRetailer: (retailer: Retailer) => void
  updateRetailer: (id: string, updates: Partial<Retailer>) => void
  deleteRetailer: (id: string) => void
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
  getRetailer: (id) => get().retailers.find(r => r.id === id),
}))
