import { createHmac } from 'crypto';
import { StealthRating } from '../types';

/**
 * PIXEL HEIST — ANTI-CHEAT & CRYPTOGRAPHIC RUN VERIFICATION
 * Uses HMAC-SHA256 signatures to secure score submissions.
 */

const SERVER_SECRET_KEY = process.env.ANTI_CHEAT_SECRET || 'pixel_heist_master_hmac_secret_key_2026';

/**
 * Computes deterministic stealth multiplier and rank based on alerts triggered.
 */
export function calculateStealthRating(alertsTriggered: number): {
  multiplier: number;
  rating: StealthRating;
} {
  if (alertsTriggered === 0) return { multiplier: 3.0, rating: 'S' };
  if (alertsTriggered === 1) return { multiplier: 2.0, rating: 'A' };
  if (alertsTriggered === 2) return { multiplier: 1.5, rating: 'B' };
  if (alertsTriggered === 3) return { multiplier: 1.1, rating: 'C' };
  return { multiplier: 1.0, rating: 'D' };
}

/**
 * Calculates final score for a completed run.
 */
export function calculateFinalScore(
  lootCollected: number,
  timeRemainingSeconds: number,
  alertsTriggered: number
): { finalScore: number; stealthRating: StealthRating; multiplier: number } {
  const { multiplier, rating } = calculateStealthRating(alertsTriggered);
  const rawScore = lootCollected + timeRemainingSeconds * 25;
  const finalScore = Math.max(0, Math.floor(rawScore * multiplier));
  return { finalScore, stealthRating: rating, multiplier };
}

/**
 * Generates an HMAC-SHA256 signature for a game run payload.
 */
export function generateRunSignature(payload: {
  runId: string;
  contractDate: string;
  lootCollected: number;
  timeRemaining: number;
  alertsTriggered: number;
}): string {
  const message = `${payload.runId}:${payload.contractDate}:${payload.lootCollected}:${payload.timeRemaining}:${payload.alertsTriggered}`;
  const hmac = createHmac('sha256', SERVER_SECRET_KEY);
  hmac.update(message);
  return hmac.digest('hex');
}

/**
 * Validates whether an incoming signature matches the expected server-computed HMAC.
 */
export function verifyRunSignature(
  payload: {
    runId: string;
    contractDate: string;
    lootCollected: number;
    timeRemaining: number;
    alertsTriggered: number;
  },
  submittedSignature: string
): boolean {
  try {
    const expectedSignature = generateRunSignature(payload);
    // Timing-safe comparison could be added here in strict production
    return expectedSignature === submittedSignature;
  } catch {
    return false;
  }
}
