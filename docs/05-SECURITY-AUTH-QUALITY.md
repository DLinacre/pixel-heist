# PIXEL HEIST — SECURITY, AUTH & QUALITY STANDARDS

**Document Version:** 1.0.0  
**Date:** July 28, 2026  
**Security Standard:** Zero-Trust Client-Side Scoring & Anti-Cheat Validation  

---

## 1. Security & Anti-Cheat Architecture

### 1.1 The Threat Model in Client-Side Web Games
In browser-based single-page games, client-side memory (JavaScript execution context, network tabs, and Canvas state) is untrusted. Bad actors can manipulate local JavaScript variables (e.g., `lootCollected = 999999`) or forge POST payloads to `/api/leaderboard`.

### 1.2 Cryptographic Run Verification (HMAC-SHA256)
To secure the **Pixel Heist** Daily Leaderboard without requiring an authoritative, high-cost server-side physics simulation, we employ an **HMAC-SHA256 Cryptographic Run Proof** architecture:

```
+---------------------------------------------------------------------------------+
|                               RUN INITIALIZATION                                |
| 1. Server generates unique `runId`, `seed`, and timestamp nonce `ts`.          |
| 2. Server signs payload with Secret Key K -> returns `sessionToken` to client.  |
+----------------------------------------+----------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                              CLIENT GAMEPLAY LOOP                               |
| 3. Player completes mission in Phaser 3 engine (seed-deterministic layout).     |
| 4. Game computes `loot`, `timeRemaining`, and `alertsTriggered`.                |
| 5. Client generates local proof hash & sends payload to `/api/leaderboard`.     |
+----------------------------------------+----------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                           SERVER-SIDE VERIFICATION                              |
| 6. Server verifies `runId` has not been previously submitted (Anti-Replay).     |
| 7. Server verifies timestamp delta: `(now() - ts) >= minPossibleRunTime`.       |
| 8. Server re-computes HMAC-SHA256 signature using Secret Key K:                 |
|    `HMAC(K, runId + ":" + loot + ":" + timeRemaining + ":" + alerts)`           |
| 9. If `signature == submittedHmac`, entry is accepted into Drizzle ORM DB.      |
+---------------------------------------------------------------------------------+
```

---

## 2. Input Validation & Schema Enforcement (Zod)

All API incoming payloads must be strictly validated at runtime using **Zod 3.23+** schemas before any database operation:

```typescript
import { z } from 'zod';

export const LeaderboardSubmissionSchema = z.object({
  userId: z.string().min(4).max(64),
  playerName: z.string().min(2).max(18).regex(/^[a-zA-Z0-9_-]+$/, 'Alphanumeric only'),
  contractDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  runId: z.string().uuid('Invalid Run ID'),
  lootCollected: z.number().int().min(0).max(50000),
  timeRemaining: z.number().int().min(0).max(180),
  alertsTriggered: z.number().int().min(0).max(50),
  hmacSignature: z.string().length(64, 'Must be 64-char hex SHA256 signature'),
});
```

---

## 3. Authentication & Guest Session Management

### 3.1 Seamless Zero-Friction Guest Auth
To maximize conversion and immediate playability for puzzle/strategy gamers:
1. **On First Load:** Client checks `localStorage.getItem('pixel_heist_user')`.
2. **If null:** Client requests a signed Guest UUID from `/api/auth/token`.
3. **Player Identity:** Users can assign a custom handle (`TacticalTim`) at any point in the UI Header without requiring email/password friction.

---

## 4. Quality Standards & Testing Strategy

### 4.1 Automated Quality Gates

| Test Layer | Tools & Frameworks | Coverage Target & Description |
| :--- | :--- | :--- |
| **Unit Testing** | `Vitest` / `Jest` | **> 85% coverage** on pure utility logic (`levelGenerator.ts`, `antiCheat.ts`, score calculator formulas). |
| **Component Testing** | `React Testing Library` | Verifies React HUD overlays, lockpick stage progression, and timer rendering. |
| **End-to-End (E2E)** | `Playwright` | Simulates full infiltration loop: loading Daily Contract briefing, interacting with lockpick modal, and submitting high score. |
| **Static Analysis** | `TypeScript 5.5` + `ESLint` | Zero `any` types permitted in strict compilation mode. |
