import { Outlet } from 'react-router-dom'

export default function EmbedLayout() {
  return (
    <div className="min-h-screen bg-white">
      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
