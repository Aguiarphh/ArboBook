// Sanitiza strings de input para prevenir XSS
// React já escapa JSX por padrão, mas sanitizamos inputs antes de salvar no Firestore

const UNSAFE_PATTERN = /[<>"'&]/g

const ESCAPE_MAP: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '&': '&amp;',
}

export function sanitizeInput(value: string): string {
  return value.replace(UNSAFE_PATTERN, (char) => ESCAPE_MAP[char] ?? char)
}

export function sanitizeSearchQuery(query: string): string {
  return sanitizeInput(query.trim()).slice(0, 200) // limite de 200 chars
}
