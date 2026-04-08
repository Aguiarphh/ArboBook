import { useNavigate } from 'react-router-dom'
import { LogOut, Moon, Sun, User as UserIcon, BookOpen, Heart } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useLibrary } from '@/contexts/LibraryContext'
import PageWrapper from '@/components/layout/PageWrapper'
import TopBar from '@/components/layout/TopBar'
import styles from './PerfilPage.module.css'

export default function PerfilPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()
  const { state } = useLibrary()
  const navigate = useNavigate()

  const activeLoans  = state.borrowed.filter(b => !b.returnedAt).length
  const wishlistCount = state.wishlist.length

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    // data-theme="dark" aplicado apenas nesta página (requisito do capstone)
    <div data-theme={theme}>
      <PageWrapper>
        <TopBar
          title="Perfil"
          rightSlot={
            <button
              className={styles.themeBtn}
              onClick={toggleTheme}
              aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
              aria-pressed={isDark}
            >
              {isDark
                ? <Sun size={20} strokeWidth={1.8} aria-hidden="true" />
                : <Moon size={20} strokeWidth={1.8} aria-hidden="true" />
              }
            </button>
          }
        />

        {/* Avatar + nome */}
        <section className={styles.hero}>
          <div className={styles.avatar} aria-hidden="true">
            {user?.photoURL
              ? <img src={user.photoURL} alt={user.displayName ?? 'Avatar'} className={styles.avatarImg} />
              : <UserIcon size={40} strokeWidth={1.5} />
            }
          </div>
          <div className={styles.userInfo}>
            <h1 className={styles.name}>
              {isAuthenticated
                ? (user?.displayName ?? user?.email?.split('@')[0] ?? 'Usuário')
                : 'Visitante'}
            </h1>
            {user?.email && (
              <p className={styles.email}>{user.email}</p>
            )}
          </div>
        </section>

        {/* Stats */}
        <section className={styles.stats} aria-label="Estatísticas">
          <div className={styles.statCard}>
            <BookOpen size={20} className={styles.statIcon} aria-hidden="true" />
            <span className={styles.statValue}>{activeLoans}</span>
            <span className={styles.statLabel}>Emprestados</span>
          </div>
          <div className={styles.statCard}>
            <Heart size={20} className={styles.statIcon} aria-hidden="true" />
            <span className={styles.statValue}>{wishlistCount}</span>
            <span className={styles.statLabel}>Na lista</span>
          </div>
          <div className={styles.statCard}>
            <BookOpen size={20} className={styles.statIcon} aria-hidden="true" />
            <span className={styles.statValue}>{state.borrowed.filter(b => b.returnedAt).length}</span>
            <span className={styles.statLabel}>Devolvidos</span>
          </div>
        </section>

        {/* Configurações */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Aparência</h2>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Modo Escuro</span>
              <span className={styles.settingDesc}>Tema escuro para esta página</span>
            </div>
            <button
              className={`${styles.toggle} ${isDark ? styles.toggleOn : ''}`}
              onClick={toggleTheme}
              role="switch"
              aria-checked={isDark}
              aria-label="Modo escuro"
            >
              <span className={styles.toggleThumb} />
            </button>
          </div>
        </section>

        {/* Ações de conta */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Conta</h2>

          {isAuthenticated ? (
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <LogOut size={18} aria-hidden="true" />
              Sair da conta
            </button>
          ) : (
            <button className={styles.loginBtn} onClick={() => navigate('/login')}>
              <UserIcon size={18} aria-hidden="true" />
              Fazer login
            </button>
          )}
        </section>
      </PageWrapper>
    </div>
  )
}
