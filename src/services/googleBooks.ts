import type { GBSearchResponse, GBVolume, Book } from '@/types'
import { sanitizeSearchQuery } from '@/utils/sanitize'

const BASE_URL = import.meta.env.VITE_GOOGLE_BOOKS_BASE_URL as string
const API_KEY  = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY as string

// Cache simples em memória (react-best-practices: client-swr-dedup)
const cache = new Map<string, Book[]>()
const detailCache = new Map<string, Book>()

// ── Normalização Google Books → Book interno ──────────────────────────────────

function normalizeCoverUrl(url: string | undefined): string {
  if (!url) return ''
  // Google Books retorna HTTP, força HTTPS
  return url.replace('http://', 'https://')
    .replace('zoom=1', 'zoom=2') // cover maior
}

export function normalizeVolume(vol: GBVolume): Book {
  const info = vol.volumeInfo
  return {
    id: vol.id,
    title: info.title ?? 'Sem título',
    authors: info.authors ?? ['Autor desconhecido'],
    description: info.description ?? 'Sem descrição disponível.',
    coverUrl: normalizeCoverUrl(
      info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail
    ),
    publishedDate: info.publishedDate ?? '',
    categories: info.categories ?? [],
    pageCount: info.pageCount ?? 0,
    language: info.language ?? 'pt',
    previewLink: info.previewLink ?? '',
    averageRating: info.averageRating,
    ratingsCount: info.ratingsCount,
  }
}

// ── Busca de livros ───────────────────────────────────────────────────────────

interface SearchOptions {
  query: string
  startIndex?: number
  maxResults?: number
  orderBy?: 'relevance' | 'newest'
  subject?: string
}

interface SearchResult {
  books: Book[]
  totalItems: number
}

export async function searchBooks(options: SearchOptions): Promise<SearchResult> {
  const { query, startIndex = 0, maxResults = 20, orderBy = 'relevance', subject } = options

  const safeQuery = sanitizeSearchQuery(query)
  const fullQuery = subject ? `${safeQuery}+subject:${subject}` : safeQuery

  if (!fullQuery.trim()) return { books: [], totalItems: 0 }

  const cacheKey = `${fullQuery}-${startIndex}-${maxResults}-${orderBy}`
  if (cache.has(cacheKey)) {
    return { books: cache.get(cacheKey)!, totalItems: 0 }
  }

  const params = new URLSearchParams({
    q: fullQuery,
    startIndex: String(startIndex),
    maxResults: String(maxResults),
    orderBy,
    langRestrict: 'pt',
    key: API_KEY,
  })

  const res = await fetch(`${BASE_URL}/volumes?${params.toString()}`)
  if (!res.ok) throw new Error(`Google Books API: ${res.status} ${res.statusText}`)

  const data = (await res.json()) as GBSearchResponse
  const books = (data.items ?? []).map(normalizeVolume)

  cache.set(cacheKey, books)

  return { books, totalItems: data.totalItems }
}

// ── Detalhe de livro ──────────────────────────────────────────────────────────

export async function fetchBookById(id: string): Promise<Book> {
  if (detailCache.has(id)) return detailCache.get(id)!

  const res = await fetch(`${BASE_URL}/volumes/${id}?key=${API_KEY}`)
  if (!res.ok) throw new Error(`Google Books API: ${res.status}`)

  const vol = (await res.json()) as GBVolume
  const book = normalizeVolume(vol)

  detailCache.set(id, book)
  return book
}

// ── Livros em destaque (para a Home) ─────────────────────────────────────────

export async function fetchFeaturedBooks(): Promise<Book[]> {
  // Busca paralela de categorias para a home (react-best-practices: async-parallel)
  const [ficção, ciência, história] = await Promise.all([
    searchBooks({ query: 'ficção brasileira', maxResults: 6 }),
    searchBooks({ query: 'ciência popular', maxResults: 6 }),
    searchBooks({ query: 'história do brasil', maxResults: 6 }),
  ])

  return [...ficção.books, ...ciência.books, ...história.books]
}

// ── Livros por categoria ──────────────────────────────────────────────────────

export const CATEGORIES = [
  { id: 'ficcao',     label: 'Ficção',     query: 'ficção' },
  { id: 'ciencia',    label: 'Ciência',    query: 'ciência' },
  { id: 'historia',   label: 'História',   query: 'história' },
  { id: 'tecnologia', label: 'Tecnologia', query: 'tecnologia' },
  { id: 'arte',       label: 'Arte',       query: 'arte' },
  { id: 'filosofia',  label: 'Filosofia',  query: 'filosofia' },
] as const

export type CategoryId = typeof CATEGORIES[number]['id']
