import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import styles from './TopBar.module.css'

interface TopBarProps {
  title: string
  showBack?: boolean
  rightSlot?: ReactNode
}

export default function TopBar({ title, showBack = false, rightSlot }: TopBarProps) {
  const navigate = useNavigate()

  return (
    <header className={styles.bar} role="banner">
      <div className={styles.left}>
        {showBack && (
          <button
            className={styles.backBtn}
            onClick={() => navigate(-1)}
            aria-label="Voltar"
          >
            <ChevronLeft size={24} strokeWidth={2} aria-hidden="true" />
          </button>
        )}
      </div>

      <h1 className={styles.title}>{title}</h1>

      <div className={styles.right}>
        {rightSlot}
      </div>
    </header>
  )
}
