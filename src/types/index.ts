// ─── Tipos de Domínio ────────────────────────────────────────────────────────

export interface Book {
  id: string
  title: string
  authors: string[]
  description: string
  coverUrl: string
  publishedDate: string
  categories: string[]
  pageCount: number
  language: string
  previewLink: string
  averageRating?: number
  ratingsCount?: number
}

export interface BorrowedBook {
  bookId: string
  book: Book
  borrowedAt: string // ISO date
  dueAt: string      // ISO date (borrowedAt + 14 dias)
  returnedAt?: string
}

export interface WishlistItem {
  bookId: string
  book: Book
  addedAt: string
}

export type ReadingStatus = 'lendo' | 'concluido' | 'lista_de_desejos'

export interface ReadingStatusEntry {
  bookId: string
  status: ReadingStatus
  updatedAt: string
}

// ─── Tipos da Google Books API ───────────────────────────────────────────────

export interface GBImageLinks {
  smallThumbnail?: string
  thumbnail?: string
}

export interface GBVolumeInfo {
  title: string
  authors?: string[]
  description?: string
  publishedDate?: string
  categories?: string[]
  pageCount?: number
  language?: string
  previewLink?: string
  imageLinks?: GBImageLinks
  averageRating?: number
  ratingsCount?: number
}

export interface GBVolume {
  id: string
  volumeInfo: GBVolumeInfo
}

export interface GBSearchResponse {
  totalItems: number
  items?: GBVolume[]
}

// ─── Tipos de Estado da UI ───────────────────────────────────────────────────

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface ApiError {
  message: string
  code?: number
}

// ─── Tipos de Filtro ─────────────────────────────────────────────────────────

export type SortBy = 'relevance' | 'newest' | 'author' | 'rating'

export interface SearchFilters {
  query: string
  category: string
  sortBy: SortBy
}

// ─── Tipos do Contexto da Biblioteca ─────────────────────────────────────────

export interface LibraryState {
  borrowed: BorrowedBook[]
  wishlist: WishlistItem[]
  readingStatuses: ReadingStatusEntry[]
}

export type LibraryAction =
  | { type: 'BORROW_BOOK'; payload: BorrowedBook }
  | { type: 'RETURN_BOOK'; payload: { bookId: string } }
  | { type: 'ADD_WISHLIST'; payload: WishlistItem }
  | { type: 'REMOVE_WISHLIST'; payload: { bookId: string } }
  | { type: 'SET_READING_STATUS'; payload: ReadingStatusEntry }
  | { type: 'LOAD_STATE'; payload: LibraryState }
