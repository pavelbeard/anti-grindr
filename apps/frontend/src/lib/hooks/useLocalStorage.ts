import { useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || '')
    } catch {
      return initialValue
    }
  })

  const set = (value: T) => {
    setValue(value)
    localStorage.setItem(key, JSON.stringify(value))
  }

  const remove = () => {
    setValue(initialValue)
    localStorage.removeItem(key)
  }

  return [value, set, remove]
}
