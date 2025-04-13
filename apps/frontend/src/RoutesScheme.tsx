import { privateRoutes, publicRoutes } from '@/lib/routes'
import PrivateLayout from '@/private/Layout'
import PublicLayout from '@/public/Layout'
import { BrowserRouter, Route, Routes } from 'react-router'

export default function RoutesScheme() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          {publicRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element()}
            />
          ))}
        </Route>
        <Route element={<PrivateLayout />}>
          {privateRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element()}
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
