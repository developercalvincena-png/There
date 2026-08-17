import React from 'react';
import { Character, StressBreakChoice } from '../../types';
import { STRESS_BREAK_OPTIONS } from '../../data/epochsAndCrisesData';
import { 
  HeartCrack, 
  Brain, 
  Sparkles, 
  AlertTriangle, 
  ShieldAlert, 
  Coins,
  Wine
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface StressBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  stressLevel: number; // 1, 2, or 3
  onSelectStressChoice: (choice: StressBreakChoice) => void;
}

export const StressBreakModal: React.FC<StressBreakModalProps> = ({
  isOpen,
  onClose,
  character,
  stressLevel,
  onSelectStressChoice
}) => {
  if (!isOpen) return null;

  const choices = STRESS_BREAK_OPTIONS[stressLevel] || STRESS_BREAK_OPTIONS[1];

  const handleChoice = (c: StressBreakChoice) => {
    sound.playFanfare();
    onSelectStressChoice(c);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-rose-500/70 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-stone-800 pb-3">
          <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-500/60 flex items-center justify-center text-3xl shadow">
            💔
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-serif font-bold text-rose-100">
                {stressLevel === 1 ? 'Mental Strain: Overwhelmed Sovereign' : stressLevel === 2 ? 'Severe Mental Breakdown!' : 'Catastrophic Royal Collapse!'}
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                Level {stressLevel} Break
              </span>
            </div>
            <p className="text-xs text-stone-400">
              The ceaseless burden of the crown, dynastic intrigues, and wars have pushed your mind to its absolute limit.
            </p>
          </div>
        </div>

        {/* Breakdown Flavor Text */}
        <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300 leading-relaxed italic">
          "The weight of thousands of lives rests on your shoulders. Sleepless nights, whispered council plots, and blood-soaked battlefields claw at your sanity. You must seek release before madness takes hold completely."
        </div>

        {/* Choice List */}
        <div className="space-y-3">
          <div className="text-xs font-serif font-bold uppercase tracking-wider text-amber-300">
            Choose Your Coping Mechanism:
          </div>

          {choices.map(choice => (
            <button
              key={choice.id}
              onClick={() => handleChoice(choice)}
              className="w-full p-4 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500 text-left transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-serif font-bold text-stone-100 group-hover:text-amber-200">
                  {choice.title}
                </h4>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  -{choice.stressRelieved} Stress
                </span>
              </div>
              <p className="text-[11px] text-stone-400 leading-normal">{choice.description}</p>
              
              <div className="flex items-center gap-3 text-[10px] text-stone-400 pt-1 border-t border-stone-800/60 font-mono">
                {choice.traitGained && (
                  <span className="text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60">
                    Trait: {choice.traitGained}
                  </span>
                )}
                {choice.goldCost && (
                  <span className="text-amber-300">Cost: {choice.goldCost} 🪙</span>
                )}
                {choice.renownImpact && (
                  <span className="text-blue-300">Renown: +{choice.renownImpact} 👑</span>
                )}
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
