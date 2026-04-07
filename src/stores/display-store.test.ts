import {beforeEach, describe, expect, it, vi} from 'vitest'
import {useDisplayStore} from './display-store'
import {useRetailerStore} from './retailer-store'
import {useAppSettingsStore} from './app-settings-store'
import {makeProduct, makeRetailer} from '../test/test-utils'

describe('display-store', () => {
  beforeEach(() => {
    useRetailerStore.getState().setRetailers([
      makeRetailer({
        id: 'ret-main',
        name: 'Main Retailer',
        defaultTierCount: 5,
      }),
    ])
  })

  it('creates a project using current app defaults and stores the last used config', () => {
    useAppSettingsStore.getState().updateSettings({
      defaultViewMode: '3d',
      defaultFace: 'left',
      defaultCameraPreset: 'top',
    })

    useDisplayStore.getState().createProject('Holiday Build', {
      palletType: 'half',
      season: 'pesach',
      retailerId: 'ret-main',
    })

    const state = useDisplayStore.getState()
    expect(state.currentProject).toMatchObject({
      name: 'Holiday Build',
      retailerId: 'ret-main',
      season: 'pesach',
      palletType: 'half',
      tierCount: 4,
    })
    expect(state.viewMode).toBe('3d')
    expect(state.activeFace).toBe('left')
    expect(state.cameraPreset).toBe('top')
    expect(state.history).toHaveLength(1)
    expect(JSON.parse(localStorage.getItem('lastUsedConfig')!)).toEqual({
      palletType: 'half',
      season: 'pesach',
      retailerId: 'ret-main',
    })
  })

  it('places products, replaces an occupied slot, and supports undo/redo', () => {
    vi.spyOn(Date, 'now').mockReturnValue(2000)

    const store = useDisplayStore.getState()
    store.createProject('Test Project', {
      palletType: 'full',
      season: 'none',
      retailerId: 'ret-main',
    })
    store.openPicker()
    store.setPickerProduct(makeProduct({id: 'picker'}))

    store.placeProduct(makeProduct({id: 'prod-a', name: 'Alpha'}), '1-0')
    expect(useDisplayStore.getState().currentProject?.placements).toHaveLength(1)
    expect(useDisplayStore.getState().isPickerOpen).toBe(false)
    expect(useDisplayStore.getState().pickerSelectedProduct).toBeNull()

    store.placeProduct(makeProduct({id: 'prod-b', name: 'Beta'}), '1-0')
    expect(useDisplayStore.getState().currentProject?.placements).toHaveLength(1)
    expect(useDisplayStore.getState().currentProject?.placements[0].label).toBe('Beta')

    store.undo()
    expect(useDisplayStore.getState().currentProject?.placements[0].label).toBe('Alpha')

    store.redo()
    expect(useDisplayStore.getState().currentProject?.placements[0].label).toBe('Beta')
  })

  it('clamps tier count and drops placements above the new max tier', () => {
    const store = useDisplayStore.getState()
    store.createProject('Tier Project', {
      palletType: 'full',
      season: 'none',
      retailerId: 'ret-main',
    })

    useDisplayStore.setState((state) => ({
      currentProject: state.currentProject && {
        ...state.currentProject,
        placements: [
          {id: 'p-1', slotId: '1-0', width: 1, height: 1, depth: 1, color: '#000', label: 'Low', sku: 'LOW'},
          {id: 'p-2', slotId: '6-0', width: 1, height: 1, depth: 1, color: '#000', label: 'High', sku: 'HIGH'},
        ],
      },
    }))

    store.updateTierCount(1)

    expect(useDisplayStore.getState().currentProject).toMatchObject({
      tierCount: 2,
    })
    expect(useDisplayStore.getState().currentProject?.placements.map((placement) => placement.id)).toEqual(['p-1'])
  })

  it('switches full pallets to half pallets and removes non-front placements', () => {
    const store = useDisplayStore.getState()
    store.createProject('Half Pallet Project', {
      palletType: 'full',
      season: 'none',
      retailerId: 'ret-main',
    })
    store.setActiveFace('right')
    store.selectSlot('3-0')
    store.selectProduct('placed-1')
    store.setGhostProduct({
      slotId: '3-0',
      width: 1,
      height: 1,
      depth: 1,
      color: '#000',
      isValid: true,
    })

    useDisplayStore.setState((state) => ({
      currentProject: state.currentProject && {
        ...state.currentProject,
        placements: [
          {id: 'front', slotId: '1-1', width: 1, height: 1, depth: 1, color: '#000', label: 'Front', sku: 'FRONT'},
          {id: 'back', slotId: '1-1001', width: 1, height: 1, depth: 1, color: '#000', label: 'Back', sku: 'BACK'},
          {id: 'side', slotId: '1-2001', width: 1, height: 1, depth: 1, color: '#000', label: 'Side', sku: 'SIDE'},
        ],
      },
    }))

    store.setPalletType('half')

    expect(useDisplayStore.getState().currentProject?.palletType).toBe('half')
    expect(useDisplayStore.getState().currentProject?.placements.map((placement) => placement.id)).toEqual(['front'])
    expect(useDisplayStore.getState().activeFace).toBe('front')
    expect(useDisplayStore.getState().selectedSlotId).toBeNull()
    expect(useDisplayStore.getState().selectedProductId).toBeNull()
    expect(useDisplayStore.getState().ghostProduct).toBeNull()
  })

  it('returns the currently active retailer for the project', () => {
    useDisplayStore.getState().createProject('Retailer Project', {
      palletType: 'full',
      season: 'none',
      retailerId: 'ret-main',
    })

    expect(useDisplayStore.getState().getActiveRetailer()?.name).toBe('Main Retailer')
  })
})
