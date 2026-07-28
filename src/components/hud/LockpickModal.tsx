'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Unlock, ShieldAlert } from 'lucide-react';
import { soundManager } from '@/lib/sound/soundManager';

interface LockpickModalProps {
  isOpen: boolean;
  vaultId: string;
  difficulty: number;
  onSolve: (success: boolean) => void;
  onClose: () => void;
}

export const LockpickModal: React.FC<LockpickModalProps> = ({
  isOpen,
  onSolve,
  onClose,
}) => {
  const totalPins = 3;
  const [currentPin, setCurrentPin] = useState<number>(1);
  const [needlePos, setNeedlePos] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const [timeRemaining, setTimeRemaining] = useState<number>(15);
  const [feedback, setFeedback] = useState<string>('');

  // Target green sweet-spot (40 to 60)
  const targetMin = 38;
  const targetMax = 62;

  useEffect(() => {
    if (!isOpen) {
      setCurrentPin(1);
      setNeedlePos(0);
      setDirection(1);
      setTimeRemaining(15);
      setFeedback('');
      return;
    }

    // Timer countdown
    const timerInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          onSolve(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Needle bounce animation
    const needleInterval = setInterval(() => {
      setNeedlePos((prev) => {
        let next = prev + direction * 4;
        if (next >= 100) {
          next = 100;
          setDirection(-1);
        } else if (next <= 0) {
          next = 0;
          setDirection(1);
        }
        return next;
      });
    }, 30);

    return () => {
      clearInterval(timerInterval);
      clearInterval(needleInterval);
    };
  }, [isOpen, direction, onSolve]);

  if (!isOpen) return null;

  const handleSetPin = () => {
    if (needlePos >= targetMin && needlePos <= targetMax) {
      soundManager.playLockpickClick();
      setFeedback('PIN SET!');
      if (currentPin >= totalPins) {
        soundManager.playLockpickSuccess();
        onSolve(true);
      } else {
        setCurrentPin((prev) => prev + 1);
        setTimeout(() => setFeedback(''), 600);
      }
    } else {
      soundManager.playAlert();
      setFeedback('MISSED! TRY AGAIN');
      setTimeout(() => setFeedback(''), 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-cyber-panel border-2 border-cyber-cyan rounded-xl p-6 max-w-md w-full shadow-neon-cyan flex flex-col items-center text-center font-mono relative">
        {/* Header */}
        <div className="flex items-center space-x-2 text-cyber-cyan mb-4">
          <Lock className="w-6 h-6" />
          <h2 className="text-xl font-bold tracking-wider">CYBER-VAULT SECURITY BYPASS</h2>
        </div>

        <p className="text-xs text-gray-400 mb-6">
          Time your click when the scanner needle is in the green zone to set each tumbler pin!
        </p>

        {/* Status Indicators */}
        <div className="w-full flex items-center justify-between mb-4 px-2">
          <div className="text-sm font-bold text-white flex items-center space-x-1">
            <span>PIN:</span>
            <span className="text-cyber-green">{currentPin} / {totalPins}</span>
          </div>
          <div className="text-sm font-bold text-cyber-yellow flex items-center space-x-1">
            <span>TIMER:</span>
            <span>{timeRemaining}s</span>
          </div>
        </div>

        {/* Lock Cylinder Progress Pills */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          {Array.from({ length: totalPins }).map((_, index) => {
            const isSet = index + 1 < currentPin;
            const isCurrent = index + 1 === currentPin;
            return (
              <div
                key={index}
                className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center font-bold ${
                  isSet
                    ? 'bg-cyber-green/20 border-cyber-green text-cyber-green'
                    : isCurrent
                    ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan animate-pulse'
                    : 'bg-cyber-dark border-cyber-border text-gray-600'
                }`}
              >
                {isSet ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
            );
          })}
        </div>

        {/* Gauge Bar */}
        <div className="w-full bg-cyber-dark h-8 rounded-lg border-2 border-cyber-border relative overflow-hidden mb-6">
          {/* Target Sweet Spot */}
          <div
            className="absolute top-0 bottom-0 bg-cyber-green/40 border-l border-r border-cyber-green"
            style={{
              left: `${targetMin}%`,
              width: `${targetMax - targetMin}%`,
            }}
          />

          {/* Scanner Needle */}
          <div
            className="absolute top-0 bottom-0 w-1.5 bg-cyber-cyan shadow-[0_0_8px_#00f0ff] transition-all duration-75"
            style={{ left: `${needlePos}%` }}
          />
        </div>

        {/* Feedback text */}
        <div className="h-6 mb-4">
          {feedback && (
            <span
              className={`text-sm font-bold ${
                feedback.includes('SET') ? 'text-cyber-green' : 'text-cyber-red animate-bounce'
              }`}
            >
              {feedback}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded border border-cyber-border bg-cyber-dark hover:bg-cyber-border text-gray-400 hover:text-white transition-all text-sm font-bold"
          >
            ABORT (ESC)
          </button>
          <button
            onClick={handleSetPin}
            className="flex-2 py-2.5 px-6 rounded border-2 border-cyber-cyan bg-cyber-cyan/20 hover:bg-cyber-cyan text-cyber-cyan hover:text-cyber-dark transition-all text-sm font-black tracking-wider shadow-neon-cyan"
          >
            SET PIN [SPACE / CLICK]
          </button>
        </div>
      </div>
    </div>
  );
};
