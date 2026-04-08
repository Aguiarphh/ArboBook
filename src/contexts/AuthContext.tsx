import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  type User,
} from '@/services/firebase'

interface AuthContextValue {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  loginWithGoogle: () => Promise<boolean>
  loginWithEmail: (email: string, password: string) => Promise<boolean>
  registerWithEmail: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Escuta mudanças de auth state
  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  function clearError() { setError(null) }

  function translateError(code: string): string {
    const messages: Record<string, string> = {
      'auth/user-not-found':        'Usuário não encontrado.',
      'auth/wrong-password':        'Senha incorreta.',
      'auth/invalid-credential':    'E-mail ou senha incorretos.',  // Firebase v9+
      'auth/email-already-in-use':  'E-mail já está em uso.',
      'auth/weak-password':         'A senha deve ter pelo menos 6 caracteres.',
      'auth/invalid-email':         'E-mail inválido.',
      'auth/popup-closed-by-user':  'Login cancelado.',
      'auth/network-request-failed': 'Erro de conexão. Tente novamente.',
      'auth/too-many-requests':     'Muitas tentativas. Tente novamente mais tarde.',
    }
    return messages[code] ?? 'Ocorreu um erro. Tente novamente.'
  }

  async function loginWithGoogle(): Promise<boolean> {
    try {
      setError(null)
      await signInWithGoogle()
      return true
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      setError(translateError(code))
      return false
    }
  }

  async function loginWithEmail(email: string, password: string): Promise<boolean> {
    try {
      setError(null)
      await signInWithEmail(email, password)
      return true
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      setError(translateError(code))
      return false
    }
  }

  async function registerWithEmail(email: string, password: string): Promise<boolean> {
    try {
      setError(null)
      await signUpWithEmail(email, password)
      return true
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      setError(translateError(code))
      return false
    }
  }

  async function logout() {
    try {
      await signOut()
      setUser(null)
    } catch {
      // silencia erros de logout
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: Boolean(user),
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      logout,
      error,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
