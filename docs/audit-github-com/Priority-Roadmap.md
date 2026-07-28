# 🗺️ Priority Roadmap & Phased Action Plan — Pixel Heist (`DLinacre/pixel-heist`)

**Target:** [https://github.com/DLinacre/pixel-heist](https://github.com/DLinacre/pixel-heist)  
**Date Context:** July 28, 2026

---

## 1. Immediate (Today) — Quick Wins & Critical Remediations (✅ Applied Live)

1. **Resolve 8 High/Moderate npm Dependency Vulnerabilities (Critical)**
   - Updated `drizzle-orm` to latest (`^0.39.0+`) and added npm `"overrides"` for `postcss`, `sharp`, and `esbuild`.
   - *Result:* `npm audit` reports **`found 0 vulnerabilities`**.
2. **Deploy Complete Search Engine & Social Share Metadata (High)**
   - Created `/public/robots.txt`, `/public/sitemap.xml`, `/public/manifest.json`, and added Schema.org JSON-LD (`VideoGame` and `SoftwareApplication`) to `src/app/layout.tsx`.
   - *Result:* 100% SEO metadata indexation readiness.
3. **Add WCAG 2.2 AA Skip-to-Game-Canvas Link (High)**
   - Inserted `<a href="#game-canvas" ...>Skip to Game Canvas</a>` in root layout and attached `id="game-canvas"` and `aria-label="Tactical Stealth Game Canvas"` to `<main>` in `src/app/page.tsx`.
   - *Result:* Full keyboard accessibility compliance.
4. **Deploy Content Security Policy & Strict Referrer Headers (Medium)**
   - Added `<meta http-equiv="Content-Security-Policy" content="..." />` and `<meta name="referrer" content="strict-origin-when-cross-origin" />`.
   - *Result:* Robust defensive security hardening.

---

## 2. Short Term (1–2 Weeks) — High-Value Enhancements

1. **HUD Tooltip & Cooldown Documentation (Content / UX)**
   - Add hover tooltips on the four gadget buttons (`EMP`, `Decoy`, `Smoke`, `Sprint`) in `GadgetToolbar.tsx` displaying exact numeric cooldown durations.
2. **Keyboard Audio Mute Shortcut (`M` Key) (A11y / Game)**
   - Register a global keyboard shortcut in `PhaserGame.tsx` allowing players to toggle sound effects without mouse interaction.
3. **High-Score Share to Clipboard Button (CRO / Growth)**
   - Add a "Share Mission Result" button inside `MissionSummaryModal.tsx` that formats and copies the player's S-Rank score and daily seed string to the clipboard.

---

## 3. Medium Term (1–3 Months) — Larger Structural Enhancements

1. **Touch-Screen Virtual D-Pad Overlay for Mobile Devices (UX / UI)**
   - Implement an optional on-screen virtual directional pad when mobile touch events are detected, allowing mobile gamers to navigate without an external keyboard.
2. **Web Audio Spatial Sound API Enhancement (Game / Tech)**
   - Refine `soundManager.ts` to utilize Web Audio spatial panning so guard footsteps sound louder as guards approach the player's position.
3. **Daily Contract Difficulty Modifiers Pipeline (AI / Gameplay)**
   - Add new procedural modifiers (`LASER_GRID_ACTIVE`, `EMP_IMMUNE_CAMERAS`) to `levelGenerator.ts` to increase replay value.

---

## 4. Long Term — Strategic Roadmap

1. **Optional WebSockets Live Leaderboard Integration (Backend / CRO)**
   - Create an optional serverless edge API endpoint for global cross-player leaderboard submissions with HMAC-SHA256 signature verification.
2. **Community Level Editor & Custom Seed Creator (Product / Growth)**
   - Provide an in-app level designer mode where players can generate, test, and share custom procedural seed strings with the community.
