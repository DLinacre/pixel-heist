# 📝 Assumptions, Fail-Safe Resolutions & Public-Source Verification Bounds — Pixel Heist (`DLinacre/pixel-heist`)

**Target:** [https://github.com/DLinacre/pixel-heist](https://github.com/DLinacre/pixel-heist)  
**Date Context:** July 28, 2026

---

## 1. Input Resolution & Auto Fail-Safe Record

During the audit initialization, several optional input fields were auto-resolved according to the fail-safe rules of the Master Website Audit framework:
- **Product Name Resolution:** The input name was provided as "Github" (or derived from the host URL). Our audit team auto-resolved the canonical product name as **Pixel Heist** based on the repository title and page metadata (`🚀 Pixel Heist | Tactical Stealth Infiltration Web Game`).
- **Target Market Context:** The market niche was auto-assumed as **general web / brand site** in the prompt. We refined this context to **HTML5 Canvas Tactical Stealth Web Game & Open-Source Engineering Showcase** to provide more actionable game-specific CRO and UX recommendations.
- **Target Product Type:** Auto-detected as **Website / Web app** (`https://dlinacre.github.io/pixel-heist/`).

---

## 2. Public-Source Verification Bounds

In accordance with the defensive security and public-sources-only rules:
1. **No Binary Disassembly:** All security and technical observations were derived from publicly observable source files (`src/`), build configurations (`package.json`, `next.config.mjs`), and public npm advisory databases. No offensive testing or reverse engineering was performed.
2. **Telemetry & Crash Metrics:** As a 100% client-side static web application without third-party tracking scripts, real-world user crash rates and session lengths were marked **"Unable to verify from public sources"**.
3. **Leaderboard API Endpoints:** Public API routes (`/api/leaderboard`, `/api/contracts/daily`) in `src/app/api/` are exported as static or mock endpoints in GitHub Pages static export mode (`BUILD_STATIC=true`). Server-side persistence is assumed to be handled separately in full-stack production deployments.

---

## 3. Verified Live Fixes vs. Remaining Roadmap

| Finding / Issue | Verification Source | Live Fix Status | Notes |
|---|---|---|---|
| **npm Dependency Vulnerabilities** | `npm audit` CLI output | ✅ **Verified & Deployed Live** | `drizzle-orm` upgraded; npm `"overrides"` added for `postcss`, `sharp`, `esbuild` (`0 vulnerabilities`). |
| **SEO Indexation Metadata** | `src/app/layout.tsx` & `/public` | ✅ **Verified & Deployed Live** | `robots.txt`, `sitemap.xml`, `manifest.json`, and JSON-LD schema added and verified in static build. |
| **WCAG 2.2 AA Skip Link** | `src/app/layout.tsx` & `src/app/page.tsx` | ✅ **Verified & Deployed Live** | Skip link `#game-canvas` added; `<main id="game-canvas">` verified. |
| **Defensive Security Headers** | `src/app/layout.tsx` `<head>` | ✅ **Verified & Deployed Live** | CSP and strict Referrer-Policy meta tags added. |
| **Gadget Tooltip Cooldown Copy** | `src/components/hud/GadgetToolbar.tsx` | 📅 **Roadmap** | Planned for short-term UX release. |
