# 🛠️ GitHub-Ready Developer Task List — Pixel Heist (`DLinacre/pixel-heist`)

**Target:** [https://github.com/DLinacre/pixel-heist](https://github.com/DLinacre/pixel-heist)  
**Date Context:** July 28, 2026

---

## [TASK-001] Security: Remediate 8 Dependency Vulnerabilities (`drizzle-orm`, `postcss`, `sharp`)
- **Title:** [Security] Fix 8 High/Moderate npm CVEs via Dependency Upgrades & Overrides
- **Description:** Baseline `package.json` had 8 vulnerabilities flagged by `npm audit`, including `drizzle-orm < 0.45.2` SQL injection and `postcss` XSS vulnerabilities.
- **Acceptance criteria:**
  1. `drizzle-orm` is upgraded to `^0.39.0+` and `drizzle-kit` is upgraded to `^0.30.0+`.
  2. `package.json` includes an `"overrides"` block for `postcss`, `sharp`, and `esbuild`.
  3. `npm audit` returns exit code 0 (`found 0 vulnerabilities`).
  4. `npm run build` compiles statically without any build regressions.
- **Priority:** Critical
- **Estimated effort:** 1 hour (Small)
- **Owner discipline:** eng / security
- **Status:** ✅ **Completed & Deployed Live**

---

## [TASK-002] SEO: Add Public Robots.txt, Sitemap, Manifest, and Schema.org JSON-LD
- **Title:** [SEO & PWA] Deploy Search Engine Metadata, Canonical Tags, and JSON-LD Structured Data
- **Description:** Repository lacked public search indexation files and social share metadata in `src/app/layout.tsx`.
- **Acceptance criteria:**
  1. `/public/robots.txt` exists and points to `sitemap.xml`.
  2. `/public/sitemap.xml` lists `https://dlinacre.github.io/pixel-heist/`.
  3. `/public/manifest.json` defines a standalone PWA profile.
  4. `src/app/layout.tsx` outputs `@type: VideoGame` and `@type: SoftwareApplication` JSON-LD schema.
- **Priority:** High
- **Estimated effort:** 2 hours (Small)
- **Owner discipline:** growth / eng
- **Status:** ✅ **Completed & Deployed Live**

---

## [TASK-003] A11y: Add WCAG 2.2 AA Skip-to-Game-Canvas Link
- **Title:** [Accessibility] Implement Keyboard Skip Navigation Link for HUD Header
- **Description:** Keyboard users need a skip link to bypass HUD header stats and modal trigger buttons.
- **Acceptance criteria:**
  1. Root layout (`src/app/layout.tsx`) renders an anchor tag `<a href="#game-canvas">Skip to Game Canvas</a>` visually hidden until focused.
  2. Primary canvas container `<main>` in `src/app/page.tsx` has `id="game-canvas"` and `aria-label="Tactical Stealth Game Canvas"`.
  3. Tabbing into the page focuses the skip link first and jumping to `#game-canvas` shifts keyboard focus correctly.
- **Priority:** High
- **Estimated effort:** 1 hour (Small)
- **Owner discipline:** design / eng
- **Status:** ✅ **Completed & Deployed Live**

---

## [TASK-004] Security: Add Content Security Policy & Strict Referrer Headers
- **Title:** [Security] Hard-code Defensive CSP and Referrer-Policy Meta Tags
- **Description:** Hardening the static client-side webapp against unauthorized cross-site scripting and framing.
- **Acceptance criteria:**
  1. `<head>` contains `<meta name="referrer" content="strict-origin-when-cross-origin" />`.
  2. `<head>` contains a strict `<meta http-equiv="Content-Security-Policy" content="..." />` allowing required local assets and Google Fonts while blocking untrusted scripts.
- **Priority:** Medium
- **Estimated effort:** 1 hour (Small)
- **Owner discipline:** eng / security
- **Status:** ✅ **Completed & Deployed Live**

---

## [TASK-005] UX/Content: Add Hover Tooltips to Gadget Toolbar Cooldowns
- **Title:** [UX/Content] Display Cooldown Durations in Gadget Toolbar Tooltips
- **Description:** Players need visual tooltip clarity on gadget cooldown times before activating EMP (20s), Decoy (15s), Smoke (25s), and Sprint (18s).
- **Acceptance criteria:**
  1. Each gadget button in `src/components/hud/GadgetToolbar.tsx` has a descriptive `title` attribute and custom hover tooltip.
  2. Tooltip specifies cooldown time and tactical effect.
- **Priority:** Medium
- **Estimated effort:** 2 hours (Small)
- **Owner discipline:** content / design
- **Status:** 📅 Roadmap (Short Term)
