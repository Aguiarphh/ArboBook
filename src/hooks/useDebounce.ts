import { useState, useEffect, useRef } from 'react'

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

// Hook de debounce para search (retorna valor debounced + loading state)
export function useDebouncedSearch(delay = 300) {
  const [query, setQuery] = useState('')
  const [isDebouncing, setIsDebouncing] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(value: string) {
    setQuery(value)
    setIsDebouncing(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setIsDebouncing(false), delay)
  }

  const debouncedQuery = useDebounce(query, delay)

  return { query, debouncedQuery, isDebouncing, handleChange }
}
