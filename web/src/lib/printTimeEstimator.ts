export interface PrintTimeEstimate {
  estimatedMinutes: number
  estimatedHours: number
  layers: number
  travelDistanceMm: number
  filamentLengthMm: number
  confidence: 'low' | 'medium' | 'high'
}

interface PrintSettings {
  layerHeightMm: number
  nozzleDiameterMm: number
  printSpeedMmPerS: number
  travelSpeedMmPerS: number
  infillPercent: number
  wallCount: number
  topBottomLayers: number
}

const DEFAULT_SETTINGS: PrintSettings = {
  layerHeightMm: 0.2,
  nozzleDiameterMm: 0.4,
  printSpeedMmPerS: 60,
  travelSpeedMmPerS: 150,
  infillPercent: 20,
  wallCount: 3,
  topBottomLayers: 4,
}

export function estimatePrintTime(
  volumeCm3: number,
  dimensions: { x: number; y: number; z: number },
  settings: Partial<PrintSettings> = {},
): PrintTimeEstimate {
  const s = { ...DEFAULT_SETTINGS, ...settings }

  const heightMm = dimensions.z
  const layers = Math.ceil(heightMm / s.layerHeightMm)

  // Estimate filament length from volume
  // Volume = π * r² * length
  const filamentRadiusMm = 1.75 / 2
  const volumeMm3 = volumeCm3 * 1000
  const filamentLengthMm = volumeMm3 / (Math.PI * filamentRadiusMm * filamentRadiusMm)

  // Estimate print time
  // Print time = (filament length / print speed) + (travel distance / travel speed)
  // Travel distance is roughly 25% of print distance
  const printDistanceMm = filamentLengthMm
  const travelDistanceMm = printDistanceMm * 0.25

  const printTimeSeconds = printDistanceMm / s.printSpeedMmPerS
  const travelTimeSeconds = travelDistanceMm / s.travelSpeedMmPerS

  // Add layer change overhead (~2 seconds per layer)
  const layerChangeSeconds = layers * 2

  const totalSeconds = printTimeSeconds + travelTimeSeconds + layerChangeSeconds
  const estimatedMinutes = Math.round(totalSeconds / 60)
  const estimatedHours = Math.round((estimatedMinutes / 60) * 10) / 10

  // Confidence based on how much we know
  const confidence: PrintTimeEstimate['confidence'] =
    volumeCm3 > 0 && dimensions.z > 0 ? 'medium' : 'low'

  return {
    estimatedMinutes,
    estimatedHours,
    layers,
    travelDistanceMm: Math.round(travelDistanceMm),
    filamentLengthMm: Math.round(filamentLengthMm),
    confidence,
  }
}

export function estimatePrintTimeFromDimensions(
  widthMm: number,
  depthMm: number,
  heightMm: number,
  settings: Partial<PrintSettings> = {},
): PrintTimeEstimate {
  // Estimate volume from bounding box (assuming ~40% fill for typical prints)
  const boundingBoxVolume = widthMm * depthMm * heightMm
  const estimatedVolumeCm3 = (boundingBoxVolume * 0.4) / 1000

  return estimatePrintTime(
    estimatedVolumeCm3,
    { x: widthMm, y: depthMm, z: heightMm },
    settings,
  )
}
