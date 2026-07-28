import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

/**
 * Universal Database Connection Module
 * Uses @libsql/client with a local SQLite database file for zero-config persistence.
 */
const client = createClient({
  url: process.env.DATABASE_URL || 'file:pixel_heist.db',
});

export const db = drizzle(client, { schema });

/**
 * Auto-initialize SQLite Database Schema & Default Seed Data
 * Safe to execute on application startup.
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Create users table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        username TEXT NOT NULL,
        created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL,
        last_active INTEGER DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL,
        total_runs INTEGER DEFAULT 0 NOT NULL,
        best_stealth REAL DEFAULT 0.0 NOT NULL
      );
    `);

    // Create daily contracts table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS daily_contracts (
        id TEXT PRIMARY KEY NOT NULL,
        contract_date TEXT UNIQUE NOT NULL,
        seed_string TEXT NOT NULL,
        facility_name TEXT NOT NULL,
        target_loot INTEGER NOT NULL,
        difficulty_mod REAL DEFAULT 1.0 NOT NULL,
        created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL
      );
    `);

    // Create leaderboard entries table
    await client.execute(`
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
        created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL
      );
    `);

    // Seed Today's Contract (2026-07-28) if not present
    const today = '2026-07-28';
    const contractCheck = await client.execute({
      sql: `SELECT id FROM daily_contracts WHERE contract_date = ?`,
      args: [today],
    });

    if (contractCheck.rows.length === 0) {
      await client.execute({
        sql: `INSERT INTO daily_contracts (id, contract_date, seed_string, facility_name, target_loot, difficulty_mod)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          `contract_${today}`,
          today,
          `${today}-BANK-OF-PIXEL-HQ`,
          `The Cyber-Vault of New London`,
          15000,
          1.25,
        ],
      });

      // Seed initial high scores for the leaderboard
      const sampleScores = [
        {
          name: 'TacticalTim',
          score: 28450,
          loot: 18000,
          time: 95,
          alerts: 0,
          rating: 'S',
        },
        {
          name: 'ShadowGhost',
          score: 24100,
          loot: 16500,
          time: 42,
          alerts: 1,
          rating: 'A',
        },
        {
          name: 'CyberFox',
          score: 21200,
          loot: 15000,
          time: 60,
          alerts: 2,
          rating: 'B',
        },
        {
          name: 'MonacoPro',
          score: 18900,
          loot: 14000,
          time: 30,
          alerts: 2,
          rating: 'B',
        },
        {
          name: 'RookieRobber',
          score: 12500,
          loot: 10000,
          time: 15,
          alerts: 3,
          rating: 'C',
        },
      ];

      for (let i = 0; i < sampleScores.length; i++) {
        const s = sampleScores[i];
        await client.execute({
          sql: `INSERT INTO leaderboard_entries (id, user_id, contract_date, run_id, player_name, final_score, loot_collected, time_remaining, alerts_triggered, stealth_rating, hmac_signature)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            `lb_seed_${i}`,
            `usr_seed_${i}`,
            today,
            `run_seed_${today}_${i}`,
            s.name,
            s.score,
            s.loot,
            s.time,
            s.alerts,
            s.rating,
            `mock_hmac_signature_seed_${i}`,
          ],
        });
      }
    }
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}
