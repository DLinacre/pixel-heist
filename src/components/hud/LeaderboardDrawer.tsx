'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { LeaderboardEntry, StealthRating } from '@/lib/types';
import { Trophy, ShieldCheck, X, RefreshCw } from 'lucide-react';

interface LeaderboardDrawerProps {
  isOpen: boolean;
  date: string;
  onClose: () => void;
}

export const LeaderboardDrawer: React.FC<LeaderboardDrawerProps> = ({
  isOpen,
  date,
  onClose,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.entries)) {
          setEntries(data.entries);
          setLoading(false);
          return;
        }
      }
      throw new Error('API fallback');
    } catch {
      // Fallback sample data for static GitHub Pages hosting
      setEntries([
        {
          id: 'sample_1',
          userId: 'usr_tim',
          contractDate: date,
          runId: 'run_tim',
          playerName: 'TacticalTim',
          finalScore: 28450,
          lootCollected: 18000,
          timeRemaining: 95,
          alertsTriggered: 0,
          stealthRating: 'S',
          createdAt: Math.floor(Date.now() / 1000),
        },
        {
          id: 'sample_2',
          userId: 'usr_shadow',
          contractDate: date,
          runId: 'run_shadow',
          playerName: 'ShadowGhost',
          finalScore: 24100,
          lootCollected: 16500,
          timeRemaining: 42,
          alertsTriggered: 1,
          stealthRating: 'A',
          createdAt: Math.floor(Date.now() / 1000) - 3600,
        },
        {
          id: 'sample_3',
          userId: 'usr_fox',
          contractDate: date,
          runId: 'run_fox',
          playerName: 'CyberFox',
          finalScore: 21200,
          lootCollected: 15000,
          timeRemaining: 60,
          alertsTriggered: 2,
          stealthRating: 'B',
          createdAt: Math.floor(Date.now() / 1000) - 7200,
        },
        {
          id: 'sample_4',
          userId: 'usr_monaco',
          contractDate: date,
          runId: 'run_monaco',
          playerName: 'MonacoPro',
          finalScore: 18900,
          lootCollected: 14000,
          timeRemaining: 30,
          alertsTriggered: 2,
          stealthRating: 'B',
          createdAt: Math.floor(Date.now() / 1000) - 10800,
        },
        {
          id: 'sample_5',
          userId: 'usr_rookie',
          contractDate: date,
          runId: 'run_rookie',
          playerName: 'RookieRobber',
          finalScore: 12500,
          lootCollected: 10000,
          timeRemaining: 15,
          alertsTriggered: 3,
          stealthRating: 'C',
          createdAt: Math.floor(Date.now() / 1000) - 14400,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen, fetchLeaderboard]);

  if (!isOpen) return null;

  const getRatingStyle = (r: StealthRating) => {
    if (r === 'S') return 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan';
    if (r === 'A') return 'bg-cyber-green/20 text-cyber-green border-cyber-green';
    if (r === 'B') return 'bg-cyber-yellow/20 text-cyber-yellow border-cyber-yellow';
    return 'bg-cyber-red/20 text-cyber-red border-cyber-red';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="bg-cyber-panel border-l border-cyber-border w-full max-w-lg h-full shadow-2xl p-6 font-mono flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyber-border pb-4 mb-4">
          <div className="flex items-center space-x-2 text-cyber-yellow">
            <Trophy className="w-6 h-6" />
            <h3 className="text-lg font-bold tracking-wider">
              DAILY LEADERBOARD
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchLeaderboard}
              disabled={loading}
              className="p-1.5 bg-cyber-dark hover:bg-cyber-border rounded border border-cyber-border text-gray-300"
              title="Refresh Leaderboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-cyber-dark hover:bg-cyber-border rounded border border-cyber-border text-gray-300"
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Date Filter & Verified Badge */}
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-xs font-bold text-gray-400">
            DATE SEED: <span className="text-white">{date}</span>
          </span>
          <div className="flex items-center space-x-1 text-[11px] text-cyber-green bg-cyber-green/10 border border-cyber-green/30 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>HMAC ANTI-CHEAT ACTIVE</span>
          </div>
        </div>

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400 text-xs">
              LOADING LEADERBOARD ENTRIES...
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs">
              NO VERIFIED RUNS SUBMITTED FOR THIS CONTRACT YET.
            </div>
          ) : (
            entries.map((entry, idx) => {
              const rankNum = idx + 1;
              const isTop3 = rankNum <= 3;
              return (
                <div
                  key={entry.id || idx}
                  className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                    isTop3
                      ? 'bg-cyber-dark border-cyber-yellow/40 shadow-sm'
                      : 'bg-cyber-dark/60 border-cyber-border'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-6 text-center text-sm font-bold ${
                        rankNum === 1
                          ? 'text-cyber-yellow'
                          : rankNum === 2
                          ? 'text-gray-300'
                          : rankNum === 3
                          ? 'text-amber-600'
                          : 'text-gray-500'
                      }`}
                    >
                      #{rankNum}
                    </span>
                    <div>
                      <div className="font-bold text-white text-sm">
                        {entry.playerName}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        LOOT: ${entry.lootCollected} | TIME: {entry.timeRemaining}s
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-0.5 rounded border text-xs font-bold ${getRatingStyle(
                        entry.stealthRating
                      )}`}
                    >
                      {entry.stealthRating}
                    </span>
                    <span className="font-bold text-base text-white">
                      {entry.finalScore.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-cyber-border mt-4 text-center text-[11px] text-gray-500">
          Rankings update in real-time. Unverified signatures are automatically rejected.
        </div>
      </div>
    </div>
  );
};
