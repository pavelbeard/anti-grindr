import { Outlet } from 'react-router'

export default function PublicLayout() {
  return (
    <>
      <h1>Public Layout</h1>
      <Outlet />
    </>
  )
}
