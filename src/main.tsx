import '@/index.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { router } from '@/routes/router'

const queryClient = new QueryClient()

// routes are lazy-loaded via router.tsx

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider
        router={router}
        fallbackElement={<div className="p-4 text-sm text-gray-500">Loading...</div>}
      />
    </QueryClientProvider>
  </StrictMode>,
)
