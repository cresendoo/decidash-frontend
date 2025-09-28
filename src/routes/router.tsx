import { createBrowserRouter } from 'react-router-dom'

import App from '@/App'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, lazy: async () => ({ Component: (await import('@/pages/traders')).default }) },
      {
        path: 'traders',
        lazy: async () => ({ Component: (await import('@/pages/traders')).default }),
      },
    ],
  },
])
