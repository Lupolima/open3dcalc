import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BufferGeometry } from 'three'
import { useCalculatorStore } from '@/stores/calculatorStore'
import { materials, estimateWeight } from '@/lib/materials'
import { parseStlFile, volumeToCm3 } from '@/lib/stlParser'
import { StlPreview } from '@/components/StlPreview/StlPreview'

export function ProductTab() {
  const { t } = useTranslation()
  const { inputs, setInput, setMaterial } = useCalculatorStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stlGeometry, setStlGeometry] = useState<BufferGeometry | null>(null)
  const [stlInfo, setStlInfo] = useState<{ volume: number; faces: number; vertices: number } | null>(null)
  const [stlLoading, setStlLoading] = useState(false)

  const handleFileDrop = useCallback(async (file: File) => {
    if (!file.name.match(/\.(stl|obj)$/i)) {
      alert(t('stl.invalidFile'))
      return
    }
    setStlLoading(true)
    try {
      const { geometry, info } = await parseStlFile(file)
      setStlGeometry(geometry)
      const volumeCm3 = volumeToCm3(info.volume)
      setStlInfo({ volume: volumeCm3, faces: info.faces, vertices: info.vertices })
      setInput('volume', parseFloat(volumeCm3.toFixed(2)))
      setInput('useVolume', true)
      const weight = estimateWeight(volumeCm3, inputs.material.density, inputs.infillPercent, inputs.purgePercent)
      setInput('weight', parseFloat(weight.toFixed(2)))
    } catch {
      alert(t('stl.error'))
    }
    setStlLoading(false)
  }, [inputs.material.density, inputs.infillPercent, inputs.purgePercent, setInput, t])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileDrop(file)
  }

  const handleFileSelect = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileDrop(file)
  }

  return (
    <div className="glass rounded-2xl p-5 animate-fade-in">
      <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">
        {t('product.title')}
      </h2>

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleFileSelect}
        className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500/50 transition-colors mb-4"
      >
        <input ref={fileInputRef} type="file" accept=".stl,.obj" onChange={handleFileChange} className="hidden" />
        <p className="text-sm text-gray-400 mb-1">{t('product.uploadStl')}</p>
        <p className="text-xs text-gray-500">{t('product.stlSupported')}</p>
        {stlLoading && <p className="text-xs text-purple-400 mt-2">{t('stl.loading')}</p>}
      </div>

      <StlPreview geometry={stlGeometry} />

      {stlInfo && (
        <div className="grid grid-cols-3 gap-2 mt-3 mb-4 text-xs">
          <div className="glass rounded-lg p-2 text-center">
            <p className="text-gray-400">{t('stl.volume')}</p>
            <p className="font-semibold text-purple-400">{stlInfo.volume.toFixed(1)} cm³</p>
          </div>
          <div className="glass rounded-lg p-2 text-center">
            <p className="text-gray-400">{t('stl.faces')}</p>
            <p className="font-semibold text-gray-200">{stlInfo.faces}</p>
          </div>
          <div className="glass rounded-lg p-2 text-center">
            <p className="text-gray-400">{t('stl.vertices')}</p>
            <p className="font-semibold text-gray-200">{stlInfo.vertices}</p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mb-4">{t('product.manualEntry')}</p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">{t('product.name')}</label>
          <input
            type="text"
            value={inputs.productName}
            onChange={e => setInput('productName', e.target.value)}
            placeholder={t('product.namePlaceholder')}
            className="w-full px-4 py-2.5 rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">{t('product.material')}</label>
          <select
            value={inputs.material.id}
            onChange={e => {
              const mat = materials.find(m => m.id === e.target.value)
              if (mat) setMaterial(mat)
            }}
            className="w-full px-4 py-2.5 rounded-xl text-sm"
          >
            {materials.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('product.weight')}</label>
            <input
              type="number"
              value={inputs.weight || ''}
              onChange={e => { setInput('weight', parseFloat(e.target.value) || 0); setInput('useVolume', false) }}
              placeholder="0"
              className="w-full px-4 py-2.5 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('product.volume')}</label>
            <input
              type="number"
              value={inputs.volume || ''}
              onChange={e => { setInput('volume', parseFloat(e.target.value) || 0); setInput('useVolume', true) }}
              placeholder="0"
              className="w-full px-4 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('product.time')}</label>
            <input
              type="number"
              value={inputs.timeMinutes || ''}
              onChange={e => setInput('timeMinutes', parseFloat(e.target.value) || 0)}
              placeholder="180"
              className="w-full px-4 py-2.5 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('product.quantity')}</label>
            <input
              type="number"
              value={inputs.quantity || ''}
              onChange={e => setInput('quantity', Math.max(1, parseFloat(e.target.value) || 1))}
              placeholder="1"
              min="1"
              className="w-full px-4 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('product.infill')}</label>
            <input
              type="range"
              min="0"
              max="100"
              value={inputs.infillPercent}
              onChange={e => setInput('infillPercent', parseInt(e.target.value))}
              className="w-full accent-purple-500"
            />
            <span className="text-xs text-gray-400">{inputs.infillPercent}%</span>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('product.purge')}</label>
            <input
              type="range"
              min="0"
              max="50"
              value={inputs.purgePercent}
              onChange={e => setInput('purgePercent', parseInt(e.target.value))}
              className="w-full accent-purple-500"
            />
            <span className="text-xs text-gray-400">{inputs.purgePercent}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
