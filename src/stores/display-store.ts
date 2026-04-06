import { create } from 'zustand'
import {
  DisplayProject,
  PlacedProduct,
  GhostProduct,
  Product,
  CameraPreset,
  ViewMode,
  DisplayBranding,
  TrayFace,
} from '../types'
import { getAppSettingsSnapshot } from './app-settings-store'

interface DisplayState {
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

  createProject: (name: string, retailerId: string, holiday: string, tierCount?: number) => void
  setCurrentProject: (project: DisplayProject) => void
  placeProduct: (product: Product, slotId: string) => void
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
  openPicker: () => void
  closePicker: () => void
  setPickerProduct: (product: Product | null) => void
  resetEditorUi: () => void
  undo: () => void
  redo: () => void
}

const pushHistory = (state: DisplayState): Pick<DisplayState, 'history' | 'historyIndex'> => {
  if (!state.currentProject) return { history: state.history, historyIndex: state.historyIndex }
  const snapshot = structuredClone(state.currentProject)
  const newHistory = state.history.slice(0, state.historyIndex + 1)
  newHistory.push(snapshot)
  if (newHistory.length > 50) newHistory.shift()
  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
  }
}

export const useDisplayStore = create<DisplayState>((set, get) => ({
  currentProject: null,
  selectedSlotId: null,
  selectedProductId: null,
  ghostProduct: null,
  viewMode: getAppSettingsSnapshot().defaultViewMode,
  activeFace: getAppSettingsSnapshot().defaultFace,
  cameraPreset: getAppSettingsSnapshot().defaultCameraPreset,
  isPickerOpen: false,
  pickerSelectedProduct: null,
  history: [],
  historyIndex: -1,

  createProject: (name, retailerId, holiday, tierCount = 4) => {
    const settings = getAppSettingsSnapshot()
    const project: DisplayProject = {
      id: crypto.randomUUID(),
      name,
      retailerId,
      holiday: holiday as DisplayProject['holiday'],
      tierCount,
      lipColor: '#1E3A8A',
      branding: {
        lipText: 'ALL YOUR HOLIDAY NEEDS',
        lipTextColor: '#FFFFFF',
        headerText: '',
        headerTextColor: '#FFFFFF',
      },
      placements: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    set({
      currentProject: project,
      viewMode: settings.defaultViewMode,
      activeFace: settings.defaultFace,
      cameraPreset: settings.defaultCameraPreset,
      history: [structuredClone(project)],
      historyIndex: 0,
    })
  },

  setCurrentProject: (project) => {
    const settings = getAppSettingsSnapshot()
    set({
      currentProject: project,
      viewMode: settings.defaultViewMode,
      activeFace: settings.defaultFace,
      cameraPreset: settings.defaultCameraPreset,
      history: [structuredClone(project)],
      historyIndex: 0,
    })
  },

  placeProduct: (product, slotId) => {
    const state = get()
    if (!state.currentProject) return
    const historyUpdate = pushHistory(state)

    // Before creating placement, remove any existing product in this slot
    const existingIndex = state.currentProject.placements.findIndex(p => p.slotId === slotId)
    const filteredPlacements = existingIndex >= 0
      ? state.currentProject.placements.filter(p => p.slotId !== slotId)
      : state.currentProject.placements

    const placement: PlacedProduct = {
      id: crypto.randomUUID(),
      slotId,
      width: product.width,
      height: product.height,
      depth: product.depth,
      color: product.brandColor,
      label: product.name,
      sku: product.sku,
      imageUrl: product.imageUrl,
    }

    set({
      currentProject: {
        ...state.currentProject,
        placements: [...filteredPlacements, placement],
        updatedAt: Date.now(),
      },
      ...historyUpdate,
      isPickerOpen: false,
      pickerSelectedProduct: null,
    })
  },

  removeProduct: (placementId) => {
    const state = get()
    if (!state.currentProject) return
    const historyUpdate = pushHistory(state)

    set({
      currentProject: {
        ...state.currentProject,
        placements: state.currentProject.placements.filter((p) => p.id !== placementId),
        updatedAt: Date.now(),
      },
      ...historyUpdate,
      selectedProductId: state.selectedProductId === placementId ? null : state.selectedProductId,
    })
  },

  moveProduct: (placementId, newSlotId) => {
    const state = get()
    if (!state.currentProject) return
    const historyUpdate = pushHistory(state)

    set({
      currentProject: {
        ...state.currentProject,
        placements: state.currentProject.placements.map((p) =>
          p.id === placementId ? { ...p, slotId: newSlotId } : p
        ),
        updatedAt: Date.now(),
      },
      ...historyUpdate,
    })
  },

  selectSlot: (slotId) => set({
    selectedSlotId: slotId,
    selectedProductId: null,
    ghostProduct: null,
    pickerSelectedProduct: null,
  }),

  selectProduct: (productId) => set({
    selectedProductId: productId,
    selectedSlotId: null,
    ghostProduct: null,
    pickerSelectedProduct: null,
  }),

  setGhostProduct: (ghost) => set({ ghostProduct: ghost }),

  setViewMode: (mode) => set({
    viewMode: mode,
    selectedSlotId: null,
    selectedProductId: null,
    ghostProduct: null,
    pickerSelectedProduct: null,
    isPickerOpen: false,
  }),

  setActiveFace: (face) => set({
    activeFace: face,
    selectedSlotId: null,
    ghostProduct: null,
    pickerSelectedProduct: null,
  }),

  setCameraPreset: (preset) => set({ cameraPreset: preset }),

  updateBranding: (branding) => {
    const state = get()
    if (!state.currentProject) return
    const historyUpdate = pushHistory(state)

    set({
      currentProject: {
        ...state.currentProject,
        branding: { ...state.currentProject.branding, ...branding },
        updatedAt: Date.now(),
      },
      ...historyUpdate,
    })
  },

  updateLipColor: (color) => {
    const state = get()
    if (!state.currentProject) return
    const historyUpdate = pushHistory(state)

    set({
      currentProject: {
        ...state.currentProject,
        lipColor: color,
        updatedAt: Date.now(),
      },
      ...historyUpdate,
    })
  },

  updateTierCount: (count) => {
    const state = get()
    if (!state.currentProject) return
    const historyUpdate = pushHistory(state)
    const clamped = Math.min(6, Math.max(2, count))

    const validPlacements = state.currentProject.placements.filter(p => {
      const tierId = parseInt(p.slotId.split('-')[0], 10)
      return !isNaN(tierId) && tierId <= clamped
    })

    set({
      currentProject: {
        ...state.currentProject,
        tierCount: clamped,
        placements: validPlacements,
        updatedAt: Date.now(),
      },
      ...historyUpdate,
    })
  },

  openPicker: () => set({ isPickerOpen: true }),

  closePicker: () => set({ isPickerOpen: false }),

  setPickerProduct: (product) => set({ pickerSelectedProduct: product }),

  resetEditorUi: () => set({
    selectedSlotId: null,
    selectedProductId: null,
    ghostProduct: null,
    isPickerOpen: false,
    pickerSelectedProduct: null,
  }),

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex <= 0) return

    const newIndex = historyIndex - 1
    set({
      currentProject: structuredClone(history[newIndex]),
      historyIndex: newIndex,
      selectedSlotId: null,
      selectedProductId: null,
      ghostProduct: null,
    })
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return

    const newIndex = historyIndex + 1
    set({
      currentProject: structuredClone(history[newIndex]),
      historyIndex: newIndex,
      selectedSlotId: null,
      selectedProductId: null,
      ghostProduct: null,
    })
  },
}))
