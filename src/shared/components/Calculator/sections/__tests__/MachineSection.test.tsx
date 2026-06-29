import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MachineSection } from '../MachineSection'
import type { CalculatorState } from '@/shared/stores/calculatorStore'

const createMockStore = (overrides: Partial<CalculatorState> = {}): CalculatorState =>
	({
		fdmMachine: {
			enabled: true,
			machineCost: 3000,
			depreciationMonths: 36,
			hoursPerMonth: 200,
			maintenanceEnabled: false,
			maintenanceCost: 0,
		},
		resinMachine: {
			enabled: true,
			machineCost: 3500,
			depreciationMonths: 36,
			hoursPerMonth: 200,
			maintenanceEnabled: false,
			maintenanceCost: 0,
		},
		setFdmMachine: vi.fn(),
		setResinMachine: vi.fn(),
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

describe('MachineSection', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders without crashing', () => {
		const store = createMockStore()
		render(<MachineSection {...defaultProps} store={store} />)
		expect(screen.getByTestId('section-header')).toBeInTheDocument()
	})

	it('displays the section title via renderSectionHeader', () => {
		const store = createMockStore()
		render(<MachineSection {...defaultProps} store={store} />)
		expect(screen.getByTestId('section-header')).toHaveTextContent('calc.machine')
	})

	it('shows machine cost, depreciation, and hours inputs (3 spinbuttons)', () => {
		const store = createMockStore()
		render(<MachineSection {...defaultProps} store={store} />)
		const inputs = screen.getAllByRole('spinbutton')
		expect(inputs.length).toBe(3)
	})

	it('shows maintenance toggle', () => {
		const store = createMockStore()
		render(<MachineSection {...defaultProps} store={store} />)
		const toggle = screen.getByRole('button', { name: /ativar|desativar/i })
		expect(toggle).toBeInTheDocument()
	})

	it('hides maintenance cost input when maintenance is disabled', () => {
		const store = createMockStore({
			fdmMachine: {
				enabled: true,
				machineCost: 3000,
				depreciationMonths: 36,
				hoursPerMonth: 200,
				maintenanceEnabled: false,
				maintenanceCost: 0,
			},
		})
		render(<MachineSection {...defaultProps} store={store} />)
		// Only 3 inputs (cost, depreciation, hours) - no maintenance cost
		expect(screen.getAllByRole('spinbutton').length).toBe(3)
	})

	it('shows maintenance cost input when maintenance is enabled', () => {
		const store = createMockStore({
			fdmMachine: {
				enabled: true,
				machineCost: 3000,
				depreciationMonths: 36,
				hoursPerMonth: 200,
				maintenanceEnabled: true,
				maintenanceCost: 50,
			},
		})
		render(<MachineSection {...defaultProps} store={store} />)
		// 4 inputs (cost, depreciation, hours, maintenance cost)
		const inputs = screen.getAllByRole('spinbutton')
		expect(inputs.length).toBe(4)
		expect(inputs[3]).toHaveValue(50)
	})

	it('displays FDM machine values when isFDM is true', () => {
		const store = createMockStore({
			fdmMachine: {
				enabled: true,
				machineCost: 3000,
				depreciationMonths: 36,
				hoursPerMonth: 200,
				maintenanceEnabled: false,
				maintenanceCost: 0,
			},
		})
		render(<MachineSection {...defaultProps} isFDM={true} store={store} />)
		const inputs = screen.getAllByRole('spinbutton')
		expect(inputs[0]).toHaveValue(3000)
		expect(inputs[1]).toHaveValue(36)
		expect(inputs[2]).toHaveValue(200)
	})

	it('displays resin machine values when isFDM is false', () => {
		const store = createMockStore({
			resinMachine: {
				enabled: true,
				machineCost: 3500,
				depreciationMonths: 24,
				hoursPerMonth: 150,
				maintenanceEnabled: false,
				maintenanceCost: 0,
			},
		})
		render(<MachineSection {...defaultProps} isFDM={false} store={store} />)
		const inputs = screen.getAllByRole('spinbutton')
		expect(inputs[0]).toHaveValue(3500)
		expect(inputs[1]).toHaveValue(24)
		expect(inputs[2]).toHaveValue(150)
	})
})
