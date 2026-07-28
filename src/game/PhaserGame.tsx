'use client';

import React, { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { GameConfig } from './config';
import {
  EventBus,
  EVENT_LOOT_UPDATED,
  EVENT_ALARM_CHANGED,
  EVENT_OPEN_LOCKPICK,
  EVENT_MISSION_END,
  EVENT_TIMER_TICK,
  EVENT_GADGET_USED,
} from './GameEvents';
import { AlarmLevel, MissionStats, GadgetType } from '@/lib/types';

interface PhaserGameProps {
  onLootChange?: (currentLoot: number, targetLoot: number) => void;
  onAlarmChange?: (level: AlarmLevel, alertsCount: number) => void;
  onOpenLockpick?: (vaultId: string, difficulty: number) => void;
  onMissionEnd?: (stats: MissionStats) => void;
  onTimerTick?: (timeRemaining: number) => void;
  onGadgetUsed?: (gadgetType: GadgetType) => void;
}

export const PhaserGame: React.FC<PhaserGameProps> = (props) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  });

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = new Phaser.Game(GameConfig);
    }

    const handleLoot = (data: { currentLoot: number; targetLoot: number }) => {
      propsRef.current.onLootChange?.(data.currentLoot, data.targetLoot);
    };

    const handleAlarm = (data: { level: AlarmLevel; alertsCount: number }) => {
      propsRef.current.onAlarmChange?.(data.level, data.alertsCount);
    };

    const handleLockpick = (data: { vaultId: string; difficulty: number }) => {
      propsRef.current.onOpenLockpick?.(data.vaultId, data.difficulty);
    };

    const handleMissionEnd = (stats: MissionStats) => {
      propsRef.current.onMissionEnd?.(stats);
    };

    const handleTimer = (data: { timeRemaining: number }) => {
      propsRef.current.onTimerTick?.(data.timeRemaining);
    };

    const handleGadget = (data: { gadgetType: GadgetType }) => {
      propsRef.current.onGadgetUsed?.(data.gadgetType);
    };

    EventBus.on(EVENT_LOOT_UPDATED, handleLoot);
    EventBus.on(EVENT_ALARM_CHANGED, handleAlarm);
    EventBus.on(EVENT_OPEN_LOCKPICK, handleLockpick);
    EventBus.on(EVENT_MISSION_END, handleMissionEnd);
    EventBus.on(EVENT_TIMER_TICK, handleTimer);
    EventBus.on(EVENT_GADGET_USED, handleGadget);

    return () => {
      EventBus.off(EVENT_LOOT_UPDATED, handleLoot);
      EventBus.off(EVENT_ALARM_CHANGED, handleAlarm);
      EventBus.off(EVENT_OPEN_LOCKPICK, handleLockpick);
      EventBus.off(EVENT_MISSION_END, handleMissionEnd);
      EventBus.off(EVENT_TIMER_TICK, handleTimer);
      EventBus.off(EVENT_GADGET_USED, handleGadget);

      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      id="phaser-container"
      className="w-full h-full min-h-[580px] bg-cyber-dark rounded-xl overflow-hidden border border-cyber-border shadow-2xl relative flex items-center justify-center"
    />
  );
};
