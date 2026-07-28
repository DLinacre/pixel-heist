# PIXEL HEIST — SYSTEM ARCHITECTURE & CANONICAL FOLDER TREE

**Document Version:** 1.0.0  
**Date:** July 28, 2026  
**Architecture Style:** Monolithic Single-Page Web Application  
**Core Technologies:** Next.js 15 (App Router), React 19, Phaser 3.80+, TypeScript 5.5+, Drizzle ORM, Tailwind CSS  

---

## 1. Architectural Overview & Design Philosophy

### 1.1 The Hybrid Web-Game Monolith
Pixel Heist is engineered as a **modular monolith** that unites a high-performance HTML5 Canvas game engine (Phaser 3) with a reactive, accessible web application UI layer (React 19 / Next.js 15).

```
+-------------------------------------------------------------------------------+
|                      CLIENT BROWSER / SINGLE-PAGE MVP                        |
|                                                                               |
|  +-----------------------------------+   +---------------------------------+  |
|  |           REACT 19 UI             |   |         PHASER 3 ENGINE         |  |
|  |   (HUD, Modals, Audio Controls)   |   |     (60 FPS Canvas & Physics)   |  |
|  +-----------------+-----------------+   +----------------+----------------+  |
|                    ^                                      ^                   |
|                    |          BI-DIRECTIONAL BRIDGE       |                   |
|                    +------------------+-------------------+                   |
|                                       |                                       |
|                            [ GameEvents Emitter ]                             |
|                                                                               |
+---------------------------------------+---------------------------------------+
                                        |
                                   REST / JSON
                                        |
+---------------------------------------v---------------------------------------+
|                    NEXT.JS 15 BACKEND (SERVER ACTIONS / API)                 |
|                                                                               |
|  +-----------------------+  +-----------------------+  +-------------------+  |
|  |   Daily Contract Gen  |  |  HMAC Anti-Cheat Ver  |  | Leaderboard Store |  |
|  +-----------------------+  +-----------------------+  +-------------------+  |
|                                       |                                       |
|                                 [ Drizzle ORM ]                               |
|                                       |                                       |
|                              ( SQLite / PostgreSQL )                          |
+-------------------------------------------------------------------------------+
```

### 1.2 Module Boundaries & Separation of Concerns
1. **The Game Layer (`/src/game`):**
   - Strictly imperative, frame-loop-driven (60 FPS) canvas rendering and Arcade Physics.
   - Zero direct imports of React components or DOM nodes.
   - All external communication occurs via a typed event bus (`GameEvents.ts`).
2. **The React UI Layer (`/src/components`):**
   - Strictly declarative UI overlays (HUD, lockpicking mini-game, daily briefing modal, leaderboard drawer).
   - Listens to Phaser event emitter signals (`ON_LOOT_CHANGED`, `ON_ALARM_LEVEL_CHANGED`, `OPEN_LOCKPICK_MODAL`).
   - Dispatches player commands back to Phaser (`TRIGGER_GADGET`, `SOLVE_LOCKPICK`, `RESTART_GAME`).
3. **The Server Layer (`/src/app/api` & `/src/lib`):**
   - Handles deterministic seed generation for daily contracts.
   - Validates gameplay runs using HMAC-SHA256 nonces and timestamps to protect leaderboard integrity.

---

## 2. Canonical Project Folder Tree

```
pixel-heist/
├── docs/                                  # Complete Architectural Documentation Suite
│   ├── 01-PRD.md                          # Product Requirements Document
│   ├── 02-ARCHITECTURE-AND-TREE.md        # Architecture & Folder Structure (this file)
│   ├── 03-DATABASE-SCHEMA.md              # DB Models, ERD & Indexing Strategy
│   ├── 04-API-AND-INTERFACES.md           # REST APIs, Event Bridge & TS Interfaces
│   ├── 05-SECURITY-AUTH-QUALITY.md        # Auth, Anti-Cheat, Validation & Testing Plan
│   └── 06-IMPLEMENTATION-PLAN.md          # 3-Phase Engineering Roadmap
├── public/                                # Static web assets (favicon, manifest)
├── src/
│   ├── app/                               # Next.js 15 App Router Layout & API Routes
│   │   ├── api/
│   │   │   ├── auth/token/route.ts        # Guest session & run token generation
│   │   │   ├── contracts/daily/route.ts   # Daily seeded contract provider
│   │   │   └── leaderboard/route.ts       # Signed high-score submission & retrieval
│   │   ├── globals.css                    # Tailwind CSS + Cyberpunk styling rules
│   │   ├── layout.tsx                     # Top-level root layout with font injection
│   │   └── page.tsx                       # Single-Page Core MVP Container
│   ├── components/                        # React 19 Declarative UI Component Suite
│   │   ├── hud/
│   │   │   ├── DailyContractModal.tsx     # Mission briefing & daily seed display
│   │   │   ├── GadgetToolbar.tsx          # Gadget action bar with cooldown timers
│   │   │   ├── HeaderStats.tsx            # Timer, Loot Counter ($), Alarm Gauge
│   │   │   ├── LeaderboardDrawer.tsx      # Global rankings & verification badges
│   │   │   ├── LockpickModal.tsx          # Interactive lockpicking/wire mini-game
│   │   │   └── MissionSummaryModal.tsx    # After-action report & score calculator
│   │   └── ui/                            # Cyberpunk Design System primitives
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       └── Toast.tsx
│   ├── db/                                # Database & Persistence Layer
│   │   ├── db.ts                          # Drizzle ORM client & SQLite/Postgres switch
│   │   └── schema.ts                      # Canonical SQL schema & TypeScript models
│   ├── game/                              # Phaser 3 HTML5 Game Engine Module
│   │   ├── config.ts                      # Game canvas dimensions & physics settings
│   │   ├── GameEvents.ts                  # Typed Bi-directional Event Emitter Bridge
│   │   ├── PhaserGame.tsx                 # React wrapper managing Phaser lifecycle
│   │   └── scenes/
│   │       ├── BootScene.ts               # Procedural pixel-art texture synthesizer
│   │       └── MainScene.ts               # Core stealth gameplay & AI simulation
│   └── lib/                               # Core Domain Logic & Systems
│       ├── procedural/
│       │   └── levelGenerator.ts          # Seeded facility layout & guard generator
│       ├── security/
│       │   └── antiCheat.ts               # HMAC-SHA256 signature & run verifier
│       ├── sound/
│       │   └── soundManager.ts            # Web Audio API 8-bit synthetic sound engine
│       └── types.ts                       # Master TypeScript domain interfaces
├── next.config.mjs                        # Next.js 15 compilation config
├── package.json                           # Dependency manifest & npm scripts
├── postcss.config.js                      # PostCSS styling setup
├── tailwind.config.ts                     # Tailwind CSS cyberpunk palette configuration
└── tsconfig.json                          # Strict TypeScript 5.5 compilation rules
```

---

## 3. Dependency Manifest & Rationale

| Dependency Name | Version | Role & Architectural Rationale |
| :--- | :--- | :--- |
| **`next`** | `^15.0.0` | Provides enterprise-grade SSR, App Router API routes, and optimized client bundles for the web app container. |
| **`react` & `react-dom`** | `^19.0.0` | Powers declarative HUD overlays, accessibility, and interactive modal state management. |
| **`phaser`** | `^3.80.0` | Industrial-strength 2D canvas game engine with Arcade Physics, raycasting, and high-FPS rendering. |
| **`drizzle-orm`** | `^0.36.0` | Lightweight, type-safe SQL ORM for database queries with zero runtime bloat. |
| **`@libsql/client`** | `^0.14.0` | Universal SQLite/Turso client enabling local zero-config persistence and edge database scaling. |
| **`jose`** | `^5.9.0` | Lightweight, standards-compliant JWT and HMAC-SHA256 signing library for anti-cheat run verification. |
| **`zod`** | `^3.23.0` | Comprehensive runtime schema validation for API requests and leaderboard submissions. |
| **`lucide-react`** | `^1.16.0` | Scalable cyberpunk icon set for HUD indicators, gadgets, and alert badges. |
| **`canvas-confetti`** | `^1.9.0` | Celebratory particle effects for high-score achievements and mission completions. |
| **`tailwindcss`** | `^3.4.0` | Utility-first CSS framework enabling rapid cyberpunk styling without CSS specificity conflicts. |

---

## 4. The React-Phaser Event Bridge

To maintain clean separation between React's virtual DOM reconciliation and Phaser's 60 FPS animation loop, all communication flows through `src/game/GameEvents.ts`, a singleton instance of `Phaser.Events.EventEmitter`.

### 4.1 From Phaser to React (Game State Updates)
- `EVENT_LOOT_UPDATED (currentLoot: number)` — Dispatched whenever player collects gold or data servers.
- `EVENT_ALARM_CHANGED (level: 'CLEAR' | 'SUSPICIOUS' | 'ALERT', score: number)` — Dispatched when cameras or guards detect disturbances.
- `EVENT_OPEN_LOCKPICK (vaultId: string, difficulty: number)` — Pauses Phaser scene and triggers React Lockpick Modal.
- `EVENT_MISSION_END (status: 'SUCCESS' | 'FAILED', stats: MissionStats)` — Opens the After-Action Report Modal.

### 4.2 From React to Phaser (Player Actions & UI Controls)
- `COMMAND_USE_GADGET (gadgetType: GadgetType)` — Dispatched when player clicks a gadget tool icon or presses keys `1-4`.
- `COMMAND_SOLVE_LOCKPICK (success: boolean, vaultId: string)` — Dispatched from React Lockpick Modal; if `true`, opens door texture in Phaser.
- `COMMAND_RESTART_MISSION (seed: string)` — Instructs Phaser scene to tear down and generate a fresh facility from seed.
