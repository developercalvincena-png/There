import React, { useState } from 'react';
import { Character, ImperialEdict } from '../../types';
import { Crown, Sparkles, Check, Coins, Shield, Globe, Award } from 'lucide-react';
import { sound } from '../../utils/audio';

interface ImperialEdictsSubTabProps {
  character: Character;
  imperialEdicts: ImperialEdict[];
  onUpdateImperialEdicts: (edicts: ImperialEdict[]) => void;
  onUpdateCharacter: (updates: Partial<Character>) => void;
  onAddChronicle: (entry: { title: string; description: string; type: 'court' | 'diplomacy' | 'war' | 'realm' }) => void;
}

export const ImperialEdictsSubTab: React.FC<ImperialEdictsSubTabProps> = ({
  character,
  imperialEdicts,
  onUpdateImperialEdicts,
  onUpdateCharacter,
  onAddChronicle
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const isKingOrHigher = ['King', 'High King', 'Emperor', 'Grand Sovereign', 'High Queen', 'Imperatrix'].some(
    r => character.rank.toLowerCase().includes(r.toLowerCase()) || (character.title && character.title.toLowerCase().includes(r.toLowerCase()))
  );

  const toggleEdict = (edict: ImperialEdict) => {
    if (edict.minRankRequired === 'Emperor' && !character.rank.toLowerCase().includes('emperor') && !character.rank.toLowerCase().includes('grand sovereign')) {
      setFeedback(`Requires the rank of Emperor to enact this supreme edict.`);
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    if (!edict.isActive && character.stats.gold < edict.upkeepCost) {
      setFeedback(`Not enough gold for initial imperial decree registry (Requires ${edict.upkeepCost} 🪙).`);
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    sound.playFanfare();
    const willBeActive = !edict.isActive;

    if (willBeActive) {
      onUpdateCharacter({
        stats: {
          ...character.stats,
          gold: character.stats.gold - edict.upkeepCost,
          renown: character.stats.renown + 20
        }
      });
      onAddChronicle({
        title: `📜 Imperial Edict Enacted: ${edict.name}`,
        description: `Proclaimed the grand imperial decree across all realm dominions: ${edict.description}`,
        type: 'realm'
      });
      setFeedback(`Enacted Imperial Edict: ${edict.name}!`);
    } else {
      setFeedback(`Repealed Imperial Edict: ${edict.name}.`);
    }

    const updated = imperialEdicts.map(e => e.id === edict.id ? { ...e, isActive: willBeActive } : e);
    onUpdateImperialEdicts(updated);
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-4">
      {feedback && (
        <div className="p-3 bg-amber-950/90 border border-amber-500/80 rounded-xl text-xs text-amber-200 font-bold shadow-lg">
          {feedback}
        </div>
      )}

      {/* Grand Edicts Banner */}
      <div className="bg-stone-900/90 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-amber-200 font-cinzel flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              Imperial Decrees & Sovereign Edicts
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Enact realm-wide imperial legislation to standardize commerce, military power, and inter-species peace.
            </p>
          </div>

          <div className="bg-stone-950/90 px-3 py-1.5 rounded-xl border border-stone-800 text-xs flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-stone-400">Current Rank:</span>
            <strong className="text-amber-300 font-bold">{character.rank}</strong>
          </div>
        </div>

        {/* Edicts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {imperialEdicts.map(edict => {
            return (
              <div
                key={edict.id}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all shadow-md ${
                  edict.isActive
                    ? 'bg-gradient-to-br from-amber-950/40 via-stone-950/90 to-stone-950 border-amber-500 shadow-amber-950/20'
                    : 'bg-stone-950/70 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{edict.icon}</span>
                      <div>
                        <h3 className="font-bold text-sm text-stone-100 font-cinzel">{edict.name}</h3>
                        <span className="text-[10px] text-amber-400 font-medium">{edict.category} Decree</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                      edict.isActive 
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600' 
                        : 'bg-stone-900 text-stone-400 border-stone-700'
                    }`}>
                      {edict.isActive ? 'Active Edict' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-300 leading-snug">{edict.description}</p>

                  <div className="mt-2.5 p-2 bg-stone-900/90 rounded-lg border border-stone-800/80 text-[11px] text-emerald-400 font-medium">
                    ✨ {edict.effects}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs">
                  <span className="text-stone-400">
                    Upkeep: <strong className="text-amber-400 font-mono">{edict.upkeepCost} 🪙/yr</strong>
                  </span>

                  <button
                    onClick={() => toggleEdict(edict)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
                      edict.isActive
                        ? 'bg-red-950 hover:bg-red-900 text-red-300 border border-red-700'
                        : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950'
                    }`}
                  >
                    {edict.isActive ? 'Repeal Decree' : 'Enact Edict'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
