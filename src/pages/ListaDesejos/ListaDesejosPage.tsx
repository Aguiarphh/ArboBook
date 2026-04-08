import { useNavigate } from 'react-router-dom'
import { Heart, Trash2 } from 'lucide-react'
import { useLibrary } from '@/contexts/LibraryContext'
import { useAuth } from '@/contexts/AuthContext'
import PageWrapper from '@/components/layout/PageWrapper'
import TopBar from '@/components/layout/TopBar'
import BookCard from '@/components/book/BookCard'
import styles from './ListaDesejosPage.module.css'

export default function ListaDesejosPage() {
  const { state, removeFromWishlist, borrowBook } = useLibrary()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const { wishlist } = state

  if (!isAuthenticated) {
    return (
      <PageWrapper>
        <TopBar title="Lista de Desejos" />
        <div className={styles.authPrompt}>
          <span className={styles.emoji}>🌿</span>
          <h2 className={styles.authTitle}>Entre para ver sua lista</h2>
          <p className={styles.authText}>Faça login para salvar e gerenciar sua lista de desejos.</p>
          <button className={styles.loginBtn} onClick={() => navigate('/login')}>
            Fazer login
          </button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <TopBar title="Lista de Desejos" />

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <Heart size={18} className={styles.sectionIcon} aria-hidden="true" />
          <h2 className={styles.sectionTitle}>
            Salvos ({wishlist.length})
          </h2>
        </div>

        {wishlist.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emoji}>💚</span>
            <p className={styles.emptyTitle}>Sua lista está vazia</p>
            <p className={styles.emptyText}>Toque no coração em qualquer livro para salvá-lo aqui.</p>
            <button className={styles.exploreBtn} onClick={() => navigate('/')}>
              Explorar livros
            </button>
          </div>
        ) : (
          <div className={styles.list}>
            {wishlist.map(item => (
              <div key={item.bookId} className={styles.wishCard}>
                <BookCard book={item.book} variant="list" />

                <div className={styles.actions}>
                  <button
                    className={styles.borrowBtn}
                    onClick={() => borrowBook(item.book)}
                    aria-label={`Emprestar ${item.book.title}`}
                  >
                    Emprestar
                  </button>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromWishlist(item.bookId)}
                    aria-label={`Remover ${item.book.title} da lista de desejos`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageWrapper>
  )
}
