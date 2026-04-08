import { NavLink } from 'react-router-dom'
import { Home, Search, BookMarked, Bookmark, CircleUserRound } from 'lucide-react'
import styles from './BottomNav.module.css'

const NAV_ITEMS = [
  { to: '/',                 label: 'Início',  Icon: Home },
  { to: '/buscar',           label: 'Buscar',  Icon: Search },
  { to: '/minha-biblioteca', label: 'Livros',  Icon: BookMarked },
  { to: '/lista-de-desejos', label: 'Desejos', Icon: Bookmark },
  { to: '/perfil',           label: 'Perfil',  Icon: CircleUserRound },
] as const

export default function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `${styles.item} ${isActive ? styles.active : ''}`
          }
          aria-label={label}
        >
          <span className={styles.iconWrap}>
            <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
            <span className={styles.dot} />
          </span>
          <span className={styles.label}>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
