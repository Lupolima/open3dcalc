import { useTranslation } from "react-i18next";
import { useCalculatorStore } from "@/stores/calculatorStore";
import { useShallow } from "zustand/react/shallow";
import { SECTIONS, LEVEL_SECTIONS, SECTION_ENABLES } from "./Calculator.constants";

interface SectionNavProps {
	activeSection: string;
	onSectionClick: (id: string) => void;
}

export function SectionNav({ activeSection, onSectionClick }: SectionNavProps) {
	const { t } = useTranslation();
	const { calcLevel, enabledSections } = useCalculatorStore(
		useShallow((s) => ({ calcLevel: s.calcLevel, enabledSections: s.enabledSections })),
	);

	const visibleSections = SECTIONS.filter((s) =>
		LEVEL_SECTIONS[calcLevel].includes(s.id),
	);

	return (
		<>
			{/* Tablet section nav — icons only */}
			<nav className="hidden md:flex lg:hidden flex-col gap-0.5 w-14 shrink-0 sticky top-[92px] h-fit">
				{visibleSections.map((s) => {
					const keys = SECTION_ENABLES[s.id] || [];
					const anyEnabled =
						keys.length === 0 || keys.some((k) => enabledSections[k]);
					return (
						<div key={s.id} className="px-1">
							<button
								onClick={() => {
									onSectionClick(s.id);
									document
										.getElementById(`section-${s.id}`)
										?.scrollIntoView({ behavior: "smooth", block: "start" });
								}}
							className={`w-full py-2 px-1 rounded-xl flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none ${
								activeSection === s.id
									? "bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30"
									: `text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] border border-transparent ${
											keys.length > 0 && !anyEnabled ? "opacity-50" : ""
										}`
							}`}
								title={t(s.label)}
							>
								<s.Icon
									className={`w-4 h-4 ${activeSection === s.id ? "text-[var(--color-accent)]" : ""}`}
								/>
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
						keys.length === 0 || keys.some((k) => enabledSections[k]);
					return (
						<div key={s.id} className="px-1">
							<button
								onClick={() => {
									onSectionClick(s.id);
									document
										.getElementById(`section-${s.id}`)
										?.scrollIntoView({ behavior: "smooth", block: "start" });
								}}
							className={`w-full py-2.5 px-2 rounded-xl flex items-center gap-2 transition-all text-left focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none ${
								activeSection === s.id
									? "bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30"
									: `text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] border border-transparent ${
											keys.length > 0 && !anyEnabled ? "opacity-50" : ""
										}`
							}`}
								title={t(s.label)}
							>
								<s.Icon
									className={`w-4 h-4 shrink-0 ${activeSection === s.id ? "text-[var(--color-accent)]" : ""}`}
								/>
								<span className="text-[11px] font-medium leading-tight">
									{t(s.shortKey)}
								</span>
							</button>
						</div>
					);
				})}
			</nav>
		</>
	);
}
