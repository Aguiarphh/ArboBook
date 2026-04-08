import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import TopBar from './TopBar'

describe('TopBar', () => {
  it('deve exibir o título correto', () => {
    render(
      <MemoryRouter>
        <TopBar title="Página de Teste" />
      </MemoryRouter>
    )
    expect(screen.getByText('Página de Teste')).toBeInTheDocument()
  })

  it('deve renderizar o slot da direita se fornecido', () => {
    render(
      <MemoryRouter>
        <TopBar 
          title="Busca" 
          rightSlot={<button data-testid="extra-btn">Filtros</button>} 
        />
      </MemoryRouter>
    )
    expect(screen.getByTestId('extra-btn')).toBeInTheDocument()
  })
})
