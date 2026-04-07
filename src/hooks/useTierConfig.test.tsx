import {renderHook} from '@testing-library/react'
import {describe, expect, it} from 'vitest'
import {useTierConfig} from './useTierConfig'

describe('useTierConfig', () => {
  it('clamps tier counts and applies half pallet depth', () => {
    const {result} = renderHook(() => useTierConfig(10, 60, 'half'))

    expect(result.current).toHaveLength(6)
    expect(result.current.every((tier) => tier.depth === 20)).toBe(true)
    expect(result.current[0].trayHeight).toBeGreaterThan(result.current.at(-1)!.trayHeight)
    expect(result.current[1].yOffset).toBe(result.current[0].trayHeight + 1)
  })

  it('enforces the lower bound for tier count', () => {
    const {result} = renderHook(() => useTierConfig(1))

    expect(result.current).toHaveLength(2)
  })
})
