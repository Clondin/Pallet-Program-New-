import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { DisplayProject } from './types'
import { AppLayout } from './components/layout/app-layout'
import { EditorPage } from './pages/editor-page'
import { CatalogPage } from './pages/catalog-page'
import { ProductDetailPage } from './pages/product-detail-page'
import { RetailersPage } from './pages/retailers-page'
import { RetailerDetailPage } from './pages/retailer-detail-page'
import { BrandingPage } from './pages/branding-page'
import { SettingsPage } from './pages/settings-page'
import { useDisplayStore } from './stores/display-store'
import { useCatalogStore } from './stores/catalog-store'
import { useRetailerStore } from './stores/retailer-store'
import { useAppSettingsStore } from './stores/app-settings-store'
import { mockProducts, mockRetailers } from './lib/mock-data'

const PROJECT_STORAGE_KEY = 'palletforge-project'
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

export default function App() {
  useEffect(() => {
    useCatalogStore
      .getState()
      .setProducts(loadPersistedState(CATALOG_STORAGE_KEY) ?? mockProducts)
    useRetailerStore
      .getState()
      .setRetailers(loadPersistedState(RETAILER_STORAGE_KEY) ?? mockRetailers)
    const persistedProject = loadPersistedState<DisplayProject>(PROJECT_STORAGE_KEY)
    if (persistedProject) {
      useDisplayStore.getState().setCurrentProject(persistedProject)
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
      if (!state.currentProject) return
      if (!useAppSettingsStore.getState().settings.autoSaveProject) return
      localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(state.currentProject))
    })

    return () => unsubscribeProject()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/:id" element={<ProductDetailPage />} />
          <Route path="/retailers" element={<RetailersPage />} />
          <Route path="/retailers/:id" element={<RetailerDetailPage />} />
          <Route path="/branding" element={<BrandingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<HomeRedirect />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function HomeRedirect() {
  return <Navigate to="/editor" replace />
}
