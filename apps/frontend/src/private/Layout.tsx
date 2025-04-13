import useAuthentication from '@/lib/hooks/useAuthentication'
import { Navigate, Outlet } from 'react-router'

export default function PrivateLayout() {
  const { isAuthenticated } = useAuthentication()   

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
