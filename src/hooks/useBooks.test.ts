import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBooks } from './useBooks'

// Mock global do fetch
global.fetch = vi.fn()

describe('useBooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve retornar livros quando a busca é bem-sucedida', async () => {
    const mockApiResponse = {
      items: [
        {
          id: '1',
          volumeInfo: {
            title: 'Livro de Teste',
            authors: ['Autor X'],
            imageLinks: { thumbnail: '' }
          }
        }
      ],
      totalItems: 1
    }

    // Simula a resposta positiva da API
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    })

    const { result } = renderHook(() => useBooks('teste', '', 'relevance'))

    // Aguarda o carregamento
    await waitFor(() => {
      expect(result.current.loading).toBe('success')
    })

    expect(result.current.books).toHaveLength(1)
    expect(result.current.books[0].title).toBe('Livro de Teste')
  })

  it('deve retornar erro quando a API falha', async () => {
    // Simula falha na rede
    ;(global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    })

    const { result } = renderHook(() => useBooks('falha'))

    await waitFor(() => {
      expect(result.current.loading).toBe('error')
    })

    expect(result.current.error).toBe('Não foi possível carregar os livros. Tente novamente.')
  })
})
