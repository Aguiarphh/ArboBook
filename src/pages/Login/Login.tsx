import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import styles from './Login.module.css'

type Mode = 'login' | 'register'

export default function Login() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { loginWithEmail, registerWithEmail, loginWithGoogle, error, clearError } = useAuth()
  const navigate = useNavigate()

  function switchMode() {
    clearError()
    setMode(prev => prev === 'login' ? 'register' : 'login')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const success = mode === 'login'
        ? await loginWithEmail(email, password)
        : await registerWithEmail(email, password)

      if (success) navigate('/')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogle() {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const success = await loginWithGoogle()
      if (success) navigate('/')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLogin = mode === 'login'

  return (
    <div className={styles.page}>
      {/* Brand */}
      <header className={styles.brand}>
        <div className={styles.logo} aria-hidden="true">🌿</div>
        <h1 className={styles.brandName}>ArboBook</h1>
        <p className={styles.tagline}>Sua biblioteca digital</p>
      </header>

      {/* Card de formulário */}
      <main className={styles.card} id="main-content">
        {/* Tabs Login / Cadastro */}
        <div className={styles.tabs} role="tablist">
          <button
            role="tab"
            aria-selected={isLogin}
            className={`${styles.tab} ${isLogin ? styles.tabActive : ''}`}
            onClick={() => isLogin ? null : switchMode()}
          >
            Entrar
          </button>
          <button
            role="tab"
            aria-selected={!isLogin}
            className={`${styles.tab} ${!isLogin ? styles.tabActive : ''}`}
            onClick={() => !isLogin ? null : switchMode()}
          >
            Cadastrar
          </button>
        </div>

        {/* Erro */}
        {error && (
          <div className={styles.errorBanner} role="alert" aria-live="polite">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={styles.input}
              placeholder="seu@email.com"
              required
              autoComplete={isLogin ? 'email' : 'email'}
              aria-required="true"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Senha</label>
            <div className={styles.passwordWrap}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={styles.input}
                placeholder={isLogin ? 'Sua senha' : 'Mínimo 6 caracteres'}
                required
                minLength={6}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                aria-required="true"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
              >
                {showPassword
                  ? <EyeOff size={18} aria-hidden="true" />
                  : <Eye size={18} aria-hidden="true" />
                }
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting || !email || !password}
            aria-busy={isSubmitting}
          >
            {isSubmitting
              ? 'Carregando...'
              : isLogin ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        {/* Divisor */}
        <div className={styles.divider} aria-hidden="true">
          <span>ou</span>
        </div>

        {/* Google login */}
        <button
          className={styles.googleBtn}
          onClick={handleGoogle}
          disabled={isSubmitting}
          aria-label="Entrar com Google"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
          Continuar com Google
        </button>

        {/* Link de troca */}
        <p className={styles.switchText}>
          {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
          <button className={styles.switchLink} onClick={switchMode}>
            {isLogin ? 'Cadastre-se' : 'Entrar'}
          </button>
        </p>

        {/* Aviso: continua sem conta */}
        <button
          className={styles.guestBtn}
          onClick={() => navigate('/')}
        >
          Continuar sem conta →
        </button>
      </main>
    </div>
  )
}
