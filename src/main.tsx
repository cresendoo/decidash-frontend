import '@/index.css'

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { WalletProvider } from '@/providers'
import { router } from '@/routes/router'

const queryClient = new QueryClient()

// routes are lazy-loaded via router.tsx

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <RouterProvider router={router} />
      </WalletProvider>
    </QueryClientProvider>
  </StrictMode>,
)
