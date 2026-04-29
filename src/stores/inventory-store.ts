import { create } from 'zustand'
import type { InventoryLocation, InventorySnapshot } from '../types'

interface InventoryState {
  snapshots: Record<InventoryLocation, InventorySnapshot | null>
  setSnapshot: (snapshot: InventorySnapshot) => void
  clearSnapshot: (location: InventoryLocation) => void
  hydrate: (data: Record<InventoryLocation, InventorySnapshot | null>) => void
}

export const useInventoryStore = create<InventoryState>((set) => ({
  snapshots: { hook: null, goshen: null },

  setSnapshot: (snapshot) =>
    set((state) => ({
      snapshots: { ...state.snapshots, [snapshot.location]: snapshot },
    })),

  clearSnapshot: (location) =>
    set((state) => ({
      snapshots: { ...state.snapshots, [location]: null },
    })),

  hydrate: (data) => set({ snapshots: data }),
}))
