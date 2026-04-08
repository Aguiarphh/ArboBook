import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import BottomNav from './BottomNav'

describe('BottomNav', () => {
  it('deve exibir todos os links de navegação principais', () => {
    render(
      <MemoryRouter>
        <BottomNav />
      </MemoryRouter>
    )

    expect(screen.getByText('Início')).toBeInTheDocument()
    expect(screen.getByText('Buscar')).toBeInTheDocument()
    expect(screen.getByText('Livros')).toBeInTheDocument()
    expect(screen.getByText('Desejos')).toBeInTheDocument()
    expect(screen.getByText('Perfil')).toBeInTheDocument()
  })

  it('os links devem ter os caminhos corretos', () => {
    render(
      <MemoryRouter>
        <BottomNav />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: /início/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /buscar/i })).toHaveAttribute('href', '/buscar')
    expect(screen.getByRole('link', { name: /livros/i })).toHaveAttribute('href', '/minha-biblioteca')
    expect(screen.getByRole('link', { name: /desejos/i })).toHaveAttribute('href', '/lista-de-desejos')
    expect(screen.getByRole('link', { name: /perfil/i })).toHaveAttribute('href', '/perfil')
  })
})
