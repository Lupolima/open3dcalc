import type { PrinterProfile } from '@/types'

export const printers: PrinterProfile[] = [
  { id: 'bambu_a1_mini', name: 'Bambu Lab A1 Mini', brand: 'Bambu Lab', power: 170, value: 2000, usefulLife: 3000, maintenancePerHour: 0.20, image: '/images/printers/brands/bambu-lab/svg/bambu-lab-a1-mini-card.svg' },
  { id: 'bambu_a1', name: 'Bambu Lab A1', brand: 'Bambu Lab', power: 220, value: 3000, usefulLife: 3000, maintenancePerHour: 0.30, image: '/images/printers/brands/bambu-lab/svg/bambu-lab-a1-card.svg' },
  { id: 'bambu_p1s', name: 'Bambu Lab P1S', brand: 'Bambu Lab', power: 350, value: 5500, usefulLife: 4000, maintenancePerHour: 0.40, image: '/images/printers/brands/bambu-lab/svg/bambu-lab-p1s-card.svg' },
  { id: 'bambu_x1c', name: 'Bambu Lab X1C', brand: 'Bambu Lab', power: 350, value: 10000, usefulLife: 5000, maintenancePerHour: 0.60, image: '/images/printers/brands/bambu-lab/svg/bambu-lab-x1-carbon-card.svg' },
  { id: 'ender_3', name: 'Ender 3', brand: 'Creality', power: 120, value: 1200, usefulLife: 2000, maintenancePerHour: 0.15, image: '/images/printers/brands/creality/svg/creality-ender-3-s1-card.svg' },
  { id: 'k1_max', name: 'K1 Max', brand: 'Creality', power: 350, value: 5000, usefulLife: 3000, maintenancePerHour: 0.40, image: '/images/printers/brands/creality/svg/creality-k1-max-card.svg' },
  { id: 'custom', name: 'Personalizada', brand: 'Outra', power: 250, value: 3000, usefulLife: 3000, maintenancePerHour: 0.25 },
]

export function getPrinter(id: string): PrinterProfile {
  return printers.find(p => p.id === id) ?? printers[0]
}
