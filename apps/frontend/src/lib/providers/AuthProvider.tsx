import { AuthContext } from '@/lib/contexts/AuthContext'
import useAuthentication from '@/lib/hooks/useAuthentication'

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuthentication()
  return <AuthContext value={{ isAuthenticated }}>{children}</AuthContext>
}
