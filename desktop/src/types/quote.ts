export interface QuoteItem {
  historyEntryId: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  discountPercent: number
}

export interface Quote {
  id: string
  number: number
  title: string
  customerId?: string
  customerSnapshot?: {
    name: string
    company?: string
    email?: string
    phone?: string
  }
  items: QuoteItem[]
  globalDiscountPercent: number
  subtotal: number
  discountAmount: number
  total: number
  status: 'draft' | 'sent' | 'approved' | 'rejected'
  validUntil: string
  paymentTerms: string
  deliveryEstimate: string
  footerNote?: string
  createdAt: number
  updatedAt: number
  exportedAt?: number
}

export interface QuoteFormData {
  title: string
  customerId?: string
  items: Array<{
    historyEntryId: string
    quantity: number
    discountPercent: number
  }>
  globalDiscountPercent: number
  validUntil: string
  paymentTerms: string
  deliveryEstimate: string
  footerNote?: string
}
