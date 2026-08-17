import React, { useState } from 'react';
import { Character, DynastyArtifact, Vassal } from '../../types';
import { 
  Crown, 
  Shield, 
  Sparkles, 
  Coins, 
  Flame, 
  Award, 
  Gem, 
  BookOpen, 
  Hammer, 
  CheckCircle2, 
  Plus, 
  ChevronRight, 
  Trash2, 
  Gift, 
  RefreshCw,
  TrendingUp,
  Heart,
  Swords
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { REGALIA_ARTISANS, REGALIA_RECIPES, RegaliaArtisanOption } from '../../data/intrigueAndFactionsData';

interface RoyalArtifactsSubTabProps {
  character: Character;
  dynastyArtifacts: DynastyArtifact[];
  vassals?: Vassal[];
  onUpdateArtifacts: (artifacts: DynastyArtifact[]) => void;
  onUpdateCharacter: (updates: Partial<Character>) => void;
  onAddChronicle: (entry: { title: string; description: string; type: 'court' | 'realm' | 'war' | 'diplomacy' | 'intrigue' }) => void;
}

export const RoyalArtifactsSubTab: React.FC<RoyalArtifactsSubTabProps> = ({
  character,
  dynastyArtifacts,
  vassals = [],
  onUpdateArtifacts,
  onUpdateCharacter,
  onAddChronicle
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'Crown' | 'Scepter' | 'Armor' | 'Relic' | 'Weapon'>('all');
  const [showCommissionModal, setShowCommissionModal] = useState<boolean>(false);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Commissioning Modal Form State
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState<number>(0);
  const [selectedArtisanId, setSelectedArtisanId] = useState<string>(REGALIA_ARTISANS[1].id);
  const [selectedFocusId, setSelectedFocusId] = useState<string>(REGALIA_RECIPES[0].focusOptions[0].id);
  const [customArtifactName, setCustomArtifactName] = useState<string>('');

  const selectedRecipe = REGALIA_RECIPES[selectedRecipeIndex];
  const selectedArtisan = REGALIA_ARTISANS.find(a => a.id === selectedArtisanId) || REGALIA_ARTISANS[0];

  // Calculate Kingdom-Wide Active Regalia Bonuses
  const equippedArtifacts = dynastyArtifacts.filter(a => a.isEquipped);

  const totalVassalOpinionBonus = equippedArtifacts.reduce((sum, a) => sum + (a.effects.vassalOpinionBonus || 0), 0);
  const totalTaxRateBonus = equippedArtifacts.reduce((sum, a) => sum + (a.effects.taxRateBonusPercent || 0), 0);
  const totalRenownBonus = equippedArtifacts.reduce((sum, a) => sum + (a.effects.renown || 0), 0);
  const totalGoldIncome = equippedArtifacts.reduce((sum, a) => sum + (a.effects.goldIncome || 0), 0);
  const totalMartialBonus = equippedArtifacts.reduce((sum, a) => sum + (a.effects.martial || 0), 0);
  const totalDiplomacyBonus = equippedArtifacts.reduce((sum, a) => sum + (a.effects.diplomacy || 0), 0);
  const totalIntellectBonus = equippedArtifacts.reduce((sum, a) => sum + (a.effects.intellect || 0), 0);

  // Toggle Equip Status
  const handleToggleEquip = (artifact: DynastyArtifact) => {
    sound.playTome();

    // If equipping, unequip others in the same slot if head/mainHand/armor
    const slot = artifact.slot || (artifact.type === 'Crown' ? 'head' : artifact.type === 'Armor' ? 'armor' : 'relic');
    const isNowEquipped = !artifact.isEquipped;

    const updated = dynastyArtifacts.map(a => {
      if (a.id === artifact.id) {
        return { ...a, isEquipped: isNowEquipped };
      }
      // If equipping a slot-exclusive item, unequip previous one of same slot
      if (isNowEquipped && (slot === 'head' || slot === 'armor' || slot === 'mainHand')) {
        const itemSlot = a.slot || (a.type === 'Crown' ? 'head' : a.type === 'Armor' ? 'armor' : 'relic');
        if (itemSlot === slot && a.id !== artifact.id) {
          return { ...a, isEquipped: false };
        }
      }
      return a;
    });

    onUpdateArtifacts(updated);
    setFeedbackMessage(
      isNowEquipped
        ? `Equipped ${artifact.name}! Active kingdom bonuses updated.`
        : `Unequipped ${artifact.name}. Returned to the royal vault.`
    );
  };

  // Reforge / Polish Artifact
  const handleReforgeArtifact = (artifact: DynastyArtifact) => {
    const cost = 40;
    if (character.stats.gold < cost) {
      sound.playError();
      setFeedbackMessage('Insufficient gold to reforge royal regalia (40 gold required).');
      return;
    }

    sound.playTrumpet();
    onUpdateCharacter({
      stats: {
        ...character.stats,
        gold: character.stats.gold - cost
      }
    });

    const updated = dynastyArtifacts.map(a => {
      if (a.id === artifact.id) {
        return {
          ...a,
          effects: {
            ...a.effects,
            renown: (a.effects.renown || 10) + 5,
            vassalOpinionBonus: (a.effects.vassalOpinionBonus || 0) + 3,
            goldIncome: (a.effects.goldIncome || 0) + 5,
            martial: a.effects.martial ? a.effects.martial + 2 : undefined,
            diplomacy: a.effects.diplomacy ? a.effects.diplomacy + 2 : undefined
          },
          qualityScore: Math.min(100, (a.qualityScore || 70) + 8)
        };
      }
      return a;
    });

    onUpdateArtifacts(updated);
    setFeedbackMessage(`Reforged and polished ${artifact.name}! Increased regalia quality and persistent bonuses.`);

    onAddChronicle({
      title: `✨ Royal Regalia Reforged: ${artifact.name}`,
      description: `Imperial artisans re-engraved ${artifact.name}, enhancing its splendor and kingdom-wide prestige.`,
      type: 'court'
    });
  };

  // Commission Royal Regalia Submit
  const handleCommissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (character.stats.gold < selectedArtisan.costGold) {
      sound.playError();
      setFeedbackMessage(`Insufficient gold to commission this artisan (${selectedArtisan.costGold} gold required).`);
      return;
    }

    sound.playFanfare();

    // Deduct cost
    onUpdateCharacter({
      stats: {
        ...character.stats,
        gold: character.stats.gold - selectedArtisan.costGold
      }
    });

    // Roll Rarity
    const rand = Math.random() * 100;
    let chosenRarity: DynastyArtifact['rarity'] = 'Rare';
    if (rand < selectedArtisan.rarityChance.mythic) chosenRarity = 'Mythic';
    else if (rand < selectedArtisan.rarityChance.mythic + selectedArtisan.rarityChance.legendary) chosenRarity = 'Legendary';
    else if (rand < selectedArtisan.rarityChance.mythic + selectedArtisan.rarityChance.legendary + selectedArtisan.rarityChance.epic) chosenRarity = 'Epic';
    else if (rand < selectedArtisan.rarityChance.mythic + selectedArtisan.rarityChance.legendary + selectedArtisan.rarityChance.epic + selectedArtisan.rarityChance.rare) chosenRarity = 'Rare';
    else chosenRarity = 'Common';

    // Generate Name
    const defaultName = customArtifactName.trim() || `${chosenRarity} ${selectedRecipe.title.split(' or ')[0]}`;

    // Generate Effects based on recipe & rarity multiplier
    const mult = chosenRarity === 'Mythic' ? 2.5 : chosenRarity === 'Legendary' ? 2.0 : chosenRarity === 'Epic' ? 1.5 : 1.0;
    
    const newArtifact: DynastyArtifact = {
      id: `art_${Date.now()}`,
      name: defaultName,
      type: selectedRecipe.type,
      rarity: chosenRarity,
      icon: selectedRecipe.icon,
      slot: selectedRecipe.slot,
      effects: {
        vassalOpinionBonus: selectedRecipe.type === 'Crown' ? Math.round(15 * mult) : Math.round(6 * mult),
        taxRateBonusPercent: selectedRecipe.type === 'Scepter' ? Math.round(12 * mult) : Math.round(4 * mult),
        renown: Math.round(20 * mult),
        goldIncome: Math.round(20 * mult),
        martial: selectedRecipe.type === 'Armor' ? Math.round(18 * mult) : Math.round(5 * mult),
        diplomacy: selectedRecipe.type === 'Crown' ? Math.round(15 * mult) : Math.round(8 * mult),
        intellect: selectedRecipe.type === 'Relic' ? Math.round(18 * mult) : Math.round(6 * mult),
        prowess: selectedRecipe.type === 'Armor' ? Math.round(16 * mult) : undefined
      },
      description: `${selectedRecipe.baseDescription} Crafted by ${selectedArtisan.name}.`,
      history: `Commissioned in the year of the High Crown by sovereign royal charter.`,
      isEquipped: true,
      commissionYear: 1046,
      artisanName: selectedArtisan.name,
      qualityScore: Math.round(selectedArtisan.successQualityRange[0] + Math.random() * (selectedArtisan.successQualityRange[1] - selectedArtisan.successQualityRange[0]))
    };

    onUpdateArtifacts([newArtifact, ...dynastyArtifacts]);
    setShowCommissionModal(false);
    setCustomArtifactName('');

    setFeedbackMessage(`Forged ${newArtifact.name} (${chosenRarity})! Equipped to the royal dais.`);

    onAddChronicle({
      title: `👑 Royal Regalia Commissioned: ${newArtifact.name}`,
      description: `${selectedArtisan.name} delivered a masterwork ${chosenRarity} ${newArtifact.type} to the imperial treasury vault.`,
      type: 'court'
    });
  };

  // Filtered Artifacts
  const filteredArtifacts = dynastyArtifacts.filter(a => {
    if (activeFilter === 'all') return true;
    return a.type === activeFilter;
  });

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-16 font-sans">
      
      {/* Top Banner: Kingdom-Wide Regalia Impact */}
      <div className="bg-gradient-to-r from-amber-950/80 via-stone-900 to-yellow-950/80 border border-amber-600/50 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-stone-950 shadow-lg">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-300 font-cinzel tracking-wide">
                Royal Regalia & Treasury Vault
              </h2>
              <p className="text-xs text-stone-300">
                Wield sacred crowns, sovereign scepters, and enchanted dragon plate providing persistent kingdom bonuses.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setShowCommissionModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-extrabold text-xs shadow-lg cursor-pointer transition-all flex items-center gap-2"
          >
            <Hammer className="w-4 h-4" />
            <span>Commission Royal Regalia</span>
          </button>
        </div>

        {/* Kingdom-Wide Aggregate Regalia Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-amber-900/40 text-xs">
          <div className="bg-stone-950/70 border border-amber-900/40 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-stone-400 block font-medium">Vassal Opinion</span>
              <span className="text-sm font-extrabold text-amber-300">+{totalVassalOpinionBonus} Fealty</span>
            </div>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>

          <div className="bg-stone-950/70 border border-amber-900/40 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-stone-400 block font-medium">Kingdom Tax Rate</span>
              <span className="text-sm font-extrabold text-emerald-300">+{totalTaxRateBonus}% Income</span>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="bg-stone-950/70 border border-amber-900/40 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-stone-400 block font-medium">Crown Renown / Yr</span>
              <span className="text-sm font-extrabold text-yellow-300">+{totalRenownBonus} Renown</span>
            </div>
            <Award className="w-4 h-4 text-yellow-400" />
          </div>

          <div className="bg-stone-950/70 border border-amber-900/40 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-stone-400 block font-medium">Regalia Martial</span>
              <span className="text-sm font-extrabold text-rose-300">+{totalMartialBonus} Command</span>
            </div>
            <Swords className="w-4 h-4 text-rose-400" />
          </div>
        </div>
      </div>

      {/* Feedback Message */}
      {feedbackMessage && (
        <div className="p-3 bg-amber-950/70 border border-amber-600/70 text-amber-200 text-xs rounded-xl flex items-start gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="font-medium">{feedbackMessage}</p>
        </div>
      )}

      {/* Equipped Regalia Dais (Slots) */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="font-bold text-sm text-stone-100 font-cinzel flex items-center gap-2">
          <Gem className="w-4 h-4 text-amber-400" />
          <span>Active Royal Dais (Equipped Regalia)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Head Slot: Crown */}
          {(() => {
            const headItem = equippedArtifacts.find(a => a.slot === 'head' || a.type === 'Crown');
            return (
              <div className="bg-stone-950/80 border border-amber-700/40 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-950/40 border border-amber-600/50 flex items-center justify-center text-2xl shadow">
                    {headItem ? headItem.icon : '👑'}
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Head Slot (Crown)</span>
                    <h4 className="font-bold text-xs text-stone-100 truncate max-w-[140px]">
                      {headItem ? headItem.name : 'No Crown Equipped'}
                    </h4>
                    {headItem && (
                      <span className="text-[10px] text-emerald-400 font-semibold block">
                        +{headItem.effects.vassalOpinionBonus || 15} Vassal Opinion
                      </span>
                    )}
                  </div>
                </div>
                {headItem && (
                  <button
                    onClick={() => handleToggleEquip(headItem)}
                    className="text-stone-400 hover:text-rose-400 text-xs font-bold cursor-pointer"
                  >
                    Unequip
                  </button>
                )}
              </div>
            );
          })()}

          {/* Main Hand Slot: Scepter / Weapon */}
          {(() => {
            const handItem = equippedArtifacts.find(a => a.slot === 'mainHand' || a.type === 'Scepter' || a.type === 'Weapon');
            return (
              <div className="bg-stone-950/80 border border-amber-700/40 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-950/40 border border-amber-600/50 flex items-center justify-center text-2xl shadow">
                    {handItem ? handItem.icon : '🪄'}
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Main Hand (Scepter)</span>
                    <h4 className="font-bold text-xs text-stone-100 truncate max-w-[140px]">
                      {handItem ? handItem.name : 'No Scepter Equipped'}
                    </h4>
                    {handItem && (
                      <span className="text-[10px] text-emerald-400 font-semibold block">
                        +{handItem.effects.taxRateBonusPercent || 10}% Tax Rate
                      </span>
                    )}
                  </div>
                </div>
                {handItem && (
                  <button
                    onClick={() => handleToggleEquip(handItem)}
                    className="text-stone-400 hover:text-rose-400 text-xs font-bold cursor-pointer"
                  >
                    Unequip
                  </button>
                )}
              </div>
            );
          })()}

          {/* Armor Slot: Plate / Cuirass */}
          {(() => {
            const armorItem = equippedArtifacts.find(a => a.slot === 'armor' || a.type === 'Armor');
            return (
              <div className="bg-stone-950/80 border border-amber-700/40 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-950/40 border border-amber-600/50 flex items-center justify-center text-2xl shadow">
                    {armorItem ? armorItem.icon : '🛡️'}
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Body Slot (Armor)</span>
                    <h4 className="font-bold text-xs text-stone-100 truncate max-w-[140px]">
                      {armorItem ? armorItem.name : 'No Armor Equipped'}
                    </h4>
                    {armorItem && (
                      <span className="text-[10px] text-emerald-400 font-semibold block">
                        +{armorItem.effects.martial || 15} Martial Prowess
                      </span>
                    )}
                  </div>
                </div>
                {armorItem && (
                  <button
                    onClick={() => handleToggleEquip(armorItem)}
                    className="text-stone-400 hover:text-rose-400 text-xs font-bold cursor-pointer"
                  >
                    Unequip
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Artifact Inventory & Filter Bar */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-sm text-stone-100 font-cinzel flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Treasury Relics & Artifact Collection ({dynastyArtifacts.length})</span>
          </h3>

          <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
            {(['all', 'Crown', 'Scepter', 'Armor', 'Relic'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => { sound.playClick(); setActiveFilter(filter); }}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-colors cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-amber-600 text-stone-950 shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {filter === 'all' ? 'All Items' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Artifact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredArtifacts.map(artifact => {
            const rarityColors: Record<string, { badge: string; border: string }> = {
              Common: { badge: 'bg-stone-800 text-stone-300', border: 'border-stone-800' },
              Rare: { badge: 'bg-blue-950 text-blue-300 border border-blue-600/40', border: 'border-blue-900/40' },
              Epic: { badge: 'bg-purple-950 text-purple-300 border border-purple-600/40', border: 'border-purple-900/40' },
              Legendary: { badge: 'bg-amber-950 text-amber-300 border border-amber-600/50', border: 'border-amber-600/40' },
              Mythic: { badge: 'bg-rose-950 text-rose-300 border border-rose-600/60 animate-pulse', border: 'border-rose-600/50' }
            };

            const styling = rarityColors[artifact.rarity] || rarityColors.Rare;

            return (
              <div
                key={artifact.id}
                className={`bg-stone-950/80 rounded-2xl p-4 border ${styling.border} shadow-lg space-y-3 relative group transition-all`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-stone-900 border border-stone-700 flex items-center justify-center text-3xl shadow">
                      {artifact.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs sm:text-sm text-stone-100 font-cinzel">{artifact.name}</h4>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${styling.badge}`}>
                          {artifact.rarity}
                        </span>
                        <span className="text-[10px] text-stone-400 font-medium">{artifact.type}</span>
                        {artifact.qualityScore && (
                          <span className="text-[10px] text-amber-400/90 font-semibold">
                            ★ {artifact.qualityScore} Quality
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    artifact.isEquipped ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-stone-800 text-stone-500'
                  }`}>
                    {artifact.isEquipped ? 'Equipped' : 'In Vault'}
                  </span>
                </div>

                <p className="text-[11px] text-stone-400 leading-snug">
                  {artifact.description}
                </p>

                {/* Artifact Stat Modifiers */}
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {artifact.effects.vassalOpinionBonus && (
                    <span className="px-2 py-0.5 bg-rose-950/60 border border-rose-800/40 text-rose-300 rounded font-semibold">
                      +{artifact.effects.vassalOpinionBonus} Vassal Opinion
                    </span>
                  )}
                  {artifact.effects.taxRateBonusPercent && (
                    <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 rounded font-semibold">
                      +{artifact.effects.taxRateBonusPercent}% Tax Rate
                    </span>
                  )}
                  {artifact.effects.renown && (
                    <span className="px-2 py-0.5 bg-amber-950/60 border border-amber-800/40 text-amber-300 rounded font-semibold">
                      +{artifact.effects.renown} Renown/Yr
                    </span>
                  )}
                  {artifact.effects.martial && (
                    <span className="px-2 py-0.5 bg-red-950/60 border border-red-800/40 text-red-300 rounded font-semibold">
                      +{artifact.effects.martial} Martial
                    </span>
                  )}
                  {artifact.effects.diplomacy && (
                    <span className="px-2 py-0.5 bg-yellow-950/60 border border-yellow-800/40 text-yellow-300 rounded font-semibold">
                      +{artifact.effects.diplomacy} Diplomacy
                    </span>
                  )}
                  {artifact.effects.intellect && (
                    <span className="px-2 py-0.5 bg-blue-950/60 border border-blue-800/40 text-blue-300 rounded font-semibold">
                      +{artifact.effects.intellect} Intellect
                    </span>
                  )}
                </div>

                {/* Actions: Equip, Reforge */}
                <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleReforgeArtifact(artifact)}
                    className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer border border-stone-700 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3 text-amber-400" />
                    <span>Reforge (40 Gold)</span>
                  </button>

                  <button
                    onClick={() => handleToggleEquip(artifact)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      artifact.isEquipped
                        ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/50'
                        : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow'
                    }`}
                  >
                    {artifact.isEquipped ? 'Unequip' : 'Equip on Dais'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Commission Modal */}
      {showCommissionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border-2 border-amber-600/70 rounded-2xl max-w-xl w-full p-5 text-stone-100 shadow-2xl space-y-4 max-h-[90vh] flex flex-col font-sans">
            
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Hammer className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-amber-300 font-cinzel">
                  Commission Royal Regalia
                </h3>
              </div>
              <button
                onClick={() => setShowCommissionModal(false)}
                className="text-stone-400 hover:text-stone-100 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCommissionSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
              
              {/* Step 1: Select Regalia Archetype */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-300 block">1. Select Regalia Archetype</label>
                <div className="grid grid-cols-2 gap-2">
                  {REGALIA_RECIPES.map((rec, idx) => (
                    <button
                      type="button"
                      key={rec.type}
                      onClick={() => {
                        setSelectedRecipeIndex(idx);
                        setSelectedFocusId(rec.focusOptions[0].id);
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        selectedRecipeIndex === idx
                          ? 'bg-amber-950/70 border-amber-500 text-amber-200 ring-1 ring-amber-500'
                          : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:bg-stone-800'
                      }`}
                    >
                      <span className="text-xl">{rec.icon}</span>
                      <div>
                        <span className="font-bold text-xs block text-stone-100">{rec.type}</span>
                        <span className="text-[10px] text-stone-400 line-clamp-1">{rec.slot} slot</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Artisan Tier */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-300 block">2. Commission Master Artisan</label>
                <div className="space-y-2">
                  {REGALIA_ARTISANS.map(artisan => (
                    <div
                      key={artisan.id}
                      onClick={() => setSelectedArtisanId(artisan.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        selectedArtisanId === artisan.id
                          ? 'bg-amber-950/70 border-amber-500 text-stone-100 ring-1 ring-amber-500'
                          : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:bg-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{artisan.portrait}</span>
                        <div>
                          <h4 className="font-bold text-xs text-amber-200">{artisan.name}</h4>
                          <p className="text-[10px] text-stone-400">{artisan.title}</p>
                          <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                            {artisan.tier} Tier (Quality: {artisan.successQualityRange.join('-')}%)
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-extrabold text-amber-400 block">{artisan.costGold} Gold</span>
                        <span className="text-[10px] text-stone-400">Commission Fee</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3: Select Inscription / Focus */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-300 block">3. Inscription & Enchantment Focus</label>
                <div className="space-y-1.5">
                  {selectedRecipe.focusOptions.map(opt => (
                    <label
                      key={opt.id}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                        selectedFocusId === opt.id
                          ? 'bg-amber-950/50 border-amber-500 text-amber-200'
                          : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="focusOption"
                        checked={selectedFocusId === opt.id}
                        onChange={() => setSelectedFocusId(opt.id)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-medium text-xs">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 4: Regalia Title / Custom Name */}
              <div className="space-y-1">
                <label className="font-bold text-stone-300 block">4. Item Title (Optional)</label>
                <input
                  type="text"
                  placeholder={`e.g. ${selectedRecipe.title.split(' or ')[0]}`}
                  value={customArtifactName}
                  onChange={(e) => setCustomArtifactName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-stone-400 text-xs block">Required Vault Treasury:</span>
                  <span className="text-amber-400 font-extrabold text-sm">{selectedArtisan.costGold} Gold</span>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-extrabold text-xs shadow-lg cursor-pointer transition-all"
                >
                  Forge & Commission
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
