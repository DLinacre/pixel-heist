# PIXEL HEIST — API & INTERFACE SPECIFICATIONS

**Document Version:** 1.0.0  
**Date:** July 28, 2026  
**API Architecture:** Next.js 15 App Router REST API Endpoints & Typed Event Bus  

---

## 1. REST API Specification

### 1.1 `GET /api/contracts/daily`
Fetches the deterministic daily contract configuration for today (or a requested date query param).

#### Request Headers / Params
- `Query Parameter (Optional)`: `date=YYYY-MM-DD` (Defaults to today in user's timezone: `2026-07-28`).

#### Response JSON Payload (`200 OK`)
```json
{
  "success": true,
  "contract": {
    "id": "contract_2026-07-28_phoenix",
    "contractDate": "2026-07-28",
    "seedString": "2026-07-28-BANK-OF-PIXEL-HQ",
    "facilityName": "The Cyber-Vault of New London",
    "targetLoot": 15000,
    "difficultyMod": 1.25,
    "modifiers": [
      "HIGH_CCTV_DENSITY",
      "VETERAN_GUARDS"
    ]
  }
}
```

---

### 1.2 `GET /api/leaderboard?date=YYYY-MM-DD`
Retrieves the top 100 verified scores for a specified daily contract date.

#### Response JSON Payload (`200 OK`)
```json
{
  "success": true,
  "date": "2026-07-28",
  "entries": [
    {
      "rank": 1,
      "playerName": "TacticalTim",
      "finalScore": 28450,
      "lootCollected": 18000,
      "timeRemaining": 95,
      "alertsTriggered": 0,
      "stealthRating": "S",
      "submittedAt": 1785244800
    },
    {
      "rank": 2,
      "playerName": "ShadowGhost",
      "finalScore": 24100,
      "lootCollected": 16500,
      "timeRemaining": 42,
      "alertsTriggered": 1,
      "stealthRating": "A",
      "submittedAt": 1785241200
    }
  ]
}
```

---

### 1.3 `POST /api/leaderboard`
Submits a completed run to the leaderboard. Validates the run payload against the server-generated HMAC-SHA256 signature.

#### Request JSON Payload
```json
{
  "userId": "usr_9a8b7c6d",
  "playerName": "TacticalTim",
  "contractDate": "2026-07-28",
  "runId": "run_f1e2d3c4b5a6",
  "lootCollected": 18000,
  "timeRemaining": 95,
  "alertsTriggered": 0,
  "hmacSignature": "a7b3c8e9f0123456789abcdef0123456789abcdef0123456789abcdef0123456"
}
```

#### Server Scoring Algorithm & Formula
$$\text{FinalScore} = \Big(\text{LootCollected} + (\text{TimeRemaining} \times 25)\Big) \times \text{StealthMultiplier}$$

Where **StealthMultiplier** is defined by total alerts triggered:
- `0 Alerts` = **3.00x** (Rating: `S`)
- `1 Alert` = **2.00x** (Rating: `A`)
- `2 Alerts` = **1.50x** (Rating: `B`)
- `3 Alerts` = **1.10x** (Rating: `C`)
- `4+ Alerts` = **1.00x** (Rating: `D`)

#### Response JSON Payload (`200 OK`)
```json
{
  "success": true,
  "rank": 1,
  "finalScore": 28450,
  "stealthRating": "S",
  "verified": true
}
```

---

## 2. Master TypeScript Interfaces (`src/lib/types.ts`)

```typescript
export type AlarmLevel = 'CLEAR' | 'SUSPICIOUS' | 'ALERT';

export type StealthRating = 'S' | 'A' | 'B' | 'C' | 'D';

export type GadgetType = 'EMP' | 'DECOY' | 'SMOKE' | 'SPRINT';

export interface GadgetInventoryItem {
  id: GadgetType;
  name: string;
  keyBind: string;
  cooldownSeconds: number;
  remainingCooldown: number;
  charges: number;
  maxCharges: number;
  iconName: string;
}

export interface DailyContract {
  id: string;
  contractDate: string; // YYYY-MM-DD
  seedString: string;
  facilityName: string;
  targetLoot: number;
  difficultyMod: number;
  modifiers: string[];
}

export interface MissionStats {
  runId: string;
  contractDate: string;
  seedString: string;
  lootCollected: number;
  timeRemainingSeconds: number;
  alertsTriggered: number;
  status: 'SUCCESS' | 'FAILED';
  finalScore?: number;
  stealthRating?: StealthRating;
}

export interface LockpickChallenge {
  vaultId: string;
  title: string;
  difficulty: number; // 1 to 3 stages
  targetSequence: number[];
  timeLimitSeconds: number;
}
```

---

## 3. React UI Component Hierarchy & State Flow

```
<Page> (Single-Page Core MVP)
 ├── <SoundProvider> (Manages Web Audio 8-bit synthetic sound engine)
 │    ├── <HeaderStats>
 │    │    ├── [ Timer Gauge ]
 │    │    ├── [ Loot Progress ($ / Target) ]
 │    │    ├── [ Facility Alarm Status Pill ]
 │    │    └── [ Active Stealth Multiplier ]
 │    │
 │    ├── <PhaserGame> (Canvas Container for 60 FPS Engine)
 │    │    └── [ Event Bridge Hook: useEffect binding GameEvents ]
 │    │
 │    ├── <GadgetToolbar>
 │    │    ├── [ EMP Blast Button (Key 1) ]
 │    │    ├── [ Acoustic Decoy Button (Key 2) ]
 │    │    ├── [ Smoke Bomb Button (Key 3) ]
 │    │    └── [ Speed Sneakers Button (Key 4) ]
 │    │
 │    ├── <LockpickModal> (Conditional overlay when player hacks vault)
 │    ├── <DailyContractModal> (Briefing overview & date seed selector)
 │    └── <MissionSummaryModal> (After-action report & instant rank display)
```
