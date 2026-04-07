import '@testing-library/jest-dom/vitest'
import {afterEach, beforeEach, vi} from 'vitest'
import {cleanup, resetAllStores} from './test-utils'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  resetAllStores()
  window.history.pushState({}, 'Test', '/')
  vi.useRealTimers()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
