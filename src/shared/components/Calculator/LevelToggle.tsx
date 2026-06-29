import { useTranslation } from "react-i18next";
import { useCalculatorStore } from "@/shared/stores/calculatorStore";
import { useShallow } from "zustand/react/shallow";
import { LEVEL_LABELS } from "./Calculator.constants";

export function LevelToggle() {
	const { t } = useTranslation();
	const { calcLevel, setCalcLevel } = useCalculatorStore(
		useShallow((s) => ({ calcLevel: s.calcLevel, setCalcLevel: s.setCalcLevel })),
	);

	return (
		<div className="inline-flex items-center rounded-xl p-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]">
			{(['basic', 'intermediate', 'advanced'] as const).map((level) => (
				<button
					key={level}
					onClick={() => setCalcLevel(level)}
					className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none ${
						calcLevel === level
							? "bg-[var(--color-accent)] text-white shadow-md shadow-[var(--color-accent-muted)]"
							: "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
					}`}
				>
					{t(LEVEL_LABELS[level])}
				</button>
			))}
		</div>
	);
}
