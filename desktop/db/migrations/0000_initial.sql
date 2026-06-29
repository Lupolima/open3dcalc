-- Open3DCalc Desktop — Initial Migration
-- Drizzle ORM + better-sqlite3
-- All timestamps are Unix milliseconds (INTEGER)

-- ── Customers ─────────────────────────────────────────────────────────────

CREATE TABLE `customers` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `name` TEXT NOT NULL,
  `company` TEXT,
  `email` TEXT,
  `phone` TEXT,
  `address` TEXT,
  `notes` TEXT,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL
);

CREATE INDEX `idx_customers_email` ON `customers` (`email`);

-- ── Quotes ────────────────────────────────────────────────────────────────

CREATE TABLE `quotes` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `number` INTEGER NOT NULL UNIQUE,
  `title` TEXT NOT NULL,
  `customer_id` TEXT REFERENCES `customers`(`id`) ON DELETE SET NULL,
  `customer_snapshot` TEXT,
  `global_discount_percent` REAL DEFAULT 0,
  `subtotal` REAL DEFAULT 0,
  `discount_amount` REAL DEFAULT 0,
  `total` REAL DEFAULT 0,
  `status` TEXT DEFAULT 'draft' CHECK(`status` IN ('draft', 'sent', 'approved', 'rejected')),
  `valid_until` TEXT NOT NULL,
  `payment_terms` TEXT DEFAULT '',
  `delivery_estimate` TEXT DEFAULT '',
  `footer_note` TEXT,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL,
  `exported_at` INTEGER
);

CREATE INDEX `idx_quotes_customer_id` ON `quotes` (`customer_id`);
CREATE INDEX `idx_quotes_status` ON `quotes` (`status`);
CREATE INDEX `idx_quotes_created_at` ON `quotes` (`created_at`);

-- ── Quote Items ───────────────────────────────────────────────────────────

CREATE TABLE `quote_items` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  `quote_id` TEXT NOT NULL REFERENCES `quotes`(`id`) ON DELETE CASCADE,
  `history_entry_id` TEXT NOT NULL,
  `name` TEXT NOT NULL,
  `quantity` INTEGER DEFAULT 1,
  `unit_price` REAL DEFAULT 0,
  `total_price` REAL DEFAULT 0,
  `discount_percent` REAL DEFAULT 0
);

CREATE INDEX `idx_quote_items_quote_id` ON `quote_items` (`quote_id`);

-- ── History Entries ───────────────────────────────────────────────────────

CREATE TABLE `history_entries` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `timestamp` INTEGER NOT NULL,
  `type` TEXT NOT NULL CHECK(`type` IN ('fdm', 'resin')),
  `name` TEXT NOT NULL,
  `summary` TEXT DEFAULT '',
  `total_cost` REAL DEFAULT 0,
  `sell_price` REAL DEFAULT 0,
  `profit` REAL DEFAULT 0,
  `result_json` TEXT NOT NULL,
  `snapshot_json` TEXT
);

CREATE INDEX `idx_history_timestamp` ON `history_entries` (`timestamp`);
CREATE INDEX `idx_history_type` ON `history_entries` (`type`);
CREATE INDEX `idx_history_total_cost` ON `history_entries` (`total_cost`);
CREATE INDEX `idx_history_profit` ON `history_entries` (`profit`);

-- ── Filament Spools ───────────────────────────────────────────────────────

CREATE TABLE `filament_spools` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `brand` TEXT DEFAULT '',
  `material` TEXT DEFAULT 'PLA',
  `color` TEXT DEFAULT '',
  `color_hex` TEXT DEFAULT '',
  `weight_grams` REAL DEFAULT 0,
  `original_weight_grams` REAL DEFAULT 1000,
  `cost_per_kg` REAL DEFAULT 0,
  `diameter_mm` REAL DEFAULT 1.75,
  `date_added` INTEGER NOT NULL,
  `notes` TEXT DEFAULT '',
  `status` TEXT DEFAULT 'in_stock' CHECK(`status` IN ('in_stock', 'on_the_way', 'empty')),
  `purchase_store` TEXT DEFAULT ''
);

CREATE INDEX `idx_spools_brand` ON `filament_spools` (`brand`);
CREATE INDEX `idx_spools_material` ON `filament_spools` (`material`);
CREATE INDEX `idx_spools_status` ON `filament_spools` (`status`);

-- ── Catalog: Printers ─────────────────────────────────────────────────────

CREATE TABLE `catalog_printers` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `name` TEXT NOT NULL,
  `brand` TEXT NOT NULL,
  `power` REAL NOT NULL,
  `value` REAL NOT NULL,
  `useful_life` INTEGER NOT NULL,
  `maintenance_per_hour` REAL NOT NULL,
  `image` TEXT,
  `max_filaments` INTEGER,
  `custom` INTEGER DEFAULT 0
);

CREATE INDEX `idx_catalog_printers_brand` ON `catalog_printers` (`brand`);

-- ── Catalog: Materials ────────────────────────────────────────────────────

CREATE TABLE `catalog_materials` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `name` TEXT NOT NULL,
  `density` REAL NOT NULL,
  `avg_price` REAL NOT NULL,
  `type` TEXT NOT NULL CHECK(`type` IN ('fdm', 'resin')),
  `custom` INTEGER DEFAULT 0
);

CREATE INDEX `idx_catalog_materials_type` ON `catalog_materials` (`type`);

-- ── Catalog: Marketplaces ─────────────────────────────────────────────────

CREATE TABLE `catalog_marketplaces` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `name` TEXT NOT NULL,
  `fee_percent` REAL NOT NULL,
  `fee_fixed` REAL NOT NULL,
  `has_free_shipping` INTEGER DEFAULT 0,
  `shipping_fee_percent` REAL,
  `custom` INTEGER DEFAULT 0
);

-- ── Calculator State (single-row) ─────────────────────────────────────────

CREATE TABLE `calculator_state` (
  `id` INTEGER PRIMARY KEY DEFAULT 1 CHECK(`id` = 1),
  `state_json` TEXT NOT NULL,
  `updated_at` INTEGER NOT NULL
);

-- ── App Settings (key-value) ──────────────────────────────────────────────

CREATE TABLE `app_settings` (
  `key` TEXT PRIMARY KEY NOT NULL,
  `value` TEXT NOT NULL
);

-- ── Generic key-value storage (IPC persistence layer) ─────────────────────

CREATE TABLE IF NOT EXISTS `storage` (
  `key` TEXT PRIMARY KEY NOT NULL,
  `value` TEXT NOT NULL,
  `updated_at` INTEGER NOT NULL
);
