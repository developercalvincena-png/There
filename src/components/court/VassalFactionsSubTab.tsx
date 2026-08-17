import React, { useState } from 'react';
import { Character, HookSecret, Vassal, VassalFaction } from '../../types';
import { 
  ShieldAlert, 
  Users, 
  Crown, 
  Coins, 
  Sparkles, 
  Key, 
  Flame, 
  AlertOctagon, 
  CheckCircle, 
  Swords, 
  HeartHandshake,
  UserMinus,
  Lock
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface VassalFactionsSubTabProps {
  character: Character;
  vassals: Vassal[];
  factions: VassalFaction[];
  hooksAndSecrets: HookSecret[];
  totalArmyPower: number;
  onUpdateFactions: (factions: VassalFaction[]) => void;
  onUpdateVassals: (vassals: Vassal[]) => void;
  onUpdateCharacter: (updates: Partial<Character>) => void;
  onUpdateHooksAndSecrets: (hooks: HookSecret[]) => void;
  onAddChronicle: (entry: { title: string; description: string; type: 'intrigue' | 'diplomacy' | 'war' | 'court' }) => void;
  onTriggerCivilWarBattle?: (faction: VassalFaction) => void;
}

export const VassalFactionsSubTab: React.FC<VassalFactionsSubTabProps> = ({
  character,
  vassals,
  factions,
  hooksAndSecrets,
  totalArmyPower,
  onUpdateFactions,
  onUpdateVassals,
  onUpdateCharacter,
  onUpdateHooksAndSecrets,
  onAddChronicle,
  onTriggerCivilWarBattle
}) => {
  const [activeUltimatumModal, setActiveUltimatumModal] = useState<VassalFaction | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'warning' | 'danger' } | null>(null);

  const showFeedback = (message: string, type: 'success' | 'warning' | 'danger' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Re-calculate faction power based on actual current vassal troops
  const crownPower = Math.max(800, totalArmyPower);

  // Compute power for a faction
  const getFactionPowerInfo = (faction: VassalFaction) => {
    const memberVassals = vassals.filter(v => 
      v.faction === faction.kind || 
      (faction.kind === 'Liberty' && (v.faction === 'Autonomy' || v.faction === 'LowerTaxes')) ||
      (faction.kind === 'Claimant' && v.faction === 'PretenderClaimant') ||
      faction.memberVassalIds.includes(v.id)
    );

    const factionTroops = memberVassals.reduce((sum, v) => sum + (v.troops || 400), 0);
    const powerPercent = Math.min(150, Math.round((factionTroops / crownPower) * 100));
    const isDangerous = powerPercent >= 50;

    return { memberVassals, factionTroops, powerPercent, isDangerous };
  };

  // Coerce vassal out of faction using a Hook
  const handleUseHookOnVassal = (vassalId: string, factionId: string) => {
    const vassal = vassals.find(v => v.id === vassalId);
    if (!vassal) return;

    const availableHook = hooksAndSecrets.find(h => h.targetId === vassal.id || h.targetName === vassal.name);
    if (!availableHook) {
      showFeedback(`No blackmail hook held against ${vassal.name}. Dispatch Spymaster to fabricate one!`, 'warning');
      return;
    }

    sound.playMagic();
    // Update vassal to Loyalist
    const updatedVassals = vassals.map(v => 
      v.id === vassal.id ? { ...v, faction: 'Loyalist' as const, loyalty: Math.min(100, v.loyalty + 25) } : v
    );
    onUpdateVassals(updatedVassals);

    // Update faction members
    const updatedFactions = factions.map(f => 
      f.id === factionId ? { ...f, memberVassalIds: f.memberVassalIds.filter(id => id !== vassal.id) } : f
    );
    onUpdateFactions(updatedFactions);

    // Consume hook if weak
    if (availableHook.type !== 'Strong Hook') {
      onUpdateHooksAndSecrets(hooksAndSecrets.filter(h => h.id !== availableHook.id));
    }

    onAddChronicle({
      title: `🗡️ Faction Dissolved: Hook Coercion`,
      description: `Used secret leverage "${availableHook.secretName}" to force ${vassal.name} out of ${factions.find(f => f.id === factionId)?.title}.`,
      type: 'intrigue'
    });

    showFeedback(`Successfully forced ${vassal.name} to abandon the faction using ${availableHook.secretName}!`, 'success');
  };

  // Bribe vassal with gold to leave faction
  const handleBribeVassal = (vassalId: string, factionId: string) => {
    const cost = 45;
    if (character.stats.gold < cost) {
      showFeedback(`Not enough gold to bribe vassal (Requires ${cost} 🪙).`, 'warning');
      return;
    }

    const vassal = vassals.find(v => v.id === vassalId);
    if (!vassal) return;

    sound.playCoin();
    onUpdateCharacter({ stats: { ...character.stats, gold: character.stats.gold - cost } });

    const updatedVassals = vassals.map(v => 
      v.id === vassal.id ? { ...v, faction: 'Loyalist' as const, loyalty: Math.min(100, v.loyalty + 20), opinion: Math.min(100, v.opinion + 25) } : v
    );
    onUpdateVassals(updatedVassals);

    const updatedFactions = factions.map(f => 
      f.id === factionId ? { ...f, memberVassalIds: f.memberVassalIds.filter(id => id !== vassal.id) } : f
    );
    onUpdateFactions(updatedFactions);

    onAddChronicle({
      title: `🪙 Vassal Bribed into Loyalty`,
      description: `Paid 45 Gold in royal gifts to convince ${vassal.name} to defect from the faction.`,
      type: 'diplomacy'
    });

    showFeedback(`Bribed ${vassal.name} for 45 🪙. They have defected to the Loyalists!`, 'success');
  };

  // Bestow Royal Title / Favor
  const handleBestowRoyalFavor = (vassalId: string, factionId: string) => {
    const vassal = vassals.find(v => v.id === vassalId);
    if (!vassal) return;

    sound.playFanfare();
    const updatedVassals = vassals.map(v => 
      v.id === vassal.id ? { 
        ...v, 
        faction: 'Loyalist' as const, 
        loyalty: Math.min(100, v.loyalty + 30), 
        opinion: Math.min(100, v.opinion + 35),
        traits: Array.from(new Set([...v.traits, 'Honored Imperial Subject']))
      } : v
    );
    onUpdateVassals(updatedVassals);

    const updatedFactions = factions.map(f => 
      f.id === factionId ? { ...f, memberVassalIds: f.memberVassalIds.filter(id => id !== vassal.id) } : f
    );
    onUpdateFactions(updatedFactions);

    onAddChronicle({
      title: `👑 Royal Honors Bestowed`,
      description: `Granted high imperial court privileges and honors to ${vassal.name}, breaking their alignment with the faction.`,
      type: 'court'
    });

    showFeedback(`Bestowed high imperial favor upon ${vassal.name}! Faction defection confirmed.`, 'success');
  };

  // Respond to Ultimatum: Accept Demands
  const handleAcceptUltimatum = (faction: VassalFaction) => {
    sound.playCoin();
    setActiveUltimatumModal(null);

    // Apply concessions
    onUpdateCharacter({
      stats: {
        ...character.stats,
        gold: Math.max(0, character.stats.gold - 50),
        renown: Math.max(0, character.stats.renown - 30)
      }
    });

    // Reset faction discontent
    const updatedFactions = factions.map(f => 
      f.id === faction.id ? { ...f, discontent: 10, powerPercent: 20, ultimatumSent: false } : f
    );
    onUpdateFactions(updatedFactions);

    onAddChronicle({
      title: `📜 Imperial Concessions Granted to ${faction.title}`,
      description: `Yielded to faction ultimatum, reducing taxes and granting regional exemptions to maintain peace.`,
      type: 'diplomacy'
    });

    showFeedback(`Granted concessions to ${faction.title}. Civil war averted at the cost of crown prestige.`, 'warning');
  };

  // Respond to Ultimatum: Reject and Trigger Civil War Battle
  const handleRejectUltimatum = (faction: VassalFaction) => {
    sound.playWarHorns();
    setActiveUltimatumModal(null);

    onAddChronicle({
      title: `⚔️ Vassal Civil War Erupted!`,
      description: `Rejected the traitorous ultimatum of ${faction.title}. Loyalist forces mobilized to crush the rebellion!`,
      type: 'war'
    });

    if (onTriggerCivilWarBattle) {
      onTriggerCivilWarBattle(faction);
    } else {
      showFeedback(`Ultimatum Rejected! Your royal banner is raised to crush ${faction.title}!`, 'danger');
    }
  };

  return (
    <div className="space-y-4">
      {/* Feedback Toast */}
      {feedback && (
        <div className={`p-3 rounded-xl text-xs font-bold border shadow-lg flex items-center justify-between transition-all ${
          feedback.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200' :
          feedback.type === 'warning' ? 'bg-amber-950/90 border-amber-500/80 text-amber-200' :
          'bg-red-950/90 border-red-500/80 text-red-200'
        }`}>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header & Crown Power Comparison */}
      <div className="bg-stone-900/90 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-amber-200 font-cinzel flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Imperial Vassal Factions & Liberty Leagues
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Monitor rebellious coalitions. Factions with &gt;50% of the Crown's military strength will issue ultimatums or trigger civil war.
            </p>
          </div>

          <div className="bg-stone-950/80 px-3 py-1.5 rounded-xl border border-stone-800 flex items-center gap-2 text-xs">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-stone-400">Crown Standing Armies:</span>
            <strong className="text-amber-300 font-mono">{crownPower.toLocaleString()} Troops</strong>
          </div>
        </div>

        {/* Active Factions Grid */}
        <div className="space-y-4">
          {factions.map(faction => {
            const { memberVassals, factionTroops, powerPercent, isDangerous } = getFactionPowerInfo(faction);

            return (
              <div 
                key={faction.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-lg space-y-4 ${
                  isDangerous 
                    ? 'bg-gradient-to-br from-red-950/40 via-stone-950/90 to-stone-950 border-red-600/70 shadow-red-950/20' 
                    : 'bg-stone-950/80 border-stone-800 hover:border-stone-700'
                }`}
              >
                {/* Top Title & Danger Tag */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl border ${
                      isDangerous ? 'bg-red-950 border-red-500 text-red-200 shadow-md' : 'bg-stone-900 border-stone-700'
                    }`}>
                      {faction.kind === 'Liberty' ? '🕊️' : faction.kind === 'Claimant' ? '🤴' : '⚔️'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm sm:text-base text-stone-100 font-cinzel">{faction.title}</h3>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                          isDangerous 
                            ? 'bg-red-950 text-red-300 border-red-500 animate-pulse' 
                            : 'bg-stone-900 text-stone-300 border-stone-700'
                        }`}>
                          {faction.kind} Faction
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">{faction.description}</p>
                    </div>
                  </div>

                  {/* Ultimatum Trigger Button if >50% */}
                  {isDangerous && (
                    <button
                      onClick={() => setActiveUltimatumModal(faction)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-stone-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer animate-bounce sm:self-start"
                    >
                      <AlertOctagon className="w-4 h-4 text-stone-950" />
                      <span>⚡ Review Ultimatum Demands</span>
                    </button>
                  )}
                </div>

                {/* Demands Banner */}
                <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800 text-xs flex items-start gap-2">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300 font-semibold">Faction Demands: </strong>
                    <span className="text-stone-300">{faction.demands}</span>
                  </div>
                </div>

                {/* Military Power Progress vs Crown */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400">
                      Total Faction Military Strength: <strong className="text-stone-200">{factionTroops.toLocaleString()} Troops</strong>
                    </span>
                    <span className={`font-bold font-mono ${isDangerous ? 'text-red-400 text-sm' : 'text-amber-400'}`}>
                      {powerPercent}% of Crown Power {isDangerous ? '(⚠️ Ultimatum Threshold Reached)' : '(Safe < 50%)'}
                    </span>
                  </div>

                  <div className="w-full h-3 bg-stone-900 rounded-full overflow-hidden border border-stone-800 relative">
                    {/* 50% Threshold Marker */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-amber-500/80 z-10" title="50% Ultimatum Trigger" />
                    <div 
                      className={`h-full transition-all duration-500 ${
                        isDangerous 
                          ? 'bg-gradient-to-r from-amber-500 to-red-500' 
                          : 'bg-gradient-to-r from-blue-500 to-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, powerPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Faction Members & Counter-Action Cards */}
                <div className="space-y-2 pt-1 border-t border-stone-800">
                  <div className="text-xs font-bold text-stone-300 flex items-center justify-between">
                    <span>Pledged Faction Vassals ({memberVassals.length})</span>
                    <span className="text-[11px] text-stone-400">Use Hooks or Gold to Force Exit</span>
                  </div>

                  {memberVassals.length === 0 ? (
                    <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800/80 text-xs text-stone-400 italic">
                      No active vassal lords currently support this faction.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {memberVassals.map(v => {
                        const hasHook = hooksAndSecrets.some(h => h.targetId === v.id || h.targetName === v.name);

                        return (
                          <div 
                            key={v.id}
                            className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 flex flex-col justify-between gap-2.5 shadow-sm"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{v.portrait}</span>
                                <div>
                                  <div className="text-xs font-bold text-stone-100">{v.name}</div>
                                  <div className="text-[10px] text-stone-400">{v.title} • {v.troops || 400} troops</div>
                                </div>
                              </div>

                              <div className="text-right text-[10px]">
                                <div className={`font-bold ${v.loyalty < 40 ? 'text-red-400' : 'text-stone-300'}`}>
                                  Loyalty: {v.loyalty}%
                                </div>
                              </div>
                            </div>

                            {/* Vassal Neutralization Buttons */}
                            <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-stone-800">
                              {/* 1. Use Hook */}
                              <button
                                onClick={() => handleUseHookOnVassal(v.id, faction.id)}
                                disabled={!hasHook}
                                className="py-1 px-1.5 bg-purple-950 hover:bg-purple-900 text-purple-200 rounded text-[10px] font-bold border border-purple-800 cursor-pointer disabled:opacity-30 flex items-center justify-center gap-1 shadow-xs"
                                title={hasHook ? "Spend a blackmail hook to force instant faction departure" : "No hook held"}
                              >
                                <Key className="w-3 h-3 text-amber-400" />
                                <span>Use Hook</span>
                              </button>

                              {/* 2. Bribe */}
                              <button
                                onClick={() => handleBribeVassal(v.id, faction.id)}
                                disabled={character.stats.gold < 45}
                                className="py-1 px-1.5 bg-amber-950 hover:bg-amber-900 text-amber-200 rounded text-[10px] font-bold border border-amber-800 cursor-pointer disabled:opacity-30 flex items-center justify-center gap-1 shadow-xs"
                                title="Bribe with 45 Gold"
                              >
                                <Coins className="w-3 h-3 text-amber-400" />
                                <span>Bribe (45🪙)</span>
                              </button>

                              {/* 3. Royal Favor */}
                              <button
                                onClick={() => handleBestowRoyalFavor(v.id, faction.id)}
                                className="py-1 px-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 rounded text-[10px] font-bold border border-emerald-800 cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                                title="Bestow Court Honors"
                              >
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                <span>Honor</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ultimatum Resolution Modal */}
      {activeUltimatumModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border-2 border-red-600 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-red-900/60 pb-3">
              <div className="w-12 h-12 rounded-xl bg-red-950 border border-red-500 flex items-center justify-center text-2xl">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-bold text-red-200 font-cinzel">FACTION ULTIMATUM DELIVERED!</h3>
                <p className="text-xs text-stone-300 font-semibold">{activeUltimatumModal.title}</p>
              </div>
            </div>

            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2 text-xs">
              <p className="text-stone-200 leading-relaxed">
                A delegation of rebellious vassals led by <strong className="text-amber-300">{activeUltimatumModal.leaderName}</strong> has presented their non-negotiable ultimatum before your throne:
              </p>
              <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-lg text-amber-200 font-serif italic">
                "{activeUltimatumModal.demands}"
              </div>
              <p className="text-stone-400 text-[11px]">
                Their combined forces equal <strong className="text-red-400">{getFactionPowerInfo(activeUltimatumModal).powerPercent}%</strong> of the royal army. If you refuse, open civil war will begin immediately!
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {/* Option 1: Accept Demands */}
              <button
                onClick={() => handleAcceptUltimatum(activeUltimatumModal)}
                className="w-full p-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs border border-stone-600 text-left flex items-center justify-between cursor-pointer transition-all"
              >
                <div>
                  <div className="text-amber-300 font-cinzel">Accept Concessions & Preserve Peace</div>
                  <div className="text-[10px] text-stone-400">Lower tax revenue and lose -30 Renown, but avoid civil war.</div>
                </div>
                <HeartHandshake className="w-5 h-5 text-amber-400 shrink-0" />
              </button>

              {/* Option 2: Reject & Civil War */}
              <button
                onClick={() => handleRejectUltimatum(activeUltimatumModal)}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white font-extrabold text-xs shadow-lg text-left flex items-center justify-between cursor-pointer transition-all border border-red-500"
              >
                <div>
                  <div className="font-cinzel text-white">REJECT ULTIMATUM & CRUSH THE REVOLT!</div>
                  <div className="text-[10px] text-red-200">Mobilize the Crown Guard and march into civil war battle!</div>
                </div>
                <Swords className="w-5 h-5 text-white shrink-0" />
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setActiveUltimatumModal(null)}
                className="text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
