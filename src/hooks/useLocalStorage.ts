import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStoredValue(prev => {
        const next = typeof value === 'function'
          ? (value as (prev: T) => T)(prev)
          : value
        window.localStorage.setItem(key, JSON.stringify(next))
        return next
      })
    } catch {
      // silencia erros de storage cheio
    }
  }, [key])

  // Sincroniza entre abas
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T)
        } catch {
          // ignora JSON inválido
        }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [key])

  return [storedValue, setValue] as const
}
