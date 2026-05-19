import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useProductStore } from '@/stores/productStore'
import type { SavedProduct } from '@/types'

function formatMoney(value: number) {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface DetailModalProps {
  product: SavedProduct | null
  onClose: () => void
}

function DetailModal({ product, onClose }: DetailModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (product) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [product, handleKeyDown])

  if (!product) return null

  const d = product.result
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label="Detalhes do produto">
      <div
        className="glass rounded-2xl p-6 w-[90%] max-w-md max-h-[80vh] overflow-y-auto animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold gradient-text">{product.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none" aria-label="Fechar">&times;</button>
        </div>

        <div className="space-y-2 text-sm">
          <Row label="💰 Preço Final" value={formatMoney(d.sellPrice)} bold />
          <Row label="🧵 Material" value={formatMoney(d.materialCost)} />
          <Row label="⚡ Energia" value={formatMoney(d.energyCost)} />
          <Row label="🖨️ Máquina" value={formatMoney(d.machineCost)} />
          <Row label="🔧 Hardware" value={formatMoney(d.hardwareCost)} />
          <Row label="👷 Mão de Obra" value={formatMoney(d.laborCost)} />
          <Row label="💻 Software" value={formatMoney(d.softwareCost)} />
          <Row label="🎨 Acabamento" value={formatMoney(d.postProcessingCost)} />
          <Row label="💸 Custo Total" value={formatMoney(d.totalCost)} bold />
          <Row label="🏪 Taxa Marketplace" value={formatMoney(d.marketplaceFee)} />
          <Row label="💰 Impostos" value={formatMoney(d.taxAmount)} />
          <Row label="📈 Lucro Líquido" value={formatMoney(d.profit)} bold />
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between border-b border-white/5 pb-1.5 ${bold ? 'font-bold' : ''}`}>
      <span className="text-gray-400">{label}</span>
      <span className={bold ? 'text-purple-400' : 'text-gray-200'}>{value}</span>
    </div>
  )
}

export function HistoryTab() {
  const { t } = useTranslation()
  const { products, load, remove, exportJson } = useProductStore()
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<SavedProduct | null>(null)

  useEffect(() => { load() }, [load])

  const filtered = products
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .reverse()

  const handleExport = () => {
    const data = exportJson()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'open3dcalc_export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="glass rounded-2xl p-5 animate-fade-in">
      <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">
        {t('history.title')}
      </h2>

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={t('history.search')}
        className="w-full px-4 py-2.5 rounded-xl text-sm mb-4"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">{t('history.empty')}</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filtered.map(p => (
            <div key={p.id} className="glass rounded-xl p-3 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div>
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-gray-500">{p.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-400">{formatMoney(p.result.sellPrice)}</span>
                <button onClick={() => setSelectedProduct(p)} className="px-3 py-1.5 text-xs rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors">
                  {t('history.details')}
                </button>
                <button onClick={() => { if (confirm(t('history.deleteConfirm'))) remove(p.id) }} className="px-2 py-1.5 text-xs rounded-lg bg-red-600/50 text-red-300 hover:bg-red-600 transition-colors">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={handleExport} className="w-full mt-4 py-2.5 rounded-xl text-sm glass text-gray-400 hover:text-white transition-colors">
        {t('history.exportJson')}
      </button>

      <DetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  )
}
