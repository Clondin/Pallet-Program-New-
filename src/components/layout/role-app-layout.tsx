import { useEffect, type ReactNode } from 'react'
import { Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Sidebar } from '../Sidebar/sidebar'
import { TopToolbar } from '../Toolbar/top-toolbar'
import { SalesmanLayout } from './salesman-layout'
import { BuilderLayout } from './builder-layout'
import { useDisplayStore } from '../../stores/display-store'
import { useRoleStore } from '../../stores/role-store'
import { isRouteAllowedForRole } from '../../lib/role-routes'
import type { Role } from '../../types'

const VALID_ROLES: Role[] = ['salesman', 'buyer', 'builder', 'manager']

function isValidRole(value: string | undefined): value is Role {
  return !!value && (VALID_ROLES as string[]).includes(value)
}

function stripRolePrefix(pathname: string, role: Role): string {
  const prefix = `/${role}`
  if (pathname === prefix) return '/'
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length)
  return pathname
}

interface RoleShellProps {
  role: Role
  children: ReactNode
}

// Phase 0: all four roles share the existing chrome. Phases 1–4 will replace
// each role's shell with bespoke layout/nav.
function DefaultShell({ children }: RoleShellProps) {
  const { pathname } = useLocation()
  const isEditor = pathname.endsWith('/editor')
  return (
    <div className="flex min-h-screen bg-[#fafafa] text-[#171717]">
      <Sidebar />
      <main className="flex-1 ml-[220px] relative min-h-screen flex flex-col">
        {isEditor && <TopToolbar />}
        <div className={`flex-1 ${isEditor ? 'pt-16' : ''}`}>{children}</div>
      </main>
    </div>
  )
}

const ROLE_SHELLS: Record<Role, (props: RoleShellProps) => ReactNode> = {
  salesman: ({ children }) => <SalesmanLayout>{children}</SalesmanLayout>,
  builder: ({ children }) => <BuilderLayout>{children}</BuilderLayout>,
  buyer: DefaultShell,
  manager: DefaultShell,
}

export function RoleAppLayout() {
  const { role: roleParam } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const role = isValidRole(roleParam) ? roleParam : null
  const setRole = useRoleStore((s) => s.setRole)
  const resetEditorUi = useDisplayStore((s) => s.resetEditorUi)
  const isEditor = pathname.endsWith('/editor')

  useEffect(() => {
    if (role) setRole(role)
  }, [role, setRole])

  useEffect(() => {
    if (!isEditor) resetEditorUi()
  }, [isEditor, resetEditorUi])

  useEffect(() => {
    if (!role) return
    const subPath = stripRolePrefix(pathname, role)
    if (!isRouteAllowedForRole(subPath, role)) {
      navigate(`/${role}`, { replace: true })
    }
  }, [role, pathname, navigate])

  if (!role) return <Navigate to="/" replace />

  const Shell = ROLE_SHELLS[role]
  return (
    <Shell role={role}>
      <Outlet />
    </Shell>
  )
}
