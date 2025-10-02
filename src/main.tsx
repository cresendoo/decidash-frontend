import '@/index.css'

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { router } from '@/routes/router'

const queryClient = new QueryClient()

// WalletProvider를 동적으로 import하여 초기화 순서 문제 해결
const WalletProvider = lazy(() =>
  import('@/providers').then((module) => ({
    default: module.WalletProvider,
  })),
)

// routes are lazy-loaded via router.tsx

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div>Loading...</div>}>
        <WalletProvider>
          <RouterProvider router={router} />
        </WalletProvider>
      </Suspense>
    </QueryClientProvider>
  </StrictMode>,
)
