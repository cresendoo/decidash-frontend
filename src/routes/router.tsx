import { createBrowserRouter } from 'react-router-dom'

import App from '@/App'
import AuthLayout from '@/shared/layout/AuthLayout'
import EmbedLayout from '@/shared/layout/EmbedLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, lazy: async () => ({ Component: (await import('@/pages/Home')).default }) },
      {
        path: 'markets',
        lazy: async () => ({ Component: (await import('@/pages/Markets')).default }),
      },
      {
        path: 'traders',
        lazy: async () => ({ Component: (await import('@/pages/Traders')).default }),
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('@/pages/auth/Login')).default }),
      },
    ],
  },
  {
    path: '/embed',
    element: <EmbedLayout />,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('@/pages/embed/ChartEmbed')).default }),
      },
    ],
  },
])
