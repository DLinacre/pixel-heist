import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

/**
 * USERS TABLE
 * Persistent player profiles for guest or registered players.
 */
export const usersTable = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    username: text('username').notNull(),
    createdAt: integer('created_at')
      .notNull()
      .$defaultFn(() => Math.floor(Date.now() / 1000)),
    lastActive: integer('last_active')
      .notNull()
      .$defaultFn(() => Math.floor(Date.now() / 1000)),
    totalRuns: integer('total_runs').notNull().default(0),
    bestStealth: real('best_stealth').notNull().default(0.0),
  },
  (table) => ({
    usernameIdx: index('idx_users_username').on(table.username),
  })
);

/**
 * DAILY CONTRACTS TABLE
 * Deterministic mission configurations keyed by date string (YYYY-MM-DD).
 */
export const dailyContractsTable = sqliteTable(
  'daily_contracts',
  {
    id: text('id').primaryKey(),
    contractDate: text('contract_date').notNull().unique(),
    seedString: text('seed_string').notNull(),
    facilityName: text('facility_name').notNull(),
    targetLoot: integer('target_loot').notNull(),
    difficultyMod: real('difficulty_mod').notNull().default(1.0),
    createdAt: integer('created_at')
      .notNull()
      .$defaultFn(() => Math.floor(Date.now() / 1000)),
  },
  (table) => ({
    dateIdx: index('idx_daily_contracts_date').on(table.contractDate),
  })
);

/**
 * LEADERBOARD ENTRIES TABLE
 * Stores cryptographically verified high scores for daily contracts.
 */
export const leaderboardEntriesTable = sqliteTable(
  'leaderboard_entries',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    contractDate: text('contract_date').notNull(),
    runId: text('run_id').notNull().unique(),
    playerName: text('player_name').notNull(),
    finalScore: integer('final_score').notNull(),
    lootCollected: integer('loot_collected').notNull(),
    timeRemaining: integer('time_remaining').notNull(),
    alertsTriggered: integer('alerts_triggered').notNull(),
    stealthRating: text('stealth_rating').notNull(), // 'S' | 'A' | 'B' | 'C' | 'D'
    hmacSignature: text('hmac_signature').notNull(),
    createdAt: integer('created_at')
      .notNull()
      .$defaultFn(() => Math.floor(Date.now() / 1000)),
  },
  (table) => ({
    contractScoreIdx: index('idx_lb_contract_score').on(table.contractDate, table.finalScore),
    userContractIdx: index('idx_lb_user_contract').on(table.userId, table.contractDate),
  })
);
