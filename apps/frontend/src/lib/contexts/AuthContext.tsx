import { createContext, use } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  setAuthenticated?: (isAuthenticated: boolean) => void
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setAuthenticated: undefined,
})

export const useAuthContext = () => {
  const ctx = use(AuthContext)

  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }

  return ctx
}
