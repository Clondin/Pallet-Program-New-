import { create } from 'zustand'
import {
  AssortmentEntry,
  DisplayProject,
  PlacedProduct,
  GhostProduct,
  Product,
  FullValidationResult,
  CameraPreset,
  ViewMode,
  DisplayBranding,
  TrayFace,
  PalletType,
  PalletWizardConfig,
  Retailer,
} from '../types'
import { getAppSettingsSnapshot } from './app-settings-store'
import { nextOrientation } from '../lib/orientation-presets'
import { useRetailerStore } from './retailer-store'
import { useCatalogStore } from './catalog-store'
import { getEffectiveColSpan } from '../lib/colSpanCalculator'
import { resolveProductDimensions } from '../lib/dimensionEngine'
import {
  buildTierConfigs,
  createDefaultWallConfigs,
  derivePlacementFromSlotId,
} from '../lib/shelfCoordinates'
import { validatePlacement } from '../lib/spatialValidator'

interface DisplayState {
  projects: DisplayProject[]
  currentProject: DisplayProject | null
  selectedSlotId: string | null
  selectedProductId: string | null
  ghostProduct: GhostProduct | null
  viewMode: ViewMode
  activeFace: TrayFace
  cameraPreset: CameraPreset
  isPickerOpen: boolean
  pickerSelectedProduct: Product | null
  history: DisplayProject[]
  historyIndex: number
  lastUsedConfig: PalletWizardConfig | null

  setProjects: (projects: DisplayProject[]) => void
  createProject: (name: string, config: PalletWizardConfig, tierCount?: number) => DisplayProject
  getActiveRetailer: () => Retailer | undefined
  getProject: (id: string) => DisplayProject | undefined
  getProjectsForRetailer: (retailerId: string) => DisplayProject[]
  selectProject: (id: string) => void
  setCurrentProject: (project: DisplayProject) => void
  placeProduct: (product: Product, slotId: string) => FullValidationResult | undefined
  rotateProduct: (placementId: string) => void
  removeProduct: (placementId: string) => void
  moveProduct: (placementId: string, newSlotId: string) => void
  selectSlot: (slotId: string | null) => void
  selectProduct: (productId: string | null) => void
  setGhostProduct: (ghost: GhostProduct | null) => void
  setViewMode: (mode: ViewMode) => void
  setActiveFace: (face: TrayFace) => void
  setCameraPreset: (preset: CameraPreset) => void
  updateBranding: (branding: Partial<DisplayBranding>) => void
  updateLipColor: (color: string) => void
  updateTierCount: (count: number) => void
  setPalletType: (type: PalletType) => void
  updateName: (name: string) => void
  updateHoliday: (holiday: DisplayProject['holiday']) => void
  updateAssortment: (productId: string, cases: number) => void
  setAssortment: (assortment: AssortmentEntry[]) => void
  updateShipByDate: (date: number | undefined) => void
  populateFromAssortment: () => void
  openPicker: () => void
  closePicker: () => void
  setPickerProduct: (product: Product | null) => void
  resetEditorUi: () => void
  undo: () => void
  redo: () => void
}

function replaceProject(projects: DisplayProject[], nextProject: DisplayProject) {
  const existingIndex = projects.findIndex((project) => project.id === nextProject.id)
  if (existingIndex === -1) {
    return [...projects, nextProject]
  }

  return projects.map((project) =>
    project.id === nextProject.id ? nextProject : project
  )
}

function hydrateSelectionState() {
  const settings = getAppSettingsSnapshot()
  return {
    viewMode: settings.defaultViewMode,
    activeFace: settings.defaultFace,
    cameraPreset: settings.defaultCameraPreset,
  }
}

function buildValidationContext(state: DisplayState) {
  if (!state.currentProject) return null

  const retailer = useRetailerStore.getState().getRetailer(state.currentProject.retailerId)
  if (!retailer) return null

  const settings = getAppSettingsSnapshot()
  const tierConfigs = buildTierConfigs(
    state.currentProject.tierCount,
    retailer.maxDisplayHeight,
    state.currentProject.palletType,
  )
  const wallConfigs = createDefaultWallConfigs(
    state.currentProject.palletType,
    settings.editorGridColumns,
  )

  return {
    palletConfig: {
      base: retailer.palletDimensions,
      maxWeight: 2500,
    },
    palletType: state.currentProject.palletType,
    tierConfigs,
    wallConfigs,
    existingPlacements: state.currentProject.placements,
    allProducts: useCatalogStore.getState().products,
  }
}

function commitProjectUpdate(state: DisplayState, nextProject: DisplayProject) {
  const snapshot = structuredClone(nextProject)
  const nextHistory = state.history.slice(0, state.historyIndex + 1)
  nextHistory.push(snapshot)
  if (nextHistory.length > 50) nextHistory.shift()

  return {
    currentProject: nextProject,
    projects: replaceProject(state.projects, nextProject),
    history: nextHistory,
    historyIndex: nextHistory.length - 1,
  }
}

export const useDisplayStore = create<DisplayState>((set, get) => ({
  projects: [],
  currentProject: null,
  selectedSlotId: null,
  selectedProductId: null,
  ghostProduct: null,
  ...hydrateSelectionState(),
  isPickerOpen: false,
  pickerSelectedProduct: null,
  history: [],
  historyIndex: -1,
  lastUsedConfig: JSON.parse(localStorage.getItem('lastUsedConfig') ?? 'null'),

  setProjects: (projects) => {
    const currentProject = projects[0] ?? null
    set({
      projects,
      currentProject,
      history: currentProject ? [structuredClone(currentProject)] : [],
      historyIndex: currentProject ? 0 : -1,
      ...hydrateSelectionState(),
    })
  },

  createProject: (name, config, tierCount = 4) => {
    const settings = getAppSettingsSnapshot()
    const project: DisplayProject = {
      id: crypto.randomUUID(),
      name,
      retailerId: config.retailerId,
      holiday: config.season,
      season: config.season,
      tierCount,
      palletType: config.palletType,
      lipColor: settings.defaultLipColor,
      branding: {
        lipText: config.season === 'none' ? '' : 'ALL YOUR HOLIDAY NEEDS',
        lipTextColor: '#FFFFFF',
        headerText: '',
        headerTextColor: '#FFFFFF',
      },
      placements: [],
      assortment: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    localStorage.setItem('lastUsedConfig', JSON.stringify(config))

    set((state) => ({
      projects: [...state.projects, project],
      currentProject: project,
      lastUsedConfig: config,
      viewMode: settings.defaultViewMode,
      activeFace: settings.defaultFace,
      cameraPreset: settings.defaultCameraPreset,
      history: [structuredClone(project)],
      historyIndex: 0,
    }))

    return project
  },

  getActiveRetailer: () => {
    const project = get().currentProject
    if (!project) return undefined
    return useRetailerStore.getState().getRetailer(project.retailerId)
  },

  getProject: (id) => get().projects.find((project) => project.id === id),

  getProjectsForRetailer: (retailerId) =>
    get()
      .projects
      .filter((project) => project.retailerId === retailerId)
      .sort((a, b) => b.updatedAt - a.updatedAt),

  selectProject: (id) => {
    const project = get().projects.find((entry) => entry.id === id)
    if (!project) return

    set({
      currentProject: project,
      history: [structuredClone(project)],
      historyIndex: 0,
      selectedSlotId: null,
      selectedProductId: null,
      ghostProduct: null,
      isPickerOpen: false,
      pickerSelectedProduct: null,
      ...hydrateSelectionState(),
    })
  },

  setCurrentProject: (project) => {
    set({
      currentProject: project,
      projects: replaceProject(get().projects, project),
      history: [structuredClone(project)],
      historyIndex: 0,
      selectedSlotId: null,
      selectedProductId: null,
      ghostProduct: null,
      isPickerOpen: false,
      pickerSelectedProduct: null,
      ...hydrateSelectionState(),
    })
  },

  placeProduct: (product, slotId) => {
    const state = get()
    if (!state.currentProject) return

    const context = buildValidationContext(state)
    if (!context) return

    const derivedPlacement = derivePlacementFromSlotId(
      slotId,
      context.tierConfigs,
      state.currentProject.palletType,
    )

    if (!derivedPlacement) {
      return {
        valid: false,
        errors: [{ rule: 'slot', reason: `Slot ${slotId} could not be resolved.` }],
        warnings: [],
        suggestions: [],
      }
    }

    const existingIndex = state.currentProject.placements.findIndex(
      (placement) => placement.slotId === slotId
    )
    const ignoredPlacementId =
      existingIndex >= 0 ? state.currentProject.placements[existingIndex].id : undefined

    const displayMode = 'face-out' as const
    const colSpan = getEffectiveColSpan(
      product,
      displayMode,
      context.wallConfigs[derivedPlacement.wall],
      derivedPlacement.wall,
      context.palletConfig,
      context.allProducts,
    )
    const validation = validatePlacement(
      product,
      {
        wall: derivedPlacement.wall,
        tier: derivedPlacement.tier,
        gridCol: derivedPlacement.gridCol,
        colSpan,
        quantity: 1,
        displayMode,
      },
      context,
      ignoredPlacementId,
    )

    if (!validation.valid) {
      return validation
    }

    const dimensions = resolveProductDimensions(product, context.allProducts)
    const filteredPlacements =
      existingIndex >= 0
        ? state.currentProject.placements.filter((placement) => placement.slotId !== slotId)
        : state.currentProject.placements

    const placement: PlacedProduct = {
      id: crypto.randomUUID(),
      sourceProductId: product.id,
      slotId,
      width: dimensions.width,
      height: dimensions.height,
      depth: dimensions.depth,
      color: product.brandColor,
      label: product.name,
      sku: product.sku,
      category: product.category,
      imageUrl: product.imageUrl,
      modelUrl: product.modelUrl,
      packaging: product.packaging,
      caseConfig: product.caseConfig,
      wall: derivedPlacement.wall,
      tier: derivedPlacement.tier,
      gridCol: derivedPlacement.gridCol,
      colSpan,
      quantity: 1,
      displayMode,
    }

    const nextProject = {
      ...state.currentProject,
      placements: [...filteredPlacements, placement],
      updatedAt: Date.now(),
    }

    set({
      ...commitProjectUpdate(state, nextProject),
      isPickerOpen: false,
      pickerSelectedProduct: null,
    })

    return validation
  },

  rotateProduct: (placementId) => {
    const state = get()
    if (!state.currentProject) return

    const nextProject = {
      ...state.currentProject,
      placements: state.currentProject.placements.map((placement) =>
        placement.id === placementId
          ? { ...placement, orientation: nextOrientation(placement.orientation) }
          : placement
      ),
      updatedAt: Date.now(),
    }

    set(commitProjectUpdate(state, nextProject))
  },

  removeProduct: (placementId) => {
    const state = get()
    if (!state.currentProject) return

    const nextProject = {
      ...state.currentProject,
      placements: state.currentProject.placements.filter(
        (placement) => placement.id !== placementId
      ),
      updatedAt: Date.now(),
    }

    set({
      ...commitProjectUpdate(state, nextProject),
      selectedProductId:
        state.selectedProductId === placementId ? null : state.selectedProductId,
    })
  },

  moveProduct: (placementId, newSlotId) => {
    const state = get()
    if (!state.currentProject) return

    const nextProject = {
      ...state.currentProject,
      placements: state.currentProject.placements.map((placement) =>
        placement.id === placementId
          ? { ...placement, slotId: newSlotId }
          : placement
      ),
      updatedAt: Date.now(),
    }

    set(commitProjectUpdate(state, nextProject))
  },

  selectSlot: (slotId) =>
    set({
      selectedSlotId: slotId,
      selectedProductId: null,
      ghostProduct: null,
      pickerSelectedProduct: null,
    }),

  selectProduct: (productId) =>
    set({
      selectedProductId: productId,
      selectedSlotId: null,
      ghostProduct: null,
      pickerSelectedProduct: null,
    }),

  setGhostProduct: (ghost) => set({ ghostProduct: ghost }),

  setViewMode: (mode) =>
    set({
      viewMode: mode,
      selectedSlotId: null,
      selectedProductId: null,
      ghostProduct: null,
      pickerSelectedProduct: null,
      isPickerOpen: false,
    }),

  setActiveFace: (face) =>
    set({
      activeFace: face,
      selectedSlotId: null,
      ghostProduct: null,
      pickerSelectedProduct: null,
    }),

  setCameraPreset: (preset) => set({ cameraPreset: preset }),

  updateBranding: (branding) => {
    const state = get()
    if (!state.currentProject) return

    const nextProject = {
      ...state.currentProject,
      branding: { ...state.currentProject.branding, ...branding },
      updatedAt: Date.now(),
    }

    set(commitProjectUpdate(state, nextProject))
  },

  updateLipColor: (color) => {
    const state = get()
    if (!state.currentProject) return

    const nextProject = {
      ...state.currentProject,
      lipColor: color,
      updatedAt: Date.now(),
    }

    set(commitProjectUpdate(state, nextProject))
  },

  updateTierCount: (count) => {
    const state = get()
    if (!state.currentProject) return

    const clamped = Math.min(6, Math.max(2, count))
    const validPlacements = state.currentProject.placements.filter((placement) => {
      const tierId = parseInt(placement.slotId.split('-')[0], 10)
      return !Number.isNaN(tierId) && tierId <= clamped
    })

    const nextProject = {
      ...state.currentProject,
      tierCount: clamped,
      placements: validPlacements,
      updatedAt: Date.now(),
    }

    set(commitProjectUpdate(state, nextProject))
  },

  setPalletType: (type) => {
    const state = get()
    if (!state.currentProject) return

    const placements =
      type === 'half'
        ? state.currentProject.placements.filter((placement) => {
            const slotIndex = parseInt(placement.slotId.split('-')[1], 10)
            return !Number.isNaN(slotIndex) && slotIndex < 1000
          })
        : state.currentProject.placements

    const nextProject = {
      ...state.currentProject,
      palletType: type,
      placements,
      updatedAt: Date.now(),
    }

    set({
      ...commitProjectUpdate(state, nextProject),
      activeFace: type === 'half' ? 'front' : state.activeFace,
      selectedSlotId: null,
      selectedProductId: null,
      ghostProduct: null,
    })
  },

  updateName: (name) => {
    const state = get()
    if (!state.currentProject) return

    const nextProject = {
      ...state.currentProject,
      name,
      updatedAt: Date.now(),
    }

    set(commitProjectUpdate(state, nextProject))
  },

  updateHoliday: (holiday) => {
    const state = get()
    if (!state.currentProject) return

    const nextProject = {
      ...state.currentProject,
      holiday,
      season: holiday,
      updatedAt: Date.now(),
    }

    set(commitProjectUpdate(state, nextProject))
  },

  updateAssortment: (productId, cases) => {
    const state = get()
    if (!state.currentProject) return

    const existing = state.currentProject.assortment
    const nextAssortment =
      cases > 0
        ? existing.some((entry) => entry.productId === productId)
          ? existing.map((entry) =>
              entry.productId === productId ? { ...entry, cases } : entry
            )
          : [...existing, { productId, cases }]
        : existing.filter((entry) => entry.productId !== productId)

    const nextProject = {
      ...state.currentProject,
      assortment: nextAssortment,
      updatedAt: Date.now(),
    }

    set(commitProjectUpdate(state, nextProject))
  },

  setAssortment: (assortment) => {
    const state = get()
    if (!state.currentProject) return

    const nextProject = {
      ...state.currentProject,
      assortment,
      updatedAt: Date.now(),
    }

    set(commitProjectUpdate(state, nextProject))
  },

  updateShipByDate: (date) => {
    const state = get()
    if (!state.currentProject) return

    const nextProject = {
      ...state.currentProject,
      shipByDate: date,
      updatedAt: Date.now(),
    }

    set(commitProjectUpdate(state, nextProject))
  },

  populateFromAssortment: () => {
    const state = get()
    if (!state.currentProject) return

    const assortment = state.currentProject.assortment ?? []
    const activeEntries = assortment.filter(e => e.cases > 0)
    if (activeEntries.length === 0) return

    const allProducts = useCatalogStore.getState().products
    const productMap = new Map(allProducts.map(p => [p.id, p]))

    // Sort by weight descending — heaviest first
    const sorted = [...activeEntries]
      .map(entry => ({ ...entry, product: productMap.get(entry.productId) }))
      .filter(entry => entry.product)
      .sort((a, b) => (b.product!.weight ?? 0) - (a.product!.weight ?? 0))

    const tierCount = state.currentProject.tierCount

    const context = buildValidationContext(state)
    if (!context) return

    const wallConfig = context.wallConfigs.front
    const gridColumns = wallConfig.gridColumns

    // Weight-based tier assignment:
    // Tier 1 (bottom) = heavy items only (heaviest by weight)
    // Tier N (top)     = lightest items (chips, small packages)
    // Tiers 2 to N-1   = everything else
    const placements: PlacedProduct[] = []

    // Categorize by weight thresholds
    const HEAVY_THRESHOLD = 1.5  // lbs — anything above goes on tier 1
    const LIGHT_THRESHOLD = 0.6  // lbs — anything below goes on top tier

    const heavy: typeof sorted = []
    const mid: typeof sorted = []
    const light: typeof sorted = []

    for (const entry of sorted) {
      const w = entry.product!.weight ?? 0
      if (w >= HEAVY_THRESHOLD) heavy.push(entry)
      else if (w <= LIGHT_THRESHOLD) light.push(entry)
      else mid.push(entry)
    }

    // Build assignment: tier 1 = heavy, tier N = light, tiers 2-(N-1) = mid
    const assignments: Array<{ product: typeof sorted[0]['product'], tier: number }> = []

    // Heavy → tier 1
    for (const entry of heavy) {
      assignments.push({ product: entry.product, tier: 1 })
    }

    // Light → top tier
    for (const entry of light) {
      assignments.push({ product: entry.product, tier: tierCount })
    }

    // Mid → distribute across tiers 2 to (N-1), or overflow to 2-N if needed
    const midTierStart = 2
    const midTierEnd = Math.max(midTierStart, tierCount - 1)
    const midTierCount = midTierEnd - midTierStart + 1
    for (let i = 0; i < mid.length; i++) {
      const tier = midTierStart + (i % midTierCount)
      assignments.push({ product: mid[i].product, tier })
    }

    for (let i = 0; i < assignments.length; i++) {
      const { product, tier } = assignments[i]
      if (!product) continue

      // Find next available column on this tier
      const usedCols = placements
        .filter(p => p.tier === tier && p.wall === 'front')
        .reduce((max, p) => Math.max(max, (p.gridCol ?? 0) + (p.colSpan ?? 1)), 0)

      if (usedCols >= gridColumns) continue // tier is full

      const dimensions = resolveProductDimensions(product, allProducts)
      const colSpan = getEffectiveColSpan(
        product,
        'face-out',
        wallConfig,
        'front',
        context.palletConfig,
        allProducts,
      )

      const gridCol = Math.min(usedCols, gridColumns - colSpan)
      const slotId = `${tier}-${gridCol}`

      placements.push({
        id: crypto.randomUUID(),
        sourceProductId: product.id,
        slotId,
        width: dimensions.width,
        height: dimensions.height,
        depth: dimensions.depth,
        color: product.brandColor,
        label: product.name,
        sku: product.sku,
        category: product.category,
        imageUrl: product.imageUrl,
        modelUrl: product.modelUrl,
        packaging: product.packaging,
        caseConfig: product.caseConfig,
        wall: 'front',
        tier,
        gridCol,
        colSpan,
        quantity: 1,
        displayMode: 'face-out',
      })
    }

    const nextProject = {
      ...state.currentProject,
      placements,
      updatedAt: Date.now(),
    }

    set(commitProjectUpdate(state, nextProject))
  },

  openPicker: () => set({ isPickerOpen: true }),

  closePicker: () => set({ isPickerOpen: false }),

  setPickerProduct: (product) => set({ pickerSelectedProduct: product }),

  resetEditorUi: () =>
    set({
      selectedSlotId: null,
      selectedProductId: null,
      ghostProduct: null,
      isPickerOpen: false,
      pickerSelectedProduct: null,
    }),

  undo: () => {
    const { history, historyIndex, projects } = get()
    if (historyIndex <= 0) return

    const nextHistoryIndex = historyIndex - 1
    const nextProject = structuredClone(history[nextHistoryIndex])

    set({
      currentProject: nextProject,
      projects: replaceProject(projects, nextProject),
      historyIndex: nextHistoryIndex,
      selectedSlotId: null,
      selectedProductId: null,
      ghostProduct: null,
    })
  },

  redo: () => {
    const { history, historyIndex, projects } = get()
    if (historyIndex >= history.length - 1) return

    const nextHistoryIndex = historyIndex + 1
    const nextProject = structuredClone(history[nextHistoryIndex])

    set({
      currentProject: nextProject,
      projects: replaceProject(projects, nextProject),
      historyIndex: nextHistoryIndex,
      selectedSlotId: null,
      selectedProductId: null,
      ghostProduct: null,
    })
  },
}))
