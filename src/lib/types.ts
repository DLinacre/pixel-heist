/**
 * PIXEL HEIST — MASTER TYPE DEFINITIONS
 * Author: Lead Software Engineer & Principal Systems Architect
 * Date: July 28, 2026
 */

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
  description: string;
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

export interface LeaderboardEntry {
  id: string;
  userId: string;
  contractDate: string;
  runId: string;
  playerName: string;
  finalScore: number;
  lootCollected: number;
  timeRemaining: number;
  alertsTriggered: number;
  stealthRating: StealthRating;
  createdAt: number;
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
  pinCount: number;
  timeLimitSeconds: number;
}

export interface SoundConfig {
  enabled: boolean;
  volume: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface GuardPatrolRoute {
  guardId: string;
  waypoints: Point2D[];
  initialState: 'PATROL' | 'SUSPICIOUS' | 'ALERT' | 'CHASE';
}

export interface RoomRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isVault?: boolean;
}
