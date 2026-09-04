export interface PrintTimeEstimate {
  estimatedMinutes: number;
  estimatedHours: number;
  layers: number;
  travelDistanceMm: number;
  filamentLengthMm: number;
  confidence: "low" | "medium" | "high";
}

export interface PrintTimeParams {
  /** Model volume in cm³. */
  volumeCm3: number;
  /** Model bounding box in mm (used for layer count). */
  dimensions: { x: number; y: number; z: number };
  /** Layer height in mm. Default 0.2. */
  layerHeight?: number;
  /** Print speed in mm/s. Default 60. */
  speed?: number;
  /** Infill percentage. Default 20. */
  infillPercent?: number;
  /** Largura da linha extrudada em mm. Padrão 0,42 (bico de 0,4). */
  lineWidthMm?: number;
  /**
   * Volume de plástico realmente extrudado, em cm³ (casca + infill).
   * Quando ausente, usa `volumeCm3`, que é o volume MACIÇO do modelo e
   * portanto superestima o tempo de peça oca.
   */
  materialVolumeCm3?: number;
  /** Number of perimeter walls. Default 3. */
  wallCount?: number;
  /** Printer power draw in watts (from store fdmPrintParams / selectedPrinter). */
  printerPowerWatts?: number;
  /** Nozzle diameter in mm. Default 0.4. */
  nozzleDiameterMm?: number;
  /** Travel (non-print) speed in mm/s. Default 150. */
  travelSpeedMmPerS?: number;
  /** Solid top/bottom layers. Default 4. */
  topBottomLayers?: number;
}

const DEFAULT_SETTINGS = {
  layerHeightMm: 0.2,
  nozzleDiameterMm: 0.4,
  printSpeedMmPerS: 60,
  // Largura da linha extrudada. Bico de 0,4 mm deposita ~0,42 mm nos perfis
  // padrão de Bambu Studio, OrcaSlicer e PrusaSlicer.
  lineWidthMm: 0.42,
  travelSpeedMmPerS: 150,
  infillPercent: 20,
  wallCount: 3,
  topBottomLayers: 4,
};

export function estimatePrintTime(params: PrintTimeParams): PrintTimeEstimate {
  const {
    volumeCm3,
    dimensions,
    layerHeight = DEFAULT_SETTINGS.layerHeightMm,
    speed = DEFAULT_SETTINGS.printSpeedMmPerS,
    travelSpeedMmPerS = DEFAULT_SETTINGS.travelSpeedMmPerS,
  } = params;

  const heightMm = dimensions.z;
  const layers = Math.ceil(heightMm / layerHeight);

  // Comprimento de filamento CONSUMIDO (só para relatório).
  // Volume = π * r² * comprimento
  const filamentRadiusMm = 1.75 / 2;
  const volumeMm3 = (params.materialVolumeCm3 ?? volumeCm3) * 1000;
  const filamentLengthMm =
    volumeMm3 / (Math.PI * filamentRadiusMm * filamentRadiusMm);

  // Distância que o BICO percorre. Não é o comprimento de filamento: o bico
  // deposita uma fita de (altura de camada × largura de linha), muito mais fina
  // que os 1,75 mm do filamento. A versão anterior dividia o comprimento de
  // FILAMENTO pela velocidade do BICO, o que subestimava o tempo em ~30×
  // (2,405 mm² de seção do filamento contra 0,084 mm² da fita extrudada).
  const lineWidthMm = params.lineWidthMm ?? DEFAULT_SETTINGS.lineWidthMm;
  const extrusionCrossSectionMm2 = layerHeight * lineWidthMm;
  const printDistanceMm = volumeMm3 / extrusionCrossSectionMm2;
  const travelDistanceMm = printDistanceMm * 0.25;

  const printTimeSeconds = printDistanceMm / speed;
  const travelTimeSeconds = travelDistanceMm / travelSpeedMmPerS;

  // Add layer change overhead (~2 seconds per layer)
  const layerChangeSeconds = layers * 2;

  const totalSeconds =
    printTimeSeconds + travelTimeSeconds + layerChangeSeconds;
  const estimatedMinutes = Math.round(totalSeconds / 60);
  const estimatedHours = Math.round((estimatedMinutes / 60) * 10) / 10;

  // Confidence: high when real printer settings were provided,
  // medium when only defaults are used, low without valid geometry
  const hasRealSettings =
    params.layerHeight !== undefined ||
    params.speed !== undefined ||
    params.infillPercent !== undefined ||
    params.wallCount !== undefined ||
    params.printerPowerWatts !== undefined ||
    params.nozzleDiameterMm !== undefined ||
    params.travelSpeedMmPerS !== undefined ||
    params.topBottomLayers !== undefined;

  const confidence: PrintTimeEstimate["confidence"] =
    volumeCm3 <= 0 || dimensions.z <= 0
      ? "low"
      : hasRealSettings
        ? "high"
        : "medium";

  return {
    estimatedMinutes,
    estimatedHours,
    layers,
    travelDistanceMm: Math.round(travelDistanceMm),
    filamentLengthMm: Math.round(filamentLengthMm),
    confidence,
  };
}

export function estimatePrintTimeFromDimensions(
  widthMm: number,
  depthMm: number,
  heightMm: number,
  settings: Omit<PrintTimeParams, "volumeCm3" | "dimensions"> = {},
): PrintTimeEstimate {
  // Estimate volume from bounding box (assuming ~40% fill for typical prints)
  const boundingBoxVolume = widthMm * depthMm * heightMm;
  const estimatedVolumeCm3 = (boundingBoxVolume * 0.4) / 1000;

  return estimatePrintTime({
    volumeCm3: estimatedVolumeCm3,
    dimensions: { x: widthMm, y: depthMm, z: heightMm },
    ...settings,
  });
}
