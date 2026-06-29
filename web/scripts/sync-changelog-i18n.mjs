#!/usr/bin/env node
/**
 * scripts/sync-changelog-i18n.mjs
 *
 * Reads CHANGELOG.md and syncs new versions to i18n locale files
 * (pt-BR.json, en-US.json) for the in-app changelog.
 *
 * Usage: node scripts/sync-changelog-i18n.mjs
 *
 * Requirements:
 *   - CHANGELOG.md formatted with `## [version] — date` headers
 *   - `### emoji Title` section headers
 *   - `- item text` list items
 *   - Locale files with `changelog.versions` array (descending order)
 *
 * Uses only Node.js built-in modules.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const CHANGELOG_PATH = join(ROOT, 'CHANGELOG.md');
const LOCALES_DIR = join(ROOT, 'src', 'i18n', 'locales');

// ─── Section title mapping from Portuguese (CHANGELOG) → English (en-US) ───

const EN_SECTION_MAP = {
  '✨ Novo': '✨ New',
  '🎨 UX': '🎨 UX',
  '🔧 Técnico': '🔧 Technical',
  '📚 Qualidade': '📚 Quality',
  '🤖 CI & Automação': '🤖 CI & Automation',
  '🐛 Correções': '🐛 Fixes',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Parse a version header line: `## [1.5.0] — 2026-05-28`
 * Returns { version, date } or null.
 */
function parseVersionHeader(line) {
  const match = line.match(/^## \[(.+?)\]\s*[–—]\s*(\d{4}-\d{2}-\d{2})$/u);
  if (!match) return null;
  return { version: match[1].trim(), date: match[2] };
}

/**
 * Parse a section header line: `### ✨ Novo`
 * Returns the title text (e.g. `✨ Novo`) or null.
 */
function parseSectionHeader(line) {
  const match = line.match(/^###\s+(.+)$/u);
  if (!match) return null;
  return match[1].trim();
}

/**
 * Parse an item line: `- text`
 * Returns the text after `- ` or null.
 */
function parseItem(line) {
  const match = line.match(/^-\s+(.+)$/u);
  if (!match) return null;
  return match[1].trim();
}

/**
 * Parse full CHANGELOG.md content into structured versions array.
 * Returns [{ version, date, sections: [{ title, items }] }].
 */
function parseChangelog(content) {
  const versions = [];
  let currentVersion = null;
  let currentSection = null;

  const lines = content.split('\n');
  for (const line of lines) {
    const versionHeader = parseVersionHeader(line);
    if (versionHeader) {
      currentVersion = { ...versionHeader, sections: [] };
      currentSection = null;
      versions.push(currentVersion);
      continue;
    }

    if (!currentVersion) continue;

    const sectionTitle = parseSectionHeader(line);
    if (sectionTitle) {
      currentSection = { title: sectionTitle, items: [] };
      currentVersion.sections.push(currentSection);
      continue;
    }

    const item = parseItem(line);
    if (item !== null && currentSection) {
      currentSection.items.push(item);
    }
  }

  return versions;
}

/**
 * Simple semver comparison for major.minor[.patch].
 * Returns negative if a < b, positive if a > b, 0 if equal.
 */
function compareVersions(a, b) {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  const len = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < len; i++) {
    const numA = partsA[i] ?? 0;
    const numB = partsB[i] ?? 0;
    if (numA !== numB) return numA - numB;
  }
  return 0;
}

/**
 * Map a Portuguese section title to its English equivalent.
 */
function toEnSectionTitle(ptTitle) {
  return EN_SECTION_MAP[ptTitle] ?? ptTitle;
}

/**
 * Create a version entry object suitable for the i18n JSON structure.
 */
function createVersionEntry(changelogVersion, isEnglish) {
  return {
    version: changelogVersion.version,
    date: changelogVersion.date,
    sections: changelogVersion.sections.map((section) => ({
      title: isEnglish ? toEnSectionTitle(section.title) : section.title,
      items: [...section.items],
    })),
  };
}

/**
 * Insert a version entry into a descending-sorted array at the correct position.
 * Newest versions first (i.e., before the first older version).
 */
function insertVersionSorted(versions, newEntry) {
  const idx = versions.findIndex(
    (v) => compareVersions(v.version, newEntry.version) < 0,
  );
  if (idx === -1) {
    versions.push(newEntry);
  } else {
    versions.splice(idx, 0, newEntry);
  }
  return versions;
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  // 1. Read and parse CHANGELOG.md
  if (!existsSync(CHANGELOG_PATH)) {
    console.error('❌ CHANGELOG.md not found at', CHANGELOG_PATH);
    process.exit(1);
  }

  const changelogContent = readFileSync(CHANGELOG_PATH, 'utf-8');
  const changelogVersions = parseChangelog(changelogContent);

  if (changelogVersions.length === 0) {
    console.log('ℹ No versions found in CHANGELOG.md');
    process.exit(0);
  }

  // 2. Process each locale file
  const localeFiles = [
    {
      path: join(LOCALES_DIR, 'pt-BR.json'),
      lang: 'pt-BR',
      isEnglish: false,
    },
    {
      path: join(LOCALES_DIR, 'en-US.json'),
      lang: 'en-US',
      isEnglish: true,
    },
  ];

  let totalAdded = 0;

  for (const locale of localeFiles) {
    if (!existsSync(locale.path)) {
      console.warn(`⚠ Locale file not found: ${locale.path} — skipping`);
      continue;
    }

    // 3. Parse locale JSON
    let data;
    try {
      const content = readFileSync(locale.path, 'utf-8');
      data = JSON.parse(content);
    } catch (err) {
      console.error(`❌ Error parsing ${locale.path}: ${err.message}`);
      process.exit(1);
    }

    if (!data.changelog || !Array.isArray(data.changelog.versions)) {
      console.error(
        `❌ ${locale.path} is missing "changelog.versions" array`,
      );
      process.exit(1);
    }

    // 4. Determine which versions are new
    const existingVersions = new Set(
      data.changelog.versions.map((v) => v.version),
    );

    const newVersions = changelogVersions.filter(
      (v) => !existingVersions.has(v.version),
    );

    if (newVersions.length === 0) {
      console.log(`ℹ ${locale.lang}: no new versions to sync`);
      continue;
    }

    // 5. Insert each new version at the correct sorted position
    for (const changelogVersion of newVersions) {
      const entry = createVersionEntry(changelogVersion, locale.isEnglish);
      insertVersionSorted(data.changelog.versions, entry);
      console.log(`✓ Added v${changelogVersion.version} to ${locale.lang}`);

      if (locale.isEnglish) {
        console.log(
          `  ⚠ en-US items for v${changelogVersion.version} need translation review`,
        );
      }
    }

    // 6. Write back
    try {
      writeFileSync(locale.path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    } catch (err) {
      console.error(`❌ Error writing ${locale.path}: ${err.message}`);
      process.exit(1);
    }

    totalAdded += newVersions.length;
  }

  if (totalAdded === 0) {
    console.log('ℹ No new versions to sync');
  }

  console.log(`\n✅ Done. ${totalAdded} version(s) synced.`);
}

main();
