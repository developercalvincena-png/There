import React, { useState } from 'react';
import { CadetBranch, Character, DynastyPerk, FamilyMember, Province } from '../../types';
import { INITIAL_DYNASTY_PERKS } from '../../data/dynastyLegaciesData';
import { 
  Sparkles, 
  Shield, 
  Eye, 
  Building, 
  BookOpen, 
  Crown, 
  CheckCircle, 
  Lock, 
  Plus, 
  Users, 
  Flame,
  Award
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface DynastyLegaciesScreenProps {
  character: Character;
  familyMembers: FamilyMember[];
  provinces: Province[];
  unlockedPerkIds: string[];
  cadetBranches: CadetBranch[];
  onUnlockPerk: (perk: DynastyPerk) => void;
  onCreateCadetBranch: (newBranch: CadetBranch) => void;
  onBack: () => void;
}

export const DynastyLegaciesScreen: React.FC<DynastyLegaciesScreenProps> = ({
  character,
  familyMembers,
  provinces,
  unlockedPerkIds,
  cadetBranches,
  onUnlockPerk,
  onCreateCadetBranch,
  onBack
}) => {
  const [selectedBranch, setSelectedBranch] = useState<'conquest' | 'guile' | 'architecture' | 'erudition' | 'glory'>('conquest');
  const [showCreateCadetModal, setShowCreateCadetModal] = useState<boolean>(false);

  // New Cadet Branch form
  const [founderMemberId, setFounderMemberId] = useState<string>(
    familyMembers.find(m => m.relation === 'Sibling' || m.relation === 'Cousin' || (m.relation === 'Child' && !m.isHeir))?.id || familyMembers[0]?.id || ''
  );
  const [customHouseName, setCustomHouseName] = useState<string>(`House ${character.dynastyName}-Ravencrest`);
  const [customSeatProvince, setCustomSeatProvince] = useState<string>(provinces[1]?.name || 'Frontier Marches');
  const [customMotto, setCustomMotto] = useState<string>('Faithful Unto Death');
  const [customColor, setCustomColor] = useState<string>('bg-indigo-900');
  const [customIcon, setCustomIcon] = useState<string>('🦅');

  const branches = [
    { id: 'conquest' as const, label: 'Iron Warfare', icon: Shield, color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-800/60' },
    { id: 'guile' as const, label: 'Guile & Shadows', icon: Eye, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-800/60' },
    { id: 'architecture' as const, label: 'Architects of Eternity', icon: Building, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/60' },
    { id: 'erudition' as const, label: 'Erudition & Bloodlines', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-800/60' },
    { id: 'glory' as const, label: 'Glory & Nobility', icon: Crown, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/60' },
  ];

  const currentBranchPerks = INITIAL_DYNASTY_PERKS.filter(p => p.branch === selectedBranch);

  const handleBuyPerk = (perk: DynastyPerk) => {
    if (unlockedPerkIds.includes(perk.id)) return;
    if (character.stats.renown < perk.renownCost) {
      sound.playClick();
      return;
    }
    sound.playFanfare();
    onUnlockPerk(perk);
  };

  const handleEstablishCadet = () => {
    const founder = familyMembers.find(m => m.id === founderMemberId);
    if (!founder) return;

    const newBranch: CadetBranch = {
      id: `cadet_${Date.now()}`,
      name: customHouseName,
      founderName: founder.name,
      founderPortrait: founder.portrait || '👑',
      seatProvinceName: customSeatProvince,
      crestColor: customColor,
      crestIcon: customIcon,
      foundedYear: 1085,
      reputation: 'Honored Dynastic Cadet Branch',
      motto: customMotto
    };

    sound.playVictory();
    onCreateCadetBranch(newBranch);
    setShowCreateCadetModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Dynastic Renown */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 p-5 rounded-2xl border border-amber-600/40 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            <h2 className="text-xl font-serif font-bold text-amber-100">Dynastic Legacies & Bloodline Perks</h2>
          </div>
          <p className="text-xs text-stone-400 mt-1 max-w-xl">
            Channel accumulated <span className="text-amber-300 font-semibold">Dynastic Renown</span> to permanently elevate House {character.dynastyName} across all generations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-950/60 border border-amber-600/50 px-4 py-2 rounded-xl flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <div className="text-[10px] text-amber-300 font-serif uppercase tracking-wider">Dynasty Renown</div>
              <div className="text-xl font-bold text-amber-200">{character.stats.renown} 👑</div>
            </div>
          </div>
          <button
            onClick={() => setShowCreateCadetModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-serif font-semibold rounded-xl border border-purple-400/50 shadow-md flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Establish Cadet Branch
          </button>
        </div>
      </div>

      {/* Branch Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {branches.map(b => {
          const Icon = b.icon;
          const isSelected = selectedBranch === b.id;
          const unlockedInBranch = INITIAL_DYNASTY_PERKS.filter(p => p.branch === b.id && unlockedPerkIds.includes(p.id)).length;
          return (
            <button
              key={b.id}
              onClick={() => {
                sound.playClick();
                setSelectedBranch(b.id);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected 
                  ? `${b.bg} border-amber-500 shadow-lg scale-[1.02]` 
                  : 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-5 h-5 ${b.color}`} />
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-800/80 text-stone-300">
                  {unlockedInBranch}/4
                </span>
              </div>
              <div className="text-xs font-serif font-bold text-stone-200">{b.label}</div>
            </button>
          );
        })}
      </div>

      {/* Perk Progression Tree */}
      <div className="bg-stone-900/80 rounded-2xl p-6 border border-stone-800 shadow-inner">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-800">
          <div>
            <h3 className="text-lg font-serif font-bold text-amber-200 capitalize">{selectedBranch} Legacy Tree</h3>
            <p className="text-xs text-stone-400">Unlock sequential tiers to bestow ancestral blessings upon your lineage.</p>
          </div>
          <span className="text-xs text-amber-400 font-serif">Tiers 1 through 4</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {currentBranchPerks.map((perk, index) => {
            const isUnlocked = unlockedPerkIds.includes(perk.id);
            const canAfford = character.stats.renown >= perk.renownCost;
            const prevPerk = index > 0 ? currentBranchPerks[index - 1] : null;
            const isPrevUnlocked = !prevPerk || unlockedPerkIds.includes(prevPerk.id);
            const canUnlock = !isUnlocked && isPrevUnlocked && canAfford;

            return (
              <div
                key={perk.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all relative ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-amber-950/40 to-stone-900 border-amber-500/70 shadow-lg'
                    : isPrevUnlocked
                    ? 'bg-stone-900/90 border-stone-700 hover:border-amber-600/50'
                    : 'bg-stone-950/60 border-stone-800/50 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{perk.icon}</span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-stone-800 text-amber-300 font-bold">
                        Tier {perk.tier}
                      </span>
                    </div>
                    {isUnlocked ? (
                      <span className="flex items-center gap-1 text-[11px] font-serif text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                        <CheckCircle className="w-3.5 h-3.5" /> Unlocked
                      </span>
                    ) : !isPrevUnlocked ? (
                      <span className="flex items-center gap-1 text-[11px] text-stone-500">
                        <Lock className="w-3.5 h-3.5" /> Locked
                      </span>
                    ) : (
                      <span className="text-xs font-serif font-bold text-amber-400">
                        {perk.renownCost} 👑
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-serif font-bold text-stone-100 mb-1.5">{perk.name}</h4>
                  <p className="text-xs text-stone-400 mb-3 line-clamp-2">{perk.description}</p>
                  
                  <div className="bg-stone-950/80 p-2.5 rounded-lg border border-stone-800/80 text-[11px] text-amber-200/90 font-medium">
                    ✨ {perk.effectsSummary}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800/60">
                  {isUnlocked ? (
                    <div className="text-center text-xs font-serif text-emerald-400 font-semibold py-1.5">
                      Ancestral Blessing Active
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBuyPerk(perk)}
                      disabled={!canUnlock}
                      className={`w-full py-2 px-3 rounded-lg font-serif text-xs font-bold transition-all ${
                        canUnlock
                          ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 shadow-md active:scale-95'
                          : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      {!isPrevUnlocked ? 'Requires Previous Tier' : !canAfford ? `Need ${perk.renownCost - character.stats.renown} more Renown` : 'Unlock Legacy Perk'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cadet Branches Roster */}
      <div className="bg-stone-900/80 rounded-2xl p-5 border border-stone-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-serif font-bold text-stone-200">Dynastic Cadet Branches</h3>
          </div>
          <span className="text-xs text-stone-400">{cadetBranches.length} Recognized Branches</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cadetBranches.map(branch => (
            <div key={branch.id} className="p-3.5 bg-stone-950/70 rounded-xl border border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${branch.crestColor} border border-amber-500/40 flex items-center justify-center text-xl shadow`}>
                  {branch.crestIcon}
                </div>
                <div>
                  <div className="text-sm font-serif font-bold text-amber-200">{branch.name}</div>
                  <div className="text-xs text-stone-400">
                    Founded by {branch.founderName} ({branch.founderPortrait}) • Seat: {branch.seatProvinceName}
                  </div>
                  <div className="text-[11px] text-purple-300 italic mt-0.5">"{branch.motto}"</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
                Pact Allied
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Create Cadet Branch Modal */}
      {showCreateCadetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-purple-500/60 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-serif font-bold text-amber-100">Establish Dynastic Cadet Branch</h3>
              </div>
              <button onClick={() => setShowCreateCadetModal(false)} className="text-stone-400 hover:text-stone-200">✕</button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Grant distant kin or a non-inheriting royal sibling their own hereditary cadet house to expand House {character.dynastyName}'s influence across neighboring counties.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 font-serif mb-1">Founder Family Relative:</label>
                <select
                  value={founderMemberId}
                  onChange={(e) => setFounderMemberId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200"
                >
                  {familyMembers.filter(m => m.alive).map(m => (
                    <option key={m.id} value={m.id}>
                      {m.portrait} {m.name} ({m.relation} - Age {m.age})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-400 font-serif mb-1">Cadet House Name:</label>
                <input
                  type="text"
                  value={customHouseName}
                  onChange={(e) => setCustomHouseName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 font-serif"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-400 font-serif mb-1">Seat Province:</label>
                  <select
                    value={customSeatProvince}
                    onChange={(e) => setCustomSeatProvince(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200"
                  >
                    {provinces.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 font-serif mb-1">Crest Icon:</label>
                  <select
                    value={customIcon}
                    onChange={(e) => setCustomIcon(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200"
                  >
                    <option value="🦅">🦅 Imperial Eagle</option>
                    <option value="🐺">🐺 Shadow Wolf</option>
                    <option value="🦁">🦁 Golden Lion</option>
                    <option value="🐉">🐉 Ancient Dragon</option>
                    <option value="⚓">⚓ Maritime Anchor</option>
                    <option value="⚔️">⚔️ Crossed Broadswords</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-400 font-serif mb-1">Cadet Motto:</label>
                <input
                  type="text"
                  value={customMotto}
                  onChange={(e) => setCustomMotto(e.target.value)}
                  placeholder="e.g. Iron and Honor"
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 italic"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCreateCadetModal(false)}
                className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-serif"
              >
                Cancel
              </button>
              <button
                onClick={handleEstablishCadet}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-serif font-bold text-xs shadow-lg"
              >
                Seal Cadet Charter 📜
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
