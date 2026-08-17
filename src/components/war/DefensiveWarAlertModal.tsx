import React, { useState } from 'react';
import { WarState, Character } from '../../types';
import { sound } from '../../utils/audio';
import { Shield, Swords, Coins, AlertTriangle, UserCheck, Castle, Flame } from 'lucide-react';

interface DefensiveWarAlertModalProps {
  war: WarState;
  character: Character;
  onRespondToInvasion: (
    strategy: 'rally_host' | 'fortify_ramparts' | 'hire_mercenaries' | 'pay_truce',
    goldCost: number,
    bonusTroops: number,
    updatedWar: WarState
  ) => void;
}

export const DefensiveWarAlertModal: React.FC<DefensiveWarAlertModalProps> = ({
  war,
  character,
  onRespondToInvasion
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<'rally_host' | 'fortify_ramparts' | 'hire_mercenaries' | 'pay_truce'>('rally_host');
  const [commandDirectly, setCommandDirectly] = useState<boolean>(true);

  const canAffordMercenaries = character.stats.gold >= 120;
  const canAffordTruce = character.stats.gold >= 180;

  const handleConfirm = () => {
    sound.playSword();

    let goldCost = 0;
    let bonusTroops = 0;
    let newPlayerTactics = war.playerTactics || 'Fortified Shieldwall & Defilade';
    let newScore = war.warScore;
    let playerLevies = war.playerLevies;

    if (selectedStrategy === 'rally_host') {
      newScore = -8; // Mobilization closes gap
    } else if (selectedStrategy === 'fortify_ramparts') {
      newPlayerTactics = 'Fortified Shieldwall & Defilade';
      newScore = -5;
    } else if (selectedStrategy === 'hire_mercenaries' && canAffordMercenaries) {
      goldCost = 120;
      bonusTroops = 3500;
      playerLevies += 3500;
      newScore = 0; // Neutralized enemy surprise momentum
    } else if (selectedStrategy === 'pay_truce' && canAffordTruce) {
      goldCost = 180;
    }

    const updatedWar: WarState = {
      ...war,
      isPlayerCommanding: commandDirectly,
      playerLevies,
      yearlyTroops: playerLevies,
      playerTactics: newPlayerTactics,
      warScore: newScore,
      defensiveResponse: selectedStrategy
    };

    onRespondToInvasion(selectedStrategy, goldCost, bonusTroops, updatedWar);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border-2 border-red-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in duration-300">
        
        {/* Header with Aggressive War Horn Banner */}
        <div className="bg-linear-to-r from-red-950 via-red-900 to-stone-950 p-6 border-b border-red-700/60 relative">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600/30 border border-red-500 rounded-xl text-red-300 animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-red-400">Homeland Under Siege • Defensive War</span>
              <h2 className="text-2xl font-serif font-black text-amber-100 flex items-center gap-2">
                🚨 {war.targetRealmName} Has Invaded!
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-stone-300">
          
          {/* Enemy Ruler & Army Details */}
          <div className="bg-stone-950/80 border border-red-900/50 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-red-950/70 border border-red-600/60 flex items-center justify-center text-4xl shadow-inner">
                {war.targetLeaderPortrait || '👑'}
              </div>
              <div>
                <div className="text-xs text-red-400 uppercase font-semibold">Enemy Aggressor</div>
                <div className="text-lg font-bold text-amber-100">{war.targetLeaderTitle} {war.targetLeaderName}</div>
                <div className="text-xs text-stone-400">Realm: <span className="text-stone-200 font-semibold">{war.targetRealmName}</span></div>
              </div>
            </div>

            <div className="text-right border-l border-stone-800 pl-4">
              <div className="text-xs text-red-400 uppercase font-semibold">Invasion Vanguard</div>
              <div className="text-2xl font-mono font-black text-red-400">
                {war.enemyLevies.toLocaleString()}
              </div>
              <div className="text-xs text-stone-400">Enemy Troops</div>
            </div>
          </div>

          {/* Casus Belli Box */}
          <div className="bg-red-950/20 border border-red-800/40 rounded-xl p-4 text-sm space-y-1">
            <div className="text-xs font-bold uppercase text-red-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" /> Enemy War Goal & Casus Belli
            </div>
            <p className="text-stone-200 italic">"{war.claimUsed || war.warGoal}"</p>
            <p className="text-xs text-stone-400">
              Foreign regiments have crossed our border marches, capturing frontier outposts and demanding immediate submission of our sovereign lands.
            </p>
          </div>

          {/* Strategic Defense Responses */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              Select Royal Defense Strategy:
            </label>
            
            <div className="space-y-2.5">
              
              {/* Option 1: Rally Royal Host */}
              <div 
                onClick={() => setSelectedStrategy('rally_host')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  selectedStrategy === 'rally_host' 
                    ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500' 
                    : 'bg-stone-950/50 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-900/30 text-amber-400 border border-amber-700/40 mt-0.5">
                    <Swords className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-amber-200 text-sm">Rally the Imperial Host (Grand Mobilization)</div>
                    <div className="text-xs text-stone-400 mt-0.5">
                      Summon all standing county levies and march all 5 royal commanders to meet the invaders on the open field.
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded border border-emerald-800">
                  Ready
                </span>
              </div>

              {/* Option 2: Fortify Ramparts */}
              <div 
                onClick={() => setSelectedStrategy('fortify_ramparts')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  selectedStrategy === 'fortify_ramparts' 
                    ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500' 
                    : 'bg-stone-950/50 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-900/30 text-blue-400 border border-blue-700/40 mt-0.5">
                    <Castle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-blue-200 text-sm">Fortify Border Ramparts & Deep Trench Defenses</div>
                    <div className="text-xs text-stone-400 mt-0.5">
                      Prepare barbed defilades and garrison strongpoints. Grants tactical advantage and reduces initial defender casualties.
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-400 bg-blue-950/50 px-2 py-1 rounded border border-blue-800">
                  +15% Defense
                </span>
              </div>

              {/* Option 3: Hire Mercenaries */}
              <div 
                onClick={() => canAffordMercenaries && setSelectedStrategy('hire_mercenaries')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  !canAffordMercenaries ? 'opacity-50 cursor-not-allowed bg-stone-950/30 border-stone-900' :
                  selectedStrategy === 'hire_mercenaries' 
                    ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500' 
                    : 'bg-stone-950/50 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-yellow-900/30 text-yellow-400 border border-yellow-700/40 mt-0.5">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-yellow-200 text-sm">Contract Foreign Mercenary Regiments</div>
                    <div className="text-xs text-stone-400 mt-0.5">
                      Deploy 120 gold to instantly reinforce your defensive vanguard with 3,500 veteran mercenary shock troops.
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-yellow-400 bg-yellow-950/50 px-2 py-1 rounded border border-yellow-800">
                  120 🪙 (+3.5k Troops)
                </span>
              </div>

              {/* Option 4: Pay Indemnity / Immediate Truce */}
              <div 
                onClick={() => canAffordTruce && setSelectedStrategy('pay_truce')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  !canAffordTruce ? 'opacity-50 cursor-not-allowed bg-stone-950/30 border-stone-900' :
                  selectedStrategy === 'pay_truce' 
                    ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500' 
                    : 'bg-stone-950/50 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-900/30 text-purple-400 border border-purple-700/40 mt-0.5">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-purple-200 text-sm">Dispatch Royal Herald to Pay Border Tribute</div>
                    <div className="text-xs text-stone-400 mt-0.5">
                      Pay 180 gold indemnity to negotiate an immediate non-aggression truce, averting bloodshed and provincial devastation.
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-purple-400 bg-purple-950/50 px-2 py-1 rounded border border-purple-800">
                  180 🪙 (Avert War)
                </span>
              </div>

            </div>
          </div>

          {/* Commander Preference Toggle */}
          {selectedStrategy !== 'pay_truce' && (
            <div className="p-3.5 bg-stone-950/60 border border-stone-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-xs font-bold text-stone-200">Personal Royal Command</div>
                  <div className="text-[11px] text-stone-400">Lead the defense from the royal standard (+15% combat power, risks wound).</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCommandDirectly(!commandDirectly)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  commandDirectly 
                    ? 'bg-amber-600 text-stone-950 border-amber-400' 
                    : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                }`}
              >
                {commandDirectly ? 'Direct Command: ON' : 'Entrust Marshals'}
              </button>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          <div className="text-xs text-stone-400">
            Treasury: <span className="font-bold text-amber-300">{character.stats.gold} 🪙</span>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-linear-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-stone-950 font-black rounded-xl shadow-lg transition-all flex items-center gap-2 border border-red-400"
          >
            <Shield className="w-4 h-4" />
            {selectedStrategy === 'pay_truce' ? 'Pay Tribute & Secure Truce' : 'Confirm Defense Mobilization'}
          </button>
        </div>

      </div>
    </div>
  );
};
