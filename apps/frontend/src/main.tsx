import RoutesScheme from '@/RoutesScheme'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RoutesScheme />
  </StrictMode>,
)
