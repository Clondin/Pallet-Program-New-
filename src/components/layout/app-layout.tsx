import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from '../Sidebar/sidebar'
import { TopToolbar } from '../Toolbar/top-toolbar'
import { useDisplayStore } from '../../stores/display-store'
import { useRoleStore } from '../../stores/role-store'
import { isRouteAllowedForRole } from '../../lib/role-routes'

export function AppLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isEditor = pathname.endsWith('/editor')
  const resetEditorUi = useDisplayStore((s) => s.resetEditorUi)
  const role = useRoleStore((s) => s.role)

  useEffect(() => {
    if (!isEditor) {
      resetEditorUi()
    }
  }, [isEditor, resetEditorUi])

  useEffect(() => {
    if (!isRouteAllowedForRole(pathname, role)) {
      navigate('/', { replace: true })
    }
  }, [pathname, role, navigate])

  return (
    <div className="flex min-h-screen bg-[#fafafa] text-[#171717]">
      <Sidebar />
      <main className="flex-1 ml-[220px] relative min-h-screen flex flex-col">
        {isEditor && <TopToolbar />}
        <div className={`flex-1 ${isEditor ? 'pt-16' : ''}`}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
