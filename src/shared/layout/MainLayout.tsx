import { Outlet } from 'react-router-dom'

import Header from './Header'
import ThemeProvider from '@/shared/theme/ThemeProvider'
import Sidebar from './Sidebar'

export default function MainLayout() {
  return (
    <ThemeProvider>
      <div
        className="min-h-screen"
        style={{ backgroundColor: 'var(--bg-default)', color: 'var(--fg-default)' }}
      >
        <Header />
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
          <Sidebar />
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
