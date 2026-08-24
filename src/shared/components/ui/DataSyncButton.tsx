import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { DataSyncModal } from "./DataSyncModal";

interface DataSyncButtonProps {
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Settings-menu entry that opens the DataSyncModal. Matches the menu-item
 * styling used in the Header settings sheet (icon + label, full width).
 */
export function DataSyncButton({
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

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={t("sync.title")}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none min-h-[48px] ${className}`}
      >
        <RefreshCw className="w-[18px] h-[18px] shrink-0 text-[var(--color-accent-light)]" />
        <span className="text-sm font-medium">{t("sync.title")}</span>
      </button>

      <DataSyncModal open={open} onRequestClose={handleClose} />
    </>
  );
}
