import { useLocalStorage } from '@/lib/hooks/useLocalStorage'

export default function useAuthentication() {
  // Using local storage for persistence.
  const [isAuthenticated] = useLocalStorage('isAuthenticated', false)

  // check authentication

  return { isAuthenticated }
}
