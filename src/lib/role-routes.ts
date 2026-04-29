import type { Role } from '../types'

interface RouteRule {
  match: (pathname: string) => boolean
  allowedRoles: Role[]
}

const ALL: Role[] = ['salesman', 'buyer', 'builder', 'manager']

export const ROUTE_RULES: RouteRule[] = [
  { match: (p) => p === '/', allowedRoles: ALL },
  { match: (p) => p === '/retailers' || p.startsWith('/retailers/'), allowedRoles: ALL },
  // catalog: salesman doesn't get the master catalog browser
  {
    match: (p) => p === '/catalog' || p.startsWith('/catalog/'),
    allowedRoles: ['buyer', 'builder', 'manager'],
  },
  { match: (p) => p === '/seasons', allowedRoles: ['manager'] },
  { match: (p) => p === '/builders', allowedRoles: ['builder', 'manager'] },
  { match: (p) => p === '/demand', allowedRoles: ['buyer', 'manager'] },
  { match: (p) => p === '/transfers', allowedRoles: ['manager'] },
  { match: (p) => p === '/assignments', allowedRoles: ['manager'] },
]

export function isRouteAllowedForRole(pathname: string, role: Role): boolean {
  // The pallet detail/editor are nested under /retailers/* so they're already covered.
  for (const rule of ROUTE_RULES) {
    if (rule.match(pathname)) return rule.allowedRoles.includes(role)
  }
  // Unknown routes fall through as allowed; HomeRedirect handles unknown via /
  return true
}
