import React from 'react';
import { Character, FamilyMember, Vassal } from '../../types';
import { 
  AlertTriangle, 
  Swords, 
  Coins, 
  ShieldCheck, 
  Crown, 
  Flame, 
  Award, 
  X,
  Users
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface SuccessionCrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  pretenderName: string;
  pretenderRelation: string;
  pretenderPortrait: string;
  pretenderArmySize: number;
  onWageSuccessionWar: () => void;
  onPartitionDuchy: () => void;
  onBuyOffClaimant: () => void;
  onDuelPretender: () => void;
}

export const SuccessionCrisisModal: React.FC<SuccessionCrisisModalProps> = ({
  isOpen,
  onClose,
  character,
  pretenderName,
  pretenderRelation,
  pretenderPortrait,
  pretenderArmySize,
  onWageSuccessionWar,
  onPartitionDuchy,
  onBuyOffClaimant,
  onDuelPretender
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-rose-500/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-stone-800 pb-3">
          <div className="w-12 h-12 rounded-xl bg-stone-950 border border-rose-500/60 flex items-center justify-center text-3xl shadow">
            {pretenderPortrait}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-serif font-bold text-rose-100">Succession Crisis: The Pretender's Revolt!</h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                Civil War Threat
              </span>
            </div>
            <p className="text-xs text-stone-400">
              {pretenderName} ({pretenderRelation}) has raised {pretenderArmySize.toLocaleString()} rebel troops contesting your right to rule House {character.dynastyName}!
            </p>
          </div>
        </div>

        {/* Story Text */}
        <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300 italic leading-relaxed">
          "Following the death of the previous monarch, rival banners fly across the southern marches. Your {pretenderRelation.toLowerCase()} claims the succession was fraudulent and demands you abdicate or face war."
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {/* Mobilize Loyalists */}
          <button
            onClick={onWageSuccessionWar}
            className="w-full p-3.5 rounded-xl bg-gradient-to-r from-rose-950/40 via-stone-950 to-stone-950 hover:from-rose-900/50 hover:to-stone-900 border border-rose-800/60 hover:border-rose-500 text-left transition-all flex items-start justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-rose-200">
                <Swords className="w-4 h-4 text-rose-400" />
                <span>Rally Crown Loyalists & Crush the Revolt</span>
              </div>
              <p className="text-[11px] text-stone-400">Mobilize all loyal knights to extinguish the rebellion (+Civil War, High Dread).</p>
            </div>
            <span className="text-xs font-serif font-bold text-rose-300">Total War ⚔️</span>
          </button>

          {/* Duel in Single Combat */}
          <button
            onClick={onDuelPretender}
            className="w-full p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-stone-950 to-stone-950 hover:from-amber-900/50 hover:to-stone-900 border border-amber-800/60 hover:border-amber-500 text-left transition-all flex items-start justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-amber-200">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Challenge Pretender to Trial by Single Combat</span>
              </div>
              <p className="text-[11px] text-stone-400">Settle the crown before the eyes of gods and men in the courtyard lists.</p>
            </div>
            <span className="text-xs font-serif font-bold text-amber-300">Duel 🛡️</span>
          </button>

          {/* Partition Frontier Duchy */}
          <button
            onClick={onPartitionDuchy}
            className="w-full p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-purple-500 text-left transition-all flex items-start justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-purple-200">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Grant Frontier Duchy & Form Cadet House</span>
              </div>
              <p className="text-[11px] text-stone-400">Cede a distant border county in return for an eternal oath of non-aggression.</p>
            </div>
            <span className="text-xs font-serif font-bold text-purple-300">Partition 📜</span>
          </button>

          {/* Buy Off Claim */}
          <button
            onClick={onBuyOffClaimant}
            disabled={character.stats.gold < 150}
            className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start justify-between ${
              character.stats.gold >= 150 
                ? 'bg-stone-950 hover:bg-stone-800 border-stone-800 hover:border-amber-500' 
                : 'bg-stone-950/40 border-stone-800/40 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-amber-200">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Pay Treasury Indemnity (150 🪙)</span>
              </div>
              <p className="text-[11px] text-stone-400">Bribe mercenary captains to abandon the pretender's cause peacefully.</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">150 Gold</span>
          </button>
        </div>

      </div>
    </div>
  );
};
