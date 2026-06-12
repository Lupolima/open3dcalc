import { BarChart2, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCalculatorStore } from "@/stores/calculatorStore";
import { useShallow } from "zustand/react/shallow";
import { useCurrency } from "@/hooks/useCurrency";
import { SECTIONS, LEVEL_SECTIONS } from "./Calculator.constants";

interface MobileBottomBarProps {
	activeSection: string;
	onSectionClick: (id: string) => void;
}

export function MobileBottomBar({ activeSection, onSectionClick }: MobileBottomBarProps) {
	const { t } = useTranslation();
	const { results, productName, calcLevel } = useCalculatorStore(
		useShallow((s) => ({ results: s.results, productName: s.productName, calcLevel: s.calcLevel })),
	);
	const { format: fmtCurrency } = useCurrency();

	const visibleSections = SECTIONS.filter((s) =>
		LEVEL_SECTIONS[calcLevel].includes(s.id),
	);

	if (!results) return null;

	return (
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
				<div className="flex items-center gap-1 ml-auto">
					<button
						onClick={async () => {
							const { exportPdf } = await import("@/lib/pdfExport");
							exportPdf(results);
						}}
						className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
						title={t("calc.exportPdf")}
						aria-label={t("calc.exportPdf")}
					>
						<FileText className="w-3.5 h-3.5 text-gray-400" />
					</button>
					<button
						onClick={async () => {
							const { exportResultToCsv, downloadCsv } = await import(
								"@/lib/csvExport",
							);
							const csv = exportResultToCsv(
								results,
								productName || "open3dcalc",
							);
							downloadCsv(csv, "open3dcalc_resultado.csv");
						}}
						className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
						title={t("calc.exportCsv")}
						aria-label={t("calc.exportCsv")}
					>
						<BarChart2 className="w-3.5 h-3.5 text-gray-400" />
					</button>
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
									onSectionClick(s.id);
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
	);
}
