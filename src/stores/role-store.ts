import { create } from 'zustand'
import type { Role } from '../types'

const STORAGE_KEY = 'palletforge-active-role'

const VALID_ROLES: Role[] = ['salesman', 'buyer', 'builder', 'manager']

function loadInitialRole(): Role {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && VALID_ROLES.includes(stored as Role)) return stored as Role
  } catch {
    // ignore
  }
  return 'manager'
}

interface RoleState {
  role: Role
  setRole: (role: Role) => void
}

export const useRoleStore = create<RoleState>((set) => ({
  role: loadInitialRole(),
  setRole: (role) => {
    try {
      localStorage.setItem(STORAGE_KEY, role)
    } catch {
      // ignore
    }
    set({ role })
  },
}))

export const ROLE_LABELS: Record<Role, string> = {
  salesman: 'Salesman',
  buyer: 'Buyer',
  builder: 'Builder',
  manager: 'Manager',
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  salesman: 'Build pallets for your retailers',
  buyer: 'Watch demand and swings across programs',
  builder: 'Pull cases and assemble pallets',
  manager: 'Coordinate the whole program',
}
