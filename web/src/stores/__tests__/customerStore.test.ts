import { describe, it, expect, beforeEach } from 'vitest'
import { useCustomerStore } from '../customerStore'

describe('useCustomerStore (integration)', () => {
  beforeEach(() => {
    localStorage.clear()
    useCustomerStore.setState({
      customers: [],
      searchQuery: '',
    })
  })

  // ── addCustomer ──────────────────────────────────────────────
  it('addCustomer() → customer aparece na lista', () => {
    const id = useCustomerStore.getState().addCustomer({
      name: 'João Silva',
      company: 'Silva Tech',
      email: 'joao@email.com',
      phone: '(11) 99999-9999',
      address: 'Rua A, 123',
      notes: 'Cliente VIP',
    })
    const { customers } = useCustomerStore.getState()

    expect(customers).toHaveLength(1)
    expect(customers[0].id).toBe(id)
    expect(customers[0].name).toBe('João Silva')
    expect(customers[0].company).toBe('Silva Tech')
    expect(customers[0].email).toBe('joao@email.com')
    expect(customers[0].phone).toBe('(11) 99999-9999')
    expect(customers[0].address).toBe('Rua A, 123')
    expect(customers[0].notes).toBe('Cliente VIP')
    expect(customers[0].quoteCount).toBe(0)
    expect(customers[0].createdAt).toBeGreaterThan(0)
    expect(customers[0].updatedAt).toBe(customers[0].createdAt)
  })

  // ── addCustomer - apenas campos mínimos ──────────────────────
  it('addCustomer() funciona apenas com name (campos mínimos)', () => {
    const id = useCustomerStore.getState().addCustomer({
      name: 'Maria', company: '', email: '', phone: '', address: '', notes: '',
    })
    const customer = useCustomerStore.getState().getCustomer(id)
    expect(customer).toBeDefined()
    expect(customer!.name).toBe('Maria')
    expect(customer!.company).toBeUndefined()
    expect(customer!.email).toBeUndefined()
    expect(customer!.phone).toBeUndefined()
    expect(customer!.address).toBeUndefined()
    expect(customer!.notes).toBeUndefined()
  })

  // ── addCustomer valida name (min 2 chars) ────────────────────
  it('addCustomer() rejeita name com menos de 2 caracteres', () => {
    expect(() =>
      useCustomerStore.getState().addCustomer({
        name: 'A', company: '', email: '', phone: '', address: '', notes: '',
      }),
    ).toThrow('Name must be at least 2 characters')
    expect(useCustomerStore.getState().customers).toHaveLength(0)
  })

  // ── addCustomer valida email ─────────────────────────────────
  it('addCustomer() rejeita email inválido', () => {
    expect(() =>
      useCustomerStore.getState().addCustomer({
        name: 'Test', company: '', email: 'invalid-email', phone: '', address: '', notes: '',
      }),
    ).toThrow('Invalid email format')
    expect(useCustomerStore.getState().customers).toHaveLength(0)
  })

  // ── updateCustomer ───────────────────────────────────────────
  it('updateCustomer() → atualiza campos e updatedAt', () => {
    const id = useCustomerStore.getState().addCustomer({
      name: 'Original', company: '', email: '', phone: '', address: '', notes: '',
    })
    const original = useCustomerStore.getState().getCustomer(id)!
    const originalUpdatedAt = original.updatedAt

    useCustomerStore.getState().updateCustomer(id, { name: 'Updated', company: 'New Corp' })
    const updated = useCustomerStore.getState().getCustomer(id)!

    expect(updated.name).toBe('Updated')
    expect(updated.company).toBe('New Corp')
    expect(updated.updatedAt).toBeGreaterThanOrEqual(originalUpdatedAt)
  })

  // ── updateCustomer - não existente ───────────────────────────
  it('updateCustomer() com id inexistente não altera nada', () => {
    useCustomerStore.getState().updateCustomer('nonexistent', { name: 'Nope' })
    expect(useCustomerStore.getState().customers).toHaveLength(0)
  })

  // ── removeCustomer ───────────────────────────────────────────
  it('removeCustomer() → customer sai da lista', () => {
    const id1 = useCustomerStore.getState().addCustomer({
      name: 'One', company: '', email: '', phone: '', address: '', notes: '',
    })
    useCustomerStore.getState().addCustomer({
      name: 'Two', company: '', email: '', phone: '', address: '', notes: '',
    })
    expect(useCustomerStore.getState().customers).toHaveLength(2)

    useCustomerStore.getState().removeCustomer(id1)
    const { customers } = useCustomerStore.getState()

    expect(customers).toHaveLength(1)
    expect(customers[0].name).toBe('Two')
  })

  // ── removeCustomer não existente ─────────────────────────────
  it('removeCustomer() com id inexistente não altera nada', () => {
    useCustomerStore.getState().addCustomer({
      name: 'Only', company: '', email: '', phone: '', address: '', notes: '',
    })
    expect(useCustomerStore.getState().customers).toHaveLength(1)

    useCustomerStore.getState().removeCustomer('nonexistent')
    expect(useCustomerStore.getState().customers).toHaveLength(1)
  })

  // ── getCustomer pelo ID ──────────────────────────────────────
  it('getCustomer() retorna customer pelo ID', () => {
    const id = useCustomerStore.getState().addCustomer({
      name: 'Find Me', company: '', email: '', phone: '', address: '', notes: '',
    })
    const customer = useCustomerStore.getState().getCustomer(id)

    expect(customer).toBeDefined()
    expect(customer!.id).toBe(id)
    expect(customer!.name).toBe('Find Me')
  })

  // ── getCustomer ID inexistente ───────────────────────────────
  it('getCustomer() retorna undefined para ID inexistente', () => {
    useCustomerStore.getState().addCustomer({
      name: 'Exists', company: '', email: '', phone: '', address: '', notes: '',
    })
    const customer = useCustomerStore.getState().getCustomer('nonexistent')

    expect(customer).toBeUndefined()
  })

  // ── searchCustomers ──────────────────────────────────────────
  it('searchCustomers() busca por name, company e email', () => {
    useCustomerStore.getState().addCustomer({
      name: 'João Silva', company: 'Tech Corp', email: 'joao@tech.com', phone: '', address: '', notes: '',
    })
    useCustomerStore.getState().addCustomer({
      name: 'Maria Santos', company: 'Design Ltda', email: 'maria@design.com', phone: '', address: '', notes: '',
    })
    useCustomerStore.getState().addCustomer({
      name: 'Carlos', company: 'Tech Solutions', email: 'carlos@sol.com', phone: '', address: '', notes: '',
    })

    // search by name
    expect(useCustomerStore.getState().searchCustomers('joão')).toHaveLength(1)
    expect(useCustomerStore.getState().searchCustomers('maria')).toHaveLength(1)
    // search by company
    expect(useCustomerStore.getState().searchCustomers('tech')).toHaveLength(2)
    // search by email domain
    expect(useCustomerStore.getState().searchCustomers('design.com')).toHaveLength(1)
    // case insensitive
    expect(useCustomerStore.getState().searchCustomers('TECH')).toHaveLength(2)
  })

  // ── searchCustomers - sem resultados ─────────────────────────
  it('searchCustomers() com query sem resultados retorna vazio', () => {
    useCustomerStore.getState().addCustomer({
      name: 'João', company: 'Tech', email: 'joao@email.com', phone: '', address: '', notes: '',
    })
    const results = useCustomerStore.getState().searchCustomers('xyz_nonexistent')
    expect(results).toHaveLength(0)
  })

  // ── searchCustomers - query vazia retorna todos ──────────────
  it('searchCustomers() com query vazia retorna todos', () => {
    useCustomerStore.getState().addCustomer({
      name: 'Ana', company: 'Co1', email: 'a@co.com', phone: '', address: '', notes: '',
    })
    useCustomerStore.getState().addCustomer({
      name: 'Bob', company: 'Co2', email: 'b@co.com', phone: '', address: '', notes: '',
    })
    expect(useCustomerStore.getState().searchCustomers('')).toHaveLength(2)
  })

  // ── getAllCustomers ─────────────────────────────────────────
  it('getAllCustomers() retorna todos os customers', () => {
    expect(useCustomerStore.getState().getAllCustomers()).toHaveLength(0)
    useCustomerStore.getState().addCustomer({
      name: 'Alice', company: '', email: '', phone: '', address: '', notes: '',
    })
    useCustomerStore.getState().addCustomer({
      name: 'Bob', company: '', email: '', phone: '', address: '', notes: '',
    })
    expect(useCustomerStore.getState().getAllCustomers()).toHaveLength(2)
    expect(useCustomerStore.getState().getAllCustomers().map((c) => c.name).sort()).toEqual([
      'Alice',
      'Bob',
    ])
  })

  // ── incrementQuoteCount ──────────────────────────────────────
  it('incrementQuoteCount() → incrementa quoteCount', () => {
    const id = useCustomerStore.getState().addCustomer({
      name: 'Quoter', company: '', email: '', phone: '', address: '', notes: '',
    })
    expect(useCustomerStore.getState().getCustomer(id)!.quoteCount).toBe(0)

    useCustomerStore.getState().incrementQuoteCount(id)
    expect(useCustomerStore.getState().getCustomer(id)!.quoteCount).toBe(1)

    useCustomerStore.getState().incrementQuoteCount(id)
    expect(useCustomerStore.getState().getCustomer(id)!.quoteCount).toBe(2)
  })

  // ── incrementQuoteCount não existente ───────────────────────
  it('incrementQuoteCount() com id inexistente não altera nada', () => {
    useCustomerStore.getState().incrementQuoteCount('nonexistent')
    expect(useCustomerStore.getState().customers).toHaveLength(0)
  })

  // ── exportCustomers ─────────────────────────────────────────
  it('exportCustomers() → retorna JSON string válido', () => {
    useCustomerStore.getState().addCustomer({
      name: 'Export Test', company: 'Export Co', email: 'e@co.com', phone: '', address: '', notes: '',
    })
    const json = useCustomerStore.getState().exportCustomers()
    const parsed = JSON.parse(json)

    expect(parsed.version).toBe('1.0')
    expect(parsed.exportedAt).toBeDefined()
    expect(parsed.customers).toHaveLength(1)
    expect(parsed.customers[0].name).toBe('Export Test')
  })

  // ── importCustomers - merge sem duplicar ─────────────────────
  it('importCustomers() faz merge sem duplicar ids existentes', () => {
    const existingId = useCustomerStore.getState().addCustomer({
      name: 'Original', company: 'Orig Co', email: 'o@co.com', phone: '', address: '', notes: '',
    })
    expect(useCustomerStore.getState().customers).toHaveLength(1)

    const importPayload = {
      customers: [
        {
          id: existingId,
          name: 'Original',
          company: 'Orig Co',
          email: 'o@co.com',
          phone: '',
          address: '',
          notes: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          quoteCount: 0,
        },
        {
          name: 'New Import',
          company: 'New Co',
          email: 'n@co.com',
          phone: '',
          address: '',
          notes: '',
          quoteCount: 0,
        },
      ],
    }

    const result = useCustomerStore.getState().importCustomers(JSON.stringify(importPayload))

    expect(result.skipped).toBe(1) // a duplicada
    expect(result.imported).toBe(1) // a nova
    expect(useCustomerStore.getState().customers).toHaveLength(2)
    expect(useCustomerStore.getState().getAllCustomers().map((c) => c.name).sort()).toEqual([
      'New Import',
      'Original',
    ])
  })

  // ── importCustomers - JSON inválido ──────────────────────────
  it('importCustomers() com JSON inválido retorna 0 importados', () => {
    const result = useCustomerStore.getState().importCustomers('not valid json')
    expect(result.imported).toBe(0)
    expect(result.skipped).toBe(0)
  })

  // ── importCustomers - payload sem customers ─────────────────
  it('importCustomers() com payload sem customers retorna 0', () => {
    const result = useCustomerStore.getState().importCustomers(JSON.stringify({}))
    expect(result.imported).toBe(0)
    expect(result.skipped).toBe(0)
  })

  // ── setSearchQuery ───────────────────────────────────────────
  it('setSearchQuery() atualiza searchQuery', () => {
    expect(useCustomerStore.getState().searchQuery).toBe('')

    useCustomerStore.getState().setSearchQuery('joão')
    expect(useCustomerStore.getState().searchQuery).toBe('joão')

    useCustomerStore.getState().setSearchQuery('')
    expect(useCustomerStore.getState().searchQuery).toBe('')
  })
})
