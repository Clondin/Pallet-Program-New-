import { Navigate, useLocation } from 'react-router-dom'
import { useRoleStore } from '../../stores/role-store'

// Bridges old flat URLs (e.g. /retailers/abc) to the role-scoped URL
// (/{currentRole}/retailers/abc). Lets internal Links keep working while we
// migrate them per-phase.
export function LegacyFlatRedirect() {
  const { pathname, search, hash } = useLocation()
  const role = useRoleStore((s) => s.role)
  return <Navigate to={`/${role}${pathname}${search}${hash}`} replace />
}
