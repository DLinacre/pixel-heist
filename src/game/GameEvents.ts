import type * as Phaser from 'phaser';
import { GadgetType, AlarmLevel, MissionStats } from '@/lib/types';

/**
 * PIXEL HEIST — BI-DIRECTIONAL EVENT BRIDGE (REACT <-> PHASER 3)
 * 100% SSR-safe singleton wrapper around Phaser.Events.EventEmitter.
 * Never imports 'phaser' at the top-level runtime in Node.js.
 */
class GameEventBus {
  private emitter: Phaser.Events.EventEmitter | null = null;

  private getEmitter(): Phaser.Events.EventEmitter | null {
    if (typeof window === 'undefined') return null;
    if (!this.emitter) {
      // Dynamic runtime load only in browser context
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const PhaserLib = require('phaser');
      this.emitter = new PhaserLib.Events.EventEmitter();
    }
    return this.emitter;
  }

  public on(event: string, fn: Function, context?: any): void {
    this.getEmitter()?.on(event, fn, context);
  }

  public off(event: string, fn?: Function, context?: any, once?: boolean): void {
    this.getEmitter()?.off(event, fn, context, once);
  }

  public emit(event: string, ...args: any[]): boolean {
    return this.getEmitter()?.emit(event, ...args) || false;
  }
}

export const EventBus = new GameEventBus();

// Phaser to React Events
export const EVENT_LOOT_UPDATED = 'EVENT_LOOT_UPDATED';
export const EVENT_ALARM_CHANGED = 'EVENT_ALARM_CHANGED';
export const EVENT_OPEN_LOCKPICK = 'EVENT_OPEN_LOCKPICK';
export const EVENT_MISSION_END = 'EVENT_MISSION_END';
export const EVENT_TIMER_TICK = 'EVENT_TIMER_TICK';
export const EVENT_GADGET_USED = 'EVENT_GADGET_USED';

// React to Phaser Commands
export const COMMAND_USE_GADGET = 'COMMAND_USE_GADGET';
export const COMMAND_SOLVE_LOCKPICK = 'COMMAND_SOLVE_LOCKPICK';
export const COMMAND_RESTART_MISSION = 'COMMAND_RESTART_MISSION';
export const COMMAND_SET_SPEED_BOOST = 'COMMAND_SET_SPEED_BOOST';

export interface LootUpdatePayload {
  currentLoot: number;
  targetLoot: number;
}

export interface AlarmChangePayload {
  level: AlarmLevel;
  alertsCount: number;
}

export interface LockpickOpenPayload {
  vaultId: string;
  difficulty: number;
}

export interface MissionEndPayload extends MissionStats {}
