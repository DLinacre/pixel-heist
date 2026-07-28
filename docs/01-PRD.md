# PIXEL HEIST — PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Document Version:** 1.0.0 (Production Release)  
**Date:** July 28, 2026  
**Author:** Principal Systems Architect & Lead Product Creator  
**Target Platform:** Web Application (Single-Page Core MVP)  
**Tech Stack:** Next.js 15 (App Router), Phaser 3.80+, TypeScript 5.5+, Tailwind CSS 3.4+, Drizzle ORM  
**Architecture Style:** Modular Monolith  

---

## 1. Executive Summary & Product Vision

### 1.1 Vision Statement
**Pixel Heist** is a tactical, stealth-action puzzle web game where players infiltrate procedurally generated high-security facilities, evade intelligent Guard AI, hack intricate security systems, and escape with maximum loot before the extraction timer expires. Built as a high-performance Single-Page Application (SPA) on Next.js 15 and Phaser 3, Pixel Heist delivers instant zero-install browser gameplay tailored for puzzle gamers and strategy enthusiasts.

### 1.2 Core Pitch
*"Sneak through procedurally generated buildings, avoid guards, hack security systems, and escape with as much loot as possible before time runs out."*

### 1.3 Strategic Pillars
1. **Infinite Replayability via Procedural Generation:** Every run presents a uniquely generated layout of vaults, laser tripwires, CCTV corridors, and patrol paths using seeded Binary Space Partitioning (BSP).
2. **Deterministic Daily Contracts:** A global daily seed (e.g., `2026-07-28`) generates an identical high-stakes challenge for all players worldwide, driving daily retention and competitive leaderboard engagement.
3. **Tactical & Responsive Stealth Gameplay:** Field-of-View (FoV) raycasting, acoustic disturbance footprints, and a 4-stage Guard AI state machine (`PATROL` → `SUSPICIOUS` → `ALERT` → `CHASE`) reward strategic planning over brute force.
4. **Seamless Hybrid Web UI (React + Phaser):** React 19 handles accessible HUD overlays, lockpicking mini-games, and leaderboard drawers, while Phaser 3 drives 60+ FPS canvas rendering and Arcade Physics.

---

## 2. Target Audience & Personas

### 2.1 Primary Personas

#### Persona 1: "Tactical Tim" — The Puzzle & Stealth Strategist
* **Age & Demographic:** 24–40, software engineer / analytical thinker.
* **Gaming Profile:** Loves *Mark of the Ninja*, *Invisible, Inc.*, and *Monaco*.
* **Core Need:** Wants deterministic stealth mechanics where every alert or detection is the result of a calculable mistake, not random chance.
* **Delighted By:** Vision cone indicators, sound radius feedback, and gadget synergy (e.g., combining a Noise Decoy with an EMP blast).

#### Persona 2: "Competitive Chloe" — The Daily Contract Leaderboard Chaser
* **Age & Demographic:** 18–34, daily Wordle / speedrunning enthusiast.
* **Gaming Profile:** Seeks bite-sized 3–5 minute competitive loops with clear high-score metrics.
* **Core Need:** Wants a daily synchronized challenge where score optimization (speed + zero-alert stealth bonus + total loot value) is ranked globally.
* **Delighted By:** Anti-cheat verified runs, shareable daily badges, and transparent score breakdowns.

---

## 3. Core User Journeys

### 3.1 Journey 1: The Daily Contract Infiltration Loop
1. **Landing & Briefing:** User visits `pixelheist.io`, viewing today's contract briefing (`2026-07-28: The Cyber-Vault of New London`), target loot threshold ($15,000), and active security modifiers (e.g., "High CCTV Density").
2. **Loadout Preparation:** Player reviews available gadgets: EMP Blast, Acoustic Decoy, Smoke Bomb, and Overclock Sneakers.
3. **Infiltration (Gameplay):**
   - Player spawns at the insertion point.
   - Observes Guard patrol routes and CCTV sweep angles.
   - Disables a laser tripwire by completing a real-time React-based lockpick / wire-matching mini-game.
   - Collects high-value data servers and gold bars while keeping the Facility Alarm level in the green zone.
4. **Extraction & After-Action Report:** Player reaches the Extraction Zone before the 3-minute timer reaches zero. Score is computed with a **Stealth Multiplier (3.0x for zero alerts)** and submitted to the global leaderboard.

### 3.2 Journey 2: Tactical Recovery & Emergency Escape
1. **Accidental Detection:** Player steps into a CCTV camera's yellow detection cone for 1.5 seconds.
2. **Alarm Escalation:** Facility Alarm elevates from `CLEAR` to `SUSPICIOUS`. Nearest guard leaves their patrol path to investigate the camera's ping location.
3. **Tactical Countermeasure:** Player triggers an **EMP Blast (Key 1)**, disabling CCTV cameras within 150px for 8 seconds, then throws an **Acoustic Decoy (Key 2)** into an empty corridor.
4. **Resetting Stealth:** Guard investigates the decoy noise, finds nothing, and returns to `PATROL` state. Player escapes into the vault.

---

## 4. Functional Specifications (MVP Core Scope)

### 4.1 Procedural Level Generator (`P-GEN`)
* **REQ-PGEN-1:** Level dimensions shall be 1600x1200 world units (100x75 tile grid at 16x16 px scaled 2x to 32x32 px per tile).
* **REQ-PGEN-2:** Level generation must be deterministic when initialized with a date or custom alphanumeric seed string (e.g., `2026-07-28-DAILY`).
* **REQ-PGEN-3:** The generator must produce:
  - 1 Primary Entry / Insertion Zone.
  - 1 Extraction Zone (located at minimum Manhattan distance of 40 tiles from Insertion).
  - 4–6 Secure Rooms containing Loot Chests ($1,000–$5,000 each).
  - 1 High-Security Main Vault requiring a Lockpick Mini-game ($10,000).
  - 3–5 Patrolling Guard routes with 3–5 waypoints each.
  - 2–4 Rotating CCTV Cameras and 3–4 Laser Tripwires.

### 4.2 Guard Artificial Intelligence (`G-AI`)
* **REQ-GAI-1:** Guards shall operate a 4-stage state machine:
  - `PATROL`: Follows waypoint loop at speed `60 px/s`. Displays green vision cone (45° angle, 160 px radius).
  - `SUSPICIOUS`: Triggered by acoustic noise or player briefly entering vision cone. Displays yellow `?` icon. Rotates toward disturbance and walks to investigation coordinates at `80 px/s`.
  - `ALERT`: Triggered by player remaining in vision cone for >1.0 second or touching laser tripwire without EMP. Displays red `!` icon and triggers Facility Alarm siren.
  - `CHASE`: Pursues player's last known position at speed `110 px/s`.
* **REQ-GAI-2:** Vision cone must perform raycasting against wall tiles so guards cannot see through solid walls.

### 4.3 Lockpicking & Security Hacking Mini-game (`MINI-HACK`)
* **REQ-MINI-1:** When a player interacts with a Locked Vault Door or Alarm Terminal (`E` key or touch), the Phaser scene pauses gameplay and emits an `OPEN_LOCKPICK_MODAL` event to the React layer.
* **REQ-MINI-2:** The React modal presents an interactive 3-stage cylinder pin-setting or wire-matching puzzle.
* **REQ-MINI-3:** Successful completion within the 15-second timer sends a `LOCKPICK_SUCCESS` signal back to Phaser, opening the vault door or resetting the facility alarm.

### 4.4 Gadgets & Inventory (`GADGETS`)
* **REQ-GAD-1 (EMP Blast):** Disables all CCTV cameras and laser tripwires within a 160 px radius for 8 seconds. Cooldown: 20s. Initial charges: 2.
* **REQ-GAD-2 (Acoustic Decoy):** Spawns an emitter at target location that pulses a sound radius of 200 px for 5 seconds, drawing guards into `SUSPICIOUS` state. Cooldown: 15s. Initial charges: 2.
* **REQ-GAD-3 (Smoke Bomb):** Spawns an opaque cloud (120 px radius) for 6 seconds that blocks Guard vision raycasts. Cooldown: 25s. Initial charges: 1.
* **REQ-GAD-4 (Speed Sneakers):** Increases player sprint speed from `100 px/s` to `150 px/s` for 5 seconds without increasing footstep noise radius. Cooldown: 18s. Infinite charges.

### 4.5 Daily Contracts & Global Leaderboard (`DAILY-LB`)
* **REQ-DAILY-1:** The server shall generate a daily contract configuration at 00:00 UTC based on SHA-256 hash of the date string (`YYYY-MM-DD`).
* **REQ-DAILY-2:** Leaderboard entries must be cryptographically signed using an HMAC-SHA256 signature containing `runId`, `seed`, `loot`, `timeRemaining`, `alerts`, and `timestamp` to prevent client-side score manipulation.

---

## 5. Non-Functional Requirements (NFRs)

### 5.1 Performance & Frame Rate
* **NFR-PERF-1:** The Phaser canvas must maintain a stable **60 FPS** on desktop browsers (Chrome, Firefox, Edge, Safari) under normal load (up to 20 active AI guards and 10 dynamic lights/raycasts).
* **NFR-PERF-2:** Initial bundle load time must be **< 2.5 seconds** on a 4G connection. Asset generation is performed procedurally in-memory via HTML5 Canvas drawing to eliminate network latency for spritesheets.

### 5.2 Accessibility & Responsive UX
* **NFR-UX-1:** HUD overlay must support full keyboard shortcuts (`1-4` for gadgets, `E` for interact, `R` for quick restart, `ESC` for pause).
* **NFR-UX-2:** All visual alert states (Green, Yellow, Red) must be accompanied by distinct audio cues and iconography to support colorblind users.

---

## 6. Scope Boundaries & MVP Acceptance Criteria

### 6.1 Included in MVP (Single-Page Core)
- Complete procedural grid-based facility generation.
- Full 4-state Guard AI with vision raycasting and sound perception.
- Interactive React lockpicking modal integrated with Phaser event bridge.
- 4 fully functional gadgets with cooldowns and UI toolbar.
- Daily seeded contracts with HMAC-verified score submissions and leaderboard display.
- Built-in Web Audio 8-bit synthesizer for complete sound effects without external assets.

### 6.2 Out of Scope for MVP
- Multiplayer co-op / real-time PvP infiltration.
- Persistent cross-device user account registration (MVP uses guest sessions with localStorage ID + server signature).
- Mobile touch-joystick virtual gamepad (MVP optimized for desktop keyboard/mouse and tablet tap-to-interact).
