export type MaterialType =
  | 'pla' | 'pla_silk' | 'pla_plus' | 'petg' | 'abs' | 'asa'
  | 'tpu_85a' | 'tpu_95a' | 'nylon_pa6' | 'nylon_pa12' | 'pc'
  | 'pc_abs' | 'pla_cf' | 'petg_cf' | 'nylon_cf' | 'pla_wood'
  | 'pla_metal' | 'hips' | 'pva' | 'pp' | 'peek' | 'peek_cf' | 'ultem'

export interface Material {
  id: MaterialType
  name: string
  density: number // g/cm³
  avgPrice: number // R$/kg
  type: 'fdm' | 'resin'
}

export interface PrinterProfile {
  id: string
  name: string
  brand: string
  power: number // watts
  value: number // R$
  usefulLife: number // hours
  maintenancePerHour: number // R$/h
  image?: string
}

export interface Marketplace {
  id: string
  name: string
  feePercent: number
  feeFixed: number // R$
  hasFreeShipping: boolean
  shippingFeePercent?: number
}

export interface CalculationInputs {
  productName: string
  material: Material
  weight: number // grams
  volume: number // cm³
  useVolume: boolean
  timeMinutes: number
  printer: PrinterProfile
  energyRate: number // R$/kWh
  laborRate: number // R$/h
  packagingCost: number
  finishingCost: number
  failureRate: number // %
  markup: number // %
  marketplace: Marketplace
  quantity: number
  infillPercent: number
  purgePercent: number
}

export interface CostBreakdown {
  material: number
  energy: number
  depreciation: number
  maintenance: number
  labor: number
  packaging: number
  finishing: number
  failureCost: number
}

export interface CalculationResult {
  inputs: CalculationInputs
  costs: CostBreakdown
  subtotal: number
  totalWithFailure: number
  unitCost: number
  marketplaceFee: number
  marketplaceFeePercent: number
  finalPrice: number
  profit: number
  profitMargin: number
  roi: number
}

export interface SavedProduct {
  id: number
  name: string
  date: string
  result: CalculationResult
}

export type Language = 'pt-BR' | 'en-US'
