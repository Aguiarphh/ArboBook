import styles from './SkeletonPage.module.css'

export default function SkeletonPage() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="Carregando...">
      <div className={styles.topBar} />
      <div className={styles.content}>
        <div className={styles.heroSkeleton} />
        <div className={styles.row}>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.cardSkeleton} />
          ))}
        </div>
        <div className={styles.row}>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.cardSkeleton} />
          ))}
        </div>
      </div>
      <div className={styles.bottomNav} />
    </div>
  )
}
