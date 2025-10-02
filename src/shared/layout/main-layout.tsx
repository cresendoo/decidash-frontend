import { Outlet } from 'react-router-dom'

import ThemeProvider from '@/shared/theme/ThemeProvider'

import Header from './header'

export default function MainLayout() {
  return (
    <ThemeProvider>
      <div
        className="flex h-screen flex-col"
        style={{
          backgroundColor: 'var(--bg-default)',
          color: 'var(--fg-default)',
        }}
      >
        <Header />
        <main className="min-h-0 min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  )
}
