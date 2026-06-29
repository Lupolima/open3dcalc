import { useTranslation } from "react-i18next";
import { useCalculatorStore } from "@/stores/calculatorStore";
import { useShallow } from "zustand/react/shallow";

export function ProductName() {
	const { t } = useTranslation();
	const { productName, setProductName } = useCalculatorStore(
		useShallow((s) => ({ productName: s.productName, setProductName: s.setProductName })),
	);

	return (
		<div className="glass rounded-2xl px-5 py-5">
			<input
				type="text"
				value={productName}
				onChange={(e) => setProductName(e.target.value)}
				placeholder={t("calc.productNamePlaceholder")}
				className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
			/>
		</div>
	);
}
