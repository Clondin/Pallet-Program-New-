import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { DisplayProject, Product, Retailer, Season } from './types'
import { AppLayout } from './components/layout/app-layout'
import { EditorPage } from './pages/editor-page'
import { CatalogPage } from './pages/catalog-page'
import { ProductDetailPage } from './pages/product-detail-page'
import { RetailersPage } from './pages/retailers-page'
import { RetailerDetailPage } from './pages/retailer-detail-page'
import { PalletDetailPage } from './pages/pallet-detail-page'
import { ProgramRollupPage } from './pages/program-rollup-page'
import { SeasonsPage } from './pages/seasons-page'
import { BuildersPage } from './pages/builders-page'
import { HomePage } from './pages/home-page'
import { ScenePage } from './pages/scene-page'
import { useDisplayStore } from './stores/display-store'
import { useCatalogStore } from './stores/catalog-store'
import { useRetailerStore } from './stores/retailer-store'
import { useSeasonStore } from './stores/season-store'
import { useAppSettingsStore } from './stores/app-settings-store'
import { mockRetailers } from './lib/mock-data'
import { loadInventoryInfo } from './lib/inventory-info-loader'
import { mergeInventoryInfoIntoProducts } from './lib/inventory-info-import'

const PROJECT_STORAGE_KEY = 'palletforge-project'
const PALLETS_STORAGE_KEY = 'palletforge-pallets'
const ACTIVE_PALLET_STORAGE_KEY = 'palletforge-active-pallet-id'
const CATALOG_STORAGE_KEY = 'palletforge-products'
const RETAILER_STORAGE_KEY = 'palletforge-retailers'
const SEASONS_STORAGE_KEY = 'palletforge-seasons'

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
    const status = retailer.status === 'pending' ? 'active' : retailer.status
    const fallbackRetailer = fallbackMap.get(retailer.id)
    if (!fallbackRetailer) return { ...retailer, status }

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
      status,
      authorizedItems,
    }
  })

  const persistedIds = new Set(persistedRetailers.map((retailer) => retailer.id))
  fallbackRetailers.forEach((retailer) => {
    if (!persistedIds.has(retailer.id)) {
      mergedRetailers.push({
        ...retailer,
        status: retailer.status === 'pending' ? 'active' : retailer.status,
      })
    }
  })

  return mergedRetailers
}

export default function App() {
  useEffect(() => {
    const catalogProducts = mergeCatalogProducts(
      loadPersistedState(CATALOG_STORAGE_KEY),
      []
    )
    const retailers = mergeRetailers(
      loadPersistedState(RETAILER_STORAGE_KEY),
      mockRetailers
    )

    useCatalogStore
      .getState()
      .setProducts(catalogProducts)

    loadInventoryInfo().then((inventoryInfo) => {
      if (inventoryInfo.length === 0) return
      const catalogState = useCatalogStore.getState()
      const result = mergeInventoryInfoIntoProducts(
        catalogState.products,
        inventoryInfo,
      )
      if (result.products.length > 0) {
        catalogState.setProducts(result.products)
      }
    })

    useRetailerStore
      .getState()
      .setRetailers(retailers)

    const persistedSeasons = loadPersistedState<Season[]>(SEASONS_STORAGE_KEY) ?? []
    useSeasonStore.getState().setSeasons(
      persistedSeasons.map((season) => ({
        ...season,
        archived: season.archived ?? false,
      })),
    )

    const persistedProjects = loadPersistedState<DisplayProject[]>(PALLETS_STORAGE_KEY)
    const legacyProject = loadPersistedState<DisplayProject>(PROJECT_STORAGE_KEY)
    const MOCK_PALLET_IDS = new Set(['proj-1', 'proj-2', 'proj-3'])
    const rawProjects = persistedProjects ?? (legacyProject ? [legacyProject] : [])
    const projects = rawProjects
      .filter((project) => !MOCK_PALLET_IDS.has(project.id))
      .map((project) => ({
        ...project,
        assortment: project.assortment ?? [],
        seasonId: project.seasonId ?? null,
        buildLocation: project.buildLocation ?? null,
        laborCost: project.laborCost ?? 75,
        status: project.status ?? 'draft',
      }))
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

    const unsubscribeSeasons = useSeasonStore.subscribe((state) => {
      localStorage.setItem(SEASONS_STORAGE_KEY, JSON.stringify(state.seasons))
    })

    return () => {
      unsubscribeCatalog()
      unsubscribeRetailers()
      unsubscribeSeasons()
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
          <Route path="/seasons" element={<SeasonsPage />} />
          <Route path="/builders" element={<BuildersPage />} />
          <Route path="/scene" element={<ScenePage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
