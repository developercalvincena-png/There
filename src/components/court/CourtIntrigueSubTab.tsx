import React, { useState } from 'react';
import { Character, HookSecret, RealmNPC, SpymasterTask, Vassal } from '../../types';
import { 
  Eye, 
  Key, 
  ShieldAlert, 
  Coins, 
  Sparkles, 
  UserX, 
  CheckCircle2, 
  Flame, 
  AlertTriangle,
  Users,
  Search,
  BookOpen
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { SECRETS_DISCOVERY_POOL } from '../../data/intrigueAndFactionsData';

interface CourtIntrigueSubTabProps {
  character: Character;
  vassals: Vassal[];
  realmNPCs: RealmNPC[];
  spymasterTask: SpymasterTask;
  hooksAndSecrets: HookSecret[];
  onUpdateSpymasterTask: (task: SpymasterTask) => void;
  onUpdateHooksAndSecrets: (hooks: HookSecret[]) => void;
  onUpdateCharacter: (updates: Partial<Character>) => void;
  onUpdateVassals: (vassals: Vassal[]) => void;
  onAddChronicle: (entry: { title: string; description: string; type: 'intrigue' | 'diplomacy' | 'war' | 'court' }) => void;
}

export const CourtIntrigueSubTab: React.FC<CourtIntrigueSubTabProps> = ({
  character,
  vassals,
  realmNPCs,
  spymasterTask,
  hooksAndSecrets,
  onUpdateSpymasterTask,
  onUpdateHooksAndSecrets,
  onUpdateCharacter,
  onUpdateVassals,
  onAddChronicle
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string>(vassals[0]?.id || '');
  const [selectedMission, setSelectedMission] = useState<SpymasterTask['mission']>('discover_plot');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Find assigned Spymaster from vassals or court NPCs
  const vassalSpymaster = vassals.find(v => v.councilRole === 'Spymaster');
  const spymasterNPC = realmNPCs.find(n => n.role === 'Court Spymaster' && n.realmId === character.realmId);

  const spymasterName = vassalSpymaster?.name || spymasterNPC?.name || 'Master of Whispers';
  const spymasterPortrait = vassalSpymaster?.portrait || spymasterNPC?.portrait || '🗡️';
  const spymasterIntrigue = vassalSpymaster?.stats?.intrigue || spymasterNPC?.stats?.intrigue || 75;

  const showFeedback = (message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Calculate mission success chance based on player intrigue & spymaster intrigue
  const calculateSuccessChance = (mission: SpymasterTask['mission']) => {
    const baseChance = mission === 'discover_plot' ? 80 : mission === 'fabricate_hook' ? 70 : 85;
    const bonus = Math.round((spymasterIntrigue + character.stats.intrigue) / 8);
    return Math.min(95, Math.max(35, baseChance + bonus));
  };

  // Start a new Spymaster Mission
  const handleAssignMission = (mission: SpymasterTask['mission'], targetId?: string) => {
    const targetVassal = vassals.find(v => v.id === targetId);
    const targetName = targetVassal ? targetVassal.name : 'The Imperial Court';
    const chance = calculateSuccessChance(mission);

    sound.playMagic();
    onUpdateSpymasterTask({
      mission,
      targetId: targetId || undefined,
      targetName,
      progress: 10,
      turnsRemaining: mission === 'fabricate_hook' ? 3 : 2,
      successChance: chance,
      description: mission === 'discover_plot'
        ? `Investigating covert intrigues, conspiracies, and whispers in ${targetName}.`
        : mission === 'fabricate_hook'
        ? `Forging compromising evidence and fabricating leverage against ${targetName}.`
        : mission === 'counter_espionage'
        ? 'Protecting your royal person and court from enemy assassinations and infiltrations.'
        : 'Infiltrating regional chambers to snoop for unrecorded secrets and wealth.'
    });

    onAddChronicle({
      title: `🗡️ Spymaster Mission Assigned: ${mission.replace('_', ' ').toUpperCase()}`,
      description: `Dispatched ${spymasterName} to conduct clandestine operations targeting ${targetName}.`,
      type: 'intrigue'
    });

    showFeedback(`Assigned ${spymasterName} to mission: ${mission.replace('_', ' ')}.`, 'success');
  };

  // Instantly conduct or speed up clandestine operation
  const handleAccelerateMission = () => {
    if (character.stats.gold < 30) {
      showFeedback('Not enough gold to bribe informants (Requires 30 🪙).', 'warning');
      return;
    }

    sound.playCoin();
    const newGold = character.stats.gold - 30;
    onUpdateCharacter({ stats: { ...character.stats, gold: newGold } });

    const newProgress = Math.min(100, spymasterTask.progress + 45);

    if (newProgress >= 100) {
      // Mission successfully resolved!
      sound.playFanfare();
      const targetName = spymasterTask.targetName || 'Courtier';
      const targetVassal = vassals.find(v => v.id === spymasterTask.targetId) || vassals[0];

      // Generate a secret/hook
      const randomSecretTemplate = SECRETS_DISCOVERY_POOL[Math.floor(Math.random() * SECRETS_DISCOVERY_POOL.length)];
      const newHook: HookSecret = {
        id: `hook_${Date.now()}`,
        targetId: targetVassal?.id || 'target_unknown',
        targetName: targetVassal?.name || targetName,
        targetRole: targetVassal?.title || 'Provincial Noble',
        targetPortrait: targetVassal?.portrait || '👤',
        type: randomSecretTemplate.type,
        secretName: randomSecretTemplate.secretName,
        description: randomSecretTemplate.description(targetVassal?.name || targetName),
        obtainedYear: 1042 + Math.floor(Math.random() * 5),
        isUsed: false,
        leveragePower: randomSecretTemplate.leveragePower
      };

      onUpdateHooksAndSecrets([newHook, ...hooksAndSecrets]);
      onUpdateSpymasterTask({
        mission: 'idle',
        progress: 0,
        turnsRemaining: 0,
        successChance: 75,
        description: 'No active clandestine assignment.'
      });

      onAddChronicle({
        title: `🔑 Clandestine Breakthrough: ${newHook.secretName}`,
        description: `${spymasterName} uncovered crucial leverage: ${newHook.description}`,
        type: 'intrigue'
      });

      showFeedback(`Breakthrough! Discovered ${newHook.type}: "${newHook.secretName}"!`, 'success');
    } else {
      onUpdateSpymasterTask({
        ...spymasterTask,
        progress: newProgress,
        turnsRemaining: Math.max(1, spymasterTask.turnsRemaining - 1)
      });
      showFeedback(`Injected 30 gold into spy network. Progress is now ${newProgress}%.`, 'info');
    }
  };

  // Use a hook/secret
  const handleUseHook = (hook: HookSecret, action: 'faction_exit' | 'blackmail' | 'fealty' | 'expose') => {
    sound.playMagic();

    if (action === 'faction_exit') {
      // Coerce vassal out of any faction
      const updatedVassals = vassals.map(v => {
        if (v.id === hook.targetId || v.name === hook.targetName) {
          return {
            ...v,
            faction: 'Loyalist' as const,
            loyalty: Math.min(100, v.loyalty + 20)
          };
        }
        return v;
      });
      onUpdateVassals(updatedVassals);
      onAddChronicle({
        title: `📜 Vassal Coerced via Secret Leverage`,
        description: `Used "${hook.secretName}" to force ${hook.targetName} to abandon hostile factions and pledge loyalist neutrality.`,
        type: 'intrigue'
      });
      showFeedback(`Leveraged ${hook.secretName}! ${hook.targetName} was forced to leave all hostile factions!`, 'success');
    } else if (action === 'blackmail') {
      const goldGained = hook.type === 'Strong Hook' ? 90 : 50;
      onUpdateCharacter({
        stats: {
          ...character.stats,
          gold: character.stats.gold + goldGained
        }
      });
      onAddChronicle({
        title: `🪙 Imperial Blackmail Extorted`,
        description: `Extorted ${goldGained} Gold in hush money from ${hook.targetName} under threat of exposing "${hook.secretName}".`,
        type: 'intrigue'
      });
      showFeedback(`Extorted ${goldGained} Gold from ${hook.targetName}.`, 'success');
    } else if (action === 'fealty') {
      const updatedVassals = vassals.map(v => {
        if (v.id === hook.targetId || v.name === hook.targetName) {
          return {
            ...v,
            loyalty: Math.min(100, v.loyalty + 35),
            opinion: Math.min(100, v.opinion + 20)
          };
        }
        return v;
      });
      onUpdateVassals(updatedVassals);
      showFeedback(`Secured unconditional fealty from ${hook.targetName} (+35 Loyalty).`, 'success');
    } else if (action === 'expose') {
      onUpdateCharacter({
        stats: {
          ...character.stats,
          renown: character.stats.renown + 25
        }
      });
      onAddChronicle({
        title: `📢 Treason Exposed in High Court`,
        description: `Publicly exposed "${hook.secretName}" committed by ${hook.targetName}, destroying their political standing.`,
        type: 'court'
      });
      showFeedback(`Publicly exposed ${hook.targetName}'s secret in court (+25 Renown).`, 'info');
    }

    // Mark hook as used if weak, or keep if strong
    if (hook.type !== 'Strong Hook') {
      onUpdateHooksAndSecrets(hooksAndSecrets.filter(h => h.id !== hook.id));
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {feedback && (
        <div className={`p-3 rounded-xl text-xs font-bold border shadow-lg flex items-center justify-between transition-all ${
          feedback.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200' :
          feedback.type === 'warning' ? 'bg-amber-950/90 border-amber-500/80 text-amber-200' :
          'bg-stone-900 border-stone-700 text-stone-200'
        }`}>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Spymaster Office Banner */}
      <div className="bg-gradient-to-r from-stone-950 via-purple-950/40 to-stone-950 p-4 sm:p-5 rounded-2xl border border-purple-900/50 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-900/40 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-950/90 border border-purple-600/60 flex items-center justify-center text-2xl shadow-inner">
              {spymasterPortrait}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-purple-200 font-cinzel">{spymasterName}</h3>
                <span className="text-[10px] bg-purple-900/80 text-purple-300 px-2 py-0.5 rounded font-bold border border-purple-700">
                  Master of Whispers
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Spymaster Intrigue Skill: <strong className="text-purple-300">{spymasterIntrigue}</strong> • Crown Intrigue: <strong className="text-amber-300">{character.stats.intrigue}</strong>
              </p>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-stone-400">Active Hooks Held:</span>{' '}
            <strong className="text-amber-400 font-mono text-sm">{hooksAndSecrets.length}</strong>
          </div>
        </div>

        {/* Current Active Mission Progress */}
        <div className="bg-stone-950/90 p-3.5 rounded-xl border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-stone-200">
              <Eye className="w-4 h-4 text-purple-400" />
              <span>Current Mission: <strong className="text-purple-300 uppercase tracking-wider">{spymasterTask.mission.replace('_', ' ')}</strong></span>
            </div>
            <span className="text-[11px] text-stone-400">
              Success Odds: <strong className="text-emerald-400">{spymasterTask.successChance}%</strong>
            </span>
          </div>

          <p className="text-xs text-stone-300 italic">
            "{spymasterTask.description || 'Spymaster is watching for whispers across the courts.'}"
          </p>

          {/* Progress Bar */}
          {spymasterTask.mission !== 'idle' && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-stone-400">
                <span>Operation Infiltration Progress</span>
                <span className="font-bold text-purple-300">{spymasterTask.progress}%</span>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-400 transition-all duration-500"
                  style={{ width: `${spymasterTask.progress}%` }}
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleAccelerateMission}
                  className="px-3 py-1 bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded-lg text-xs font-bold border border-purple-700 cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bribe Informants to Rush Mission (30 🪙)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Assign New Mission Controls */}
        <div className="space-y-2.5 pt-1">
          <div className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-amber-400" />
            <span>Assign Clandestine Mission</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* 1. Discover Plot */}
            <div 
              onClick={() => handleAssignMission('discover_plot', selectedTargetId)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                spymasterTask.mission === 'discover_plot' 
                  ? 'bg-purple-950/80 border-purple-500 shadow-md' 
                  : 'bg-stone-950/70 border-stone-800 hover:border-purple-600/60'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-xs text-stone-100 font-cinzel">Discover Plot</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-snug">
                Detect covert conspiracies, assassination plots, and coup plans within your court.
              </p>
              <div className="text-[10px] text-emerald-400 font-semibold mt-2">
                Chance: {calculateSuccessChance('discover_plot')}%
              </div>
            </div>

            {/* 2. Fabricate Hook */}
            <div 
              onClick={() => handleAssignMission('fabricate_hook', selectedTargetId)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                spymasterTask.mission === 'fabricate_hook' 
                  ? 'bg-purple-950/80 border-purple-500 shadow-md' 
                  : 'bg-stone-950/70 border-stone-800 hover:border-purple-600/60'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Key className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs text-stone-100 font-cinzel">Fabricate Hook</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-snug">
                Forge compromising letters or manufacture leverage to control rival vassals.
              </p>
              <div className="text-[10px] text-amber-400 font-semibold mt-2">
                Chance: {calculateSuccessChance('fabricate_hook')}%
              </div>
            </div>

            {/* 3. Snoop for Secrets */}
            <div 
              onClick={() => handleAssignMission('snoop_secrets', selectedTargetId)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                spymasterTask.mission === 'snoop_secrets' 
                  ? 'bg-purple-950/80 border-purple-500 shadow-md' 
                  : 'bg-stone-950/70 border-stone-800 hover:border-purple-600/60'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-xs text-stone-100 font-cinzel">Snoop Secrets</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-snug">
                Uncover dark occult pacts, embezzled wealth, and illegitimate bloodlines.
              </p>
              <div className="text-[10px] text-indigo-400 font-semibold mt-2">
                Chance: {calculateSuccessChance('snoop_secrets')}%
              </div>
            </div>

            {/* 4. Counter-Espionage */}
            <div 
              onClick={() => handleAssignMission('counter_espionage')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                spymasterTask.mission === 'counter_espionage' 
                  ? 'bg-purple-950/80 border-purple-500 shadow-md' 
                  : 'bg-stone-950/70 border-stone-800 hover:border-purple-600/60'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs text-stone-100 font-cinzel">Counter-Spies</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-snug">
                Protect yourself from enemy poisoners, infiltrators, and spy networks.
              </p>
              <div className="text-[10px] text-emerald-400 font-semibold mt-2">
                Protection: +35 Defense
              </div>
            </div>
          </div>

          {/* Select Target Vassal */}
          {vassals.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-stone-400 whitespace-nowrap">Focus Investigation Target:</span>
              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className="bg-stone-950 text-stone-200 text-xs px-2.5 py-1.5 rounded-lg border border-stone-700 focus:border-purple-500 outline-none w-full sm:w-auto"
              >
                {vassals.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.portrait} {v.name} ({v.title} - Faction: {v.faction})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Hooks & Leverage Vault */}
      <div className="bg-stone-900/90 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-amber-200 font-cinzel flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              Imperial Secrets & Leverage Vault ({hooksAndSecrets.length})
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Leverage compromising secrets to dissolve rebellious factions, extort gold, or enforce vassal loyalty.
            </p>
          </div>
        </div>

        {hooksAndSecrets.length === 0 ? (
          <div className="p-6 rounded-xl bg-stone-950/60 border border-stone-800/80 text-center space-y-2">
            <Key className="w-8 h-8 text-stone-600 mx-auto" />
            <div className="text-xs font-bold text-stone-400">No Secrets Currently Held</div>
            <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
              Assign your Spymaster on "Discover Plot" or "Fabricate Hook" missions to obtain blackmail leverage over rival vassals.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hooksAndSecrets.map(hook => (
              <div 
                key={hook.id}
                className="p-3.5 rounded-xl bg-stone-950/90 border border-amber-900/40 hover:border-amber-500/60 flex flex-col justify-between gap-3 shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{hook.targetPortrait || '👤'}</span>
                      <div>
                        <div className="text-xs font-bold text-stone-100">{hook.targetName}</div>
                        <div className="text-[10px] text-stone-400">{hook.targetRole}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                      hook.type === 'Strong Hook' 
                        ? 'bg-red-950 text-red-300 border-red-700' 
                        : 'bg-amber-950 text-amber-300 border-amber-700'
                    }`}>
                      {hook.type}
                    </span>
                  </div>

                  <div className="bg-stone-900/90 p-2.5 rounded-lg border border-stone-800 space-y-1">
                    <div className="text-xs font-bold text-amber-300">{hook.secretName}</div>
                    <p className="text-[11px] text-stone-300 leading-snug">{hook.description}</p>
                  </div>
                </div>

                {/* Hook Actions */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-stone-800">
                  <button
                    onClick={() => handleUseHook(hook, 'faction_exit')}
                    className="p-1.5 bg-purple-950 hover:bg-purple-900 text-purple-200 rounded text-[11px] font-bold border border-purple-800 cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    title="Force this vassal to immediately leave any active Liberty/Claimant factions"
                  >
                    <UserX className="w-3 h-3 text-purple-400" />
                    <span>Dismantle Faction</span>
                  </button>

                  <button
                    onClick={() => handleUseHook(hook, 'blackmail')}
                    className="p-1.5 bg-amber-950 hover:bg-amber-900 text-amber-200 rounded text-[11px] font-bold border border-amber-800 cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    title="Extort gold in exchange for keeping their secret quiet"
                  >
                    <Coins className="w-3 h-3 text-amber-400" />
                    <span>Extort Gold</span>
                  </button>

                  <button
                    onClick={() => handleUseHook(hook, 'fealty')}
                    className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 rounded text-[11px] font-bold border border-emerald-800 cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    title="Force absolute loyalty oath"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Enforce Fealty</span>
                  </button>

                  <button
                    onClick={() => handleUseHook(hook, 'expose')}
                    className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[11px] font-semibold border border-stone-700 cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    title="Publicly expose their crime in court"
                  >
                    <Flame className="w-3 h-3 text-red-400" />
                    <span>Expose Publicly</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
