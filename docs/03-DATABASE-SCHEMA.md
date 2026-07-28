# PIXEL HEIST — DATABASE SCHEMA & DATA MODELS

**Document Version:** 1.0.0  
**Date:** July 28, 2026  
**ORM:** Drizzle ORM (`drizzle-orm`)  
**Target Dialect:** SQLite / PostgreSQL Compatible (via `@libsql/client` or PostgreSQL driver)  

---

## 1. Entity-Relationship Diagram (ERD)

```
+------------------------------------+          +------------------------------------+
|               USERS                |          |          DAILY_CONTRACTS           |
+------------------------------------+          +------------------------------------+
| PK  id               TEXT (UUID)   |          | PK  id               TEXT (UUID)   |
|     username         TEXT          |          | UQ  contract_date    TEXT (YYYY-MM-DD)|
|     created_at       INTEGER (EPOCH)|         |     seed_string      TEXT          |
|     last_active      INTEGER       |          |     facility_name    TEXT          |
|     total_runs       INTEGER       |          |     target_loot      INTEGER       |
|     best_stealth     REAL          |          |     difficulty_mod   REAL          |
+-----------------+------------------+          +-----------------+------------------+
                  |                                               |
                  | 1                                             | 1
                  |                                               |
                  | N                                             | N
+-----------------v-----------------------------------------------v------------------+
|                              LEADERBOARD_ENTRIES                                   |
+------------------------------------------------------------------------------------+
| PK  id               TEXT (UUID)                                                   |
| FK  user_id          TEXT      --> USERS.id                                        |
| FK  contract_date    TEXT      --> DAILY_CONTRACTS.contract_date                   |
|     run_id           TEXT (UUID)                                                   |
|     player_name      TEXT                                                          |
|     final_score      INTEGER   (Indexed DESC for O(1) Leaderboard retrieval)       |
|     loot_collected   INTEGER                                                       |
|     time_remaining   INTEGER   (Seconds)                                           |
|     alerts_triggered INTEGER                                                       |
|     stealth_rating   TEXT      ('S' | 'A' | 'B' | 'C' | 'D')                         |
|     hmac_signature   TEXT      (HMAC-SHA256 Cryptographic Run Proof)                |
|     created_at       INTEGER   (EPOCH)                                             |
+------------------------------------------------------------------------------------+
```

---

## 2. Complete SQL Schema Definitions (DDL)

```sql
-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    username TEXT NOT NULL,
    created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL,
    last_active INTEGER DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL,
    total_runs INTEGER DEFAULT 0 NOT NULL,
    best_stealth REAL DEFAULT 0.0 NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);

-- 2. DAILY CONTRACTS TABLE
CREATE TABLE IF NOT EXISTS daily_contracts (
    id TEXT PRIMARY KEY NOT NULL,
    contract_date TEXT UNIQUE NOT NULL, -- Format: YYYY-MM-DD
    seed_string TEXT NOT NULL,
    facility_name TEXT NOT NULL,
    target_loot INTEGER NOT NULL,
    difficulty_mod REAL DEFAULT 1.0 NOT NULL,
    created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_daily_contracts_date ON daily_contracts (contract_date);

-- 3. LEADERBOARD ENTRIES TABLE
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    contract_date TEXT NOT NULL,
    run_id TEXT UNIQUE NOT NULL,
    player_name TEXT NOT NULL,
    final_score INTEGER NOT NULL,
    loot_collected INTEGER NOT NULL,
    time_remaining INTEGER NOT NULL,
    alerts_triggered INTEGER NOT NULL,
    stealth_rating TEXT NOT NULL,
    hmac_signature TEXT NOT NULL,
    created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (contract_date) REFERENCES daily_contracts(contract_date) ON DELETE CASCADE
);

-- Compound index for instantaneous top-100 leaderboard queries per daily contract
CREATE INDEX IF NOT EXISTS idx_lb_contract_score ON leaderboard_entries (contract_date, final_score DESC);
CREATE INDEX IF NOT EXISTS idx_lb_user_contract ON leaderboard_entries (user_id, contract_date);
```

---

## 3. Drizzle ORM Schema Implementation (`src/db/schema.ts`)

```typescript
import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

/**
 * USERS TABLE
 * Persistent player profiles for guest or registered players.
 */
export const usersTable = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  createdAt: integer('created_at').notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  lastActive: integer('last_active').notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  totalRuns: integer('total_runs').notNull().default(0),
  bestStealth: real('best_stealth').notNull().default(0.0),
}, (table) => ({
  usernameIdx: index('idx_users_username').on(table.username),
}));

/**
 * DAILY CONTRACTS TABLE
 * Deterministic mission configurations keyed by date string (YYYY-MM-DD).
 */
export const dailyContractsTable = sqliteTable('daily_contracts', {
  id: text('id').primaryKey(),
  contractDate: text('contract_date').notNull().unique(),
  seedString: text('seed_string').notNull(),
  facilityName: text('facility_name').notNull(),
  targetLoot: integer('target_loot').notNull(),
  difficultyMod: real('difficulty_mod').notNull().default(1.0),
  createdAt: integer('created_at').notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
}, (table) => ({
  dateIdx: index('idx_daily_contracts_date').on(table.contractDate),
}));

/**
 * LEADERBOARD ENTRIES TABLE
 * Stores cryptographically verified high scores for daily contracts.
 */
export const leaderboardEntriesTable = sqliteTable('leaderboard_entries', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  contractDate: text('contract_date').notNull().references(() => dailyContractsTable.contractDate, { onDelete: 'cascade' }),
  runId: text('run_id').notNull().unique(),
  playerName: text('player_name').notNull(),
  finalScore: integer('final_score').notNull(),
  lootCollected: integer('loot_collected').notNull(),
  timeRemaining: integer('time_remaining').notNull(),
  alertsTriggered: integer('alerts_triggered').notNull(),
  stealthRating: text('stealth_rating').notNull(), // 'S' | 'A' | 'B' | 'C' | 'D'
  hmacSignature: text('hmac_signature').notNull(),
  createdAt: integer('created_at').notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
}, (table) => ({
  contractScoreIdx: index('idx_lb_contract_score').on(table.contractDate, table.finalScore),
  userContractIdx: index('idx_lb_user_contract').on(table.userId, table.contractDate),
}));
```

---

## 4. Indexing & Query Scaling Strategy

### 4.1 The Top-100 Leaderboard Hot Path
The most frequently executed query in **Pixel Heist** is fetching the top 100 scores for a given daily contract:

```sql
SELECT player_name, final_score, loot_collected, time_remaining, alerts_triggered, stealth_rating
FROM leaderboard_entries
WHERE contract_date = '2026-07-28'
ORDER BY final_score DESC
LIMIT 100;
```
* **Performance Rationale:** The compound B-Tree index `idx_lb_contract_score (contract_date, final_score DESC)` guarantees **O(1) index seek + O(k) linear scan** where `k = 100`. No database sorting overhead occurs even with millions of daily entries.

### 4.2 Anti-Cheat Run Uniqueness Guarantee
* The unique constraint on `run_id (UUID)` prevents **replay attacks** where an attacker captures a valid payload and re-submits the exact same run to inflate rankings.
