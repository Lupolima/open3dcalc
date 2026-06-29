import type { CalculationResult } from '@/types'

interface CsvRow {
  [key: string]: string | number
}

function escapeCsv(value: string | number): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function rowsToCsv(rows: CsvRow[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const headerRow = headers.map(escapeCsv).join(',')
  const dataRows = rows.map(row =>
    headers.map(h => escapeCsv(row[h] ?? '')).join(',')
  )
  return [headerRow, ...dataRows].join('\n')
}

export function exportHistoryToCsv(history: Array<{ id: string; timestamp: number; type: string; summary: string; totalCost: number; sellPrice: number; profit: number }>): string {
  const rows = history.map(item => ({
    Data: new Date(item.timestamp).toLocaleDateString('pt-BR'),
    Hora: new Date(item.timestamp).toLocaleTimeString('pt-BR'),
    Tipo: item.type.toUpperCase(),
    Produto: item.summary,
    'Custo Total (R$)': item.totalCost.toFixed(2),
    'Preco Venda (R$)': item.sellPrice.toFixed(2),
    'Lucro (R$)': item.profit.toFixed(2),
    'Margem (%)': item.totalCost > 0 ? ((item.profit / item.totalCost) * 100).toFixed(1) : '0',
  }))
  return rowsToCsv(rows)
}

export function exportResultToCsv(result: CalculationResult, productName: string): string {
  const rows: CsvRow[] = [
    { Campo: 'Produto', Valor: productName },
    { Campo: 'Custo Material (R$)', Valor: result.materialCost.toFixed(2) },
    { Campo: 'Custo Energia (R$)', Valor: result.energyCost.toFixed(2) },
    { Campo: 'Depreciacao (R$)', Valor: result.machineCost.toFixed(2) },
    { Campo: 'Hardware (R$)', Valor: result.hardwareCost.toFixed(2) },
    { Campo: 'Consumiveis (R$)', Valor: result.consumablesCost.toFixed(2) },
    { Campo: 'Mao de Obra (R$)', Valor: result.laborCost.toFixed(2) },
    { Campo: 'Software (R$)', Valor: result.softwareCost.toFixed(2) },
    { Campo: 'Falha (R$)', Valor: result.failureCost.toFixed(2) },
    { Campo: 'Extras (R$)', Valor: result.extrasCost.toFixed(2) },
    { Campo: 'Pos-Processamento (R$)', Valor: result.postProcessingCost.toFixed(2) },
    { Campo: 'Custo Total (R$)', Valor: result.totalCost.toFixed(2) },
    { Campo: 'Preco Venda (R$)', Valor: result.sellPrice.toFixed(2) },
    { Campo: 'Lucro Liquido (R$)', Valor: result.profit.toFixed(2) },
    { Campo: 'Taxa Marketplace (R$)', Valor: result.marketplaceFee.toFixed(2) },
    { Campo: 'Impostos (R$)', Valor: result.taxAmount.toFixed(2) },
    { Campo: 'Custo por Grama (R$)', Valor: result.costPerGram.toFixed(4) },
    { Campo: 'Peso (g)', Valor: result.unitWeight.toFixed(2) },
  ]
  return rowsToCsv(rows)
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
