import App from '@/App'
import SignIn from '@/public/sign-in'
import { JSX } from 'react'

interface Route {
  path: string
  element: () => JSX.Element
  children?: Route[]
}

/**
 * An array of private routes for the application.
 * Each route contains a path and a corresponding element to render.
 * The root path ('/') renders the main App component.
 */
export const privateRoutes: Route[] = [
  {
    path: '/',
    element: App,
  },
]

/**
 * An array of public routes for the application.
 * Sign-up and Sign-in routes
 */
export const publicRoutes: Route[] = [
  {
    path: '/sign-in',
    element: SignIn,
  },
]
