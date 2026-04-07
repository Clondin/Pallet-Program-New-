import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../Sidebar/sidebar'
import { TopToolbar } from '../Toolbar/top-toolbar'
import { useDisplayStore } from '../../stores/display-store'

export function AppLayout() {
  const { pathname } = useLocation()
  const isEditor = pathname.endsWith('/editor')
  const resetEditorUi = useDisplayStore((s) => s.resetEditorUi)

  useEffect(() => {
    if (!isEditor) {
      resetEditorUi()
    }
  }, [isEditor, resetEditorUi])

  return (
    <div className="flex min-h-screen bg-[#fafafa] text-[#171717]">
      <Sidebar />
      <main className="flex-1 ml-[200px] relative min-h-screen flex flex-col">
        {isEditor && <TopToolbar />}
        <div className={`flex-1 ${isEditor ? 'pt-16' : ''}`}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
