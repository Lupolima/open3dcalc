import type { CalculationInputs, CalculationResult, CostBreakdown } from '@/types'

export function calculateCosts(inputs: CalculationInputs): CalculationResult {
  const timeHours = inputs.timeMinutes / 60

  // 1. Material cost
  const materialCost = (inputs.useVolume && inputs.volume > 0)
    ? estimateMaterialFromVolume(inputs)
    : (inputs.weight / 1000) * inputs.material.avgPrice

  // 2. Energy cost
  const energyCost = (inputs.printer.power / 1000) * timeHours * inputs.energyRate

  // 3. Depreciation
  const depreciation = inputs.printer.usefulLife > 0
    ? (inputs.printer.value / inputs.printer.usefulLife) * timeHours
    : 0

  // 4. Maintenance
  const maintenance = inputs.printer.maintenancePerHour * timeHours

  // 5. Labor
  const labor = inputs.laborRate * timeHours

  // 6. Packaging
  const packaging = inputs.packagingCost

  // 7. Finishing
  const finishing = inputs.finishingCost

  const costs: CostBreakdown = {
    material: materialCost,
    energy: energyCost,
    depreciation,
    maintenance,
    labor,
    packaging,
    finishing,
    failureCost: 0,
  }

  const subtotal = materialCost + energyCost + depreciation + maintenance + labor + packaging + finishing

  // 8. Failure rate
  const failureCost = subtotal * (inputs.failureRate / 100)
  costs.failureCost = failureCost

  const totalWithFailure = subtotal + failureCost
  const unitCost = totalWithFailure / inputs.quantity

  // Marketplace fee
  const feePercent = inputs.marketplace.feePercent

  // Final price
  const basePrice = unitCost * (1 + inputs.markup / 100)
  const finalPrice = feePercent > 0
    ? (basePrice + inputs.marketplace.feeFixed) / (1 - feePercent / 100)
    : basePrice

  const marketplaceFeeTotal = (finalPrice * (feePercent / 100)) + inputs.marketplace.feeFixed
  const profit = finalPrice - unitCost - marketplaceFeeTotal
  const profitMargin = finalPrice > 0 ? (profit / finalPrice) * 100 : 0
  const roi = unitCost > 0 ? (profit / unitCost) * 100 : 0

  return {
    inputs,
    costs,
    subtotal,
    totalWithFailure,
    unitCost,
    marketplaceFee: marketplaceFeeTotal,
    marketplaceFeePercent: feePercent,
    finalPrice,
    profit,
    profitMargin,
    roi,
  }
}

function estimateMaterialFromVolume(inputs: CalculationInputs): number {
  const density = inputs.material.density
  const infillRatio = inputs.infillPercent / 100
  const purgeRatio = inputs.purgePercent / 100

  const effectiveVolume = inputs.volume * (0.2 + 0.8 * infillRatio)
  const weight = effectiveVolume * density
  const waste = weight * purgeRatio

  return ((weight + waste) / 1000) * inputs.material.avgPrice
}

export function createDefaultInputs(): CalculationInputs {
  return {
    productName: '',
    material: { id: 'pla', name: 'PLA', density: 1.24, avgPrice: 90, type: 'fdm' },
    weight: 0,
    volume: 0,
    useVolume: false,
    timeMinutes: 0,
    printer: {
      id: 'ender_3',
      name: 'Creality Ender 3',
      brand: 'Creality',
      power: 120,
      value: 1200,
      usefulLife: 2000,
      maintenancePerHour: 0.15,
    },
    energyRate: 0,
    laborRate: 0,
    packagingCost: 0,
    finishingCost: 0,
    failureRate: 0,
    markup: 0,
    marketplace: { id: 'direct', name: 'Venda Direta', feePercent: 0, feeFixed: 0, hasFreeShipping: false },
    quantity: 1,
    infillPercent: 20,
    purgePercent: 10,
  }
}
