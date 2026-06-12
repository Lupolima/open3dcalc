import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCatalogStore } from '@/stores/catalogStore'
import { InputGroup } from '@/components/ui/InputGroup'
import { Select } from '@/components/ui/Select'
import { printers } from '@/lib/printers'
import { materials } from '@/lib/materials'
import { marketplaces } from '@/lib/marketplace'

type Section = 'printers' | 'materials' | 'marketplaces'

const uid = () => Math.random().toString(36).slice(2, 9)

const SECTION_ORDER: Section[] = ['printers', 'materials', 'marketplaces']

export function CatalogTab() {
  const { t } = useTranslation()
  const store = useCatalogStore()
  const [section, setSection] = useState<Section>('printers')

  const load = useCatalogStore(s => s.load)
  useEffect(() => { load() }, [load])

  const stats = useMemo(() => ({
    printers: store.printers.length,
    materials: store.materials.length,
    marketplaces: store.marketplaces.length,
  }), [store.printers.length, store.materials.length, store.marketplaces.length])

  const handleTabKeyDown = (e: React.KeyboardEvent, current: Section) => {
    const idx = SECTION_ORDER.indexOf(current)
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      setSection(SECTION_ORDER[(idx + 1) % SECTION_ORDER.length])
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setSection(SECTION_ORDER[(idx - 1 + SECTION_ORDER.length) % SECTION_ORDER.length])
    }
  }

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

      <div className="glass rounded-2xl p-2 flex gap-2" role="tablist" aria-label={t('catalog.title')}>
        <button
          role="tab"
          aria-selected={section === 'printers'}
          aria-controls="tabpanel-printers"
          onClick={() => setSection('printers')}
          onKeyDown={(e) => handleTabKeyDown(e, 'printers')}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${section === 'printers' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          {t('catalog.printers')}
        </button>
        <button
          role="tab"
          aria-selected={section === 'materials'}
          aria-controls="tabpanel-materials"
          onClick={() => setSection('materials')}
          onKeyDown={(e) => handleTabKeyDown(e, 'materials')}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${section === 'materials' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          {t('catalog.materials')}
        </button>
        <button
          role="tab"
          aria-selected={section === 'marketplaces'}
          aria-controls="tabpanel-marketplaces"
          onClick={() => setSection('marketplaces')}
          onKeyDown={(e) => handleTabKeyDown(e, 'marketplaces')}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${section === 'marketplaces' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          {t('catalog.marketplaces')}
        </button>
      </div>

      {section === 'printers' && <div id="tabpanel-printers" role="tabpanel"><PrinterManager /></div>}
      {section === 'materials' && <div id="tabpanel-materials" role="tabpanel"><MaterialManager /></div>}
      {section === 'marketplaces' && <div id="tabpanel-marketplaces" role="tabpanel"><MarketplaceManager /></div>}
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
  const [usefulLife, setUsefulLife] = useState('3000')
  const [maintPerHour, setMaintPerHour] = useState('0.25')

  const add = () => {
    if (!name.trim()) return
    store.addPrinter({ id: uid(), name, brand: brand || 'Custom', power: Number(power) || 0, value: Number(value) || 0, usefulLife: Number(usefulLife) || 3000, maintenancePerHour: Number(maintPerHour) || 0.25, custom: true })
    setName(''); setBrand(''); setPower(''); setValue(''); setUsefulLife('3000'); setMaintPerHour('0.25')
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="text-sm font-semibold text-white">{t('catalog.addPrinter')}</div>
        <Select label={t('catalog.selectPrinter')} value="" onChange={id => {
          const p = printers.find(pr => pr.id === id)
          if (p) { setName(p.name); setBrand(p.brand); setPower(String(p.power)); setValue(String(p.value)) }
        }}
          options={[{ label: t('catalog.customPrinter'), value: '' }, ...printers.map(p => ({ label: p.name, value: p.id, subtitle: `${p.power}W · R$ ${p.value}`, group: p.brand }))]}
          groups search />
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <div className="relative flex justify-center text-xs text-gray-500"><span className="bg-[#0f0f13] px-2">{t('catalog.orManual')}</span></div>
        </div>
        <InputGroup label={t('catalog.printerName')} value={name} onChange={setName} />
        <InputGroup label={t('catalog.printerBrand')} value={brand} onChange={setBrand} />
        <div className="grid grid-cols-2 gap-3">
          <InputGroup label={t('catalog.power')} value={power} onChange={setPower} type="number" unit="W" />
          <InputGroup label={t('catalog.value')} value={value} onChange={setValue} type="number" prefix="R$" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputGroup label={t('catalog.usefulLife')} value={usefulLife} onChange={setUsefulLife} type="number" unit="h" placeholder="3000" />
          <InputGroup label={t('catalog.maintenancePerHour')} value={maintPerHour} onChange={setMaintPerHour} type="number" prefix="R$" placeholder="0.25" />
        </div>
        <button onClick={add} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none">{t('catalog.save')}</button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {store.printers.map(p => (
          <div key={p.id} className="glass rounded-2xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-white">{p.name}</div>
                <div className="text-xs text-gray-500">{p.brand}</div>
              </div>
              {p.custom && <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-600/20 text-indigo-300">Custom</span>}
            </div>
            <div className="text-xs text-gray-400">{t('catalog.power')}: {p.power}W</div>
            <div className="text-xs text-gray-400">{t('catalog.value')}: R$ {p.value}</div>
            <div className="text-xs text-gray-400">{t('catalog.usefulLife')}: {p.usefulLife}h</div>
            <div className="text-xs text-gray-400">{t('catalog.maintenancePerHour')}: R$ {p.maintenancePerHour}/h</div>
            {p.custom && <button onClick={() => store.removePrinter(p.id)} className="text-xs text-red-400 hover:text-red-300 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded">{t('catalog.remove')}</button>}
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
        <Select label={t('catalog.selectMaterial')} value="" onChange={id => {
          const m = materials.find(mat => mat.id === id)
          if (m) { setName(m.name); setType(m.type); setDensity(String(m.density)); setPrice(String(m.avgPrice)) }
        }}
          options={[{ label: t('catalog.customMaterial'), value: '' }, ...materials.map(m => ({ label: m.name, value: m.id, subtitle: `${m.density}g/cm³ · R$ ${m.avgPrice}`, group: t(m.type === 'fdm' ? 'catalog.fdm' : 'catalog.resin') }))]}
          groups search />
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <div className="relative flex justify-center text-xs text-gray-500"><span className="bg-[#0f0f13] px-2">{t('catalog.orManual')}</span></div>
        </div>
        <InputGroup label={t('catalog.materialName')} value={name} onChange={setName} />
        <Select label={t('catalog.materialType')} value={type} onChange={v => setType(v as 'fdm' | 'resin')}
          options={[{ label: 'FDM', value: 'fdm' }, { label: 'Resin', value: 'resin' }]} search={false} />
        <div className="grid grid-cols-2 gap-3">
          <InputGroup label={t('catalog.density')} value={density} onChange={setDensity} type="number" />
          <InputGroup label={t('catalog.avgPrice')} value={price} onChange={setPrice} type="number" prefix="R$" />
        </div>
        <button onClick={add} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none">{t('catalog.save')}</button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {store.materials.map(m => (
          <div key={m.id} className="glass rounded-2xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-white">{m.name}</div>
                <div className="text-xs text-gray-500 uppercase">{m.type}</div>
              </div>
              {m.custom && <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-600/20 text-indigo-300">Custom</span>}
            </div>
            <div className="text-xs text-gray-400">{t('catalog.density')}: {m.density}</div>
            <div className="text-xs text-gray-400">{t('catalog.avgPrice')}: R$ {m.avgPrice}</div>
            {m.custom && <button onClick={() => store.removeMaterial(m.id)} className="text-xs text-red-400 hover:text-red-300 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded">{t('catalog.remove')}</button>}
          </div>
        ))}
      </div>
    </div>
  )
}

function MarketplaceManager() {
  const store = useCatalogStore()
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [feePercent, setFeePercent] = useState('')
  const [feeFixed, setFeeFixed] = useState('')
  const [hasFreeShipping, setHasFreeShipping] = useState(false)

  const add = () => {
    if (!name.trim()) return
    store.addMarketplace({ id: uid(), name, feePercent: Number(feePercent) || 0, feeFixed: Number(feeFixed) || 0, hasFreeShipping, custom: true })
    setName(''); setFeePercent(''); setFeeFixed(''); setHasFreeShipping(false)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="text-sm font-semibold text-white">{t('catalog.addMarketplace')}</div>
        <Select label={t('catalog.selectMarketplace')} value="" onChange={id => {
          const m = marketplaces.find(mp => mp.id === id)
          if (m) { setName(m.name); setFeePercent(String(m.feePercent)); setFeeFixed(String(m.feeFixed)); setHasFreeShipping(m.hasFreeShipping) }
        }}
          options={[{ label: t('catalog.customMarketplace'), value: '' }, ...marketplaces.map(m => ({ label: m.name, value: m.id, subtitle: `${m.feePercent}% + R$${m.feeFixed}` }))]}
          search />
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <div className="relative flex justify-center text-xs text-gray-500"><span className="bg-[#0f0f13] px-2">{t('catalog.orManual')}</span></div>
        </div>
        <InputGroup label={t('catalog.marketplaceName')} value={name} onChange={setName} />
        <div className="grid grid-cols-2 gap-3">
          <InputGroup label={t('catalog.feePercent')} value={feePercent} onChange={setFeePercent} type="number" unit="%" />
          <InputGroup label={t('catalog.feeFixed')} value={feeFixed} onChange={setFeeFixed} type="number" prefix="R$" />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input type="checkbox" checked={hasFreeShipping} onChange={e => setHasFreeShipping(e.target.checked)} className="rounded bg-white/10 border-white/20" />
          {t('catalog.freeShipping')}
        </label>
        <button onClick={add} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none">{t('catalog.save')}</button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {store.marketplaces.map(m => (
          <div key={m.id} className="glass rounded-2xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-white">{m.name}</div>
              </div>
              {m.custom && <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-600/20 text-indigo-300">Custom</span>}
            </div>
            <div className="text-xs text-gray-400">{t('catalog.fee')}: {m.feePercent}% + R$ {m.feeFixed}</div>
            <div className="text-xs text-gray-400">{m.hasFreeShipping ? t('catalog.hasFreeShipping') : t('catalog.noFreeShipping')}</div>
            {m.custom && <button onClick={() => store.removeMarketplace(m.id)} className="text-xs text-red-400 hover:text-red-300 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded">{t('catalog.remove')}</button>}
          </div>
        ))}
      </div>
    </div>
  )
}
