import { pdf } from '@react-pdf/renderer'
import { ReportDoc } from '@/shared/lib/ReportDoc'
import type { CalculationResult } from '@/shared/types'

export async function exportPdf(result: CalculationResult) {
  const blob = await pdf(<ReportDoc result={result} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'open3dcalc_relatorio.pdf'
  a.click()
  URL.revokeObjectURL(url)
}
