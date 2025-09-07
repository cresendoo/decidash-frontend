import { NavLink } from 'react-router-dom'

const base = 'block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100'
const active = 'bg-gray-100 font-medium text-gray-900'

export default function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r bg-white md:block">
      <nav className="p-3">
        <NavLink to="/" end className={({ isActive }) => `${base} ${isActive ? active : ''}`}>
          홈
        </NavLink>
        <NavLink to="/markets" className={({ isActive }) => `${base} ${isActive ? active : ''}`}>
          마켓
        </NavLink>
        <NavLink to="/traders" className={({ isActive }) => `${base} ${isActive ? active : ''}`}>
          트레이더
        </NavLink>
      </nav>
    </aside>
  )
}
