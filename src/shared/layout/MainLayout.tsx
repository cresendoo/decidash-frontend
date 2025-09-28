import { Outlet } from 'react-router-dom'

import ThemeProvider from '@/shared/theme/ThemeProvider'

import Header from './Header'

export default function MainLayout() {
  return (
    <ThemeProvider>
      <div
        className="h-screen flex flex-col"
        style={{ backgroundColor: 'var(--bg-default)', color: 'var(--fg-default)' }}
      >
        <Header />
          <main className="min-w-0 flex-1 min-h-0">
            <Outlet />
          </main>
      </div>
    </ThemeProvider>
  )
}
