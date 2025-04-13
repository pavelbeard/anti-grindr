import { useLocalStorage } from "@/lib/hooks/useLocalStorage"

export default function useAuthentication() {
  const [isAuthenticated] = useLocalStorage('isAuthenticated', false)

  return { isAuthenticated}
}