import { describe, it, expect } from 'vitest'
import { calculateCosts, createDefaultInputs } from '@/lib/calculator'

function zeroedInputs() {
  const inputs = createDefaultInputs()
  inputs.printer = { ...inputs.printer, value: 0, power: 0, maintenancePerHour: 0 }
  inputs.energyRate = 0
  inputs.laborRate = 0
  inputs.packagingCost = 0
  inputs.finishingCost = 0
  inputs.failureRate = 0
  return inputs
}

describe('calculateCosts', () => {
  it('returns zero for empty inputs', () => {
    const inputs = zeroedInputs()
    const result = calculateCosts(inputs)
    expect(result.totalWithFailure).toBe(0)
    expect(result.finalPrice).toBe(0)
  })

  it('calculates material cost correctly', () => {
    const inputs = zeroedInputs()
    inputs.weight = 100
    inputs.material.avgPrice = 100
    inputs.timeMinutes = 60
    inputs.markup = 0

    const result = calculateCosts(inputs)
    expect(result.costs.material).toBe(10)
    expect(result.subtotal).toBe(10)
  })

  it('calculates energy cost correctly', () => {
    const inputs = zeroedInputs()
    inputs.timeMinutes = 120
    inputs.printer.power = 200
    inputs.energyRate = 0.5

    const result = calculateCosts(inputs)
    expect(result.costs.energy).toBeCloseTo(0.20, 2)
  })

  it('applies failure rate correctly', () => {
    const inputs = zeroedInputs()
    inputs.weight = 100
    inputs.material.avgPrice = 100
    inputs.timeMinutes = 60
    inputs.failureRate = 50

    const result = calculateCosts(inputs)
    expect(result.costs.material).toBe(10)
    expect(result.costs.failureCost).toBe(5)
    expect(result.totalWithFailure).toBe(15)
  })

  it('calculates final price with direct sale', () => {
    const inputs = zeroedInputs()
    inputs.weight = 100
    inputs.material.avgPrice = 100
    inputs.timeMinutes = 60
    inputs.markup = 100

    const result = calculateCosts(inputs)
    expect(result.unitCost).toBe(10)
    expect(result.finalPrice).toBe(20)
    expect(result.profit).toBe(10)
  })

  it('calculates correctly with Shopee marketplace fee', () => {
    const inputs = zeroedInputs()
    inputs.weight = 100
    inputs.material.avgPrice = 100
    inputs.timeMinutes = 60
    inputs.markup = 100
    inputs.marketplace = { id: 'shopee', name: 'Shopee', feePercent: 14, feeFixed: 4, hasFreeShipping: true }

    const result = calculateCosts(inputs)
    expect(result.unitCost).toBe(10)
    expect(result.finalPrice).toBeCloseTo(27.91, 1)
    expect(result.marketplaceFeePercent).toBe(14)
  })

  it('calculates depreciation correctly', () => {
    const inputs = zeroedInputs()
    inputs.timeMinutes = 120
    inputs.printer.value = 5000
    inputs.printer.usefulLife = 2000

    const result = calculateCosts(inputs)
    expect(result.costs.depreciation).toBe(5) // (5000/2000) * 2 = 5
  })
})
