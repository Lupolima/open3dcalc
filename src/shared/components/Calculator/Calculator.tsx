import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { BufferGeometry } from "three";
import { ToastContainer } from "@/shared/components/ui/Toast";
import { useCurrency } from "@/shared/hooks/useCurrency";
import { estimatePrintTimeFromDimensions } from "@/shared/lib/printTimeEstimator";
import { useCalculatorStore } from "@/shared/stores/calculatorStore";
import { useCatalogStore } from "@/shared/stores/catalogStore";
import { useFilamentInventory } from "@/shared/stores/filamentInventory";
import { useShallow } from "zustand/react/shallow";
import { ResultsPanel } from "./ResultsPanel";
import { TechToggle } from "./TechToggle";
import { LevelToggle } from "./LevelToggle";
import { ProductName } from "./ProductName";
import { SectionNav } from "./SectionNav";
import { SectionRenderer } from "./SectionRenderer";
import { MobileBottomBar } from "./MobileBottomBar";

export function Calculator() {
	const { t } = useTranslation();
	const store = useCalculatorStore();

	const { printers: catalogPrinters, materials: catalogMaterials } = useCatalogStore(
		useShallow((s) => ({ printers: s.printers, materials: s.materials })),
	);
	const inventorySpools = useFilamentInventory((s) => s.spools);
	const [showSpoolSelector, setShowSpoolSelector] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [stlGeometry, setStlGeometry] = useState<BufferGeometry | null>(null);
	const [stlInfo, setStlInfo] = useState<{
		volume: number;
		faces: number;
		vertices: number;
		dimensions: { x: number; y: number; z: number };
	} | null>(null);
	const [stlLoading, setStlLoading] = useState(false);
	const [activeSection, setActiveSection] = useState("material");
	const [toastItems, setToastItems] = useState<
		{ id: number; message: string; type: "error" | "success" | "info" }[]
	>([]);

	const dismissToast = (id: number) => {
		setToastItems((prev) => prev.filter((t) => t.id !== id));
	};

	const isFDM = store.activeTab === "fdm";
	const { symbol: currencySymbol } = useCurrency();

	const handleFileDrop = useCallback(
		async (file: File) => {
			const toast = (msg: string) => {
				setToastItems((prev) => [
					...prev,
					{ id: Date.now(), message: msg, type: "error" as const },
				]);
			};
			if (!file.name.match(/\.(stl|obj|3mf|gcode)$/i)) {
				toast(t("stl.invalidFile"));
				return;
			}
			if (file.size > 50 * 1024 * 1024) {
				toast("Arquivo muito grande. Limite: 50MB.");
				return;
			}
			setStlLoading(true);
			try {
				if (file.name.match(/\.gcode$/i)) {
					const { parseGcode } = await import("@/shared/lib/gcodeParser");
					const text = await file.text();
					const gcode = parseGcode(text);
					if (gcode.printTimeMinutes > 0) {
						const hours = gcode.printTimeMinutes / 60;
						if (isFDM) {
							store.setFdmPrintParams({
								...store.fdmPrintParams,
								printTimeHours: parseFloat(hours.toFixed(2)),
							});
						} else {
							store.setResinPrintParams({
								...store.resinPrintParams,
								printTimeHours: parseFloat(hours.toFixed(2)),
							});
						}
					}
					if (gcode.filamentUsedGrams > 0) {
						const w = parseFloat(gcode.filamentUsedGrams.toFixed(2));
						if (store.fdmAmsEnabled) {
							const idx = store.fdmAmsSlots.findIndex((s) => s.enabled);
							if (idx >= 0) {
								const slot = { ...store.fdmAmsSlots[idx], weightUsedGrams: w };
								store.setFdmAmsSlot(idx, slot);
							}
						} else {
							store.setFdmMaterial({ ...store.fdmMaterial, weightUsed: w });
						}
					}
					setStlInfo({
						volume: 0,
						faces: 0,
						vertices: 0,
						dimensions: { x: 0, y: 0, z: 0 },
					});
				} else {
					const { analyzeMeshFile, volumeToCm3, estimateWeight } = await import(
						"@/shared/lib/stlParser"
					);
					const { geometry, analysis } = await analyzeMeshFile(file);
					if (analysis.triangleCount > 2_000_000) {
						toast("Malha muito complexa. Limite: 2 milhões de triângulos.");
						setStlLoading(false);
						return;
					}
					setStlGeometry(geometry);
					const volume = volumeToCm3(analysis.volume);
					setStlInfo({
						volume,
						faces: analysis.triangleCount,
						vertices: analysis.vertexCount,
						dimensions: analysis.dimensions,
					});

					// Estimate print time from bounding box dimensions
					const { x: width, y: depth, z: height } = analysis.dimensions;
					if (width > 0 && depth > 0 && height > 0) {
						const timeEstimate = estimatePrintTimeFromDimensions(
							width,
							depth,
							height,
						);
						const estimatedHours = timeEstimate.estimatedHours;
						if (isFDM) {
							store.setFdmPrintParams({
								...store.fdmPrintParams,
								printTimeHours: estimatedHours,
							});
						} else {
							store.setResinPrintParams({
								...store.resinPrintParams,
								printTimeHours: estimatedHours,
							});
						}
					}

					const density = store.fdmAmsEnabled
						? (store.fdmAmsSlots.find((s) => s.enabled)?.density ??
							store.fdmMaterial.density)
						: store.fdmMaterial.density;
					const weight = estimateWeight(volume, density, 20, 10);
					const w = parseFloat(weight.toFixed(2));
					if (store.fdmAmsEnabled) {
						const idx = store.fdmAmsSlots.findIndex((s) => s.enabled);
						if (idx >= 0) {
							const slot = { ...store.fdmAmsSlots[idx], weightUsedGrams: w };
							store.setFdmAmsSlot(idx, slot);
						}
					} else {
						store.setFdmMaterial({ ...store.fdmMaterial, weightUsed: w });
					}
				}
			} catch {
				toast(t("stl.error"));
			}
			setStlLoading(false);
		},
		[store, t, isFDM],
	);

	const handlePrinterSelect = (id: string) => {
		const p = catalogPrinters.find((p) => p.id === id);
		if (p) {
			store.setSelectedPrinter(
				p as Parameters<typeof store.setSelectedPrinter>[0],
			);
			store.setFdmPrintParams({
				...store.fdmPrintParams,
				printerPowerWatts: p.power,
			});
			store.setFdmMachine({ ...store.fdmMachine, machineCost: p.value });
		}
	};

	const handleInput = useCallback(
		(value: string, setter: (v: number) => void) => {
			setter(value === "" ? 0 : parseFloat(value) || 0);
		},
		[],
	);

	const results = store.results;

	if (!results) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="text-[var(--color-text-muted)] text-sm">{t('common.loading')}</div>
			</div>
		);
	}

	return (
		<>
			<ToastContainer items={toastItems} onDismiss={dismissToast} />
			<div className="flex gap-4 xl:gap-6 pb-20 lg:pb-0">
				<SectionNav activeSection={activeSection} onSectionClick={setActiveSection} />
				<div className="flex-1 min-w-0 space-y-4">
						<div className="flex flex-wrap items-center gap-2 sm:gap-3 py-1">
						<TechToggle />
						<LevelToggle />
					</div>
					<ProductName />
					<SectionRenderer
						t={t}
						currencySymbol={currencySymbol}
						handleInput={handleInput}
						isFDM={isFDM}
						fileInputRef={fileInputRef}
						stlGeometry={stlGeometry}
						stlInfo={stlInfo}
						stlLoading={stlLoading}
						handleFileDrop={handleFileDrop}
						showSpoolSelector={showSpoolSelector}
						setShowSpoolSelector={setShowSpoolSelector}
						inventorySpools={inventorySpools}
						catalogMaterials={catalogMaterials}
						catalogPrinters={catalogPrinters}
						handlePrinterSelect={handlePrinterSelect}
					/>
				</div>
				<div data-tutorial="results-sidebar" className="hidden lg:flex flex-col gap-4 w-[320px] xl:w-[360px] shrink-0 sticky top-[92px] self-start max-h-[calc(100vh-92px)] overflow-y-auto">
					<ResultsPanel variant="sidebar" />
				</div>
			</div>
			<MobileBottomBar activeSection={activeSection} onSectionClick={setActiveSection} />
		</>
	);
}
