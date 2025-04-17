import { useAuthContext } from '@/lib/contexts/AuthContext'
import { Navigate, Outlet } from 'react-router'

export default function PrivateLayout() {
  const { isAuthenticated } = useAuthContext()

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" />
  }

  return (
    <div>
      <h1>Private Layout</h1>
      <Outlet />
    </div>
  )
}
