import { create } from 'zustand'
import { Product, Brand, Holiday } from '../types'

interface CatalogState {
  products: Product[]
  searchQuery: string
  brandFilter: Brand | null
  categoryFilter: string | null
  holidayFilter: string | null
  filteredProducts: () => Product[]
  setProducts: (products: Product[]) => void
  setSearchQuery: (query: string) => void
  setBrandFilter: (brand: Brand | null) => void
  setCategoryFilter: (category: string | null) => void
  setHolidayFilter: (holiday: string | null) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  getProduct: (id: string) => Product | undefined
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  products: [],
  searchQuery: '',
  brandFilter: null,
  categoryFilter: null,
  holidayFilter: null,

  filteredProducts: () => {
    const { products, searchQuery, brandFilter, categoryFilter, holidayFilter } = get()
    let filtered = products
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      )
    }
    if (brandFilter) filtered = filtered.filter(p => p.brand === brandFilter)
    if (categoryFilter) filtered = filtered.filter(p => p.category === categoryFilter)
    if (holidayFilter) filtered = filtered.filter(p => p.holidayTags.includes(holidayFilter as Holiday))
    return filtered
  },

  setProducts: (products) => set({ products }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setBrandFilter: (brandFilter) => set({ brandFilter }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  setHolidayFilter: (holidayFilter) => set({ holidayFilter }),
  addProduct: (product) => set(s => ({ products: [...s.products, product] })),
  updateProduct: (id, updates) => set(s => ({
    products: s.products.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  deleteProduct: (id) => set(s => ({
    products: s.products.filter(p => p.id !== id)
  })),
  getProduct: (id) => get().products.find((product) => product.id === id),
}))
