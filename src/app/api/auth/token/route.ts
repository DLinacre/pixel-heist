import { NextResponse } from 'next/server';
import { generateRunSignature } from '@/lib/security/antiCheat';

export const dynamic = 'force-static';

/**
 * GET /api/auth/token
 * Generates a guest player ID and a fresh signed run token for a new infiltration attempt.
 */
export async function GET() {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const guestId = `guest_${timestamp}_${randomSuffix}`;
    const runId = `run_2026-07-28_${timestamp}_${randomSuffix}`;

    // Sample signature for initial state
    const initialSignature = generateRunSignature({
      runId,
      contractDate: '2026-07-28',
      lootCollected: 0,
      timeRemaining: 180,
      alertsTriggered: 0,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: guestId,
        username: `Agent_${randomSuffix.toUpperCase()}`,
        isGuest: true,
      },
      token: {
        runId,
        contractDate: '2026-07-28',
        expiresAt: timestamp + 3600,
        initialSignature,
      },
    });
  } catch (err) {
    console.error('Error in /api/auth/token:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to generate guest token' },
      { status: 500 }
    );
  }
}
