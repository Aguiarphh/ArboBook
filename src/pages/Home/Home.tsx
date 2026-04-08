import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useBooks } from '@/hooks/useBooks'
import { CATEGORIES, type CategoryId } from '@/services/googleBooks'
import PageWrapper from '@/components/layout/PageWrapper'
import BookCard from '@/components/book/BookCard'
import styles from './Home.module.css'

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<CategoryId | ''>('')
  const { books, loading } = useBooks('', activeCategory)
  const navigate = useNavigate()

  return (
    <PageWrapper>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.greeting}>Bem-vindo à</p>
          <h1 className={styles.brand}>ArboBook</h1>
        </div>

        {/* Search bar (atalho para /buscar) */}
        <button
          className={styles.searchBar}
          onClick={() => navigate('/buscar')}
          aria-label="Buscar livros"
        >
          <Search size={18} strokeWidth={2} className={styles.searchIcon} aria-hidden="true" />
          <span className={styles.searchPlaceholder}>Buscar livros, autores...</span>
        </button>
      </header>

      {/* Categorias */}
      <section className={styles.section} aria-label="Categorias">
        <div className={styles.chips} role="list">
          <button
            role="listitem"
            className={`${styles.chip} ${activeCategory === '' ? styles.chipActive : ''}`}
            onClick={() => setActiveCategory('')}
            aria-pressed={activeCategory === ''}
          >
            Todos
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              role="listitem"
              className={`${styles.chip} ${activeCategory === cat.id ? styles.chipActive : ''}`}
              onClick={() => setActiveCategory(cat.id as CategoryId)}
              aria-pressed={activeCategory === cat.id}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Feed de Livros */}
      <section className={styles.section} aria-label="Livros">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {activeCategory === ''
              ? 'Em Destaque'
              : CATEGORIES.find(c => c.id === activeCategory)?.label}
          </h2>
        </div>

        {loading === 'loading' && (
          <div className={styles.grid} aria-busy="true" aria-label="Carregando livros">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`${styles.skeletonCard} skeleton`} />
            ))}
          </div>
        )}

        {loading === 'error' && (
          <div className={styles.emptyState} role="alert">
            <span className={styles.emptyEmoji}>🌿</span>
            <p className={styles.emptyTitle}>Algo deu errado</p>
            <p className={styles.emptyText}>Não conseguimos carregar os livros. Verifique sua conexão.</p>
          </div>
        )}

        {loading === 'success' && books.length === 0 && (
          <div className={styles.emptyState}>
            <span className={styles.emptyEmoji}>📚</span>
            <p className={styles.emptyTitle}>Nenhum livro encontrado</p>
            <p className={styles.emptyText}>Tente outra categoria.</p>
          </div>
        )}

        {loading === 'success' && books.length > 0 && (
          <div className={styles.grid}>
            {books.map(book => (
              <BookCard key={book.id} book={book} variant="grid" />
            ))}
          </div>
        )}
      </section>
    </PageWrapper>
  )
}
