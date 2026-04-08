import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heart, BookOpen, Calendar, Globe, LogIn } from 'lucide-react'
import { fetchBookById } from '@/services/googleBooks'
import { useLibrary } from '@/contexts/LibraryContext'
import { useAuth } from '@/contexts/AuthContext'
import type { Book, ReadingStatus } from '@/types'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import styles from './BookDetail.module.css'

const STATUS_OPTIONS: { value: ReadingStatus; label: string; emoji: string }[] = [
  { value: 'lendo',           label: 'Lendo',          emoji: '📖' },
  { value: 'concluido',       label: 'Concluído',      emoji: '✅' },
  { value: 'lista_de_desejos', label: 'Lista de desejos', emoji: '🌿' },
]

export default function BookDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  const {
    isInWishlist,
    isBookBorrowed,
    addToWishlist,
    removeFromWishlist,
    borrowBook,
    returnBook,
    setReadingStatus,
    state,
  } = useLibrary()

  const bookId = id ?? ''
  const inWishlist = isInWishlist(bookId)
  const isBorrowed = isBookBorrowed(bookId)
  const currentStatus = state.readingStatuses.find(r => r.bookId === bookId)?.status

  useEffect(() => {
    if (!bookId) return
    setLoading(true)
    fetchBookById(bookId)
      .then(setBook)
      .catch(() => setError('Não foi possível carregar o livro.'))
      .finally(() => setLoading(false))
  }, [bookId])

  function handleWishlist() {
    if (!book) return
    if (inWishlist) removeFromWishlist(bookId)
    else addToWishlist(book)
  }

  function handleBorrow() {
    if (!book) return
    // Exige login para emprestar
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (isBorrowed) returnBook(bookId)
    else borrowBook(book)
  }

  function handleStatus(status: ReadingStatus) {
    setReadingStatus({ bookId, status, updatedAt: new Date().toISOString() })
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageWrapper>
        <TopBar title="" showBack />
        <div className={styles.loadingWrap} aria-busy="true">
          <div className={`${styles.skeletonCover} skeleton`} />
          <div className={styles.skeletonInfo}>
            {[160, 120, 80].map(w => (
              <div key={w} className={`${styles.skeletonLine} skeleton`} style={{ width: w }} />
            ))}
          </div>
        </div>
      </PageWrapper>
    )
  }

  // ── Error / not found ────────────────────────────────────────────────────
  if (error || !book) {
    return (
      <PageWrapper>
        <TopBar title="Livro" showBack />
        <div className={styles.emptyState} role="alert">
          <span>🌿</span>
          <p>{error ?? 'Livro não encontrado.'}</p>
        </div>
      </PageWrapper>
    )
  }

  const author = book.authors.join(', ')
  const descriptionToShow = expanded
    ? book.description
    : book.description.slice(0, 300)

  return (
    <PageWrapper>
      <TopBar
        title=""
        showBack
        rightSlot={
          <button
            className={`${styles.wishlistBtn} ${inWishlist ? styles.inWishlist : ''}`}
            onClick={handleWishlist}
            aria-label={inWishlist ? 'Remover dos desejos' : 'Salvar nos desejos'}
            aria-pressed={inWishlist}
          >
            <Heart
              size={22}
              strokeWidth={2}
              fill={inWishlist ? 'currentColor' : 'none'}
              aria-hidden="true"
            />
          </button>
        }
      />

      {/* Hero: capa + info */}
      <section className={styles.hero}>
        <div className={styles.coverShadow}>
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={`Capa de ${book.title}`}
              className={styles.cover}
              width={140}
              height={210}
            />
          ) : (
            <div className={styles.coverPlaceholder}>
              <span>{book.title.charAt(0)}</span>
            </div>
          )}
        </div>

        <div className={styles.heroInfo}>
          {book.categories[0] && (
            <span className={styles.category}>{book.categories[0]}</span>
          )}
          <h1 className={styles.title}>{book.title}</h1>
          <p className={styles.author}>{author}</p>

          <div className={styles.meta}>
            {book.publishedDate && (
              <span className={styles.metaItem}>
                <Calendar size={14} aria-hidden="true" />
                {book.publishedDate.slice(0, 4)}
              </span>
            )}
            {book.pageCount > 0 && (
              <span className={styles.metaItem}>
                <BookOpen size={14} aria-hidden="true" />
                {book.pageCount} págs.
              </span>
            )}
            {book.language && (
              <span className={styles.metaItem}>
                <Globe size={14} aria-hidden="true" />
                {book.language.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Status de leitura */}
      <section className={styles.section} aria-label="Status de leitura">
        <h2 className={styles.sectionTitle}>Status de Leitura</h2>
        <div className={styles.statusRow} role="group">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`${styles.statusBtn} ${currentStatus === opt.value ? styles.statusActive : ''}`}
              onClick={() => handleStatus(opt.value)}
              aria-pressed={currentStatus === opt.value}
            >
              <span aria-hidden="true">{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Descrição */}
      <section className={styles.section} aria-label="Descrição">
        <h2 className={styles.sectionTitle}>Sobre o livro</h2>
        <p className={styles.description}>
          {descriptionToShow}
          {book.description.length > 300 && (
            <>
              {!expanded && '...'}{' '}
              <button
                className={styles.expandBtn}
                onClick={() => setExpanded(e => !e)}
              >
                {expanded ? 'Ver menos' : 'Ver mais'}
              </button>
            </>
          )}
        </p>
      </section>

      {/* Botão de Empréstimo */}
      <div className={styles.borrowSection}>
        {isAuthenticated ? (
          // Usuário logado: mostra status + botão
          <>
            <div className={styles.availabilityBadge} data-borrowed={isBorrowed}>
              <span className={styles.dot} />
              {isBorrowed ? 'Emprestado por você' : 'Disponível'}
            </div>
            <button
              className={`${styles.borrowBtn} ${isBorrowed ? styles.returnBtn : ''}`}
              onClick={handleBorrow}
              aria-label={isBorrowed ? 'Devolver livro' : 'Emprestar livro'}
            >
              {isBorrowed ? 'Devolver' : 'Emprestar'}
            </button>
          </>
        ) : (
          // Visitante: convida a fazer login
          <button
            className={styles.loginPromptBtn}
            onClick={() => navigate('/login')}
            aria-label="Faça login para emprestar"
          >
            <LogIn size={18} aria-hidden="true" />
            Entre para emprestar
          </button>
        )}
      </div>
    </PageWrapper>
  )
}
