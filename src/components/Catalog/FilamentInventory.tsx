import { useState } from 'react'
import { useFilamentInventory } from '@/stores/filamentInventory'
import { InputGroup } from '@/components/ui/InputGroup'
import { Select } from '@/components/ui/Select'

const MATERIALS = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon', 'PLA-CF', 'PETG-CF', 'PVA', 'HIPS']
const COLORS = ['Preto', 'Branco', 'Cinza', 'Vermelho', 'Azul', 'Verde', 'Amarelo', 'Laranja', 'Roxo', 'Transparente', 'Natural']
const BRANDS = ['Bambu Lab', 'Creality', 'Anycubic', 'Prusa', 'Elegoo', 'Flashforge', 'Hatchbox', 'eSun', 'Sunlu', 'Polymaker', 'Outro']

export function FilamentInventory() {
  const store = useFilamentInventory()
  const [showForm, setShowForm] = useState(false)
  const [brand, setBrand] = useState('')
  const [material, setMaterial] = useState('PLA')
  const [color, setColor] = useState('')
  const [weight, setWeight] = useState('')
  const [costPerKg, setCostPerKg] = useState('')
  const [diameter, setDiameter] = useState('1.75')
  const [notes, setNotes] = useState('')

  const addSpool = () => {
    if (!brand.trim() || !color.trim() || !weight) return
    store.addSpool({
      brand,
      material,
      color,
      weightGrams: parseFloat(weight) || 1000,
      originalWeightGrams: parseFloat(weight) || 1000,
      costPerKg: parseFloat(costPerKg) || 0,
      diameterMm: parseFloat(diameter) || 1.75,
      notes,
    })
    setBrand(''); setColor(''); setWeight(''); setCostPerKg(''); setDiameter('1.75'); setNotes('')
    setShowForm(false)
  }

  const totalWeight = store.getTotalWeight()
  const lowStock = store.getLowStockSpools(100)

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-5 flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Inventário de Filamentos</h2>
          <p className="text-xs text-gray-500">{store.spools.length} carretéis · {totalWeight.toFixed(0)}g total</p>
        </div>
        <div className="flex gap-2">
          {lowStock.length > 0 && (
            <span className="px-3 py-1.5 rounded-full bg-red-600/20 text-red-300 text-xs border border-red-600/30">
              ⚠️ {lowStock.length} estoque baixo
            </span>
          )}
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold">
            {showForm ? 'Cancelar' : '+ Novo Carretel'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-5 space-y-3">
          <div className="text-sm font-semibold text-white">Novo Carretel</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Select label="Marca" value={brand} onChange={setBrand}
              options={BRANDS.map(b => ({ label: b, value: b }))} search />
            <Select label="Material" value={material} onChange={setMaterial}
              options={MATERIALS.map(m => ({ label: m, value: m }))} search={false} />
            <Select label="Cor" value={color} onChange={setColor}
              options={COLORS.map(c => ({ label: c, value: c }))} search />
            <InputGroup label="Peso (g)" value={weight} onChange={v => setWeight(v)} type="number" unit="g" />
            <InputGroup label="Custo/kg" value={costPerKg} onChange={v => setCostPerKg(v)} type="number" prefix="R$" />
            <InputGroup label="Diâmetro" value={diameter} onChange={v => setDiameter(v)} type="number" unit="mm" />
          </div>
          <InputGroup label="Notas" value={notes} onChange={setNotes} type="text" />
          <button onClick={addSpool} className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold">Salvar Carretel</button>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {store.spools.map(s => {
          const remaining = (s.weightGrams / s.originalWeightGrams) * 100
          const isLow = s.weightGrams < 100
          return (
            <div key={s.id} className={`glass rounded-2xl p-4 space-y-2 ${isLow ? 'border-red-600/30' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-white">{s.brand} {s.material}</div>
                  <div className="text-xs text-gray-500">{s.color} · {s.diameterMm}mm</div>
                </div>
                <div className="flex gap-2">
                  {isLow && <span className="text-[10px] px-2 py-1 rounded-full bg-red-600/20 text-red-300">Baixo</span>}
                  <button onClick={() => store.removeSpool(s.id)} className="text-xs text-red-400 hover:text-red-300">✕</button>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">{s.weightGrams}g / {s.originalWeightGrams}g</span>
                  <span className="text-gray-400">{remaining.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${remaining}%`, backgroundColor: isLow ? '#ef4444' : '#10b981' }} />
                </div>
              </div>
              {s.costPerKg > 0 && (
                <div className="text-xs text-gray-400">
                  Custo: R$ {(s.costPerKg / 1000).toFixed(3)}/g · Restante: R$ {(s.weightGrams * s.costPerKg / 1000).toFixed(2)}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => store.deductWeight(s.id, 10)}
                  className="text-xs px-2 py-1 rounded bg-white/5 text-gray-400 hover:text-white">-10g</button>
                <button onClick={() => store.deductWeight(s.id, 50)}
                  className="text-xs px-2 py-1 rounded bg-white/5 text-gray-400 hover:text-white">-50g</button>
                <button onClick={() => store.deductWeight(s.id, 100)}
                  className="text-xs px-2 py-1 rounded bg-white/5 text-gray-400 hover:text-white">-100g</button>
              </div>
            </div>
          )
        })}
        {store.spools.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-gray-500">
            Nenhum carretel cadastrado. Clique em "+ Novo Carretel" para começar.
          </div>
        )}
      </div>
    </div>
  )
}
