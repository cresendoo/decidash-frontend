import { createBrowserRouter } from 'react-router-dom'

import App from '@/App'
import AuthLayout from '@/shared/layout/AuthLayout'
import EmbedLayout from '@/shared/layout/EmbedLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, lazy: async () => ({ Component: (await import('@/pages/traders')).default }) },
      {
        path: 'markets',
        lazy: async () => ({ Component: (await import('@/pages/markets')).default }),
      },
      {
        path: 'traders',
        lazy: async () => ({ Component: (await import('@/pages/traders')).default }),
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('@/pages/auth/login')).default }),
      },
    ],
  },
  {
    path: '/embed',
    element: <EmbedLayout />,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('@/pages/embed/chart-embed')).default }),
      },
    ],
  },
])
