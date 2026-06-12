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

  // ── NOVOS TESTES ────────────────────────────────────────────────

  it('addSpool() persiste dados corretamente com campos opcionais', () => {
    const data = makeSpool({
      brand: 'Overture',
      material: 'PETG',
      color: 'Blue',
      colorHex: '#0000ff',
      weightGrams: 750,
      originalWeightGrams: 1000,
      costPerKg: 150,
      diameterMm: 1.75,
      notes: 'Test note',
      status: 'on_the_way' as SpoolStatus,
      purchaseStore: 'Aliexpress',
    })
    useFilamentInventory.getState().addSpool(data)
    const { spools } = useFilamentInventory.getState()

    expect(spools).toHaveLength(1)
    expect(spools[0].brand).toBe('Overture')
    expect(spools[0].material).toBe('PETG')
    expect(spools[0].color).toBe('Blue')
    expect(spools[0].colorHex).toBe('#0000ff')
    expect(spools[0].weightGrams).toBe(750)
    expect(spools[0].originalWeightGrams).toBe(1000)
    expect(spools[0].costPerKg).toBe(150)
    expect(spools[0].diameterMm).toBe(1.75)
    expect(spools[0].notes).toBe('Test note')
    expect(spools[0].status).toBe('on_the_way')
    expect(spools[0].purchaseStore).toBe('Aliexpress')
  })

  it('removeSpool() com ID inexistente não afeta outros spools', () => {
    useFilamentInventory.getState().addSpool(makeSpool({ brand: 'A' }))
    useFilamentInventory.getState().addSpool(makeSpool({ brand: 'B' }))
    expect(useFilamentInventory.getState().spools).toHaveLength(2)

    useFilamentInventory.getState().removeSpool('non-existent-id')
    const { spools } = useFilamentInventory.getState()
    expect(spools).toHaveLength(2)
    expect(spools[0].brand).toBe('A')
    expect(spools[1].brand).toBe('B')
  })

  it('updateSpool() com ID inexistente não lança erro', () => {
    useFilamentInventory.getState().addSpool(makeSpool({ brand: 'KeepMe' }))
    expect(() => {
      useFilamentInventory.getState().updateSpool('non-existent', { brand: 'Changed' })
    }).not.toThrow()
    const { spools } = useFilamentInventory.getState()
    expect(spools).toHaveLength(1)
    expect(spools[0].brand).toBe('KeepMe')
  })

  it('deductWeight() com ID inexistente não lança erro', () => {
    useFilamentInventory.getState().addSpool(makeSpool({ weightGrams: 500 }))
    expect(() => {
      useFilamentInventory.getState().deductWeight('non-existent', 100)
    }).not.toThrow()
    const { spools } = useFilamentInventory.getState()
    expect(spools).toHaveLength(1)
    expect(spools[0].weightGrams).toBe(500)
  })

  it('removeSpool() em lista vazia não causa erro', () => {
    expect(() => {
      useFilamentInventory.getState().removeSpool('any-id')
    }).not.toThrow()
    expect(useFilamentInventory.getState().spools).toHaveLength(0)
  })

  it('getTotalWeight() com spools vazios retorna 0', () => {
    const total = useFilamentInventory.getState().getTotalWeight()
    expect(total).toBe(0)
  })

  it('getSpoolsByMaterial() sem matches retorna array vazio', () => {
    useFilamentInventory.getState().addSpool(makeSpool({ material: 'PLA' }))
    const result = useFilamentInventory.getState().getSpoolsByMaterial('NYLON')
    expect(result).toEqual([])
  })

  it('getLowStockSpools() com threshold 0 retorna array vazio (pesos são >= 0)', () => {
    useFilamentInventory.getState().addSpool(makeSpool({ weightGrams: 100 }))
    useFilamentInventory.getState().addSpool(makeSpool({ weightGrams: 0 }))
    const low = useFilamentInventory.getState().getLowStockSpools(0)
    expect(low).toHaveLength(0)
  })

  it('deductWeight() com 0 gramas não altera o peso', () => {
    useFilamentInventory.getState().addSpool(makeSpool({ weightGrams: 500 }))
    const id = useFilamentInventory.getState().spools[0].id

    useFilamentInventory.getState().deductWeight(id, 0)
    const { spools } = useFilamentInventory.getState()
    expect(spools[0].weightGrams).toBe(500)
  })

  it('updateSpool() só atualiza campos fornecidos (merge parcial)', () => {
    useFilamentInventory.getState().addSpool(makeSpool({
      brand: 'Original',
      material: 'PLA',
      color: 'Red',
      weightGrams: 1000,
      notes: 'original note',
    }))
    const id = useFilamentInventory.getState().spools[0].id

    // Atualiza apenas notes
    useFilamentInventory.getState().updateSpool(id, { notes: 'updated note' })

    const { spools } = useFilamentInventory.getState()
    // Campo atualizado
    expect(spools[0].notes).toBe('updated note')
    // Campos não fornecidos permanecem inalterados
    expect(spools[0].brand).toBe('Original')
    expect(spools[0].material).toBe('PLA')
    expect(spools[0].color).toBe('Red')
    expect(spools[0].weightGrams).toBe(1000)
  })

  it('addSpool() com valores negativos de peso não é rejeitado', () => {
    const data = makeSpool({ weightGrams: -100, originalWeightGrams: -200 })
    useFilamentInventory.getState().addSpool(data)
    const { spools } = useFilamentInventory.getState()
    expect(spools).toHaveLength(1)
    expect(spools[0].weightGrams).toBe(-100)
    expect(spools[0].originalWeightGrams).toBe(-200)
  })
})
