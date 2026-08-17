import React from 'react';
import { Character, CharacterNemesis } from '../../types';
import { 
  Flame, 
  Swords, 
  Skull, 
  Scroll, 
  ShieldAlert, 
  HeartHandshake, 
  X, 
  Award,
  AlertTriangle
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface NemesisFeudModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  nemesis: CharacterNemesis;
  onDuelNemesis: () => void;
  onSlanderNemesis: () => void;
  onAssassinateNemesis: () => void;
  onTruceNemesis: () => void;
}

export const NemesisFeudModal: React.FC<NemesisFeudModalProps> = ({
  isOpen,
  onClose,
  character,
  nemesis,
  onDuelNemesis,
  onSlanderNemesis,
  onAssassinateNemesis,
  onTruceNemesis
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-rose-500/70 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-stone-950 border border-rose-500/60 flex items-center justify-center text-3xl shadow">
              {nemesis.targetPortrait}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-bold text-rose-100">{nemesis.targetName}</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  {nemesis.feudStatus}
                </span>
              </div>
              <p className="text-xs text-stone-400">{nemesis.targetTitle} • Feud Intensity: <span className="text-rose-400 font-mono font-bold">{nemesis.feudIntensity}/100</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reason for Feud */}
        <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-2 text-xs">
          <div className="text-rose-300 font-serif font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Origin of the Blood Feud:</span>
          </div>
          <p className="text-stone-300 italic">{nemesis.reason}</p>

          <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-400 space-y-1">
            <div className="font-mono text-stone-500 uppercase text-[10px]">Feud Annals:</div>
            {nemesis.feudHistory.map((h, i) => (
              <div key={i}>• {h}</div>
            ))}
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Duel of Honor */}
          <button
            onClick={() => {
              sound.playSword();
              onDuelNemesis();
            }}
            className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-rose-500 text-left transition-all space-y-1"
          >
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-rose-300">
              <Swords className="w-4 h-4" /> Challenge to Duel of Honor
            </div>
            <p className="text-[10px] text-stone-400">Meet in the courtyard with sharp steel (Martial Check).</p>
          </button>

          {/* Slander Campaign */}
          <button
            onClick={() => {
              sound.playClick();
              onSlanderNemesis();
            }}
            className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-purple-500 text-left transition-all space-y-1"
          >
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-purple-300">
              <Scroll className="w-4 h-4" /> Launch Slander Campaign
            </div>
            <p className="text-[10px] text-stone-400">Spread humiliating rumors to destroy their court prestige.</p>
          </button>

          {/* Vendetta Assassination */}
          <button
            onClick={() => {
              sound.playSword();
              onAssassinateNemesis();
            }}
            className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-rose-600 text-left transition-all space-y-1"
          >
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-rose-400">
              <Skull className="w-4 h-4" /> Clandestine Vendetta Strike
            </div>
            <p className="text-[10px] text-stone-400">Dispatch assassin guild blades to eliminate the nemesis.</p>
          </button>

          {/* Settle Truce */}
          <button
            onClick={() => {
              sound.playFanfare();
              onTruceNemesis();
            }}
            className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-emerald-500 text-left transition-all space-y-1"
          >
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-emerald-300">
              <HeartHandshake className="w-4 h-4" /> Offer Bitter Blood Truce
            </div>
            <p className="text-[10px] text-stone-400">Propose non-aggression settlement and end the feud peacefully.</p>
          </button>
        </div>

      </div>
    </div>
  );
};
