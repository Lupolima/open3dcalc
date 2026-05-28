import { describe, it, expect, beforeEach } from 'vitest'
import { useHistoryStore } from '../historyStore'
import type { HistoryEntry } from '@/types'

/** Helper to build a minimal HistoryEntry-like payload for addEntry */
function entryData(overrides: Partial<HistoryEntry> = {}) {
  return {
    type: 'fdm' as const,
    name: 'Test Entry',
    summary: 'A test calculation',
    totalCost: 25.50,
    sellPrice: 50.00,
    profit: 24.50,
    result: {
      materialCost: 5, energyCost: 2, machineCost: 1, hardwareCost: 1,
      consumablesCost: 0, laborCost: 0, softwareCost: 0, failureCost: 0,
      extrasCost: 0, postProcessingCost: 0,
      subtotal: 9, totalCost: 25.50, sellPrice: 50.00, profit: 24.50,
      marketplaceFee: 0, taxAmount: 0, costPerGram: 0, costPerUnit: 0,
      unitWeight: 50, estimatedPrintTime: 5, targetMarginPercent: 50,
      breakEvenPrice: 0, actualMargin: 49,
    },
    snapshot: null,
    ...overrides,
  }
}

describe('useHistoryStore (integration)', () => {
  beforeEach(() => {
    localStorage.clear()
    // Reset the store to clean defaults
    useHistoryStore.setState({
      entries: [],
      search: '',
      sortBy: 'date',
      sortOrder: 'desc',
      filterType: 'all',
    })
  })

  // ── addEntry ──────────────────────────────────────────────────
  it('addEntry() → entry aparece na lista', () => {
    const id = useHistoryStore.getState().addEntry(entryData({ name: 'My Print' }))
    const { entries } = useHistoryStore.getState()

    expect(entries).toHaveLength(1)
    expect(entries[0].id).toBe(id)
    expect(entries[0].name).toBe('My Print')
    expect(entries[0].totalCost).toBe(25.50)
  })

  // ── removeEntry ───────────────────────────────────────────────
  it('removeEntry() → entry sai da lista', () => {
    const id1 = useHistoryStore.getState().addEntry(entryData({ name: 'One' }))
    useHistoryStore.getState().addEntry(entryData({ name: 'Two' }))
    expect(useHistoryStore.getState().entries).toHaveLength(2)

    useHistoryStore.getState().removeEntry(id1)
    const { entries } = useHistoryStore.getState()

    expect(entries).toHaveLength(1)
    expect(entries[0].name).toBe('Two')
  })

  // ── getFilteredEntries - filtro por tipo FDM ──────────────────
  it('getFilteredEntries() filtra por tipo "fdm"', () => {
    useHistoryStore.getState().addEntry(entryData({ type: 'fdm', name: 'FDM-1' }))
    useHistoryStore.getState().addEntry(entryData({ type: 'fdm', name: 'FDM-2' }))
    useHistoryStore.getState().addEntry(entryData({ type: 'resin', name: 'Resin-1' }))

    useHistoryStore.getState().setFilterType('fdm')
    const filtered = useHistoryStore.getState().getFilteredEntries()

    expect(filtered).toHaveLength(2)
    filtered.forEach((e) => expect(e.type).toBe('fdm'))
  })

  // ── getFilteredEntries - ordenação por data ───────────────────
  it('getFilteredEntries() ordena por data asc/desc', () => {
    const now = Date.now()
    // addEntry gera timestamp próprio, mas podemos usar o campo timestamp no override
    useHistoryStore.getState().addEntry(entryData({ timestamp: now - 5000, name: 'Old' }))
    useHistoryStore.getState().addEntry(entryData({ timestamp: now, name: 'New' }))

    // Ordenação default = desc (mais recente primeiro)
    useHistoryStore.getState().setSortBy('date')
    useHistoryStore.getState().setSortOrder('desc')
    let filtered = useHistoryStore.getState().getFilteredEntries()
    expect(filtered[0].name).toBe('New')
    expect(filtered[1].name).toBe('Old')

    // Inverter para asc
    useHistoryStore.getState().setSortOrder('asc')
    filtered = useHistoryStore.getState().getFilteredEntries()
    expect(filtered[0].name).toBe('Old')
    expect(filtered[1].name).toBe('New')
  })

  // ── getFilteredEntries - ordenação por preço ──────────────────
  it('getFilteredEntries() ordena por sellPrice', () => {
    useHistoryStore.getState().addEntry(entryData({ sellPrice: 100, name: 'Caríssimo' }))
    useHistoryStore.getState().addEntry(entryData({ sellPrice: 30, name: 'Barato' }))
    useHistoryStore.getState().addEntry(entryData({ sellPrice: 50, name: 'Médio' }))

    useHistoryStore.getState().setSortBy('price')
    useHistoryStore.getState().setSortOrder('asc')
    const asc = useHistoryStore.getState().getFilteredEntries()
    expect(asc[0].name).toBe('Barato')
    expect(asc[1].name).toBe('Médio')
    expect(asc[2].name).toBe('Caríssimo')

    useHistoryStore.getState().setSortOrder('desc')
    const desc = useHistoryStore.getState().getFilteredEntries()
    expect(desc[0].name).toBe('Caríssimo')
    expect(desc[2].name).toBe('Barato')
  })

  // ── exportJson ────────────────────────────────────────────────
  it('exportJson() → retorna JSON string válido com estrutura correta', () => {
    useHistoryStore.getState().addEntry(entryData({ name: 'Export Test' }))

    const json = useHistoryStore.getState().exportJson()
    const parsed = JSON.parse(json)

    expect(parsed.version).toBe('2.0')
    expect(parsed.exportedAt).toBeDefined()
    expect(parsed.entries).toHaveLength(1)
    expect(parsed.entries[0].name).toBe('Export Test')
  })

  // ── importJson - merge inteligente ────────────────────────────
  it('importJson() faz merge sem duplicar ids existentes', () => {
    // Adiciona uma entrada existente
    const existingId = useHistoryStore.getState().addEntry(entryData({ name: 'Original' }))

    // Prepara JSON de importação com a mesma entrada (mesmo id) + uma nova
    const importPayload = {
      entries: [
        { ...entryData({ name: 'Original' }), id: existingId },
        { ...entryData({ name: 'New Import' }), id: undefined },
      ],
    }
    // Anexa IDs aos entries do payload
    importPayload.entries[0].id = existingId

    const result = useHistoryStore.getState().importJson(JSON.stringify(importPayload))

    expect(result.skipped).toBe(1) // a duplicada
    expect(result.imported).toBe(1) // a nova
    expect(useHistoryStore.getState().entries).toHaveLength(2)
  })

  // ── importJson - JSON inválido ────────────────────────────────
  it('importJson() com JSON inválido retorna 0 importados', () => {
    const result = useHistoryStore.getState().importJson('not valid json')
    expect(result.imported).toBe(0)
    expect(result.skipped).toBe(0)
  })

  // ── clearHistory ──────────────────────────────────────────────
  it('clearHistory() → limpa todas as entradas', () => {
    useHistoryStore.getState().addEntry(entryData({ name: 'A' }))
    useHistoryStore.getState().addEntry(entryData({ name: 'B' }))
    useHistoryStore.getState().addEntry(entryData({ name: 'C' }))
    expect(useHistoryStore.getState().entries).toHaveLength(3)

    useHistoryStore.getState().clearHistory()
    expect(useHistoryStore.getState().entries).toHaveLength(0)
  })

  // ── getFilteredEntries - filtro por search ──────────────────
  it('getFilteredEntries() filtra por texto de busca', () => {
    useHistoryStore.getState().addEntry(entryData({ name: 'Benchy Boat', summary: '3D benchy' }))
    useHistoryStore.getState().addEntry(entryData({ name: 'Vase', summary: 'decorative vase' }))
    useHistoryStore.getState().addEntry(entryData({ name: 'Benchy v2', summary: 'improved benchy' }))

    useHistoryStore.getState().setSearch('benchy')
    const filtered = useHistoryStore.getState().getFilteredEntries()
    expect(filtered).toHaveLength(2)
  })
})
