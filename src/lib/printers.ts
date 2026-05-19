import type { PrinterProfile } from '@/types'

export type { PrinterProfile }

export const printers: PrinterProfile[] = [
  { id: 'bambu_a1_mini', name: 'Bambu Lab A1 Mini', brand: 'Bambu Lab', power: 170, value: 2000, usefulLife: 3000, maintenancePerHour: 0.20, image: '/images/printers/brands/bambu-lab/bambu-lab-a1-mini-card-300.png' },
  { id: 'bambu_a1', name: 'Bambu Lab A1', brand: 'Bambu Lab', power: 220, value: 3000, usefulLife: 3000, maintenancePerHour: 0.30, image: '/images/printers/brands/bambu-lab/bambu-lab-a1-card-300.png' },
  { id: 'bambu_p1s', name: 'Bambu Lab P1S', brand: 'Bambu Lab', power: 350, value: 5500, usefulLife: 4000, maintenancePerHour: 0.40, image: '/images/printers/brands/bambu-lab/bambu-lab-p1s-card-300.png' },
  { id: 'bambu_x1c', name: 'Bambu Lab X1C', brand: 'Bambu Lab', power: 350, value: 10000, usefulLife: 5000, maintenancePerHour: 0.60, image: '/images/printers/brands/bambu-lab/bambu-lab-x1-carbon-card-300.png' },
  { id: 'ender_3', name: 'Ender 3', brand: 'Creality', power: 120, value: 1200, usefulLife: 2000, maintenancePerHour: 0.15, image: '/images/printers/brands/creality/creality-ender-3-s1-card-300.png' },
  { id: 'k1_max', name: 'K1 Max', brand: 'Creality', power: 350, value: 5000, usefulLife: 3000, maintenancePerHour: 0.40, image: '/images/printers/brands/creality/creality-k1-max-card-300.png' },
  { id: 'custom', name: 'Personalizada', brand: 'Outra', power: 250, value: 3000, usefulLife: 3000, maintenancePerHour: 0.25 },
]

export function getPrinter(id: string): PrinterProfile {
  return printers.find(p => p.id === id) ?? printers[0]
}
