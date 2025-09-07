import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          Decidash
        </Link>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link to="/markets" className="rounded px-2 py-1 hover:bg-gray-100">
            Markets
          </Link>
          <Link to="/traders" className="rounded px-2 py-1 hover:bg-gray-100">
            Traders
          </Link>
        </div>
      </div>
    </header>
  )
}
