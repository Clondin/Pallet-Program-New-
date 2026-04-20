import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { DisplayProject, Product, Retailer } from './types'
import { AppLayout } from './components/layout/app-layout'
import { EditorPage } from './pages/editor-page'
import { CatalogPage } from './pages/catalog-page'
import { ProductDetailPage } from './pages/product-detail-page'
import { RetailersPage } from './pages/retailers-page'
import { RetailerDetailPage } from './pages/retailer-detail-page'
import { PalletDetailPage } from './pages/pallet-detail-page'
import { ProgramRollupPage } from './pages/program-rollup-page'
import { SettingsPage } from './pages/settings-page'
import { ScenePage } from './pages/scene-page'
import { useDisplayStore } from './stores/display-store'
import { useCatalogStore } from './stores/catalog-store'
import { useRetailerStore } from './stores/retailer-store'
import { useAppSettingsStore } from './stores/app-settings-store'
import { mockProducts, mockRetailers, mockProjects } from './lib/mock-data'

const PROJECT_STORAGE_KEY = 'palletforge-project'
const PALLETS_STORAGE_KEY = 'palletforge-pallets'
const ACTIVE_PALLET_STORAGE_KEY = 'palletforge-active-pallet-id'
const CATALOG_STORAGE_KEY = 'palletforge-products'
const RETAILER_STORAGE_KEY = 'palletforge-retailers'

function loadPersistedState<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

function mergeCatalogProducts(
  persistedProducts: Product[] | null,
  fallbackProducts: Product[]
) {
  if (!persistedProducts) return fallbackProducts

  const fallbackMap = new Map(
    fallbackProducts.map((product) => [product.id, product])
  )

  const merged = persistedProducts.map((product) => {
    const fallbackProduct = fallbackMap.get(product.id)
    if (!fallbackProduct) return product

    return {
      ...fallbackProduct,
      ...product,
    }
  })

  const persistedIds = new Set(persistedProducts.map((product) => product.id))

  fallbackProducts.forEach((product) => {
    if (!persistedIds.has(product.id)) {
      merged.push(product)
    }
  })

  return merged
}

function mergeRetailers(
  persistedRetailers: Retailer[] | null,
  fallbackRetailers: Retailer[]
) {
  if (!persistedRetailers) return fallbackRetailers

  const fallbackMap = new Map(
    fallbackRetailers.map((retailer) => [retailer.id, retailer])
  )

  const mergedRetailers = persistedRetailers.map((retailer) => {
    const fallbackRetailer = fallbackMap.get(retailer.id)
    if (!fallbackRetailer) return retailer

    const authorizedItems = [...retailer.authorizedItems]
    const authorizedIds = new Set(
      retailer.authorizedItems.map((item) => item.productId)
    )

    fallbackRetailer.authorizedItems.forEach((item) => {
      if (!authorizedIds.has(item.productId)) {
        authorizedItems.push(item)
      }
    })

    return {
      ...retailer,
      authorizedItems,
    }
  })

  const persistedIds = new Set(persistedRetailers.map((retailer) => retailer.id))
  fallbackRetailers.forEach((retailer) => {
    if (!persistedIds.has(retailer.id)) {
      mergedRetailers.push(retailer)
    }
  })

  return mergedRetailers
}

export default function App() {
  useEffect(() => {
    const catalogProducts = mergeCatalogProducts(
      loadPersistedState(CATALOG_STORAGE_KEY),
      mockProducts
    )
    const retailers = mergeRetailers(
      loadPersistedState(RETAILER_STORAGE_KEY),
      mockRetailers
    )

    useCatalogStore
      .getState()
      .setProducts(catalogProducts)
    useRetailerStore
      .getState()
      .setRetailers(retailers)
    const persistedProjects = loadPersistedState<DisplayProject[]>(PALLETS_STORAGE_KEY)
    const legacyProject = loadPersistedState<DisplayProject>(PROJECT_STORAGE_KEY)
    const projects = (persistedProjects ?? (legacyProject ? [legacyProject] : mockProjects)).map(
      (project) => ({
        ...project,
        assortment: project.assortment ?? [],
      }),
    )
    const activePalletId = localStorage.getItem(ACTIVE_PALLET_STORAGE_KEY)
    const activeProject =
      projects.find((project) => project.id === activePalletId) ??
      (legacyProject ? projects.find((project) => project.id === legacyProject.id) : undefined) ??
      projects[0]

    useDisplayStore.getState().setProjects(projects)
    if (activeProject) {
      useDisplayStore.getState().setCurrentProject(activeProject)
    }

    const unsubscribeCatalog = useCatalogStore.subscribe((state) => {
      localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(state.products))
    })

    const unsubscribeRetailers = useRetailerStore.subscribe((state) => {
      localStorage.setItem(RETAILER_STORAGE_KEY, JSON.stringify(state.retailers))
    })

    return () => {
      unsubscribeCatalog()
      unsubscribeRetailers()
    }
  }, [])

  useEffect(() => {
    const unsubscribeProject = useDisplayStore.subscribe((state) => {
      if (!useAppSettingsStore.getState().settings.autoSaveProject) return

      localStorage.setItem(PALLETS_STORAGE_KEY, JSON.stringify(state.projects))
      if (state.currentProject) {
        localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(state.currentProject))
        localStorage.setItem(ACTIVE_PALLET_STORAGE_KEY, state.currentProject.id)
        return
      }

      localStorage.removeItem(PROJECT_STORAGE_KEY)
      localStorage.removeItem(ACTIVE_PALLET_STORAGE_KEY)
    })

    return () => unsubscribeProject()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/:id" element={<ProductDetailPage />} />
          <Route path="/retailers" element={<RetailersPage />} />
          <Route path="/retailers/:id" element={<RetailerDetailPage />} />
          <Route
            path="/retailers/:retailerId/pallets/:palletId"
            element={<PalletDetailPage />}
          />
          <Route
            path="/retailers/:retailerId/pallets/:palletId/editor"
            element={<EditorPage />}
          />
          <Route
            path="/retailers/:retailerId/program/:season"
            element={<ProgramRollupPage />}
          />
          <Route path="/scene" element={<ScenePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<HomeRedirect />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function HomeRedirect() {
  return <Navigate to="/retailers" replace />
}
