import { useTranslation } from "react-i18next";
import { useCalculatorStore } from "@/stores/calculatorStore";
import { useShallow } from "zustand/react/shallow";
import { LEVEL_LABELS, LEVEL_DESCRIPTIONS } from "./Calculator.constants";

export function LevelToggle() {
	const { t } = useTranslation();
	const { calcLevel, setCalcLevel } = useCalculatorStore(
		useShallow((s) => ({ calcLevel: s.calcLevel, setCalcLevel: s.setCalcLevel })),
	);

	return (
		<div className="flex rounded-lg overflow-hidden border border-[var(--color-border)]">
			{(['basic', 'intermediate', 'advanced'] as const).map((level) => (
				<button
					key={level}
					onClick={() => setCalcLevel(level)}
					className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none ${
						calcLevel === level
							? "bg-[var(--color-accent)] text-[var(--color-text-primary)]"
							: "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
					}`}
				>
					<div className="flex flex-col items-center gap-0.5">
						<span>{t(LEVEL_LABELS[level])}</span>
						<span className="text-[10px] opacity-70 leading-tight whitespace-nowrap">
							{t(LEVEL_DESCRIPTIONS[level])}
						</span>
					</div>
				</button>
			))}
		</div>
	);
}
