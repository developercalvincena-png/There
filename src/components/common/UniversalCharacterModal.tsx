import React, { useState } from 'react';
import { Character, CharacterFamilyTree, CharacterRelative, FamilyMember, HookSecret, LeaderProfile, RealmNPC, Vassal, VassalFaction } from '../../types';
import { getOrGenerateFamilyTree } from '../../utils/characterFamilyHelper';
import { sound } from '../../utils/audio';
import { 
  X, 
  Crown, 
  Heart, 
  Users, 
  Shield, 
  Swords, 
  Coins, 
  Eye, 
  Sparkles, 
  Skull, 
  Baby, 
  Award, 
  Lock, 
  Unlock, 
  Flame, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight,
  MessageSquare,
  Gift,
  HelpCircle,
  ShieldAlert,
  UserPlus
} from 'lucide-react';

export interface UniversalCharacterData {
  id: string;
  name: string;
  species: any;
  gender: 'Male' | 'Female';
  age: number;
  portrait: string;
  title: string;
  houseName: string;
  role?: string;
  realmId?: string;
  realmName?: string;
  provinceId?: string;
  provinceName?: string;
  opinion: number;
  loyalty?: number;
  troops?: number;
  traits: string[];
  stats?: {
    martial: number;
    diplomacy: number;
    intrigue: number;
    intellect: number;
    prowess?: number;
    stewardship?: number;
  };
  family?: CharacterFamilyTree;
  factionsJoined?: string[];
  hostageHeld?: boolean;
  isVassal?: boolean;
  isForeignRuler?: boolean;
  isPlayerFamily?: boolean;
}

interface UniversalCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: UniversalCharacterData | null;
  playerCharacter: Character;
  playerFamily: FamilyMember[];
  hooksAndSecrets?: HookSecret[];
  vassalFactions?: VassalFaction[];
  onUpdateCharacter: (updater: (prev: Character) => Character) => void;
  onAddChronicle: (title: string, desc: string, isImportant?: boolean) => void;
  onSwaySuccess?: (charId: string, newOpinion: number) => void;
  onGiftGoldSuccess?: (charId: string, newOpinion: number, newLoyalty?: number) => void;
  onMarriageArranged?: (playerMemberId: string, targetRelative: CharacterRelative) => void;
  onDemandHostage?: (charId: string, child: CharacterRelative) => void;
  onPlotAssassination?: (targetId: string, targetName: string, method: string) => void;
  onDuelResolved?: (won: boolean, targetName: string) => void;
  onFabricateHookSuccess?: (newHook: HookSecret) => void;
}

export const UniversalCharacterModal: React.FC<UniversalCharacterModalProps> = ({
  isOpen,
  onClose,
  target,
  playerCharacter,
  playerFamily,
  hooksAndSecrets = [],
  vassalFactions = [],
  onUpdateCharacter,
  onAddChronicle,
  onSwaySuccess,
  onGiftGoldSuccess,
  onMarriageArranged,
  onDemandHostage,
  onPlotAssassination,
  onDuelResolved,
  onFabricateHookSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'family' | 'actions' | 'secrets'>('profile');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'danger' | 'info' } | null>(null);
  const [selectedPlayerChild, setSelectedPlayerChild] = useState<string>('');
  const [selectedTargetRelative, setSelectedTargetRelative] = useState<CharacterRelative | null>(null);

  if (!isOpen || !target) return null;

  const familyTree = getOrGenerateFamilyTree(
    target.id,
    target.name,
    target.species,
    target.gender,
    target.age,
    target.title,
    target.houseName,
    target.family
  );

  const showFeedback = (message: string, type: 'success' | 'danger' | 'info' = 'info') => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  // 1. Action: Sway & Courtly Flattery
  const handleSway = () => {
    sound.playClick();
    const diplomacyScore = playerCharacter.stats.diplomacy;
    const targetIntrigue = target.stats?.intrigue || 50;
    const successRate = Math.min(95, Math.max(30, 45 + (diplomacyScore - targetIntrigue) * 0.8));
    const roll = Math.random() * 100;

    if (roll <= successRate) {
      sound.playSuccess();
      const newOpinion = Math.min(100, target.opinion + 20);
      showFeedback(`✨ Sway Successful! Your eloquence moved ${target.name}. Opinion increased by +20!`, 'success');
      onAddChronicle(
        `Diplomatic Sway: ${target.name}`,
        `Your silver tongue and courtly flattery warmed relations with ${target.title} ${target.name} of ${target.houseName}.`,
        false
      );
      if (onSwaySuccess) onSwaySuccess(target.id, newOpinion);
    } else {
      sound.playFail();
      showFeedback(`${target.name} found your overtures transparent and unconvincing.`, 'danger');
    }
  };

  // 2. Action: Royal Gift & Bribe
  const handleGift = (amount: number = 40) => {
    if (playerCharacter.stats.gold < amount) {
      sound.playFail();
      showFeedback(`Not enough gold! Requires ${amount} 🪙 in treasury.`, 'danger');
      return;
    }
    sound.playCoin();
    onUpdateCharacter(prev => ({
      ...prev,
      stats: { ...prev.stats, gold: prev.stats.gold - amount }
    }));
    const newOpinion = Math.min(100, target.opinion + 25);
    const newLoyalty = target.loyalty ? Math.min(100, target.loyalty + 20) : undefined;
    showFeedback(`Sent a gilded chest of ${amount} gold to ${target.name}. Opinion raised to ${newOpinion}!`, 'success');
    onAddChronicle(
      `Royal Gilded Gift to ${target.name}`,
      `Presented ${amount} gold sovereign coins to ${target.title} ${target.name}, cementing their loyalty to your house.`,
      false
    );
    if (onGiftGoldSuccess) onGiftGoldSuccess(target.id, newOpinion, newLoyalty);
  };

  // 3. Action: Demand Child Hostage / Ward
  const handleDemandHostage = (child: CharacterRelative) => {
    sound.playClick();
    if (target.opinion < 25 && !target.isVassal) {
      sound.playFail();
      showFeedback(`${target.name} refuses to surrender ${child.name} as a hostage without a strong hook or high fealty!`, 'danger');
      return;
    }
    sound.playSuccess();
    showFeedback(`🛡️ Hostage Secured: ${child.name} is now a ward at your royal court! ${target.name} will not dare rebel or attack.`, 'success');
    onAddChronicle(
      `Child Hostage & Ward Secured: ${child.name}`,
      `To ensure non-aggression and feudal loyalty, ${target.title} ${target.name} surrendered their child ${child.name} as an honored hostage at your court.`,
      true
    );
    if (onDemandHostage) onDemandHostage(target.id, child);
  };

  // 4. Action: Arrange Marriage / Betrothal
  const handleArrangeMarriage = () => {
    if (!selectedPlayerChild || !selectedTargetRelative) {
      showFeedback('Please select both a player family member and a candidate relative.', 'danger');
      return;
    }
    const playerMember = playerFamily.find(m => m.id === selectedPlayerChild);
    if (!playerMember) return;

    sound.playSuccess();
    showFeedback(`💍 Marriage Alliance Forged! ${playerMember.name} is now betrothed to ${selectedTargetRelative.name}!`, 'success');
    onAddChronicle(
      `Royal Betrothal: House ${playerCharacter.dynastyName} & House ${target.houseName}`,
      `A grand dynastic union was sealed between ${playerMember.name} and ${selectedTargetRelative.name} of ${target.houseName}. Both houses are bound in blood!`,
      true
    );
    if (onMarriageArranged) {
      onMarriageArranged(playerMember.id, selectedTargetRelative);
    }
    setSelectedTargetRelative(null);
  };

  // 5. Action: Fabricate Secret Hook / Blackmail
  const handleFabricateHook = () => {
    if (playerCharacter.stats.gold < 30) {
      sound.playFail();
      showFeedback('Requires 30 gold to finance spymaster bribes and informants.', 'danger');
      return;
    }
    sound.playClick();
    onUpdateCharacter(prev => ({
      ...prev,
      stats: { ...prev.stats, gold: prev.stats.gold - 30 }
    }));

    const intrigueScore = playerCharacter.stats.intrigue;
    const targetIntrigue = target.stats?.intrigue || 50;
    const successRate = Math.min(90, Math.max(35, 50 + (intrigueScore - targetIntrigue) * 0.9));

    if (Math.random() * 100 <= successRate) {
      sound.playSuccess();
      const secretTypes = [
        'Embezzling Provincial Mint Coinage',
        'Illegitimate Bastard Lineage Secret',
        'Secret Heretical Occult Coven Ties',
        'Clandestine Letters to Foreign Rivals'
      ];
      const randomSecret = secretTypes[Math.floor(Math.random() * secretTypes.length)];
      const newHook: HookSecret = {
        id: `hook_${target.id}_${Date.now()}`,
        targetId: target.id,
        targetName: target.name,
        targetRole: target.title,
        targetPortrait: target.portrait,
        type: 'Strong Hook',
        secretName: randomSecret,
        description: `Uncovered undeniable proof that ${target.name} is guilty of ${randomSecret}.`,
        obtainedYear: 1066,
        isUsed: false,
        leveragePower: 100
      };
      showFeedback(`🤫 Strong Hook Uncovered! You now possess blackmail leverage: "${randomSecret}" over ${target.name}!`, 'success');
      onAddChronicle(
        `Blackmail Hook Fabricated: ${target.name}`,
        `Your spymasters unearthed dark secrets on ${target.title} ${target.name} (${randomSecret}), granting supreme leverage.`,
        false
      );
      if (onFabricateHookSuccess) onFabricateHookSuccess(newHook);
    } else {
      sound.playFail();
      showFeedback(`The covert operation failed! ${target.name}'s guards intercepted your informants.`, 'danger');
    }
  };

  // 6. Action: Challenge to Duel / Trial by Combat
  const handleDuel = () => {
    sound.playSword();
    const playerMartial = playerCharacter.stats.martial;
    const targetMartial = target.stats?.martial || 55;
    const winRate = Math.min(95, Math.max(20, 50 + (playerMartial - targetMartial) * 1.1));

    if (Math.random() * 100 <= winRate) {
      sound.playSuccess();
      showFeedback(`⚔️ Duel Won! You bested ${target.name} in single combat with dazzling chivalry! (+35 Renown)`, 'success');
      onUpdateCharacter(prev => ({
        ...prev,
        stats: { ...prev.stats, renown: prev.stats.renown + 35 }
      }));
      onAddChronicle(
        `Trial by Combat Victory: ${target.name}`,
        `You clashed steel against ${target.title} ${target.name} before cheering lords and disarmed them with legendary martial prowess!`,
        true
      );
      if (onDuelResolved) onDuelResolved(true, target.name);
    } else {
      sound.playFail();
      showFeedback(`You suffered wounds in the duel against ${target.name}! (-15 Health, +10 Renown)`, 'danger');
      onUpdateCharacter(prev => ({
        ...prev,
        stats: { 
          ...prev.stats, 
          health: Math.max(10, prev.stats.health - 15),
          renown: prev.stats.renown + 10
        }
      }));
      if (onDuelResolved) onDuelResolved(false, target.name);
    }
  };

  // 7. Action: Plot Assassination
  const handlePlotAssassination = (method: string) => {
    if (playerCharacter.stats.gold < 50) {
      sound.playFail();
      showFeedback('Requires 50 gold to hire shadow assassins and conspirators.', 'danger');
      return;
    }
    sound.playClick();
    onUpdateCharacter(prev => ({
      ...prev,
      stats: { ...prev.stats, gold: prev.stats.gold - 50 }
    }));
    showFeedback(`🗡️ Shadow Plot Initiated: A clandestine conspiracy using "${method}" has been set in motion against ${target.name}!`, 'info');
    onAddChronicle(
      `Dark Conspiracy Sown: ${target.name}`,
      `Under cover of darkness, your agents paid shadow conspirators to execute a plot (${method}) against ${target.name}.`,
      true
    );
    if (onPlotAssassination) onPlotAssassination(target.id, target.name, method);
  };

  const existingHook = hooksAndSecrets.find(h => h.targetId === target.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-2 border-amber-500/70 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-4 max-h-[92vh] flex flex-col">
        
        {/* Header Profile Summary */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-stone-900 border-2 border-amber-500/60 flex items-center justify-center text-3xl sm:text-4xl shrink-0 shadow-lg">
              {target.portrait || '👤'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-amber-100 font-cinzel">
                  {target.name}
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700/60">
                  {target.species}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono">
                  Age {target.age}
                </span>
              </div>
              <p className="text-xs text-stone-400 font-medium">
                {target.title} • House {target.houseName}
              </p>
              {target.provinceName && (
                <p className="text-[11px] text-amber-500/80">
                  📍 {target.provinceName}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b border-stone-800 pb-1">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('profile');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-amber-950 text-amber-300 border border-amber-600/70 shadow'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Profile & Stats</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('family');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'family'
                ? 'bg-amber-950 text-amber-300 border border-amber-600/70 shadow'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Family & Lineage ({familyTree.children.length + (familyTree.spouse ? 1 : 0)})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('actions');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'actions'
                ? 'bg-amber-950 text-amber-300 border border-amber-600/70 shadow'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Court Actions</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('secrets');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'secrets'
                ? 'bg-amber-950 text-amber-300 border border-amber-600/70 shadow'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Hooks & Intrigue</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 animate-in fade-in duration-150 ${
            feedback.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' :
            feedback.type === 'danger' ? 'bg-red-950/80 text-red-300 border-red-700/60' :
            'bg-amber-950/80 text-amber-300 border-amber-700/60'
          }`}>
            {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[55vh]">
          
          {/* TAB 1: Profile & Stats */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Opinions and Loyalty meters */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-950/70 p-3 rounded-2xl border border-stone-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-400" /> Opinion of You
                    </span>
                    <span className={`font-bold font-mono ${target.opinion >= 50 ? 'text-emerald-400' : target.opinion >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {target.opinion > 0 ? `+${target.opinion}` : target.opinion}
                    </span>
                  </div>
                  <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${target.opinion >= 50 ? 'bg-emerald-500' : target.opinion >= 0 ? 'bg-amber-500' : 'bg-rose-600'}`}
                      style={{ width: `${Math.max(5, Math.min(100, (target.opinion + 100) / 2))}%` }}
                    />
                  </div>
                </div>

                <div className="bg-stone-950/70 p-3 rounded-2xl border border-stone-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-indigo-400" /> Feudal Loyalty
                    </span>
                    <span className="font-bold font-mono text-indigo-300">
                      {target.loyalty !== undefined ? `${target.loyalty}%` : 'Independent'}
                    </span>
                  </div>
                  <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500"
                      style={{ width: `${target.loyalty || 65}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Attributes / Stats */}
              {target.stats && (
                <div className="bg-stone-950/80 p-4 rounded-2xl border border-stone-800 space-y-2">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Core Attributes
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                    <div className="bg-stone-900/90 p-2 rounded-xl border border-stone-800">
                      <div className="text-[10px] text-stone-400">⚔️ Martial</div>
                      <div className="text-sm font-bold text-red-300 font-mono">{target.stats.martial}</div>
                    </div>
                    <div className="bg-stone-900/90 p-2 rounded-xl border border-stone-800">
                      <div className="text-[10px] text-stone-400">🕊️ Diplomacy</div>
                      <div className="text-sm font-bold text-sky-300 font-mono">{target.stats.diplomacy}</div>
                    </div>
                    <div className="bg-stone-900/90 p-2 rounded-xl border border-stone-800">
                      <div className="text-[10px] text-stone-400">🎭 Intrigue</div>
                      <div className="text-sm font-bold text-purple-300 font-mono">{target.stats.intrigue}</div>
                    </div>
                    <div className="bg-stone-900/90 p-2 rounded-xl border border-stone-800">
                      <div className="text-[10px] text-stone-400">📜 Intellect</div>
                      <div className="text-sm font-bold text-amber-300 font-mono">{target.stats.intellect}</div>
                    </div>
                    <div className="bg-stone-900/90 p-2 rounded-xl border border-stone-800">
                      <div className="text-[10px] text-stone-400">🛡️ Prowess</div>
                      <div className="text-sm font-bold text-emerald-300 font-mono">{target.stats.prowess || 60}</div>
                    </div>
                    <div className="bg-stone-900/90 p-2 rounded-xl border border-stone-800">
                      <div className="text-[10px] text-stone-400">🪙 Steward</div>
                      <div className="text-sm font-bold text-amber-400 font-mono">{target.stats.stewardship || 65}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Character Traits */}
              <div className="bg-stone-950/70 p-4 rounded-2xl border border-stone-800 space-y-2">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Distinguishing Traits
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {target.traits.map((t, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded-xl bg-stone-900 text-stone-200 border border-stone-700/80">
                      ✦ {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Family & Dynastic Lineage */}
          {activeTab === 'family' && (
            <div className="space-y-4">
              
              {/* Spouse Section */}
              <div className="bg-stone-950/80 p-4 rounded-2xl border border-stone-800 space-y-2">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>Consort / Spouse</span>
                </h4>
                {familyTree.spouse ? (
                  <div className="flex items-center justify-between bg-stone-900/90 p-3 rounded-xl border border-stone-800">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{familyTree.spouse.portrait}</span>
                      <div>
                        <div className="font-bold text-xs text-stone-200">{familyTree.spouse.name}</div>
                        <div className="text-[11px] text-stone-400">
                          {familyTree.spouse.title} • Age {familyTree.spouse.age} ({familyTree.spouse.species})
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                      Married
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-stone-500 italic py-2">
                    Unmarried / Widowed. Open to royal marital proposals.
                  </div>
                )}
              </div>

              {/* Children & Heirs */}
              <div className="bg-stone-950/80 p-4 rounded-2xl border border-stone-800 space-y-2">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Baby className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Children & Dynasty Heirs ({familyTree.children.length})</span>
                </h4>
                {familyTree.children.length === 0 ? (
                  <div className="text-xs text-stone-500 italic py-2">
                    No surviving offspring or heirs recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {familyTree.children.map((child) => (
                      <div key={child.id} className="flex items-center justify-between bg-stone-900/90 p-3 rounded-xl border border-stone-800">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{child.portrait}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-stone-200">{child.name}</span>
                              {child.isHeir && (
                                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-700/60 px-1.5 py-0.2 rounded font-bold">
                                  👑 Heir
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-400">
                              Age {child.age} • {child.traits.join(', ')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Betrothal Selection */}
                          <button
                            onClick={() => {
                              sound.playClick();
                              setSelectedTargetRelative(child);
                              setActiveTab('actions');
                            }}
                            className="px-2 py-1 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-700/60 text-[10px] font-semibold"
                          >
                            💍 Propose Match
                          </button>

                          {/* Demand Hostage */}
                          <button
                            onClick={() => handleDemandHostage(child)}
                            title="Take as court hostage to prevent rebellion"
                            className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-[10px]"
                          >
                            🛡️ Hostage
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Parents & Ancestry */}
              {familyTree.parents && familyTree.parents.length > 0 && (
                <div className="bg-stone-950/80 p-4 rounded-2xl border border-stone-800 space-y-2">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                    Parents & Ancestral Line
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {familyTree.parents.map((parent) => (
                      <div key={parent.id} className="bg-stone-900/60 p-2.5 rounded-xl border border-stone-800 flex items-center gap-2.5 text-xs">
                        <span className="text-xl">{parent.portrait}</span>
                        <div>
                          <div className="font-bold text-stone-300">{parent.name}</div>
                          <div className="text-[10px] text-stone-500">
                            {parent.title} • {parent.alive ? 'Alive' : `Deceased (${parent.causeOfDeath})`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Interactive Court Actions */}
          {activeTab === 'actions' && (
            <div className="space-y-3">
              
              {/* Marriage Proposal Builder */}
              <div className="bg-stone-950/80 p-4 rounded-2xl border border-amber-600/40 space-y-3">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>Arrange Royal Marriage / Betrothal</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">Your House Member:</label>
                    <select
                      value={selectedPlayerChild}
                      onChange={(e) => setSelectedPlayerChild(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-200"
                    >
                      <option value="">-- Select Child / Sibling --</option>
                      {playerFamily.filter(f => f.alive).map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.relation}, Age {f.age})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">Target Relative:</label>
                    <select
                      value={selectedTargetRelative?.id || ''}
                      onChange={(e) => {
                        const found = familyTree.children.find(c => c.id === e.target.value);
                        setSelectedTargetRelative(found || null);
                      }}
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-200"
                    >
                      <option value="">-- Select Target Child --</option>
                      {familyTree.children.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.relation}, Age {c.age})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleArrangeMarriage}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-bold text-xs transition-all shadow"
                >
                  💍 Seal Dynastic Betrothal
                </button>
              </div>

              {/* Court Diplomatic & Martial Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Sway & Flatter */}
                <button
                  onClick={handleSway}
                  className="p-3 rounded-2xl bg-stone-950/80 hover:bg-stone-900 border border-stone-800 hover:border-sky-500/60 text-left transition-all space-y-1 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-sky-300 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> Sway & Flatter
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">Diplomacy Test</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Engage in courtly discussions to win their favor and increase opinion.
                  </p>
                </button>

                {/* 2. Gilded Bribe */}
                <button
                  onClick={() => handleGift(40)}
                  className="p-3 rounded-2xl bg-stone-950/80 hover:bg-stone-900 border border-stone-800 hover:border-amber-500/60 text-left transition-all space-y-1 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5" /> Send Gilded Gift (40 🪙)
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">+25 Opinion</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Bestow minted gold to secure steadfast loyalty and reduce rebellion desire.
                  </p>
                </button>

                {/* 3. Challenge Duel */}
                <button
                  onClick={handleDuel}
                  className="p-3 rounded-2xl bg-stone-950/80 hover:bg-stone-900 border border-stone-800 hover:border-red-500/60 text-left transition-all space-y-1 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-red-300 flex items-center gap-1.5">
                      <Swords className="w-3.5 h-3.5" /> Trial by Combat / Duel
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">Martial Test</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Challenge to personal combat to assert dominance and gain renown.
                  </p>
                </button>

                {/* 4. Fabricate Blackmail Hook */}
                <button
                  onClick={handleFabricateHook}
                  className="p-3 rounded-2xl bg-stone-950/80 hover:bg-stone-900 border border-stone-800 hover:border-purple-500/60 text-left transition-all space-y-1 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-purple-300 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Fabricate Blackmail (30 🪙)
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">Intrigue Test</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Dispatch spymaster agents to uncover or plant dark secrets for leverage.
                  </p>
                </button>
              </div>

              {/* Assassination Options */}
              <div className="bg-red-950/30 p-4 rounded-2xl border border-red-900/40 space-y-2">
                <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Skull className="w-3.5 h-3.5 text-red-400" />
                  <span>Plot Assassination (50 🪙)</span>
                </h4>
                <p className="text-[11px] text-stone-400">
                  Select a clandestine assassination method to eliminate this character or destabilize their house.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handlePlotAssassination('Poisoned Chalice')}
                    className="py-1.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-medium"
                  >
                    🍷 Poisoned Goblet
                  </button>
                  <button
                    onClick={() => handlePlotAssassination('Shadow Ambush')}
                    className="py-1.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-medium"
                  >
                    🗡️ Shadow Ambush
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Hooks & Secrets */}
          {activeTab === 'secrets' && (
            <div className="space-y-3">
              {existingHook ? (
                <div className="bg-purple-950/40 p-4 rounded-2xl border border-purple-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-purple-400" />
                      <span>{existingHook.type}: {existingHook.secretName}</span>
                    </span>
                    <span className="text-[10px] bg-purple-900 text-purple-200 px-2 py-0.5 rounded-full font-mono">
                      {existingHook.leveragePower}% Leverage
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {existingHook.description}
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        sound.playSuccess();
                        showFeedback(`Blackmail invoked! ${target.name} forced to disband factions and vote with the crown!`, 'success');
                      }}
                      className="w-full py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs transition-colors"
                    >
                      ⛓️ Invoke Blackmail Leverage
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-stone-950/60 p-6 rounded-2xl border border-stone-800 text-center space-y-2">
                  <Eye className="w-8 h-8 text-stone-600 mx-auto" />
                  <p className="text-xs text-stone-400">
                    No secret hooks currently held against {target.name}.
                  </p>
                  <button
                    onClick={handleFabricateHook}
                    className="px-4 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-stone-200 text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Fabricate Hook (30 🪙)</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
