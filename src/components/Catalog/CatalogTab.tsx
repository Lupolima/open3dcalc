import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCatalogStore } from '@/stores/catalogStore'
import { InputGroup } from '@/components/ui/InputGroup'
import { Select } from '@/components/ui/Select'

type Section = 'printers' | 'materials' | 'marketplaces'

const uid = () => Math.random().toString(36).slice(2, 9)

export function CatalogTab() {
  const { t } = useTranslation()
  const store = useCatalogStore()
  const [section, setSection] = useState<Section>('printers')

  useEffect(() => { store.load() }, [])

  const stats = useMemo(() => ({
    printers: store.printers.length,
    materials: store.materials.length,
    marketplaces: store.marketplaces.length,
  }), [store.printers.length, store.materials.length, store.marketplaces.length])

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-5 flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">{t('catalog.title')}</h2>
          <p className="text-xs text-gray-500">{t('catalog.subtitle')}</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300">{stats.printers} {t('catalog.printers')}</span>
          <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300">{stats.materials} {t('catalog.materials')}</span>
          <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300">{stats.marketplaces} {t('catalog.marketplaces')}</span>
        </div>
      </div>

      <div className="glass rounded-2xl p-2 flex gap-2">
        <button onClick={() => setSection('printers')} className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${section === 'printers' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>{t('catalog.printers')}</button>
        <button onClick={() => setSection('materials')} className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${section === 'materials' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>{t('catalog.materials')}</button>
        <button onClick={() => setSection('marketplaces')} className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${section === 'marketplaces' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>{t('catalog.marketplaces')}</button>
      </div>

      {section === 'printers' && <PrinterManager />}
      {section === 'materials' && <MaterialManager />}
      {section === 'marketplaces' && <MarketplaceManager />}
    </div>
  )
}

function PrinterManager() {
  const store = useCatalogStore()
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [power, setPower] = useState('')
  const [value, setValue] = useState('')

  const add = () => {
    if (!name.trim()) return
    store.addPrinter({ id: uid(), name, brand: brand || 'Custom', power: Number(power) || 0, value: Number(value) || 0, usefulLife: 3000, maintenancePerHour: 0.25, custom: true })
    setName(''); setBrand(''); setPower(''); setValue('')
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="text-sm font-semibold text-white">{t('catalog.addPrinter')}</div>
        <InputGroup label={t('catalog.printerName')} value={name} onChange={setName} />
        <InputGroup label={t('catalog.printerBrand')} value={brand} onChange={setBrand} />
        <div className="grid grid-cols-2 gap-3">
          <InputGroup label={t('catalog.power')} value={power} onChange={setPower} type="number" unit="W" />
          <InputGroup label={t('catalog.value')} value={value} onChange={setValue} type="number" prefix="R$" />
        </div>
        <button onClick={add} className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold">{t('catalog.save')}</button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {store.printers.map(p => (
          <div key={p.id} className="glass rounded-2xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-white">{p.name}</div>
                <div className="text-xs text-gray-500">{p.brand}</div>
              </div>
              {p.custom && <span className="text-[10px] px-2 py-1 rounded-full bg-purple-600/20 text-purple-300">Custom</span>}
            </div>
            <div className="text-xs text-gray-400">{t('catalog.power')}: {p.power}W</div>
            <div className="text-xs text-gray-400">{t('catalog.value')}: R$ {p.value}</div>
            {p.custom && <button onClick={() => store.removePrinter(p.id)} className="text-xs text-red-400 hover:text-red-300">{t('catalog.remove')}</button>}
          </div>
        ))}
      </div>
    </div>
  )
}

function MaterialManager() {
  const store = useCatalogStore()
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [type, setType] = useState<'fdm' | 'resin'>('fdm')
  const [density, setDensity] = useState('')
  const [price, setPrice] = useState('')

  const add = () => {
    if (!name.trim()) return
    store.addMaterial({ id: uid(), name, type, density: Number(density) || 0, avgPrice: Number(price) || 0, custom: true })
    setName(''); setType('fdm'); setDensity(''); setPrice('')
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="text-sm font-semibold text-white">{t('catalog.addMaterial')}</div>
        <InputGroup label={t('catalog.materialName')} value={name} onChange={setName} />
        <Select label={t('catalog.materialType')} value={type} onChange={v => setType(v as 'fdm' | 'resin')}
          options={[{ label: 'FDM', value: 'fdm' }, { label: 'Resin', value: 'resin' }]} search={false} />
        <div className="grid grid-cols-2 gap-3">
          <InputGroup label={t('catalog.density')} value={density} onChange={setDensity} type="number" />
          <InputGroup label={t('catalog.avgPrice')} value={price} onChange={setPrice} type="number" prefix="R$" />
        </div>
        <button onClick={add} className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold">{t('catalog.save')}</button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {store.materials.map(m => (
          <div key={m.id} className="glass rounded-2xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-white">{m.name}</div>
                <div className="text-xs text-gray-500 uppercase">{m.type}</div>
              </div>
              {m.custom && <span className="text-[10px] px-2 py-1 rounded-full bg-purple-600/20 text-purple-300">Custom</span>}
            </div>
            <div className="text-xs text-gray-400">{t('catalog.density')}: {m.density}</div>
            <div className="text-xs text-gray-400">{t('catalog.avgPrice')}: R$ {m.avgPrice}</div>
            {m.custom && <button onClick={() => store.removeMaterial(m.id)} className="text-xs text-red-400 hover:text-red-300">{t('catalog.remove')}</button>}
          </div>
        ))}
      </div>
    </div>
  )
}

function MarketplaceManager() {
  const store = useCatalogStore()
  const { t } = useTranslation()
  return (
    <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
      {store.marketplaces.map(m => (
        <div key={m.id} className="glass rounded-2xl p-4 space-y-2">
          <div className="font-semibold text-white">{m.name}</div>
          <div className="text-xs text-gray-400">Fee: {m.feePercent}% + R$ {m.feeFixed}</div>
          <div className="text-xs text-gray-400">{m.hasFreeShipping ? 'Frete grátis' : 'Sem frete grátis'}</div>
          {m.custom && <button className="text-xs text-red-400 hover:text-red-300">{t('catalog.remove')}</button>}
        </div>
      ))}
    </div>
  )
}
