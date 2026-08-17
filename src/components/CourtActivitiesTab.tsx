import React, { useState } from 'react';
import { 
  Character, 
  CharacterNemesis, 
  CrusadeState, 
  DynastyArtifact, 
  EpidemicState, 
  GreatWonder, 
  HookSecret, 
  ImperialEdict, 
  NomadInvasionState, 
  RealmNPC, 
  SpymasterTask, 
  Vassal, 
  VassalFaction 
} from '../types';
import { 
  Wine, 
  Compass, 
  Sparkles, 
  Shield, 
  Scale, 
  Crown, 
  Coins, 
  Heart, 
  Flame,
  CheckCircle,
  Eye,
  Users,
  Key,
  BookOpen,
  Gem,
  Swords,
  Building2,
  Biohazard,
  Cross,
  Skull
} from 'lucide-react';
import { sound } from '../utils/audio';
import { CourtIntrigueSubTab } from './court/CourtIntrigueSubTab';
import { VassalFactionsSubTab } from './court/VassalFactionsSubTab';
import { ImperialEdictsSubTab } from './court/ImperialEdictsSubTab';
import { RoyalArtifactsSubTab } from './court/RoyalArtifactsSubTab';

interface CourtActivitiesTabProps {
  character: Character;
  vassals: Vassal[];
  realmNPCs?: RealmNPC[];
  spymasterTask?: SpymasterTask;
  hooksAndSecrets?: HookSecret[];
  vassalFactions?: VassalFaction[];
  imperialEdicts?: ImperialEdict[];
  dynastyArtifacts?: DynastyArtifact[];
  greatWonders?: GreatWonder[];
  crusadeState?: CrusadeState;
  epidemicState?: EpidemicState;
  nomadInvasion?: NomadInvasionState;
  activeNemeses?: CharacterNemesis[];
  totalArmyPower?: number;
  onHostFeast: (cost: number) => void;
  onGoHunting: (cost: number) => void;
  onGoPilgrimage: (cost: number) => void;
  onHostTournament: (cost: number) => void;
  onConductSpeciesCeremony: (cost: number) => void;
  onAdministerJustice: (decisionId: string, outcome: { gold?: number; happiness?: number; renown?: number; unrest?: number }) => void;
  onOpenFeastModal?: () => void;
  onOpenTournamentModal?: () => void;
  onOpenPilgrimageModal?: () => void;
  onOpenWondersModal?: () => void;
  onOpenCrusadeModal?: () => void;
  onOpenPlagueModal?: () => void;
  onOpenNomadModal?: () => void;
  onOpenNemesisModal?: () => void;
  onUpdateSpymasterTask?: (task: SpymasterTask) => void;
  onUpdateHooksAndSecrets?: (hooks: HookSecret[]) => void;
  onUpdateFactions?: (factions: VassalFaction[]) => void;
  onUpdateImperialEdicts?: (edicts: ImperialEdict[]) => void;
  onUpdateArtifacts?: (artifacts: DynastyArtifact[]) => void;
  onUpdateCharacter?: (updates: Partial<Character>) => void;
  onUpdateVassals?: (vassals: Vassal[]) => void;
  onAddChronicle?: (entry: { title: string; description: string; type: 'intrigue' | 'diplomacy' | 'war' | 'court' | 'realm' }) => void;
  onTriggerCivilWarBattle?: (faction: VassalFaction) => void;
}

export const CourtActivitiesTab: React.FC<CourtActivitiesTabProps> = ({
  character,
  vassals,
  realmNPCs = [],
  spymasterTask = { mission: 'discover_plot', progress: 20, turnsRemaining: 2, successChance: 80, description: 'Investigating court whispers.' },
  hooksAndSecrets = [],
  vassalFactions = [],
  imperialEdicts = [],
  dynastyArtifacts = [],
  greatWonders = [],
  crusadeState,
  epidemicState,
  nomadInvasion,
  activeNemeses = [],
  totalArmyPower = 1200,
  onHostFeast,
  onGoHunting,
  onGoPilgrimage,
  onHostTournament,
  onConductSpeciesCeremony,
  onAdministerJustice,
  onOpenFeastModal,
  onOpenTournamentModal,
  onOpenPilgrimageModal,
  onOpenWondersModal,
  onOpenCrusadeModal,
  onOpenPlagueModal,
  onOpenNomadModal,
  onOpenNemesisModal,
  onUpdateSpymasterTask = () => {},
  onUpdateHooksAndSecrets = () => {},
  onUpdateFactions = () => {},
  onUpdateImperialEdicts = () => {},
  onUpdateArtifacts = () => {},
  onUpdateCharacter = () => {},
  onUpdateVassals = () => {},
  onAddChronicle = () => {},
  onTriggerCivilWarBattle
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'activities' | 'intrigue' | 'factions' | 'edicts' | 'artifacts' | 'epochs'>('activities');
  const [activeJusticeCase, setActiveJusticeCase] = useState<{
    id: string;
    title: string;
    description: string;
    petitioner: string;
    options: { text: string; outcome: { gold?: number; happiness?: number; renown?: number; unrest?: number } }[];
  } | null>(null);

  const courtCases = [
    {
      id: 'case_1',
      title: 'The Merchant’s Grain Hoard',
      petitioner: 'Guildmaster Bartholomew',
      description: 'A wealthy grain merchant bought all the barley reserves in the lower province before winter and is selling it at triple the normal price. Starving peasants demand price controls.',
      options: [
        {
          text: 'Seize the grain and distribute it freely to the hungry poor (+25 Joy, -Unrest)',
          outcome: { happiness: 25, unrest: -15, renown: 15 }
        },
        {
          text: 'Uphold the merchant’s contract rights and tax 20% of his profits (+80 Gold)',
          outcome: { gold: 80, happiness: -10, renown: 5 }
        },
        {
          text: 'Fine the merchant heavily for price gouging and set fair grain tariffs (+50 Gold, +10 Joy)',
          outcome: { gold: 50, happiness: 10, renown: 10, unrest: -5 }
        }
      ]
    },
    {
      id: 'case_2',
      title: 'The Border Witchcraft Accusation',
      petitioner: 'Father Anselm of the Church',
      description: 'A village priest accuses an elderly herbalist of using unnatural witchcraft to cause a cow to produce sour milk. The herbalist claims she only cured the village children of fever.',
      options: [
        {
          text: 'Declare the herbalist innocent and appoint her as provincial apothecary (+15 Mana, +10 Joy)',
          outcome: { happiness: 10, renown: 10 }
        },
        {
          text: 'Rule in favor of the Church to preserve clerical loyalty (+20 Piety)',
          outcome: { renown: 10, happiness: -5 }
        },
        {
          text: 'Order them to work together to establish a healing hospice (-20 Gold, +20 Prosperity)',
          outcome: { gold: -20, happiness: 15, renown: 15 }
        }
      ]
    }
  ];

  // Danger check for factions badge
  const hasDangerousFaction = vassalFactions.some(f => {
    const memberVassals = vassals.filter(v => v.faction === f.kind || f.memberVassalIds.includes(v.id));
    const factionTroops = memberVassals.reduce((sum, v) => sum + (v.troops || 400), 0);
    return Math.round((factionTroops / Math.max(800, totalArmyPower)) * 100) >= 50;
  });

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-20">
      
      {/* Sub-Tab Navigation Bar */}
      <div className="bg-stone-900/90 rounded-2xl p-1.5 border border-stone-800 shadow-xl flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => {
            sound.playClick();
            setActiveSubTab('activities');
          }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold font-cinzel flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'activities'
              ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-stone-950 shadow-md scale-100'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
          }`}
        >
          <Wine className="w-4 h-4" />
          <span>Feasts & Rites</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveSubTab('intrigue');
          }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold font-cinzel flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
            activeSubTab === 'intrigue'
              ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md scale-100'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Intrigue & Spies</span>
          {hooksAndSecrets.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 text-[10px] font-extrabold">
              {hooksAndSecrets.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveSubTab('factions');
          }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold font-cinzel flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
            activeSubTab === 'factions'
              ? 'bg-gradient-to-r from-red-700 to-amber-700 text-white shadow-md scale-100'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Factions</span>
          {hasDangerousFaction && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping ml-1" />
          )}
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveSubTab('edicts');
          }}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold font-cinzel flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'edicts'
              ? 'bg-gradient-to-r from-amber-700 to-stone-700 text-amber-100 shadow-md scale-100'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Imperial Edicts</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveSubTab('epochs');
          }}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold font-cinzel flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
            activeSubTab === 'epochs'
              ? 'bg-gradient-to-r from-rose-700 via-stone-800 to-amber-700 text-amber-100 shadow-md scale-100 font-extrabold'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
          }`}
        >
          <Swords className="w-4 h-4 text-rose-400" />
          <span>Epochs & Crises</span>
          {(crusadeState?.isActive || epidemicState?.isActive || nomadInvasion?.isActive) && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping ml-1" />
          )}
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveSubTab('artifacts');
          }}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold font-cinzel flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
            activeSubTab === 'artifacts'
              ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-stone-950 shadow-md scale-100 font-extrabold'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
          }`}
        >
          <Gem className="w-4 h-4 text-amber-400" />
          <span>Artifacts & Regalia</span>
          {dynastyArtifacts.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-stone-950 text-amber-400 text-[10px] font-extrabold border border-amber-500/40">
              {dynastyArtifacts.length}
            </span>
          )}
        </button>
      </div>

      {/* 0. Royal Artifacts & Regalia Sub-Tab */}
      {activeSubTab === 'artifacts' && (
        <RoyalArtifactsSubTab
          character={character}
          dynastyArtifacts={dynastyArtifacts}
          vassals={vassals}
          onUpdateArtifacts={onUpdateArtifacts}
          onUpdateCharacter={onUpdateCharacter}
          onAddChronicle={onAddChronicle}
        />
      )}

      {/* 1. Intrigue Sub-Tab */}
      {activeSubTab === 'intrigue' && (
        <CourtIntrigueSubTab
          character={character}
          vassals={vassals}
          realmNPCs={realmNPCs}
          spymasterTask={spymasterTask}
          hooksAndSecrets={hooksAndSecrets}
          onUpdateSpymasterTask={onUpdateSpymasterTask}
          onUpdateHooksAndSecrets={onUpdateHooksAndSecrets}
          onUpdateCharacter={onUpdateCharacter}
          onUpdateVassals={onUpdateVassals}
          onAddChronicle={onAddChronicle}
        />
      )}

      {/* 2. Vassal Factions Sub-Tab */}
      {activeSubTab === 'factions' && (
        <VassalFactionsSubTab
          character={character}
          vassals={vassals}
          factions={vassalFactions}
          hooksAndSecrets={hooksAndSecrets}
          totalArmyPower={totalArmyPower}
          onUpdateFactions={onUpdateFactions}
          onUpdateVassals={onUpdateVassals}
          onUpdateCharacter={onUpdateCharacter}
          onUpdateHooksAndSecrets={onUpdateHooksAndSecrets}
          onAddChronicle={onAddChronicle}
          onTriggerCivilWarBattle={onTriggerCivilWarBattle}
        />
      )}

      {/* 3. Imperial Decrees Sub-Tab */}
      {activeSubTab === 'edicts' && (
        <ImperialEdictsSubTab
          character={character}
          imperialEdicts={imperialEdicts}
          onUpdateImperialEdicts={onUpdateImperialEdicts}
          onUpdateCharacter={onUpdateCharacter}
          onAddChronicle={onAddChronicle}
        />
      )}

      {/* 3.5 Epochs & Crises Sub-Tab */}
      {activeSubTab === 'epochs' && (
        <div className="space-y-4">
          <div className="bg-stone-900/90 rounded-2xl p-5 border border-rose-900/50 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-rose-200 font-cinzel flex items-center gap-2">
                  <Swords className="w-5 h-5 text-rose-400" />
                  Great Epochs, Holy Crusades & Global Crises
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Confront monumental world events, epic crusades, sweeping plagues, nomadic hordes, and royal megaprojects.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Crusade Crisis Card */}
              <div className="p-4 rounded-xl bg-stone-950/90 border border-amber-800/60 hover:border-amber-500 transition-all flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-amber-200 flex items-center gap-1.5">
                      <Cross className="w-4 h-4 text-amber-400" /> Holy Crusade
                    </span>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${crusadeState?.isActive ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse' : 'bg-stone-800 text-stone-400'}`}>
                      {crusadeState?.isActive ? 'Active Crusade' : 'Latent Era'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 leading-snug">
                    {crusadeState?.title || 'The High Pontiff calls for a great crusade to reclaim the holy sanctuaries.'}
                  </p>
                  {crusadeState?.isActive && (
                    <div className="text-[11px] font-mono text-amber-300">
                      War Score: {crusadeState.warScore}% • Pledged Knights: {crusadeState.pledgedKnights}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    sound.playFanfare();
                    if (onOpenCrusadeModal) onOpenCrusadeModal();
                  }}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 text-stone-950 font-bold text-xs shadow hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Open Crusade Council ➔
                </button>
              </div>

              {/* Epidemic Plague Card */}
              <div className="p-4 rounded-xl bg-stone-950/90 border border-rose-900/60 hover:border-rose-500 transition-all flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-rose-200 flex items-center gap-1.5">
                      <Biohazard className="w-4 h-4 text-rose-400" /> Epidemic & Plague
                    </span>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${epidemicState?.isActive ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse' : 'bg-stone-800 text-stone-400'}`}>
                      {epidemicState?.isActive ? epidemicState.name : 'Clear Skies'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 leading-snug">
                    {epidemicState?.isActive ? `Plague raging across ${epidemicState.infectedProvinces.length} provinces with ${epidemicState.mortalityRate}% mortality.` : 'No devastating pestilence currently infects your realm borders.'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    if (onOpenPlagueModal) onOpenPlagueModal();
                  }}
                  className="w-full py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-rose-300 border border-rose-800/60 font-bold text-xs shadow active:scale-95 transition-all cursor-pointer"
                >
                  Manage Sanitarium & Decrees ➔
                </button>
              </div>

              {/* Nomad Horde Invasion Card */}
              <div className="p-4 rounded-xl bg-stone-950/90 border border-orange-900/60 hover:border-orange-500 transition-all flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-orange-200 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-400" /> Steppe Nomad Invasion
                    </span>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${nomadInvasion?.isActive ? 'bg-orange-950 text-orange-300 border border-orange-800 animate-pulse' : 'bg-stone-800 text-stone-400'}`}>
                      {nomadInvasion?.isActive ? 'Horde Advancing' : 'Distant Marches'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 leading-snug">
                    {nomadInvasion?.isActive ? `${nomadInvasion.khanName} leads ${nomadInvasion.hordeTroopCount.toLocaleString()} steppe riders demanding annual tribute.` : 'The eastern steppes remain quiet under distant clan skirmishes.'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    sound.playSword();
                    if (onOpenNomadModal) onOpenNomadModal();
                  }}
                  className="w-full py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-orange-300 border border-orange-800/60 font-bold text-xs shadow active:scale-95 transition-all cursor-pointer"
                >
                  Horde Defense War Room ➔
                </button>
              </div>

              {/* Great Wonders Card */}
              <div className="p-4 rounded-xl bg-stone-950/90 border border-purple-900/60 hover:border-purple-500 transition-all flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-purple-200 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-purple-400" /> Great Wonders Megaprojects
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      {greatWonders.length} Wonders
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 leading-snug">
                    Construct monumental grand cathedrals, imperial universities, colossal fortresses, and royal colosseums.
                  </p>
                </div>

                <button
                  onClick={() => {
                    sound.playFanfare();
                    if (onOpenWondersModal) onOpenWondersModal();
                  }}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 text-purple-100 font-bold text-xs shadow hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Inspect Imperial Wonders ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Activities & Feasts Sub-Tab */}
      {activeSubTab === 'activities' && (
        <div className="space-y-4">
          {/* Nemesis Feud Banner if active */}
          {activeNemeses.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-stone-900 to-stone-900 border border-rose-500/70 shadow-lg flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeNemeses[0].targetPortrait}</span>
                <div>
                  <div className="text-xs font-serif font-bold text-rose-200 flex items-center gap-1.5">
                    <Skull className="w-4 h-4 text-rose-400" />
                    <span>Blood Feud: {activeNemeses[0].targetName} ({activeNemeses[0].targetTitle})</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Feud Intensity: <span className="text-rose-400 font-bold font-mono">{activeNemeses[0].feudIntensity}/100</span> • {activeNemeses[0].reason}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playSword();
                  if (onOpenNemesisModal) onOpenNemesisModal();
                }}
                className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-rose-100 rounded-lg text-xs font-bold font-serif whitespace-nowrap shadow transition-all cursor-pointer"
              >
                Confront Nemesis ➔
              </button>
            </div>
          )}

          {/* Grand Court Activities Header */}
          <div className="bg-stone-900/90 rounded-2xl p-4 sm:p-5 border border-amber-900/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-amber-200 font-cinzel flex items-center gap-2">
                  <Wine className="w-5 h-5 text-amber-400" />
                  Court Activities, Feasts & Royal Ceremonies
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Entertain your nobility, strengthen faith, hold chivalric tournaments, and administer justice across the realm.
                </p>
              </div>
            </div>

            {/* Activity Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* 1. Grand Royal Feast */}
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-amber-600/50 flex flex-col justify-between gap-3 transition-all">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-3xl">🍷</span>
                    <div>
                      <h3 className="font-bold text-sm text-stone-100 font-cinzel">Grand Royal Feast</h3>
                      <span className="text-[10px] text-amber-400 font-semibold">Cost: 40 🪙</span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-400 leading-snug">
                    Host a lavish banquet with spiced wine and troubadours. Interactive multi-stage seating, toasts, and revelry.
                  </p>
                  <div className="text-[11px] text-emerald-400 font-medium mt-2">
                    ✨ +20 Vassal Loyalty, +15 Subject Joy, +10 Renown
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playFanfare();
                    if (onOpenFeastModal) {
                      onOpenFeastModal();
                    } else {
                      onHostFeast(40);
                    }
                  }}
                  disabled={character.stats.gold < 40}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-bold text-xs shadow-md active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
                >
                  Host Grand Feast (40 🪙)
                </button>
              </div>

              {/* 2. Royal Hunt */}
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-amber-600/50 flex flex-col justify-between gap-3 transition-all">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-3xl">🏹</span>
                    <div>
                      <h3 className="font-bold text-sm text-stone-100 font-cinzel">Royal Forest Hunt</h3>
                      <span className="text-[10px] text-amber-400 font-semibold">Cost: 25 🪙</span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-400 leading-snug">
                    Ride out with hunting hounds and archers to track fierce beasts in the deep ancestral woodlands.
                  </p>
                  <div className="text-[11px] text-emerald-400 font-medium mt-2">
                    ✨ +10 Martial Skill, +10 Health, Chance of Rare Game
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playSword();
                    onGoHunting(25);
                  }}
                  disabled={character.stats.gold < 25}
                  className="w-full py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs border border-stone-700 shadow-md active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
                >
                  Organize Royal Hunt (25 🪙)
                </button>
              </div>

              {/* 3. Holy / Arcane Pilgrimage */}
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-amber-600/50 flex flex-col justify-between gap-3 transition-all">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-3xl">✨</span>
                    <div>
                      <h3 className="font-bold text-sm text-stone-100 font-cinzel">Holy Pilgrimage</h3>
                      <span className="text-[10px] text-amber-400 font-semibold">Cost: 35 🪙</span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-400 leading-snug">
                    Undertake an interactive journey to sacred sanctuaries with roadside encounters and divine relics.
                  </p>
                  <div className="text-[11px] text-emerald-400 font-medium mt-2">
                    ✨ +30 Faith/Mana, +15 Renown, Holy Serenity
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playMagic();
                    if (onOpenPilgrimageModal) {
                      onOpenPilgrimageModal();
                    } else {
                      onGoPilgrimage(35);
                    }
                  }}
                  disabled={character.stats.gold < 35}
                  className="w-full py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs border border-stone-700 shadow-md active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
                >
                  Undertake Pilgrimage (35 🪙)
                </button>
              </div>

              {/* 4. Grand Jousting Tournament */}
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-amber-600/50 flex flex-col justify-between gap-3 transition-all">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-3xl">🛡️</span>
                    <div>
                      <h3 className="font-bold text-sm text-stone-100 font-cinzel">Grand Tournament</h3>
                      <span className="text-[10px] text-amber-400 font-semibold">Cost: 60 🪙</span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-400 leading-snug">
                    Host four athletic contests: Royal Joust, Melee Brawl, Archery Range, and Bardic Poetry Recital!
                  </p>
                  <div className="text-[11px] text-emerald-400 font-medium mt-2">
                    ✨ +35 Renown, +150 Veteran Recruits, Champion Laurels
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playFanfare();
                    if (onOpenTournamentModal) {
                      onOpenTournamentModal();
                    } else {
                      onHostTournament(60);
                    }
                  }}
                  disabled={character.stats.gold < 60}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-bold text-xs shadow-md active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
                >
                  Host Grand Tournament (60 🪙)
                </button>
              </div>
            </div>
          </div>

          {/* Administer Royal Justice Section */}
          <div className="bg-stone-900/90 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-amber-200 font-cinzel flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-400" />
                  Administer Royal Justice & Petitions
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Hear court petitions from citizens, guilds, and clergy to maintain the rule of law.
                </p>
              </div>
            </div>

            {activeJusticeCase ? (
              <div className="p-4 rounded-xl bg-stone-950/80 border border-amber-500 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-amber-200 font-cinzel">{activeJusticeCase.title}</span>
                  <span className="text-xs text-stone-400">Petitioner: {activeJusticeCase.petitioner}</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">{activeJusticeCase.description}</p>

                <div className="space-y-2 pt-2 border-t border-stone-800">
                  {activeJusticeCase.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        sound.playCoin();
                        onAdministerJustice(activeJusticeCase.id, opt.outcome);
                        setActiveJusticeCase(null);
                      }}
                      className="w-full p-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-left text-xs text-stone-200 font-semibold transition-all hover:border-amber-500 cursor-pointer"
                    >
                      ⚖️ {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-stone-400">There are active petitions awaiting your royal judgment:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {courtCases.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setActiveJusticeCase(c)}
                      className="p-3 rounded-xl bg-stone-950/80 hover:bg-stone-800 border border-stone-800 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-stone-200">{c.title}</div>
                        <div className="text-[10px] text-stone-400">Petitioner: {c.petitioner}</div>
                      </div>
                      <span className="text-xs text-amber-400 font-bold">Hear Case ➔</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
