import type { Marketplace } from '@/types'

export const marketplaces: Marketplace[] = [
  { id: 'direct', name: 'Venda Direta', feePercent: 0, feeFixed: 0, hasFreeShipping: false },
  { id: 'shopee', name: 'Shopee', feePercent: 14, feeFixed: 4, hasFreeShipping: true, shippingFeePercent: 0 },
  { id: 'mercadolivre', name: 'Mercado Livre', feePercent: 16, feeFixed: 6, hasFreeShipping: true, shippingFeePercent: 0 },
  { id: 'amazon', name: 'Amazon', feePercent: 15, feeFixed: 0, hasFreeShipping: false },
  { id: 'etsy', name: 'Etsy', feePercent: 6.5, feeFixed: 3, hasFreeShipping: false },
]

export function getMarketplace(id: string): Marketplace {
  return marketplaces.find(m => m.id === id) ?? marketplaces[0]
}

export function calculateMarketplaceFee(price: number, market: Marketplace): { fee: number; feePercent: number } {
  const percentFee = price * (market.feePercent / 100)
  const totalFee = percentFee + market.feeFixed
  return { fee: totalFee, feePercent: market.feePercent }
}
