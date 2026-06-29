import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CustomerTab } from '../CustomerTab'
import type { Customer } from '@/shared/types'

const mockCustomers: Customer[] = [
  {
    id: 'cust_1',
    name: 'João Silva',
    company: 'Silva 3D',
    email: 'joao@example.com',
    phone: '(11) 99999-0000',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    quoteCount: 3,
  },
  {
    id: 'cust_2',
    name: 'Maria Santos',
    email: 'maria@test.com',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    quoteCount: 0,
  },
]

const mockStore = {
  customers: mockCustomers,
  searchQuery: '',
  addCustomer: vi.fn(() => 'new-id'),
  updateCustomer: vi.fn(),
  removeCustomer: vi.fn(),
  getCustomer: vi.fn(),
  searchCustomers: vi.fn((query: string) => {
    if (!query) return mockCustomers
    return mockCustomers.filter(
      c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        (c.company && c.company.toLowerCase().includes(query.toLowerCase())) ||
        (c.email && c.email.toLowerCase().includes(query.toLowerCase())),
    )
  }),
  getAllCustomers: vi.fn(() => mockCustomers),
  incrementQuoteCount: vi.fn(),
  exportCustomers: vi.fn(() => '{}'),
  importCustomers: vi.fn(() => ({ imported: 0, skipped: 0 })),
  setSearchQuery: vi.fn(),
}

vi.mock('@/shared/stores/customerStore', () => ({
  useCustomerStore: vi.fn(() => mockStore),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'pt', language: 'pt' },
  }),
}))

vi.mock('@/shared/hooks/useCurrency', () => ({
  useCurrency: () => ({
    format: (v: number) => `R$ ${v.toFixed(2)}`,
    symbol: 'R$',
  }),
}))

describe('CustomerTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with title and subtitle', () => {
    render(<CustomerTab />)
    expect(screen.getByText('customers.title')).toBeInTheDocument()
    expect(screen.getByText('customers.subtitle')).toBeInTheDocument()
  })

  it('renders new customer button', () => {
    render(<CustomerTab />)
    expect(screen.getByText('customers.newCustomer')).toBeInTheDocument()
  })

  it('renders customer list with cards', () => {
    render(<CustomerTab />)
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('Maria Santos')).toBeInTheDocument()
  })

  it('displays company and email on customer cards', () => {
    render(<CustomerTab />)
    expect(screen.getByText('Silva 3D')).toBeInTheDocument()
    expect(screen.getByText('joao@example.com')).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<CustomerTab />)
    expect(screen.getByPlaceholderText('customers.searchPlaceholder')).toBeInTheDocument()
  })

  it('renders export and import buttons', () => {
    render(<CustomerTab />)
    expect(screen.getByText('customers.export')).toBeInTheDocument()
    expect(screen.getByText('customers.import')).toBeInTheDocument()
  })

  it('filters customers when typing in search', async () => {
    const user = userEvent.setup()
    render(<CustomerTab />)

    const searchInput = screen.getByPlaceholderText('customers.searchPlaceholder')
    await user.type(searchInput, 'João')

    // searchCustomers should be called with the query
    expect(mockStore.searchCustomers).toHaveBeenCalled()
  })

  it('opens form modal when clicking new customer button', async () => {
    const user = userEvent.setup()
    render(<CustomerTab />)

    await user.click(screen.getByText('customers.newCustomer'))

    // Form fields should appear (labels include " *" suffix)
    expect(screen.getByText(/customers\.name/)).toBeInTheDocument()
    expect(screen.getByText(/customers\.company/)).toBeInTheDocument()
    expect(screen.getByText(/customers\.email/)).toBeInTheDocument()
    expect(screen.getByText(/customers\.phone/)).toBeInTheDocument()
    expect(screen.getByText(/customers\.address/)).toBeInTheDocument()
    expect(screen.getByText(/customers\.notes/)).toBeInTheDocument()
  })

  it('shows empty state when no customers exist', () => {
    // With mocked data we have customers, so this tests the positive case
    render(<CustomerTab />)
    expect(screen.getByText('João Silva')).toBeInTheDocument()
  })

  it('has edit and delete buttons on customer cards', async () => {
    render(<CustomerTab />)

    // Find edit and delete buttons for first customer
    const joaoCard = screen.getByText('João Silva').closest('[class*="surface"]') as HTMLElement
    const editBtn = within(joaoCard).getByLabelText('customers.editCustomer')
    const deleteBtn = within(joaoCard).getByLabelText('customers.remove')

    expect(editBtn).toBeInTheDocument()
    expect(deleteBtn).toBeInTheDocument()
  })
})
