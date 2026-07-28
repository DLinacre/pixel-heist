# PIXEL HEIST — STEP-BY-STEP IMPLEMENTATION EXECUTION PLAN

**Document Version:** 1.0.0  
**Date:** July 28, 2026  
**Target Completion:** Full Production Release  

---

## 1. Phased Roadmap Overview

```
+-------------------------------------------------------------------------------+
|                       PIXEL HEIST — 3-PHASE EXECUTION PLAN                   |
+-------------------------------------------------------------------------------+
|                                                                               |
|  [ PHASE 1: CORE FOUNDATION ] ------------------------------->  Milestone 1   |
|  * Project Setup, Next.js 15 App Router & Tailwind CSS                        |
|  * Drizzle ORM Database Schema & Seeded Daily Contracts API                   |
|  * Phaser 3 Game Engine Integration & In-Memory Pixel Art Synthesizer        |
|                                                                               |
|  [ PHASE 2: FEATURE IMPLEMENTATION ] ------------------------>  Milestone 2   |
|  * Procedural Level Generator (Rooms, Corridors, Vaults, Cameras, Lasers)     |
|  * 4-Stage Guard AI State Machine & Raycasting Vision Cones                   |
|  * React 19 Interactive Lockpick/Wire-Hacking Mini-game Modal                |
|  * Gadget System (EMP, Decoy, Smoke, Sprint) & UI Toolbar                     |
|                                                                               |
|  [ PHASE 3: POLISH & DEPLOYMENT ] --------------------------->  Milestone 3   |
|  * HMAC-SHA256 Anti-Cheat Verification & Real-time Leaderboard                |
|  * Web Audio API 8-Bit Synthetic Retro Sound Engine                           |
|  * Complete Single-Page MVP Production Build Verification                     |
|                                                                               |
+-------------------------------------------------------------------------------+
```

---

## 2. Detailed Phase Breakdowns & Checklists

### 2.1 Phase 1: Core Foundation (Milestone 1)
- [x] **1.1 Canonical Folder Structure:** Establish `/src/app`, `/src/components`, `/src/game`, `/src/lib`, and `/src/db` directory boundaries.
- [x] **1.2 Database Schema & ORM Initialization:** Define Drizzle ORM SQLite/PostgreSQL schemas (`users`, `daily_contracts`, `leaderboard_entries`) with compound indexes for O(1) leaderboard retrieval.
- [x] **1.3 Backend API Endpoints:** Build `/api/contracts/daily`, `/api/leaderboard`, and `/api/auth/token` with Zod schema validation.
- [x] **1.4 Phaser 3 Core Engine Setup:** Configure HTML5 Canvas container with Arcade Physics, pixel-perfect rendering, and responsive auto-resizing.
- [x] **1.5 Procedural Pixel-Art Synthesizer (`BootScene.ts`):** Generate high-contrast retro sprites (thief, guards, loot chests, CCTV cameras, lasers, smoke clouds, EMP rings, extract zone) programmatically in memory to eliminate external asset latency.

---

### 2.2 Phase 2: Feature Implementation (Milestone 2)
- [x] **2.1 Deterministic Procedural Level Generator (`levelGenerator.ts`):**
  - Implement seeded grid-based facility generator (`2026-07-28` daily seed).
  - Place insertion spawn point, security doors, cameras, lasers, and extraction zone at minimum Manhattan distance.
- [x] **2.2 Guard AI & Vision Raycasting (`MainScene.ts`):**
  - Implement 4-stage Guard AI state machine (`PATROL` → `SUSPICIOUS` → `ALERT` → `CHASE`).
  - Implement polygon/line-of-sight raycasting against walls for guard vision cones.
  - Implement acoustic disturbance detection radius for footsteps and decoys.
- [x] **2.3 Lockpicking & Security Hacking Mini-game (`LockpickModal.tsx`):**
  - Build interactive cylinder-pin setting puzzle in React.
  - Bind bidirectional event bridge (`GameEvents`) so touching locked vaults pauses Phaser scene and opens React modal.
- [x] **2.4 Tactical Gadget Arsenal (`GadgetToolbar.tsx`):**
  - Implement 4 gadgets: EMP Blast (disables CCTV/lasers for 8s), Acoustic Decoy (draws guard attention), Smoke Bomb (blocks vision cones), Speed Sneakers (+50% sprint).
  - Add cooldown timers, charge counters, and keyboard shortcuts (`1-4`).

---

### 2.3 Phase 3: Polish & Deployment (Milestone 3)
- [x] **3.1 HMAC Anti-Cheat Verification (`antiCheat.ts`):**
  - Integrate SHA-256 cryptographic run signing and server verification on `/api/leaderboard` submissions.
- [x] **3.2 Web Audio API Synthetic Retro Sound Engine (`soundManager.ts`):**
  - Implement 8-bit chip-tune sound effects (coin pickup, alarm siren, EMP zap, lockpick click, guard alert exclamation, stealth footsteps) without requiring external audio files.
- [x] **3.3 Interactive Single-Page MVP Container (`page.tsx`):**
  - Unify HUD overlay, daily mission briefing modal, leaderboard drawer, and after-action summary modal.
- [x] **3.4 Production Build Verification:**
  - Execute `npm run build` to verify zero TypeScript errors, clean bundle splitting, and standalone execution.

---

## 3. Risk Mitigation Table

| Risk Description | Impact | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Phaser canvas resize jitter on window resize** | Medium | Medium | Implement debounced resize observer in `PhaserGame.tsx` and lock aspect ratio to 4:3 (1600x1200 world grid). |
| **Guard AI raycasting frame drop with > 20 guards** | High | Low | Implement grid-based spatial hashing for wall collision and only run high-resolution raycasting for guards within 600 px of camera viewport. |
| **Client-side score tampering / leaderboard manipulation** | High | Medium | Enforce HMAC-SHA256 run signature validation and server-side minimum time check before inserting into DB. |
