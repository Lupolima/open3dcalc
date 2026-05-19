import type { PrinterProfile } from '@/types'

export const printers: PrinterProfile[] = [
  { id: 'bambu_a1_mini', name: 'Bambu Lab A1 Mini', brand: 'Bambu Lab', power: 170, value: 2000, usefulLife: 3000, maintenancePerHour: 0.20 },
  { id: 'bambu_a1', name: 'Bambu Lab A1', brand: 'Bambu Lab', power: 220, value: 3000, usefulLife: 3000, maintenancePerHour: 0.30 },
  { id: 'bambu_p1s', name: 'Bambu Lab P1S', brand: 'Bambu Lab', power: 350, value: 5500, usefulLife: 4000, maintenancePerHour: 0.40 },
  { id: 'bambu_x1c', name: 'Bambu Lab X1C', brand: 'Bambu Lab', power: 350, value: 10000, usefulLife: 5000, maintenancePerHour: 0.60 },
  { id: 'ender_3', name: 'Creality Ender 3', brand: 'Creality', power: 120, value: 1200, usefulLife: 2000, maintenancePerHour: 0.15 },
  { id: 'ender_3_v2', name: 'Creality Ender 3 V2', brand: 'Creality', power: 120, value: 1500, usefulLife: 2000, maintenancePerHour: 0.15 },
  { id: 'ender_3_s1', name: 'Creality Ender 3 S1', brand: 'Creality', power: 150, value: 2200, usefulLife: 2500, maintenancePerHour: 0.20 },
  { id: 'k1_max', name: 'Creality K1 Max', brand: 'Creality', power: 350, value: 5000, usefulLife: 3000, maintenancePerHour: 0.40 },
  { id: 'prusa_mk4', name: 'Prusa MK4', brand: 'Prusa', power: 180, value: 5000, usefulLife: 5000, maintenancePerHour: 0.30 },
  { id: 'prusa_xl', name: 'Prusa XL', brand: 'Prusa', power: 400, value: 15000, usefulLife: 5000, maintenancePerHour: 0.80 },
  { id: 'elegoo_mars3', name: 'Elegoo Mars 3', brand: 'Elegoo', power: 85, value: 1500, usefulLife: 2000, maintenancePerHour: 0.10 },
  { id: 'elegoo_saturn', name: 'Elegoo Saturn', brand: 'Elegoo', power: 85, value: 2500, usefulLife: 2000, maintenancePerHour: 0.15 },
  { id: 'custom', name: 'Personalizada', brand: 'Outra', power: 250, value: 3000, usefulLife: 3000, maintenancePerHour: 0.25 },
]

export function getPrinter(id: string): PrinterProfile {
  return printers.find(p => p.id === id) ?? printers[0]
}
