import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/global.css'
import '@/styles/typography.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Elemento #root não encontrado no DOM')

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
