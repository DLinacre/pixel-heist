'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { HeaderStats } from '@/components/hud/HeaderStats';
import { GadgetToolbar } from '@/components/hud/GadgetToolbar';
import { LockpickModal } from '@/components/hud/LockpickModal';
import { DailyContractModal } from '@/components/hud/DailyContractModal';
import { MissionSummaryModal } from '@/components/hud/MissionSummaryModal';
import { LeaderboardDrawer } from '@/components/hud/LeaderboardDrawer';
import { AlarmLevel, DailyContract, GadgetType, MissionStats } from '@/lib/types';
import { EventBus, COMMAND_USE_GADGET, COMMAND_SOLVE_LOCKPICK, COMMAND_RESTART_MISSION } from '@/game/GameEvents';
import { soundManager } from '@/lib/sound/soundManager';

// Dynamic import of PhaserGame to avoid SSR canvas rendering issues
const PhaserGame = dynamic(() => import('@/game/PhaserGame').then((m) => m.PhaserGame), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[600px] bg-cyber-dark flex items-center justify-center text-cyber-cyan font-mono text-sm border border-cyber-border rounded-xl">
      INITIALIZING PIXEL HEIST TACTICAL ENGINE (60 FPS)...
    </div>
  ),
});

export default function PixelHeistApp() {
  const [currentLoot, setCurrentLoot] = useState<number>(0);
  const [targetLoot, setTargetLoot] = useState<number>(15000);
  const [timeRemaining, setTimeRemaining] = useState<number>(180);
  const [alarmLevel, setAlarmLevel] = useState<AlarmLevel>('CLEAR');
  const [alertsCount, setAlertsCount] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Gadget Cooldowns
  const [activeCooldowns, setActiveCooldowns] = useState<Record<GadgetType, number>>({
    EMP: 0,
    DECOY: 0,
    SMOKE: 0,
    SPRINT: 0,
  });

  // Modal overlays
  const [isBriefingOpen, setIsBriefingOpen] = useState<boolean>(true);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isLockpickOpen, setIsLockpickOpen] = useState<boolean>(false);
  const [lockpickVaultId, setLockpickVaultId] = useState<string>('master_vault');
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const [missionStats, setMissionStats] = useState<MissionStats | null>(null);

  // Today's Contract
  const [currentContract, setCurrentContract] = useState<DailyContract | null>({
    id: 'contract_2026-07-28_phoenix',
    contractDate: '2026-07-28',
    seedString: '2026-07-28-BANK-OF-PIXEL-HQ',
    facilityName: 'The Cyber-Vault of New London',
    targetLoot: 15000,
    difficultyMod: 1.25,
    modifiers: ['HIGH_CCTV_DENSITY', 'VETERAN_GUARDS'],
  });

  // Fetch contract from backend on mount
  useEffect(() => {
    async function loadContract() {
      try {
        const res = await fetch('/api/contracts/daily?date=2026-07-28');
        const data = await res.json();
        if (data.success && data.contract) {
          setCurrentContract(data.contract);
          setTargetLoot(data.contract.targetLoot);
        }
      } catch (err) {
        console.error('Error loading daily contract:', err);
      }
    }
    loadContract();
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCooldowns((prev) => {
        const updated = { ...prev };
        let changed = false;
        (Object.keys(updated) as GadgetType[]).forEach((key) => {
          if (updated[key] > 0) {
            updated[key] = Math.max(0, updated[key] - 1);
            changed = true;
          }
        });
        return changed ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleToggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMute(nextMuted);
  }, [isMuted]);

  const handleUseGadget = useCallback((gadgetType: GadgetType) => {
    // Determine cooldown time
    const cdMap: Record<GadgetType, number> = {
      EMP: 20,
      DECOY: 15,
      SMOKE: 25,
      SPRINT: 18,
    };

    if (activeCooldowns[gadgetType] === 0) {
      setActiveCooldowns((prev) => ({ ...prev, [gadgetType]: cdMap[gadgetType] }));
      EventBus.emit(COMMAND_USE_GADGET, gadgetType);
    }
  }, [activeCooldowns]);

  const handleSolveLockpick = useCallback((success: boolean) => {
    setIsLockpickOpen(false);
    EventBus.emit(COMMAND_SOLVE_LOCKPICK, { success, vaultId: lockpickVaultId });
  }, [lockpickVaultId]);

  const handleRestartMission = useCallback((seed?: string) => {
    setCurrentLoot(0);
    setTimeRemaining(180);
    setAlarmLevel('CLEAR');
    setAlertsCount(0);
    setIsSummaryOpen(false);
    setIsBriefingOpen(false);
    setIsLockpickOpen(false);

    setActiveCooldowns({
      EMP: 0,
      DECOY: 0,
      SMOKE: 0,
      SPRINT: 0,
    });

    const targetSeed = seed || currentContract?.seedString || '2026-07-28-BANK-OF-PIXEL-HQ';
    EventBus.emit(COMMAND_RESTART_MISSION, targetSeed);
  }, [currentContract]);

  return (
    <div className="flex flex-col min-h-screen bg-cyber-dark text-gray-200">
      {/* HUD Header */}
      <HeaderStats
        currentLoot={currentLoot}
        targetLoot={targetLoot}
        timeRemaining={timeRemaining}
        alarmLevel={alarmLevel}
        alertsCount={alertsCount}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenBriefing={() => setIsBriefingOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onRestartMission={() => handleRestartMission()}
      />

      {/* Main Gameplay Canvas Area */}
      <main
        id="game-canvas"
        aria-label="Tactical Stealth Game Canvas"
        className="flex-1 w-full max-w-7xl mx-auto p-4 flex flex-col items-center justify-center relative"
      >
        <PhaserGame
          onLootChange={(loot, target) => {
            setCurrentLoot(loot);
            setTargetLoot(target);
          }}
          onAlarmChange={(level, alerts) => {
            setAlarmLevel(level);
            setAlertsCount(alerts);
          }}
          onOpenLockpick={(vaultId) => {
            setLockpickVaultId(vaultId);
            setIsLockpickOpen(true);
          }}
          onTimerTick={(remaining) => setTimeRemaining(remaining)}
          onMissionEnd={(stats) => {
            setMissionStats(stats);
            setIsSummaryOpen(true);
          }}
          onGadgetUsed={(type) => {
            const cdMap: Record<GadgetType, number> = {
              EMP: 20,
              DECOY: 15,
              SMOKE: 25,
              SPRINT: 18,
            };
            setActiveCooldowns((prev) => ({ ...prev, [type]: cdMap[type] }));
          }}
        />
      </main>

      {/* Gadget Action Toolbar */}
      <GadgetToolbar
        onUseGadget={handleUseGadget}
        activeCooldowns={activeCooldowns}
      />

      {/* Interactive Modals & Drawers */}
      <DailyContractModal
        isOpen={isBriefingOpen}
        contract={currentContract}
        onClose={() => setIsBriefingOpen(false)}
        onStartMission={(seed) => handleRestartMission(seed)}
      />

      <LockpickModal
        isOpen={isLockpickOpen}
        vaultId={lockpickVaultId}
        difficulty={2}
        onSolve={handleSolveLockpick}
        onClose={() => setIsLockpickOpen(false)}
      />

      <MissionSummaryModal
        isOpen={isSummaryOpen}
        stats={missionStats}
        onRestart={() => handleRestartMission()}
        onViewLeaderboard={() => {
          setIsSummaryOpen(false);
          setIsLeaderboardOpen(true);
        }}
      />

      <LeaderboardDrawer
        isOpen={isLeaderboardOpen}
        date={currentContract?.contractDate || '2026-07-28'}
        onClose={() => setIsLeaderboardOpen(false)}
      />
    </div>
  );
}
