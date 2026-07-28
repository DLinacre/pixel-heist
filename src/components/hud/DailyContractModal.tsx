'use client';

import React from 'react';
import { DailyContract } from '@/lib/types';
import { Shield, FileText, Target, DollarSign, Zap, Play } from 'lucide-react';

interface DailyContractModalProps {
  isOpen: boolean;
  contract: DailyContract | null;
  onClose: () => void;
  onStartMission: (seed: string) => void;
}

export const DailyContractModal: React.FC<DailyContractModalProps> = ({
  isOpen,
  contract,
  onClose,
  onStartMission,
}) => {
  if (!isOpen || !contract) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-cyber-panel border border-cyber-border rounded-xl p-6 max-w-lg w-full shadow-2xl font-mono text-left relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyber-border pb-4 mb-4">
          <div className="flex items-center space-x-2 text-cyber-cyan">
            <FileText className="w-5 h-5" />
            <span className="text-lg font-bold tracking-wider">DAILY CONTRACT BRIEFING</span>
          </div>
          <span className="text-xs font-mono bg-cyber-dark px-2.5 py-1 rounded border border-cyber-border text-gray-300">
            {contract.contractDate}
          </span>
        </div>

        {/* Facility Title */}
        <div className="mb-6">
          <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">
            TARGET FACILITY
          </span>
          <h3 className="text-xl font-bold text-white tracking-wide">
            {contract.facilityName}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Procedurally generated high-security corporate complex. Evade AI guard patrols, hack CCTV cameras, and bypass laser tripwires.
          </p>
        </div>

        {/* Mission Objectives & Specs */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-cyber-dark/80 p-3 rounded-lg border border-cyber-border flex items-center space-x-3">
            <DollarSign className="w-6 h-6 text-cyber-green" />
            <div>
              <span className="text-[11px] text-gray-400 block">MINIMUM EXTRACTION</span>
              <span className="text-sm font-bold text-white">
                ${contract.targetLoot.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-cyber-dark/80 p-3 rounded-lg border border-cyber-border flex items-center space-x-3">
            <Target className="w-6 h-6 text-cyber-yellow" />
            <div>
              <span className="text-[11px] text-gray-400 block">DIFFICULTY MODIFIER</span>
              <span className="text-sm font-bold text-cyber-yellow">
                {contract.difficultyMod}x (VETERAN)
              </span>
            </div>
          </div>
        </div>

        {/* Modifiers Pill Bar */}
        <div className="mb-6">
          <span className="text-xs text-gray-500 uppercase tracking-widest block mb-2">
            ACTIVE SECURITY PROTOCOLS
          </span>
          <div className="flex flex-wrap gap-2">
            {contract.modifiers.map((mod, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded bg-cyber-dark border border-cyber-red/30 text-cyber-red text-xs font-bold flex items-center space-x-1"
              >
                <Shield className="w-3.5 h-3.5 mr-1" />
                {mod.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Tacts & Loadout Tips */}
        <div className="bg-cyber-dark/60 rounded-lg p-3 border border-cyber-border mb-6 text-xs text-gray-400 space-y-1">
          <div className="font-bold text-white mb-1 flex items-center">
            <Zap className="w-3.5 h-3.5 text-cyber-cyan mr-1" />
            TACTICAL INSTRUCTIONS:
          </div>
          <p>• <strong className="text-gray-300">WASD / ARROW KEYS</strong>: Navigate thief.</p>
          <p>• <strong className="text-gray-300">1-4 KEYS</strong>: Deploy Gadgets (EMP, Decoy, Smoke, Sprint).</p>
          <p>• <strong className="text-gray-300">LOCKPICKING</strong>: Touch locked vaults to open the hacking modal.</p>
          <p>• <strong className="text-gray-300">ZERO ALERTS</strong>: Grants a 3.00x S-Rank Stealth Multiplier!</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-xs font-bold border border-cyber-border bg-cyber-dark hover:bg-cyber-border text-gray-300 transition-all"
          >
            DISMISS
          </button>
          <button
            onClick={() => onStartMission(contract.seedString)}
            className="px-6 py-2.5 rounded text-xs font-bold border-2 border-cyber-cyan bg-cyber-cyan/20 hover:bg-cyber-cyan text-cyber-cyan hover:text-cyber-dark transition-all flex items-center space-x-2 shadow-neon-cyan"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>COMMENCE INFILTRATION</span>
          </button>
        </div>
      </div>
    </div>
  );
};
