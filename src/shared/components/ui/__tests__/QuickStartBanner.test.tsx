import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { QuickStartBanner } from '../QuickStartBanner'

// Mock the calculator store
const mockSetQuickStart = vi.fn()
const mockResetCalculator = vi.fn()

vi.mock('@/shared/stores/calculatorStore', () => ({
  useCalculatorStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      setQuickStart: mockSetQuickStart,
      resetCalculator: mockResetCalculator,
    }),
}))

describe('QuickStartBanner', () => {
  it('renders the banner title', () => {
    render(<QuickStartBanner />)
    expect(screen.getByText('Quer ver como funciona?')).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<QuickStartBanner />)
    expect(
      screen.getByText('Preencha a calculadora com valores realistas para um exemplo de peça 3D'),
    ).toBeInTheDocument()
  })

  it('renders the "Preencher com Exemplo" button', () => {
    render(<QuickStartBanner />)
    expect(screen.getByText('Preencher com Exemplo')).toBeInTheDocument()
  })

  it('renders the "Limpar" button', () => {
    render(<QuickStartBanner />)
    expect(screen.getByText('Limpar')).toBeInTheDocument()
  })

  it('calls setQuickStart when "Preencher com Exemplo" is clicked', () => {
    render(<QuickStartBanner />)
    fireEvent.click(screen.getByText('Preencher com Exemplo'))
    expect(mockSetQuickStart).toHaveBeenCalledTimes(1)
  })

  it('calls resetCalculator when "Limpar" is clicked', () => {
    render(<QuickStartBanner />)
    fireEvent.click(screen.getByText('Limpar'))
    expect(mockResetCalculator).toHaveBeenCalledTimes(1)
  })
})
