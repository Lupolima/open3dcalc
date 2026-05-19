import type { Material } from '@/types'

export const materials: Material[] = [
  { id: 'pla', name: 'PLA', density: 1.24, avgPrice: 90, type: 'fdm' },
  { id: 'pla_silk', name: 'PLA Silk', density: 1.24, avgPrice: 120, type: 'fdm' },
  { id: 'pla_plus', name: 'PLA+', density: 1.26, avgPrice: 100, type: 'fdm' },
  { id: 'petg', name: 'PETG', density: 1.27, avgPrice: 110, type: 'fdm' },
  { id: 'abs', name: 'ABS', density: 1.04, avgPrice: 100, type: 'fdm' },
  { id: 'asa', name: 'ASA', density: 1.05, avgPrice: 140, type: 'fdm' },
  { id: 'tpu_85a', name: 'TPU 85A', density: 1.20, avgPrice: 130, type: 'fdm' },
  { id: 'tpu_95a', name: 'TPU 95A', density: 1.22, avgPrice: 120, type: 'fdm' },
  { id: 'nylon_pa6', name: 'Nylon PA6', density: 1.14, avgPrice: 140, type: 'fdm' },
  { id: 'nylon_pa12', name: 'Nylon PA12', density: 1.01, avgPrice: 160, type: 'fdm' },
  { id: 'pc', name: 'Policarbonato (PC)', density: 1.20, avgPrice: 180, type: 'fdm' },
  { id: 'pc_abs', name: 'PC/ABS', density: 1.15, avgPrice: 160, type: 'fdm' },
  { id: 'pla_cf', name: 'PLA + Fibra de Carbono', density: 1.30, avgPrice: 160, type: 'fdm' },
  { id: 'petg_cf', name: 'PETG + Fibra de Carbono', density: 1.28, avgPrice: 180, type: 'fdm' },
  { id: 'nylon_cf', name: 'Nylon + Fibra de Carbono', density: 1.10, avgPrice: 250, type: 'fdm' },
  { id: 'pla_wood', name: 'PLA + Madeira', density: 1.20, avgPrice: 130, type: 'fdm' },
  { id: 'pla_metal', name: 'PLA + Metal', density: 1.80, avgPrice: 200, type: 'fdm' },
  { id: 'hips', name: 'HIPS', density: 1.03, avgPrice: 130, type: 'fdm' },
  { id: 'pva', name: 'PVA', density: 1.23, avgPrice: 200, type: 'fdm' },
  { id: 'pp', name: 'Polipropileno (PP)', density: 0.90, avgPrice: 150, type: 'fdm' },
  { id: 'peek', name: 'PEEK', density: 1.32, avgPrice: 1000, type: 'fdm' },
  { id: 'peek_cf', name: 'PEEK + CF', density: 1.40, avgPrice: 1200, type: 'fdm' },
  { id: 'ultem', name: 'PEI / ULTEM', density: 1.27, avgPrice: 1500, type: 'fdm' },
]

export function getMaterial(id: string): Material {
  return materials.find(m => m.id === id) ?? materials[0]
}

export function estimateWeight(volumeCm3: number, density: number, infill: number, purge: number): number {
  const infillRatio = infill / 100
  const purgeRatio = purge / 100
  const effectiveVolume = volumeCm3 * (0.2 + 0.8 * infillRatio)
  const weight = effectiveVolume * density
  const waste = weight * purgeRatio
  return weight + waste
}
