import React, { useState } from 'react';
import { ProvincialSoldier, Province, Character, Vassal, SoldierRank } from '../../types';
import { sound } from '../../utils/audio';
import { MARTIAL_TRAITS_CATALOG, RANK_TIERS } from '../../data/provincialSoldiersData';
import { 
  Shield, 
  Swords, 
  Crown, 
  Award, 
  Lock, 
  Unlock, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Sparkles, 
  UserCheck, 
  AlertTriangle, 
  Search, 
  Filter, 
  Gift, 
  Skull, 
  Flame, 
  Info,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Hammer
} from 'lucide-react';

interface ProvincialBarracksModalProps {
  province: Province;
  character: Character;
  soldiers: ProvincialSoldier[];
  onClose: () => void;
  onKnightSoldier: (soldier: ProvincialSoldier, ennobledName: string, houseName: string) => void;
  onPromoteSoldier: (soldierId: string) => void;
  onDemoteSoldier: (soldierId: string) => void;
  onMakeProvincialHead: (soldier: ProvincialSoldier) => void;
  onImprisonSoldier: (soldierId: string) => void;
  onReleaseSoldier: (soldierId: string, withOath: boolean) => void;
  onExecuteSoldier: (soldierId: string) => void;
  onUpgradeSoldierGear: (soldierId: string, cost: number) => void;
  onGrantProvinceToSoldier?: (soldier: ProvincialSoldier) => void;
}

export const ProvincialBarracksModal: React.FC<ProvincialBarracksModalProps> = ({
  province,
  character,
  soldiers,
  onClose,
  onKnightSoldier,
  onPromoteSoldier,
  onDemoteSoldier,
  onMakeProvincialHead,
  onImprisonSoldier,
  onReleaseSoldier,
  onExecuteSoldier,
  onUpgradeSoldierGear,
  onGrantProvinceToSoldier
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'officers' | 'lowborn' | 'knighted' | 'imprisoned' | 'provincial_head'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rank' | 'prowess' | 'martial' | 'loyalty' | 'kills'>('rank');
  
  // Inspected soldier for detailed modal/drawer
  const [inspectedSoldier, setInspectedSoldier] = useState<ProvincialSoldier | null>(null);
  
  // Knighting dialog state
  const [knightingSoldier, setKnightingSoldier] = useState<ProvincialSoldier | null>(null);
  const [nobleTitleInput, setNobleTitleInput] = useState<string>('');
  const [houseNameInput, setHouseNameInput] = useState<string>('');

  // Confirmation dialogs
  const [confirmImprison, setConfirmImprison] = useState<ProvincialSoldier | null>(null);
  const [confirmExecute, setConfirmExecute] = useState<ProvincialSoldier | null>(null);
  const [confirmHead, setConfirmHead] = useState<ProvincialSoldier | null>(null);

  // Filter soldiers
  const filteredSoldiers = soldiers.filter(s => {
    // Tab filter
    if (activeFilter === 'officers' && s.rankTier < 4) return false;
    if (activeFilter === 'lowborn' && (s.rankTier > 3 || s.status === 'knighted')) return false;
    if (activeFilter === 'knighted' && s.status !== 'knighted') return false;
    if (activeFilter === 'imprisoned' && s.status !== 'imprisoned') return false;
    if (activeFilter === 'provincial_head' && s.status !== 'provincial_head') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.lowBornOrigin.toLowerCase().includes(q) ||
        s.rank.toLowerCase().includes(q) ||
        s.specialMartialTraits.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Sort soldiers
  const sortedSoldiers = [...filteredSoldiers].sort((a, b) => {
    if (sortBy === 'rank') return b.rankTier - a.rankTier;
    if (sortBy === 'prowess') return b.prowess - a.prowess;
    if (sortBy === 'martial') return b.martial - a.martial;
    if (sortBy === 'loyalty') return b.loyalty - a.loyalty;
    if (sortBy === 'kills') return b.killsCount - a.killsCount;
    return 0;
  });

  const barracksLevel = province.buildings.barracks || 1;
  const isProvHeadAssigned = soldiers.some(s => s.status === 'provincial_head');

  const handleOpenKnightingDialog = (soldier: ProvincialSoldier) => {
    sound.playClick();
    setKnightingSoldier(soldier);
    const parts = soldier.name.split(' ');
    const defaultSurname = parts.length > 1 ? parts.slice(1).join(' ').replace(/^the\s+/i, '') : 'Ironwood';
    setNobleTitleInput(`Sir ${soldier.name} of ${province.name}`);
    setHouseNameInput(`House ${defaultSurname}`);
  };

  const handleConfirmKnighting = () => {
    if (!knightingSoldier) return;
    sound.playFanfare();
    onKnightSoldier(knightingSoldier, nobleTitleInput, houseNameInput);
    setKnightingSoldier(null);
    if (inspectedSoldier?.id === knightingSoldier.id) {
      setInspectedSoldier(prev => prev ? { ...prev, status: 'knighted', rank: 'Knight of the Realm', rankTier: 7 } : null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-stone-900 border border-stone-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-[#2c1d0c] via-[#1f1508] to-[#120c05] p-4 sm:p-5 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-2xl shadow-inner shrink-0">
              🏰
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-amber-200 font-cinzel">
                  {province.name} Provincial Barracks
                </h2>
                <span className="text-[10px] font-black bg-amber-600/90 text-stone-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Tier {barracksLevel} Military Garrison
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Top 20 low-born recruits, seasoned soldiers & officers. Promote, knight, appoint, or discipline your garrison forces.
              </p>
            </div>
          </div>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GARRISON SUMMARY METRIC BAR */}
        <div className="bg-stone-950/90 px-4 py-2.5 border-b border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 text-stone-300">
            <Shield className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="text-[10px] text-stone-500 block">Total Garrison</span>
              <span className="font-bold text-stone-200 font-mono">{province.troops} Levies</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-stone-300">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-stone-500 block">Elite Roster</span>
              <span className="font-bold text-amber-300 font-mono">Top 20 Recruits & Officers</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-stone-300">
            <Crown className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-[10px] text-stone-500 block">Knighted Nobles</span>
              <span className="font-bold text-purple-300 font-mono">
                {soldiers.filter(s => s.status === 'knighted').length} Vassal Knights
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-stone-300">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-stone-500 block">Provincial Head</span>
              <span className="font-bold text-emerald-300 font-mono truncate block max-w-[130px]">
                {soldiers.find(s => s.status === 'provincial_head')?.name || province.governorName || 'Direct Crown'}
              </span>
            </div>
          </div>
        </div>

        {/* CONTROLS: FILTERS, SEARCH & SORT */}
        <div className="p-3 sm:p-4 bg-stone-900 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              onClick={() => { sound.playClick(); setActiveFilter('all'); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-amber-600 text-stone-950 shadow-sm'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              All Soldiers ({soldiers.length})
            </button>
            <button
              onClick={() => { sound.playClick(); setActiveFilter('officers'); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'officers'
                  ? 'bg-amber-600 text-stone-950 shadow-sm'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              Officers & Sergeants
            </button>
            <button
              onClick={() => { sound.playClick(); setActiveFilter('lowborn'); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'lowborn'
                  ? 'bg-amber-600 text-stone-950 shadow-sm'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              Low-born Recruits
            </button>
            <button
              onClick={() => { sound.playClick(); setActiveFilter('knighted'); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'knighted'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-stone-800 text-purple-300 hover:bg-stone-700'
              }`}
            >
              Knighted ({soldiers.filter(s => s.status === 'knighted').length})
            </button>
            <button
              onClick={() => { sound.playClick(); setActiveFilter('imprisoned'); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'imprisoned'
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'bg-stone-800 text-red-300 hover:bg-stone-700'
              }`}
            >
              Dungeon ({soldiers.filter(s => s.status === 'imprisoned').length})
            </button>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search soldiers & traits..."
                className="w-full bg-stone-950 text-stone-200 pl-8 pr-3 py-1.5 rounded-lg text-xs border border-stone-700 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-stone-950 text-stone-200 px-2.5 py-1.5 rounded-lg text-xs border border-stone-700 focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              <option value="rank">Sort: Military Rank</option>
              <option value="prowess">Sort: Prowess (Combat)</option>
              <option value="martial">Sort: Martial (Strategy)</option>
              <option value="loyalty">Sort: Loyalty</option>
              <option value="kills">Sort: Kills & Battles</option>
            </select>
          </div>
        </div>

        {/* SOLDIERS ROSTER GRID */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {sortedSoldiers.length === 0 ? (
            <div className="text-center py-12 text-stone-400 space-y-2">
              <Shield className="w-10 h-10 text-stone-600 mx-auto" />
              <div className="font-bold text-sm text-stone-300">No provincial soldiers match the selected filter</div>
              <p className="text-xs text-stone-500">Try choosing a different filter or clearing search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {sortedSoldiers.map((soldier) => {
                const rankConfig = RANK_TIERS[soldier.rank] || RANK_TIERS['Militia Recruit'];
                const canPromote = !!rankConfig.nextRank && soldier.status !== 'imprisoned' && soldier.status !== 'knighted';
                const promoteCost = rankConfig.promoteCost;
                const canAffordPromote = character.stats.gold >= promoteCost;
                const canDemote = !!rankConfig.prevRank && soldier.status !== 'imprisoned' && soldier.status !== 'knighted';

                return (
                  <div
                    key={soldier.id}
                    className={`rounded-xl border transition-all p-3.5 flex flex-col justify-between gap-3 ${
                      soldier.status === 'knighted'
                        ? 'bg-gradient-to-br from-purple-950/40 via-stone-950 to-stone-950 border-purple-600/50 shadow-md'
                        : soldier.status === 'provincial_head'
                        ? 'bg-gradient-to-br from-emerald-950/40 via-stone-950 to-stone-950 border-emerald-600/50 shadow-md'
                        : soldier.status === 'imprisoned'
                        ? 'bg-gradient-to-br from-red-950/30 via-stone-950 to-stone-950 border-red-800/60 opacity-90'
                        : 'bg-stone-950/80 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    
                    {/* Top Row: Soldier Identity & Status */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          {/* Portrait with rank indicator */}
                          <div 
                            onClick={() => { sound.playClick(); setInspectedSoldier(soldier); }}
                            className="relative w-12 h-12 rounded-xl bg-stone-900 border border-stone-700 flex items-center justify-center text-2xl shadow-inner shrink-0 cursor-pointer hover:scale-105 transition-transform"
                            title="Click to view full martial biography"
                          >
                            {soldier.portrait}
                            <span className="absolute -bottom-1 -right-1 text-[10px] font-mono bg-amber-500 text-stone-950 font-black px-1 rounded-full">
                              T{soldier.rankTier}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 
                                onClick={() => { sound.playClick(); setInspectedSoldier(soldier); }}
                                className="font-bold text-sm text-stone-100 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1 font-cinzel"
                              >
                                {soldier.name}
                              </h4>

                              {/* Status Badges */}
                              {soldier.status === 'knighted' && (
                                <span className="text-[9px] font-black bg-purple-600 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-xs">
                                  <Crown className="w-2.5 h-2.5" />
                                  <span>KNIGHTED NOBLE</span>
                                </span>
                              )}
                              {soldier.status === 'provincial_head' && (
                                <span className="text-[9px] font-black bg-emerald-600 text-stone-950 px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-xs">
                                  <Shield className="w-2.5 h-2.5" />
                                  <span>PROVINCIAL HEAD</span>
                                </span>
                              )}
                              {soldier.status === 'imprisoned' && (
                                <span className="text-[9px] font-black bg-red-700 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-xs">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>IMPRISONED</span>
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-stone-400 flex items-center gap-1.5 flex-wrap mt-0.5">
                              <span className="text-amber-400 font-semibold">{soldier.rank}</span>
                              <span>•</span>
                              <span className="text-stone-500 italic">{soldier.lowBornOrigin}</span>
                            </div>
                          </div>
                        </div>

                        {/* Inspect details button */}
                        <button
                          onClick={() => { sound.playClick(); setInspectedSoldier(soldier); }}
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
                          title="View soldier background"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Combat Stats & Loyalty Meter */}
                      <div className="grid grid-cols-4 gap-1.5 text-center text-xs py-1.5 bg-stone-900/60 rounded-lg border border-stone-800/80 mb-2">
                        <div>
                          <span className="text-[9px] text-stone-500 uppercase block font-semibold">Prowess</span>
                          <span className="font-bold text-red-400 font-mono">⚔️ {soldier.prowess}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-stone-500 uppercase block font-semibold">Martial</span>
                          <span className="font-bold text-amber-400 font-mono">📜 {soldier.martial}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-stone-500 uppercase block font-semibold">Loyalty</span>
                          <span className={`font-bold font-mono ${soldier.loyalty > 60 ? 'text-emerald-400' : soldier.loyalty > 30 ? 'text-amber-400' : 'text-red-400'}`}>
                            {soldier.loyalty}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-stone-500 uppercase block font-semibold">Record</span>
                          <span className="font-bold text-stone-300 font-mono">{soldier.killsCount} 💀</span>
                        </div>
                      </div>

                      {/* Special Martial Traits */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {soldier.specialMartialTraits.map((tName) => {
                          const trait = MARTIAL_TRAITS_CATALOG[tName];
                          return (
                            <span
                              key={tName}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-900 border border-stone-700 text-stone-300 flex items-center gap-1"
                              title={trait ? `${trait.name}: ${trait.description} (${trait.bonus})` : tName}
                            >
                              <span>{trait?.icon || '⚔️'}</span>
                              <span>{tName}</span>
                            </span>
                          );
                        })}
                      </div>

                      {/* Equipment Tier */}
                      <div className="text-[10px] text-stone-400 flex items-center justify-between">
                        <span>Gear: <strong className="text-stone-300">{soldier.equipmentTier}</strong></span>
                        <span className="text-stone-500 font-mono">{soldier.battlesFought} Engagements</span>
                      </div>
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-1.5 flex-wrap">
                      
                      {/* KNIGHTING CEREMONY ACTION */}
                      {soldier.status !== 'knighted' && soldier.status !== 'imprisoned' && (
                        <button
                          onClick={() => handleOpenKnightingDialog(soldier)}
                          className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-700 to-amber-600 hover:from-purple-600 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
                          title="Bestow an imperial knighthood and ennoble this commoner into a noble vassal"
                        >
                          <Crown className="w-3.5 h-3.5 text-amber-300" />
                          <span>Knight Commoner</span>
                        </button>
                      )}

                      {/* If already knighted, option to grant province fief */}
                      {soldier.status === 'knighted' && onGrantProvinceToSoldier && (
                        <button
                          onClick={() => onGrantProvinceToSoldier(soldier)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>Grant Fief</span>
                        </button>
                      )}

                      {/* PROMOTE & DEMOTE BUTTONS */}
                      {soldier.status !== 'imprisoned' && (
                        <div className="flex items-center gap-1">
                          {canPromote && (
                            <button
                              onClick={() => {
                                sound.playChime();
                                onPromoteSoldier(soldier.id);
                              }}
                              disabled={!canAffordPromote}
                              className="px-2 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-200 text-xs font-semibold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                              title={`Promote to ${rankConfig.nextRank} (${promoteCost} 🪙)`}
                            >
                              <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Promote ({promoteCost}🪙)</span>
                            </button>
                          )}

                          {canDemote && (
                            <button
                              onClick={() => {
                                sound.playClick();
                                onDemoteSoldier(soldier.id);
                              }}
                              className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 border border-stone-700 cursor-pointer"
                              title={`Demote to ${rankConfig.prevRank}`}
                            >
                              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                            </button>
                          )}
                        </div>
                      )}

                      {/* APPOINT AS PROVINCIAL HEAD */}
                      {soldier.status !== 'provincial_head' && soldier.status !== 'imprisoned' && (
                        <button
                          onClick={() => setConfirmHead(soldier)}
                          className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700 cursor-pointer flex items-center gap-1"
                          title="Appoint as the military Castellan & Provincial Head of this county"
                        >
                          <UserCheck className="w-3 h-3 text-emerald-400" />
                          <span>Make Head</span>
                        </button>
                      )}

                      {/* IMPRISON & RELEASE TOGGLE */}
                      {soldier.status === 'imprisoned' ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              sound.playChime();
                              onReleaseSoldier(soldier.id, true);
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Release on solemn blood oath of fealty (+25 loyalty)"
                          >
                            <Unlock className="w-3 h-3" />
                            <span>Pardon Oath</span>
                          </button>
                          <button
                            onClick={() => setConfirmExecute(soldier)}
                            className="p-1 rounded-lg bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 cursor-pointer"
                            title="Execute for mutiny"
                          >
                            <Skull className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmImprison(soldier)}
                          className="p-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-500 hover:text-red-400 border border-stone-800 cursor-pointer"
                          title="Imprison in the provincial dungeon"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>
                      )}

                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-stone-950 px-4 py-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400 shrink-0">
          <div className="flex items-center gap-2">
            <span>Treasury: <strong className="text-yellow-400 font-mono">{character.stats.gold} 🪙</strong></span>
            <span>•</span>
            <span>Prestige: <strong className="text-amber-400 font-mono">{character.stats.renown} 👑</strong></span>
          </div>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold transition-colors cursor-pointer"
          >
            Return to Province
          </button>
        </div>

      </div>

      {/* DEDICATED KNIGHTING CEREMONY MODAL */}
      {knightingSoldier && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-stone-900 border border-amber-500/60 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4">
            
            <div className="text-center space-y-1">
              <div className="w-16 h-16 rounded-2xl bg-amber-950/90 border-2 border-amber-500 flex items-center justify-center text-3xl mx-auto shadow-lg animate-pulse">
                👑
              </div>
              <h3 className="text-lg font-bold text-amber-200 font-cinzel">
                Imperial Dubbing & Knighthood Ceremony
              </h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Elevate low-born <strong className="text-stone-200">{knightingSoldier.name}</strong> from common soldier into a sworn noble vassal of the realm.
              </p>
            </div>

            {/* Soldier Martial Resume */}
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-stone-300">
                <span>Humble Origin:</span>
                <span className="font-semibold text-amber-400">{knightingSoldier.lowBornOrigin}</span>
              </div>
              <div className="flex items-center justify-between text-stone-300">
                <span>Battlefield Record:</span>
                <span className="font-mono text-stone-200">{knightingSoldier.battlesFought} Battles, {knightingSoldier.killsCount} Foes Slain</span>
              </div>
              <div className="flex items-center justify-between text-stone-300">
                <span>Martial Traits Bestowed:</span>
                <span className="font-semibold text-purple-300">
                  {knightingSoldier.specialMartialTraits.join(', ')}
                </span>
              </div>
            </div>

            {/* Customization Inputs */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 font-bold mb-1">
                  Exalted Noble Title & Dignity
                </label>
                <input
                  type="text"
                  value={nobleTitleInput}
                  onChange={(e) => setNobleTitleInput(e.target.value)}
                  className="w-full bg-stone-950 text-stone-200 px-3 py-2 rounded-xl border border-stone-700 focus:outline-hidden focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-bold mb-1">
                  Ennobled Dynasty House Name
                </label>
                <input
                  type="text"
                  value={houseNameInput}
                  onChange={(e) => setHouseNameInput(e.target.value)}
                  className="w-full bg-stone-950 text-stone-200 px-3 py-2 rounded-xl border border-stone-700 focus:outline-hidden focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            {/* Rewards Breakdown */}
            <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-700/50 text-[11px] text-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-1 text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Imperial Elevation Benefits:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-stone-300">
                <li>Enters your Court as a permanent <strong>Noble Vassal</strong> (100% Loyalty)</li>
                <li>Inherits their elite martial combat prowess into realm army commands</li>
                <li>Increases Realm Renown by <strong>+25 👑</strong> and Ruler Happiness by <strong>+10</strong></li>
                <li>Can be granted duchies, counties, or commander council positions</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setKnightingSoldier(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmKnighting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Crown className="w-4 h-4" />
                <span>Enact Royal Dubbing</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CONFIRM APPOINT PROVINCIAL HEAD MODAL */}
      {confirmHead && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-emerald-600 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-3 text-xs">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500 flex items-center justify-center text-2xl mx-auto">
                🛡️
              </div>
              <h3 className="text-base font-bold text-emerald-300 font-cinzel">
                Appoint Military Castellan & Head
              </h3>
              <p className="text-stone-400">
                Assign <strong className="text-stone-200">{confirmHead.name}</strong> as the Provincial Head of {province.name}.
              </p>
            </div>

            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-stone-300 space-y-1">
              <div>• Reduces {province.name} unrest by <strong>-25%</strong></div>
              <div>• Boosts provincial garrison levy defense by <strong>+20%</strong></div>
              <div>• Grants {confirmHead.name} 100% eternal loyalty to the Crown</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmHead(null)}
                className="px-3.5 py-1.5 rounded-lg bg-stone-800 text-stone-300 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  sound.playFanfare();
                  onMakeProvincialHead(confirmHead);
                  setConfirmHead(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold cursor-pointer"
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM IMPRISON MODAL */}
      {confirmImprison && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-red-700 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-3 text-xs">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-xl bg-red-950 border border-red-600 flex items-center justify-center text-2xl mx-auto">
                ⛓️
              </div>
              <h3 className="text-base font-bold text-red-300 font-cinzel">
                Imprison Provincial Soldier
              </h3>
              <p className="text-stone-400">
                Lock <strong className="text-stone-200">{confirmImprison.name}</strong> in the provincial dungeon.
              </p>
            </div>

            <p className="text-stone-400 bg-stone-950 p-3 rounded-xl border border-stone-800">
              Imprisoning soldiers prevents sedition and unrest, but lowers garrison morale if unjust.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmImprison(null)}
                className="px-3.5 py-1.5 rounded-lg bg-stone-800 text-stone-300 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onImprisonSoldier(confirmImprison.id);
                  setConfirmImprison(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold cursor-pointer"
              >
                Throw in Dungeon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM EXECUTE MODAL */}
      {confirmExecute && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-red-900 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-3 text-xs">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-2xl mx-auto text-red-400">
                🪓
              </div>
              <h3 className="text-base font-bold text-red-400 font-cinzel">
                Execute for Treason & Mutiny
              </h3>
              <p className="text-stone-400">
                Permanently execute <strong className="text-stone-200">{confirmExecute.name}</strong> on the headsman's block.
              </p>
            </div>

            <p className="text-stone-400 bg-stone-950 p-3 rounded-xl border border-stone-800">
              This increases Imperial Dread (+15) and removes this inmate permanently from the garrison roster.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmExecute(null)}
                className="px-3.5 py-1.5 rounded-lg bg-stone-800 text-stone-300 font-semibold cursor-pointer"
              >
                Spare Life
              </button>
              <button
                onClick={() => {
                  sound.playSword();
                  onExecuteSoldier(confirmExecute.id);
                  setConfirmExecute(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-white font-bold cursor-pointer"
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED SOLDIER BIOGRAPHY MODAL */}
      {inspectedSoldier && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-stone-900 border border-stone-700 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-stone-950 border border-amber-500/60 flex items-center justify-center text-3xl shadow-inner">
                  {inspectedSoldier.portrait}
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-200 font-cinzel">{inspectedSoldier.name}</h3>
                  <div className="text-stone-400 font-semibold">{inspectedSoldier.rank} (Tier {inspectedSoldier.rankTier})</div>
                  <div className="text-[11px] text-stone-500 italic">{inspectedSoldier.lowBornOrigin}</div>
                </div>
              </div>
              <button
                onClick={() => setInspectedSoldier(null)}
                className="p-1 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-2">
              <div className="font-bold text-stone-300 font-cinzel">Martial Chronicles & Backstory</div>
              <p className="text-stone-400 leading-relaxed text-[11px]">
                {inspectedSoldier.backstory}
              </p>
            </div>

            {/* Combat Specs */}
            <div className="space-y-1.5">
              <div className="font-bold text-stone-300">Special Martial Traits & Disciplines</div>
              <div className="space-y-1">
                {inspectedSoldier.specialMartialTraits.map(tName => {
                  const trait = MARTIAL_TRAITS_CATALOG[tName];
                  return (
                    <div key={tName} className="p-2 bg-stone-950 rounded-lg border border-stone-800 text-[11px] space-y-0.5">
                      <div className="font-bold text-amber-300 flex items-center gap-1">
                        <span>{trait?.icon || '⚔️'}</span>
                        <span>{tName}</span>
                        <span className="text-[9px] text-stone-500 font-normal">({trait?.category})</span>
                      </div>
                      <div className="text-stone-400">{trait?.description}</div>
                      <div className="text-emerald-400 font-mono text-[10px] font-semibold">{trait?.bonus}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions in drawer */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-800">
              <button
                onClick={() => {
                  sound.playCoin();
                  onUpgradeSoldierGear(inspectedSoldier.id, 15);
                  setInspectedSoldier(prev => prev ? { ...prev, equipmentTier: 'Masterwork Gilded Plate', prowess: prev.prowess + 8, loyalty: 100 } : null);
                }}
                disabled={character.stats.gold < 15 || inspectedSoldier.equipmentTier === 'Masterwork Gilded Plate'}
                className="px-3 py-1.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-stone-950 font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1"
                title="Spend 15 gold to gift masterwork weapons and gilded plate"
              >
                <Hammer className="w-3.5 h-3.5" />
                <span>Gift Arms (15 🪙)</span>
              </button>

              <button
                onClick={() => setInspectedSoldier(null)}
                className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
