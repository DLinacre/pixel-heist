'use client';

import React from 'react';
import { GadgetType } from '@/lib/types';
import { Zap, Radio, Cloud, Footprints } from 'lucide-react';

interface GadgetToolbarProps {
  onUseGadget: (gadgetType: GadgetType) => void;
  activeCooldowns: Record<GadgetType, number>;
}

export const GadgetToolbar: React.FC<GadgetToolbarProps> = ({
  onUseGadget,
  activeCooldowns,
}) => {
  const gadgets = [
    {
      id: 'EMP' as GadgetType,
      name: 'EMP Blast',
      keyBind: '1',
      icon: Zap,
      color: 'text-cyber-cyan border-cyber-cyan/50 hover:bg-cyber-cyan/10',
      description: 'Disables cameras & lasers within 160px for 8s',
    },
    {
      id: 'DECOY' as GadgetType,
      name: 'Acoustic Decoy',
      keyBind: '2',
      icon: Radio,
      color: 'text-cyber-green border-cyber-green/50 hover:bg-cyber-green/10',
      description: 'Lures nearby guards to sound beacon',
    },
    {
      id: 'SMOKE' as GadgetType,
      name: 'Smoke Bomb',
      keyBind: '3',
      icon: Cloud,
      color: 'text-cyber-yellow border-cyber-yellow/50 hover:bg-cyber-yellow/10',
      description: 'Creates thick smoke cloud blocking vision cones for 6s',
    },
    {
      id: 'SPRINT' as GadgetType,
      name: 'Speed Sneakers',
      keyBind: '4',
      icon: Footprints,
      color: 'text-cyber-orange border-cyber-orange/50 hover:bg-cyber-orange/10',
      description: '+50% sprint velocity for 5s',
    },
  ];

  return (
    <footer className="w-full bg-cyber-panel/95 border-t border-cyber-border px-4 py-2 flex items-center justify-center gap-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center space-x-4">
        {gadgets.map((g) => {
          const Icon = g.icon;
          const cd = activeCooldowns[g.id] || 0;
          const isCooling = cd > 0;

          return (
            <button
              key={g.id}
              onClick={() => !isCooling && onUseGadget(g.id)}
              disabled={isCooling}
              className={`relative px-4 py-2 rounded-lg border font-mono transition-all flex items-center space-x-2 ${
                isCooling
                  ? 'bg-cyber-dark text-gray-500 border-gray-700 cursor-not-allowed'
                  : `bg-cyber-dark/80 ${g.color} shadow-md`
              }`}
              title={g.description}
            >
              <Icon className="w-4 h-4" />
              <div className="flex flex-col items-start text-left">
                <span className="text-xs font-bold leading-none">{g.name}</span>
                <span className="text-[10px] text-gray-400 mt-0.5">
                  KEY [{g.keyBind}]
                </span>
              </div>

              {/* Cooldown Overlay Badge */}
              {isCooling && (
                <div className="absolute inset-0 bg-cyber-dark/90 rounded-lg flex items-center justify-center text-xs font-bold text-cyber-red">
                  {cd}s
                </div>
              )}
            </button>
          );
        })}
      </div>
    </footer>
  );
};
