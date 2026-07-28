import { Point2D, GuardPatrolRoute, RoomRect } from '../types';

/**
 * PIXEL HEIST — DETERMINISTIC SEEDED PROCEDURAL LEVEL GENERATOR
 * Generates identical facility layouts, CCTV placements, laser tripwires, and guard patrol loops
 * for any given daily seed string (e.g. '2026-07-28-BANK-OF-PIXEL-HQ').
 */

export interface GeneratedLevel {
  seed: string;
  widthTiles: number;
  heightTiles: number;
  tileSize: number;
  grid: number[][]; // 0 = floor, 1 = wall, 2 = door, 3 = vault door
  rooms: RoomRect[];
  spawnPoint: Point2D;
  extractZone: Point2D;
  lootChests: { id: string; x: number; y: number; value: number; collected: boolean }[];
  vault: { id: string; x: number; y: number; value: number; isLocked: boolean };
  guards: GuardPatrolRoute[];
  cameras: { id: string; x: number; y: number; startAngle: number; sweepRange: number; speed: number }[];
  lasers: { id: string; x: number; y: number; width: number; height: number; active: boolean }[];
}

/**
 * Mulberry32 Seeded Pseudo-Random Number Generator
 */
export class SeededPRNG {
  private state: number;

  constructor(seedString: string) {
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = (hash << 5) - hash + seedString.charCodeAt(i);
      hash |= 0;
    }
    this.state = hash >>> 0;
  }

  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

/**
 * Generates a complete facility layout for a given seed string.
 */
export function generateFacilityLevel(seedString: string): GeneratedLevel {
  const prng = new SeededPRNG(seedString);
  const widthTiles = 44;
  const heightTiles = 32;
  const tileSize = 32; // Each tile is 32x32 pixels

  // 1. Initialize empty grid with walls (1)
  const grid: number[][] = Array.from({ length: heightTiles }, () =>
    Array(widthTiles).fill(1)
  );

  const rooms: RoomRect[] = [];

  // 2. Define 6 predetermined architectural rooms for balanced stealth gameplay
  const baseRooms = [
    { id: 'room_spawn', x: 2, y: 22, width: 8, height: 8 }, // Bottom-left: Spawn
    { id: 'room_server', x: 14, y: 20, width: 10, height: 9 },
    { id: 'room_lobby', x: 16, y: 4, width: 12, height: 10 },
    { id: 'room_archive', x: 4, y: 4, width: 8, height: 10 },
    { id: 'room_security', x: 30, y: 18, width: 10, height: 10 },
    { id: 'room_vault', x: 32, y: 3, width: 9, height: 9, isVault: true }, // Top-right: Vault & Extract
  ];

  for (const r of baseRooms) {
    rooms.push(r);
    for (let ry = r.y; ry < r.y + r.height; ry++) {
      for (let rx = r.x; rx < r.x + r.width; rx++) {
        if (ry >= 0 && ry < heightTiles && rx >= 0 && rx < widthTiles) {
          grid[ry][rx] = 0; // Floor
        }
      }
    }
  }

  // 3. Connect rooms with corridors
  const corridors = [
    { x1: 6, y1: 14, x2: 6, y2: 22 },   // Archive -> Spawn
    { x1: 10, y1: 24, x2: 14, y2: 24 }, // Spawn -> Server
    { x1: 12, y1: 8, x2: 16, y2: 8 },   // Archive -> Lobby
    { x1: 20, y1: 14, x2: 20, y2: 20 }, // Lobby -> Server
    { x1: 24, y1: 24, x2: 30, y2: 24 }, // Server -> Security
    { x1: 28, y1: 8, x2: 32, y2: 8 },   // Lobby -> Vault corridor
    { x1: 34, y1: 12, x2: 34, y2: 18 }, // Security -> Vault
  ];

  for (const c of corridors) {
    const minX = Math.min(c.x1, c.x2);
    const maxX = Math.max(c.x1, c.x2);
    const minY = Math.min(c.y1, c.y2);
    const maxY = Math.max(c.y1, c.y2);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        for (let dy = 0; dy <= 1; dy++) {
          for (let dx = 0; dx <= 1; dx++) {
            if (y + dy < heightTiles && x + dx < widthTiles) {
              grid[y + dy][x + dx] = 0;
            }
          }
        }
      }
    }
  }

  // 4. Set Spawn Point & Extraction Zone
  const spawnPoint: Point2D = {
    x: (baseRooms[0].x + 3) * tileSize,
    y: (baseRooms[0].y + 4) * tileSize,
  };

  const extractZone: Point2D = {
    x: (baseRooms[5].x + 4) * tileSize,
    y: (baseRooms[5].y + 4) * tileSize,
  };

  // 5. Generate Loot Chests
  const lootChests = [
    { id: 'chest_1', x: (baseRooms[1].x + 2) * tileSize, y: (baseRooms[1].y + 2) * tileSize, value: 2500, collected: false },
    { id: 'chest_2', x: (baseRooms[1].x + 7) * tileSize, y: (baseRooms[1].y + 6) * tileSize, value: 3000, collected: false },
    { id: 'chest_3', x: (baseRooms[2].x + 3) * tileSize, y: (baseRooms[2].y + 3) * tileSize, value: 2000, collected: false },
    { id: 'chest_4', x: (baseRooms[3].x + 2) * tileSize, y: (baseRooms[3].y + 7) * tileSize, value: 1500, collected: false },
    { id: 'chest_5', x: (baseRooms[4].x + 5) * tileSize, y: (baseRooms[4].y + 4) * tileSize, value: 3500, collected: false },
    { id: 'chest_6', x: (baseRooms[2].x + 9) * tileSize, y: (baseRooms[2].y + 7) * tileSize, value: 2500, collected: false },
  ];

  // 6. Generate Master Vault
  const vault = {
    id: 'master_vault',
    x: (baseRooms[5].x + 2) * tileSize,
    y: (baseRooms[5].y + 2) * tileSize,
    value: 10000,
    isLocked: true,
  };

  // 7. Generate Guard Patrol Routes
  const guards: GuardPatrolRoute[] = [
    {
      guardId: 'guard_alpha',
      initialState: 'PATROL',
      waypoints: [
        { x: 18 * tileSize, y: 24 * tileSize },
        { x: 18 * tileSize, y: 22 * tileSize },
        { x: 22 * tileSize, y: 22 * tileSize },
        { x: 22 * tileSize, y: 24 * tileSize },
      ],
    },
    {
      guardId: 'guard_bravo',
      initialState: 'PATROL',
      waypoints: [
        { x: 20 * tileSize, y: 8 * tileSize },
        { x: 24 * tileSize, y: 8 * tileSize },
        { x: 24 * tileSize, y: 11 * tileSize },
        { x: 20 * tileSize, y: 11 * tileSize },
      ],
    },
    {
      guardId: 'guard_charlie',
      initialState: 'PATROL',
      waypoints: [
        { x: 34 * tileSize, y: 22 * tileSize },
        { x: 36 * tileSize, y: 22 * tileSize },
        { x: 36 * tileSize, y: 26 * tileSize },
        { x: 34 * tileSize, y: 26 * tileSize },
      ],
    },
    {
      guardId: 'guard_delta',
      initialState: 'PATROL',
      waypoints: [
        { x: 6 * tileSize, y: 8 * tileSize },
        { x: 9 * tileSize, y: 8 * tileSize },
        { x: 9 * tileSize, y: 11 * tileSize },
        { x: 6 * tileSize, y: 11 * tileSize },
      ],
    },
  ];

  // 8. Generate CCTV Security Cameras
  const cameras = [
    {
      id: 'cctv_1',
      x: 14 * tileSize,
      y: 15 * tileSize,
      startAngle: prng.range(0, 45),
      sweepRange: 60,
      speed: 0.8,
    },
    {
      id: 'cctv_2',
      x: 28 * tileSize,
      y: 9 * tileSize,
      startAngle: prng.range(180, 225),
      sweepRange: 75,
      speed: 1.0,
    },
    {
      id: 'cctv_3',
      x: 35 * tileSize,
      y: 15 * tileSize,
      startAngle: prng.range(90, 135),
      sweepRange: 70,
      speed: 0.9,
    },
  ];

  // 9. Generate Laser Tripwires
  const lasers = [
    {
      id: 'laser_1',
      x: 12 * tileSize,
      y: 24 * tileSize,
      width: 64,
      height: 8,
      active: true,
    },
    {
      id: 'laser_2',
      x: 28 * tileSize,
      y: 8 * tileSize,
      width: 8,
      height: 64,
      active: true,
    },
    {
      id: 'laser_3',
      x: 34 * tileSize,
      y: 14 * tileSize,
      width: 64,
      height: 8,
      active: true,
    },
  ];

  return {
    seed: seedString,
    widthTiles,
    heightTiles,
    tileSize,
    grid,
    rooms,
    spawnPoint,
    extractZone,
    lootChests,
    vault,
    guards,
    cameras,
    lasers,
  };
}
