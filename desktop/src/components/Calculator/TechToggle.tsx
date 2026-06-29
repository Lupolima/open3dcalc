import { FlaskConical, Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCalculatorStore } from "@/stores/calculatorStore";
import { useShallow } from "zustand/react/shallow";

export function TechToggle() {
	const { t } = useTranslation();
	const { activeTab, setActiveTab } = useCalculatorStore(
		useShallow((s) => ({ activeTab: s.activeTab, setActiveTab: s.setActiveTab })),
	);

	return (
		<div className="flex rounded-lg overflow-hidden border border-[var(--color-border)]">
			<button
				onClick={() => setActiveTab("fdm")}
				className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none ${
					activeTab === "fdm"
						? "bg-[var(--color-accent)] text-[var(--color-text-primary)]"
						: "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
				}`}
			>
				<Printer className="w-4 h-4" />
				{t("calc.fdm")}
			</button>
			<button
				onClick={() => setActiveTab("resin")}
				className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none ${
					activeTab === "resin"
						? "bg-[var(--color-accent)] text-[var(--color-text-primary)]"
						: "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
				}`}
			>
				<FlaskConical className="w-4 h-4" />
				{t("calc.resin")}
			</button>
		</div>
	);
}
