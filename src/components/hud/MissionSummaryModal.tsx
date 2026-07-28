'use client';

import React, { useEffect, useState } from 'react';
import { MissionStats, StealthRating } from '@/lib/types';
import { Trophy, ShieldCheck, Clock, DollarSign, RefreshCw, Award } from 'lucide-react';
import { calculateFinalScore, generateRunSignature } from '@/lib/security/antiCheat';

interface MissionSummaryModalProps {
  isOpen: boolean;
  stats: MissionStats | null;
  onRestart: () => void;
  onViewLeaderboard: () => void;
}

export const MissionSummaryModal: React.FC<MissionSummaryModalProps> = ({
  isOpen,
  stats,
  onRestart,
  onViewLeaderboard,
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [rank, setRank] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState<string>('TacticalTim');

  useEffect(() => {
    if (isOpen && stats && stats.status === 'SUCCESS' && typeof window !== 'undefined') {
      const { stealthRating } = calculateFinalScore(
        stats.lootCollected,
        stats.timeRemainingSeconds,
        stats.alertsTriggered
      );
      if (stealthRating === 'S' || stealthRating === 'A') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const confetti = require('canvas-confetti');
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // Ignore if confetti canvas fails in headless
        }
      }
    }
  }, [isOpen, stats]);

  if (!isOpen || !stats) return null;

  const { finalScore, stealthRating, multiplier } = calculateFinalScore(
    stats.lootCollected,
    stats.timeRemainingSeconds,
    stats.alertsTriggered
  );

  const handleSubmitScore = async () => {
    setSubmitting(true);
    try {
      const hmacSignature = generateRunSignature({
        runId: stats.runId,
        contractDate: stats.contractDate,
        lootCollected: stats.lootCollected,
        timeRemaining: stats.timeRemainingSeconds,
        alertsTriggered: stats.alertsTriggered,
      });

      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: `guest_${Date.now()}`,
          playerName,
          contractDate: stats.contractDate,
          runId: stats.runId,
          lootCollected: stats.lootCollected,
          timeRemaining: stats.timeRemainingSeconds,
          alertsTriggered: stats.alertsTriggered,
          hmacSignature,
        }),
      });

      const data = await response.json();
      if (data.success && data.rank) {
        setRank(data.rank);
      }
    } catch (err) {
      console.error('Error submitting score:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingColor = (r: StealthRating) => {
    if (r === 'S') return 'text-cyber-cyan border-cyber-cyan';
    if (r === 'A') return 'text-cyber-green border-cyber-green';
    if (r === 'B') return 'text-cyber-yellow border-cyber-yellow';
    return 'text-cyber-red border-cyber-red';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-cyber-panel border border-cyber-border rounded-xl p-6 max-w-md w-full shadow-2xl font-mono text-left relative">
        {/* Title Badge */}
        <div className="flex items-center justify-between border-b border-cyber-border pb-4 mb-4">
          <div className="flex items-center space-x-2">
            <Trophy
              className={`w-6 h-6 ${stats.status === 'SUCCESS' ? 'text-cyber-yellow' : 'text-cyber-red'}`}
            />
            <span
              className={`text-lg font-bold tracking-wider uppercase ${
                stats.status === 'SUCCESS' ? 'text-cyber-green' : 'text-cyber-red'
              }`}
            >
              {stats.status === 'SUCCESS' ? 'MISSION COMPLETED' : 'INFILTRATION FAILED'}
            </span>
          </div>
          <span
            className={`px-3 py-1 text-xs font-bold rounded border ${getRatingColor(stealthRating)}`}
          >
            RANK [{stealthRating}]
          </span>
        </div>

        {/* Score Display Card */}
        <div className="bg-cyber-dark p-4 rounded-xl border border-cyber-border text-center mb-6">
          <span className="text-xs text-gray-400 block mb-1">TOTAL MISSION SCORE</span>
          <div className="text-3xl font-black text-white tracking-wider">
            {finalScore.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            HMAC SIGNATURE VERIFIED RUN
          </div>
        </div>

        {/* Breakdown table */}
        <div className="space-y-3 mb-6 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-cyber-border/40">
            <span className="text-gray-400 flex items-center">
              <DollarSign className="w-4 h-4 text-cyber-green mr-1.5" />
              LOOT COLLECTED:
            </span>
            <span className="font-bold text-white">${stats.lootCollected.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-cyber-border/40">
            <span className="text-gray-400 flex items-center">
              <Clock className="w-4 h-4 text-cyber-cyan mr-1.5" />
              TIME REMAINING BONUS:
            </span>
            <span className="font-bold text-white">
              +{stats.timeRemainingSeconds * 25} PTS ({stats.timeRemainingSeconds}s)
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-cyber-border/40">
            <span className="text-gray-400 flex items-center">
              <ShieldCheck className="w-4 h-4 text-cyber-yellow mr-1.5" />
              STEALTH MULTIPLIER:
            </span>
            <span className="font-bold text-cyber-yellow">
              {multiplier.toFixed(2)}x ({stats.alertsTriggered} ALERTS)
            </span>
          </div>
        </div>

        {/* Name Input & Submission */}
        {stats.status === 'SUCCESS' && (
          <div className="mb-6 bg-cyber-dark/80 p-3 rounded-lg border border-cyber-border">
            <label className="text-[11px] text-gray-400 block mb-2">
              ENTER CODENAME FOR GLOBAL LEADERBOARD:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.substring(0, 16))}
                className="flex-1 bg-cyber-dark border border-cyber-border rounded px-3 py-1.5 text-white text-xs font-bold focus:outline-none focus:border-cyber-cyan"
                placeholder="Agent Codename"
              />
              <button
                onClick={handleSubmitScore}
                disabled={submitting || rank !== null}
                className="px-4 py-1.5 bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-cyber-dark rounded text-xs font-bold transition-all disabled:opacity-50"
              >
                {rank !== null ? `RANK #${rank}` : submitting ? 'SUBMITTING...' : 'SUBMIT'}
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onViewLeaderboard}
            className="px-4 py-2 rounded text-xs font-bold border border-cyber-yellow/40 bg-cyber-dark text-cyber-yellow hover:bg-cyber-yellow/10 transition-all flex items-center space-x-1.5"
          >
            <Award className="w-4 h-4" />
            <span>LEADERBOARD</span>
          </button>

          <button
            onClick={onRestart}
            className="px-5 py-2 rounded text-xs font-bold border-2 border-cyber-cyan bg-cyber-cyan/20 hover:bg-cyber-cyan text-cyber-cyan hover:text-cyber-dark transition-all flex items-center space-x-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
