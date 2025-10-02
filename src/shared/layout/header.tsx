import { Link, NavLink } from 'react-router-dom'

import { Button } from '@/components/ui'

export default function Header() {
  const nav = [
    { to: '/traders', label: 'Traders' },
    { to: '/top-traders', label: 'Top Traders' },
  ]
  return (
    <header
      className="sticky top-0 z-10 border-b backdrop-blur"
      style={{
        backgroundColor: 'var(--bg-surface-95)',
        color: 'var(--fg-muted)',
        borderColor: 'var(--border-default)',
      }}
    >
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <span
              className="inline-block h-4 w-4 rounded-full"
              style={{
                backgroundColor: 'var(--fg-default)',
              }}
            />
            <span
              className="font-serif text-lg italic"
              style={{ color: 'var(--fg-muted)' }}
            >
              Decidash
            </span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            {nav.map((item, i) => (
              <NavLink
                key={i}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm ${isActive ? 'text-yellow-300' : ''} hover:text-yellow-300`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button>Connect</Button>
        </div>
      </div>
    </header>
  )
}
