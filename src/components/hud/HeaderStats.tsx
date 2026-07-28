'use client';

import React from 'react';
import { AlarmLevel, StealthRating } from '@/lib/types';
import { ShieldAlert, DollarSign, Clock, Volume2, VolumeX, Trophy, FileText, RefreshCw } from 'lucide-react';
import { calculateStealthRating } from '@/lib/security/antiCheat';

interface HeaderStatsProps {
  currentLoot: number;
  targetLoot: number;
  timeRemaining: number;
  alarmLevel: AlarmLevel;
  alertsCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenBriefing: () => void;
  onOpenLeaderboard: () => void;
  onRestartMission: () => void;
}

export const HeaderStats: React.FC<HeaderStatsProps> = ({
  currentLoot,
  targetLoot,
  timeRemaining,
  alarmLevel,
  alertsCount,
  isMuted,
  onToggleMute,
  onOpenBriefing,
  onOpenLeaderboard,
  onRestartMission,
}) => {
  const { multiplier, rating } = calculateStealthRating(alertsCount);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getAlarmBadgeStyle = () => {
    if (alarmLevel === 'CLEAR') {
      return 'bg-cyber-green/20 text-cyber-green border-cyber-green/40';
    }
    if (alarmLevel === 'SUSPICIOUS') {
      return 'bg-cyber-yellow/20 text-cyber-yellow border-cyber-yellow/40 animate-pulse';
    }
    return 'bg-cyber-red/20 text-cyber-red border-cyber-red/40 animate-bounce';
  };

  const getRatingColor = (r: StealthRating) => {
    if (r === 'S') return 'text-cyber-cyan';
    if (r === 'A') return 'text-cyber-green';
    if (r === 'B') return 'text-cyber-yellow';
    return 'text-cyber-red';
  };

  const progressPercent = Math.min(100, Math.floor((currentLoot / targetLoot) * 100));

  return (
    <header className="w-full bg-cyber-panel/95 border-b border-cyber-border px-4 py-3 flex flex-wrap items-center justify-between gap-4 shadow-lg backdrop-blur-md">
      {/* Brand & Contract Date */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-mono font-black text-cyber-cyan tracking-wider drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
            🚀 PIXEL HEIST
          </span>
          <span className="text-xs font-mono bg-cyber-border px-2 py-0.5 rounded text-gray-300">
            2026-07-28
          </span>
        </div>
      </div>

      {/* Primary Mission HUD Gauge Group */}
      <div className="flex flex-wrap items-center gap-6">
        {/* Timer */}
        <div className="flex items-center space-x-2 bg-cyber-dark/80 px-3 py-1.5 rounded-lg border border-cyber-border">
          <Clock className={`w-4 h-4 ${timeRemaining < 30 ? 'text-cyber-red animate-pulse' : 'text-cyber-cyan'}`} />
          <span className="font-mono text-lg font-bold text-white">
            {formatTime(timeRemaining)}
          </span>
        </div>

        {/* Loot Counter & Progress */}
        <div className="flex flex-col min-w-[170px]">
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-gray-400 flex items-center">
              <DollarSign className="w-3.5 h-3.5 text-cyber-green mr-0.5" />
              LOOT COLLECTED
            </span>
            <span className="text-white font-bold">
              ${currentLoot.toLocaleString()} <span className="text-gray-500">/ ${targetLoot.toLocaleString()}</span>
            </span>
          </div>
          <div className="w-full bg-cyber-dark h-2 rounded-full overflow-hidden border border-cyber-border">
            <div
              className="bg-gradient-to-r from-cyber-cyan to-cyber-green h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Facility Alarm Status */}
        <div className="flex items-center space-x-2">
          <div
            className={`px-3 py-1 rounded-full border text-xs font-mono font-bold flex items-center space-x-1.5 uppercase ${getAlarmBadgeStyle()}`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ALARM: {alarmLevel}</span>
          </div>
        </div>

        {/* Stealth Multiplier & Rank Preview */}
        <div className="flex items-center space-x-2 bg-cyber-dark/80 px-3 py-1.5 rounded-lg border border-cyber-border">
          <span className="text-xs font-mono text-gray-400">STEALTH:</span>
          <span className="font-mono text-sm font-bold text-white">{multiplier.toFixed(2)}x</span>
          <span className={`font-mono font-black text-base ${getRatingColor(rating)}`}>
            [{rating}]
          </span>
        </div>
      </div>

      {/* Action Controls & Modal Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenBriefing}
          className="px-3 py-1.5 text-xs font-mono bg-cyber-dark hover:bg-cyber-border text-cyber-cyan border border-cyber-cyan/40 rounded transition-all flex items-center space-x-1"
          title="View Daily Mission Briefing"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">BRIEFING</span>
        </button>

        <button
          onClick={onOpenLeaderboard}
          className="px-3 py-1.5 text-xs font-mono bg-cyber-dark hover:bg-cyber-border text-cyber-yellow border border-cyber-yellow/40 rounded transition-all flex items-center space-x-1"
          title="View Today's Leaderboard"
        >
          <Trophy className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">RANKINGS</span>
        </button>

        <button
          onClick={onRestartMission}
          className="p-1.5 bg-cyber-dark hover:bg-cyber-border text-gray-300 hover:text-white border border-cyber-border rounded transition-all"
          title="Restart Mission (R)"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleMute}
          className="p-1.5 bg-cyber-dark hover:bg-cyber-border text-gray-300 hover:text-white border border-cyber-border rounded transition-all"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-cyber-red" /> : <Volume2 className="w-4 h-4 text-cyber-green" />}
        </button>
      </div>
    </header>
  );
};
