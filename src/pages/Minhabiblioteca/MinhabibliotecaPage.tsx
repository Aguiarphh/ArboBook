import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useLibrary } from '@/contexts/LibraryContext'
import { useAuth } from '@/contexts/AuthContext'
import PageWrapper from '@/components/layout/PageWrapper'
import TopBar from '@/components/layout/TopBar'
import BookCard from '@/components/book/BookCard'
import styles from './MinhabibliotecaPage.module.css'

function getDaysLeft(dueAt: string): number {
  const now = new Date()
  const due = new Date(dueAt)
  const diff = due.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function MinhabibliotecaPage() {
  const { state, returnBook } = useLibrary()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const activeLoans = state.borrowed.filter(b => !b.returnedAt)
  const returned = state.borrowed.filter(b => b.returnedAt)

  if (!isAuthenticated) {
    return (
      <PageWrapper>
        <TopBar title="Minha Biblioteca" />
        <div className={styles.authPrompt}>
          <span className={styles.emoji}>📚</span>
          <h2 className={styles.authTitle}>Entre para ver sua biblioteca</h2>
          <p className={styles.authText}>Faça login para acompanhar seus empréstimos e prazos de devolução.</p>
          <button className={styles.loginBtn} onClick={() => navigate('/login')}>
            Fazer login
          </button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <TopBar title="Minha Biblioteca" />

      {/* Empréstimos ativos */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <BookOpen size={18} className={styles.sectionIcon} aria-hidden="true" />
          <h2 className={styles.sectionTitle}>
            Emprestados ({activeLoans.length})
          </h2>
        </div>

        {activeLoans.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emoji}>🌿</span>
            <p className={styles.emptyTitle}>Nenhum livro emprestado</p>
            <p className={styles.emptyText}>Explore o catálogo e empreste um livro!</p>
            <button className={styles.exploreBtn} onClick={() => navigate('/')}>
              Explorar livros
            </button>
          </div>
        ) : (
          <div className={styles.loanList}>
            {activeLoans.map(loan => {
              const daysLeft = getDaysLeft(loan.dueAt)
              const isOverdue = daysLeft < 0
              const isUrgent = daysLeft >= 0 && daysLeft <= 3

              return (
                <div key={loan.bookId} className={styles.loanCard}>
                  <BookCard book={loan.book} variant="list" />

                  <div className={styles.loanInfo}>
                    <div className={`${styles.dueBadge} ${isOverdue ? styles.overdue : isUrgent ? styles.urgent : styles.ok}`}>
                      {isOverdue
                        ? <AlertCircle size={14} aria-hidden="true" />
                        : <Clock size={14} aria-hidden="true" />
                      }
                      <span>
                        {isOverdue
                          ? `Atrasado ${Math.abs(daysLeft)} dia(s)`
                          : daysLeft === 0
                          ? 'Devolução hoje!'
                          : `${daysLeft} dia(s) restante(s)`
                        }
                      </span>
                    </div>

                    <button
                      className={styles.returnBtn}
                      onClick={() => returnBook(loan.bookId)}
                      aria-label={`Devolver ${loan.book.title}`}
                    >
                      Devolver
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Histórico */}
      {returned.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <CheckCircle size={18} className={styles.sectionIcon} aria-hidden="true" />
            <h2 className={styles.sectionTitle}>
              Histórico ({returned.length})
            </h2>
          </div>
          <div className={styles.historyList}>
            {returned.map(loan => (
              <div key={`${loan.bookId}-returned`} className={`${styles.loanCard} ${styles.returned}`}>
                <BookCard book={loan.book} variant="list" />
                <span className={styles.returnedBadge}>✓ Devolvido</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </PageWrapper>
  )
}
