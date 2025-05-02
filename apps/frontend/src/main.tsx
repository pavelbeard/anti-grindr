import AuthProvider from '@/lib/providers/AuthProvider'
import RoutesScheme from '@/RoutesScheme'
import TanstackQueryDevTools from '@/TanstackQueryDevTools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RoutesScheme />
      </AuthProvider>
      <TanstackQueryDevTools />
    </QueryClientProvider>
  </StrictMode>,
)
