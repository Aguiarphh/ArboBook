import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { LibraryProvider } from '@/contexts/LibraryContext'
import SkeletonPage from '@/components/ui/SkeletonPage'

const Home              = lazy(() => import('@/pages/Home/Home'))
const Search            = lazy(() => import('@/pages/Search/Search'))
const BookDetail        = lazy(() => import('@/pages/BookDetail/BookDetail'))
const Login             = lazy(() => import('@/pages/Login/Login'))
const MinhabibliotecaPage = lazy(() => import('@/pages/Minhabiblioteca/MinhabibliotecaPage'))
const ListaDesejosPage  = lazy(() => import('@/pages/ListaDesejos/ListaDesejosPage'))
const PerfilPage        = lazy(() => import('@/pages/Perfil/PerfilPage'))

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LibraryProvider>
          <BrowserRouter>
            <Suspense fallback={<SkeletonPage />}>
              <Routes>
                <Route path="/"                   element={<Home />} />
                <Route path="/buscar"             element={<Search />} />
                <Route path="/livro/:id"          element={<BookDetail />} />
                <Route path="/login"              element={<Login />} />
                <Route path="/minha-biblioteca"   element={<MinhabibliotecaPage />} />
                <Route path="/lista-de-desejos"   element={<ListaDesejosPage />} />
                <Route path="/perfil"             element={<PerfilPage />} />
                <Route path="*"                   element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </LibraryProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
