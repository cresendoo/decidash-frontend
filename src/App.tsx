import { Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <a href="/" className="text-lg font-semibold tracking-tight">
            Decidash
          </a>
          <nav className="flex items-center gap-4 text-sm text-gray-600">
            <a href="/" className="hover:text-gray-900">
              Home
            </a>
            <a href="/markets" className="hover:text-gray-900">
              Markets
            </a>
            <a href="/traders" className="hover:text-gray-900">
              Traders
            </a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
