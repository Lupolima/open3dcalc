import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { DataSyncModal } from "./DataSyncModal";

interface DataSyncButtonProps {
  /**
   * "menu" renders a full-width settings-sheet item (icon + label);
   * "icon" renders a compact header action button matching ThemeToggle.
   */
  variant?: "menu" | "icon";
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Button that opens the DataSyncModal. Supports two variants:
 * - "menu": full-width settings-sheet entry (icon + label)
 * - "icon": compact header action button (icon only, tooltip/aria-label)
 */
export function DataSyncButton({
  variant = "menu",
  className = "",
  onOpenChange,
}: DataSyncButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    onOpenChange?.(true);
  };

  const handleClose = () => {
    setOpen(false);
    onOpenChange?.(false);
  };

  const isIcon = variant === "icon";

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={t("sync.title")}
        title={t("sync.title")}
        className={
          isIcon
            ? `flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 min-h-[44px] min-w-[44px] rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-muted)] ${className}`
            : `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none min-h-[48px] ${className}`
        }
      >
        <RefreshCw
          className={
            isIcon
              ? "w-5 h-5"
              : "w-[18px] h-[18px] shrink-0 text-[var(--color-accent-light)]"
          }
        />
        {!isIcon && (
          <span className="text-sm font-medium">{t("sync.title")}</span>
        )}
      </button>

      <DataSyncModal open={open} onRequestClose={handleClose} />
    </>
  );
}
