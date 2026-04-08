import type { ReactNode } from 'react'
import BottomNav from './BottomNav'
import styles from './PageWrapper.module.css'

interface PageWrapperProps {
  children: ReactNode
  className?: string
}

export default function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <main id="main-content" className={styles.content}>
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
