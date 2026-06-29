export interface Customer {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  createdAt: number
  updatedAt: number
  quoteCount: number
}

export interface CustomerFormData {
  name: string
  company: string
  email: string
  phone: string
  address: string
  notes: string
}
