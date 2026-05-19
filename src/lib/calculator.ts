import type { CalculationInputs, CalculationResult, CostBreakdown } from '@/types'

export function calculateCosts(inputs: CalculationInputs): CalculationResult {
  const timeHours = inputs.timeMinutes / 60
  const qty = Math.max(1, inputs.quantity)

  // 1. Material
  const materialCost = (inputs.useVolume && inputs.volume > 0)
    ? estimateMaterialFromVolume(inputs)
    : (inputs.weight / 1000) * inputs.material.avgPrice

  // 2. Energy
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
  const packaging = inputs.packagingCost * qty

  // 7. Finishing
  const finishing = inputs.finishingCost * qty

  // 8. Shipping
  const shipping = inputs.shippingCost * qty

  const costs: CostBreakdown = {
    material: materialCost,
    energy: energyCost,
    depreciation,
    maintenance,
    labor,
    packaging,
    finishing,
    failureCost: 0,
    shipping,
    tax: 0,
    cardFee: 0,
  }

  const subtotal = materialCost + energyCost + depreciation + maintenance + labor + packaging + finishing + shipping

  // 9. Failure rate
  const failureCost = subtotal * (inputs.failureRate / 100)
  costs.failureCost = failureCost

  const totalWithFailure = subtotal + failureCost
  const unitCost = totalWithFailure / qty

  // 10. Markup base price
  const basePrice = unitCost * (1 + inputs.markup / 100)

  // 11. Marketplace fee
  const feePercent = inputs.marketplace.feePercent
  const marketplaceFee = feePercent > 0
    ? (basePrice + inputs.marketplace.feeFixed) / (1 - feePercent / 100) * (feePercent / 100) + inputs.marketplace.feeFixed
    : 0

  // 12. Final price (includes marketplace fee)
  const priceWithMarketplace = feePercent > 0
    ? (basePrice + inputs.marketplace.feeFixed) / (1 - feePercent / 100)
    : basePrice

  // 13. Taxes + card fee on final price
  const tax = priceWithMarketplace * (inputs.taxRate / 100)
  const cardFee = priceWithMarketplace * (inputs.cardFeePercent / 100)

  costs.tax = tax
  costs.cardFee = cardFee

  const finalPrice = priceWithMarketplace + tax + cardFee
  const marketplaceFeeTotal = marketplaceFee
  const profit = finalPrice - unitCost - marketplaceFeeTotal - tax - cardFee
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
  const infillRatio = inputs.infillPercent / 100
  const purgeRatio = inputs.purgePercent / 100
  const effectiveVolume = inputs.volume * (0.2 + 0.8 * infillRatio)
  const weight = effectiveVolume * inputs.material.density
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
    shippingCost: 0,
    taxRate: 0,
    cardFeePercent: 0,
  }
}
