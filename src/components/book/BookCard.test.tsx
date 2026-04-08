import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import BookCard from './BookCard'
import type { Book } from '@/types'

// Mock do Contexto de Biblioteca (para não precisar de Provider real)
vi.mock('@/contexts/LibraryContext', () => ({
  useLibrary: () => ({
    isInWishlist: () => false,
    isBookBorrowed: () => false,
    addToWishlist: vi.fn(),
    removeFromWishlist: vi.fn(),
  })
}))

const mockBook: Book = {
  id: '123',
  title: 'O Pequeno Príncipe',
  authors: ['Antoine de Saint-Exupéry'],
  description: 'Um livro clássico.',
  coverUrl: 'https://example.com/cover.jpg',
  publishedDate: '1943',
  categories: ['Ficção'],
  pageCount: 96,
  language: 'pt',
  previewLink: '',
}

describe('BookCard', () => {
  it('deve renderizar o título e autor corretamente', () => {
    render(
      <MemoryRouter>
        <BookCard book={mockBook} />
      </MemoryRouter>
    )

    expect(screen.getByText('O Pequeno Príncipe')).toBeInTheDocument()
    expect(screen.getByText('Antoine de Saint-Exupéry')).toBeInTheDocument()
  })

  it('deve ter o link correto para os detalhes do livro', () => {
    render(
      <MemoryRouter>
        <BookCard book={mockBook} />
      </MemoryRouter>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/livro/123')
  })
})
