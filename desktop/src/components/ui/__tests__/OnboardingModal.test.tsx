import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OnboardingModal } from '../OnboardingModal'

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

describe('OnboardingModal', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders when not dismissed', () => {
    render(<OnboardingModal />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render when previously dismissed', () => {
    localStorage.setItem('open3dcalc_onboarded', 'true')
    const { container } = render(<OnboardingModal />)
    expect(container.innerHTML).toBe('')
  })

  it('dismisses when close button is clicked', () => {
    const onComplete = vi.fn()
    render(<OnboardingModal onComplete={onComplete} />)
    fireEvent.click(screen.getByLabelText('common.close'))
    expect(onComplete).toHaveBeenCalled()
    expect(localStorage.getItem('open3dcalc_onboarded')).toBe('true')
  })

  it('navigates between slides', () => {
    render(<OnboardingModal />)
    // Click next button
    const nextButton = screen.getByLabelText('Próximo')
    fireEvent.click(nextButton)
    // Should still be in dialog
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
