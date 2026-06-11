import { FlaskConical, Layers, Upload } from 'lucide-react'
import { Suspense } from 'react'
import { InputGroup } from '@/components/ui/InputGroup'
import { Select } from '@/components/ui/Select'
import type { BufferGeometry } from 'three'
import type { CalculatorState } from '@/stores/calculatorStore'
import { selectSpool } from '@/stores/storeBridge'

// Lazy-loaded STL preview
import { lazy } from 'react'
const StlPreview = lazy(() =>
	import("@/components/StlPreview/StlPreview").then((m) => ({
		default: m.StlPreview,
	})),
)

export interface MaterialSectionProps {
	renderSectionHeader: (
		Icon: typeof Layers,
		title: string,
		subtitle?: string,
		sectionId?: string,
	) => React.ReactNode
	t: (key: string) => string
	currencySymbol: string
	handleInput: (value: string, setter: (v: number) => void) => void
	isFDM: boolean
	store: CalculatorState
	isFieldVisible: (sectionId: string, fieldId: string) => boolean
	fileInputRef: React.RefObject<HTMLInputElement | null>
	stlGeometry: BufferGeometry | null
	stlInfo: {
		volume: number
		faces: number
		vertices: number
		dimensions: { x: number; y: number; z: number }
	} | null
	stlLoading: boolean
	handleFileDrop: (file: File) => void
	showSpoolSelector: boolean
	setShowSpoolSelector: (show: boolean) => void
	inventorySpools: Array<{
		id: string
		brand: string
		color: string
		material: string
		costPerKg: number
	}>
	catalogMaterials: Array<{
		name: string
		type: string
	}>
}

export function MaterialSection({
	renderSectionHeader,
	t,
	currencySymbol,
	handleInput,
	isFDM,
	store,
	isFieldVisible,
	fileInputRef,
	stlGeometry,
	stlInfo,
	stlLoading,
	handleFileDrop,
	showSpoolSelector,
	setShowSpoolSelector,
	inventorySpools,
	catalogMaterials,
}: MaterialSectionProps) {
	return (
		<div className="glass rounded-2xl p-4 sm:p-5">
			{renderSectionHeader(
				isFDM ? Layers : FlaskConical,
				t("calc.material"),
				t(
					isFDM
						? "calc.sectionDesc.fdmMaterial"
						: "calc.sectionDesc.resinMaterial",
				),
				"material",
			)}
			{isFDM ? (
				<>
					{isFieldVisible("material", "purgeWeight") && (store.selectedPrinter.maxFilaments ?? 1) > 1 && (
						<div className="flex items-center justify-end gap-2 mb-3">
							<span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wide">
								AMS Multi-material
							</span>
							<button
								onClick={() => {
									const was = store.fdmAmsEnabled;
									if (!was) {
										const slot0 = { ...store.fdmAmsSlots[0] };
										slot0.materialType = store.fdmMaterial.type;
										slot0.costPerKg = store.fdmMaterial.costPerKg;
										slot0.weightUsedGrams = store.fdmMaterial.weightUsed;
										slot0.purgeWeightGrams = store.fdmMaterial.purgeWeight;
										slot0.density = store.fdmMaterial.density;
										slot0.spoolEfficiency = store.fdmMaterial.spoolEfficiency;
										store.setFdmAmsSlot(0, slot0);
									}
									store.setFdmAmsEnabled(!was);
								}}
								aria-pressed={store.fdmAmsEnabled}
								className={`relative w-9 h-4 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none shrink-0 ${store.fdmAmsEnabled ? "bg-sky-600" : "bg-white/10"}`}
							>
								<span
									className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-md transition-all duration-200 ${store.fdmAmsEnabled ? "left-[18px]" : "left-0.5"}`}
								/>
							</button>
						</div>
					)}
					{store.fdmAmsEnabled ? (
						<div className="space-y-2">
							{store.fdmAmsSlots.map((slot, i) => (
								<div
									key={i}
									className="glass rounded-xl p-3 border-l-4"
									style={{ borderLeftColor: slot.color }}
								>
									<div className="flex items-center justify-between mb-2">
										<span className="text-[10px] font-bold text-gray-400">
											Slot {i + 1}
										</span>
										<div className="flex items-center gap-2">
											<input
												type="color"
												value={slot.color}
												onChange={(e) =>
													store.setFdmAmsSlot(i, {
														...slot,
														color: e.target.value,
													})
												}
												className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
											/>
											<button
												onClick={() => {
													const s = { ...slot, enabled: !slot.enabled };
													store.setFdmAmsSlot(i, s);
												}}
												className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${slot.enabled ? "bg-sky-600/30 text-sky-300" : "bg-white/5 text-gray-500"}`}
											>
												{slot.enabled ? "Ativo" : "Inativo"}
											</button>
										</div>
									</div>
									{slot.enabled && (
										<div className="space-y-2">
											<Select
												label=""
												value={slot.materialType}
												onChange={(v) =>
													store.setFdmAmsSlot(i, { ...slot, materialType: v })
												}
												options={catalogMaterials
													.filter((m) => m.type === "fdm")
													.map((m) => ({ label: m.name, value: m.name }))}
											/>
											<div className="grid grid-cols-2 gap-2">
												<InputGroup
													label="R$/kg"
													value={slot.costPerKg}
													onChange={(v) =>
														store.setFdmAmsSlot(i, {
															...slot,
															costPerKg: parseFloat(v) || 0,
														})
													}
													type="number"
													prefix={currencySymbol}
												/>
												<InputGroup
													label="Peso (g)"
													value={slot.weightUsedGrams}
													onChange={(v) =>
														store.setFdmAmsSlot(i, {
															...slot,
															weightUsedGrams: parseFloat(v) || 0,
														})
													}
													type="number"
													unit="g"
												/>
											</div>
											<div className="grid grid-cols-2 gap-2">
												<InputGroup
													label="Purga (g)"
													value={slot.purgeWeightGrams}
													onChange={(v) =>
														store.setFdmAmsSlot(i, {
															...slot,
															purgeWeightGrams: parseFloat(v) || 0,
														})
													}
													type="number"
													unit="g"
												/>
												<InputGroup
													label="Dens."
													value={slot.density}
													onChange={(v) =>
														store.setFdmAmsSlot(i, {
															...slot,
															density: parseFloat(v) || 0,
														})
													}
													type="number"
													unit="g/cm³"
												/>
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<Select
								label={t("calc.filamentType")}
								value={store.fdmMaterial.type}
								onChange={(v) =>
									store.setFdmMaterial({ ...store.fdmMaterial, type: v })
								}
								options={catalogMaterials
									.filter((m) => m.type === "fdm")
									.map((m) => ({ label: m.name, value: m.name }))}
							/>
							<div className="relative">
								<InputGroup
									label={t("calc.costPerKg")}
									value={store.fdmMaterial.costPerKg}
									onChange={(v) =>
										handleInput(v, (val) =>
											store.setFdmMaterial({
												...store.fdmMaterial,
												costPerKg: val,
											}),
										)
									}
									type="number"
									prefix={currencySymbol}
								/>
								{inventorySpools.length > 0 && (
									<button
										type="button"
										onClick={() => setShowSpoolSelector(!showSpoolSelector)}
										className={`absolute right-2 top-7 text-[10px] px-2 py-1 rounded-md transition-colors ${
											showSpoolSelector
												? "bg-indigo-500/30 text-indigo-200 border border-indigo-500/40"
												: "bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50"
										}`}
									>
										Inventário
									</button>
								)}
								{showSpoolSelector && (
									<div className="absolute z-20 mt-1 w-full glass border border-white/10 rounded-xl p-1 max-h-48 overflow-y-auto shadow-xl">
										{inventorySpools
											.filter(
												(s) =>
													s.material.toLowerCase() ===
														store.fdmMaterial.type.toLowerCase() ||
													showSpoolSelector,
											)
											.slice(0, 10)
											.map((spool) => (
												<button
													key={spool.id}
													type="button"
													onClick={() => {
														selectSpool(spool);
														setShowSpoolSelector(false);
													}}
													className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-white/[0.06] transition-colors flex justify-between"
												>
													<span className="text-slate-200">
														{spool.brand} - {spool.color}
													</span>
													<span className="text-indigo-400">
														R$ {spool.costPerKg.toFixed(2)}/kg
													</span>
												</button>
											))}
										{inventorySpools.length === 0 && (
											<p className="text-xs text-slate-500 text-center py-2">
												Nenhum carretel no inventário
											</p>
										)}
									</div>
								)}
							</div>
							<InputGroup
								label={t("calc.weight")}
								value={store.fdmMaterial.weightUsed}
								onChange={(v) =>
									handleInput(v, (val) =>
										store.setFdmMaterial({
											...store.fdmMaterial,
											weightUsed: val,
										}),
									)
								}
								type="number"
								unit="g"
							/>
							{isFieldVisible("material", "purgeWeight") && (
								<InputGroup
									label={t("calc.purge")}
									value={store.fdmMaterial.purgeWeight}
									onChange={(v) =>
										handleInput(v, (val) =>
											store.setFdmMaterial({
												...store.fdmMaterial,
												purgeWeight: val,
											}),
										)
									}
									type="number"
									unit="g"
								/>
							)}
							{isFieldVisible("material", "spoolEfficiency") && (
								<InputGroup
									label={t("calc.spoolEfficiency")}
									value={store.fdmMaterial.spoolEfficiency}
									onChange={(v) =>
										handleInput(v, (val) =>
											store.setFdmMaterial({
												...store.fdmMaterial,
												spoolEfficiency: val,
											}),
										)
									}
									type="number"
									unit="%"
								/>
							)}
							{isFieldVisible("material", "density") && (
								<InputGroup
									label={t("calc.density")}
									value={store.fdmMaterial.density}
									onChange={(v) =>
										handleInput(v, (val) =>
											store.setFdmMaterial({
												...store.fdmMaterial,
												density: val,
											}),
										)
									}
									type="number"
									unit="g/cm³"
								/>
							)}
						</div>
					)}
					<div className="sm:col-span-2 mt-3">
						<button
							type="button"
							onDragOver={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
							onDrop={(e) => {
								e.preventDefault();
								const f = e.dataTransfer.files[0];
								if (f) handleFileDrop(f);
							}}
							onClick={() => fileInputRef.current?.click()}
							className="w-full border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none flex flex-col items-center gap-1.5"
							style={{ borderColor: "rgba(255,255,255,0.1)" }}
							onMouseEnter={(e) =>
								(e.currentTarget.style.borderColor = "rgba(79,70,229,0.4)")
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")
							}
						>
							<input
								ref={fileInputRef}
								type="file"
								accept=".stl,.obj,.3mf,.gcode"
								onChange={(e) => {
									const f = e.target.files?.[0];
									if (f) handleFileDrop(f);
								}}
								className="hidden"
							/>
							<Upload className="w-4 h-4 text-slate-500" />
							<p className="text-xs text-slate-300">
								{t("product.uploadStl")}
							</p>
							{stlLoading && (
								<p className="text-[10px] text-indigo-400">
									{t("stl.loading")}
								</p>
							)}
						</button>
						{stlGeometry && (
							<div className="mt-2 h-40">
								<Suspense
									fallback={
										<div className="text-xs text-gray-400">
											{t("common.loading")}
										</div>
									}
								>
									<StlPreview geometry={stlGeometry} />
								</Suspense>
							</div>
						)}
						{stlInfo && (
							<div className="grid grid-cols-3 gap-2 mt-2 text-xs">
								<div className="glass rounded-lg p-2 text-center">
									<p className="text-gray-500">{t("stl.volume")}</p>
									<p className="font-semibold text-purple-400">
										{stlInfo.volume.toFixed(1)} cm³
									</p>
								</div>
								<div className="glass rounded-lg p-2 text-center">
									<p className="text-gray-500">{t("stl.faces")}</p>
									<p className="font-semibold text-gray-200">
										{stlInfo.faces}
									</p>
								</div>
								<div className="glass rounded-lg p-2 text-center">
									<p className="text-gray-500">{t("stl.vertices")}</p>
									<p className="font-semibold text-gray-200">
										{stlInfo.vertices}
									</p>
								</div>
							</div>
						)}
					</div>
				</>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<Select
						label={t("calc.resinType")}
						value={store.resinMaterial.type}
						onChange={(v) =>
							store.setResinMaterial({ ...store.resinMaterial, type: v })
						}
						options={catalogMaterials
							.filter((m) => m.type === "resin")
							.map((m) => ({ label: m.name, value: m.name }))}
					/>
					<InputGroup
						label={t("calc.costPerLiter")}
						value={store.resinMaterial.costPerLiter}
						onChange={(v) =>
							handleInput(v, (val) =>
								store.setResinMaterial({
									...store.resinMaterial,
									costPerLiter: val,
								}),
							)
						}
						type="number"
						prefix={currencySymbol}
					/>
					<InputGroup
						label={t("calc.volumeMl")}
						value={store.resinMaterial.volumeUsedMl}
						onChange={(v) =>
							handleInput(v, (val) =>
								store.setResinMaterial({
									...store.resinMaterial,
									volumeUsedMl: val,
								}),
							)
						}
						type="number"
						unit="ml"
					/>
					{isFieldVisible("material", "wasteMargin") && (
						<InputGroup
							label={t("calc.wasteMargin")}
							value={store.resinMaterial.wasteMarginPercent}
							onChange={(v) =>
								handleInput(v, (val) =>
									store.setResinMaterial({
										...store.resinMaterial,
										wasteMarginPercent: val,
									}),
								)
							}
							type="number"
							unit="%"
						/>
					)}
				</div>
			)}
		</div>
	);
}
