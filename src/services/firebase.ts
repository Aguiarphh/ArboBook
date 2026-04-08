import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
} from 'firebase/firestore'
import type { BorrowedBook, WishlistItem, LibraryState } from '@/types'

// ── Config Firebase (via variáveis de ambiente Vite) ─────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID as string,
}

// Inicializa apenas se as variáveis estiverem presentes
const isConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'your_firebase_api_key'
)

const app  = isConfigured ? initializeApp(firebaseConfig) : null
export const auth = app ? getAuth(app) : null
export const db   = app ? getFirestore(app) : null

export const googleProvider = new GoogleAuthProvider()

// ── Auth helpers ─────────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<User | null> {
  if (!auth) return null
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export async function signInWithEmail(email: string, password: string): Promise<User | null> {
  if (!auth) return null
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function signUpWithEmail(email: string, password: string): Promise<User | null> {
  if (!auth) return null
  const result = await createUserWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function signOut(): Promise<void> {
  if (!auth) return
  await firebaseSignOut(auth)
}

export { onAuthStateChanged, type User }

// ── Firestore: Library persistence ───────────────────────────────────────────

export async function saveLibraryToFirestore(uid: string, state: LibraryState): Promise<void> {
  if (!db) return
  const ref = doc(db, 'users', uid, 'library', 'state')
  await setDoc(ref, state)
}

export async function loadLibraryFromFirestore(uid: string): Promise<LibraryState | null> {
  if (!db) return null
  const ref = doc(db, 'users', uid, 'library', 'state')
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data() as LibraryState
}

export async function addBorrowedToFirestore(uid: string, entry: BorrowedBook): Promise<void> {
  if (!db) return
  const ref = doc(db, 'users', uid, 'borrowed', entry.bookId)
  await setDoc(ref, entry)
}

export async function addWishlistToFirestore(uid: string, entry: WishlistItem): Promise<void> {
  if (!db) return
  const ref = doc(db, 'users', uid, 'wishlist', entry.bookId)
  await setDoc(ref, entry)
}

export async function removeWishlistFromFirestore(uid: string, bookId: string): Promise<void> {
  if (!db) return
  const ref = doc(db, 'users', uid, 'wishlist', bookId)
  await deleteDoc(ref)
}

// Garante que estas funções existam para evitar erros de TypeScript
export { getDocs, collection, doc, getDoc, setDoc, deleteDoc }
