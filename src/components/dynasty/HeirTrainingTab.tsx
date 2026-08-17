import React, { useState } from 'react';
import { Character, FamilyMember, RealmNPC, Vassal } from '../../types';
import { 
  GraduationCap, 
  Award, 
  Swords, 
  BookOpen, 
  Crown, 
  Eye, 
  Coins, 
  UserCheck, 
  Sparkles, 
  Shield, 
  HeartHandshake, 
  Flame, 
  ChevronRight, 
  CheckCircle2, 
  ArrowLeft,
  Users
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface HeirTrainingTabProps {
  character: Character;
  familyMembers: FamilyMember[];
  realmNPCs?: RealmNPC[];
  vassals?: Vassal[];
  onUpdateFamilyMember: (member: FamilyMember) => void;
  onUpdateCharacter?: (updates: Partial<Character>) => void;
  onAddChronicle?: (entry: { title: string; description: string; type: 'family' | 'court' | 'intrigue' | 'realm' }) => void;
  onBackToFamily?: () => void;
}

export interface CourtTutorOption {
  id: string;
  name: string;
  role: string;
  portrait: string;
  species: string;
  source: 'Council' | 'NPC' | 'Vassal';
  primaryTrait: string;
  stats: {
    martial: number;
    intellect: number;
    diplomacy: number;
    intrigue: number;
    stewardship: number;
  };
  specialtyBonus: string;
  martialGrowth: number;
  intellectGrowth: number;
  diplomacyGrowth: number;
  intrigueGrowth: number;
  stewardshipGrowth: number;
  potentialTraits: string[];
}

export const HeirTrainingTab: React.FC<HeirTrainingTabProps> = ({
  character,
  familyMembers,
  realmNPCs = [],
  vassals = [],
  onUpdateFamilyMember,
  onUpdateCharacter,
  onAddChronicle,
  onBackToFamily
}) => {
  // Find living children and heirs
  const livingChildren = familyMembers.filter(m => (m.relation === 'Child' || m.isHeir) && m.alive);
  const [selectedChildId, setSelectedChildId] = useState<string>(
    livingChildren.find(c => c.isHeir)?.id || livingChildren[0]?.id || ''
  );
  const [showTutorSelector, setShowTutorSelector] = useState<boolean>(false);
  const [trainingMessage, setTrainingMessage] = useState<string | null>(null);

  const selectedChild = familyMembers.find(m => m.id === selectedChildId) || livingChildren[0];

  // Compile Available Court Tutors
  const availableTutors: CourtTutorOption[] = [
    // Grand Marshal / Battlemaster
    {
      id: 'tutor_marshal',
      name: 'Grand Marshal Valerius of the Iron Vanguard',
      role: 'High Marshal of the Realm',
      portrait: '🛡️',
      species: 'Human',
      source: 'Council',
      primaryTrait: 'Master Tactician & Swordmaster',
      stats: { martial: 26, intellect: 14, diplomacy: 12, intrigue: 10, stewardship: 15 },
      specialtyBonus: '+4 Martial & +2 Prowess per year',
      martialGrowth: 4,
      intellectGrowth: 1,
      diplomacyGrowth: 1,
      intrigueGrowth: 0,
      stewardshipGrowth: 1,
      potentialTraits: ['Brilliant Commander', 'Unyielding Warrior', 'Ironclad']
    },
    // High Chancellor / Diplomat
    {
      id: 'tutor_chancellor',
      name: 'High Chancellor Lady Fiona of Eldermarch',
      role: 'Imperial Chancellor & Chief Envoy',
      portrait: '📜',
      species: 'Human',
      source: 'Council',
      primaryTrait: 'Silver-Tongued Diplomat',
      stats: { martial: 10, intellect: 22, diplomacy: 28, intrigue: 16, stewardship: 18 },
      specialtyBonus: '+4 Diplomacy & +2 Intellect per year',
      martialGrowth: 1,
      intellectGrowth: 2,
      diplomacyGrowth: 4,
      intrigueGrowth: 1,
      stewardshipGrowth: 2,
      potentialTraits: ['Charismatic Orator', 'Great Statesman', 'Diplomatic Prodigy']
    },
    // Arch-Mage / Polymath Scholar
    {
      id: 'tutor_archmage',
      name: 'Arch-Mage Zephyr of the Obsidian Spire',
      role: 'Royal Astrologer & High Mage',
      portrait: '🧙‍♂️',
      species: 'HighElf',
      source: 'Council',
      primaryTrait: 'Polymath Sage & Arcane Scholar',
      stats: { martial: 8, intellect: 30, diplomacy: 15, intrigue: 18, stewardship: 20 },
      specialtyBonus: '+5 Intellect & Arcane Knowledge per year',
      martialGrowth: 0,
      intellectGrowth: 5,
      diplomacyGrowth: 1,
      intrigueGrowth: 2,
      stewardshipGrowth: 2,
      potentialTraits: ['Polymath Scholar', 'Erudite Genius', 'Leyline Mystic']
    },
    // Spymaster / Shadow Mentor
    {
      id: 'tutor_spymaster',
      name: 'Whisper-Mistress Vespera',
      role: 'Court Spymaster',
      portrait: '🗡️',
      species: 'Vampire',
      source: 'Council',
      primaryTrait: 'Shadow Weaver & Poisoner',
      stats: { martial: 14, intellect: 20, diplomacy: 14, intrigue: 32, stewardship: 12 },
      specialtyBonus: '+4 Intrigue & +2 Intellect per year',
      martialGrowth: 1,
      intellectGrowth: 2,
      diplomacyGrowth: 1,
      intrigueGrowth: 4,
      stewardshipGrowth: 1,
      potentialTraits: ['Shadow Master', 'Schemer', 'Untouchable']
    },
    // Grand Treasurer / Imperial Steward
    {
      id: 'tutor_steward',
      name: 'Lord Castellan Godric',
      role: 'Grand Treasurer & Bailiff',
      portrait: '🪙',
      species: 'Human',
      source: 'Council',
      primaryTrait: 'Grand Administrator & Financier',
      stats: { martial: 12, intellect: 24, diplomacy: 18, intrigue: 12, stewardship: 28 },
      specialtyBonus: '+4 Stewardship & +2 Intellect per year',
      martialGrowth: 1,
      intellectGrowth: 2,
      diplomacyGrowth: 2,
      intrigueGrowth: 0,
      stewardshipGrowth: 4,
      potentialTraits: ['Midas Touch', 'Frugal Overseer', 'Architect of Empires']
    },
    // Additional NPC tutors from Court if present
    ...realmNPCs.map(npc => ({
      id: `tutor_npc_${npc.id}`,
      name: npc.name,
      role: npc.title || npc.role,
      portrait: npc.portrait || '👤',
      species: npc.species,
      source: 'NPC' as const,
      primaryTrait: npc.traits[0] || 'Court Mentor',
      stats: {
        martial: npc.stats.martial,
        intellect: npc.stats.intellect,
        diplomacy: npc.stats.diplomacy,
        intrigue: npc.stats.intrigue,
        stewardship: npc.stats.stewardship
      },
      specialtyBonus: `+${Math.max(2, Math.round(npc.stats.martial / 8))} Martial, +${Math.max(2, Math.round(npc.stats.intellect / 8))} Intellect`,
      martialGrowth: Math.max(1, Math.round(npc.stats.martial / 8)),
      intellectGrowth: Math.max(1, Math.round(npc.stats.intellect / 8)),
      diplomacyGrowth: Math.max(1, Math.round(npc.stats.diplomacy / 8)),
      intrigueGrowth: Math.max(1, Math.round(npc.stats.intrigue / 8)),
      stewardshipGrowth: Math.max(1, Math.round(npc.stats.stewardship / 8)),
      potentialTraits: npc.traits.slice(0, 2)
    }))
  ];

  // Helper for current child's stats
  const childStats = selectedChild?.stats || {
    martial: 12,
    intellect: 14,
    diplomacy: 15,
    intrigue: 10,
    prowess: 12,
    stewardship: 11
  };

  const currentFocus = selectedChild?.trainingFocus || 'Martial';
  const currentTutor = availableTutors.find(t => t.id === selectedChild?.tutorId) || availableTutors[0];
  const educationProgress = selectedChild?.educationProgress || 35;

  // Handle Assigning Tutor
  const handleAssignTutor = (tutor: CourtTutorOption) => {
    sound.playTome();
    if (!selectedChild) return;

    const updatedChild: FamilyMember = {
      ...selectedChild,
      tutorId: tutor.id,
      tutorName: tutor.name,
      tutorPortrait: tutor.portrait,
      tutorRole: tutor.role,
      tutorTraits: [tutor.primaryTrait, ...tutor.potentialTraits],
      mentorName: tutor.name
    };

    onUpdateFamilyMember(updatedChild);
    setShowTutorSelector(false);

    setTrainingMessage(`Assigned ${tutor.name} (${tutor.role}) as the royal tutor for ${selectedChild.name}!`);

    if (onAddChronicle) {
      onAddChronicle({
        title: `🎓 Royal Tutor Appointed: ${tutor.name}`,
        description: `${tutor.name} was officially commissioned as personal royal preceptor to ${selectedChild.name}, focusing on ${currentFocus} arts.`,
        type: 'family'
      });
    }
  };

  // Handle Setting Training Focus
  const handleSetFocus = (focus: 'Martial' | 'Intellect' | 'Diplomacy' | 'Intrigue' | 'Stewardship') => {
    sound.playClick();
    if (!selectedChild) return;

    const updatedChild: FamilyMember = {
      ...selectedChild,
      trainingFocus: focus
    };

    onUpdateFamilyMember(updatedChild);
    setTrainingMessage(`Updated training syllabus for ${selectedChild.name} to: ${focus}.`);
  };

  // Handle Intensive Exam / Sparring Trial
  const handleConductIntensiveDrill = () => {
    if (character.stats.gold < 30) {
      sound.playError();
      setTrainingMessage('Insufficient gold in treasury (30 gold required for master instructors & arena equipment).');
      return;
    }

    sound.playTrumpet();
    const goldCost = 30;
    if (onUpdateCharacter) {
      onUpdateCharacter({
        stats: {
          ...character.stats,
          gold: character.stats.gold - goldCost
        }
      });
    }

    // Stat bonuses depending on focus and tutor
    const boostStat = currentFocus.toLowerCase() as keyof typeof childStats;
    const statGain = Math.floor(Math.random() * 3) + 2; // +2 to +4
    const newStats = {
      ...childStats,
      [boostStat]: (childStats[boostStat] || 10) + statGain
    };

    const newProgress = Math.min(100, (selectedChild.educationProgress || 35) + 20);

    const updatedChild: FamilyMember = {
      ...selectedChild,
      stats: newStats,
      educationProgress: newProgress
    };

    onUpdateFamilyMember(updatedChild);

    const drillDescriptions: Record<string, string> = {
      Martial: `held a grueling live-steel tournament in the palace courtyards. ${selectedChild.name} parried every assault (+${statGain} Martial)!`,
      Intellect: `subjected ${selectedChild.name} to a rigorous disputation on grand history and statecraft philosophy (+${statGain} Intellect)!`,
      Diplomacy: `staged mock imperial embassies. ${selectedChild.name} eloquently reconciled heated court factions (+${statGain} Diplomacy)!`,
      Intrigue: `tested ${selectedChild.name} against simulated poisons and ciphered messages (+${statGain} Intrigue)!`,
      Stewardship: `audited provincial granary ledgers with the master accountants (+${statGain} Stewardship)!`
    };

    setTrainingMessage(`Intensive Training Complete! ${selectedChild.name} ${drillDescriptions[currentFocus] || ''}`);

    if (onAddChronicle) {
      onAddChronicle({
        title: `⚡ Royal Mentorship Trial: ${selectedChild.name}`,
        description: `Under the tutelage of ${currentTutor.name}, ${selectedChild.name} underwent rigorous ${currentFocus} trials, gaining +${statGain} in ${currentFocus}.`,
        type: 'family'
      });
    }
  };

  // Handle Designating as Official Heir
  const handleDesignateAsPrimaryHeir = () => {
    sound.playFanfare();
    if (!selectedChild) return;

    // Update all family members
    familyMembers.forEach(m => {
      if (m.id === selectedChild.id) {
        onUpdateFamilyMember({ ...m, isHeir: true });
      } else if (m.isHeir) {
        onUpdateFamilyMember({ ...m, isHeir: false });
      }
    });

    setTrainingMessage(`${selectedChild.name} has been designated as the sole Primary Heir to the High Crown!`);

    if (onAddChronicle) {
      onAddChronicle({
        title: `👑 Official Heir Designated: ${selectedChild.name}`,
        description: `By royal imperial decree, ${selectedChild.name} has been confirmed as the sole legitimate successor to the dynastic throne.`,
        type: 'family'
      });
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-16 font-sans">
      
      {/* Top Header / Back banner */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBackToFamily && (
            <button
              onClick={() => { sound.playClick(); onBackToFamily(); }}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Family</span>
            </button>
          )}
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600 text-stone-950 shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-amber-300 font-cinzel tracking-wide flex items-center gap-2">
              Royal Heir Mentorship & Academy
            </h2>
            <p className="text-xs text-stone-400">
              Assign distinguished court tutors to educate royal children and instill hereditary virtues.
            </p>
          </div>
        </div>

        {/* Treasury Status */}
        <div className="bg-stone-950/70 border border-amber-900/40 px-3.5 py-2 rounded-xl flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-300">{character.stats.gold} Gold</span>
          <span className="text-[10px] text-stone-400">in Vault</span>
        </div>
      </div>

      {/* Child Selector Tabs */}
      {livingChildren.length > 0 ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {livingChildren.map(child => {
            const isSelected = child.id === selectedChildId;
            return (
              <button
                key={child.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedChildId(child.id);
                  setTrainingMessage(null);
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-600/90 to-yellow-600/90 text-stone-950 border-amber-400 shadow-lg scale-100'
                    : 'bg-stone-900/80 text-stone-300 border-stone-800 hover:bg-stone-800'
                }`}
              >
                <span className="text-lg">{child.portrait || '🧒'}</span>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span>{child.name}</span>
                    {child.isHeir && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${isSelected ? 'bg-stone-950 text-amber-300' : 'bg-amber-500/20 text-amber-400'}`}>
                        👑 Heir
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${isSelected ? 'text-stone-900 font-semibold' : 'text-stone-400'}`}>
                    Age {child.age} • {child.trainingFocus || 'Martial'} Focus
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-8 text-center text-stone-400 text-xs">
          <p className="text-base mb-1 font-bold text-stone-300 font-cinzel">No Living Heirs or Royal Children</p>
          <p>Arrange dynastic marriages or sire heirs to establish a royal academy curriculum.</p>
        </div>
      )}

      {selectedChild && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* LEFT COLUMN: Child Overview & Current Stats (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            
            {/* Child Profile Card */}
            <div className="bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-stone-800 border-2 border-amber-600/40 flex items-center justify-center text-3xl shadow-md">
                    {selectedChild.portrait || '🧒'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-stone-100 font-cinzel flex items-center gap-1.5">
                      {selectedChild.name}
                      {selectedChild.isHeir && <Crown className="w-4 h-4 text-yellow-400 inline" />}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1 text-[11px] text-stone-400">
                      <span className="bg-stone-800 px-2 py-0.5 rounded text-amber-300 font-semibold">Age {selectedChild.age}</span>
                      <span className="bg-stone-800 px-2 py-0.5 rounded">{selectedChild.gender}</span>
                      <span className="bg-stone-800 px-2 py-0.5 rounded">{selectedChild.species}</span>
                    </div>
                  </div>
                </div>

                {!selectedChild.isHeir && (
                  <button
                    onClick={handleDesignateAsPrimaryHeir}
                    title="Designate as official crown heir"
                    className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Make Heir</span>
                  </button>
                )}
              </div>

              {/* Education Progress Bar */}
              <div className="space-y-1.5 bg-stone-950/60 p-3 rounded-xl border border-stone-800/80">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-stone-300 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                    Academy Mastery
                  </span>
                  <span className="text-amber-400">{educationProgress}% / 100%</span>
                </div>
                <div className="w-full bg-stone-800 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${educationProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-stone-500">
                  <span>Novice (Age 6)</span>
                  <span>Squire / Adept (Age 12)</span>
                  <span>Master (Age 16)</span>
                </div>
              </div>

              {/* Child Stats Visualizer */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider font-cinzel">
                  Cultivated Royal Attributes
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-stone-950/60 border border-stone-800 p-2.5 rounded-xl flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-rose-300 font-medium">
                      <Swords className="w-3.5 h-3.5 text-rose-400" /> Martial
                    </span>
                    <span className="font-extrabold text-stone-100 text-sm">{childStats.martial}</span>
                  </div>

                  <div className="bg-stone-950/60 border border-stone-800 p-2.5 rounded-xl flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-blue-300 font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Intellect
                    </span>
                    <span className="font-extrabold text-stone-100 text-sm">{childStats.intellect}</span>
                  </div>

                  <div className="bg-stone-950/60 border border-stone-800 p-2.5 rounded-xl flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                      <Crown className="w-3.5 h-3.5 text-amber-400" /> Diplomacy
                    </span>
                    <span className="font-extrabold text-stone-100 text-sm">{childStats.diplomacy}</span>
                  </div>

                  <div className="bg-stone-950/60 border border-stone-800 p-2.5 rounded-xl flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-purple-300 font-medium">
                      <Eye className="w-3.5 h-3.5 text-purple-400" /> Intrigue
                    </span>
                    <span className="font-extrabold text-stone-100 text-sm">{childStats.intrigue}</span>
                  </div>

                  <div className="bg-stone-950/60 border border-stone-800 p-2.5 rounded-xl flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
                      <Coins className="w-3.5 h-3.5 text-emerald-400" /> Stewardship
                    </span>
                    <span className="font-extrabold text-stone-100 text-sm">{childStats.stewardship}</span>
                  </div>

                  <div className="bg-stone-950/60 border border-stone-800 p-2.5 rounded-xl flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-orange-300 font-medium">
                      <Shield className="w-3.5 h-3.5 text-orange-400" /> Prowess
                    </span>
                    <span className="font-extrabold text-stone-100 text-sm">{childStats.prowess}</span>
                  </div>
                </div>
              </div>

              {/* Inherited & Developing Traits */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-stone-400">Traits & Temperament:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedChild.traits || []).length > 0 ? (
                    selectedChild.traits.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-700/50 text-amber-300 text-[11px] font-semibold">
                        ✨ {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-stone-500 italic">Unformed youth temperament</span>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: Assigned Tutor, Focus Selection & Training Actions (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            
            {/* Feedback Message */}
            {trainingMessage && (
              <div className="p-3 bg-amber-950/70 border border-amber-600/70 text-amber-200 text-xs rounded-xl flex items-start gap-2 animate-fade-in">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="font-medium">{trainingMessage}</p>
              </div>
            )}

            {/* Currently Assigned Court Tutor Card */}
            <div className="bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-900/30 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-stone-100 font-cinzel">
                    Appointed Preceptor & Court Mentor
                  </h3>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowTutorSelector(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-extrabold text-xs shadow cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Change Royal Tutor</span>
                </button>
              </div>

              <div className="flex items-start gap-3 bg-stone-950/70 p-3.5 rounded-xl border border-stone-800/80">
                <div className="w-14 h-14 rounded-2xl bg-stone-800 border border-amber-600/40 flex items-center justify-center text-3xl shadow">
                  {currentTutor.portrait}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-amber-200 truncate">{currentTutor.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded">
                      {currentTutor.source}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">{currentTutor.role}</p>
                  
                  <div className="mt-2 text-xs space-y-1">
                    <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{currentTutor.specialtyBonus}</span>
                    </div>
                    <div className="text-[11px] text-stone-400">
                      <span className="text-stone-500">Mentor Trait:</span> <span className="text-stone-300 font-medium">{currentTutor.primaryTrait}</span>
                    </div>
                    <div className="text-[11px] text-stone-400">
                      <span className="text-stone-500">Potential Virtues:</span> {currentTutor.potentialTraits.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Training Focus Selector */}
            <div className="bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h3 className="font-bold text-sm text-stone-100 font-cinzel flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Select Academic & Martial Syllabus</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {/* Martial */}
                <button
                  onClick={() => handleSetFocus('Martial')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    currentFocus === 'Martial'
                      ? 'bg-rose-950/60 border-rose-500/80 text-rose-100 shadow-md ring-1 ring-rose-500'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:bg-stone-800/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-rose-400 mb-1">
                    <Swords className="w-4 h-4" />
                    <span>Chivalric Martial</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-tight">
                    Swordplay, siege tactics, and combat leadership. High chance of martial combat traits.
                  </p>
                </button>

                {/* Intellect */}
                <button
                  onClick={() => handleSetFocus('Intellect')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    currentFocus === 'Intellect'
                      ? 'bg-blue-950/60 border-blue-500/80 text-blue-100 shadow-md ring-1 ring-blue-500'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:bg-stone-800/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-blue-400 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span>Scholastic & Arcana</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-tight">
                    Natural philosophy, astronomy, and leyline lore. High chance of erudite scholar traits.
                  </p>
                </button>

                {/* Diplomacy */}
                <button
                  onClick={() => handleSetFocus('Diplomacy')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    currentFocus === 'Diplomacy'
                      ? 'bg-amber-950/60 border-amber-500/80 text-amber-100 shadow-md ring-1 ring-amber-500'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:bg-stone-800/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                    <Crown className="w-4 h-4" />
                    <span>Court Statecraft</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-tight">
                    Rhetoric, dynastic treaty drafting, and vassal relations. High chance of charismatic traits.
                  </p>
                </button>
              </div>
            </div>

            {/* Interactive Mentorship Drill & Training Grounds */}
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h3 className="font-bold text-sm text-stone-100 font-cinzel flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Mentorship Activities & Grand Drills</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleConductIntensiveDrill}
                  className="p-3.5 bg-gradient-to-r from-amber-700/80 to-yellow-600/80 hover:from-amber-600 hover:to-yellow-500 text-stone-950 rounded-xl text-left font-bold transition-all shadow cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Conduct Intensive Royal Trial
                    </span>
                    <span className="text-[11px] bg-stone-950/30 px-2 py-0.5 rounded font-extrabold">30 Gold</span>
                  </div>
                  <p className="text-[11px] font-normal text-stone-900 mt-1 leading-snug">
                    Instantly grants +2~4 in {currentFocus} and advances academy graduation progress by +20%.
                  </p>
                </button>

                <div className="p-3.5 bg-stone-950/60 border border-stone-800 rounded-xl text-left">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-300">
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-amber-400" />
                      Annual Passive Training
                    </span>
                    <span className="text-emerald-400 font-bold">Active</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1 leading-snug">
                    Every year tick, {currentTutor.name} trains {selectedChild.name}, boosting attributes and forging adulthood virtues at age 16.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tutor Selection Modal */}
      {showTutorSelector && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border-2 border-amber-600/60 rounded-2xl max-w-2xl w-full p-5 text-stone-100 shadow-2xl space-y-4 max-h-[85vh] flex flex-col font-sans">
            
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-amber-300 font-cinzel">
                  Appoint Royal Tutor for {selectedChild?.name}
                </h3>
              </div>
              <button
                onClick={() => setShowTutorSelector(false)}
                className="text-stone-400 hover:text-stone-100 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-400">
              Select a distinguished courtier, high council member, or wise sage. Each tutor imparts unique stat growth and hereditary traits based on their mastery.
            </p>

            <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
              {availableTutors.map(tutor => (
                <div
                  key={tutor.id}
                  onClick={() => handleAssignTutor(tutor)}
                  className="p-3.5 bg-stone-950/80 hover:bg-amber-950/40 border border-stone-800 hover:border-amber-600/60 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                      {tutor.portrait}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-amber-200">{tutor.name}</h4>
                        <span className="text-[10px] px-1.5 py-0.2 bg-stone-800 text-stone-300 rounded font-semibold">
                          {tutor.source}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400">{tutor.role}</p>
                      <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                        {tutor.specialtyBonus}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        Trait: {tutor.primaryTrait} • Virtues: {tutor.potentialTraits.join(', ')}
                      </div>
                    </div>
                  </div>

                  <button className="px-3 py-1.5 rounded-lg bg-amber-500/20 group-hover:bg-amber-500 group-hover:text-stone-950 text-amber-300 text-xs font-bold transition-colors">
                    Assign
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
