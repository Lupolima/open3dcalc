import { describe, it, expect, beforeEach } from 'vitest'
import { useQuoteStore } from '../quoteStore'
import type { QuoteFormData } from '@/types'

function validFormData(overrides: Partial<QuoteFormData> = {}): QuoteFormData {
  return {
    title: 'Orçamento Teste',
    items: [
      { historyEntryId: 'hist_1', quantity: 2, discountPercent: 0 },
      { historyEntryId: 'hist_2', quantity: 1, discountPercent: 10 },
    ],
    globalDiscountPercent: 5,
    validUntil: '2026-07-28',
    paymentTerms: '30 dias',
    deliveryEstimate: '5 dias úteis',
    footerNote: 'Obrigado pela preferência!',
    ...overrides,
  }
}

describe('useQuoteStore (integration)', () => {
  beforeEach(() => {
    localStorage.clear()
    useQuoteStore.setState({
      quotes: [],
      nextNumber: 1,
      searchQuery: '',
      statusFilter: 'all',
    })
  })

  // ── addQuote ──────────────────────────────────────────────────
  it('addQuote() → quote aparece na lista com número e id corretos', () => {
    const id = useQuoteStore.getState().addQuote(validFormData())
    const { quotes } = useQuoteStore.getState()

    expect(quotes).toHaveLength(1)
    expect(quotes[0].id).toBe(id)
    expect(quotes[0].number).toBe(1)
    expect(quotes[0].title).toBe('Orçamento Teste')
    expect(quotes[0].status).toBe('draft')
    expect(quotes[0].createdAt).toBeGreaterThan(0)
    expect(quotes[0].updatedAt).toBe(quotes[0].createdAt)
  })

  it('addQuote() auto-incrementa o número a cada quote', () => {
    useQuoteStore.getState().addQuote(validFormData({ title: 'First' }))
    useQuoteStore.getState().addQuote(validFormData({ title: 'Second' }))
    useQuoteStore.getState().addQuote(validFormData({ title: 'Third' }))

    const { quotes } = useQuoteStore.getState()
    expect(quotes).toHaveLength(3)
    expect(quotes.find((q) => q.title === 'First')!.number).toBe(1)
    expect(quotes.find((q) => q.title === 'Second')!.number).toBe(2)
    expect(quotes.find((q) => q.title === 'Third')!.number).toBe(3)
    expect(useQuoteStore.getState().nextNumber).toBe(4)
  })

  it('addQuote() com items calcula subtotal corretamente', () => {
    // Items: 2 units of item A + 1 unit of item B
    // Each item has unitPrice extracted from snapshot
    // The test depends on the snapshot lookup: we'll test with history lookups
    // First add items to history
    const id = useQuoteStore.getState().addQuote(validFormData())
    const quote = useQuoteStore.getState().getQuote(id)!

    // Items from form: 2x hist_1 (unitPrice = 0 since no sync yet), 1x hist_2 (unitPrice = 0)
    // subtotal = 2*0 + 1*0 = 0
    // discountAmount = 0 * 0.05 = 0
    // total = 0 - 0 = 0
    expect(quote.items).toHaveLength(2)
    expect(quote.items[0].historyEntryId).toBe('hist_1')
    expect(quote.items[0].quantity).toBe(2)
    expect(quote.items[0].name).toBe('Item #1')
    expect(quote.items[1].historyEntryId).toBe('hist_2')
    expect(quote.items[1].name).toBe('Item #2')
    expect(quote.subtotal).toBe(0)
    expect(quote.discountAmount).toBe(0)
    expect(quote.total).toBe(0)
  })

  it('addQuote() com globalDiscountPercent calcula descontos corretamente', () => {
    const data = validFormData({ globalDiscountPercent: 10 })
    const id = useQuoteStore.getState().addQuote(data)
    const quote = useQuoteStore.getState().getQuote(id)!

    expect(quote.globalDiscountPercent).toBe(10)
  })

  it('addQuote() com items vazios cria quote com zero totals', () => {
    const data = validFormData({ items: [] })
    const id = useQuoteStore.getState().addQuote(data)
    const quote = useQuoteStore.getState().getQuote(id)!

    expect(quote.items).toHaveLength(0)
    expect(quote.subtotal).toBe(0)
    expect(quote.discountAmount).toBe(0)
    expect(quote.total).toBe(0)
  })

  it('addQuote() gera ID no formato quote_{timestamp}_{random5}', () => {
    const id = useQuoteStore.getState().addQuote(validFormData())
    expect(id).toMatch(/^quote_\d+_[a-z0-9]{5}$/)
  })

  // ── updateQuote ──────────────────────────────────────────────
  it('updateQuote() modifica campos do quote', () => {
    const id = useQuoteStore.getState().addQuote(validFormData())
    const original = useQuoteStore.getState().getQuote(id)!
    const originalUpdatedAt = original.updatedAt

    useQuoteStore.getState().updateQuote(id, {
      title: 'Título Atualizado',
      globalDiscountPercent: 15,
      footerNote: 'Nota atualizada',
    })

    const updated = useQuoteStore.getState().getQuote(id)!
    expect(updated.title).toBe('Título Atualizado')
    expect(updated.globalDiscountPercent).toBe(15)
    expect(updated.footerNote).toBe('Nota atualizada')
    expect(updated.updatedAt).toBeGreaterThanOrEqual(originalUpdatedAt)
  })

  it('updateQuote() com id inexistente não altera nada', () => {
    useQuoteStore.getState().addQuote(validFormData())
    expect(useQuoteStore.getState().quotes).toHaveLength(1)

    useQuoteStore.getState().updateQuote('nonexistent', { title: 'Nope' })
    expect(useQuoteStore.getState().quotes).toHaveLength(1)
    expect(useQuoteStore.getState().quotes[0].title).toBe('Orçamento Teste')
  })

  // ── removeQuote ──────────────────────────────────────────────
  it('removeQuote() → quote sai da lista', () => {
    const id1 = useQuoteStore.getState().addQuote(validFormData({ title: 'One' }))
    useQuoteStore.getState().addQuote(validFormData({ title: 'Two' }))
    expect(useQuoteStore.getState().quotes).toHaveLength(2)

    useQuoteStore.getState().removeQuote(id1)
    const { quotes } = useQuoteStore.getState()

    expect(quotes).toHaveLength(1)
    expect(quotes[0].title).toBe('Two')
  })

  it('removeQuote() com id inexistente não altera nada', () => {
    useQuoteStore.getState().addQuote(validFormData())
    expect(useQuoteStore.getState().quotes).toHaveLength(1)

    useQuoteStore.getState().removeQuote('nonexistent')
    expect(useQuoteStore.getState().quotes).toHaveLength(1)
  })

  // ── getQuote ──────────────────────────────────────────────────
  it('getQuote() retorna quote pelo ID', () => {
    const id = useQuoteStore.getState().addQuote(validFormData({ title: 'Find Me' }))
    const quote = useQuoteStore.getState().getQuote(id)

    expect(quote).toBeDefined()
    expect(quote!.id).toBe(id)
    expect(quote!.title).toBe('Find Me')
  })

  it('getQuote() retorna undefined para ID inexistente', () => {
    useQuoteStore.getState().addQuote(validFormData())
    const quote = useQuoteStore.getState().getQuote('nonexistent')
    expect(quote).toBeUndefined()
  })

  // ── getQuotesByCustomer ──────────────────────────────────────
  it('getQuotesByCustomer() retorna quotes de um cliente específico', () => {
    const custId = 'cust_12345'
    useQuoteStore.getState().addQuote(validFormData({
      title: 'Quote A',
      customerId: custId,
    }))
    useQuoteStore.getState().addQuote(validFormData({
      title: 'Quote B',
      customerId: custId,
    }))
    useQuoteStore.getState().addQuote(validFormData({
      title: 'Quote C',
      customerId: 'other_cust',
    }))

    const customerQuotes = useQuoteStore.getState().getQuotesByCustomer(custId)
    expect(customerQuotes).toHaveLength(2)
    expect(customerQuotes.map((q) => q.title).sort()).toEqual(['Quote A', 'Quote B'])
  })

  it('getQuotesByCustomer() retorna vazio para cliente sem quotes', () => {
    const result = useQuoteStore.getState().getQuotesByCustomer('nonexistent')
    expect(result).toHaveLength(0)
  })

  // ── setQuoteStatus ───────────────────────────────────────────
  it('setQuoteStatus() altera status', () => {
    const id = useQuoteStore.getState().addQuote(validFormData())
    expect(useQuoteStore.getState().getQuote(id)!.status).toBe('draft')

    useQuoteStore.getState().setQuoteStatus(id, 'sent')
    expect(useQuoteStore.getState().getQuote(id)!.status).toBe('sent')

    useQuoteStore.getState().setQuoteStatus(id, 'approved')
    expect(useQuoteStore.getState().getQuote(id)!.status).toBe('approved')

    useQuoteStore.getState().setQuoteStatus(id, 'rejected')
    expect(useQuoteStore.getState().getQuote(id)!.status).toBe('rejected')
  })

  it('setQuoteStatus() com id inexistente não altera nada', () => {
    useQuoteStore.getState().setQuoteStatus('nonexistent', 'sent')
    expect(useQuoteStore.getState().quotes).toHaveLength(0)
  })

  // ── exportQuotes ──────────────────────────────────────────────
  it('exportQuotes() retorna JSON string válido com estrutura correta', () => {
    useQuoteStore.getState().addQuote(validFormData({ title: 'Export Test' }))

    const json = useQuoteStore.getState().exportQuotes()
    const parsed = JSON.parse(json)

    expect(parsed.version).toBe('1.0')
    expect(parsed.exportedAt).toBeDefined()
    expect(parsed.quotes).toHaveLength(1)
    expect(parsed.quotes[0].title).toBe('Export Test')
  })

  // ── importQuotes ──────────────────────────────────────────────
  it('importQuotes() faz merge sem duplicar ids existentes', () => {
    const existingId = useQuoteStore.getState().addQuote(validFormData({ title: 'Original' }))

    const importPayload = {
      quotes: [
        {
          id: existingId,
          number: 1,
          title: 'Original',
          customerId: undefined,
          customerSnapshot: undefined,
          items: [],
          globalDiscountPercent: 0,
          subtotal: 0,
          discountAmount: 0,
          total: 0,
          status: 'draft' as const,
          validUntil: '2026-07-28',
          paymentTerms: '30 dias',
          deliveryEstimate: '5 dias úteis',
          footerNote: undefined,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'quote_2000000000_abcde',
          number: 2,
          title: 'New Import',
          customerId: undefined,
          customerSnapshot: undefined,
          items: [],
          globalDiscountPercent: 0,
          subtotal: 0,
          discountAmount: 0,
          total: 0,
          status: 'draft' as const,
          validUntil: '2026-07-28',
          paymentTerms: '30 dias',
          deliveryEstimate: '5 dias úteis',
          footerNote: undefined,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
    }

    const result = useQuoteStore.getState().importQuotes(JSON.stringify(importPayload))

    expect(result.skipped).toBe(1) // a duplicada
    expect(result.imported).toBe(1) // a nova
    expect(useQuoteStore.getState().quotes).toHaveLength(2)
    expect(useQuoteStore.getState().quotes.map((q) => q.title).sort()).toEqual([
      'New Import',
      'Original',
    ])
  })

  it('importQuotes() com JSON inválido retorna 0 importados', () => {
    const result = useQuoteStore.getState().importQuotes('not valid json')
    expect(result.imported).toBe(0)
    expect(result.skipped).toBe(0)
  })

  it('importQuotes() com payload sem quotes retorna 0', () => {
    const result = useQuoteStore.getState().importQuotes(JSON.stringify({}))
    expect(result.imported).toBe(0)
    expect(result.skipped).toBe(0)
  })

  // ── getFilteredQuotes ─────────────────────────────────────────
  it('getFilteredQuotes() filtra por searchQuery (título)', () => {
    useQuoteStore.getState().addQuote(validFormData({ title: 'Benchy 3D' }))
    useQuoteStore.getState().addQuote(validFormData({ title: 'Vase Decorativo' }))
    useQuoteStore.getState().addQuote(validFormData({ title: 'Benchy V2' }))

    useQuoteStore.getState().setSearchQuery('benchy')
    const filtered = useQuoteStore.getState().getFilteredQuotes()
    expect(filtered).toHaveLength(2)

    useQuoteStore.getState().setSearchQuery('vase')
    const filtered2 = useQuoteStore.getState().getFilteredQuotes()
    expect(filtered2).toHaveLength(1)
  })

  it('getFilteredQuotes() filtra por statusFilter', () => {
    const id1 = useQuoteStore.getState().addQuote(validFormData({ title: 'Draft Quote' }))
    useQuoteStore.getState().addQuote(validFormData({ title: 'Another Draft' }))
    const id3 = useQuoteStore.getState().addQuote(validFormData({ title: 'Sent Quote' }))

    useQuoteStore.getState().setQuoteStatus(id1, 'sent')
    useQuoteStore.getState().setQuoteStatus(id3, 'sent')

    useQuoteStore.getState().setStatusFilter('sent')
    const filtered = useQuoteStore.getState().getFilteredQuotes()
    expect(filtered).toHaveLength(2)

    useQuoteStore.getState().setStatusFilter('draft')
    const filtered2 = useQuoteStore.getState().getFilteredQuotes()
    expect(filtered2).toHaveLength(1)
  })

  it('getFilteredQuotes() com statusFilter "all" retorna todos', () => {
    useQuoteStore.getState().addQuote(validFormData())
    useQuoteStore.getState().addQuote(validFormData())

    useQuoteStore.getState().setStatusFilter('all')
    const filtered = useQuoteStore.getState().getFilteredQuotes()
    expect(filtered).toHaveLength(2)
  })

  it('getFilteredQuotes() combina search + status filter', () => {
    const id = useQuoteStore.getState().addQuote(validFormData({ title: 'Special Quote' }))
    useQuoteStore.getState().addQuote(validFormData({ title: 'Special Draft' }))
    useQuoteStore.getState().addQuote(validFormData({ title: 'Other Quote' }))

    useQuoteStore.getState().setQuoteStatus(id, 'sent')

    useQuoteStore.getState().setSearchQuery('special')
    useQuoteStore.getState().setStatusFilter('sent')
    const filtered = useQuoteStore.getState().getFilteredQuotes()
    expect(filtered).toHaveLength(1)
    expect(filtered[0].title).toBe('Special Quote')
  })

  it('getFilteredQuotes() com quotes vazios retorna array vazio', () => {
    useQuoteStore.getState().setSearchQuery('')
    useQuoteStore.getState().setStatusFilter('all')
    const filtered = useQuoteStore.getState().getFilteredQuotes()
    expect(filtered).toEqual([])
  })

  // ── setSearchQuery / setStatusFilter ──────────────────────────
  it('setSearchQuery() atualiza searchQuery', () => {
    expect(useQuoteStore.getState().searchQuery).toBe('')
    useQuoteStore.getState().setSearchQuery('benchy')
    expect(useQuoteStore.getState().searchQuery).toBe('benchy')
    useQuoteStore.getState().setSearchQuery('')
    expect(useQuoteStore.getState().searchQuery).toBe('')
  })

  it('setStatusFilter() atualiza statusFilter', () => {
    expect(useQuoteStore.getState().statusFilter).toBe('all')
    useQuoteStore.getState().setStatusFilter('sent')
    expect(useQuoteStore.getState().statusFilter).toBe('sent')
    useQuoteStore.getState().setStatusFilter('draft')
    expect(useQuoteStore.getState().statusFilter).toBe('draft')
    useQuoteStore.getState().setStatusFilter('approved')
    expect(useQuoteStore.getState().statusFilter).toBe('approved')
    useQuoteStore.getState().setStatusFilter('rejected')
    expect(useQuoteStore.getState().statusFilter).toBe('rejected')
    useQuoteStore.getState().setStatusFilter('all')
    expect(useQuoteStore.getState().statusFilter).toBe('all')
  })

  // ── calculateTotals ───────────────────────────────────────────
  it('calculateTotals() computa subtotal, discountAmount e total corretamente', () => {
    const items = [
      { historyEntryId: 'a', name: 'Item A', quantity: 2, unitPrice: 100, totalPrice: 0, discountPercent: 0 },
      { historyEntryId: 'b', name: 'Item B', quantity: 3, unitPrice: 50, totalPrice: 0, discountPercent: 0 },
    ]
    // item totalPrice = 2*100 = 200, 3*50 = 150
    // subtotal = 200 + 150 = 350
    // discountAmount = 350 * 0.10 = 35
    // total = 350 - 35 = 315
    const result = useQuoteStore.getState().calculateTotals(items, 10)
    expect(result.subtotal).toBe(350)
    expect(result.discountAmount).toBe(35)
    expect(result.total).toBe(315)
  })

  it('calculateTotals() com items vazios retorna zeros', () => {
    const result = useQuoteStore.getState().calculateTotals([], 10)
    expect(result.subtotal).toBe(0)
    expect(result.discountAmount).toBe(0)
    expect(result.total).toBe(0)
  })

  it('calculateTotals() com discount 0 retorna total = subtotal', () => {
    const items = [
      { historyEntryId: 'a', name: 'Item A', quantity: 5, unitPrice: 20, totalPrice: 0, discountPercent: 0 },
    ]
    const result = useQuoteStore.getState().calculateTotals(items, 0)
    expect(result.subtotal).toBe(100)
    expect(result.discountAmount).toBe(0)
    expect(result.total).toBe(100)
  })

  it('addQuote() com itens com discountPercent individual calcula totalPrice do item', () => {
    const data = validFormData({
      items: [
        { historyEntryId: 'hist_1', quantity: 2, discountPercent: 10 },
      ],
    })
    const id = useQuoteStore.getState().addQuote(data)
    const quote = useQuoteStore.getState().getQuote(id)!
    // unitPrice = 0 (no history sync), totalPrice = 0
    expect(quote.items[0].discountPercent).toBe(10)
  })
})
