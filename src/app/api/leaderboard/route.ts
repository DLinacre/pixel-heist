import { NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/db/db';
import { leaderboardEntriesTable } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { calculateFinalScore, verifyRunSignature } from '@/lib/security/antiCheat';

export const dynamic = 'force-static';

const SubmissionSchema = z.object({
  userId: z.string().min(4).max(64),
  playerName: z.string().min(2).max(24),
  contractDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  runId: z.string().min(8),
  lootCollected: z.number().int().min(0).max(50000),
  timeRemaining: z.number().int().min(0).max(300),
  alertsTriggered: z.number().int().min(0).max(50),
  hmacSignature: z.string().min(10),
});

/**
 * GET /api/leaderboard
 * Returns top 100 entries for a specific contract date.
 */
export async function GET(request: Request) {
  try {
    await initializeDatabase();

    let dateParam = '2026-07-28';
    try {
      if (request && request.url) {
        const { searchParams } = new URL(request.url);
        dateParam = searchParams.get('date') || '2026-07-28';
      }
    } catch {
      dateParam = '2026-07-28';
    }

    const entries = await db
      .select()
      .from(leaderboardEntriesTable)
      .where(eq(leaderboardEntriesTable.contractDate, dateParam))
      .orderBy(desc(leaderboardEntriesTable.finalScore))
      .limit(100);

    const formatted = entries.map((e, index) => ({
      rank: index + 1,
      id: e.id,
      playerName: e.playerName,
      finalScore: e.finalScore,
      lootCollected: e.lootCollected,
      timeRemaining: e.timeRemaining,
      alertsTriggered: e.alertsTriggered,
      stealthRating: e.stealthRating,
      submittedAt: e.createdAt,
    }));

    return NextResponse.json({
      success: true,
      date: dateParam,
      entries: formatted,
    });
  } catch (err) {
    console.error('Error in GET /api/leaderboard:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve leaderboard' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leaderboard
 * Submits a completed mission run and verifies its HMAC-SHA256 signature.
 */
export async function POST(request: Request) {
  try {
    await initializeDatabase();

    const body = await request.json();
    const parsed = SubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid submission payload format', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      userId,
      playerName,
      contractDate,
      runId,
      lootCollected,
      timeRemaining,
      alertsTriggered,
      hmacSignature,
    } = parsed.data;

    // Optional strict check: verify run HMAC signature
    const isVerified = verifyRunSignature(
      { runId, contractDate, lootCollected, timeRemaining, alertsTriggered },
      hmacSignature
    );

    // Compute deterministic score and rating
    const { finalScore, stealthRating } = calculateFinalScore(
      lootCollected,
      timeRemaining,
      alertsTriggered
    );

    const entryId = `lb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await db.insert(leaderboardEntriesTable).values({
      id: entryId,
      userId,
      contractDate,
      runId,
      playerName,
      finalScore,
      lootCollected,
      timeRemaining,
      alertsTriggered,
      stealthRating,
      hmacSignature: isVerified ? hmacSignature : `unverified_${hmacSignature}`,
    });

    // Re-fetch rankings to return user rank
    const topEntries = await db
      .select()
      .from(leaderboardEntriesTable)
      .where(eq(leaderboardEntriesTable.contractDate, contractDate))
      .orderBy(desc(leaderboardEntriesTable.finalScore));

    const rankIndex = topEntries.findIndex((item) => item.runId === runId);
    const rank = rankIndex !== -1 ? rankIndex + 1 : topEntries.length;

    return NextResponse.json({
      success: true,
      verified: isVerified,
      rank,
      finalScore,
      stealthRating,
    });
  } catch (err) {
    console.error('Error in POST /api/leaderboard:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to submit high score' },
      { status: 500 }
    );
  }
}
