import type { Meta, StoryObj } from '@storybook/react'
import { Dashboard } from './Dashboard'
import type { CalculationResult } from '@/shared/types'

const meta: Meta<typeof Dashboard> = {
  title: 'Components/Dashboard',
  component: Dashboard,
  parameters: { backgrounds: { default: 'dark' } },
}

export default meta
type Story = StoryObj<typeof Dashboard>

const mockResult: CalculationResult = {
  materialCost: 25,
  energyCost: 3.5,
  machineCost: 2.5,
  hardwareCost: 1.2,
  consumablesCost: 0.5,
  laborCost: 15,
  softwareCost: 0,
  failureCost: 4.92,
  extrasCost: 0,
  postProcessingCost: 0,
  subtotal: 49.2,
  totalCost: 54.12,
  sellPrice: 72.50,
  profit: 18.38,
  marketplaceFee: 8.12,
  taxAmount: 5.8,
  costPerGram: 0.50,
  costPerUnit: 54.12,
  unitWeight: 50,
  estimatedPrintTime: 5,
  targetMarginPercent: 50,
  breakEvenPrice: 54.12,
  actualMargin: 25.3,
}

export const WithData: Story = {
  args: { result: mockResult },
}

export const Empty: Story = {
  args: { result: null },
}
