import { useTranslation } from "react-i18next";
import { useCalculatorStore } from "@/shared/stores/calculatorStore";
import { useShallow } from "zustand/react/shallow";

export function ProductName() {
	const { t } = useTranslation();
	const { productName, setProductName } = useCalculatorStore(
		useShallow((s) => ({ productName: s.productName, setProductName: s.setProductName })),
	);

	return (
		<div className="surface rounded-xl px-5 py-5">
			<input
				type="text"
				value={productName}
				onChange={(e) => setProductName(e.target.value)}
				placeholder={t("calc.productNamePlaceholder")}
				className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
			/>
		</div>
	);
}
