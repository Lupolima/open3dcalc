-- Open3DCalc Desktop — Migration 0001: Seed default theme preference
-- Uses the `storage` table (IPC persistence layer) for renderer access.
-- The `app_settings` table is only accessible via Drizzle ORM in the
-- main process, so we store theme here for cross-process consistency.

-- Seed default theme if not already set
INSERT OR IGNORE INTO `storage` (`key`, `value`, `updated_at`)
VALUES ('open3dcalc_theme', 'system', 0);
