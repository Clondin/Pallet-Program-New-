import type { WallFace } from '../../types'

export type WizardStep = 1

export type DimensionPreset = '48x40' | '48x48' | '42x42' | '48x42' | 'custom'

export type WallType = 'shelves' | 'branded-panel' | 'open'

export interface WallSetting {
  type: WallType
  gridColumns: number
}

export interface WizardState {
  currentStep: WizardStep

  // Step 1
  palletType: 'full' | 'half'

  // Step 2
  preset: DimensionPreset
  baseWidth: number
  baseDepth: number
  baseHeight: number
  maxHeight: number

  // Step 3
  tierCount: number
  tierHeights: number[]
  walls: Record<WallFace, WallSetting>
  shelfDepth: number

  // Step 4
  lipColor: string
  lipText: string
  lipTextColor: string
  headerEnabled: boolean
  headerText: string
  headerColor: string
  panelColor: string
  panelText: string
  featuredBrands: string[]
}

export type WizardAction =
  | { type: 'SET_STEP'; step: WizardStep }
  | { type: 'SET_PALLET_TYPE'; palletType: 'full' | 'half' }
  | { type: 'SET_PRESET'; preset: DimensionPreset }
  | { type: 'SET_DIMENSION'; field: 'baseWidth' | 'baseDepth' | 'baseHeight' | 'maxHeight'; value: number }
  | { type: 'SET_TIER_COUNT'; count: number }
  | { type: 'SET_TIER_HEIGHT'; tierIndex: number; height: number }
  | { type: 'AUTO_FIT_TIERS' }
  | { type: 'SET_WALL_TYPE'; wall: WallFace; wallType: WallType }
  | { type: 'SET_WALL_COLUMNS'; wall: WallFace; columns: number }
  | { type: 'SET_SHELF_DEPTH'; depth: number }
  | { type: 'SET_LIP_COLOR'; color: string }
  | { type: 'SET_LIP_TEXT'; text: string }
  | { type: 'SET_LIP_TEXT_COLOR'; color: string }
  | { type: 'SET_HEADER_ENABLED'; enabled: boolean }
  | { type: 'SET_HEADER_TEXT'; text: string }
  | { type: 'SET_HEADER_COLOR'; color: string }
  | { type: 'SET_PANEL_COLOR'; color: string }
  | { type: 'SET_PANEL_TEXT'; text: string }
  | { type: 'TOGGLE_BRAND'; brand: string }

export interface WizardPalletConfig {
  id: string
  name: string
  type: 'full' | 'half' | 'custom'
  base: {
    width: number
    depth: number
    height: number
    preset: DimensionPreset
  }
  display: {
    tierCount: number
    maxHeight: number
    tiers: Array<{ id: number; trayHeight: number }>
    walls: Record<WallFace, {
      type: WallType
      gridColumns: number
      backgroundColor: string
    }>
    shelfDepth: number
    header: {
      enabled: boolean
      text: string
      color: string
    }
  }
  branding: {
    lipColor: string
    lipText: string
    lipTextColor: string
    panelColor: string
    panelText: string
    featuredBrands: string[]
  }
}

const PRESET_DIMENSIONS: Record<Exclude<DimensionPreset, 'custom'>, { width: number; depth: number }> = {
  '48x40': { width: 48, depth: 40 },
  '48x48': { width: 48, depth: 48 },
  '42x42': { width: 42, depth: 42 },
  '48x42': { width: 48, depth: 42 },
}

function distributeTierHeights(count: number): number[] {
  const heights: number[] = []
  for (let i = 0; i < count; i++) {
    const progress = count > 1 ? i / (count - 1) : 0
    heights.push(Math.round(14 - progress * (14 - 7)))
  }
  return heights
}

function getDefaultWalls(palletType: 'full' | 'half'): Record<WallFace, WallSetting> {
  if (palletType === 'full') {
    return {
      front: { type: 'shelves', gridColumns: 6 },
      back: { type: 'shelves', gridColumns: 6 },
      left: { type: 'shelves', gridColumns: 5 },
      right: { type: 'shelves', gridColumns: 5 },
    }
  }
  return {
    front: { type: 'shelves', gridColumns: 6 },
    back: { type: 'open', gridColumns: 6 },
    left: { type: 'branded-panel', gridColumns: 5 },
    right: { type: 'branded-panel', gridColumns: 5 },
  }
}

export function getInitialWizardState(): WizardState {
  return {
    currentStep: 1,
    palletType: 'full',
    preset: '48x40',
    baseWidth: 48,
    baseDepth: 40,
    baseHeight: 6,
    maxHeight: 60,
    tierCount: 4,
    tierHeights: distributeTierHeights(4),
    walls: getDefaultWalls('full'),
    shelfDepth: 10,
    lipColor: '#2563EB',
    lipText: 'ALL YOUR HOLIDAY NEEDS',
    lipTextColor: '#FFFFFF',
    headerEnabled: true,
    headerText: 'Rosh Hashanah',
    headerColor: '#2563EB',
    panelColor: '#00A3C7',
    panelText: 'Wishing You and Your Family a Happy Passover',
    featuredBrands: [],
  }
}

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step }

    case 'SET_PALLET_TYPE':
      return {
        ...state,
        palletType: action.palletType,
        walls: getDefaultWalls(action.palletType),
      }

    case 'SET_PRESET': {
      if (action.preset === 'custom') {
        return { ...state, preset: 'custom' }
      }
      const dims = PRESET_DIMENSIONS[action.preset]
      return {
        ...state,
        preset: action.preset,
        baseWidth: dims.width,
        baseDepth: dims.depth,
      }
    }

    case 'SET_DIMENSION': {
      const next = { ...state, [action.field]: action.value }
      // If user edits dimensions directly, switch to custom preset
      if (action.field === 'baseWidth' || action.field === 'baseDepth') {
        const matchingPreset = (Object.entries(PRESET_DIMENSIONS) as [Exclude<DimensionPreset, 'custom'>, { width: number; depth: number }][])
          .find(([, d]) => d.width === next.baseWidth && d.depth === next.baseDepth)
        next.preset = matchingPreset ? matchingPreset[0] : 'custom'
      }
      return next
    }

    case 'SET_TIER_COUNT': {
      const count = Math.min(6, Math.max(2, action.count))
      return {
        ...state,
        tierCount: count,
        tierHeights: distributeTierHeights(count),
      }
    }

    case 'SET_TIER_HEIGHT': {
      const heights = [...state.tierHeights]
      heights[action.tierIndex] = Math.min(18, Math.max(5, action.height))
      return { ...state, tierHeights: heights }
    }

    case 'AUTO_FIT_TIERS': {
      const available = state.maxHeight - state.baseHeight
      const totalCurrent = state.tierHeights.reduce((s, h) => s + h, 0) + state.tierCount // platform thickness per tier
      if (totalCurrent <= available) return state
      const scale = (available - state.tierCount) / state.tierHeights.reduce((s, h) => s + h, 0)
      const fitted = state.tierHeights.map((h) => Math.max(5, Math.round(h * scale)))
      return { ...state, tierHeights: fitted }
    }

    case 'SET_WALL_TYPE':
      return {
        ...state,
        walls: {
          ...state.walls,
          [action.wall]: { ...state.walls[action.wall], type: action.wallType },
        },
      }

    case 'SET_WALL_COLUMNS':
      return {
        ...state,
        walls: {
          ...state.walls,
          [action.wall]: { ...state.walls[action.wall], gridColumns: action.columns },
        },
      }

    case 'SET_SHELF_DEPTH':
      return { ...state, shelfDepth: Math.min(14, Math.max(6, action.depth)) }

    case 'SET_LIP_COLOR':
      return { ...state, lipColor: action.color }

    case 'SET_LIP_TEXT':
      return { ...state, lipText: action.text.slice(0, 50) }

    case 'SET_LIP_TEXT_COLOR':
      return { ...state, lipTextColor: action.color }

    case 'SET_HEADER_ENABLED':
      return { ...state, headerEnabled: action.enabled }

    case 'SET_HEADER_TEXT':
      return { ...state, headerText: action.text }

    case 'SET_HEADER_COLOR':
      return { ...state, headerColor: action.color }

    case 'SET_PANEL_COLOR':
      return { ...state, panelColor: action.color }

    case 'SET_PANEL_TEXT':
      return { ...state, panelText: action.text }

    case 'TOGGLE_BRAND': {
      const brands = state.featuredBrands.includes(action.brand)
        ? state.featuredBrands.filter((b) => b !== action.brand)
        : [...state.featuredBrands, action.brand]
      return { ...state, featuredBrands: brands }
    }

    default:
      return state
  }
}
