import { Outlet } from "react-router";

export default function PublicLayout() {
  return (
    <div>
      <h1>Public Layout</h1>
      <Outlet />
    </div>
  )
}