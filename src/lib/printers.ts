import type { PrinterProfile } from '@/types'

export type { PrinterProfile }

export const printers: PrinterProfile[] = [
  // ── Bambu Lab ──
  { id: 'bambu_a1_mini', name: 'A1 Mini', brand: 'Bambu Lab', power: 170, value: 2000, usefulLife: 3000, maintenancePerHour: 0.20, image: '/images/printers/brands/bambu-lab/bambu-lab-a1-mini-card-300.png' },
  { id: 'bambu_a1', name: 'A1', brand: 'Bambu Lab', power: 220, value: 3000, usefulLife: 3000, maintenancePerHour: 0.30, image: '/images/printers/brands/bambu-lab/bambu-lab-a1-card-300.png' },
  { id: 'bambu_p1s', name: 'P1S', brand: 'Bambu Lab', power: 350, value: 5500, usefulLife: 4000, maintenancePerHour: 0.40, image: '/images/printers/brands/bambu-lab/bambu-lab-p1s-card-300.png' },
  { id: 'bambu_x1c', name: 'X1 Carbon', brand: 'Bambu Lab', power: 350, value: 10000, usefulLife: 5000, maintenancePerHour: 0.60, image: '/images/printers/brands/bambu-lab/bambu-lab-x1-carbon-card-300.png' },
  { id: 'bambu_x1e', name: 'X1E', brand: 'Bambu Lab', power: 350, value: 13000, usefulLife: 5000, maintenancePerHour: 0.65 },

  // ── Creality ──
  { id: 'creality_ender_3_s1', name: 'Ender 3 S1', brand: 'Creality', power: 120, value: 1500, usefulLife: 2000, maintenancePerHour: 0.15, image: '/images/printers/brands/creality/creality-ender-3-s1-card-300.png' },
  { id: 'creality_ender_3_s1_plus', name: 'Ender 3 S1 Plus', brand: 'Creality', power: 150, value: 2000, usefulLife: 2200, maintenancePerHour: 0.18, image: '/images/printers/brands/creality/creality-ender-3-s1-plus-card-300.png' },
  { id: 'creality_ender_3_s1_pro', name: 'Ender 3 S1 Pro', brand: 'Creality', power: 120, value: 1800, usefulLife: 2000, maintenancePerHour: 0.16, image: '/images/printers/brands/creality/creality-ender-3-s1-pro-card-300.png' },
  { id: 'creality_ender_3_v3_se', name: 'Ender 3 V3 SE', brand: 'Creality', power: 180, value: 1400, usefulLife: 2500, maintenancePerHour: 0.14, image: '/images/printers/brands/creality/creality-ender-3-v3-se-card-300.png' },
  { id: 'creality_ender_3_v3', name: 'Ender 3 V3', brand: 'Creality', power: 240, value: 2500, usefulLife: 3000, maintenancePerHour: 0.20 },
  { id: 'creality_ender_3_v3_ke', name: 'Ender 3 V3 KE', brand: 'Creality', power: 240, value: 2300, usefulLife: 3000, maintenancePerHour: 0.20 },
  { id: 'creality_k1', name: 'K1', brand: 'Creality', power: 350, value: 3800, usefulLife: 3500, maintenancePerHour: 0.35, image: '/images/printers/brands/creality/creality-k1-card-300.png' },
  { id: 'creality_k1c', name: 'K1C', brand: 'Creality', power: 350, value: 4200, usefulLife: 3500, maintenancePerHour: 0.35, image: '/images/printers/brands/creality/creality-k1c-card-300.png' },
  { id: 'creality_k1_se', name: 'K1 SE', brand: 'Creality', power: 350, value: 3500, usefulLife: 3500, maintenancePerHour: 0.30, image: '/images/printers/brands/creality/creality-k1-se-card-300.png' },
  { id: 'creality_k1_max', name: 'K1 Max', brand: 'Creality', power: 400, value: 6000, usefulLife: 4000, maintenancePerHour: 0.45, image: '/images/printers/brands/creality/creality-k1-max-card-300.png' },
  { id: 'creality_k2', name: 'K2', brand: 'Creality', power: 500, value: 8000, usefulLife: 5000, maintenancePerHour: 0.50, image: '/images/printers/brands/creality/creality-k2-card-300.png' },
  { id: 'creality_k2_plus', name: 'K2 Plus', brand: 'Creality', power: 550, value: 10000, usefulLife: 5000, maintenancePerHour: 0.55, image: '/images/printers/brands/creality/creality-k2-plus-card-300.png' },
  { id: 'creality_k2_pro', name: 'K2 Pro', brand: 'Creality', power: 500, value: 9000, usefulLife: 5000, maintenancePerHour: 0.50, image: '/images/printers/brands/creality/creality-k2-pro-card-300.png' },
  { id: 'creality_cr10_v3', name: 'CR-10 V3', brand: 'Creality', power: 180, value: 3000, usefulLife: 2500, maintenancePerHour: 0.20 },
  { id: 'creality_cr10_smart', name: 'CR-10 Smart', brand: 'Creality', power: 220, value: 3500, usefulLife: 3000, maintenancePerHour: 0.25 },
  { id: 'creality_cr6_se', name: 'CR-6 SE', brand: 'Creality', power: 140, value: 1800, usefulLife: 2000, maintenancePerHour: 0.15 },
  { id: 'creality_halot_sky', name: 'Halot Sky', brand: 'Creality', power: 200, value: 4500, usefulLife: 3000, maintenancePerHour: 0.30 },

  // ── Anycubic ──
  { id: 'anycubic_kobra_2', name: 'Kobra 2', brand: 'Anycubic', power: 200, value: 1800, usefulLife: 2500, maintenancePerHour: 0.18, image: '/images/printers/brands/anycubic/anycubic-kobra-2-card-300.png' },
  { id: 'anycubic_kobra_2_pro', name: 'Kobra 2 Pro', brand: 'Anycubic', power: 250, value: 2300, usefulLife: 2800, maintenancePerHour: 0.22, image: '/images/printers/brands/anycubic/anycubic-kobra-2-pro-card-300.png' },
  { id: 'anycubic_kobra_2_max', name: 'Kobra 2 Max', brand: 'Anycubic', power: 280, value: 3500, usefulLife: 3000, maintenancePerHour: 0.28, image: '/images/printers/brands/anycubic/anycubic-kobra-2-max-card-300.png' },
  { id: 'anycubic_kobra_3', name: 'Kobra 3', brand: 'Anycubic', power: 300, value: 3000, usefulLife: 3000, maintenancePerHour: 0.25, image: '/images/printers/brands/anycubic/anycubic-kobra-3-card-300.png' },
  { id: 'anycubic_kobra_3_v2', name: 'Kobra 3 V2', brand: 'Anycubic', power: 300, value: 3500, usefulLife: 3200, maintenancePerHour: 0.28, image: '/images/printers/brands/anycubic/anycubic-kobra-3-v2-card-300.png' },
  { id: 'anycubic_kobra_3_max', name: 'Kobra 3 Max', brand: 'Anycubic', power: 350, value: 5000, usefulLife: 3500, maintenancePerHour: 0.35, image: '/images/printers/brands/anycubic/anycubic-kobra-3-max-card-300.png' },
  { id: 'anycubic_kobra_s1', name: 'Kobra S1', brand: 'Anycubic', power: 280, value: 2500, usefulLife: 3000, maintenancePerHour: 0.22, image: '/images/printers/brands/anycubic/anycubic-kobra-s1-card-300.png' },
  { id: 'anycubic_kobra_s1_combo', name: 'Kobra S1 Combo', brand: 'Anycubic', power: 300, value: 3500, usefulLife: 3200, maintenancePerHour: 0.28, image: '/images/printers/brands/anycubic/anycubic-kobra-s1-combo-card-300.png' },
  { id: 'anycubic_kobra_s1_max_combo', name: 'Kobra S1 Max Combo', brand: 'Anycubic', power: 350, value: 5500, usefulLife: 3500, maintenancePerHour: 0.35, image: '/images/printers/brands/anycubic/anycubic-kobra-s1-max-combo-card-300.png' },
  { id: 'anycubic_mega_x', name: 'Mega X', brand: 'Anycubic', power: 180, value: 1500, usefulLife: 2000, maintenancePerHour: 0.15, image: '/images/printers/brands/anycubic/anycubic-mega-x-card-300.png' },
  { id: 'anycubic_vyper', name: 'Vyper', brand: 'Anycubic', power: 200, value: 1800, usefulLife: 2200, maintenancePerHour: 0.18 },
  { id: 'anycubic_chiron', name: 'Chiron', brand: 'Anycubic', power: 250, value: 2800, usefulLife: 2500, maintenancePerHour: 0.22 },
  { id: 'anycubic_photon_m3', name: 'Photon M3', brand: 'Anycubic', power: 120, value: 2000, usefulLife: 2000, maintenancePerHour: 0.15 },
  { id: 'anycubic_photon_m3s', name: 'Photon M3 Plus', brand: 'Anycubic', power: 150, value: 3500, usefulLife: 2500, maintenancePerHour: 0.20 },
  { id: 'anycubic_photon_ultra', name: 'Photon Ultra', brand: 'Anycubic', power: 100, value: 3000, usefulLife: 2500, maintenancePerHour: 0.18 },

  // ── Prusa ──
  { id: 'prusa_mk3s', name: 'MK3S+', brand: 'Prusa', power: 160, value: 5500, usefulLife: 4000, maintenancePerHour: 0.25 },
  { id: 'prusa_mk4', name: 'MK4', brand: 'Prusa', power: 180, value: 7500, usefulLife: 4500, maintenancePerHour: 0.30 },
  { id: 'prusa_mk4s', name: 'MK4S', brand: 'Prusa', power: 180, value: 8000, usefulLife: 4500, maintenancePerHour: 0.30 },
  { id: 'prusa_xl_2', name: 'XL 2-Head', brand: 'Prusa', power: 350, value: 20000, usefulLife: 6000, maintenancePerHour: 0.60 },
  { id: 'prusa_xl_5', name: 'XL 5-Head', brand: 'Prusa', power: 500, value: 35000, usefulLife: 6000, maintenancePerHour: 0.80 },
  { id: 'prusa_mini', name: 'Mini+', brand: 'Prusa', power: 120, value: 3500, usefulLife: 3000, maintenancePerHour: 0.20 },
  { id: 'prusa_sl1s', name: 'SL1S Speed', brand: 'Prusa', power: 100, value: 15000, usefulLife: 3000, maintenancePerHour: 0.40 },

  // ── Elegoo ──
  { id: 'elegoo_neptune_3', name: 'Neptune 3', brand: 'Elegoo', power: 180, value: 1200, usefulLife: 2000, maintenancePerHour: 0.12 },
  { id: 'elegoo_neptune_3_pro', name: 'Neptune 3 Pro', brand: 'Elegoo', power: 200, value: 1600, usefulLife: 2500, maintenancePerHour: 0.15 },
  { id: 'elegoo_neptune_3_plus', name: 'Neptune 3 Plus', brand: 'Elegoo', power: 240, value: 2200, usefulLife: 2800, maintenancePerHour: 0.18 },
  { id: 'elegoo_neptune_4', name: 'Neptune 4', brand: 'Elegoo', power: 300, value: 2000, usefulLife: 3000, maintenancePerHour: 0.18 },
  { id: 'elegoo_neptune_4_pro', name: 'Neptune 4 Pro', brand: 'Elegoo', power: 320, value: 2500, usefulLife: 3000, maintenancePerHour: 0.20 },
  { id: 'elegoo_neptune_4_max', name: 'Neptune 4 Max', brand: 'Elegoo', power: 400, value: 3800, usefulLife: 3500, maintenancePerHour: 0.28 },
  { id: 'elegoo_saturn_2', name: 'Saturn 2', brand: 'Elegoo', power: 130, value: 3000, usefulLife: 2500, maintenancePerHour: 0.18 },
  { id: 'elegoo_saturn_3', name: 'Saturn 3', brand: 'Elegoo', power: 150, value: 3500, usefulLife: 2800, maintenancePerHour: 0.22 },
  { id: 'elegoo_saturn_4', name: 'Saturn 4', brand: 'Elegoo', power: 180, value: 4500, usefulLife: 3000, maintenancePerHour: 0.25 },
  { id: 'elegoo_mars_4', name: 'Mars 4', brand: 'Elegoo', power: 80, value: 1800, usefulLife: 2000, maintenancePerHour: 0.12 },
  { id: 'elegoo_mars_5', name: 'Mars 5', brand: 'Elegoo', power: 90, value: 2200, usefulLife: 2200, maintenancePerHour: 0.14 },
  { id: 'elegoo_orangestorm_g2', name: 'OrangeStorm G2', brand: 'Elegoo', power: 500, value: 8000, usefulLife: 4000, maintenancePerHour: 0.50 },

  // ── Flashforge ──
  { id: 'flashforge_guider_3', name: 'Guider 3', brand: 'Flashforge', power: 350, value: 8000, usefulLife: 4000, maintenancePerHour: 0.35 },
  { id: 'flashforge_guider_3s', name: 'Guider 3S', brand: 'Flashforge', power: 400, value: 10000, usefulLife: 4500, maintenancePerHour: 0.40 },
  { id: 'flashforge_adventurer_4', name: 'Adventurer 4', brand: 'Flashforge', power: 250, value: 4000, usefulLife: 3000, maintenancePerHour: 0.22 },
  { id: 'flashforge_adventurer_5m', name: 'Adventurer 5M', brand: 'Flashforge', power: 300, value: 3500, usefulLife: 3000, maintenancePerHour: 0.25 },
  { id: 'flashforge_finder_3', name: 'Finder 3', brand: 'Flashforge', power: 150, value: 2000, usefulLife: 2000, maintenancePerHour: 0.14 },
  { id: 'flashforge_creator_4s', name: 'Creator 4S', brand: 'Flashforge', power: 500, value: 25000, usefulLife: 5000, maintenancePerHour: 0.70 },

  // ── UltiMaker ──
  { id: 'ultimaker_s3', name: 'S3', brand: 'UltiMaker', power: 250, value: 18000, usefulLife: 5000, maintenancePerHour: 0.50 },
  { id: 'ultimaker_s5', name: 'S5', brand: 'UltiMaker', power: 350, value: 28000, usefulLife: 6000, maintenancePerHour: 0.70 },
  { id: 'ultimaker_fact_4', name: 'Factor 4', brand: 'UltiMaker', power: 400, value: 35000, usefulLife: 6000, maintenancePerHour: 0.80 },
  { id: 'ultimaker_method_x', name: 'Method X', brand: 'UltiMaker', power: 300, value: 22000, usefulLife: 5000, maintenancePerHour: 0.60 },
  { id: 'ultimaker_method_xl', name: 'Method XL', brand: 'UltiMaker', power: 400, value: 30000, usefulLife: 6000, maintenancePerHour: 0.75 },

  // ── Artillery ──
  { id: 'artillery_sidewinder_x1', name: 'Sidewinder X1', brand: 'Artillery', power: 220, value: 2500, usefulLife: 2500, maintenancePerHour: 0.18 },
  { id: 'artillery_sidewinder_x2', name: 'Sidewinder X2', brand: 'Artillery', power: 260, value: 3000, usefulLife: 2800, maintenancePerHour: 0.22 },
  { id: 'artillery_sidewinder_x4', name: 'Sidewinder X4', brand: 'Artillery', power: 300, value: 3500, usefulLife: 3000, maintenancePerHour: 0.25 },
  { id: 'artillery_hornet', name: 'Hornet', brand: 'Artillery', power: 160, value: 1200, usefulLife: 2000, maintenancePerHour: 0.12 },
  { id: 'artillery_genius', name: 'Genius', brand: 'Artillery', power: 180, value: 1800, usefulLife: 2200, maintenancePerHour: 0.15 },
  { id: 'artillery_sw_x4_plus', name: 'SW X4 Plus', brand: 'Artillery', power: 350, value: 4500, usefulLife: 3500, maintenancePerHour: 0.30 },

  // ── Qidi Tech ──
  { id: 'qidi_x_plus', name: 'X-Plus', brand: 'Qidi Tech', power: 280, value: 4500, usefulLife: 3500, maintenancePerHour: 0.28 },
  { id: 'qidi_x_max', name: 'X-Max', brand: 'Qidi Tech', power: 350, value: 6000, usefulLife: 4000, maintenancePerHour: 0.35 },
  { id: 'qidi_x_smart', name: 'X-Smart', brand: 'Qidi Tech', power: 200, value: 3000, usefulLife: 2500, maintenancePerHour: 0.20 },
  { id: 'qidi_i_fast', name: 'I-Fast', brand: 'Qidi Tech', power: 350, value: 5500, usefulLife: 4000, maintenancePerHour: 0.32 },
  { id: 'qidi_i3', name: 'Qidi I-3', brand: 'Qidi Tech', power: 250, value: 3000, usefulLife: 2500, maintenancePerHour: 0.20 },

  // ── Sovol ──
  { id: 'sovol_sv06', name: 'SV06', brand: 'Sovol', power: 160, value: 1400, usefulLife: 2000, maintenancePerHour: 0.12 },
  { id: 'sovol_sv06_plus', name: 'SV06 Plus', brand: 'Sovol', power: 220, value: 2000, usefulLife: 2500, maintenancePerHour: 0.15 },
  { id: 'sovol_sv07', name: 'SV07', brand: 'Sovol', power: 380, value: 2500, usefulLife: 3000, maintenancePerHour: 0.20 },
  { id: 'sovol_sv07_plus', name: 'SV07 Plus', brand: 'Sovol', power: 450, value: 3500, usefulLife: 3500, maintenancePerHour: 0.28 },
  { id: 'sovol_sv01', name: 'SV01', brand: 'Sovol', power: 200, value: 1500, usefulLife: 2000, maintenancePerHour: 0.14 },

  // ── AnkerMake ──
  { id: 'ankermake_m5', name: 'M5', brand: 'AnkerMake', power: 300, value: 3500, usefulLife: 3000, maintenancePerHour: 0.25 },
  { id: 'ankermake_m5c', name: 'M5C', brand: 'AnkerMake', power: 300, value: 2800, usefulLife: 3000, maintenancePerHour: 0.22 },
  { id: 'ankermake_v6', name: 'V6', brand: 'AnkerMake', power: 400, value: 6000, usefulLife: 4000, maintenancePerHour: 0.35 },

  // ── Raise3D ──
  { id: 'raise3d_e2', name: 'E2', brand: 'Raise3D', power: 350, value: 18000, usefulLife: 5000, maintenancePerHour: 0.50 },
  { id: 'raise3d_pro3', name: 'Pro3', brand: 'Raise3D', power: 500, value: 25000, usefulLife: 6000, maintenancePerHour: 0.65 },
  { id: 'raise3d_pro3_plus', name: 'Pro3 Plus', brand: 'Raise3D', power: 600, value: 35000, usefulLife: 6000, maintenancePerHour: 0.80 },
  { id: 'raise3d_rf1000', name: 'RF1000', brand: 'Raise3D', power: 300, value: 8000, usefulLife: 4000, maintenancePerHour: 0.35 },

  // ── Snapmaker ──
  { id: 'snapmaker_j1', name: 'J1', brand: 'Snapmaker', power: 250, value: 6000, usefulLife: 3000, maintenancePerHour: 0.25 },
  { id: 'snapmaker_artisan', name: 'Artisan', brand: 'Snapmaker', power: 350, value: 8000, usefulLife: 3500, maintenancePerHour: 0.30 },
  { id: 'snapmaker_a350t', name: 'A350T', brand: 'Snapmaker', power: 300, value: 5000, usefulLife: 3000, maintenancePerHour: 0.22 },

  // ── Voron (DIY) ──
  { id: 'voron_v0', name: 'V0.2', brand: 'Voron', power: 180, value: 4000, usefulLife: 3000, maintenancePerHour: 0.20 },
  { id: 'voron_trident', name: 'Trident', brand: 'Voron', power: 350, value: 7000, usefulLife: 4000, maintenancePerHour: 0.30 },
  { id: 'voron_24', name: '2.4', brand: 'Voron', power: 400, value: 8000, usefulLife: 4000, maintenancePerHour: 0.35 },
  { id: 'voron_switchwire', name: 'Switchwire', brand: 'Voron', power: 250, value: 5000, usefulLife: 3000, maintenancePerHour: 0.22 },

  // ── Peopoly ──
  { id: 'peopoly_lantech', name: 'LanTech', brand: 'Peopoly', power: 120, value: 3500, usefulLife: 2500, maintenancePerHour: 0.20 },
  { id: 'peopoly_forge', name: 'Forge', brand: 'Peopoly', power: 400, value: 12000, usefulLife: 4000, maintenancePerHour: 0.45 },

  // ── Phrozen ──
  { id: 'phrozen_sonic_mega_8k', name: 'Sonic Mega 8K', brand: 'Phrozen', power: 180, value: 5500, usefulLife: 3000, maintenancePerHour: 0.30 },
  { id: 'phrozen_sonic_4k', name: 'Sonic 4K', brand: 'Phrozen', power: 100, value: 2500, usefulLife: 2000, maintenancePerHour: 0.15 },
  { id: 'phrozen_sonic_mini_8k', name: 'Sonic Mini 8K', brand: 'Phrozen', power: 80, value: 3000, usefulLife: 2500, maintenancePerHour: 0.18 },

  // ── Generic / Custom ──
  { id: 'custom', name: 'Personalizada', brand: 'Outra', power: 250, value: 3000, usefulLife: 3000, maintenancePerHour: 0.25 },
]

export function getPrinter(id: string): PrinterProfile {
  return printers.find(p => p.id === id) ?? printers[0]
}
