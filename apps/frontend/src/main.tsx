import RoutesScheme from '@/RoutesScheme'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AuthProvider from './lib/providers/AuthProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RoutesScheme />
    </AuthProvider>
  </StrictMode>,
)
