import {
	AlertTriangle,
	BarChart3,
	DollarSign,
	FlaskConical,
	HardHat,
	Layers,
	type LucideIcon,
	Printer,
	Receipt,
	Settings,
	ShieldCheck,
	SlidersHorizontal,
	Wrench,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { BufferGeometry } from "three";
import { InputGroup } from "@/components/ui/InputGroup";
import { Select } from "@/components/ui/Select";
import { ToastContainer } from "@/components/ui/Toast";
import { ToggleSwitch } from "@/components/ui/ToggleCard";
import { useCurrency } from "@/hooks/useCurrency";
import { estimatePrintTimeFromDimensions } from "@/lib/printTimeEstimator";
import { useCalculatorStore } from "@/stores/calculatorStore";
import type { CalcLevel } from "@/stores/calculatorStore";
import { useCatalogStore } from "@/stores/catalogStore";
import { useFilamentInventory } from "@/stores/filamentInventory";
import { ResultsPanel } from "./ResultsPanel";
import { FailureSection } from "./sections/FailureSection";
import { FixedCostsSection } from "./sections/FixedCostsSection";
import { LaborSection } from "./sections/LaborSection";
import { MachineSection } from "./sections/MachineSection";
import { MaterialSection } from "./sections/MaterialSection";
import { PrintSection } from "./sections/PrintSection";

const SECTIONS: {
	id: string;
	Icon: LucideIcon;
	label: string;
	shortKey: string;
}[] = [
	{
		id: "material",
		Icon: Layers,
		label: "calc.material",
		shortKey: "calc.sectionShort.material",
	},
	{
		id: "print",
		Icon: SlidersHorizontal,
		label: "calc.printParams",
		shortKey: "calc.sectionShort.print",
	},
	{
		id: "failure",
		Icon: AlertTriangle,
		label: "calc.failure.title",
		shortKey: "calc.sectionShort.failure",
	},
	{
		id: "hardware",
		Icon: Wrench,
		label: "calc.fdmHardware",
		shortKey: "calc.sectionShort.hardware",
	},
	{
		id: "machine",
		Icon: Printer,
		label: "calc.machine",
		shortKey: "calc.sectionShort.machine",
	},
	{
		id: "fixedCost",
		Icon: Receipt,
		label: "calc.fixedCost.title",
		shortKey: "calc.sectionShort.fixedCost",
	},
	{
		id: "labor",
		Icon: HardHat,
		label: "calc.labor",
		shortKey: "calc.sectionShort.labor",
	},
	{
		id: "ops",
		Icon: ShieldCheck,
		label: "calc.opsSoftware",
		shortKey: "calc.sectionShort.ops",
	},
	{
		id: "sales",
		Icon: DollarSign,
		label: "calc.sales",
		shortKey: "calc.sectionShort.sales",
	},
	{
		id: "results",
		Icon: BarChart3,
		label: "calc.results",
		shortKey: "calc.sectionShort.results",
	},
];

const SECTION_ENABLES: Record<string, string[]> = {
	material: ["material"],
	print: ["energy"],
	failure: ["failure"],
	hardware: ["hardware", "postProcessing"],
	machine: ["machine"],
	fixedCost: [],
	labor: ["labor"],
	ops: ["software", "consumables"],
	sales: ["packaging", "shipping", "extras"],
	results: [],
};

/** Section IDs visible in each level */
const LEVEL_SECTIONS: Record<CalcLevel, string[]> = {
	basic: ['material', 'print', 'sales', 'results'],
	intermediate: ['material', 'print', 'failure', 'sales', 'results'],
	advanced: ['material', 'print', 'failure', 'hardware', 'machine', 'fixedCost', 'labor', 'ops', 'sales', 'results'],
}

/** Fields visible at intermediate level per section (beyond basic fields) */
const INTERMEDIATE_FIELDS: Record<string, string[]> = {
	material: ['purgeWeight', 'spoolEfficiency', 'density', 'wasteMargin'],
	print: ['selectedPrinter'],
	failure: [],  // all failure fields visible at intermediate
	sales: ['infillPercent', 'extrasCost', 'shippingCost', 'marketplace', 'taxPercent', 'markupPresets'],
}

/** Which fields are "basic" (always visible) per section */
const BASIC_FIELDS: Record<string, string[]> = {
	material: ['type', 'costPerKg', 'weightUsed', 'costPerLiter', 'volumeUsedMl'],
	print: ['printTimeHours', 'printerPowerWatts', 'energyCostPerKwh'],
	failure: ['failureMode', 'failureValue', 'riskMultiplier'],
	sales: ['quantity', 'packagingCost', 'profitMarginPercent'],
}

/** Human-readable labels for customizable field IDs */
const FIELD_LABELS: Record<string, string> = {
	purgeWeight: 'calc.purge',
	spoolEfficiency: 'calc.spoolEfficiency',
	density: 'calc.density',
	wasteMargin: 'calc.wasteMargin',
	selectedPrinter: 'calc.printer',
	infillPercent: 'calc.infillPercent',
	extrasCost: 'calc.extras',
	shippingCost: 'calc.shipping',
	marketplace: 'calc.marketplace',
	taxPercent: 'calc.taxPercent',
	markupPresets: 'calc.markupPresets',
}

const LEVEL_LABELS: Record<CalcLevel, 'calc.basic' | 'calc.intermediate' | 'calc.advanced'> = {
	basic: 'calc.basic',
	intermediate: 'calc.intermediate',
	advanced: 'calc.advanced',
}

export function Calculator() {
	const { t } = useTranslation();
	const store = useCalculatorStore();

	const catalogPrinters = useCatalogStore((s) => s.printers);
	const catalogMaterials = useCatalogStore((s) => s.materials);
	const catalogMarketplaces = useCatalogStore((s) => s.marketplaces);
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
	const visibleSections = SECTIONS.filter((s) => LEVEL_SECTIONS[store.calcLevel].includes(s.id));
	const { format: fmtCurrency, symbol: currencySymbol } = useCurrency();

	const isFieldVisible = useCallback(
		(sectionId: string, fieldId: string) => {
			const level = store.calcLevel
			const sectionFields = INTERMEDIATE_FIELDS[sectionId] ?? []
			const basicFields = BASIC_FIELDS[sectionId] ?? []

			// Basic level: only basic fields
			if (level === 'basic') return basicFields.includes(fieldId)
			// Intermediate level: basic + intermediate fields, unless hidden via customizer
			if (level === 'intermediate') {
				return (basicFields.includes(fieldId) || sectionFields.includes(fieldId))
					&& !store.hiddenFields.includes(`${sectionId}.${fieldId}`)
			}
			// Advanced: everything (unless hidden via customizer)
			return !store.hiddenFields.includes(`${sectionId}.${fieldId}`)
		},
		[store.calcLevel, store.hiddenFields]
	)

	const [openCustomizer, setOpenCustomizer] = useState<string | null>(null)
	const customizerRef = useRef<HTMLDivElement>(null)

	// Click outside to close customizer
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (customizerRef.current && !customizerRef.current.contains(e.target as Node)) {
				setOpenCustomizer(null)
			}
		}
		if (openCustomizer) {
			document.addEventListener('mousedown', handleClickOutside)
			return () => document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [openCustomizer])

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
					const { parseGcode } = await import("@/lib/gcodeParser");
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
						"@/lib/stlParser"
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

	const handleMarketplaceChange = (id: string) => {
		const mp = catalogMarketplaces.find((m) => m.id === id);
		if (mp) {
			store.setSelectedMarketplace(
				mp as Parameters<typeof store.setSelectedMarketplace>[0],
			);
			store.setFdmSales({
				...store.fdmSales,
				marketplaceFeePercent: mp.feePercent,
			});
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
				<div className="text-slate-500 text-sm">Carregando...</div>
			</div>
		);
	}

	function renderSectionHeader(
		Icon: LucideIcon,
		title: string,
		subtitle?: string,
		sectionId?: string,
	) {
		const isCustomizable = sectionId && INTERMEDIATE_FIELDS[sectionId]?.length > 0 && store.calcLevel !== 'basic'
		return (
			<div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/[0.06]">
				<Icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
				<div className="flex-1 min-w-0">
					<h3 className="text-xs font-bold text-slate-100 truncate">{title}</h3>
					{subtitle && (
						<p className="text-[10px] text-slate-500 truncate">{subtitle}</p>
					)}
				</div>
				{isCustomizable && sectionId && (
					<div className="relative" ref={openCustomizer === sectionId ? customizerRef : undefined}>
						<button
							type="button"
							onClick={() => setOpenCustomizer(openCustomizer === sectionId ? null : sectionId)}
							className="p-1 rounded-md hover:bg-white/[0.06] text-slate-500 hover:text-slate-300 transition-colors"
							title={t('calc.customizeFields')}
						>
							<Settings className="w-3.5 h-3.5" />
						</button>
						{openCustomizer === sectionId && (
							<div className="absolute right-0 top-8 z-50 w-56 glass border border-white/10 rounded-xl p-2 shadow-xl">
								<p className="text-[10px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wide">
									{t('calc.customizeFields')}
								</p>
								{(INTERMEDIATE_FIELDS[sectionId] ?? []).map((fieldId) => (
									<label
										key={fieldId}
										className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] cursor-pointer text-xs text-slate-300"
									>
										<input
											type="checkbox"
											checked={!store.hiddenFields.includes(`${sectionId}.${fieldId}`)}
											onChange={() => store.toggleField(`${sectionId}.${fieldId}`)}
											className="rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500"
										/>
										{t(FIELD_LABELS[fieldId] ?? fieldId)}
									</label>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		);
	}

	function renderHardwareSection() {
		return (
			<div className="glass rounded-2xl p-4 sm:p-5 space-y-6">
			{renderSectionHeader(
				Wrench,
				t("calc.fdmHardware"),
				t(
					isFDM
						? "calc.sectionDesc.fdmHardware"
						: "calc.sectionDesc.resinHardware",
				),
				"hardware",
			)}
				{isFDM && (
					<>
						<div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
							<div className="space-y-4">
								<div className="flex items-center justify-between border-b border-white/10 pb-2">
									<span className="text-xs font-semibold text-sky-400">
										{t("calc.nozzle")}
									</span>
									<ToggleSwitch
										enabled={store.fdmHardware.nozzleEnabled}
										onToggle={(v) =>
											store.setFdmHardware({
												...store.fdmHardware,
												nozzleEnabled: v,
											})
										}
									/>
								</div>
								{store.fdmHardware.nozzleEnabled && (
									<>
										<InputGroup
											label={t("calc.nozzleCost")}
											value={store.fdmHardware.nozzleCost}
											onChange={(v) =>
												handleInput(v, (val) =>
													store.setFdmHardware({
														...store.fdmHardware,
														nozzleCost: val,
													}),
												)
											}
											type="number"
											prefix={currencySymbol}
										/>
										<InputGroup
											label={t("calc.nozzleLife")}
											value={store.fdmHardware.nozzleLifespanKg}
											onChange={(v) =>
												handleInput(v, (val) =>
													store.setFdmHardware({
														...store.fdmHardware,
														nozzleLifespanKg: val,
													}),
												)
											}
											type="number"
											unit="kg"
										/>
									</>
								)}
							</div>
							<div className="space-y-4">
								<div className="flex items-center justify-between border-b border-white/10 pb-2">
									<span className="text-xs font-semibold text-sky-400">
										{t("calc.bed")}
									</span>
									<ToggleSwitch
										enabled={store.fdmHardware.bedEnabled}
										onToggle={(v) =>
											store.setFdmHardware({
												...store.fdmHardware,
												bedEnabled: v,
											})
										}
									/>
								</div>
								{store.fdmHardware.bedEnabled && (
									<InputGroup
										label={t("calc.bedCost")}
										value={store.fdmHardware.bedAdhesionCost}
										onChange={(v) =>
											handleInput(v, (val) =>
												store.setFdmHardware({
													...store.fdmHardware,
													bedAdhesionCost: val,
												}),
											)
										}
										type="number"
										prefix={currencySymbol}
									/>
								)}
							</div>
						</div>
						<div className="border-t border-white/10 pt-6">
							<div className="flex items-center gap-2 mb-4">
								<span>🎨</span>
								<span className="text-sm font-semibold text-white">
									{t("calc.fdmFinishing")}
								</span>
							</div>
							<InputGroup
								label={t("calc.finishingSupplies")}
								value={store.fdmFinishing.suppliesCost}
								onChange={(v) =>
									handleInput(v, (val) =>
										store.setFdmFinishing({
											...store.fdmFinishing,
											suppliesCost: val,
										}),
									)
								}
								type="number"
								prefix={currencySymbol}
							/>
						</div>
					</>
				)}
				{!isFDM && (
					<>
						<div className="space-y-4">
							<div className="flex items-center gap-2 mb-2">
								<span>🧪</span>
								<span className="text-sm font-semibold text-white">
									{t("calc.resinPostProcess")}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-xs font-semibold text-gray-300">
									{t("calc.washing")}
								</span>
								<ToggleSwitch
									enabled={store.resinPostProcess.washingEnabled}
									onToggle={(v) =>
										store.setResinPostProcess({
											...store.resinPostProcess,
											washingEnabled: v,
										})
									}
								/>
							</div>
							{store.resinPostProcess.washingEnabled && (
								<div className="grid grid-cols-2 gap-3 pl-3 border-l-2 border-white/10">
									<InputGroup
										label={t("calc.alcoholCost")}
										value={store.resinPostProcess.alcoholCostPerLiter}
										onChange={(v) =>
											handleInput(v, (val) =>
												store.setResinPostProcess({
													...store.resinPostProcess,
													alcoholCostPerLiter: val,
												}),
											)
										}
										type="number"
										prefix="R$/L"
									/>
									<InputGroup
										label={t("calc.alcoholVol")}
										value={store.resinPostProcess.alcoholVolumeLiters}
										onChange={(v) =>
											handleInput(v, (val) =>
												store.setResinPostProcess({
													...store.resinPostProcess,
													alcoholVolumeLiters: val,
												}),
											)
										}
										type="number"
										unit="L"
									/>
								</div>
							)}
							<div className="flex items-center justify-between">
								<span className="text-xs font-semibold text-gray-300">
									{t("calc.curing")}
								</span>
								<ToggleSwitch
									enabled={store.resinPostProcess.curingEnabled}
									onToggle={(v) =>
										store.setResinPostProcess({
											...store.resinPostProcess,
											curingEnabled: v,
										})
									}
								/>
							</div>
							{store.resinPostProcess.curingEnabled && (
								<div className="grid grid-cols-2 gap-3 pl-3 border-l-2 border-white/10">
									<InputGroup
										label={t("calc.cureTime")}
										value={store.resinPostProcess.curingTimeMinutes}
										onChange={(v) =>
											handleInput(v, (val) =>
												store.setResinPostProcess({
													...store.resinPostProcess,
													curingTimeMinutes: val,
												}),
											)
										}
										type="number"
										unit="min"
									/>
									<InputGroup
										label={t("calc.curePower")}
										value={store.resinPostProcess.curingPowerWatts}
										onChange={(v) =>
											handleInput(v, (val) =>
												store.setResinPostProcess({
													...store.resinPostProcess,
													curingPowerWatts: val,
												}),
											)
										}
										type="number"
										unit="W"
									/>
								</div>
							)}
						</div>
						<div className="border-t border-white/10 pt-6">
							<div className="flex items-center gap-2 mb-4">
								<span>🖥️</span>
								<span className="text-sm font-semibold text-white">
									{t("calc.resinHardware")}
								</span>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<InputGroup
									label={t("calc.lcdCost")}
									value={store.resinHardware.lcdCost}
									onChange={(v) =>
										handleInput(v, (val) =>
											store.setResinHardware({
												...store.resinHardware,
												lcdCost: val,
											}),
										)
									}
									type="number"
									prefix={currencySymbol}
								/>
								<InputGroup
									label={t("calc.lcdLife")}
									value={store.resinHardware.lcdLifespanHours}
									onChange={(v) =>
										handleInput(v, (val) =>
											store.setResinHardware({
												...store.resinHardware,
												lcdLifespanHours: val,
											}),
										)
									}
									type="number"
									unit="h"
								/>
								<InputGroup
									label={t("calc.fepCost")}
									value={store.resinHardware.fepCost}
									onChange={(v) =>
										handleInput(v, (val) =>
											store.setResinHardware({
												...store.resinHardware,
												fepCost: val,
											}),
										)
									}
									type="number"
									prefix={currencySymbol}
								/>
								<InputGroup
									label={t("calc.fepLife")}
									value={store.resinHardware.fepLifespanPrints}
									onChange={(v) =>
										handleInput(v, (val) =>
											store.setResinHardware({
												...store.resinHardware,
												fepLifespanPrints: val,
											}),
										)
									}
									type="number"
									unit="prints"
								/>
							</div>
						</div>
					</>
				)}
			</div>
		);
	}







	function renderOpsSection() {
		return (
			<div className="glass rounded-2xl p-4 sm:p-5">
			{renderSectionHeader(
				ShieldCheck,
				t("calc.opsSoftware"),
				t("calc.sectionDesc.ops"),
				"ops",
			)}
				<div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
					<div>
						<div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
							<span className="text-xs font-semibold text-gray-300">
								{t("calc.ppe")}
							</span>
							<ToggleSwitch
								enabled={isFDM ? store.fdmOps.enabled : store.resinOps.enabled}
								onToggle={(v) =>
									isFDM
										? store.setFdmOps({ ...store.fdmOps, enabled: v })
										: store.setResinOps({ ...store.resinOps, enabled: v })
								}
							/>
						</div>
						{(isFDM ? store.fdmOps.enabled : store.resinOps.enabled) && (
							<InputGroup
								label={t("calc.ppeCost")}
								value={
									isFDM
										? store.fdmOps.ppeCostPerPrint
										: store.resinOps.ppeCostPerPrint
								}
								onChange={(v) =>
									handleInput(v, (val) =>
										isFDM
											? store.setFdmOps({
													...store.fdmOps,
													ppeCostPerPrint: val,
												})
											: store.setResinOps({
													...store.resinOps,
													ppeCostPerPrint: val,
												}),
									)
								}
								type="number"
								prefix={currencySymbol}
							/>
						)}
					</div>
					<div>
						<div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
							<span className="text-xs font-semibold text-gray-300">
								{t("calc.software")}
							</span>
							<ToggleSwitch
								enabled={
									isFDM ? store.fdmSoft.enabled : store.resinSoft.enabled
								}
								onToggle={(v) =>
									isFDM
										? store.setFdmSoft({ ...store.fdmSoft, enabled: v })
										: store.setResinSoft({ ...store.resinSoft, enabled: v })
								}
							/>
						</div>
						{(isFDM ? store.fdmSoft.enabled : store.resinSoft.enabled) && (
							<div className="space-y-3">
								<InputGroup
									label={t("calc.slicerCost")}
									value={
										isFDM
											? store.fdmSoft.slicerMonthlyCost
											: store.resinSoft.slicerMonthlyCost
									}
									onChange={(v) =>
										handleInput(v, (val) =>
											isFDM
												? store.setFdmSoft({
														...store.fdmSoft,
														slicerMonthlyCost: val,
													})
												: store.setResinSoft({
														...store.resinSoft,
														slicerMonthlyCost: val,
													}),
										)
									}
									type="number"
									prefix={currencySymbol}
								/>
								<InputGroup
									label={t("calc.modelCost")}
									value={
										isFDM
											? store.fdmSoft.modelFileCost
											: store.resinSoft.modelFileCost
									}
									onChange={(v) =>
										handleInput(v, (val) =>
											isFDM
												? store.setFdmSoft({
														...store.fdmSoft,
														modelFileCost: val,
													})
												: store.setResinSoft({
														...store.resinSoft,
														modelFileCost: val,
													}),
										)
									}
									type="number"
									prefix={currencySymbol}
								/>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	function renderSalesSection() {
		return (
			<div className="glass rounded-2xl p-4 sm:p-5">
				{renderSectionHeader(
					DollarSign,
					t("calc.sales"),
					t("calc.sectionDesc.sales"),
					"sales",
				)}
				<div className="space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<InputGroup
							label={t("calc.quantity")}
							value={store.quantity}
							onChange={(v) =>
								handleInput(v, (val) => store.setQuantity(val > 0 ? val : 1))
							}
							type="number"
							unit="un"
						/>
						{isFieldVisible("sales", "infillPercent") && (
							<InputGroup
								label={t("calc.infillPercent")}
								value={store.infillPercent}
								onChange={(v) =>
									handleInput(v, (val) => store.setInfillPercent(val))
								}
								type="number"
								unit="%"
							/>
						)}
					</div>
					{isFieldVisible("sales", "extrasCost") && (
						<InputGroup
							label={t("calc.extras")}
							value={
								isFDM
									? store.fdmExtras.extrasCost
									: store.resinExtras.extrasCost
							}
							onChange={(v) =>
								handleInput(v, (val) =>
									isFDM
										? store.setFdmExtras({ extrasCost: val })
										: store.setResinExtras({ extrasCost: val }),
								)
							}
							type="number"
							prefix={currencySymbol}
						/>
					)}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<InputGroup
							label={t("calc.packaging")}
							value={
								isFDM
									? store.fdmSales.packagingCost
									: store.resinSales.packagingCost
							}
							onChange={(v) =>
								handleInput(v, (val) =>
									isFDM
										? store.setFdmSales({
												...store.fdmSales,
												packagingCost: val,
											})
										: store.setResinSales({
												...store.resinSales,
												packagingCost: val,
											}),
								)
							}
							type="number"
							prefix={currencySymbol}
						/>
						{isFieldVisible("sales", "shippingCost") && (
							<InputGroup
								label={t("calc.shipping")}
								value={
									isFDM
										? store.fdmSales.shippingCost
										: store.resinSales.shippingCost
								}
								onChange={(v) =>
									handleInput(v, (val) =>
										isFDM
											? store.setFdmSales({
													...store.fdmSales,
													shippingCost: val,
												})
											: store.setResinSales({
													...store.resinSales,
													shippingCost: val,
												}),
									)
								}
								type="number"
								prefix={currencySymbol}
							/>
						)}
					</div>
					{isFieldVisible("sales", "marketplace") && (
						<>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<Select
									label={t("calc.marketplace")}
									value={store.selectedMarketplace.id}
									onChange={handleMarketplaceChange}
									options={catalogMarketplaces.map((m) => ({
										label: m.name,
										value: m.id,
										subtitle: `${m.feePercent}% + R$ ${m.feeFixed}`,
									}))}
								/>
								<InputGroup
									label={t("calc.taxPercent")}
									value={
										isFDM
											? store.fdmSales.taxPercent
											: store.resinSales.taxPercent
									}
									onChange={(v) =>
										handleInput(v, (val) =>
											isFDM
												? store.setFdmSales({
														...store.fdmSales,
														taxPercent: val,
													})
												: store.setResinSales({
														...store.resinSales,
														taxPercent: val,
													}),
										)
									}
									type="number"
									unit="%"
								/>
							</div>
							<div className="glass rounded-xl p-4 sm:p-5">
								<div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between mb-2">
									<span className="text-xs sm:text-sm text-gray-400">
										{t("calc.markupPresets")}
									</span>
									<div className="flex flex-wrap gap-1.5">
										{[100, 150, 200, 250, 300, 500].map((pct) => (
											<button
												key={pct}
												onClick={() =>
													isFDM
														? store.setFdmSales({
																...store.fdmSales,
																profitMarginPercent: pct,
															})
														: store.setResinSales({
																...store.resinSales,
																profitMarginPercent: pct,
															})
												}
												className={`px-3 min-h-[44px] text-[11px] sm:text-xs rounded-md transition-all flex items-center ${
													(
														isFDM
															? store.fdmSales.profitMarginPercent
															: store.resinSales.profitMarginPercent
													) === pct
														? "bg-purple-600 text-white"
														: "bg-white/5 text-gray-400 hover:text-white"
												}`}
											>
												{pct}%
											</button>
										))}
									</div>
								</div>
							</div>
						</>
					)}
					<div className="glass rounded-xl p-4 sm:p-5">
						<InputGroup
							label={t("calc.profitMargin")}
							value={
								isFDM
									? store.fdmSales.profitMarginPercent
									: store.resinSales.profitMarginPercent
							}
							onChange={(v) =>
								handleInput(v, (val) =>
									isFDM
										? store.setFdmSales({
												...store.fdmSales,
												profitMarginPercent: val,
											})
										: store.setResinSales({
												...store.resinSales,
												profitMarginPercent: val,
											}),
								)
							}
							type="number"
							unit="%"
						/>
					</div>
				</div>
			</div>
		);
	}

	function renderRightSidebar() {
		return <ResultsPanel variant="sidebar" />;
	}

	return (
		<>
			<ToastContainer items={toastItems} onDismiss={dismissToast} />
			<div className="flex gap-4 xl:gap-6 pb-20 lg:pb-0">
			{/* Tablet section nav — icons only */}
			<nav className="hidden md:flex lg:hidden flex-col gap-0.5 w-14 shrink-0 sticky top-[92px] h-fit">
				{visibleSections.map((s) => {
					const keys = SECTION_ENABLES[s.id] || [];
					const anyEnabled = keys.length === 0 || keys.some((k) => store.enabledSections[k]);
					return (
						<div key={s.id} className="px-1">
							<button
								onClick={() => {
									setActiveSection(s.id);
									document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
								}}
								className={`w-full py-2 px-1 rounded-xl flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
									activeSection === s.id
										? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
										: `text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent ${
											keys.length > 0 && !anyEnabled ? "opacity-50" : ""
										}`
								}`}
								title={t(s.label)}
							>
								<s.Icon className={`w-4 h-4 ${activeSection === s.id ? "text-indigo-400" : ""}`} />
							</button>
						</div>
					);
				})}
			</nav>

			{/* Desktop sidebar — icon + label + cost toggle dot */}
			<nav className="hidden lg:flex flex-col gap-0.5 w-[134px] xl:w-[142px] shrink-0 sticky top-[92px] h-fit">
					{visibleSections.map((s) => {
						const keys = SECTION_ENABLES[s.id] || [];
						const anyEnabled =
							keys.length === 0 || keys.some((k) => store.enabledSections[k]);
						return (
							<div key={s.id} className="px-1">
								<button
									onClick={() => {
										setActiveSection(s.id);
										document
											.getElementById(`section-${s.id}`)
											?.scrollIntoView({ behavior: "smooth", block: "start" });
									}}
									className={`w-full py-2.5 px-2 rounded-xl flex items-center gap-2 transition-all text-left focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
										activeSection === s.id
											? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
											: `text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent ${
													keys.length > 0 && !anyEnabled ? "opacity-50" : ""
												}`
									}`}
									title={t(s.label)}
								>
									<s.Icon
										className={`w-4 h-4 shrink-0 ${activeSection === s.id ? "text-indigo-400" : ""}`}
									/>
									<span className="text-[11px] font-medium leading-tight">
										{t(s.shortKey)}
									</span>
								</button>
							</div>
						);
					})}
				</nav>

				{/* Content */}
				<div className="flex-1 min-w-0 space-y-4">
					{/* FDM / Resina tabs */}
					<div className="segmented-control">
						<button
							onClick={() => store.setActiveTab("fdm")}
							className={`segmented-btn focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${isFDM ? "active-fdm" : ""}`}
						>
							<Printer className="w-4 h-4" />
							{t("calc.fdm")}
						</button>
						<button
							onClick={() => store.setActiveTab("resin")}
							className={`segmented-btn focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none ${!isFDM ? "active-resin" : ""}`}
						>
							<FlaskConical className="w-4 h-4" />
							{t("calc.resin")}
						</button>
					</div>

					{/* Level toggle */}
					<div className="segmented-control">
						{(['basic', 'intermediate', 'advanced'] as const).map((level) => (
							<button
								key={level}
								type="button"
								onClick={() => store.setCalcLevel(level)}
								className={`segmented-btn focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${store.calcLevel === level ? `active-${level}` : ''}`}
							>
								{t(LEVEL_LABELS[level])}
							</button>
						))}
					</div>

					{/* Product Name */}
					<div className="glass rounded-2xl px-5 py-5">
						<InputGroup
							label={t("calc.productName")}
							value={store.productName}
							onChange={(v) => store.setProductName(v)}
							type="text"
							placeholder={t("calc.productNamePlaceholder")}
						/>
					</div>

					{/* All sections */}
					<div className="space-y-4">
						{visibleSections.map((s) => {
							switch (s.id) {
								case "material":
									return (
										<div
											key="material"
											id="section-material"
											className="scroll-mt-24"
										>
											<MaterialSection
												renderSectionHeader={renderSectionHeader}
												t={t}
												currencySymbol={currencySymbol}
												handleInput={handleInput}
												isFDM={isFDM}
												store={store}
												isFieldVisible={isFieldVisible}
												fileInputRef={fileInputRef}
												stlGeometry={stlGeometry}
												stlInfo={stlInfo}
												stlLoading={stlLoading}
												handleFileDrop={handleFileDrop}
												showSpoolSelector={showSpoolSelector}
												setShowSpoolSelector={setShowSpoolSelector}
												inventorySpools={inventorySpools}
												catalogMaterials={catalogMaterials}
											/>
										</div>
									);
								case "print":
									return (
										<div
											key="print"
											id="section-print"
											className="scroll-mt-24"
										>
											<PrintSection
												renderSectionHeader={renderSectionHeader}
												t={t}
												currencySymbol={currencySymbol}
												handleInput={handleInput}
												isFDM={isFDM}
												store={store}
												isFieldVisible={isFieldVisible}
												handlePrinterSelect={handlePrinterSelect}
												catalogPrinters={catalogPrinters}
											/>
										</div>
									);
								case "failure":
									return (
										<div
											key="failure"
											id="section-failure"
											className="scroll-mt-24"
										>
											<FailureSection
												renderSectionHeader={renderSectionHeader}
												t={t}
												currencySymbol={currencySymbol}
												handleInput={handleInput}
												isFDM={isFDM}
												store={store}
											/>
										</div>
									);
								case "hardware":
									return (
										<div
											key="hardware"
											id="section-hardware"
											className="scroll-mt-24"
										>
											{renderHardwareSection()}
										</div>
									);
							case "machine":
								return (
									<div
										key="machine"
										id="section-machine"
										className="scroll-mt-24"
									>
										<MachineSection
											renderSectionHeader={renderSectionHeader}
											t={t}
											currencySymbol={currencySymbol}
											handleInput={handleInput}
											isFDM={isFDM}
											store={store}
										/>
									</div>
								);
							case "fixedCost":
								return (
									<div
										key="fixedCost"
										id="section-fixedCost"
										className="scroll-mt-24"
									>
										<FixedCostsSection
											renderSectionHeader={renderSectionHeader}
											t={t}
											currencySymbol={currencySymbol}
											handleInput={handleInput}
											store={store}
										/>
									</div>
								);
							case "labor":
								return (
									<div
										key="labor"
										id="section-labor"
										className="scroll-mt-24"
									>
										<LaborSection
											renderSectionHeader={renderSectionHeader}
											t={t}
											currencySymbol={currencySymbol}
											handleInput={handleInput}
											isFDM={isFDM}
											store={store}
										/>
									</div>
								);
								case "ops":
									return (
										<div key="ops" id="section-ops" className="scroll-mt-24">
											{renderOpsSection()}
										</div>
									);
								case "sales":
									return (
										<div
											key="sales"
											id="section-sales"
											className="scroll-mt-24"
										>
											{renderSalesSection()}
										</div>
									);
								case "results":
									return (
										<div
											key="results"
											id="section-results"
											className="scroll-mt-24 lg:hidden"
										>
											<ResultsPanel variant="mobile" />
										</div>
									);
								default:
									return null;
							}
						})}
					</div>
				</div>

				{/* Desktop right sidebar — always visible */}
				<div className="hidden lg:flex flex-col gap-4 w-[320px] xl:w-[360px] shrink-0 sticky top-[92px] self-start max-h-[calc(100vh-92px)] overflow-y-auto">
					{renderRightSidebar()}
				</div>
			</div>

			{/* Mobile bottom bar — consolidated nav + results */}
			<div
				className="fixed bottom-0 left-0 right-0 z-30 lg:hidden"
				style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
			>
				{/* Results mini-bar */}
				<div
					className="flex items-center justify-between gap-3 px-3 py-1.5 border-t border-white/[0.06]"
					style={{
						background: "rgba(6,8,24,0.92)",
						backdropFilter: "blur(16px)",
					}}
				>
					<div className="flex gap-3 text-[11px]">
						<span className="text-slate-200">
							<span className="text-slate-500 mr-1">Custo</span>
							{fmtCurrency(results.totalCost)}
						</span>
						<span className="text-emerald-400 font-bold">
							<span className="text-slate-500 mr-1">Venda</span>
							{fmtCurrency(results.sellPrice)}
						</span>
						<span className="text-amber-400">
							<span className="text-slate-500 mr-1">Lucro</span>
							{fmtCurrency(results.profit)}
						</span>
					</div>
				</div>
				{/* Section nav */}
				<nav
					style={{
						background: "rgba(6,8,24,0.95)",
						backdropFilter: "blur(20px)",
						borderTop: "1px solid rgba(255,255,255,0.07)",
					}}
				>
					<div className="relative">
						<div className="flex h-12 overflow-x-auto scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
							{visibleSections.map((s) => (
								<button
									key={s.id}
									onClick={() => {
										setActiveSection(s.id);
										document
											.getElementById(`section-${s.id}`)
											?.scrollIntoView({ behavior: "smooth", block: "start" });
									}}
									className={`flex flex-col items-center justify-center gap-0.5 min-w-[52px] flex-shrink-0 min-h-[44px] text-[8px] font-semibold tracking-wide transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
										activeSection === s.id
											? "text-indigo-400"
											: "text-slate-600 hover:text-slate-400"
									}`}
								>
									<s.Icon
										className={`w-[15px] h-[15px] transition-transform ${activeSection === s.id ? "scale-110" : ""}`}
									/>
									<span className="truncate max-w-[52px] leading-tight">
										{t(s.shortKey)}
									</span>
								</button>
							))}
						</div>
						{/* Fade gradient on right edge to indicate scrollability */}
						<div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[rgba(6,8,24,0.95)] to-transparent pointer-events-none" />
					</div>
				</nav>
			</div>
		</>
	);
}
