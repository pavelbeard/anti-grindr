import MainPage from '@/MainPage'
import { JSX as TSX } from 'react'

interface Route {
  path: string
  element: () => TSX.Element
  children?: Route[]
}

export const routes: Route[] = [
  {
    path: '/',
    element: MainPage,
  },
]
