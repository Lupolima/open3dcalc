import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Clock } from 'lucide-react'
import { EmptyState } from '../EmptyState'

describe('EmptyState', () => {
  it('renders the title', () => {
    render(
      <EmptyState
        icon={Clock}
        title="Nenhum cálculo salvo ainda"
        description="Descrição de exemplo"
      />,
    )
    expect(screen.getByText('Nenhum cálculo salvo ainda')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(
      <EmptyState
        icon={Clock}
        title="Título"
        description="Descrição de exemplo"
      />,
    )
    expect(screen.getByText('Descrição de exemplo')).toBeInTheDocument()
  })

  it('renders action button when action prop is provided', () => {
    render(
      <EmptyState
        icon={Clock}
        title="Título"
        description="Descrição"
        action={{ label: 'Criar novo', onClick: vi.fn() }}
      />,
    )
    expect(screen.getByText('Criar novo')).toBeInTheDocument()
  })

  it('does not render action button when action prop is not provided', () => {
    render(
      <EmptyState
        icon={Clock}
        title="Título"
        description="Descrição"
      />,
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onClick when action button is clicked', () => {
    const onClick = vi.fn()
    render(
      <EmptyState
        icon={Clock}
        title="Título"
        description="Descrição"
        action={{ label: 'Criar novo', onClick }}
      />,
    )
    fireEvent.click(screen.getByText('Criar novo'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
