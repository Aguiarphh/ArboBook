import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  saveLibraryToFirestore,
  loadLibraryFromFirestore,
} from '@/services/firebase'
import type {
  LibraryState,
  LibraryAction,
  BorrowedBook,
  WishlistItem,
  ReadingStatusEntry,
  Book,
} from '@/types'

// ── Estado inicial ────────────────────────────────────────────────────────────

const INITIAL_STATE: LibraryState = {
  borrowed: [],
  wishlist: [],
  readingStatuses: [],
}

// ── Reducer ───────────────────────────────────────────────────────────────────

function libraryReducer(state: LibraryState, action: LibraryAction): LibraryState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload

    case 'BORROW_BOOK': {
      const alreadyBorrowed = state.borrowed.some(b => b.bookId === action.payload.bookId)
      if (alreadyBorrowed) return state
      return { ...state, borrowed: [...state.borrowed, action.payload] }
    }

    case 'RETURN_BOOK':
      return {
        ...state,
        borrowed: state.borrowed.map(b =>
          b.bookId === action.payload.bookId
            ? { ...b, returnedAt: new Date().toISOString() }
            : b
        ),
      }

    case 'ADD_WISHLIST': {
      const alreadyIn = state.wishlist.some(w => w.bookId === action.payload.bookId)
      if (alreadyIn) return state
      return { ...state, wishlist: [...state.wishlist, action.payload] }
    }

    case 'REMOVE_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.filter(w => w.bookId !== action.payload.bookId),
      }

    case 'SET_READING_STATUS':
      return {
        ...state,
        readingStatuses: [
          ...state.readingStatuses.filter(r => r.bookId !== action.payload.bookId),
          action.payload,
        ],
      }

    default:
      return state
  }
}

// ── Contexto ──────────────────────────────────────────────────────────────────

interface LibraryContextValue {
  state: LibraryState
  isSyncing: boolean
  borrowBook: (book: Book) => void
  returnBook: (bookId: string) => void
  addToWishlist: (book: Book) => void
  removeFromWishlist: (bookId: string) => void
  setReadingStatus: (entry: ReadingStatusEntry) => void
  isBookBorrowed: (bookId: string) => boolean
  isInWishlist: (bookId: string) => boolean
  getActiveLoans: () => BorrowedBook[]
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

const STORAGE_KEY = 'arbobook-library'

function isEmptyState(s: LibraryState): boolean {
  return s.borrowed.length === 0 && s.wishlist.length === 0 && s.readingStatuses.length === 0
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(libraryReducer, INITIAL_STATE)
  const { user } = useAuth()
  const [isSyncing, setIsSyncing] = useState(false)

  // Ref para rastrear se estamos recebendo dados do Firestore
  // (evita gravar de volta no Firestore o que acabamos de ler)
  const justLoadedFromFirestoreRef = useRef(false)
  // Uid para o qual já fizemos a carga inicial do Firestore
  const firestoreLoadedForUidRef = useRef<string | null>(null)

  // ── 1. localStorage: carrega na montagem da página ─────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as LibraryState
        dispatch({ type: 'LOAD_STATE', payload: parsed })
      }
    } catch {
      // ignora dado corrompido
    }
  }, [])

  // ── 2. localStorage: persiste em TODA mudança de estado ───────────────────
  // SEMPRE salva — não bloqueia durante carga do Firestore
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignora storage cheio
    }
  }, [state])

  // ── 3. Firestore: carga inicial quando usuário faz login ───────────────────
  useEffect(() => {
    const uid = user?.uid
    if (!uid) {
      firestoreLoadedForUidRef.current = null
      return
    }
    // Só carrega uma vez por uid nesta sessão
    if (firestoreLoadedForUidRef.current === uid) return

    setIsSyncing(true)

    loadLibraryFromFirestore(uid)
      .then(firestoreState => {
        // Usa dados do Firestore apenas se tiver conteúdo real
        if (firestoreState && !isEmptyState(firestoreState)) {
          justLoadedFromFirestoreRef.current = true
          dispatch({ type: 'LOAD_STATE', payload: firestoreState })
        }
        firestoreLoadedForUidRef.current = uid
      })
      .catch(() => {
        // Falha silenciosa — localStorage é o fallback
        firestoreLoadedForUidRef.current = uid
      })
      .finally(() => {
        setIsSyncing(false)
      })
  }, [user?.uid])

  // ── 4. Firestore: grava após cada mudança de estado do usuário ─────────────
  useEffect(() => {
    const uid = user?.uid
    if (!uid) return
    // Não grava se o estado é vazio (evita sobrescrever dados reais)
    if (isEmptyState(state)) return
    // Não grava se foi JUST carregado do Firestore (evita loop)
    if (justLoadedFromFirestoreRef.current) {
      justLoadedFromFirestoreRef.current = false
      return
    }
    // Aguarda a carga inicial estar concluída
    if (firestoreLoadedForUidRef.current !== uid) return

    void saveLibraryToFirestore(uid, state).catch(() => {
      // Falha silenciosa — dado seguro no localStorage
    })
  }, [state, user?.uid])

  // ── Ações ──────────────────────────────────────────────────────────────────

  function borrowBook(book: Book) {
    const now = new Date()
    const dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + 14)

    const entry: BorrowedBook = {
      bookId: book.id,
      book,
      borrowedAt: now.toISOString(),
      dueAt: dueDate.toISOString(),
    }
    dispatch({ type: 'BORROW_BOOK', payload: entry })
  }

  function returnBook(bookId: string) {
    dispatch({ type: 'RETURN_BOOK', payload: { bookId } })
  }

  function addToWishlist(book: Book) {
    const item: WishlistItem = {
      bookId: book.id,
      book,
      addedAt: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_WISHLIST', payload: item })
  }

  function removeFromWishlist(bookId: string) {
    dispatch({ type: 'REMOVE_WISHLIST', payload: { bookId } })
  }

  function setReadingStatus(entry: ReadingStatusEntry) {
    dispatch({ type: 'SET_READING_STATUS', payload: entry })
  }

  function isBookBorrowed(bookId: string): boolean {
    return state.borrowed.some(b => b.bookId === bookId && !b.returnedAt)
  }

  function isInWishlist(bookId: string): boolean {
    return state.wishlist.some(w => w.bookId === bookId)
  }

  function getActiveLoans(): BorrowedBook[] {
    return state.borrowed.filter(b => !b.returnedAt)
  }

  return (
    <LibraryContext.Provider value={{
      state,
      isSyncing,
      borrowBook,
      returnBook,
      addToWishlist,
      removeFromWishlist,
      setReadingStatus,
      isBookBorrowed,
      isInWishlist,
      getActiveLoans,
    }}>
      {children}
    </LibraryContext.Provider>
  )
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary deve ser usado dentro de LibraryProvider')
  return ctx
}
