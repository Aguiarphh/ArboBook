import { useState } from 'react'
import { Search as SearchIcon, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react'
import { useBooks, type SortBy } from '@/hooks/useBooks'
import { useDebouncedSearch } from '@/hooks/useDebounce'
import { CATEGORIES, type CategoryId } from '@/services/googleBooks'
import PageWrapper from '@/components/layout/PageWrapper'
import TopBar from '@/components/layout/TopBar'
import BookCard from '@/components/book/BookCard'
import styles from './Search.module.css'

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'newest',    label: 'Mais recente' },
  { value: 'author',    label: 'Autor (A-Z)' },
  { value: 'rating',    label: 'Popularidade' },
]

export default function Search() {
  const { query, debouncedQuery, handleChange } = useDebouncedSearch(400)
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | ''>('')
  const [sortBy, setSortBy] = useState<SortBy>('relevance')
  const [showFilters, setShowFilters] = useState(false)

  const { books, loading, error } = useBooks(debouncedQuery, selectedCategory, sortBy)

  function clearSearch() {
    handleChange('')
  }

  return (
    <PageWrapper>
      <TopBar
        title="Buscar"
        rightSlot={
          <button
            className={`${styles.filterBtn} ${showFilters ? styles.filterActive : ''}`}
            onClick={() => setShowFilters(s => !s)}
            aria-label="Filtros e ordenação"
            aria-expanded={showFilters}
          >
            <SlidersHorizontal size={20} strokeWidth={1.8} aria-hidden="true" />
          </button>
        }
      />

      {/* Barra de busca */}
      <div className={styles.searchWrap}>
        <div className={styles.inputRow}>
          <SearchIcon size={18} className={styles.icon} aria-hidden="true" />
          <input
            id="search-input"
            type="search"
            value={query}
            onChange={e => handleChange(e.target.value)}
            placeholder="Título, autor, palavra-chave..."
            className={styles.input}
            aria-label="Buscar livros"
            autoFocus
          />
          {query && (
            <button
              className={styles.clearBtn}
              onClick={clearSearch}
              aria-label="Limpar busca"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Filtros + Ordenação (collapsa/expande) */}
      {showFilters && (
        <div className={styles.filters} role="group" aria-label="Filtros e ordenação">

          {/* Categoria */}
          <p className={styles.filterLabel}>Categoria</p>
          <div className={styles.chips}>
            <button
              className={`${styles.chip} ${selectedCategory === '' ? styles.chipActive : ''}`}
              onClick={() => setSelectedCategory('')}
              aria-pressed={selectedCategory === ''}
            >
              Todas
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`${styles.chip} ${selectedCategory === cat.id ? styles.chipActive : ''}`}
                onClick={() => setSelectedCategory(cat.id as CategoryId)}
                aria-pressed={selectedCategory === cat.id}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Ordenação */}
          <div className={styles.sortRow}>
            <ArrowUpDown size={14} className={styles.sortIcon} aria-hidden="true" />
            <p className={styles.filterLabel} style={{ margin: 0 }}>Ordenar por</p>
          </div>
          <div className={styles.chips} role="group" aria-label="Ordenar por">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`${styles.chip} ${sortBy === opt.value ? styles.sortChipActive : ''}`}
                onClick={() => setSortBy(opt.value)}
                aria-pressed={sortBy === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>

        </div>
      )}

      {/* Resultados */}
      <div className={styles.results}>
        {/* Estado: aguardando input */}
        {!debouncedQuery && !selectedCategory && loading !== 'loading' && (
          <div className={styles.emptyState}>
            <span className={styles.emptyEmoji}>🔍</span>
            <p className={styles.emptyTitle}>Encontre seu próximo livro</p>
            <p className={styles.emptyText}>Digite um título, autor ou palavra-chave para começar.</p>
          </div>
        )}

        {/* Skeleton */}
        {loading === 'loading' && (
          <div className={styles.list} aria-busy="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`${styles.skeletonItem} skeleton`} />
            ))}
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className={styles.emptyState} role="alert">
            <span className={styles.emptyEmoji}>🌿</span>
            <p className={styles.emptyTitle}>Algo deu errado</p>
            <p className={styles.emptyText}>{error}</p>
          </div>
        )}

        {/* Sem resultados */}
        {loading === 'success' && books.length === 0 && (debouncedQuery || selectedCategory) && (
          <div className={styles.emptyState}>
            <span className={styles.emptyEmoji}>📚</span>
            <p className={styles.emptyTitle}>Nenhum resultado</p>
            <p className={styles.emptyText}>Tente outros termos ou categorias.</p>
          </div>
        )}

        {/* Lista de resultados */}
        {loading === 'success' && books.length > 0 && (
          <>
            <div className={styles.resultsHeader}>
              <p className={styles.resultCount} aria-live="polite">
                {books.length} {books.length === 1 ? 'resultado' : 'resultados'}
              </p>
              {/* Ordenação ativa em badge */}
              {sortBy !== 'relevance' && (
                <span className={styles.sortBadge}>
                  {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                  <button
                    className={styles.clearSortBtn}
                    onClick={() => setSortBy('relevance')}
                    aria-label="Remover ordenação"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              )}
            </div>
            <div className={styles.list}>
              {books.map(book => (
                <BookCard key={book.id} book={book} variant="list" />
              ))}
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  )
}
