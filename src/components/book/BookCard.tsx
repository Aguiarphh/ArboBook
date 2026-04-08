import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import type { Book } from '@/types'
import { useLibrary } from '@/contexts/LibraryContext'
import styles from './BookCard.module.css'

interface BookCardProps {
  book: Book
  variant?: 'grid' | 'list'
}

export default function BookCard({ book, variant = 'grid' }: BookCardProps) {
  const { isInWishlist, isBookBorrowed, addToWishlist, removeFromWishlist } = useLibrary()
  const inWishlist = isInWishlist(book.id)
  const isBorrowed = isBookBorrowed(book.id)

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault() // não navegar para detalhe
    e.stopPropagation()
    if (inWishlist) {
      removeFromWishlist(book.id)
    } else {
      addToWishlist(book)
    }
  }

  const author = book.authors[0] ?? 'Autor desconhecido'
  const category = book.categories[0] ?? ''

  return (
    <Link
      to={`/livro/${book.id}`}
      className={`${styles.card} ${styles[variant]} pressable`}
      aria-label={`${book.title} por ${author}`}
    >
      {/* Capa */}
      <div className={styles.coverWrap}>
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={`Capa de ${book.title}`}
            className={styles.cover}
            loading="lazy"
            width={120}
            height={180}
          />
        ) : (
          <div className={styles.coverPlaceholder} aria-hidden="true">
            <span className={styles.coverLetter}>
              {book.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Botão wishlist — top-right da capa */}
        <button
          className={`${styles.wishlistBtn} ${inWishlist ? styles.inWishlist : ''}`}
          onClick={handleWishlist}
          aria-label={inWishlist ? 'Remover dos desejos' : 'Adicionar aos desejos'}
          aria-pressed={inWishlist}
        >
          <Heart
            size={16}
            strokeWidth={2}
            fill={inWishlist ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        </button>

        {/* Badge de disponibilidade — bottom da capa */}
        {isBorrowed && (
          <div className={styles.borrowedBadge} aria-label="Emprestado por você">
            Emprestado
          </div>
        )}
      </div>

      {/* Info */}
      <div className={styles.info}>
        {category && (
          <span className={styles.category}>{category}</span>
        )}
        <p className={`${styles.title} truncate-2`}>{book.title}</p>
        <p className={`${styles.author} truncate-1`}>{author}</p>

        {/* Dot de disponibilidade na variante lista */}
        {variant === 'list' && (
          <div className={`${styles.availabilityDot} ${isBorrowed ? styles.dotBorrowed : styles.dotAvailable}`}>
            <span className={styles.dot} aria-hidden="true" />
            {isBorrowed ? 'Emprestado' : 'Disponível'}
          </div>
        )}
      </div>
    </Link>
  )
}
