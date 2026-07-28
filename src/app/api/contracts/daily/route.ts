import { NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/db/db';
import { dailyContractsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-static';

/**
 * GET /api/contracts/daily
 * Returns today's deterministic daily contract configuration.
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

    const contracts = await db
      .select()
      .from(dailyContractsTable)
      .where(eq(dailyContractsTable.contractDate, dateParam))
      .limit(1);

    if (contracts.length === 0) {
      // Fallback fallback contract generation for any unregistered future dates
      return NextResponse.json({
        success: true,
        contract: {
          id: `contract_${dateParam}_default`,
          contractDate: dateParam,
          seedString: `${dateParam}-BANK-OF-PIXEL-HQ`,
          facilityName: `The Cyber-Vault of New London`,
          targetLoot: 15000,
          difficultyMod: 1.25,
          modifiers: ['HIGH_CCTV_DENSITY', 'VETERAN_GUARDS'],
        },
      });
    }

    const c = contracts[0];

    return NextResponse.json({
      success: true,
      contract: {
        id: c.id,
        contractDate: c.contractDate,
        seedString: c.seedString,
        facilityName: c.facilityName,
        targetLoot: c.targetLoot,
        difficultyMod: c.difficultyMod,
        modifiers: ['HIGH_CCTV_DENSITY', 'VETERAN_GUARDS'],
      },
    });
  } catch (error) {
    console.error('Error in GET /api/contracts/daily:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve daily contract' },
      { status: 500 }
    );
  }
}
