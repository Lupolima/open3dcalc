import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FailureSection } from '../FailureSection'
import type { CalculatorState } from '@/stores/calculatorStore'

const createMockStore = (overrides: Partial<CalculatorState> = {}): CalculatorState =>
	({
		fdmPrintParams: {
			printTimeHours: 2,
			printerPowerWatts: 200,
			energyCostPerKwh: 0.12,
			failureMode: 'percent' as const,
			failureValue: 10,
			riskMultiplier: 1.5,
		},
		resinPrintParams: {
			printTimeHours: 3,
			printerPowerWatts: 100,
			energyCostPerKwh: 0.12,
			failureMode: 'none' as const,
			failureValue: 0,
			riskMultiplier: 1,
		},
		enabledSections: {
			failure: false,
		},
		toggleSection: vi.fn(),
		setFdmPrintParams: vi.fn(),
		setResinPrintParams: vi.fn(),
		...overrides,
	}) as unknown as CalculatorState

const defaultProps = {
	renderSectionHeader: vi.fn((_Icon, title) => (
		<div data-testid="section-header">{title}</div>
	)),
	t: (key: string) => key,
	currencySymbol: 'R$',
	handleInput: vi.fn(),
	isFDM: true,
}

describe('FailureSection', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders without crashing', () => {
		const store = createMockStore()
		render(<FailureSection {...defaultProps} store={store} />)
		expect(screen.getByTestId('section-header')).toBeInTheDocument()
	})

	it('displays the section title via renderSectionHeader', () => {
		const store = createMockStore()
		render(<FailureSection {...defaultProps} store={store} />)
		expect(screen.getByTestId('section-header')).toHaveTextContent('calc.failure.title')
	})

	it('shows the failure enable toggle', () => {
		const store = createMockStore()
		render(<FailureSection {...defaultProps} store={store} />)
		const toggle = screen.getByRole('button', { name: /ativar/i })
		expect(toggle).toBeInTheDocument()
		expect(toggle).toHaveAttribute('aria-pressed', 'false')
	})

	it('shows failure mode select and value input when enabled', () => {
		const store = createMockStore({
			enabledSections: { failure: true } as CalculatorState['enabledSections'],
		})
		render(<FailureSection {...defaultProps} store={store} />)
		// Select for failure mode
		expect(screen.getByText('calc.failure.mode')).toBeInTheDocument()
		// InputGroup for failure value
		const inputs = screen.getAllByRole('spinbutton')
		expect(inputs.length).toBeGreaterThanOrEqual(1)
	})

	it('calls toggleSection when toggle is clicked', async () => {
		const store = createMockStore()
		const { userEvent } = await import('@testing-library/user-event')
		const user = userEvent.setup()
		render(<FailureSection {...defaultProps} store={store} />)
		const toggle = screen.getByRole('button', { name: /ativar/i })
		await user.click(toggle)
		expect(store.toggleSection).toHaveBeenCalledWith('failure')
	})

	it('displays risk multiplier input when enabled', () => {
		const store = createMockStore({
			enabledSections: { failure: true } as CalculatorState['enabledSections'],
		})
		render(<FailureSection {...defaultProps} store={store} />)
		expect(screen.getByText('calc.failure.riskMultiplier')).toBeInTheDocument()
	})
})
