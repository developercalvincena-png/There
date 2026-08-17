import React from 'react';
import { Character, NomadInvasionState, Province, Vassal } from '../../types';
import { 
  Flame, 
  Swords, 
  Coins, 
  ShieldCheck, 
  Crown, 
  X, 
  AlertOctagon, 
  Award,
  Sparkles
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface NomadInvasionModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  nomadInvasion: NomadInvasionState;
  provinces: Province[];
  onPayTribute: () => void;
  onFightHorde: () => void;
  onSettleWarlordAsVassal: () => void;
}

export const NomadInvasionModal: React.FC<NomadInvasionModalProps> = ({
  isOpen,
  onClose,
  character,
  nomadInvasion,
  provinces,
  onPayTribute,
  onFightHorde,
  onSettleWarlordAsVassal
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-amber-600/70 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-stone-950 border border-amber-500/60 flex items-center justify-center text-3xl shadow">
              {nomadInvasion.warlordPortrait}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-bold text-amber-100">{nomadInvasion.threatType}: {nomadInvasion.warlordName}</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  {nomadInvasion.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-stone-400">{nomadInvasion.warlordTitle} • Host Strength: <span className="text-amber-300 font-mono font-bold">{nomadInvasion.hordeStrength.toLocaleString()} Warriors</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Threat Lore & Ultimatum */}
        <div className="p-4 bg-gradient-to-r from-stone-950 via-rose-950/20 to-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-2">
          <div className="flex items-center gap-2 text-rose-300 font-serif font-bold">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <span>Warlord's Ultimatum to the Realm:</span>
          </div>
          <p className="italic">
            "We have burned the frontier outposts. Deliver <span className="text-amber-300 font-bold">{nomadInvasion.demandedTributeGold} silver talents in Danegeld</span> to our longships, or we shall torch your coastal monasteries and put your frontier to the sword!"
          </p>
        </div>

        {/* Options Grid */}
        <div className="space-y-3">
          {/* Option 1: Pay Tribute / Danegeld */}
          <button
            onClick={onPayTribute}
            disabled={character.stats.gold < nomadInvasion.demandedTributeGold}
            className={`w-full p-4 rounded-xl border text-left transition-all flex items-start justify-between ${
              character.stats.gold >= nomadInvasion.demandedTributeGold
                ? 'bg-stone-950 hover:bg-stone-800 border-stone-800 hover:border-amber-500'
                : 'bg-stone-950/40 border-stone-800/40 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-amber-200">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Pay Danegeld Tribute ({nomadInvasion.demandedTributeGold} 🪙)</span>
              </div>
              <p className="text-[11px] text-stone-400">
                The raiders take the gold chests and sail away into the mist for three years.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">Peaceful Buyout</span>
          </button>

          {/* Option 2: Clash in Battle */}
          <button
            onClick={onFightHorde}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-rose-950/40 to-stone-950 hover:from-rose-900/50 hover:to-stone-900 border border-rose-800/60 hover:border-rose-500 text-left transition-all flex items-start justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-rose-200">
                <Swords className="w-4 h-4 text-rose-400" />
                <span>Deploy Royal Vanguard & Slay the Warlord in Combat</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Form the shield wall and crush the invaders. Yields +80 Dynastic Renown and plunder artifacts.
              </p>
            </div>
            <span className="text-xs font-serif font-bold text-rose-300">Martial Clash ⚔️</span>
          </button>

          {/* Option 3: Settle as Vassal March Duke (Danelaw / Norman Settlement) */}
          <button
            onClick={onSettleWarlordAsVassal}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-950/40 to-stone-950 hover:from-purple-900/50 hover:to-stone-900 border border-purple-800/60 hover:border-purple-500 text-left transition-all flex items-start justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-purple-200">
                <Crown className="w-4 h-4 text-purple-400" />
                <span>Grant Frontier Duchy & Settle as Feudal March Duke</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Baptize the Warlord and make him a loyal sovereign border marshal (+3,000 Elite Vanguard, New Loyal Duke).
              </p>
            </div>
            <span className="text-xs font-serif font-bold text-purple-300">Diplomatic Fealty 📜</span>
          </button>
        </div>

      </div>
    </div>
  );
};
