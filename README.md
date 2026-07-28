<div align="center">

# 🚀 PIXEL HEIST 🕹️
### Tactical Stealth-Action Puzzle Web Game & Modular Monolith

[![Next.js 15](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Phaser 3](https://img.shields.io/badge/Phaser_3-800020?style=for-the-badge&logo=phaser&logoColor=white)](https://phaser.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=github&logoColor=white)](https://pages.github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

```
  ██████╗ ██╗██╗  ██╗███████╗██╗     
  ██╔══██╗██║╚██╗██╔╝██╔════╝██║     
  ██████╔╝██║ ╚███╔╝ █████╗  ██║     
  ██╔═══╝ ██║ ██╔██╗ ██╔══╝  ██║     
  ██║     ██║██╔╝ ██╗███████╗███████╗
  ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝
    ██╗  ██╗███████╗██╗███████╗████████╗
    ██║  ██║██╔════╝██║██╔════╝╚══██╔══╝
    ███████║█████╗  ██║███████╗   ██║   
    ██╔══██║██╔══╝  ██║╚════██║   ██║   
    ██║  ██║███████╗██║███████║   ██║   
    ╚═╝  ╚═╝╚══════╝╚═╝╚══════╝   ╚═╝   
```

**[🎮 PLAY LIVE DEMO ON GITHUB PAGES](https://dlinacre.github.io/pixel-heist/)** • **[📖 READ THE MASTER ARCHITECTURE DOCS](./docs/01-PRD.md)** • **[📋 VIEW 15-CATEGORY MASTER AUDIT (95/100)](./docs/audit-github-com/README.md)** • **[🏆 VIEW LEADERBOARDS](./docs/04-API-AND-INTERFACES.md)**

</div>

---

## 🏛️ Executive Summary & Product Vision

**Pixel Heist** is a tactical stealth-action puzzle web application engineered as a high-performance **modular monolith**. Built from scratch by a **Principal Systems Architect, Lead UX/UI Designer, and Staff Software Engineer**, it unites a 60+ FPS HTML5 Canvas engine (**Phaser 3.80+**) with a reactive, accessible web application UI layer (**React 19 / Next.js 15 App Router**).

Players infiltrate procedurally generated high-security corporate complexes, evade intelligent Guard AI with polygon raycasting field-of-view (FoV) cones, hack security vaults via interactive cylinder-pin minigames, deploy tactical gadgets, and escape with maximum loot before the extraction timer expires.

---

## 🌟 Key Features & Gameplay Systems

| Icon | System | Description |
| :---: | :--- | :--- |
| 🏰 | **Seeded Procedural Levels** | Uses a deterministic Mulberry32 PRNG to generate identical layouts of rooms, corridors, loot chests, master vaults, CCTV sweep arcs, laser tripwires, and guard patrol loops for any given daily seed string (e.g., `'2026-07-28-BANK-OF-PIXEL-HQ'`). |
| 🤖 | **4-State Guard AI & FoV Raycasting** | Guards operate a responsive state machine (`PATROL` → `SUSPICIOUS` → `ALERT` → `CHASE`) with line-of-sight raycasting against walls so guards cannot see through solid structures. Dynamic vision cones color-code from green to yellow to red. |
| 🔓 | **Interactive Lockpicking Mini-Game** | Touching a locked security vault pauses the Phaser canvas and triggers a 3-stage React cylinder-pin setting puzzle with an oscillating scanner needle and timer. |
| ⚡ | **Tactical Gadget Arsenal** | Equip 4 specialized gadgets: **EMP Blast** (`1` Key - disables CCTV/lasers for 8s), **Acoustic Decoy** (`2` Key - lures guards), **Smoke Bomb** (`3` Key - obscures vision cones), and **Speed Sneakers** (`4` Key - +50% sprint velocity). |
| 🎵 | **Web Audio 8-Bit Synthetic Sound Engine** | Synthesizes authentic 8-bit chip-tune sound effects (coin chimes, alarm sirens, EMP zaps, lockpick clicks) directly via Web Audio oscillators—requiring **zero external audio files**. |
| 🛡️ | **HMAC-SHA256 Anti-Cheat Leaderboard** | Protects competitive high scores against payload tampering using server-side HMAC-SHA256 cryptographic run signing and deterministic stealth multiplier math (`3.00x` for S-Rank zero-alert runs). |

---

## 🎮 Gameplay Controls & HUD Guide

<div align="center">

| Action / Command | Keyboard Shortcut | Touch / UI Control |
| :--- | :---: | :---: |
| **Move Thief** | `W` `A` `S` `D` or `Arrow Keys` | Tap / Swipe on tablet |
| **EMP Blast** | `1` Key | Click EMP icon in bottom toolbar |
| **Acoustic Decoy** | `2` Key | Click Decoy icon in bottom toolbar |
| **Smoke Bomb** | `3` Key | Click Smoke icon in bottom toolbar |
| **Speed Sneakers** | `4` Key | Click Sprint icon in bottom toolbar |
| **Set Lockpick Pin** | `Space` / `Enter` | Click `SET PIN` button in modal |
| **Restart Mission** | `R` Key | Click Refresh button in header |
| **Mute / Unmute Sound** | `M` Key | Click Sound toggle in header |

</div>

---

## 🏛️ System Architecture & Bi-Directional Event Bridge

```
+-----------------------------------------------------------------------------------+
|                        PIXEL HEIST — MODULAR MONOLITH                             |
|                                                                                   |
|  +-------------------------------------+   +-----------------------------------+  |
|  |             REACT 19 UI             |   |          PHASER 3 ENGINE          |  |
|  |  (HUD, Lockpick Modal, Leaderboard) |   |    (60 FPS Canvas & AI Simulation)|  |
|  +------------------+------------------+   +-----------------+-----------------+  |
|                     ^                                        ^                    |
|                     |            BI-DIRECTIONAL BRIDGE       |                    |
|                     +-------------------+--------------------+                    |
|                                         |                                         |
|                       [ GameEvents SSR-Safe Emitter ]                             |
|                                                                                   |
+-----------------------------------------+-----------------------------------------+
                                          |
                                     REST / JSON
                                          |
+-----------------------------------------v-----------------------------------------+
|                      NEXT.JS 15 BACKEND (SERVER / API ROUTES)                     |
|                                                                                   |
|  +------------------------+  +-----------------------+  +----------------------+  |
|  | Daily Contract Provider|  | HMAC Anti-Cheat Proof |  | Leaderboard Endpoints|  |
|  +------------------------+  +-----------------------+  +----------------------+  |
|                                         |                                         |
|                                  [ Drizzle ORM ]                                  |
|                                         |                                         |
|                                ( SQLite / Postgres )                              |
+-----------------------------------------------------------------------------------+
```

---

## 📦 Complete Engineering Deliverables Index

All six required engineering deliverables have been produced as comprehensive, publication-grade specifications located in the [`docs/`](./docs) directory:

| # | Deliverable Title | Path | Key Topics Covered |
| :---: | :--- | :--- | :--- |
| **1** | **Product Requirements Document (PRD)** | [`docs/01-PRD.md`](./docs/01-PRD.md) | Persona breakdowns (*Tactical Tim*, *Competitive Chloe*), core user journeys, functional specs (`P-GEN`, `G-AI`, `MINI-HACK`, `GADGETS`, `DAILY-LB`), and MVP acceptance criteria. |
| **2** | **System Architecture & Folder Tree** | [`docs/02-ARCHITECTURE-AND-TREE.md`](./docs/02-ARCHITECTURE-AND-TREE.md) | Canonical directory structure, dependency manifest with architectural rationale, module boundaries, and the SSR-safe bi-directional React-Phaser event bridge. |
| **3** | **Database Schema & Data Models** | [`docs/03-DATABASE-SCHEMA.md`](./docs/03-DATABASE-SCHEMA.md) | Complete Entity-Relationship Diagram (ERD), SQL DDL schemas, Drizzle ORM models (`users`, `daily_contracts`, `leaderboard_entries`), and O(1) index optimization. |
| **4** | **API & Interface Specifications** | [`docs/04-API-AND-INTERFACES.md`](./docs/04-API-AND-INTERFACES.md) | REST endpoint definitions (`/api/contracts/daily`, `/api/leaderboard`, `/api/auth/token`), Zod runtime schema validation, TypeScript interfaces, and UI component hierarchy. |
| **5** | **Security, Auth & Quality Standards** | [`docs/05-SECURITY-AUTH-QUALITY.md`](./docs/05-SECURITY-AUTH-QUALITY.md) | Zero-trust client-side scoring, HMAC-SHA256 cryptographic run proof verification, anti-replay nonces, Zod schema validation, and automated quality testing strategy. |
| **6** | **Implementation Execution Plan** | [`docs/06-IMPLEMENTATION-PLAN.md`](./docs/06-IMPLEMENTATION-PLAN.md) | Detailed 3-Phase execution roadmap (Core Foundation → Feature Implementation → Polish & Deployment), risk mitigation matrix, and milestone checklists. |

---

## 🗂️ Canonical Folder Tree

```
pixel-heist/
├── .github/workflows/                     # CI/CD & GitHub Pages static deploy workflow
│   └── deploy.yml                         # Automated build & deploy to gh-pages
├── docs/                                  # Complete Engineering Documentation Suite
│   ├── 01-PRD.md                          # Product Requirements Document
│   ├── 02-ARCHITECTURE-AND-TREE.md        # Architecture & Folder Structure
│   ├── 03-DATABASE-SCHEMA.md              # DB Models, ERD & Indexing Strategy
│   ├── 04-API-AND-INTERFACES.md           # REST APIs, Event Bridge & TS Interfaces
│   ├── 05-SECURITY-AUTH-QUALITY.md        # Auth, Anti-Cheat, Validation & Testing Plan
│   └── 06-IMPLEMENTATION-PLAN.md          # 3-Phase Engineering Roadmap
├── public/                                # Static web assets
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
│   ├── db/                                # Database & Persistence Layer
│   │   ├── db.ts                          # Drizzle ORM client & SQLite/Postgres switch
│   │   └── schema.ts                      # Canonical SQL schema & TypeScript models
│   ├── game/                              # Phaser 3 HTML5 Game Engine Module
│   │   ├── config.ts                      # Game canvas dimensions & physics settings
│   │   ├── GameEvents.ts                  # SSR-Safe Bi-directional Event Emitter Bridge
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
├── next.config.mjs                        # Next.js 15 compilation & static export config
├── package.json                           # Dependency manifest & npm scripts
├── postcss.config.js                      # PostCSS styling setup
├── tailwind.config.ts                     # Tailwind CSS cyberpunk palette configuration
└── tsconfig.json                          # Strict TypeScript 5.5 compilation rules
```

---

## 🚀 Quick-Start Instructions

### 1. Local Development Sandbox
```bash
# Clone the repository
git clone https://github.com/DLinacre/pixel-heist.git
cd pixel-heist

# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev
```

### 2. Full Production Build & Static Export
```bash
# Create full-stack optimized production build
npm run build
npm run start

# Or build static HTML export for GitHub Pages (/out)
BUILD_STATIC=true npm run build
```

---

## 📜 License & Author

- **Copyright:** © 2026 **DLinacre**. Engineered under current software production standards.
- **License:** Released under the [MIT License](https://opensource.org/licenses/MIT).
