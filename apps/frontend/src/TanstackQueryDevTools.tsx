import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export default function TanstackQueryDevTools() {
  const [isOpenDevTools, setIsOpenDevTools] = useState(false)

  if (process.env.NODE_ENV === 'development') {
    return (
      <section className="absolute bottom-0 left-0 right-0 z-50">
        <button
          className="border !px-4 !py-2 rounded-2xl text-white"
          onClick={() => setIsOpenDevTools(!isOpenDevTools)}
        >
          {isOpenDevTools ? 'Hide' : 'Show'} React Query DevTools
        </button>
        {isOpenDevTools && <ReactQueryDevtools />}
      </section>
    )
  }
}
