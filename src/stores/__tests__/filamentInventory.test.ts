import { describe, it, expect, beforeEach } from 'vitest'
import { useFilamentInventory, type FilamentSpool, type SpoolStatus } from '../filamentInventory'

function makeSpool(overrides: Partial<FilamentSpool> = {}): Omit<FilamentSpool, 'id' | 'dateAdded'> {
  return {
    brand: 'TestBrand',
    material: 'PLA',
    color: 'Red',
    colorHex: '#ff0000',
    weightGrams: 1000,
    originalWeightGrams: 1000,
    costPerKg: 120,
    diameterMm: 1.75,
    notes: '',
    status: 'in_stock' as SpoolStatus,
    purchaseStore: 'Amazon',
    ...overrides,
  }
}

describe('useFilamentInventory (integration)', () => {
  beforeEach(() => {
    localStorage.clear()
    // Reset the store to a clean empty state
    useFilamentInventory.setState({ spools: [] })
  })

  // ── addSpool ──────────────────────────────────────────────────
  it('addSpool() → spool aparece na lista com id e dateAdded', () => {
    const data = makeSpool({ brand: 'eSun', material: 'ABS', weightGrams: 800 })
    useFilamentInventory.getState().addSpool(data)

    const { spools } = useFilamentInventory.getState()
    expect(spools).toHaveLength(1)
    expect(spools[0].brand).toBe('eSun')
    expect(spools[0].material).toBe('ABS')
    expect(spools[0].weightGrams).toBe(800)
    expect(spools[0].id).toBeDefined()
    expect(spools[0].dateAdded).toBeGreaterThan(0)
  })

  // ── deductWeight ──────────────────────────────────────────────
  it('deductWeight() → reduz weightGrams', () => {
    const data = makeSpool({ weightGrams: 500 })
    useFilamentInventory.getState().addSpool(data)
    const { spools: spoolsAfterAdd } = useFilamentInventory.getState()
    const id = spoolsAfterAdd[0].id

    useFilamentInventory.getState().deductWeight(id, 150)
    const { spools } = useFilamentInventory.getState()

    expect(spools[0].weightGrams).toBe(350)
  })

  // ── deductWeight não abaixo de zero ──────────────────────────
  it('deductWeight() não permite weightGrams < 0', () => {
    const data = makeSpool({ weightGrams: 100 })
    useFilamentInventory.getState().addSpool(data)
    const id = useFilamentInventory.getState().spools[0].id

    useFilamentInventory.getState().deductWeight(id, 999)
    const { spools } = useFilamentInventory.getState()

    expect(spools[0].weightGrams).toBe(0)
  })

  // ── getLowStockSpools ─────────────────────────────────────────
  it('getLowStockSpools(200) → retorna apenas spools com weightGrams < 200', () => {
    useFilamentInventory.getState().addSpool(makeSpool({ weightGrams: 150 }))  // low
    useFilamentInventory.getState().addSpool(makeSpool({ weightGrams: 500 }))  // ok
    useFilamentInventory.getState().addSpool(makeSpool({ weightGrams: 50 }))   // low
    useFilamentInventory.getState().addSpool(makeSpool({ weightGrams: 200 }))  // not < 200

    const low = useFilamentInventory.getState().getLowStockSpools(200)
    expect(low).toHaveLength(2)
    low.forEach((s) => {
      expect(s.weightGrams).toBeLessThan(200)
    })
  })

  // ── updateSpool ───────────────────────────────────────────────
  it('updateSpool() → atualiza campos parciais sem afetar outros', () => {
    useFilamentInventory.getState().addSpool(makeSpool({ brand: 'OOriginal', notes: 'original' }))
    const id = useFilamentInventory.getState().spools[0].id

    useFilamentInventory.getState().updateSpool(id, { brand: 'Updated', notes: 'modified' })
    const { spools } = useFilamentInventory.getState()

    expect(spools[0].brand).toBe('Updated')
    expect(spools[0].notes).toBe('modified')
    // Campos não atualizados permanecem
    expect(spools[0].material).toBe('PLA')
    expect(spools[0].weightGrams).toBe(1000)
  })

  // ── removeSpool ───────────────────────────────────────────────
  it('removeSpool() → spool sai da lista', () => {
    useFilamentInventory.getState().addSpool(makeSpool({ brand: 'RemoveMe' }))
    useFilamentInventory.getState().addSpool(makeSpool({ brand: 'KeepMe' }))
    expect(useFilamentInventory.getState().spools).toHaveLength(2)

    const id = useFilamentInventory.getState().spools[0].id
    useFilamentInventory.getState().removeSpool(id)

    const { spools } = useFilamentInventory.getState()
    expect(spools).toHaveLength(1)
    expect(spools[0].brand).toBe('KeepMe')
  })

  // ── getTotalWeight ────────────────────────────────────────────
  it('getTotalWeight() → soma correta dos pesos', () => {
    useFilamentInventory.getState().addSpool(makeSpool({ weightGrams: 200 }))
    useFilamentInventory.getState().addSpool(makeSpool({ weightGrams: 300 }))
    useFilamentInventory.getState().addSpool(makeSpool({ weightGrams: 500 }))

    const total = useFilamentInventory.getState().getTotalWeight()
    expect(total).toBe(1000)
  })

  // ── getSpoolsByMaterial ───────────────────────────────────────
  it('getSpoolsByMaterial() → filtra por material (case-insensitive)', () => {
    useFilamentInventory.getState().addSpool(makeSpool({ material: 'PLA', brand: 'A' }))
    useFilamentInventory.getState().addSpool(makeSpool({ material: 'ABS', brand: 'B' }))
    useFilamentInventory.getState().addSpool(makeSpool({ material: 'pla', brand: 'C' })) // lowercase

    const plaSpools = useFilamentInventory.getState().getSpoolsByMaterial('PLA')
    expect(plaSpools).toHaveLength(2)
    expect(plaSpools.map((s) => s.brand).sort()).toEqual(['A', 'C'])
  })
})
