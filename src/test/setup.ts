import '@testing-library/jest-dom'
import { vi, expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Estende os matchers do expect (ex: .toBeInTheDocument())
expect.extend(matchers)

// Limpa o DOM após cada teste
afterEach(() => {
  cleanup()
})

// Mock global para o Firebase (para não tentar conectar durante os testes)
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback(null)
    return () => {}
  }),
  GoogleAuthProvider: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  collection: vi.fn(),
}))
