import React, { useState } from 'react';
import { Character, GreatWonder, Province } from '../../types';
import { 
  Building2, 
  Sparkles, 
  Hammer, 
  Coins, 
  CheckCircle2, 
  Clock, 
  Crown, 
  ShieldAlert, 
  X,
  Award
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface GreatWondersModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  provinces: Province[];
  wonders: GreatWonder[];
  onInvestInWonder: (wonderId: string, stageNumber: number, costGold: number) => void;
}

export const GreatWondersModal: React.FC<GreatWondersModalProps> = ({
  isOpen,
  onClose,
  character,
  provinces,
  wonders,
  onInvestInWonder
}) => {
  const [selectedWonderId, setSelectedWonderId] = useState<string>(wonders[0]?.id || 'wonder_cathedral');

  if (!isOpen) return null;

  const selectedWonder = wonders.find(w => w.id === selectedWonderId) || wonders[0];

  const handleStartStage = (stageNum: number, cost: number) => {
    if (character.stats.gold < cost) {
      sound.playClick();
      return;
    }
    sound.playFanfare();
    onInvestInWonder(selectedWonder.id, stageNum, cost);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-amber-500/50 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-800 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-2xl shadow">
              🏛️
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-amber-100">Imperial Great Wonders & Megaprojects</h2>
              <p className="text-xs text-stone-400">Generational architectural marvels granting permanent realm-wide supremacy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-600/40 text-amber-300 text-xs font-serif font-bold flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{character.stats.gold} 🪙 Treasury</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Wonder List */}
          <div className="space-y-2.5">
            <div className="text-xs font-serif font-bold uppercase tracking-wider text-stone-400 mb-2">
              Realm Megaprojects
            </div>
            {wonders.map(wonder => {
              const isSelected = wonder.id === selectedWonder.id;
              const completedStages = wonder.stages.filter(s => s.isCompleted).length;
              return (
                <button
                  key={wonder.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedWonderId(wonder.id);
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500 shadow-lg scale-[1.01]'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <span className="text-2xl mt-0.5">{wonder.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-serif font-bold text-stone-200 truncate">{wonder.name}</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">Location: {wonder.provinceName}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-stone-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full transition-all"
                          style={{ width: `${(completedStages / wonder.stages.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-amber-400">{completedStages}/{wonder.stages.length}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Selected Wonder Blueprint & Stages */}
          <div className="md:col-span-2 space-y-5">
            <div className="bg-stone-950/70 p-5 rounded-2xl border border-stone-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{selectedWonder.icon}</span>
                    <h3 className="text-lg font-serif font-bold text-amber-200">{selectedWonder.name}</h3>
                  </div>
                  <div className="text-xs text-stone-400 mt-1">
                    Seat: <span className="text-stone-200">{selectedWonder.provinceName}</span> • Architect: <span className="text-amber-300 italic">{selectedWonder.architectName || 'Imperial Guild of Masons'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-stone-400">Total Invested</div>
                  <div className="text-sm font-bold text-amber-300">{selectedWonder.totalInvestedGold} 🪙</div>
                </div>
              </div>

              {selectedWonder.isUnderConstruction && (
                <div className="bg-amber-950/50 border border-amber-600/50 p-3 rounded-xl flex items-center justify-between text-xs text-amber-200">
                  <div className="flex items-center gap-2">
                    <Hammer className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>Stage {selectedWonder.currentStage} Construction in Progress...</span>
                  </div>
                  <span className="font-mono text-amber-300 font-bold">{selectedWonder.progressYears} Yrs Completed</span>
                </div>
              )}
            </div>

            {/* Stages Timeline */}
            <div className="space-y-3">
              <div className="text-xs font-serif font-bold uppercase tracking-wider text-stone-400">
                Architectural Blueprint & Construction Tiers
              </div>

              {selectedWonder.stages.map((stage, idx) => {
                const canBuild = !stage.isCompleted && (idx === 0 || selectedWonder.stages[idx - 1].isCompleted) && !selectedWonder.isUnderConstruction;
                const canAfford = character.stats.gold >= stage.costGold;

                return (
                  <div
                    key={stage.stageNumber}
                    className={`p-4 rounded-xl border transition-all ${
                      stage.isCompleted
                        ? 'bg-emerald-950/20 border-emerald-800/60'
                        : canBuild
                        ? 'bg-stone-900 border-amber-600/60 shadow-md'
                        : 'bg-stone-950/40 border-stone-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                          stage.isCompleted 
                            ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-600'
                            : 'bg-stone-800 text-stone-300'
                        }`}>
                          {stage.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stage.stageNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-serif font-bold text-stone-100">{stage.title}</h4>
                            {stage.isCompleted && (
                              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800">
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-400 mt-1">{stage.description}</p>
                          <div className="mt-2 text-xs font-medium text-amber-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Bonus: {stage.unlockedBonus}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {!stage.isCompleted && (
                          <div className="space-y-1.5">
                            <div className="text-xs font-bold text-amber-300">{stage.costGold} 🪙</div>
                            <div className="text-[10px] text-stone-400 flex items-center gap-1 justify-end">
                              <Clock className="w-3 h-3" /> {stage.yearsToBuild} Years
                            </div>
                            {canBuild && (
                              <button
                                onClick={() => handleStartStage(stage.stageNumber, stage.costGold)}
                                disabled={!canAfford}
                                className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all ${
                                  canAfford
                                    ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md active:scale-95'
                                    : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                                }`}
                              >
                                {canAfford ? 'Fund Stage' : 'Need Gold'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-serif font-semibold"
          >
            Close Blueprint Archive
          </button>
        </div>
      </div>
    </div>
  );
};
