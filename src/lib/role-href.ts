import { useLocation } from 'react-router-dom'
import { useRoleStore } from '../stores/role-store'
import type { Role } from '../types'

const VALID: Role[] = ['salesman', 'buyer', 'builder', 'manager']

function roleFromPath(pathname: string): Role | null {
  const seg = pathname.split('/')[1] as Role | undefined
  return seg && (VALID as string[]).includes(seg) ? (seg as Role) : null
}

// Returns a function that prefixes a flat path (e.g. "/retailers/abc") with
// the current role from the URL, falling back to the role store. Used so
// salesman/builder/etc can keep navigating with flat-looking paths but the
// router actually receives the role-scoped URL.
export function useRoleHref(): (path: string) => string {
  const { pathname } = useLocation()
  const storeRole = useRoleStore((s) => s.role)
  const role = roleFromPath(pathname) ?? storeRole
  return (path: string) => {
    if (!path.startsWith('/')) return path
    // Already role-prefixed? Leave it alone.
    if (roleFromPath(path)) return path
    return `/${role}${path === '/' ? '' : path}`
  }
}

export function rolePrefixFor(role: Role): string {
  return `/${role}`
}
