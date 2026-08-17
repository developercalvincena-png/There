import React, { useState } from 'react';
import { Character, CrusadeState, DynastyArtifact, Realm } from '../../types';
import { 
  Cross, 
  Swords, 
  ShieldAlert, 
  Coins, 
  Users, 
  Award, 
  X, 
  ChevronRight, 
  Sparkles,
  Flame,
  Flag
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface CrusadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  crusade: CrusadeState;
  realms: Realm[];
  onContributeTroops: (troops: number) => void;
  onDonateGold: (gold: number) => void;
  onLeadCrusadeBattle: () => void;
  onClaimCrusadeVictory: (artifact: DynastyArtifact) => void;
}

export const CrusadeModal: React.FC<CrusadeModalProps> = ({
  isOpen,
  onClose,
  character,
  crusade,
  realms,
  onContributeTroops,
  onDonateGold,
  onLeadCrusadeBattle,
  onClaimCrusadeVictory
}) => {
  const [pledgeTroopsInput, setPledgeTroopsInput] = useState<number>(1500);
  const [donateGoldInput, setDonateGoldInput] = useState<number>(100);

  if (!isOpen) return null;

  const handlePledge = () => {
    sound.playSword();
    onContributeTroops(pledgeTroopsInput);
  };

  const handleDonate = () => {
    if (character.stats.gold < donateGoldInput) {
      sound.playClick();
      return;
    }
    sound.playFanfare();
    onDonateGold(donateGoldInput);
  };

  const handleClaimVictory = () => {
    sound.playVictory();
    const holyCrossRelic: DynastyArtifact = {
      id: `crusade_relic_${Date.now()}`,
      name: 'The Splinter of the True Cross',
      type: 'Relic',
      rarity: 'Legendary',
      icon: '✝️',
      slot: 'relic',
      effects: {
        martial: 5,
        pietyOrMana: 40,
        renown: 100,
        vassalOpinionBonus: 20
      },
      description: 'Recovered from the High Altar during the Triumph of the Great Holy Crusade.',
      history: `Won by the sovereign vanguard of House ${character.dynastyName} in holy conquest.`,
      isEquipped: true
    };
    onClaimCrusadeVictory(holyCrossRelic);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-amber-500/70 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-2xl shadow">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-bold text-amber-100">{crusade.type}: The Liberation of {crusade.targetHolySite}</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  {crusade.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-stone-400">Proclaimed by {crusade.proclaimerTitle} {crusade.proclaimerPortrait}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* War Balance of Power */}
        <div className="bg-stone-950/80 p-4 rounded-xl border border-stone-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">✝️</span>
              <div>
                <div className="font-serif font-bold text-blue-300">Crusader Host</div>
                <div className="text-[10px] text-stone-400 font-mono">{crusade.crusaderTotalArmy.toLocaleString()} Troops</div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs font-serif font-bold text-amber-300">War Score</div>
              <div className={`text-lg font-mono font-bold ${crusade.warScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {crusade.warScore > 0 ? `+${crusade.warScore}%` : `${crusade.warScore}%`}
              </div>
            </div>

            <div className="flex items-center gap-2 text-right">
              <div>
                <div className="font-serif font-bold text-rose-300">{crusade.targetRealmName}</div>
                <div className="text-[10px] text-stone-400 font-mono">{crusade.defenderTotalArmy.toLocaleString()} Defenders</div>
              </div>
              <span className="text-xl">☪️</span>
            </div>
          </div>

          <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden flex">
            <div 
              className="bg-blue-500 h-full transition-all"
              style={{ width: `${Math.max(10, Math.min(90, 50 + crusade.warScore / 2))}%` }}
            />
            <div 
              className="bg-rose-500 h-full transition-all"
              style={{ width: `${Math.max(10, Math.min(90, 50 - crusade.warScore / 2))}%` }}
            />
          </div>
        </div>

        {/* Player's Dynastic Contribution */}
        <div className="p-4 bg-gradient-to-r from-amber-950/30 to-stone-950 rounded-xl border border-amber-600/40 flex items-center justify-between text-xs">
          <div>
            <div className="font-serif font-bold text-amber-200">Your Dynastic Contribution Score:</div>
            <p className="text-[11px] text-stone-400">
              Pledged: <span className="text-stone-200">{crusade.playerPledgedTroops} Men</span> • Donated: <span className="text-amber-300">{crusade.playerDonatedGold} 🪙</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold font-mono text-amber-300">{crusade.playerContributionScore} pts</div>
            <div className="text-[10px] text-amber-400/80 font-serif">Rank: Sovereign Vanguard Leader</div>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Mobilize Troops */}
          <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-blue-300">
              <Users className="w-4 h-4" /> Pledge Crown Levies
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={pledgeTroopsInput}
                onChange={(e) => setPledgeTroopsInput(Math.max(500, Number(e.target.value)))}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg p-1.5 text-xs text-stone-200 font-mono"
              />
              <button
                onClick={handlePledge}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-serif font-bold shrink-0"
              >
                Pledge 🛡️
              </button>
            </div>
          </div>

          {/* Donate Gold Tithe */}
          <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-amber-300">
              <Coins className="w-4 h-4" /> War Chest Tithe (Treasury: {character.stats.gold} 🪙)
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={donateGoldInput}
                onChange={(e) => setDonateGoldInput(Math.max(25, Number(e.target.value)))}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg p-1.5 text-xs text-stone-200 font-mono"
              />
              <button
                onClick={handleDonate}
                disabled={character.stats.gold < donateGoldInput}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 rounded-lg text-xs font-serif font-bold shrink-0"
              >
                Donate 🪙
              </button>
            </div>
          </div>
        </div>

        {/* Lead Vanguard / Claim Victory Actions */}
        {crusade.warScore >= 80 ? (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/60 rounded-xl text-center space-y-2">
            <div className="text-2xl">🏆</div>
            <h3 className="text-sm font-serif font-bold text-emerald-200">The Holy City is Liberated!</h3>
            <p className="text-xs text-stone-300">
              The Crusader armies have triumphed! As the supreme contributor, House {character.dynastyName} may claim the holy crown and sacred relics.
            </p>
            <button
              onClick={handleClaimVictory}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-serif font-bold text-xs shadow-lg"
            >
              Claim Holy Cross Relic & Crusade Triumph ✝️
            </button>
          </div>
        ) : (
          <button
            onClick={onLeadCrusadeBattle}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 hover:from-amber-500 hover:to-rose-500 text-white font-serif font-bold text-xs shadow-xl flex items-center justify-center gap-2"
          >
            <Swords className="w-4 h-4" />
            <span>Lead Vanguard Assault at the Gates of {crusade.targetHolySite} (+25 War Score)</span>
          </button>
        )}

      </div>
    </div>
  );
};
