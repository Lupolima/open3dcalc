import type {
  MaterialStateFDM, MaterialStateResin, PrintParameters,
  MachineCosts, LaborCosts, AdditionalCosts, SalesParameters,
  OperationalCosts, SoftwareCosts, FDMHardware, FDMFinishing,
  PostProcessingResin, ResinHardware, CalculationResult,
} from '@/types'

export function calculateFDM(
  mat: MaterialStateFDM,
  print: PrintParameters,
  machine: MachineCosts,
  labor: LaborCosts,
  extras: AdditionalCosts,
  sales: SalesParameters,
  ops: OperationalCosts,
  soft: SoftwareCosts,
  fdmHW: FDMHardware,
  fdmFin: FDMFinishing,
): CalculationResult {
  const efficiencyFactor = mat.spoolEfficiency > 0 ? (100 / mat.spoolEfficiency) : 1
  const totalWeightFDM = mat.weightUsed + mat.purgeWeight
  const effectiveWeight = totalWeightFDM * efficiencyFactor
  const matCost = (effectiveWeight / 1000) * mat.costPerKg

  const printerEnergyCost = (print.printerPowerWatts / 1000) * print.printTimeHours * print.energyCostPerKwh

  let postProcessingTotal = 0
  if (fdmFin.enabled) {
    postProcessingTotal += fdmFin.suppliesCost
  }

  let machineTotal = 0
  if (machine.enabled) {
    const totalLifeHours = machine.depreciationMonths * machine.hoursPerMonth
    const hourlyDepreciation = totalLifeHours > 0 ? machine.machineCost / totalLifeHours : 0
    let hourlyMaintenance = 0
    if (machine.maintenanceEnabled) {
      hourlyMaintenance = machine.hoursPerMonth > 0 ? machine.maintenanceCost / machine.hoursPerMonth : 0
    }
    machineTotal = (hourlyDepreciation + hourlyMaintenance) * print.printTimeHours
  }

  let hardwareTotal = 0
  if (fdmHW.enabled) {
    let nozzleDepreciation = 0
    if (fdmHW.nozzleEnabled) {
      nozzleDepreciation = fdmHW.nozzleLifespanKg > 0
        ? (totalWeightFDM / 1000) / fdmHW.nozzleLifespanKg * fdmHW.nozzleCost
        : 0
    }
    let bedCost = 0
    if (fdmHW.bedEnabled) {
      bedCost = fdmHW.bedAdhesionCost
    }
    hardwareTotal = nozzleDepreciation + bedCost
  }

  const ppeCost = ops.enabled ? ops.ppeCostPerPrint : 0

  let laborTotal = 0
  if (labor.enabled) {
    const totalMinutes = labor.setupTimeMinutes + labor.postProcessingTimeMinutes
    laborTotal = (totalMinutes / 60) * labor.hourlyRate
  }

  let softwareTotal = 0
  if (soft.enabled) {
    const softwareHourly = machine.hoursPerMonth > 0 ? soft.slicerMonthlyCost / machine.hoursPerMonth : 0
    softwareTotal = (softwareHourly * print.printTimeHours) + soft.modelFileCost
  }

  const producitonCost = matCost + printerEnergyCost + machineTotal + hardwareTotal + ppeCost + laborTotal + softwareTotal + postProcessingTotal + extras.extrasCost

  let failureCost = 0
  if (print.failureMode === 'percent') {
    const adjustedPercent = print.failureValue * (print.riskMultiplier ?? 1)
    failureCost = producitonCost * (adjustedPercent / 100)
  } else if (print.failureMode === 'fixed') {
    failureCost = print.failureValue
  }

  const totalBaseCost = producitonCost + failureCost + sales.packagingCost + sales.shippingCost

  const profitAmountRaw = totalBaseCost * (sales.profitMarginPercent / 100)
  const priceBeforeFees = totalBaseCost + profitAmountRaw

  const totalFeePercent = (sales.taxPercent + sales.marketplaceFeePercent) / 100

  const sellPrice = totalFeePercent < 1
    ? priceBeforeFees / (1 - totalFeePercent)
    : priceBeforeFees * 2

  const taxAmount = sellPrice * (sales.taxPercent / 100)
  const marketplaceFee = sellPrice * (sales.marketplaceFeePercent / 100)
  const totalProfit = sellPrice - totalBaseCost - taxAmount - marketplaceFee

  return {
    materialCost: matCost,
    energyCost: printerEnergyCost,
    postProcessingCost: postProcessingTotal,
    machineCost: machineTotal,
    hardwareCost: hardwareTotal,
    consumablesCost: ppeCost,
    softwareCost: softwareTotal,
    laborCost: laborTotal,
    failureCost,
    extrasCost: extras.extrasCost,
    subtotal: producitonCost,
    totalCost: totalBaseCost,
    sellPrice,
    profit: totalProfit,
    marketplaceFee,
    taxAmount,
    costPerGram: effectiveWeight > 0 ? matCost / effectiveWeight : 0,
    costPerUnit: totalBaseCost,
    unitWeight: effectiveWeight,
    estimatedPrintTime: print.printTimeHours,
    targetMarginPercent: sales.profitMarginPercent,
    breakEvenPrice: totalBaseCost,
  }
}

export function calculateResin(
  mat: MaterialStateResin,
  print: PrintParameters,
  machine: MachineCosts,
  labor: LaborCosts,
  extras: AdditionalCosts,
  sales: SalesParameters,
  ops: OperationalCosts,
  soft: SoftwareCosts,
  resinPP: PostProcessingResin,
  resinHW: ResinHardware,
): CalculationResult {
  const volumeWithWaste = mat.volumeUsedMl * (1 + (mat.wasteMarginPercent / 100))
  const matCost = (volumeWithWaste / 1000) * mat.costPerLiter

  const printerEnergyCost = (print.printerPowerWatts / 1000) * print.printTimeHours * print.energyCostPerKwh

  let postProcessingTotal = 0
  if (resinPP.washingEnabled) {
    postProcessingTotal += resinPP.alcoholVolumeLiters * resinPP.alcoholCostPerLiter
  }
  if (resinPP.curingEnabled) {
    const curingKwh = (resinPP.curingPowerWatts / 1000) * (resinPP.curingTimeMinutes / 60)
    postProcessingTotal += curingKwh * print.energyCostPerKwh
  }

  let machineTotal = 0
  if (machine.enabled) {
    const totalLifeHours = machine.depreciationMonths * machine.hoursPerMonth
    const hourlyDepreciation = totalLifeHours > 0 ? machine.machineCost / totalLifeHours : 0
    let hourlyMaintenance = 0
    if (machine.maintenanceEnabled) {
      hourlyMaintenance = machine.hoursPerMonth > 0 ? machine.maintenanceCost / machine.hoursPerMonth : 0
    }
    machineTotal = (hourlyDepreciation + hourlyMaintenance) * print.printTimeHours
  }

  let hardwareTotal = 0
  if (resinHW.enabled) {
    const lcdHourly = resinHW.lcdLifespanHours > 0 ? resinHW.lcdCost / resinHW.lcdLifespanHours : 0
    const lcdCost = lcdHourly * print.printTimeHours
    const fepPerPrint = resinHW.fepLifespanPrints > 0 ? resinHW.fepCost / resinHW.fepLifespanPrints : 0
    hardwareTotal = lcdCost + fepPerPrint
  }

  const ppeCost = ops.enabled ? ops.ppeCostPerPrint : 0

  let laborTotal = 0
  if (labor.enabled) {
    const totalMinutes = labor.setupTimeMinutes + labor.postProcessingTimeMinutes
    laborTotal = (totalMinutes / 60) * labor.hourlyRate
  }

  let softwareTotal = 0
  if (soft.enabled) {
    const softwareHourly = machine.hoursPerMonth > 0 ? soft.slicerMonthlyCost / machine.hoursPerMonth : 0
    softwareTotal = (softwareHourly * print.printTimeHours) + soft.modelFileCost
  }

  const producitonCost = matCost + printerEnergyCost + machineTotal + hardwareTotal + ppeCost + laborTotal + softwareTotal + postProcessingTotal + extras.extrasCost

  let failureCost = 0
  if (print.failureMode === 'percent') {
    const adjustedPercent = print.failureValue * (print.riskMultiplier ?? 1)
    failureCost = producitonCost * (adjustedPercent / 100)
  } else if (print.failureMode === 'fixed') {
    failureCost = print.failureValue
  }

  const totalBaseCost = producitonCost + failureCost + sales.packagingCost + sales.shippingCost

  const profitAmountRaw = totalBaseCost * (sales.profitMarginPercent / 100)
  const priceBeforeFees = totalBaseCost + profitAmountRaw

  const totalFeePercent = (sales.taxPercent + sales.marketplaceFeePercent) / 100

  const sellPrice = totalFeePercent < 1
    ? priceBeforeFees / (1 - totalFeePercent)
    : priceBeforeFees * 2

  const taxAmount = sellPrice * (sales.taxPercent / 100)
  const marketplaceFee = sellPrice * (sales.marketplaceFeePercent / 100)
  const totalProfit = sellPrice - totalBaseCost - taxAmount - marketplaceFee

  return {
    materialCost: matCost,
    energyCost: printerEnergyCost,
    postProcessingCost: postProcessingTotal,
    machineCost: machineTotal,
    hardwareCost: hardwareTotal,
    consumablesCost: ppeCost,
    softwareCost: softwareTotal,
    laborCost: laborTotal,
    failureCost,
    extrasCost: extras.extrasCost,
    subtotal: producitonCost,
    totalCost: totalBaseCost,
    sellPrice,
    profit: totalProfit,
    marketplaceFee,
    taxAmount,
    costPerGram: matCost > 0 && volumeWithWaste > 0 ? matCost / (volumeWithWaste * mat.density) : 0,
    costPerUnit: totalBaseCost,
    unitWeight: volumeWithWaste * mat.density,
    estimatedPrintTime: print.printTimeHours,
    targetMarginPercent: sales.profitMarginPercent,
    breakEvenPrice: totalBaseCost,
  }
}
