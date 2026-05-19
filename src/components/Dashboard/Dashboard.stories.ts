import type { Meta, StoryObj } from '@storybook/react'
import { Dashboard } from './Dashboard'
import type { CalculationResult } from '@/types'

const meta: Meta<typeof Dashboard> = {
  title: 'Components/Dashboard',
  component: Dashboard,
  parameters: { backgrounds: { default: 'dark' } },
}

export default meta
type Story = StoryObj<typeof Dashboard>

const mockResult: CalculationResult = {
  inputs: {} as unknown as CalculationResult['inputs'],
  costs: {
    material: 25,
    energy: 3.5,
    depreciation: 2.5,
    maintenance: 1.2,
    labor: 15,
    packaging: 2,
    finishing: 0,
    failureCost: 4.92,
    shipping: 8,
    tax: 5.8,
    cardFee: 2.17,
  },
  subtotal: 49.2,
  totalWithFailure: 54.12,
  unitCost: 54.12,
  marketplaceFee: 8.12,
  marketplaceFeePercent: 14,
  finalPrice: 72.50,
  profit: 18.38,
  profitMargin: 25.3,
  roi: 33.9,
}

export const WithData: Story = {
  args: { result: mockResult },
}

export const Empty: Story = {
  args: { result: null },
}
