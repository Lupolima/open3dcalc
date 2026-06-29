import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FixedCostsSection } from '../FixedCostsSection'
import type { CalculatorState } from '@/stores/calculatorStore'

const createMockStore = (overrides: Partial<CalculatorState> = {}): CalculatorState =>
	({
		fixedCosts: {
			enabled: false,
			monthlyCost: 0,
			monthlyPrintHours: 160,
		},
		setFixedCostsField: vi.fn(),
		...overrides,
	}) as unknown as CalculatorState

const defaultProps = {
	renderSectionHeader: vi.fn((_Icon, title) => (
		<div data-testid="section-header">{title}</div>
	)),
	t: (key: string) => key,
	currencySymbol: 'R$',
	handleInput: vi.fn(),
}

describe('FixedCostsSection', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders without crashing', () => {
		const store = createMockStore()
		render(<FixedCostsSection {...defaultProps} store={store} />)
		expect(screen.getByTestId('section-header')).toBeInTheDocument()
	})

	it('displays the section title via renderSectionHeader', () => {
		const store = createMockStore()
		render(<FixedCostsSection {...defaultProps} store={store} />)
		expect(screen.getByTestId('section-header')).toHaveTextContent('calc.fixedCost.title')
	})

	it('shows toggle button for enabling fixed costs', () => {
		const store = createMockStore()
		render(<FixedCostsSection {...defaultProps} store={store} />)
		// ToggleSwitch renders a button with aria-pressed
		const toggle = screen.getByRole('button', { name: /ativar/i })
		expect(toggle).toBeInTheDocument()
		expect(toggle).toHaveAttribute('aria-pressed', 'false')
	})

	it('hides cost inputs when fixed costs are disabled', () => {
		const store = createMockStore({
			fixedCosts: { enabled: false, monthlyCost: 0, monthlyPrintHours: 160 },
		})
		render(<FixedCostsSection {...defaultProps} store={store} />)
		expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
	})

	it('shows cost inputs when fixed costs are enabled', () => {
		const store = createMockStore({
			fixedCosts: { enabled: true, monthlyCost: 100, monthlyPrintHours: 160 },
		})
		render(<FixedCostsSection {...defaultProps} store={store} />)
		// InputGroup renders spinbutton inputs for type="number"
		const inputs = screen.getAllByRole('spinbutton')
		expect(inputs.length).toBe(2)
	})

	it('calls setFixedCostsField when toggle is clicked', async () => {
		const store = createMockStore()
		const { userEvent } = await import('@testing-library/user-event')
		const user = userEvent.setup()
		render(<FixedCostsSection {...defaultProps} store={store} />)
		const toggle = screen.getByRole('button', { name: /ativar/i })
		await user.click(toggle)
		expect(store.setFixedCostsField).toHaveBeenCalledWith('enabled', true)
	})
})
