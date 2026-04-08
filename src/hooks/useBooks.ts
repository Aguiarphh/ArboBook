import { useState, useEffect, useCallback, useRef } from 'react'
import type { Book, LoadingState } from '@/types'
import { searchBooks, fetchFeaturedBooks } from '@/services/googleBooks'

// Tipos de ordenação suportados
export type SortBy = 'relevance' | 'newest' | 'author' | 'rating'

// Ordenação client-side (autor e popularidade não são suportados pela API)
function sortBooks(books: Book[], sortBy: SortBy): Book[] {
  if (sortBy === 'author') {
    return [...books].sort((a, b) => {
      const authorA = (a.authors[0] ?? '').toLowerCase()
      const authorB = (b.authors[0] ?? '').toLowerCase()
      return authorA.localeCompare(authorB, 'pt')
    })
  }
  if (sortBy === 'rating') {
    return [...books].sort((a, b) => {
      const ratingA = a.averageRating ?? 0
      const ratingB = b.averageRating ?? 0
      return ratingB - ratingA // decrescente
    })
  }
  return books // 'relevance' e 'newest' já vêm ordenados da API
}

interface UseBooksResult {
  books: Book[]
  loading: LoadingState
  error: string | null
  totalItems: number
  loadMore: () => void
  hasMore: boolean
}

export function useBooks(
  initialQuery = '',
  subject = '',
  sortBy: SortBy = 'relevance'
): UseBooksResult {
  const [rawBooks, setRawBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState<LoadingState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [totalItems, setTotalItems] = useState(0)
  const [startIndex, setStartIndex] = useState(0)
  const MAX_RESULTS = 20

  const abortRef = useRef<AbortController | null>(null)

  // orderBy da API: só relevance e newest
  const apiOrderBy = sortBy === 'newest' ? 'newest' : 'relevance'

  const fetchBooks = useCallback(async (reset: boolean) => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setLoading('loading')
    setError(null)

    try {
      let result

      if (!initialQuery && !subject) {
        const featured = await fetchFeaturedBooks()
        result = { books: featured, totalItems: featured.length }
      } else {
        result = await searchBooks({
          query: initialQuery,
          subject,
          startIndex: reset ? 0 : startIndex,
          maxResults: MAX_RESULTS,
          orderBy: apiOrderBy,
        })
      }

      setRawBooks(prev => reset ? result.books : [...prev, ...result.books])
      setTotalItems(result.totalItems)
      setLoading('success')
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setError('Não foi possível carregar os livros. Tente novamente.')
      setLoading('error')
    }
  }, [initialQuery, subject, startIndex, apiOrderBy])

  // Reset quando query, subject ou orderBy muda
  useEffect(() => {
    setStartIndex(0)
    void fetchBooks(true)
    return () => abortRef.current?.abort()
  }, [initialQuery, subject, apiOrderBy]) // eslint-disable-line react-hooks/exhaustive-deps

  function loadMore() {
    const next = startIndex + MAX_RESULTS
    setStartIndex(next)
    void fetchBooks(false)
  }

  // Aplica ordenação client-side (author e rating)
  const books = sortBooks(rawBooks, sortBy)
  const hasMore = rawBooks.length < totalItems

  return { books, loading, error, totalItems, loadMore, hasMore }
}
