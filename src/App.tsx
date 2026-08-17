import React, { useState, useEffect } from 'react';
import { 
  Character, 
  FamilyMember, 
  Province, 
  Realm, 
  Vassal, 
  RealmLaw, 
  ChronicleEntry, 
  GameEvent, 
  WarState, 
  TradeCaravan, 
  Species, 
  TreatyType,
  CouncilRole,
  RealmNPC,
  ConditionalPeaceTerms,
  CoronationStyle,
  SpymasterTask,
  HookSecret,
  VassalFaction,
  ImperialEdict,
  DynastyArtifact,
  CrusadeState,
  EpidemicState,
  NomadInvasionState,
  DynastyPerk,
  CadetBranch,
  GreatWonder,
  CharacterNemesis,
  StressBreakChoice,
  ProvincialSoldier,
  SoldierRank
} from './types';
import { 
  INITIAL_REALMS, 
  INITIAL_PROVINCES, 
  INITIAL_VASSALS, 
  PRESET_DYNASTIES 
} from './data/initialWorld';
import { INITIAL_REALM_NPCS } from './data/realmNPCsData';
import { INITIAL_REALM_LAWS, SPECIES_ABILITIES } from './data/lawsData';
import { 
  INITIAL_HOOKS_AND_SECRETS, 
  INITIAL_FACTIONS, 
  INITIAL_IMPERIAL_EDICTS, 
  INITIAL_DYNASTY_ARTIFACTS, 
  SECRETS_DISCOVERY_POOL 
} from './data/intrigueAndFactionsData';
import { 
  INITIAL_CRUSADE_STATE, 
  INITIAL_EPIDEMIC_STATE, 
  INITIAL_NOMAD_INVASION, 
  INITIAL_NEMESES_POOL, 
  STRESS_BREAK_OPTIONS 
} from './data/epochsAndCrisesData';
import { DYNASTY_PERK_TREES, INITIAL_CADET_BRANCHES } from './data/dynastyLegaciesData';
import { GREAT_WONDERS_CATALOG } from './data/greatWondersData';
import { generateTop20ProvincialSoldiers, RANK_TIERS } from './data/provincialSoldiersData';
import { BUILDINGS_CONFIG } from './data/buildingsData';
import { EVENTS_POOL } from './data/eventsPool';
import { SPECIES_DATA, CROSS_MARRIAGE_OUTCOMES } from './data/speciesData';
import { sound } from './utils/audio';

import { TopHeader } from './components/TopHeader';
import { BottomNavigation, ActiveTab } from './components/BottomNavigation';
import { ChronicleTab } from './components/ChronicleTab';
import { RealmMapTab } from './components/RealmMapTab';
import { DynastyFamilyTab } from './components/DynastyFamilyTab';
import { WarDiplomacyTab } from './components/WarDiplomacyTab';
import { LawsPowersTab } from './components/LawsPowersTab';
import { CourtActivitiesTab } from './components/CourtActivitiesTab';
import { EventModal } from './components/EventModal';
import { CharacterCreatorModal } from './components/CharacterCreatorModal';
import { DeathHeirModal } from './components/DeathHeirModal';
import { GuideModal } from './components/GuideModal';
import { VassalsSystemModal } from './components/VassalsSystemModal';
import { SaveLoadModal } from './components/SaveLoadModal';
import { InGameEditorModal } from './components/InGameEditorModal';
import { TravelEncounterModal, TravelOutcome, ActivityType } from './components/TravelEncounterModal';
import { UniversalCharacterModal, UniversalCharacterData } from './components/common/UniversalCharacterModal';
import { CrisisAndPlotModal, CrisisPayload } from './components/events/CrisisAndPlotModal';
import { GrandTournamentModal } from './components/court/GrandTournamentModal';
import { GrandFeastModal } from './components/court/GrandFeastModal';
import { HolyPilgrimageModal } from './components/court/HolyPilgrimageModal';
import { NemesisFeudModal } from './components/court/NemesisFeudModal';
import { GreatWondersModal } from './components/provinces/GreatWondersModal';
import { CrusadeModal } from './components/crises/CrusadeModal';
import { EpidemicPlagueModal } from './components/crises/EpidemicPlagueModal';
import { NomadInvasionModal } from './components/crises/NomadInvasionModal';
import { StressBreakModal } from './components/events/StressBreakModal';
import { CoronationCeremonyModal } from './components/events/CoronationCeremonyModal';
import { SuccessionCrisisModal } from './components/events/SuccessionCrisisModal';
import { simulateWorldFamiliesYearAdvance, generateFamilyForCharacter } from './utils/characterFamilyHelper';
import { TargetEntity } from './components/war/RealmProvinceDetailScreen';
import { GameSaveState, AssassinationPlot } from './types';
import { simulateAnnualBattleClash } from './utils/warCombat';
import { simulateAIRealmsYearlyProgress } from './utils/aiRealmsEngine';
import { DefensiveWarAlertModal } from './components/war/DefensiveWarAlertModal';

const SAVE_STORAGE_KEY = 'medieval_realms_save_v2';

export const getFeudalTierFromProvinces = (
  countyCount: number, 
  dynastyName: string
): { rank: 'Count' | 'Duke' | 'King' | 'Emperor'; title: string } => {
  if (countyCount >= 6) {
    return { rank: 'Emperor', title: `Emperor of ${dynastyName}` };
  } else if (countyCount >= 4) {
    return { rank: 'King', title: `King of ${dynastyName}` };
  } else if (countyCount >= 2) {
    return { rank: 'Duke', title: `Duke of ${dynastyName}` };
  } else {
    return { rank: 'Count', title: `Count of ${dynastyName}` };
  }
};

export default function App() {
  // Initialize from preset or saved data
  const defaultPreset = PRESET_DYNASTIES[0];

  const createInitialState = () => {
    const initialChar: Character = {
      id: 'char_player_1',
      name: defaultPreset.name,
      dynastyName: defaultPreset.dynastyName,
      gender: defaultPreset.gender,
      species: defaultPreset.species,
      age: 24,
      portrait: defaultPreset.portrait,
      rank: defaultPreset.rank,
      stats: {
        health: 95,
        happiness: 85,
        renown: 120,
        pietyOrMana: 60,
        gold: 220,
        martial: 65,
        intellect: 70,
        intrigue: 55,
        diplomacy: 75,
        specialResource: 80
      },
      traits: defaultPreset.traits,
      alive: true,
      yearBorn: 1042,
      childrenIds: defaultPreset.initialChildren ? defaultPreset.initialChildren.map((_, i) => `child_${i}`) : [],
      parentsIds: ['parent_father', 'parent_mother'],
      realmId: defaultPreset.realmId,
      isHeir: false,
      titlesHeld: [defaultPreset.title || 'Count of Brecknock']
    };

    const initialFamily: FamilyMember[] = [
      {
        id: 'parent_father',
        name: 'King Roderick I',
        species: 'Human',
        gender: 'Male',
        relation: 'Father',
        age: 62,
        alive: false,
        health: 0,
        opinion: 90,
        childrenIds: [initialChar.id],
        realmId: 'realm_human',
        title: 'Late High King',
        isHeir: false,
        traits: ['Grand Conqueror', 'Legendary Ruler'],
        causeOfDeath: 'Old Age',
        portrait: '👑'
      },
      {
        id: 'parent_mother',
        name: 'Queen Yvaine',
        species: 'Human',
        gender: 'Female',
        relation: 'Mother',
        age: 58,
        alive: false,
        health: 0,
        opinion: 95,
        childrenIds: [initialChar.id],
        realmId: 'realm_human',
        title: 'Late Queen Mother',
        isHeir: false,
        traits: ['Beloved', 'Devout'],
        causeOfDeath: 'Winter Fever',
        portrait: '👸'
      }
    ];

    if (defaultPreset.initialSpouse) {
      initialFamily.push({
        id: 'spouse_1',
        name: defaultPreset.initialSpouse.name,
        species: defaultPreset.initialSpouse.species,
        gender: 'Female',
        relation: 'Spouse',
        age: 22,
        alive: true,
        health: 90,
        opinion: 85,
        childrenIds: [],
        realmId: 'realm_human',
        title: defaultPreset.initialSpouse.title,
        isHeir: false,
        traits: defaultPreset.initialSpouse.traits,
        portrait: defaultPreset.initialSpouse.portrait
      });
    }

    if (defaultPreset.initialChildren) {
      defaultPreset.initialChildren.forEach((child, idx) => {
        initialFamily.push({
          id: `child_${idx}`,
          name: child.name,
          species: child.species,
          gender: child.gender,
          relation: 'Child',
          age: child.age,
          alive: true,
          health: 95,
          opinion: 90,
          childrenIds: [],
          realmId: 'realm_human',
          title: child.title,
          countyName: idx === 0 ? 'The County of Brecknock' : undefined,
          isHeir: idx === 0,
          isBloodRelation: true,
          traits: child.traits,
          portrait: child.portrait,
          educationTrack: 'Martial & Knightly Chivalry'
        });
      });
    }

    // Additional dynasty branches matching authentic court relations
    initialFamily.push(
      {
        id: 'child_extra_1',
        name: 'Prince Cuthbert Calvin',
        species: 'Human',
        gender: 'Male',
        relation: 'Child',
        age: 35,
        alive: true,
        health: 88,
        opinion: 78,
        childrenIds: ['grandchild_1', 'grandchild_2'],
        realmId: 'realm_human',
        title: 'Prince of the Blood',
        countyName: 'The County of Powys',
        isHeir: false,
        isBloodRelation: true,
        traits: ['Knight Commander', 'Brave'],
        portrait: '🤴'
      },
      {
        id: 'child_extra_2',
        name: 'Princess Constance Calvin',
        species: 'Human',
        gender: 'Female',
        relation: 'Child',
        age: 28,
        alive: true,
        health: 94,
        opinion: 85,
        childrenIds: [],
        realmId: 'realm_human',
        title: 'Royal Princess',
        isHeir: false,
        isBloodRelation: true,
        traits: ['Charismatic', 'Poetic Grace'],
        portrait: '👸'
      },
      {
        id: 'grandchild_1',
        name: 'Eugenia Calvin',
        species: 'Human',
        gender: 'Female',
        relation: 'Grandchild',
        age: 2,
        alive: true,
        health: 98,
        opinion: 80,
        childrenIds: [],
        realmId: 'realm_human',
        title: 'Lady of the Cradle',
        isHeir: false,
        isBloodRelation: true,
        traits: ['Sweet-Hearted'],
        portrait: '👧'
      },
      {
        id: 'grandchild_2',
        name: 'Lord Benjamin Calvin',
        species: 'Human',
        gender: 'Male',
        relation: 'Grandchild',
        age: 1,
        alive: true,
        health: 99,
        opinion: 85,
        childrenIds: [],
        realmId: 'realm_human',
        title: 'Heir of the West March',
        isHeir: false,
        isBloodRelation: true,
        traits: ['Vigorous'],
        portrait: '👶'
      },
      {
        id: 'sibling_1',
        name: 'Countess Susanna I Calvin',
        species: 'Human',
        gender: 'Female',
        relation: 'Sibling',
        age: 56,
        alive: true,
        health: 82,
        opinion: 76,
        childrenIds: [],
        realmId: 'realm_human',
        title: 'Countess of Gwent & Court Chancellor',
        countyName: 'The County of Gwent',
        isHeir: false,
        isBloodRelation: true,
        traits: ['Diplomat', 'Devout'],
        portrait: '👩'
      },
      {
        id: 'sibling_2',
        name: 'Bartholomew Calvin',
        species: 'Human',
        gender: 'Male',
        relation: 'Sibling',
        age: 58,
        alive: true,
        health: 79,
        opinion: 72,
        childrenIds: [],
        realmId: 'realm_human',
        title: 'Grand Constable',
        isHeir: false,
        isBloodRelation: true,
        traits: ['Stalwart', 'Disciplined'],
        portrait: '👨'
      },
      {
        id: 'cousin_1',
        name: 'Owen Calvin',
        species: 'Human',
        gender: 'Male',
        relation: 'Cousin',
        age: 61,
        alive: true,
        health: 80,
        opinion: 68,
        childrenIds: [],
        realmId: 'realm_human',
        title: 'Baron of Silverstream',
        isHeir: false,
        isBloodRelation: true,
        traits: ['Sage Lore', 'Astute'],
        portrait: '👨‍🦳'
      },
      {
        id: 'enemy_1',
        name: 'Empress Consort Matilda Verney',
        species: 'Human',
        gender: 'Female',
        relation: 'Enemy',
        age: 44,
        alive: true,
        health: 85,
        opinion: -42,
        childrenIds: [],
        realmId: 'realm_human',
        title: 'Pretender to the Western Marches',
        countyName: 'The County of Verney',
        isHeir: false,
        isBloodRelation: false,
        traits: ['Ambitious', 'Schemer', 'Proud'],
        portrait: '🥀'
      },
      {
        id: 'advisor_1',
        name: 'Countess Serena I Plantagenet',
        species: 'Human',
        gender: 'Female',
        relation: 'Advisor',
        age: 40,
        alive: true,
        health: 90,
        opinion: 84,
        childrenIds: [],
        realmId: 'realm_human',
        title: 'Grand Treasurer & Warden of the Mint',
        isHeir: false,
        isBloodRelation: false,
        traits: ['Master of Coin', 'Diligent'],
        portrait: '👩🏼'
      },
      {
        id: 'advisor_2',
        name: 'Count Benjamin I Walpole',
        species: 'Human',
        gender: 'Male',
        relation: 'Advisor',
        age: 29,
        alive: true,
        health: 92,
        opinion: 80,
        childrenIds: [],
        realmId: 'realm_human',
        title: 'Marshal of the Royal Vanguard',
        isHeir: false,
        isBloodRelation: false,
        traits: ['Iron Will', 'Tactician'],
        portrait: '👨🏽'
      }
    );

    const initialChronicle: ChronicleEntry[] = [
      {
        id: 'chron_1',
        year: 1066,
        age: 24,
        title: 'Coronation at the Grand Cathedral',
        description: `Ascended the throne of ${defaultPreset.dynastyName} amidst grand celebrations and sounding trumpets across the realm.`,
        type: 'birth',
        isImportant: true
      }
    ];

    const initialCaravans: TradeCaravan[] = [
      {
        id: 'caravan_1',
        targetRealmId: 'realm_elf',
        targetRealmName: 'Sylvanna Sun Courts',
        exportGood: 'Valorian Plate Armor',
        importGood: 'Celestial Silk & Glass',
        investment: 50,
        annualProfit: 25,
        risk: 'Low',
        activeYears: 3
      }
    ];

    const initialWars: WarState[] = [];

    return {
      character: initialChar,
      familyMembers: initialFamily,
      realms: INITIAL_REALMS,
      provinces: INITIAL_PROVINCES,
      vassals: INITIAL_VASSALS,
      realmLaws: INITIAL_REALM_LAWS,
      chronicleEntries: initialChronicle,
      tradeCaravans: initialCaravans,
      currentYear: 1066,
      reignYears: 1,
      activeWars: initialWars,
      activeEvent: null as GameEvent | null,
      spymasterTask: {
        mission: 'discover_plot' as const,
        progress: 25,
        turnsRemaining: 2,
        successChance: 80,
        description: 'Infiltrating regional courts to detect conspiracies.'
      },
      hooksAndSecrets: INITIAL_HOOKS_AND_SECRETS,
      vassalFactions: INITIAL_FACTIONS,
      imperialEdicts: INITIAL_IMPERIAL_EDICTS,
      dynastyArtifacts: INITIAL_DYNASTY_ARTIFACTS,
      unlockedPerkIds: ['warfare_1', 'diplomacy_1'],
      cadetBranches: INITIAL_CADET_BRANCHES,
      greatWonders: GREAT_WONDERS_CATALOG,
      crusadeState: INITIAL_CRUSADE_STATE,
      epidemicState: INITIAL_EPIDEMIC_STATE,
      nomadInvasion: INITIAL_NOMAD_INVASION,
      activeNemeses: INITIAL_NEMESES_POOL
    };
  };

  // State initialization
  const [character, setCharacter] = useState<Character>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved).character;
    } catch {}
    return createInitialState().character;
  });

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved).familyMembers;
    } catch {}
    return createInitialState().familyMembers;
  });

  const [realms, setRealms] = useState<Realm[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved).realms;
    } catch {}
    return createInitialState().realms;
  });

  const [provinces, setProvinces] = useState<Province[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved).provinces;
        // Verify we have all 72 provinces (12 per realm across 6 realms)
        if (Array.isArray(parsed) && parsed.length >= 60) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_PROVINCES;
  });

  const [realmNPCs, setRealmNPCs] = useState<RealmNPC[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved && JSON.parse(saved).realmNPCs) {
        const parsedNPCs = JSON.parse(saved).realmNPCs;
        if (Array.isArray(parsedNPCs) && parsedNPCs.length >= 20) {
          return parsedNPCs;
        }
      }
    } catch {}
    return INITIAL_REALM_NPCS;
  });

  const [vassals, setVassals] = useState<Vassal[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved).vassals;
    } catch {}
    return createInitialState().vassals;
  });

  const [realmLaws, setRealmLaws] = useState<RealmLaw[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved).realmLaws;
    } catch {}
    return createInitialState().realmLaws;
  });

  const [chronicleEntries, setChronicleEntries] = useState<ChronicleEntry[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved).chronicleEntries;
    } catch {}
    return createInitialState().chronicleEntries;
  });

  const [tradeCaravans, setTradeCaravans] = useState<TradeCaravan[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved).tradeCaravans;
    } catch {}
    return createInitialState().tradeCaravans;
  });

  const [currentYear, setCurrentYear] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved).currentYear;
    } catch {}
    return 1066;
  });

  const [reignYears, setReignYears] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved).reignYears;
    } catch {}
    return 1;
  });

  const [activeWars, setActiveWars] = useState<WarState[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved && JSON.parse(saved).activeWars) {
        const rawWars: WarState[] = JSON.parse(saved).activeWars;
        return rawWars.map(w => {
          let pLevies = w.playerLevies;
          let yTroops = w.yearlyTroops;
          if (pLevies >= 100000 && yTroops >= 100) {
            pLevies = Math.round(pLevies / 1000);
            yTroops = Math.round(yTroops);
          }
          return {
            ...w,
            playerLevies: pLevies,
            yearlyTroops: yTroops,
            commanders: w.commanders ? w.commanders.map((c, i) => ({
              ...c,
              assignedTroops: Math.round(pLevies * [0.35, 0.25, 0.15, 0.15, 0.10][i])
            })) : w.commanders
          };
        });
      }
    } catch {}
    return createInitialState().activeWars;
  });

  const [spymasterTask, setSpymasterTask] = useState<SpymasterTask>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved && JSON.parse(saved).spymasterTask) return JSON.parse(saved).spymasterTask;
    } catch {}
    return createInitialState().spymasterTask;
  });

  const [hooksAndSecrets, setHooksAndSecrets] = useState<HookSecret[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved && Array.isArray(JSON.parse(saved).hooksAndSecrets)) return JSON.parse(saved).hooksAndSecrets;
    } catch {}
    return INITIAL_HOOKS_AND_SECRETS;
  });

  const [vassalFactions, setVassalFactions] = useState<VassalFaction[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved && Array.isArray(JSON.parse(saved).vassalFactions)) return JSON.parse(saved).vassalFactions;
    } catch {}
    return INITIAL_FACTIONS;
  });

  const [imperialEdicts, setImperialEdicts] = useState<ImperialEdict[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved && Array.isArray(JSON.parse(saved).imperialEdicts)) return JSON.parse(saved).imperialEdicts;
    } catch {}
    return INITIAL_IMPERIAL_EDICTS;
  });

  const [dynastyArtifacts, setDynastyArtifacts] = useState<DynastyArtifact[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved && Array.isArray(JSON.parse(saved).dynastyArtifacts)) return JSON.parse(saved).dynastyArtifacts;
    } catch {}
    return INITIAL_DYNASTY_ARTIFACTS;
  });

  // New Grand Epochs, Legacies, and Wonders State
  const [unlockedPerkIds, setUnlockedPerkIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved && Array.isArray(JSON.parse(saved).unlockedPerkIds)) return JSON.parse(saved).unlockedPerkIds;
    } catch {}
    return ['warfare_1', 'diplomacy_1'];
  });

  const [cadetBranches, setCadetBranches] = useState<CadetBranch[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved && Array.isArray(JSON.parse(saved).cadetBranches)) return JSON.parse(saved).cadetBranches;
    } catch {}
    return INITIAL_CADET_BRANCHES;
  });

  const [greatWonders, setGreatWonders] = useState<GreatWonder[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved && Array.isArray(JSON.parse(saved).greatWonders)) return JSON.parse(saved).greatWonders;
    } catch {}
    return GREAT_WONDERS_CATALOG;
  });

  const [crusadeState, setCrusadeState] = useState<CrusadeState>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved && JSON.parse(saved).crusadeState) return JSON.parse(saved).crusadeState;
    } catch {}
    return INITIAL_CRUSADE_STATE;
  });

  const [epidemicState, setEpidemicState] = useState<EpidemicState>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved && JSON.parse(saved).epidemicState) return JSON.parse(saved).epidemicState;
    } catch {}
    return INITIAL_EPIDEMIC_STATE;
  });

  const [nomadInvasion, setNomadInvasion] = useState<NomadInvasionState>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved && JSON.parse(saved).nomadInvasion) return JSON.parse(saved).nomadInvasion;
    } catch {}
    return INITIAL_NOMAD_INVASION;
  });

  const [activeNemeses, setActiveNemeses] = useState<CharacterNemesis[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved && Array.isArray(JSON.parse(saved).activeNemeses)) return JSON.parse(saved).activeNemeses;
    } catch {}
    return INITIAL_NEMESES_POOL;
  });

  const [provincialSoldiers, setProvincialSoldiers] = useState<Record<string, ProvincialSoldier[]>>(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved).provincialSoldiers;
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch {}
    const initialMap: Record<string, ProvincialSoldier[]> = {};
    INITIAL_PROVINCES.forEach(prov => {
      const realmSpecies = INITIAL_REALMS.find(r => r.id === prov.realmId)?.species || 'Human';
      initialMap[prov.id] = generateTop20ProvincialSoldiers(prov.id, prov.name, realmSpecies);
    });
    return initialMap;
  });

  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('chronicle');
  const [showCreator, setShowCreator] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [showVassalsModal, setShowVassalsModal] = useState<boolean>(false);
  const [showSaveLoadModal, setShowSaveLoadModal] = useState<boolean>(false);
  const [showEditorModal, setShowEditorModal] = useState<boolean>(false);
  const [selectedUniversalCharacter, setSelectedUniversalCharacter] = useState<UniversalCharacterData | null>(null);
  const [activeCrisis, setActiveCrisis] = useState<CrisisPayload | null>(null);
  const [travelModalState, setTravelModalState] = useState<{
    isOpen: boolean;
    activity: ActivityType;
  } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // New Modals State
  const [showTournamentModal, setShowTournamentModal] = useState<boolean>(false);
  const [showFeastModal, setShowFeastModal] = useState<boolean>(false);
  const [showPilgrimageModal, setShowPilgrimageModal] = useState<boolean>(false);
  const [showWondersModal, setShowWondersModal] = useState<boolean>(false);
  const [showCrusadeModal, setShowCrusadeModal] = useState<boolean>(false);
  const [showPlagueModal, setShowPlagueModal] = useState<boolean>(false);
  const [showNomadModal, setShowNomadModal] = useState<boolean>(false);
  const [showNemesisModal, setShowNemesisModal] = useState<boolean>(false);
  const [showStressModal, setShowStressModal] = useState<boolean>(false);
  const [activeStressLevel, setActiveStressLevel] = useState<number>(1);
  const [showCoronationModal, setShowCoronationModal] = useState<boolean>(false);
  const [coronationHeirCandidate, setCoronationHeirCandidate] = useState<FamilyMember | null>(null);
  const [showSuccessionCrisisModal, setShowSuccessionCrisisModal] = useState<boolean>(false);
  const [successionPretender, setSuccessionPretender] = useState<{
    name: string;
    relation: string;
    portrait: string;
    armySize: number;
    claimTitle: string;
  } | null>(null);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      const stateToSave = {
        character,
        familyMembers,
        realms,
        provinces,
        realmNPCs,
        vassals,
        realmLaws,
        chronicleEntries,
        tradeCaravans,
        currentYear,
        reignYears,
        activeWars,
        spymasterTask,
        hooksAndSecrets,
        vassalFactions,
        imperialEdicts,
        dynastyArtifacts,
        unlockedPerkIds,
        cadetBranches,
        greatWonders,
        crusadeState,
        epidemicState,
        nomadInvasion,
        activeNemeses,
        provincialSoldiers
      };
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {}
  }, [
    character, 
    familyMembers, 
    realms, 
    provinces, 
    realmNPCs, 
    vassals, 
    realmLaws, 
    chronicleEntries, 
    tradeCaravans, 
    currentYear, 
    reignYears, 
    activeWars,
    spymasterTask,
    hooksAndSecrets,
    vassalFactions,
    imperialEdicts,
    dynastyArtifacts,
    unlockedPerkIds,
    cadetBranches,
    greatWonders,
    crusadeState,
    epidemicState,
    nomadInvasion,
    activeNemeses,
    provincialSoldiers
  ]);

  // Derived Values
  const currentRealm = realms.find(r => r.id === character.realmId) || realms[0];
  const playerProvinces = provinces.filter(p => p.isPlayerControlled);
  const totalArmyPower = playerProvinces.reduce((sum, p) => sum + p.troops, 0) + vassals.reduce((sum, v) => sum + v.levyContribution, 0);

  // Restart / New Game handler
  const handleStartCustomGame = (config: {
    name: string;
    dynastyName: string;
    gender: 'Male' | 'Female';
    species: Species;
    rank: string;
    portrait: string;
    traits: string[];
    motto: string;
  }) => {
    const realmMatch = realms.find(r => r.species === config.species) || realms[0];

    // 1. Identify starting province: exactly 1 starting county for the chosen realm!
    const startingProv = INITIAL_PROVINCES.find(p => p.realmId === realmMatch.id) || INITIAL_PROVINCES[0];

    // 2. Build fresh provinces where ONLY the 1 starting province is player-controlled (1 / 12 Counties)
    const newProvinces = INITIAL_PROVINCES.map(p => ({
      ...p,
      isPlayerControlled: p.id === startingProv.id,
      unrest: p.id === startingProv.id ? 8 : (p.unrest || 12),
      governorName: p.id === startingProv.id ? `${config.name} (${config.dynastyName})` : p.governorName,
      governorId: p.id === startingProv.id ? `player_${startingProv.id}` : p.governorId
    }));

    // 3. Check for matching preset to restore rich starting family, backstory & title
    const matchingPreset = PRESET_DYNASTIES.find(p => 
      (p.species === config.species && (p.name === config.name || p.dynastyName === config.dynastyName)) ||
      p.id === `preset_${config.species.toLowerCase()}`
    );

    // Initial Rank: For a single county fief start, starting rank is Count
    const startingRank = 'Count';
    const cleanCountyName = startingProv.name.replace(/^The County of\s+|^The Duchy of\s+|^The Landgraviate of\s+|^The Mark of\s+|^The\s+/, '');
    const startingTitle = matchingPreset?.title || `Count of ${cleanCountyName}`;

    const newChar: Character = {
      id: `char_${Date.now()}`,
      name: config.name,
      dynastyName: config.dynastyName,
      gender: config.gender,
      species: config.species,
      age: 24,
      portrait: config.portrait,
      rank: startingRank,
      title: startingTitle,
      stats: {
        health: 95,
        happiness: 85,
        renown: 120,
        pietyOrMana: 60,
        gold: 220,
        martial: 65,
        intellect: 70,
        intrigue: 55,
        diplomacy: 75,
        specialResource: 80
      },
      traits: config.traits,
      alive: true,
      yearBorn: 1042,
      childrenIds: matchingPreset?.initialChildren ? matchingPreset.initialChildren.map((_, i) => `child_${i}`) : [],
      parentsIds: ['parent_father', 'parent_mother'],
      realmId: realmMatch.id,
      isHeir: false,
      titlesHeld: [startingTitle]
    };

    // 4. Build Initial Family Members
    const newFamily: FamilyMember[] = [
      {
        id: 'parent_father',
        name: `Lord ${config.dynastyName} the Elder`,
        species: config.species,
        gender: 'Male',
        relation: 'Father',
        age: 62,
        alive: false,
        health: 0,
        opinion: 90,
        childrenIds: [newChar.id],
        realmId: realmMatch.id,
        title: 'Late Founder & Lord',
        isHeir: false,
        traits: ['Grand Conqueror', 'Honorable'],
        causeOfDeath: 'Old Age',
        portrait: '👑'
      },
      {
        id: 'parent_mother',
        name: `Lady ${config.dynastyName}`,
        species: config.species,
        gender: 'Female',
        relation: 'Mother',
        age: 58,
        alive: false,
        health: 0,
        opinion: 95,
        childrenIds: [newChar.id],
        realmId: realmMatch.id,
        title: 'Late Lady Mother',
        isHeir: false,
        traits: ['Beloved', 'Devout'],
        causeOfDeath: 'Winter Fever',
        portrait: '👸'
      }
    ];

    if (matchingPreset?.initialSpouse) {
      newFamily.push({
        id: `spouse_${Date.now()}`,
        name: matchingPreset.initialSpouse.name,
        species: matchingPreset.initialSpouse.species,
        gender: config.gender === 'Male' ? 'Female' : 'Male',
        relation: 'Spouse',
        age: 22,
        alive: true,
        health: 90,
        opinion: 85,
        childrenIds: [],
        realmId: realmMatch.id,
        title: matchingPreset.initialSpouse.title,
        isHeir: false,
        traits: matchingPreset.initialSpouse.traits,
        portrait: matchingPreset.initialSpouse.portrait
      });
    }

    if (matchingPreset?.initialChildren) {
      matchingPreset.initialChildren.forEach((child, idx) => {
        newFamily.push({
          id: `child_${idx}`,
          name: child.name,
          species: child.species,
          gender: child.gender,
          relation: 'Child',
          age: child.age,
          alive: true,
          health: 95,
          opinion: 90,
          childrenIds: [],
          realmId: realmMatch.id,
          title: child.title,
          countyName: idx === 0 ? startingProv.name : undefined,
          isHeir: idx === 0,
          isBloodRelation: true,
          traits: child.traits,
          portrait: child.portrait,
          educationTrack: 'Martial & Knightly Chivalry'
        });
      });
    }

    // Additional branches for standard game feel if human
    if (config.species === 'Human' && (!matchingPreset || matchingPreset.id === 'preset_human')) {
      newFamily.push(
        {
          id: 'child_extra_1',
          name: 'Prince Cuthbert Calvin',
          species: 'Human',
          gender: 'Male',
          relation: 'Child',
          age: 35,
          alive: true,
          health: 88,
          opinion: 78,
          childrenIds: ['grandchild_1', 'grandchild_2'],
          realmId: 'realm_human',
          title: 'Prince of the Blood',
          countyName: 'The County of Powys',
          isHeir: false,
          isBloodRelation: true,
          traits: ['Knight Commander', 'Brave'],
          portrait: '🤴'
        },
        {
          id: 'sibling_1',
          name: 'Countess Susanna I Calvin',
          species: 'Human',
          gender: 'Female',
          relation: 'Sibling',
          age: 56,
          alive: true,
          health: 82,
          opinion: 76,
          childrenIds: [],
          realmId: 'realm_human',
          title: 'Court Chancellor',
          isHeir: false,
          isBloodRelation: true,
          traits: ['Diplomat', 'Devout'],
          portrait: '👩'
        },
        {
          id: 'advisor_1',
          name: 'Countess Serena I Plantagenet',
          species: 'Human',
          gender: 'Female',
          relation: 'Advisor',
          age: 40,
          alive: true,
          health: 90,
          opinion: 84,
          childrenIds: [],
          realmId: 'realm_human',
          title: 'Grand Treasurer & Warden of the Mint',
          isHeir: false,
          isBloodRelation: false,
          traits: ['Master of Coin', 'Diligent'],
          portrait: '👩🏼'
        }
      );
    }

    const newChronicle: ChronicleEntry[] = [
      {
        id: `chron_${Date.now()}`,
        year: 1066,
        age: 24,
        title: `Dynasty of ${config.dynastyName} Founded in ${startingProv.name}`,
        description: `${config.name} took the oath as Count of ${startingProv.name} in the ${realmMatch.name}. Starting with 1 ancestral county fief. Motto: "${config.motto}".`,
        type: 'birth',
        isImportant: true
      }
    ];

    // Reset all game state cleanly
    setCharacter(newChar);
    setFamilyMembers(newFamily);
    setProvinces(newProvinces);
    setRealms(INITIAL_REALMS);
    setVassals(INITIAL_VASSALS);
    setRealmNPCs(INITIAL_REALM_NPCS);
    setRealmLaws(INITIAL_REALM_LAWS);
    setChronicleEntries(newChronicle);
    setCurrentYear(1066);
    setReignYears(1);
    setActiveWars([]);
    setActiveEvent(null);
    setTradeCaravans([
      {
        id: 'caravan_1',
        targetRealmId: 'realm_elf',
        targetRealmName: 'Sylvanna Sun Courts',
        exportGood: 'Plate Armor & Swords',
        importGood: 'Celestial Silk & Glass',
        investment: 50,
        annualProfit: 25,
        risk: 'Low',
        activeYears: 1
      }
    ]);
    setVassalFactions(INITIAL_FACTIONS);
    setImperialEdicts(INITIAL_IMPERIAL_EDICTS);
    setDynastyArtifacts(INITIAL_DYNASTY_ARTIFACTS);
    setHooksAndSecrets(INITIAL_HOOKS_AND_SECRETS);
    const freshSoldiersMap: Record<string, ProvincialSoldier[]> = {};
    INITIAL_PROVINCES.forEach(prov => {
      const realmSpecies = INITIAL_REALMS.find(r => r.id === prov.realmId)?.species || 'Human';
      freshSoldiersMap[prov.id] = generateTop20ProvincialSoldiers(prov.id, prov.name, realmSpecies);
    });
    setProvincialSoldiers(freshSoldiersMap);
    setActiveTab('chronicle');
  };

  // Full Load Game State handler (from Save slots, files, or autosaves)
  const handleLoadGameState = (loaded: GameSaveState) => {
    if (loaded.character) setCharacter(loaded.character);
    if (Array.isArray(loaded.familyMembers)) setFamilyMembers(loaded.familyMembers);
    if (Array.isArray(loaded.realms)) setRealms(loaded.realms);
    if (Array.isArray(loaded.provinces)) setProvinces(loaded.provinces);
    if (Array.isArray(loaded.realmNPCs)) setRealmNPCs(loaded.realmNPCs);
    if (Array.isArray(loaded.vassals)) setVassals(loaded.vassals);
    if (Array.isArray(loaded.realmLaws)) setRealmLaws(loaded.realmLaws);
    if (Array.isArray(loaded.chronicleEntries)) setChronicleEntries(loaded.chronicleEntries);
    if (Array.isArray(loaded.tradeCaravans)) setTradeCaravans(loaded.tradeCaravans);
    if (typeof loaded.currentYear === 'number') setCurrentYear(loaded.currentYear);
    if (typeof loaded.reignYears === 'number') setReignYears(loaded.reignYears);
    if (Array.isArray(loaded.activeWars)) setActiveWars(loaded.activeWars);
    if (loaded.spymasterTask) setSpymasterTask(loaded.spymasterTask);
    if (Array.isArray(loaded.hooksAndSecrets)) setHooksAndSecrets(loaded.hooksAndSecrets);
    if (Array.isArray(loaded.vassalFactions)) setVassalFactions(loaded.vassalFactions);
    if (Array.isArray(loaded.imperialEdicts)) setImperialEdicts(loaded.imperialEdicts);
    if (Array.isArray(loaded.dynastyArtifacts)) setDynastyArtifacts(loaded.dynastyArtifacts);
    if (loaded.provincialSoldiers && typeof loaded.provincialSoldiers === 'object') {
      setProvincialSoldiers(loaded.provincialSoldiers);
    }
    setActiveEvent(null);
  };

  // Primary Age-Up / Turn Progression Routine
  const handleAgeUp = () => {
    sound.playAgeUp();

    const newYear = currentYear + 1;
    const newAge = character.age + 1;
    const newReign = reignYears + 1;

    // 1. Calculate Province Incomes & Vassal Taxes & Check Trade Caravans
    const baseProvinceTax = playerProvinces.reduce((sum, p) => sum + p.income, 0);
    const vassalTaxes = vassals.reduce((sum, v) => sum + v.taxContribution, 0);
    
    // Trade Caravans Interception & Risk Check against Active War Realms
    const survivingCaravans: TradeCaravan[] = [];
    const interceptedCaravanChronicles: typeof chronicleEntries = [];
    let caravanProfits = 0;

    tradeCaravans.forEach(caravan => {
      const isTargetAtWar = activeWars.some(w => 
        w.targetRealmId === caravan.targetRealmId || 
        w.targetRealmName.toLowerCase() === caravan.targetRealmName.toLowerCase()
      );

      if (isTargetAtWar) {
        interceptedCaravanChronicles.push({
          id: `caravan_intercept_${Date.now()}_${caravan.id}`,
          year: newYear,
          age: newAge,
          title: `🏴‍☠️ Trade Caravan Intercepted by ${caravan.targetRealmName}!`,
          description: `Hostile privateers blockaded and confiscated your trade caravan carrying ${caravan.exportGood}. The entire ${caravan.investment} 🪙 initial investment was lost to enemy prize courts.`,
          type: 'war',
          isImportant: true
        });
      } else {
        caravanProfits += caravan.annualProfit;
        survivingCaravans.push({
          ...caravan,
          activeYears: caravan.activeYears + 1
        });
      }
    });
    setTradeCaravans(survivingCaravans);

    // Calculate Active Imperial Edicts Upkeep & Active Regalia Artifact Bonuses
    const activeEdictsUpkeep = imperialEdicts.filter(e => e.isActive).reduce((sum, e) => sum + e.upkeepCost, 0);

    const equippedArtifacts = dynastyArtifacts.filter(a => a.isEquipped);
    const artifactTaxBonusPercent = equippedArtifacts.reduce((sum, a) => sum + (a.effects.taxRateBonusPercent || 0), 0);
    const artifactFlatGold = equippedArtifacts.reduce((sum, a) => sum + (a.effects.goldIncome || 0), 0);
    const artifactRenownBonus = equippedArtifacts.reduce((sum, a) => sum + (a.effects.renown || 0), 0);

    const baseTaxesWithBonus = Math.round((baseProvinceTax + vassalTaxes) * (1 + artifactTaxBonusPercent / 100));
    const totalYearlyGrossGold = baseTaxesWithBonus + caravanProfits + artifactFlatGold;

    // 1b. Calculate Active War Levies Upkeep (Paid annually from Treasury)
    const totalWarLevies = activeWars.reduce((sum, w) => {
      const troops = w.playerLevies || w.yearlyTroops || 0;
      return sum + troops;
    }, 0);
    const totalWarUpkeep = Math.round(totalWarLevies * 0.003) + activeEdictsUpkeep;
    const hasUpkeepDeficit = (character.stats.gold + totalYearlyGrossGold) < totalWarUpkeep;
    const netYearlyGold = totalYearlyGrossGold - totalWarUpkeep;
    const newGold = Math.max(0, character.stats.gold + netYearlyGold);

    // Intrigue & Spymaster Annual Tick
    const intrigueChronicles: ChronicleEntry[] = [];
    if (spymasterTask.mission !== 'idle') {
      const advance = 35;
      const newProgress = spymasterTask.progress + advance;
      if (newProgress >= 100) {
        const targetVassal = vassals.find(v => v.id === spymasterTask.targetId) || vassals[0];
        const template = SECRETS_DISCOVERY_POOL[Math.floor(Math.random() * SECRETS_DISCOVERY_POOL.length)];
        const newHook: HookSecret = {
          id: `hook_${Date.now()}`,
          targetId: targetVassal?.id || 'target_noble',
          targetName: targetVassal?.name || 'High Noble Courtier',
          targetRole: targetVassal?.title || 'Provincial Lord',
          targetPortrait: targetVassal?.portrait || '👤',
          type: template.type,
          secretName: template.secretName,
          description: template.description(targetVassal?.name || 'the targeted lord'),
          obtainedYear: newYear,
          isUsed: false,
          leveragePower: template.leveragePower
        };
        setHooksAndSecrets(prev => [newHook, ...prev]);
        setSpymasterTask({
          mission: 'idle',
          progress: 0,
          turnsRemaining: 0,
          successChance: 75,
          description: 'No active clandestine assignment.'
        });
        intrigueChronicles.push({
          id: `secret_${Date.now()}`,
          year: newYear,
          age: newAge,
          title: `🔑 Spymaster Secret Uncovered: ${newHook.secretName}`,
          description: `Your Master of Whispers uncovered compromising leverage against ${newHook.targetName}: ${newHook.description}`,
          type: 'intrigue',
          isImportant: true
        });
      } else {
        setSpymasterTask(prev => ({
          ...prev,
          progress: newProgress,
          turnsRemaining: Math.max(1, prev.turnsRemaining - 1)
        }));
      }
    }

    // 1c. Calculate War Fatigue Level (Prolonged wars > 3 years)
    const maxWarFatigue = activeWars.length > 0
      ? Math.max(0, ...activeWars.map(w => w.warYear >= 6 ? 3 : w.warYear === 5 ? 2 : w.warYear === 4 ? 1 : 0))
      : 0;
    const fatigueRecruitmentPenalty = maxWarFatigue === 3 ? 0.35 : maxWarFatigue === 2 ? 0.20 : maxWarFatigue === 1 ? 0.10 : 0;
    const fatigueProsperityDrain = maxWarFatigue === 3 ? 6 : maxWarFatigue === 2 ? 4 : maxWarFatigue === 1 ? 2 : 0;
    const fatigueUnrestSpike = maxWarFatigue === 3 ? 8 : maxWarFatigue === 2 ? 5 : maxWarFatigue === 1 ? 3 : 0;
    const fatigueHappinessPenalty = maxWarFatigue === 3 ? 8 : maxWarFatigue === 2 ? 5 : maxWarFatigue === 1 ? 2 : 0;

    // 1d. Annual Troop Growth from Province Infrastructure (subject to War Fatigue)
    let totalNewRecruits = 0;
    const baseUpdatedProvinces = provinces.map(p => {
      if (!p.isPlayerControlled) return p;
      const b = p.buildings || {};
      const barracksGrowth = (b.barracks || 0) * 35;
      const castleGrowth = (b.castle || 0) * 15;
      const monumentGrowth = (b.realmSpecialStructure || 0) * 20;
      const prosperityGrowth = Math.floor(p.prosperity / 8);
      const martialBonus = Math.floor(character.stats.martial / 4);
      
      const rawNewTroops = Math.max(10, barracksGrowth + castleGrowth + monumentGrowth + prosperityGrowth + martialBonus);
      const annualNewTroops = Math.max(5, Math.round(rawNewTroops * (1 - fatigueRecruitmentPenalty)));
      totalNewRecruits += annualNewTroops;
      
      const newTroopCount = (p.troops || 450) + annualNewTroops;
      const newProsperity = Math.max(5, Math.min(100, (p.prosperity || 50) - fatigueProsperityDrain));
      const newUnrest = Math.min(100, Math.max(0, (p.unrest || 0) + fatigueUnrestSpike));

      return {
        ...p,
        prosperity: newProsperity,
        unrest: newUnrest,
        troops: newTroopCount,
        armyStrength: newTroopCount
      };
    });

    // 2. Resource generation
    const specialGain = character.species === 'Vampire' ? 10 : character.species === 'Werewolf' ? 12 : 8;
    const newSpecialResource = Math.min(100, character.stats.specialResource + specialGain);

    // 3. Health & Mortality Check
    let healthDelta = 0;
    if (newAge > 65) healthDelta -= Math.floor((newAge - 65) / 2);
    let newHealth = Math.max(0, character.stats.health + healthDelta);

    // 4. Age family members & check for children milestones and tutor training
    const tutorChronicles: ChronicleEntry[] = [];
    const updatedFamily = familyMembers.map(m => {
      if (!m.alive) return m;
      const mNewAge = m.age + 1;
      
      let newProgress = m.educationProgress || 0;
      let newTraits = [...m.traits];
      let newMartial = m.stats?.martial || 10;
      let newDiplomacy = m.stats?.diplomacy || 10;
      let newIntellect = m.stats?.intellect || 10;

      // If under age 20 and has a tutor, advance education
      if (m.relation === 'Child' && m.tutorId && mNewAge <= 20) {
        newProgress = Math.min(100, newProgress + 25);
        if (newProgress >= 100 && !newTraits.some(t => t.includes('Mastery') || t.includes('Educated'))) {
          const focus = m.trainingFocus || 'Martial & Warfare';
          if (focus.includes('Martial')) {
            newMartial += 6;
            newTraits.push('Knightly Mastery');
          } else if (focus.includes('Intellect') || focus.includes('Arcana')) {
            newIntellect += 6;
            newTraits.push('Arcane Scholar');
          } else {
            newDiplomacy += 6;
            newTraits.push('Statesman Eloquence');
          }

          tutorChronicles.push({
            id: `edu_grad_${Date.now()}_${m.id}`,
            year: newYear,
            age: newAge,
            title: `🎓 Heir Training Completed: ${m.name}`,
            description: `${m.name} has graduated their tutelage with distinction, achieving supreme mastery in ${focus}!`,
            type: 'family',
            isImportant: true
          });
        }
      }

      return {
        ...m,
        age: mNewAge,
        educationProgress: newProgress,
        traits: Array.from(new Set(newTraits)),
        stats: m.stats ? {
          ...m.stats,
          martial: newMartial,
          diplomacy: newDiplomacy,
          intellect: newIntellect
        } : undefined
      };
    });

    // 5. Random childbirth chance if married
    const spouse = updatedFamily.find(m => m.relation === 'Spouse' && m.alive);
    if (spouse && character.childrenIds.length < 5 && character.age < 50 && Math.random() < 0.25) {
      const childGender: 'Male' | 'Female' = Math.random() > 0.5 ? 'Male' : 'Female';
      const childNamesMale = ['Edmund', 'Gawain', 'Lucien', 'Fenris', 'Rowan', 'Valen'];
      const childNamesFemale = ['Rosalind', 'Morgana', 'Astrid', 'Lilith', 'Sylvia', 'Freya'];
      const childName = childGender === 'Male' 
        ? childNamesMale[Math.floor(Math.random() * childNamesMale.length)] 
        : childNamesFemale[Math.floor(Math.random() * childNamesFemale.length)];

      const isHybrid = spouse.species !== character.species;
      const hybridPair = `${character.species}+${spouse.species}`;
      const hybridTrait = isHybrid && CROSS_MARRIAGE_OUTCOMES[hybridPair] ? CROSS_MARRIAGE_OUTCOMES[hybridPair].hybridName : undefined;

      const newChildId = `child_${Date.now()}`;
      const newChild: FamilyMember = {
        id: newChildId,
        name: `${childName}`,
        species: Math.random() > 0.5 ? character.species : spouse.species,
        gender: childGender,
        relation: 'Child',
        age: 0,
        alive: true,
        health: 100,
        opinion: 95,
        childrenIds: [],
        realmId: character.realmId,
        title: childGender === 'Male' ? 'Royal Prince' : 'Royal Princess',
        isHeir: character.childrenIds.length === 0,
        traits: hybridTrait ? [hybridTrait] : ['Royal Blood'],
        portrait: childGender === 'Male' ? '👶' : '👧',
        educationTrack: 'Martial & Knightly Chivalry'
      };

      updatedFamily.push(newChild);
      character.childrenIds.push(newChildId);

      setChronicleEntries(prev => [
        {
          id: `chron_birth_${Date.now()}`,
          year: newYear,
          age: newAge,
          title: `Birth of ${newChild.title} ${newChild.name}`,
          description: `Queen Consort ${spouse.name} gave birth to a healthy ${childGender.toLowerCase()} infant! The kingdom rejoices.`,
          type: 'family',
          isImportant: true
        },
        ...prev
      ]);
    }

    // 6. Check Active Wars progress (Strictly Annual War Clash with Casualties, Commander Fates & Devastation)
    let totalAnnualPlayerCasualties = 0;
    let totalAnnualEnemyCasualties = 0;
    const warBattleChronicles: typeof chronicleEntries = [];

    if (activeWars.length > 0) {
      setActiveWars(prev => prev.map(w => {
        const clash = simulateAnnualBattleClash(w, character, newYear);
        const newScore = Math.min(100, Math.max(-100, w.warScore + clash.scoreDelta));
        const updatedPlayerLevies = Math.max(0, w.playerLevies - clash.playerCasualties);
        const updatedEnemyLevies = Math.max(0, w.enemyLevies - clash.enemyCasualties);

        totalAnnualPlayerCasualties += clash.playerCasualties;
        totalAnnualEnemyCasualties += clash.enemyCasualties;

        // Player personal command wounds
        if (clash.playerPersonalFate && clash.playerPersonalFate.wounded) {
          newHealth = Math.max(5, newHealth - clash.playerPersonalFate.healthLost);
          warBattleChronicles.push({
            id: `char_wound_${Date.now()}_${w.id}`,
            year: newYear,
            age: newAge,
            title: `🩸 Battlefield Wound Sustained in Campaign`,
            description: clash.playerPersonalFate.description,
            type: 'war',
            isImportant: true
          });
        }

        // Commander fates and trait ascension chronicle logs
        clash.commanderEvents.forEach((ev, idx) => {
          let eventTitle = '🎖️ Royal Commander Triumph';
          let isImportant = false;

          if (ev.fate === 'killed') {
            eventTitle = '💀 Commander Slain in Action';
            isImportant = true;
          } else if (ev.fate === 'captured') {
            eventTitle = '⛓️ Commander Captured in Action';
            isImportant = true;
          } else if (ev.fate === 'wounded') {
            eventTitle = '🩸 Commander Wounded in Action';
          } else if (ev.description.includes('Legendary Warmaster')) {
            eventTitle = '⚔️ Legendary Warmaster Anointed';
            isImportant = true;
          } else if (ev.description.includes('Heroic Commander')) {
            eventTitle = '🏆 Heroic Commander Ascended';
            isImportant = true;
          } else if (ev.description.includes('War Veteran')) {
            eventTitle = '⭐ War Veteran Trait Earned';
            isImportant = true;
          } else if (ev.description.includes('recovered')) {
            eventTitle = '🛡️ Commander Recovered & Returned to Duty';
          }

          warBattleChronicles.push({
            id: `cmd_event_${Date.now()}_${w.id}_${idx}`,
            year: newYear,
            age: newAge,
            title: eventTitle,
            description: ev.description,
            type: 'war',
            isImportant
          });
        });

        const warUpkeep = Math.round((w.playerLevies || w.yearlyTroops || 0) * 0.003);

        return {
          ...w,
          warScore: newScore,
          warYear: w.warYear + 1,
          warFatigueLevel: clash.warFatigue.fatigueLevel,
          annualUpkeepCost: warUpkeep,
          playerLevies: updatedPlayerLevies,
          enemyLevies: updatedEnemyLevies,
          enemyTactics: clash.nextEnemyTactics,
          commanders: clash.updatedCommanders,
          lastBattleReport: {
            year: newYear,
            title: clash.title,
            description: clash.description,
            won: clash.won,
            casualtiesPlayer: clash.playerCasualties,
            casualtiesEnemy: clash.enemyCasualties,
            scoreDelta: clash.scoreDelta,
            tacticalMatchup: clash.tacticalNarrative,
            commanderEvents: clash.commanderEvents.map(e => e.description),
            infrastructureDamageText: clash.infrastructureDevastation.damagedHoldingsDescription
          },
          battleLog: [
            {
              year: newYear,
              title: clash.title,
              description: clash.description,
              won: clash.won,
              casualtiesPlayer: clash.playerCasualties,
              casualtiesEnemy: clash.enemyCasualties,
              tacticalMatchup: clash.tacticalNarrative,
              commanderEvents: clash.commanderEvents.map(e => e.description),
              infrastructureDamageText: clash.infrastructureDevastation.damagedHoldingsDescription
            },
            ...w.battleLog
          ]
        };
      }));
    }

    // 7. Deduct Real Battle Casualties from Controlled Provinces & Apply Theater Devastation
    let remainingLossesToDeduct = totalAnnualPlayerCasualties;
    const playerProvincesCount = baseUpdatedProvinces.filter(p => p.isPlayerControlled).length;
    
    const updatedProvinces = baseUpdatedProvinces.map(p => {
      if (!p.isPlayerControlled) return p;
      if (remainingLossesToDeduct <= 0) return p;

      const provinceLossShare = Math.min(p.troops - 50, Math.ceil(totalAnnualPlayerCasualties / Math.max(1, playerProvincesCount)));
      const actualLosses = Math.max(0, provinceLossShare);
      remainingLossesToDeduct -= actualLosses;

      // Devastation in provinces if there are active wars
      const devastationProsperity = activeWars.length > 0 ? 3 : 0;
      const devastationUnrest = activeWars.length > 0 ? 4 : 0;

      return {
        ...p,
        troops: Math.max(50, p.troops - actualLosses),
        armyStrength: Math.max(50, p.troops - actualLosses),
        prosperity: Math.max(5, p.prosperity - devastationProsperity),
        unrest: Math.min(100, p.unrest + devastationUnrest)
      };
    });

    const newTotalArmyPower = updatedProvinces
      .filter(p => p.isPlayerControlled)
      .reduce((sum, p) => sum + p.troops, 0) + vassals.reduce((sum, v) => sum + v.levyContribution, 0);

    // 7b. Opportunistic AI Invasions (Hostile realms attack if player is fatigued or army is depleted)
    let opportunisticWar: WarState | null = null;
    const isPlayerVulnerable = (maxWarFatigue >= 2 || (character.stats.health < 40 && activeWars.length > 0) || (character.stats.gold < 30 && activeWars.length > 0));
    
    if (isPlayerVulnerable && activeWars.length <= 1 && Math.random() < 0.35) {
      const hostileRealm = realms.find(r => 
        r.opinion < 15 && 
        !activeWars.some(w => w.targetRealmId === r.id || w.targetRealmName.toLowerCase() === r.name.toLowerCase()) &&
        !r.isAtWarWithPlayer
      );

      if (hostileRealm) {
        const oppWarId = `war_opp_${Date.now()}`;
        opportunisticWar = {
          id: oppWarId,
          title: `Invasion by ${hostileRealm.name}`,
          targetType: 'realm',
          targetRealmId: hostileRealm.id,
          targetRealmName: hostileRealm.name,
          targetProvinceName: hostileRealm.capitalName,
          targetLeaderName: hostileRealm.leaderName,
          targetLeaderPortrait: hostileRealm.leaderPortrait,
          targetLeaderTitle: hostileRealm.leaderTitle,
          targetLeaderAge: hostileRealm.leaderProfile?.age || 45,
          targetLeaderOpinion: hostileRealm.opinion,
          warGoal: `Opportunistic Border Invasion against ${character.dynastyName}`,
          claimUsed: 'Imperial Hegemony & Exploitation of Weakness',
          yearlyTroops: Math.max(10, Math.round(newTotalArmyPower * 0.75)),
          maxYearlyTroops: newTotalArmyPower,
          isPlayerCommanding: false,
          playerLevies: Math.max(10, Math.round(newTotalArmyPower * 0.75)),
          enemyLevies: hostileRealm.armyStrength || 8500,
          enemyMaxLevies: (hostileRealm.armyStrength || 8500) * 1.4,
          warScore: -15, // Enemy has initial offensive momentum
          warYear: 1,
          lastTacticsChangeYear: newYear,
          playerTactics: 'Highland Defense & Fortress Siege',
          enemyTactics: 'Frontline Shock Charge',
          plunderCount: 0,
          commanders: [
            {
              id: `cmd_opp_1_${oppWarId}`,
              name: 'Border March Warden',
              role: 'Grand Marshal',
              portrait: '🛡️',
              martial: 25,
              trait: 'Frontline Bastion',
              assignedTroops: Math.round(newTotalArmyPower * 0.25),
              status: 'Ready'
            },
            {
              id: `cmd_opp_2_${oppWarId}`,
              name: 'Vanguard Knight Commander',
              role: 'Vanguard Commander',
              portrait: '🤴',
              martial: 27,
              trait: 'Disciplined Heavy Vanguard',
              assignedTroops: Math.round(newTotalArmyPower * 0.15),
              status: 'Ready'
            }
          ],
          battleLog: [
            {
              year: newYear,
              title: `Opportunistic War Declared by ${hostileRealm.name}`,
              description: `${hostileRealm.leaderName} of ${hostileRealm.name} perceived our prolonged campaigns and launched an opportunistic invasion across the border!`,
              won: false,
              casualtiesPlayer: 0,
              casualtiesEnemy: 0
            }
          ]
        };

        warBattleChronicles.push({
          id: `chron_opp_war_${Date.now()}`,
          year: newYear,
          age: newAge,
          title: `⚔️ OPPORTUNISTIC INVASION: ${hostileRealm.name} Attacks!`,
          description: `${hostileRealm.leaderName} has declared war against us, seeking to capitalize on our imperial exhaustion and war fatigue! Royal banners must rally for homeland defense.`,
          type: 'war',
          isImportant: true
        });

        // Set realm as at war
        setRealms(prev => prev.map(r => r.id === hostileRealm.id ? { ...r, isAtWarWithPlayer: true, opinion: -80 } : r));
        setActiveWars(prev => [opportunisticWar!, ...prev]);
      }
    }

    // 8. Dynamic Feudal Tier Evaluation (Count -> Duke -> King -> Emperor)
    const controlledCount = updatedProvinces.filter(p => p.isPlayerControlled).length;
    const tier = getFeudalTierFromProvinces(controlledCount, character.dynastyName);
    let rankElevationChronicle: ChronicleEntry | null = null;
    let newRank = character.rank;
    let newTitle = character.title || tier.title;

    if (tier.rank !== character.rank) {
      newRank = tier.rank;
      newTitle = tier.title;
      rankElevationChronicle = {
        id: `chron_elevation_${Date.now()}`,
        year: newYear,
        age: newAge,
        title: `👑 Dynastic Elevation: Ascended to ${tier.rank}!`,
        description: `With ${controlledCount} consolidated provincial counties under sovereign domain, your realm has risen from ${character.rank} to ${tier.rank} of ${character.dynastyName}!`,
        type: 'realm',
        isImportant: true
      };
    }

    // 8b. Update Character State
    const updatedHappiness = Math.max(0, Math.min(100, character.stats.happiness - fatigueHappinessPenalty));
    const updatedStats = {
      ...character.stats,
      gold: newGold,
      renown: character.stats.renown + artifactRenownBonus,
      health: newHealth,
      happiness: updatedHappiness,
      specialResource: newSpecialResource
    };

    const updatedChar: Character = {
      ...character,
      rank: newRank,
      title: newTitle,
      titlesHeld: Array.from(new Set([newTitle, ...character.titlesHeld])),
      age: newAge,
      stats: updatedStats,
      alive: newHealth > 0,
      causeOfDeath: newHealth === 0 ? 'Severe Illness & Battlefield Injuries' : undefined
    };

    setCharacter(updatedChar);
    setFamilyMembers(updatedFamily);
    setProvinces(updatedProvinces);
    setCurrentYear(newYear);
    setReignYears(newReign);

    // 8b. Simulate Annual NPC, Vassal & Foreign Leader Dynastic Changes (Marriages, Children, Aging)
    const leadersToSimulate = realms.map(r => r.leaderProfile).filter(Boolean) as any[];
    const simResults = simulateWorldFamiliesYearAdvance(vassals, realmNPCs, leadersToSimulate, newYear);
    
    setVassals(simResults.updatedVassals);
    setRealmNPCs(simResults.updatedNPCs);
    if (simResults.updatedLeaders.length > 0) {
      setRealms(prev => prev.map(r => {
        const matchingLeader = simResults.updatedLeaders.find(l => l.name === r.leaderProfile?.name);
        return matchingLeader ? { ...r, leaderProfile: matchingLeader } : r;
      }));
    }

    const dynasticAnnouncements: ChronicleEntry[] = simResults.events.map(ev => ({
      id: ev.id,
      year: newYear,
      age: newAge,
      title: ev.title,
      description: ev.description,
      type: ev.type === 'birth' ? 'birth' : 'family',
      isImportant: ev.type === 'birth'
    }));

    // 9. Add Annual Chronicle Reports with War Upkeep, Casualties & Fatigue Breakdown
    const upkeepText = totalWarUpkeep > 0 ? ` Paid -${totalWarUpkeep} 🪙 in active military levy upkeep.` : '';
    const casualtyText = totalAnnualPlayerCasualties > 0 
      ? ` Frontline clashes resulted in ${totalAnnualPlayerCasualties.toLocaleString()} imperial casualties and ${totalAnnualEnemyCasualties.toLocaleString()} enemy casualties.` 
      : '';
    const fatigueNotice = maxWarFatigue > 0 
      ? ` ⚠️ War Fatigue Stage ${maxWarFatigue} is impacting provinces (-${fatigueProsperityDrain}% Prosperity, +${fatigueUnrestSpike}% Unrest, -${(fatigueRecruitmentPenalty * 100).toFixed(0)}% Levy Growth).`
      : '';
    const deficitNotice = hasUpkeepDeficit ? ' ⚠️ TREASURY DEFICIT: Insufficient funds for military upkeep! Desertions and unrest reported.' : '';

    setChronicleEntries(prev => [
      ...(rankElevationChronicle ? [rankElevationChronicle] : []),
      ...tutorChronicles,
      ...intrigueChronicles,
      ...interceptedCaravanChronicles,
      ...warBattleChronicles,
      ...dynasticAnnouncements,
      {
        id: `chron_${newYear}_${Date.now()}`,
        year: newYear,
        age: newAge,
        title: `Year ${newYear} AD — Annual State Report`,
        description: `Collected ${totalYearlyGrossGold} 🪙 in gross taxes, tribute, and trade.${upkeepText}${casualtyText}${fatigueNotice}${deficitNotice} Raised +${totalNewRecruits} new recruits. Standing forces: ${newTotalArmyPower.toLocaleString()} total soldiers.`,
        type: 'realm'
      },
      ...prev
    ]);

    // 10. Check for Dynamic Power Struggles & Crises (Factions, Rebellions, Assassination Plots)
    let triggeredCrisis: CrisisPayload | null = null;

    // Check Faction Rebellions
    const dangerousFaction = vassalFactions.find(f => f.discontentLevel >= 55 && f.militaryPowerPercent >= 30);
    if (dangerousFaction && Math.random() < 0.45) {
      triggeredCrisis = {
        id: `crisis_reb_${Date.now()}`,
        type: 'vassal_rebellion',
        title: `⚡ Vassal Ultimatum: ${dangerousFaction.title}`,
        category: 'Feudal Insurrection',
        description: `Discontented lords have mobilized ${dangerousFaction.militaryPowerPercent}% of the realm's military strength under ${dangerousFaction.leaderName}! They demand lower taxation and sovereign charter autonomy, or they will march upon the capital.`,
        icon: '⚔️',
        instigator: {
          name: dangerousFaction.leaderName,
          title: 'Rebel Faction Leader',
          portrait: '⚔️',
          species: character.species,
          houseName: 'Dissident League'
        },
        options: [
          {
            id: 'crush_rebellion',
            text: '🛡️ Mobilize Imperial Legions & Crush the Rebels',
            description: 'Refuse all demands and deploy the crown army to annihilate the rebellious vassals on the field of honor.',
            requirements: {
              martial: 15
            },
            outcome: {
              text: 'You raise the royal banner! The imperial legions clash in open civil war against the rebel coalition.',
              startCivilWar: true,
              renownDelta: 35
            }
          },
          {
            id: 'bribe_ringleaders',
            text: '🪙 Pay Off Faction Ring-Leaders (-150 Gold)',
            description: 'Distribute gold and promises of lucrative trade monopolies to fracture the rebel leadership.',
            requirements: {
              gold: 150
            },
            outcome: {
              text: 'Heavily laden chests of gold reach the rebel camp. The ringleaders disband their levies with pockets full.',
              goldDelta: -150,
              unrestDelta: -25,
              opinionDelta: 15
            }
          },
          {
            id: 'concede_charter',
            text: '📜 Grant Autonomous Charter & Lower Taxes',
            description: 'Sign a royal compromise conceding minor fiscal liberties to preserve domestic stability.',
            outcome: {
              text: 'You formally seal the Charter of Liberties. The lords cheer your magnanimous moderation, though the crown treasury takes a hit.',
              goldDelta: -50,
              renownDelta: -15,
              unrestDelta: -30,
              opinionDelta: 20
            }
          }
        ]
      };
    } else if (Math.random() < 0.22) {
      // Check for Assassination Plot
      const disgruntledVassal = vassals.find(v => v.opinion < 25 || (v.loyalty ?? 70) < 35);
      const enemyRealm = realms.find(r => r.opinion < -40 || r.isAtWarWithPlayer);
      const plotterName = disgruntledVassal ? disgruntledVassal.name : (enemyRealm ? `${enemyRealm.leaderName} of ${enemyRealm.name}` : 'A Hidden Court Conspirator');
      const targetIsChild = Math.random() < 0.35 && updatedFamily.filter(f => f.alive && f.relation === 'Child').length > 0;
      const targetChild = targetIsChild ? updatedFamily.find(f => f.alive && f.relation === 'Child') : null;
      
      triggeredCrisis = {
        id: `crisis_ass_${Date.now()}`,
        type: targetIsChild ? 'assassination_plot_child' : 'assassination_plot_player',
        title: targetIsChild 
          ? `🗡️ Treasonous Attempt on ${targetChild?.title || 'Prince'} ${targetChild?.name}`
          : `🗡️ Shadow Dagger: Assassination Attempt on Your Life!`,
        category: 'Intrigue & Murder Scheme',
        description: targetIsChild
          ? `Master of Whispers alerts you: an infiltrated food-taster attempted to poison the evening goblet of ${targetChild?.name}! Fast reflexes or keen intrigue are required to counter the strike.`
          : `In the dead of night, armed assassins silently scaled the outer ramparts and infiltrated the royal bedchambers with poisoned blades!`,
        icon: '🥷',
        instigator: {
          name: plotterName,
          title: disgruntledVassal ? 'Discontented Vassal Lord' : 'Foreign Infiltrator',
          portrait: disgruntledVassal?.portrait || '🥷',
          species: disgruntledVassal?.species || character.species,
          houseName: disgruntledVassal?.houseName || 'Conspirators'
        },
        options: [
          {
            id: 'intrigue_counter',
            text: '🕵️ Counter-Ambush with Spymaster Network (Intrigue Check)',
            description: 'Turn the ambush around with hidden bodyguards and capture the ringleaders alive for interrogation.',
            requirements: {
              intrigue: 14
            },
            outcome: {
              text: 'Your hidden agents spring from behind the royal tapestries! The assassin is captured alive and confesses all under oath.',
              capturedConspirator: true,
              renownDelta: 25,
              unrestDelta: -10
            }
          },
          {
            id: 'martial_duel',
            text: '⚔️ Draw Blade and Slay the Infiltrator (Martial Check)',
            description: 'Rely on warrior prowess to parry the fatal strike and cut down the assassin single-handedly.',
            requirements: {
              martial: 12
            },
            outcome: {
              text: 'Steel rings against steel! You parry the poison dagger and run the assassin through, leaving their blood across the stone tiles.',
              renownDelta: 40,
              healthDelta: -5
            }
          },
          {
            id: 'sound_alarm',
            text: '📢 Sound the Palace Horns & Shelter Behind the Shield Wall',
            description: 'Call the household garrison to flood the halls while retreating into the fortified inner sanctum.',
            outcome: {
              text: 'The palace horns echo into the night. Royal guards rush the chambers and drive away the intruders, though the assassin escapes into the shadows.',
              healthDelta: -10,
              unrestDelta: 10
            }
          }
        ]
      };
    }

    if (triggeredCrisis) {
      setActiveCrisis(triggeredCrisis);
    } else if (newHealth > 0) {
      // 11. Trigger Regular Random Event Dilemma if no crisis
      const randomEvent = EVENTS_POOL[Math.floor(Math.random() * EVENTS_POOL.length)];
      setActiveEvent(randomEvent);
    }
  };

  // Event Choice Resolver
  const handleSelectEventChoice = (choiceId: string) => {
    if (!activeEvent) return;
    const choice = activeEvent.choices.find(c => c.id === choiceId);
    if (!choice) return;

    const outcome = choice.outcome;

    // Apply stat changes
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        gold: prev.stats.gold + (outcome.gold || 0),
        renown: prev.stats.renown + (outcome.renown || 0),
        happiness: Math.min(100, Math.max(0, prev.stats.happiness + (outcome.happiness || 0))),
        health: Math.min(100, Math.max(0, prev.stats.health + (outcome.health || 0))),
        pietyOrMana: Math.min(100, Math.max(0, prev.stats.pietyOrMana + (outcome.pietyOrMana || 0))),
        martial: Math.min(100, Math.max(0, prev.stats.martial + (outcome.martial || 0))),
        intrigue: Math.min(100, Math.max(0, prev.stats.intrigue + (outcome.intrigue || 0))),
        diplomacy: Math.min(100, Math.max(0, prev.stats.diplomacy + (outcome.diplomacy || 0))),
        intellect: Math.min(100, Math.max(0, prev.stats.intellect + (outcome.intellect || 0))),
        specialResource: Math.min(100, Math.max(0, prev.stats.specialResource + (outcome.specialResource || 0)))
      },
      traits: outcome.newTrait && !prev.traits.includes(outcome.newTrait) 
        ? [...prev.traits, outcome.newTrait] 
        : prev.traits
    }));

    // Opinion shift with target realm
    if (outcome.targetRealmId && outcome.opinionChange) {
      setRealms(prev => prev.map(r => 
        r.id === outcome.targetRealmId 
          ? { ...r, opinion: Math.min(100, Math.max(-100, r.opinion + (outcome.opinionChange || 0))) }
          : r
      ));
    }

    // Marriage trigger from event
    if (outcome.triggerMarriage) {
      const newSpouse: FamilyMember = {
        id: `spouse_${Date.now()}`,
        name: outcome.triggerMarriage.partnerName,
        species: outcome.triggerMarriage.partnerSpecies,
        gender: 'Female',
        relation: 'Spouse',
        age: 20,
        alive: true,
        health: 95,
        opinion: 90,
        childrenIds: [],
        realmId: outcome.targetRealmId || 'realm_vampire',
        title: 'Royal Consort',
        isHeir: false,
        traits: ['Royal Blood', 'High Noble'],
        portrait: outcome.triggerMarriage.partnerSpecies === 'Vampire' ? '🥀' : outcome.triggerMarriage.partnerSpecies === 'Witch' ? '🔮' : '👸'
      };
      setFamilyMembers(prev => [...prev.filter(m => m.relation !== 'Spouse'), newSpouse]);
    }

    // Add chronicle entry
    setChronicleEntries(prev => [
      {
        id: `event_chron_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: activeEvent.title,
        description: outcome.text,
        type: 'court',
        isImportant: true
      },
      ...prev
    ]);

    setActiveEvent(null);
  };

  // Building Construction
  const handleUpgradeBuilding = (provinceId: string, buildingKey: keyof Province['buildings'], cost: number) => {
    if (character.stats.gold < cost) return;

    const bConfig = BUILDINGS_CONFIG.find(b => b.key === buildingKey);
    const effects = bConfig?.effectsPerLevel || {};

    const renownGain = effects.renownBonus || 5;
    const pietyGain = effects.pietyOrManaBonus || 0;

    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        gold: prev.stats.gold - cost,
        renown: prev.stats.renown + renownGain,
        pietyOrMana: Math.min(100, prev.stats.pietyOrMana + pietyGain)
      }
    }));

    let upgradedProvinceName = '';
    let newTroopsAdded = 0;

    setProvinces(prev => prev.map(p => {
      if (p.id !== provinceId) return p;
      upgradedProvinceName = p.name;
      const currentLevel = p.buildings[buildingKey] || 0;
      const troopBonus = effects.troopsBonus || 0;
      const incomeBonus = effects.incomeBonus || 0;
      const unrestRed = effects.unrestReduction || 0;
      const prospBonus = effects.prosperityBonus || 0;

      newTroopsAdded = troopBonus;
      const updatedTroopCount = (p.troops || 450) + troopBonus;

      return {
        ...p,
        income: p.income + incomeBonus,
        troops: updatedTroopCount,
        armyStrength: updatedTroopCount,
        prosperity: Math.min(100, p.prosperity + prospBonus),
        unrest: Math.max(0, p.unrest - unrestRed),
        buildings: {
          ...p.buildings,
          [buildingKey]: currentLevel + 1
        }
      };
    }));

    setChronicleEntries(prev => [
      {
        id: `build_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: `Upgraded ${bConfig?.name || String(buildingKey)} in ${upgradedProvinceName || 'County'}`,
        description: `Constructed tier ${((provinces.find(p => p.id === provinceId)?.buildings[buildingKey] || 0) + 1)} of ${bConfig?.name || String(buildingKey)}. Gained ${effects.incomeBonus ? `+${effects.incomeBonus} 🪙 tax, ` : ''}${newTroopsAdded ? `+${newTroopsAdded} ⚔️ levies, ` : ''}${effects.prosperityBonus ? `+${effects.prosperityBonus} ✨ prosperity.` : 'defense and fortification.'}`,
        type: 'building'
      },
      ...prev
    ]);
  };

  // Province Relief Investments
  const handleInvestProvince = (provinceId: string, cost: number) => {
    if (character.stats.gold < cost) return;
    setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: prev.stats.gold - cost } }));
    setProvinces(prev => prev.map(p => p.id === provinceId ? { ...p, prosperity: Math.min(100, p.prosperity + 12), income: p.income + 10 } : p));
  };

  const handleHoldProvinceFestival = (provinceId: string, cost: number) => {
    if (character.stats.gold < cost) return;
    setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: prev.stats.gold - cost, happiness: Math.min(100, prev.stats.happiness + 8) } }));
    setProvinces(prev => prev.map(p => p.id === provinceId ? { ...p, unrest: Math.max(0, p.unrest - 20) } : p));
  };

  // Grant / Bestow Province to Family Member, Vassal, or New Noble
  const handleGrantProvince = (
    provinceId: string, 
    recipientType: 'family' | 'vassal' | 'new_noble', 
    recipientId: string, 
    recipientName: string
  ) => {
    const targetProv = provinces.find(p => p.id === provinceId);
    if (!targetProv) return;

    // Update province governor
    setProvinces(prev => prev.map(p => {
      if (p.id !== provinceId) return p;
      return {
        ...p,
        governorName: recipientName,
        governorId: recipientId
      };
    }));

    if (recipientType === 'family') {
      setFamilyMembers(prev => prev.map(m => m.id === recipientId ? { ...m, opinion: Math.min(100, m.opinion + 50) } : m));
    } else if (recipientType === 'vassal') {
      setVassals(prev => prev.map(v => v.id === recipientId ? { ...v, loyalty: Math.min(100, v.loyalty + 25), opinion: Math.min(100, v.opinion + 50) } : v));
    } else if (recipientType === 'new_noble') {
      const newVassal: Vassal = {
        id: recipientId,
        name: recipientName,
        species: character.species,
        gender: 'Male',
        age: 30,
        title: `Lord of ${targetProv.name.replace(/^The\s+/, '')}`,
        houseName: recipientName.split(' ').pop() || 'Valoria',
        countyName: targetProv.name,
        duchyName: 'Ducal March',
        duchyControl: 80,
        kingdomName: realms.find(r => r.id === targetProv.realmId)?.name || 'Valoria',
        kingdomControl: 50,
        empireName: 'Grand Empire',
        empireControl: 25,
        culture: 'Imperial',
        troops: targetProv.troops * 2,
        maxTroops: targetProv.troops * 3,
        holdingsCount: 1,
        provinceId: targetProv.id,
        provinceName: targetProv.name,
        councilRole: undefined,
        loyalty: 100,
        opinion: 95,
        taxContribution: Math.round(targetProv.income * 0.4),
        levyContribution: Math.round(targetProv.troops * 0.5),
        taxRate: 'Normal',
        levyObligation: 'Standard',
        faction: 'Loyalist',
        traits: ['Ennobled Knight', 'Fiercely Loyal'],
        portrait: '🛡️',
        stats: {
          martial: 75,
          diplomacy: 60,
          intrigue: 50,
          intellect: 65,
          prowess: 80,
          stewardship: 70
        }
      };
      setVassals(prev => [newVassal, ...prev]);
    }

    setChronicleEntries(prev => [
      {
        id: `fief_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: `Royal Enfeoffment: ${targetProv.name}`,
        description: `Bestowed the lordship and governance of ${targetProv.name} upon ${recipientName}. Sealed with the sovereign signet ring.`,
        type: 'realm',
        isImportant: true
      },
      ...prev
    ]);
  };

  // Claim Title of Emperor (When controlling >= 50% of a realm)
  const handleClaimEmperorTitle = (realmId: string, realmName: string) => {
    const imperialTitle = `Emperor of ${realmName}`;
    setCharacter(prev => ({
      ...prev,
      rank: 'Emperor',
      title: imperialTitle,
      titlesHeld: Array.from(new Set([imperialTitle, ...prev.titlesHeld])),
      stats: {
        ...prev.stats,
        renown: prev.stats.renown + 500,
        pietyOrMana: prev.stats.pietyOrMana + 100,
        happiness: Math.min(100, prev.stats.happiness + 50)
      }
    }));

    setChronicleEntries(prev => [
      {
        id: `coronation_emp_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: `👑 Imperial Coronation: Emperor of ${realmName}!`,
        description: `Having conquered and consolidated sovereignty over more than 50% of ${realmName}, you were crowned Emperor under the highest divine rites! All neighboring realms bow before your hegemony.`,
        type: 'birth',
        isImportant: true
      },
      ...prev
    ]);
  };

  // Heir & Family Management
  const handleDesignateHeir = (memberId: string) => {
    setFamilyMembers(prev => prev.map(m => ({
      ...m,
      isHeir: m.id === memberId
    })));
  };

  const handleSetEducationTrack = (memberId: string, track: string) => {
    setFamilyMembers(prev => prev.map(m => m.id === memberId ? { ...m, educationTrack: track } : m));
  };

  const handleStudyHarder = (memberId: string, cost: number) => {
    if (character.stats.gold < cost) return;
    setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: prev.stats.gold - cost } }));
    setFamilyMembers(prev => prev.map(m => m.id === memberId ? { ...m, opinion: Math.min(100, m.opinion + 10) } : m));
  };

  const handleGiftFamily = (memberId: string, cost: number) => {
    if (character.stats.gold < cost) return;
    setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: prev.stats.gold - cost } }));
    setFamilyMembers(prev => prev.map(m => m.id === memberId ? { ...m, opinion: Math.min(100, m.opinion + 20) } : m));
  };

  const handleSpendTimeWithMember = (memberId: string) => {
    setCharacter(prev => ({ ...prev, stats: { ...prev.stats, happiness: Math.min(100, prev.stats.happiness + 10) } }));
    setFamilyMembers(prev => prev.map(m => m.id === memberId ? { ...m, opinion: Math.min(100, m.opinion + 15) } : m));
  };

  // Cross-Realm Royal Marriage
  const handleProposeCrossMarriage = (targetRealmId: string, partnerSpecies: Species, partnerName: string, dowry: number) => {
    const newSpouse: FamilyMember = {
      id: `spouse_${Date.now()}`,
      name: partnerName,
      species: partnerSpecies,
      gender: 'Female',
      relation: 'Spouse',
      age: 21,
      alive: true,
      health: 100,
      opinion: 85,
      childrenIds: [],
      realmId: targetRealmId,
      title: 'Royal Consort',
      isHeir: false,
      traits: ['Noble Bloodline', 'Allied House'],
      portrait: partnerSpecies === 'Vampire' ? '🥀' : partnerSpecies === 'Witch' ? '🔮' : partnerSpecies === 'Werewolf' ? '🐺' : '🧝'
    };

    setFamilyMembers(prev => [...prev.filter(m => m.relation !== 'Spouse'), newSpouse]);
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        gold: prev.stats.gold + dowry,
        renown: prev.stats.renown + 30
      }
    }));

    setRealms(prev => prev.map(r => r.id === targetRealmId ? { ...r, opinion: Math.min(100, r.opinion + 40) } : r));

    setChronicleEntries(prev => [
      {
        id: `wedding_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: `Royal Inter-Species Wedding: ${partnerName}`,
        description: `Forged a grand cross-realm marriage alliance with ${partnerSpecies} nobility of ${realms.find(r => r.id === targetRealmId)?.name}. Dowry: +${dowry} 🪙.`,
        type: 'diplomacy',
        isImportant: true
      },
      ...prev
    ]);
  };

  // Diplomacy & Treaties
  const handleSendGift = (targetRealmId: string, goldAmount: number) => {
    if (character.stats.gold < goldAmount) return;
    setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: prev.stats.gold - goldAmount } }));
    setRealms(prev => prev.map(r => r.id === targetRealmId ? { ...r, opinion: Math.min(100, r.opinion + 25) } : r));
  };

  const handleSignTreaty = (targetRealmId: string, treaty: TreatyType) => {
    setRealms(prev => prev.map(r => {
      if (r.id !== targetRealmId) return r;
      if (r.treaties.includes(treaty)) return r;
      return {
        ...r,
        opinion: Math.min(100, r.opinion + 20),
        treaties: [...r.treaties, treaty]
      };
    }));

    setChronicleEntries(prev => [
      {
        id: `treaty_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: `Treaty Ratified: ${treaty}`,
        description: `Signed a diplomatic ${treaty} with ${realms.find(r => r.id === targetRealmId)?.name}.`,
        type: 'diplomacy'
      },
      ...prev
    ]);
  };

  // Interactive Realm NPC handlers
  const handleUpdateNPC = (updated: RealmNPC) => {
    setRealmNPCs(prev => prev.map(n => n.id === updated.id ? updated : n));
  };

  const handleEmployNPCAsVassal = (npc: RealmNPC) => {
    const roleForVassal: CouncilRole = npc.role === 'Grand Marshal' ? 'Marshal' 
      : npc.role === 'Master of Whispers' ? 'Spymaster' 
      : (npc.role === 'High Inquisitor' || npc.role === 'High Priestess') ? 'HighPriest' 
      : npc.role === 'Lord Chancellor' ? 'Chancellor' 
      : 'GrandTreasurer';

    const newVassal: Vassal = {
      id: `vassal_recruited_${npc.id}`,
      name: npc.name,
      species: npc.species,
      gender: npc.gender,
      age: npc.age,
      title: `${npc.title} (Royal Court)`,
      houseName: npc.houseName,
      countyName: 'Royal Court Seat',
      duchyName: 'Imperial Crown Domain',
      duchyControl: 90,
      kingdomName: 'Crown Realm',
      kingdomControl: 85,
      empireName: 'Grand Empire',
      empireControl: 80,
      culture: npc.species,
      troops: 150,
      maxTroops: 300,
      holdingsCount: 1,
      provinceId: provinces.find(p => p.isPlayerControlled)?.id || 'prov_brecknock',
      provinceName: 'Crown Demesne',
      councilRole: roleForVassal,
      loyalty: 88,
      opinion: Math.max(75, npc.opinion),
      taxContribution: 25,
      levyContribution: 150,
      taxRate: 'Normal',
      levyObligation: 'Standard',
      faction: 'Loyalist',
      traits: npc.traits,
      portrait: npc.portrait,
      stats: {
        martial: npc.stats.martial,
        diplomacy: npc.stats.diplomacy,
        intrigue: npc.stats.intrigue,
        intellect: npc.stats.intellect,
        prowess: npc.stats.prowess,
        stewardship: npc.stats.stewardship
      },
      family: {
        children: [],
        parents: []
      }
    };

    setVassals(prev => {
      if (prev.some(v => v.id === newVassal.id)) return prev;
      return [...prev, newVassal];
    });

    setRealmNPCs(prev => prev.map(n => n.id === npc.id ? { ...n, isRecruitedToPlayerCourt: true, relationshipStatus: 'Sworn Vassal' } : n));
  };

  // Low-born Provincial Soldier Interactive System Handlers
  const handleKnightSoldier = (soldier: ProvincialSoldier, ennobledName: string, houseName: string) => {
    if (character.stats.gold < 50) return;

    const soldierRealm = provinces.find(p => p.id === soldier.provinceId)?.realmId || 'realm_human';
    const soldierAge = 22 + (soldier.rankTier * 2) + (soldier.battlesFought % 8);

    const ennobledVassal: Vassal = {
      id: `ennobled_vassal_${soldier.id}_${Date.now()}`,
      name: `${ennobledName} of House ${houseName}`,
      species: soldier.species,
      gender: soldier.gender,
      age: soldierAge,
      title: `Knight-Lord of ${soldier.provinceName}`,
      houseName: houseName,
      countyName: soldier.provinceName,
      duchyName: 'Ducal Garrison March',
      duchyControl: 90,
      kingdomName: realms.find(r => r.id === soldierRealm)?.name || 'Valoria',
      kingdomControl: 70,
      empireName: 'Grand Empire',
      empireControl: 40,
      culture: realms.find(r => r.id === soldierRealm)?.name?.split(' ')[0] || 'Valorian',
      troops: 350 + soldier.prowess * 5,
      maxTroops: 600 + soldier.prowess * 8,
      holdingsCount: 1,
      provinceId: soldier.provinceId,
      provinceName: soldier.provinceName,
      councilRole: 'Marshal',
      loyalty: 100,
      opinion: 100,
      taxContribution: 30,
      levyContribution: Math.round(200 + soldier.martial * 2),
      taxRate: 'Normal',
      levyObligation: 'Extensive',
      faction: 'Loyalist',
      traits: ['Low-Born Knighted', ...soldier.specialMartialTraits],
      portrait: soldier.portrait,
      stats: {
        martial: Math.min(100, soldier.martial + 15),
        diplomacy: Math.min(100, 50 + Math.round(soldier.martial * 0.2)),
        intrigue: Math.min(100, 45 + soldier.rankTier * 3),
        intellect: 65,
        prowess: Math.min(100, soldier.prowess + 10),
        stewardship: Math.min(100, 55 + soldier.rankTier * 2)
      },
      family: {
        children: [],
        parents: []
      }
    };

    // Deduct cost and bestow prestige
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        gold: prev.stats.gold - 50,
        renown: prev.stats.renown + 35,
        happiness: Math.min(100, prev.stats.happiness + 5)
      }
    }));

    // Add to vassals
    setVassals(prev => [ennobledVassal, ...prev]);

    // Update soldier status in provincial garrison
    setProvincialSoldiers(prev => {
      const currentList = prev[soldier.provinceId] || [];
      return {
        ...prev,
        [soldier.provinceId]: currentList.map(s => s.id === soldier.id ? {
          ...s,
          name: ennobledName,
          rank: 'Knight of the Realm' as SoldierRank,
          rankTier: 7,
          status: 'knighted' as const,
          knightedTitle: `Sir ${ennobledName}`,
          ennobledHouseName: houseName,
          nobleVassalId: ennobledVassal.id,
          fealtyOathPledged: true,
          loyalty: 100,
          martial: Math.min(99, s.martial + 12),
          prowess: Math.min(99, s.prowess + 10)
        } : s)
      };
    });

    // Add chronicle
    setChronicleEntries(prev => [
      {
        id: `knighted_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: `🎖️ Soldier Knighted: Sir ${ennobledName} of House ${houseName}`,
        description: `Elevated common provincial soldier ${soldier.name} from the ranks to high nobility as Knight-Lord of ${soldier.provinceName}! Swore undying loyalty to our crown.`,
        type: 'realm',
        isImportant: true
      },
      ...prev
    ]);

    sound.playFanfare();
  };

  const handlePromoteSoldier = (soldierId: string) => {
    let foundProvId = '';
    let targetSoldier: ProvincialSoldier | undefined;

    for (const [provId, rawSoldiers] of Object.entries(provincialSoldiers)) {
      const soldiers = (rawSoldiers || []) as ProvincialSoldier[];
      const found = soldiers.find(s => s.id === soldierId);
      if (found) {
        foundProvId = provId;
        targetSoldier = found;
        break;
      }
    }

    if (!targetSoldier || !foundProvId) return;

    const rankInfo = RANK_TIERS[targetSoldier.rank];
    if (!rankInfo || !rankInfo.nextRank) return;

    const cost = rankInfo.promoteCost;
    if (character.stats.gold < cost) return;

    const nextRank = rankInfo.nextRank;
    const nextRankTier = RANK_TIERS[nextRank]?.tier || (targetSoldier.rankTier + 1);

    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        gold: prev.stats.gold - cost,
        renown: prev.stats.renown + 5
      }
    }));

    setProvincialSoldiers(prev => {
      const list = (prev[foundProvId] || []) as ProvincialSoldier[];
      return {
        ...prev,
        [foundProvId]: list.map(s => s.id === soldierId ? {
          ...s,
          rank: nextRank,
          rankTier: nextRankTier,
          status: 'promoted' as const,
          martial: Math.min(99, s.martial + 6),
          prowess: Math.min(99, s.prowess + 5),
          loyalty: Math.min(100, s.loyalty + 8)
        } : s)
      };
    });

    sound.playSword();
  };

  const handleDemoteSoldier = (soldierId: string) => {
    let foundProvId = '';
    let targetSoldier: ProvincialSoldier | undefined;

    for (const [provId, rawSoldiers] of Object.entries(provincialSoldiers)) {
      const soldiers = (rawSoldiers || []) as ProvincialSoldier[];
      const found = soldiers.find(s => s.id === soldierId);
      if (found) {
        foundProvId = provId;
        targetSoldier = found;
        break;
      }
    }

    if (!targetSoldier || !foundProvId) return;

    const rankInfo = RANK_TIERS[targetSoldier.rank];
    if (!rankInfo || !rankInfo.prevRank) return;

    const prevRank = rankInfo.prevRank;
    const prevRankTier = RANK_TIERS[prevRank]?.tier || Math.max(1, targetSoldier.rankTier - 1);

    setProvincialSoldiers(prev => {
      const list = (prev[foundProvId] || []) as ProvincialSoldier[];
      return {
        ...prev,
        [foundProvId]: list.map(s => s.id === soldierId ? {
          ...s,
          rank: prevRank,
          rankTier: prevRankTier,
          status: 'demoted' as const,
          loyalty: Math.max(10, s.loyalty - 20)
        } : s)
      };
    });
  };

  const handleMakeProvincialHead = (soldier: ProvincialSoldier) => {
    setProvinces(prev => prev.map(p => p.id === soldier.provinceId ? {
      ...p,
      governorName: `${soldier.name} (Provincial Garrison Head)`,
      governorId: soldier.id,
      troops: (p.troops || 400) + 150
    } : p));

    setProvincialSoldiers(prev => {
      const list = (prev[soldier.provinceId] || []) as ProvincialSoldier[];
      return {
        ...prev,
        [soldier.provinceId]: list.map(s => s.id === soldier.id ? {
          ...s,
          rank: 'Provincial Head' as SoldierRank,
          rankTier: 7,
          status: 'provincial_head' as const,
          loyalty: 100,
          martial: Math.min(99, s.martial + 10)
        } : s.status === 'provincial_head' ? { ...s, status: 'active' as const } : s)
      };
    });

    setChronicleEntries(prev => [
      {
        id: `prov_head_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: `👑 Provincial Garrison Head Appointed: ${soldier.name}`,
        description: `Placed supreme garrison and defense command of ${soldier.provinceName} into the capable hands of ${soldier.name} (${soldier.rank}).`,
        type: 'realm',
        isImportant: true
      },
      ...prev
    ]);

    sound.playFanfare();
  };

  const handleImprisonSoldier = (soldierId: string) => {
    for (const [provId, rawSoldiers] of Object.entries(provincialSoldiers)) {
      const soldiers = (rawSoldiers || []) as ProvincialSoldier[];
      if (soldiers.some(s => s.id === soldierId)) {
        setProvincialSoldiers(prev => ({
          ...prev,
          [provId]: ((prev[provId] || []) as ProvincialSoldier[]).map(s => s.id === soldierId ? {
            ...s,
            status: 'imprisoned' as const,
            loyalty: Math.max(0, s.loyalty - 35)
          } : s)
        }));
        break;
      }
    }
  };

  const handleReleaseSoldier = (soldierId: string, withOath: boolean) => {
    for (const [provId, rawSoldiers] of Object.entries(provincialSoldiers)) {
      const soldiers = (rawSoldiers || []) as ProvincialSoldier[];
      if (soldiers.some(s => s.id === soldierId)) {
        setProvincialSoldiers(prev => ({
          ...prev,
          [provId]: ((prev[provId] || []) as ProvincialSoldier[]).map(s => s.id === soldierId ? {
            ...s,
            status: 'active' as const,
            loyalty: withOath ? Math.min(100, s.loyalty + 25) : s.loyalty,
            fealtyOathPledged: withOath ? true : s.fealtyOathPledged
          } : s)
        }));
        break;
      }
    }
  };

  const handleExecuteSoldier = (soldierId: string) => {
    for (const [provId, rawSoldiers] of Object.entries(provincialSoldiers)) {
      const soldiers = (rawSoldiers || []) as ProvincialSoldier[];
      if (soldiers.some(s => s.id === soldierId)) {
        setProvincialSoldiers(prev => ({
          ...prev,
          [provId]: ((prev[provId] || []) as ProvincialSoldier[]).filter(s => s.id !== soldierId)
        }));
        break;
      }
    }
  };

  const handleUpgradeSoldierGear = (soldierId: string, cost: number) => {
    if (character.stats.gold < cost) return;

    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        gold: prev.stats.gold - cost
      }
    }));

    for (const [provId, rawSoldiers] of Object.entries(provincialSoldiers)) {
      const soldiers = (rawSoldiers || []) as ProvincialSoldier[];
      const target = soldiers.find(s => s.id === soldierId);
      if (target) {
        setProvincialSoldiers(prev => ({
          ...prev,
          [provId]: ((prev[provId] || []) as ProvincialSoldier[]).map(s => s.id === soldierId ? {
            ...s,
            equipmentTier: 'Masterwork Gilded Plate',
            prowess: Math.min(99, s.prowess + 8),
            martial: Math.min(99, s.martial + 4),
            loyalty: Math.min(100, s.loyalty + 15)
          } : s)
        }));
        sound.playSword();
        break;
      }
    }
  };

  // Warfare & Conquest (Dedicated War & Realm/Province System)
  const handleDeclareWarOnTarget = (target: TargetEntity, claim: string, yearlyTroops: number, commandDirectly: boolean) => {
    const rawTroops = Math.min(totalArmyPower, Math.max(10, Math.round(yearlyTroops)));
    const newWarId = `war_${Date.now()}`;

    const newWar: WarState = {
      id: newWarId,
      title: `${target.name.replace(/^The\s+/, '')} Campaign`,
      targetType: target.type,
      targetRealmId: target.id,
      targetRealmName: target.name,
      targetProvinceName: target.name,
      targetLeaderName: target.leaderName,
      targetLeaderPortrait: target.leaderPortrait,
      targetLeaderTitle: target.leaderTitle,
      targetLeaderAge: target.leaderAge,
      targetLeaderOpinion: target.relationship,
      warGoal: `${claim} against ${target.name}`,
      claimUsed: claim,
      yearlyTroops: rawTroops,
      maxYearlyTroops: totalArmyPower,
      isPlayerCommanding: commandDirectly,
      playerLevies: rawTroops,
      enemyLevies: target.troops || 3500,
      enemyMaxLevies: target.maxTroops || 15000,
      warScore: commandDirectly ? 10 : 0,
      warYear: 1,
      lastTacticsChangeYear: currentYear,
      playerTactics: 'Frontline Shock Charge',
      enemyTactics: 'Highland Defense & Fortress Siege',
      plunderCount: 0,
      commanders: [
        {
          id: `cmd_1_${newWarId}`,
          name: 'Count Benjamin I Walpole',
          role: 'Grand Marshal',
          portrait: '👨🏽',
          martial: 26,
          trait: 'Master Tactician & Iron Will',
          assignedTroops: Math.round(rawTroops * 0.35),
          status: 'Engaged'
        },
        {
          id: `cmd_2_${newWarId}`,
          name: 'Prince Cuthbert Calvin',
          role: 'Vanguard Commander',
          portrait: '🤴',
          martial: 28,
          trait: 'Knight Commander & Fearless Charge',
          assignedTroops: Math.round(rawTroops * 0.25),
          status: 'Ready'
        },
        {
          id: `cmd_3_${newWarId}`,
          name: 'Bartholomew Calvin',
          role: 'Left Flank',
          portrait: '👨',
          martial: 23,
          trait: 'Disciplined Shieldwall Expert',
          assignedTroops: Math.round(rawTroops * 0.15),
          status: 'Ready'
        },
        {
          id: `cmd_4_${newWarId}`,
          name: 'Countess Susanna I Calvin',
          role: 'Right Flank',
          portrait: '👩',
          martial: 22,
          trait: 'Outflanking & Light Cavalry',
          assignedTroops: Math.round(rawTroops * 0.15),
          status: 'Ready'
        },
        {
          id: `cmd_5_${newWarId}`,
          name: 'Grand Inquisitor Aldous',
          role: 'Reserve & Magic',
          portrait: '🔮',
          martial: 25,
          trait: 'Arcane Siege & War Spells',
          assignedTroops: Math.round(rawTroops * 0.10),
          status: 'Ready'
        }
      ],
      battleLog: [
        {
          year: currentYear,
          title: 'War Declaration',
          description: `Royal banners mobilized against ${target.name} using claim "${claim}". ${commandDirectly ? 'His Imperial Majesty leads from the front!' : 'Royal Marshals dispatched.'}`,
          won: true,
          casualtiesPlayer: 0,
          casualtiesEnemy: 0
        }
      ]
    };

    setActiveWars(prev => [newWar, ...prev]);

    // Update opinion if realm
    setRealms(prev => prev.map(r => r.id === target.id || r.name.toLowerCase() === target.name.toLowerCase() ? { ...r, opinion: -80, isAtWarWithPlayer: true } : r));

    // Chronicle Entry
    const formattedTroops = rawTroops >= 1000 ? `${(rawTroops / 1000).toFixed(1)}k` : `${rawTroops}`;
    setChronicleEntries(prev => [
      {
        id: `war_decl_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: `Declared War against ${target.name}`,
        description: `Pressed the sovereign claim for ${claim}. Committed ${formattedTroops} soldiers under our 5 Royal Commanders.`,
        type: 'war',
        isImportant: true
      },
      ...prev
    ]);
  };

  const handleUpdateWar = (updatedWar: WarState) => {
    setActiveWars(prev => prev.map(w => w.id === updatedWar.id ? updatedWar : w));
  };

  const handleEndWar = (warId: string, outcome: 'enforce_demands' | 'white_peace' | 'surrender') => {
    const warToEnd = activeWars.find(w => w.id === warId);
    if (!warToEnd) return;

    if (outcome === 'enforce_demands') {
      // Victory rewards
      setCharacter(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          gold: prev.stats.gold + 180,
          renown: prev.stats.renown + 75,
          happiness: Math.min(100, prev.stats.happiness + 20)
        }
      }));

      // Total Realm & County Annexation
      // Identify target realm to conquer all of its constituent counties
      const targetRealm = realms.find(r => r.id === warToEnd.targetRealmId || r.name.toLowerCase() === warToEnd.targetRealmName.toLowerCase());
      const targetRealmId = targetRealm ? targetRealm.id : warToEnd.targetRealmId;

      const conqueredCounties: string[] = [];
      setProvinces(prev => {
        const updated = prev.map(p => {
          const isTargetProvince = p.id === warToEnd.targetRealmId || p.name.toLowerCase() === warToEnd.targetProvinceName?.toLowerCase();
          const isTargetRealmProvince = targetRealmId ? p.realmId === targetRealmId : false;

          if (isTargetProvince || isTargetRealmProvince || p.realmId === warToEnd.targetRealmId) {
            conqueredCounties.push(p.name);
            return {
              ...p,
              isPlayerControlled: true,
              unrest: Math.min(25, (p.unrest || 0) + 12)
            };
          }
          return p;
        });

        // Dynamic Rank Progression check using Feudal Tier helper
        const totalControlled = updated.filter(p => p.isPlayerControlled).length;
        const tier = getFeudalTierFromProvinces(totalControlled, character.dynastyName);
        if (tier.rank !== character.rank) {
          setCharacter(c => ({
            ...c,
            rank: tier.rank,
            title: tier.title,
            titlesHeld: Array.from(new Set([tier.title, ...c.titlesHeld]))
          }));
        }

        return updated;
      });

      // Liberate captured commanders upon victory
      setActiveWars(prev => prev.map(w => ({
        ...w,
        commanders: (w.commanders || []).map(c => c.status === 'Captured' ? { ...c, status: 'Ready' as const } : c)
      })));

      // Update realm state upon total victory
      if (targetRealmId) {
        setRealms(prev => prev.map(r => r.id === targetRealmId ? { ...r, isAtWarWithPlayer: false, opinion: 35 } : r));
      }

      setChronicleEntries(prev => [
        {
          id: `victory_${Date.now()}`,
          year: currentYear,
          age: character.age,
          title: `👑 Triumphant Conquest of ${warToEnd.targetRealmName}!`,
          description: `Enforced absolute imperial demands! All counties (${conqueredCounties.length} total) were successfully annexed under our realm crown. Extracted 180 🪙 in war reparations!`,
          type: 'war',
          isImportant: true
        },
        ...prev
      ]);
    } else if (outcome === 'white_peace') {
      const targetRealm = realms.find(r => r.id === warToEnd.targetRealmId || r.name.toLowerCase() === warToEnd.targetRealmName.toLowerCase());
      if (targetRealm) {
        setRealms(prev => prev.map(r => r.id === targetRealm.id ? { ...r, isAtWarWithPlayer: false, opinion: 0 } : r));
      }

      setChronicleEntries(prev => [
        {
          id: `white_peace_${Date.now()}`,
          year: currentYear,
          age: character.age,
          title: `White Peace with ${warToEnd.targetRealmName}`,
          description: `Both sides agreed to a status quo ceasefire with honor intact.`,
          type: 'diplomacy'
        },
        ...prev
      ]);
    } else {
      // Surrender penalty
      const targetRealm = realms.find(r => r.id === warToEnd.targetRealmId || r.name.toLowerCase() === warToEnd.targetRealmName.toLowerCase());
      if (targetRealm) {
        setRealms(prev => prev.map(r => r.id === targetRealm.id ? { ...r, isAtWarWithPlayer: false, opinion: 20 } : r));
      }

      setCharacter(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          gold: Math.max(0, prev.stats.gold - 80),
          renown: Math.max(0, prev.stats.renown - 30)
        }
      }));

      setChronicleEntries(prev => [
        {
          id: `surrender_${Date.now()}`,
          year: currentYear,
          age: character.age,
          title: `Conceded Defeat to ${warToEnd.targetRealmName}`,
          description: `Signed humiliating surrender accords and paid 80 🪙 in war indemnities.`,
          type: 'war',
          isImportant: true
        },
        ...prev
      ]);
    }

    // Remove from active wars list
    setActiveWars(prev => prev.filter(w => w.id !== warId));
  };

  // Conditional Peace Negotiations (Gold, Specific Provinces, Marriage Alliances)
  const handleProposeConditionalPeace = (terms: ConditionalPeaceTerms) => {
    const warToEnd = activeWars.find(w => w.id === terms.warId);
    if (!warToEnd) return;

    const targetRealm = realms.find(r => r.id === warToEnd.targetRealmId || r.name.toLowerCase() === warToEnd.targetRealmName.toLowerCase());
    const targetRealmId = targetRealm ? targetRealm.id : warToEnd.targetRealmId;

    // 1. Gold adjustments
    if (terms.goldAmount !== 0) {
      setCharacter(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          gold: Math.max(0, prev.stats.gold + terms.goldAmount),
          renown: prev.stats.renown + (terms.goldAmount > 0 ? 25 : 10)
        }
      }));
    }

    // 2. Province Cessions & Demands
    const gainedCounties: string[] = [];
    const cededCounties: string[] = [];

    setProvinces(prev => {
      const updated = prev.map(p => {
        // Demanded by player -> becomes player controlled
        if (terms.demandedProvinceIds.includes(p.id)) {
          gainedCounties.push(p.name);
          return {
            ...p,
            isPlayerControlled: true,
            unrest: Math.min(20, (p.unrest || 0) + 10)
          };
        }
        // Ceded by player -> becomes enemy realm controlled
        if (terms.cededProvinceIds.includes(p.id)) {
          cededCounties.push(p.name);
          return {
            ...p,
            isPlayerControlled: false,
            realmId: targetRealmId
          };
        }
        return p;
      });

      // Dynamic Rank Progression check using Feudal Tier helper
      const totalControlled = updated.filter(p => p.isPlayerControlled).length;
      const tier = getFeudalTierFromProvinces(totalControlled, character.dynastyName);
      if (tier.rank !== character.rank) {
        setCharacter(c => ({
          ...c,
          rank: tier.rank,
          title: tier.title,
          titlesHeld: Array.from(new Set([tier.title, ...c.titlesHeld]))
        }));
      }

      return updated;
    });

    // Liberate captured commanders if terms specify prisoner release
    if (terms.liberatePrisoners !== false) {
      setActiveWars(prev => prev.map(w => ({
        ...w,
        commanders: (w.commanders || []).map(c => c.status === 'Captured' ? { ...c, status: 'Ready' as const } : c)
      })));
    }

    // 3. Marriage Alliance
    if (terms.marriageAlliance) {
      const ma = terms.marriageAlliance;
      if (ma.memberType === 'self') {
        const newSpouse: FamilyMember = {
          id: `spouse_treaty_${Date.now()}`,
          name: ma.targetDynastyMemberName,
          species: ma.targetSpecies,
          gender: character.gender === 'Male' ? 'Female' : 'Male',
          relation: 'Spouse',
          age: 20,
          alive: true,
          health: 100,
          opinion: 85,
          childrenIds: [],
          realmId: targetRealmId,
          title: 'Royal Consort',
          isHeir: false,
          traits: ['Treaty Alliance Spouse', 'Noble Bloodline'],
          portrait: ma.targetSpecies === 'Vampire' ? '🥀' : ma.targetSpecies === 'HighElf' ? '🧝' : ma.targetSpecies === 'Werewolf' ? '🐺' : ma.targetSpecies === 'Witch' ? '🔮' : '👑'
        };
        setFamilyMembers(prev => [...prev.filter(m => m.relation !== 'Spouse'), newSpouse]);
        setCharacter(prev => ({
          ...prev,
          spouseName: ma.targetDynastyMemberName,
          spouseSpecies: ma.targetSpecies,
          stats: {
            ...prev.stats,
            gold: prev.stats.gold + ma.dowry,
            renown: prev.stats.renown + 35,
            happiness: Math.min(100, prev.stats.happiness + 15)
          }
        }));
      } else if (ma.memberId) {
        setFamilyMembers(prev => prev.map(m => {
          if (m.id === ma.memberId) {
            return {
              ...m,
              spouseName: ma.targetDynastyMemberName,
              title: `${m.title || 'Noble'} (Allied to ${warToEnd.targetRealmName})`,
              opinion: Math.min(100, m.opinion + 25)
            };
          }
          return m;
        }));
        setCharacter(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            gold: prev.stats.gold + ma.dowry,
            renown: prev.stats.renown + 25
          }
        }));
      }
    }

    // 4. Update Realm State (Treaties, Opinion, War Status)
    if (targetRealmId) {
      setRealms(prev => prev.map(r => {
        if (r.id === targetRealmId) {
          const combinedTreaties = Array.from(new Set([...(r.treaties || []), ...terms.treaties]));
          return {
            ...r,
            isAtWarWithPlayer: false,
            opinion: Math.min(100, Math.max(-20, r.opinion + terms.opinionBonus)),
            treaties: combinedTreaties
          };
        }
        return r;
      }));
    }

    // 5. Chronicle Entry
    setChronicleEntries(prev => [
      {
        id: `conditional_peace_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: `🕊️ Peace Treaty Ratified with ${warToEnd.targetRealmName}`,
        description: `Concluded a conditional peace treaty! ${terms.summaryText}`,
        type: 'diplomacy',
        isImportant: true
      },
      ...prev
    ]);

    // 6. Remove from active wars list
    setActiveWars(prev => prev.filter(w => w.id !== terms.warId));
  };

  // Trade Caravans
  const handleDispatchCaravan = (targetRealmId: string, exportGood: string, importGood: string, investment: number) => {
    if (character.stats.gold < investment) return;
    const targetRealm = realms.find(r => r.id === targetRealmId);
    if (!targetRealm) return;

    const newCaravan: TradeCaravan = {
      id: `caravan_${Date.now()}`,
      targetRealmId,
      targetRealmName: targetRealm.name,
      exportGood,
      importGood,
      investment,
      annualProfit: Math.round(investment * 0.4),
      risk: 'Medium',
      activeYears: 0
    };

    setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: prev.stats.gold - investment } }));
    setTradeCaravans(prev => [...prev, newCaravan]);
  };

  // Vassals
  const handleBribeVassal = (vassalId: string, goldAmount: number) => {
    if (character.stats.gold < goldAmount) return;
    setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: prev.stats.gold - goldAmount } }));
    setVassals(prev => prev.map(v => v.id === vassalId ? { ...v, loyalty: Math.min(100, v.loyalty + 25) } : v));
  };

  const handleAppeaseFaction = (vassalId: string) => {
    setVassals(prev => prev.map(v => v.id === vassalId ? { ...v, faction: 'Loyalist', loyalty: Math.min(100, v.loyalty + 15) } : v));
  };

  // Laws & Abilities
  const handleEnactLaw = (lawId: string, optionId: string) => {
    const targetLaw = realmLaws.find(l => l.id === lawId);
    const chosenOption = targetLaw?.options.find(o => o.id === optionId);

    setRealmLaws(prev => prev.map(l => l.id === lawId ? { ...l, currentOptionId: optionId } : l));

    if (targetLaw && chosenOption) {
      setChronicleEntries(prev => [
        {
          id: `law_enact_${Date.now()}`,
          year: currentYear,
          age: character.age,
          title: `Imperial Law Enacted: ${chosenOption.name}`,
          description: `Decreed the new statute for ${targetLaw.title}. ${chosenOption.effects}`,
          type: 'realm',
          isImportant: true
        },
        ...prev
      ]);
    }
  };

  const handleUseSpeciesAbility = (abilityId: string) => {
    const ability = SPECIES_ABILITIES[character.species]?.find(a => a.id === abilityId);
    if (!ability) return;

    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        gold: prev.stats.gold - (ability.cost.gold || 0),
        specialResource: prev.stats.specialResource - (ability.cost.specialResource || 0),
        pietyOrMana: prev.stats.pietyOrMana - (ability.cost.pietyOrMana || 0),
        health: Math.min(100, prev.stats.health - (ability.cost.health || 0) + (ability.id.includes('heal') || ability.id.includes('feast') || ability.id.includes('elixir') ? 35 : 0)),
        renown: prev.stats.renown + 20
      }
    }));

    setChronicleEntries(prev => [
      {
        id: `ability_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: `Species Power Invoked: ${ability.name}`,
        description: ability.effectSummary,
        type: 'supernatural',
        isImportant: true
      },
      ...prev
    ]);
  };

  const handleAssignCouncil = (vassalId: string, role: CouncilRole) => {
    setVassals(prev => prev.map(v => ({
      ...v,
      councilRole: v.id === vassalId ? role : (v.councilRole === role ? undefined : v.councilRole)
    })));
  };

  // Court Activities
  const handleHostFeast = (cost: number) => {
    if (character.stats.gold < cost) return;
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        gold: prev.stats.gold - cost,
        happiness: Math.min(100, prev.stats.happiness + 20),
        renown: prev.stats.renown + 15
      }
    }));
    setVassals(prev => prev.map(v => ({ ...v, loyalty: Math.min(100, v.loyalty + 15), opinion: Math.min(100, v.opinion + 15) })));
  };

  const handleGoHunting = (cost: number) => {
    if (character.stats.gold < cost) return;
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        gold: prev.stats.gold - cost
      }
    }));
    setTravelModalState({
      isOpen: true,
      activity: 'hunt'
    });
  };

  const handleGoPilgrimage = (cost: number) => {
    if (character.stats.gold < cost) return;
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        gold: prev.stats.gold - cost
      }
    }));
    setTravelModalState({
      isOpen: true,
      activity: 'pilgrimage'
    });
  };

  const handleResolveTravelOutcome = (outcome: TravelOutcome) => {
    setCharacter(prev => {
      const updatedStats = { ...prev.stats };
      if (outcome.gold) updatedStats.gold = Math.max(0, updatedStats.gold + outcome.gold);
      if (outcome.health) updatedStats.health = Math.min(100, Math.max(5, updatedStats.health + outcome.health));
      if (outcome.martial) updatedStats.martial = Math.min(100, updatedStats.martial + outcome.martial);
      if (outcome.intellect) updatedStats.intellect = Math.min(100, updatedStats.intellect + outcome.intellect);
      if (outcome.pietyOrMana) updatedStats.pietyOrMana = Math.min(100, updatedStats.pietyOrMana + outcome.pietyOrMana);
      if (outcome.renown) updatedStats.renown = Math.max(0, updatedStats.renown + outcome.renown);
      if (outcome.happiness) updatedStats.happiness = Math.min(100, Math.max(0, updatedStats.happiness + outcome.happiness));

      let updatedTraits = [...prev.traits];
      if (outcome.addTrait && !updatedTraits.includes(outcome.addTrait)) {
        updatedTraits.push(outcome.addTrait);
      }
      if (outcome.removeTrait) {
        updatedTraits = updatedTraits.filter(t => t !== outcome.removeTrait);
      }

      return {
        ...prev,
        stats: updatedStats,
        traits: updatedTraits
      };
    });

    if (outcome.chronicleTitle) {
      const newEntry: ChronicleEntry = {
        id: `travel_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: outcome.chronicleTitle,
        description: outcome.chronicleDescription,
        isImportant: true,
        type: 'supernatural'
      };
      setChronicleEntries(prev => [newEntry, ...prev]);
    }

    setTravelModalState(null);
  };

  const handleHostTournament = (cost: number) => {
    if (character.stats.gold < cost) return;
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        gold: prev.stats.gold - cost,
        renown: prev.stats.renown + 35,
        happiness: Math.min(100, prev.stats.happiness + 15)
      }
    }));
  };

  const handleAdministerJustice = (decisionId: string, outcome: { gold?: number; happiness?: number; renown?: number; unrest?: number }) => {
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        gold: prev.stats.gold + (outcome.gold || 0),
        happiness: Math.min(100, Math.max(0, prev.stats.happiness + (outcome.happiness || 0))),
        renown: prev.stats.renown + (outcome.renown || 0)
      }
    }));
  };

  // Heir Succession & Imperial Coronation Routine
  const handleContinueAsHeir = (heirMember: FamilyMember, coronationStyle: CoronationStyle = 'sacred_rites') => {
    let inheritedGold = Math.round(character.stats.gold * 0.8);
    let bonusPiety = 0;
    let bonusMartial = 0;
    let bonusRenown = 0;
    let bonusHappiness = 0;
    let coronationTitle = `👑 Imperial Coronation: ${heirMember.name}`;
    let coronationDesc = `Ascended the throne of ${character.dynastyName}.`;

    if (coronationStyle === 'sacred_rites') {
      inheritedGold = Math.max(0, inheritedGold - 35);
      bonusPiety = 40;
      setVassals(prev => prev.map(v => ({ ...v, loyalty: Math.min(100, v.loyalty + 30) })));
      coronationTitle = `✨ Holy Coronation: ${heirMember.name}`;
      coronationDesc = `Anointed with sacred oil, divine holy rites, and ancient blessings. Vassals swore eternal fealty (+40 Piety/Mana, +30 Vassal Loyalty).`;
    } else if (coronationStyle === 'martial_triumph') {
      inheritedGold = Math.max(0, inheritedGold - 40);
      bonusMartial = 40;
      bonusRenown = 30;
      setProvinces(prev => prev.map((p, idx) => idx === 0 ? { ...p, troops: (p.troops || 450) + 250 } : p));
      coronationTitle = `⚔️ Martial Triumph: ${heirMember.name}`;
      coronationDesc = `Ascended amid thunderous parades of armored knights, veteran paladins, and heavy legions (+40 Martial, +250 Capital Levies, +30 Prestige).`;
    } else if (coronationStyle === 'lavish_feast') {
      inheritedGold = Math.max(0, inheritedGold - 50);
      bonusHappiness = 35;
      setVassals(prev => prev.map(v => ({ ...v, opinion: Math.min(100, v.opinion + 35) })));
      setProvinces(prev => prev.map(p => ({ ...p, unrest: Math.max(0, (p.unrest || 0) - 15) })));
      coronationTitle = `🍷 Grand Jubilee & Feast: ${heirMember.name}`;
      coronationDesc = `Hosted a lavish imperial festival with royal tournaments and feasts for all social estates (+35 Happiness, +35 Vassal Opinion, -15 Unrest).`;
    } else {
      coronationTitle = `📜 Pragmatic Succession: ${heirMember.name}`;
      coronationDesc = `Enacted a modest coronation in the high council chambers to conserve royal treasury funds (0 🪙 coronation cost).`;
    }

    const controlledCount = provinces.filter(p => p.isPlayerControlled).length;
    const tier = getFeudalTierFromProvinces(controlledCount, character.dynastyName);

    const newRulerChar: Character = {
      id: `char_${heirMember.id}`,
      name: heirMember.name,
      dynastyName: character.dynastyName,
      gender: heirMember.gender,
      species: heirMember.species,
      age: Math.max(18, heirMember.age),
      portrait: heirMember.portrait,
      rank: tier.rank,
      title: tier.title,
      stats: {
        health: 95,
        happiness: Math.min(100, 80 + bonusHappiness),
        renown: Math.round(character.stats.renown * 0.6) + 40 + bonusRenown,
        pietyOrMana: 60 + bonusPiety,
        gold: inheritedGold,
        martial: 65 + bonusMartial,
        intellect: 70,
        intrigue: 60,
        diplomacy: 70,
        specialResource: 75
      },
      traits: heirMember.traits,
      alive: true,
      yearBorn: currentYear - heirMember.age,
      childrenIds: [],
      parentsIds: [character.id],
      realmId: character.realmId,
      isHeir: false,
      titlesHeld: Array.from(new Set([tier.title, ...character.titlesHeld]))
    };

    // Add deceased predecessor to family history
    const updatedFamily = familyMembers
      .filter(m => m.id !== heirMember.id)
      .map(m => m.id === character.id ? { ...m, alive: false, title: 'Predecessor Sovereign' } : m);

    setCharacter(newRulerChar);
    setFamilyMembers(updatedFamily);
    setReignYears(1);

    setChronicleEntries(prev => [
      {
        id: `coronation_${Date.now()}`,
        year: currentYear,
        age: newRulerChar.age,
        title: coronationTitle,
        description: `${coronationDesc} Long live the new ${newRulerChar.rank}!`,
        type: 'birth',
        isImportant: true
      },
      ...prev
    ]);
  };

  const livingHeirs = familyMembers.filter(m => m.relation === 'Child' && m.alive);

  const handleTriggerCivilWarBattle = (faction: VassalFaction, rebelTroops: number = 1500) => {
    const leaderVassal = vassals.find(v => v.id === faction.leaderId) || vassals[0];
    const civilWarId = `war_civil_${Date.now()}`;
    const newCivilWar: WarState = {
      id: civilWarId,
      title: `⚡ Vassal Civil War: ${faction.title}`,
      targetType: 'rebel_faction',
      targetRealmId: 'civil_war_rebels',
      targetRealmName: faction.title,
      targetProvinceName: leaderVassal?.name || 'Rebel Stronghold',
      targetLeaderName: leaderVassal?.name || faction.leaderName || 'Rebel Leader',
      targetLeaderPortrait: leaderVassal?.portrait || faction.leaderPortrait || '⚔️',
      targetLeaderTitle: leaderVassal?.title || 'Rebel Leader',
      targetLeaderAge: leaderVassal?.age || 42,
      targetLeaderOpinion: -100,
      warGoal: faction.demands || faction.description || `Vassal Liberty and Crown Demands`,
      claimUsed: 'Imperial Sovereign Authority',
      yearlyTroops: totalArmyPower,
      maxYearlyTroops: totalArmyPower,
      isPlayerCommanding: true,
      playerLevies: totalArmyPower,
      enemyLevies: rebelTroops,
      enemyMaxLevies: Math.round(rebelTroops * 1.25),
      warScore: 0,
      warYear: 1,
      lastTacticsChangeYear: currentYear,
      playerTactics: 'Imperial Shock Assault',
      enemyTactics: 'Guerrilla Ambush & Castle Besiegement',
      plunderCount: 0,
      commanders: [
        {
          id: `cmd_cw_${Date.now()}`,
          name: 'Imperial Loyalist Marshal',
          role: 'Grand Marshal',
          portrait: '🛡️',
          martial: 28,
          trait: 'Ironclad Loyalist',
          assignedTroops: Math.round(totalArmyPower * 0.4),
          status: 'Ready'
        }
      ],
      battleLog: [
        {
          year: currentYear,
          title: `Rebellion Erupted: ${faction.title}`,
          description: `Disgruntled vassals declared open rebellion under ${leaderVassal?.name || faction.leaderName || 'rebel lords'}! Imperial legions deployed to crush the insurrection.`,
          won: false,
          casualtiesPlayer: 0,
          casualtiesEnemy: 0
        }
      ]
    };

    setActiveWars(prev => [newCivilWar, ...prev]);
    setVassalFactions(prev => prev.filter(f => f.id !== faction.id));
    setActiveTab('diplomacy');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-700 selection:text-white">
      
      {/* Top Header */}
      <TopHeader
        character={character}
        currentYear={currentYear}
        currentRealm={currentRealm}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(sound.toggleSound())}
        onOpenNewGame={() => setShowCreator(true)}
        onOpenGuide={() => setShowGuide(true)}
        onOpenSaveLoad={() => setShowSaveLoadModal(true)}
        onOpenEditor={() => setShowEditorModal(true)}
        totalArmyPower={totalArmyPower}
      />

      {/* Main Tab Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4">
        {activeTab === 'chronicle' && (
          <ChronicleTab
            character={character}
            currentYear={currentYear}
            currentRealm={currentRealm}
            chronicleEntries={chronicleEntries}
            vassals={vassals}
            onAgeUp={handleAgeUp}
            onOpenActivities={() => setActiveTab('court')}
            onOpenProvinces={() => setActiveTab('provinces')}
            onOpenDynasty={() => setActiveTab('dynasty')}
            onOpenVassals={() => setShowVassalsModal(true)}
            onOpenSaveLoad={() => setShowSaveLoadModal(true)}
            onAddChronicleEntry={(entry) => setChronicleEntries(prev => [entry, ...prev])}
          />
        )}

        {activeTab === 'provinces' && (
          <RealmMapTab
            character={character}
            provinces={provinces}
            realms={realms}
            vassals={vassals}
            familyMembers={familyMembers}
            realmNPCs={realmNPCs}
            provincialSoldiers={provincialSoldiers}
            onUpgradeBuilding={handleUpgradeBuilding}
            onInvestProvince={handleInvestProvince}
            onHoldProvinceFestival={handleHoldProvinceFestival}
            onAssignGovernor={(provId, vasId) => {}}
            onGrantProvince={handleGrantProvince}
            onClaimEmperorTitle={handleClaimEmperorTitle}
            onSelectTargetForWar={(target) => {
              setActiveTab('diplomacy');
            }}
            onDeclareWarOnTarget={handleDeclareWarOnTarget}
            onUpdateNPC={handleUpdateNPC}
            onUpdateCharacter={(updates) => setCharacter(prev => ({ ...prev, ...updates }))}
            onAddChronicle={(entry) => setChronicleEntries(prev => [
              {
                id: `chron_${Date.now()}`,
                year: currentYear,
                age: character.age,
                title: entry.title,
                description: entry.description,
                type: entry.type
              },
              ...prev
            ])}
            onEmployNPCAsVassal={handleEmployNPCAsVassal}
            onKnightSoldier={handleKnightSoldier}
            onPromoteSoldier={handlePromoteSoldier}
            onDemoteSoldier={handleDemoteSoldier}
            onMakeProvincialHead={handleMakeProvincialHead}
            onImprisonSoldier={handleImprisonSoldier}
            onReleaseSoldier={handleReleaseSoldier}
            onExecuteSoldier={handleExecuteSoldier}
            onUpgradeSoldierGear={handleUpgradeSoldierGear}
          />
        )}

        {activeTab === 'dynasty' && (
          <DynastyFamilyTab
            character={character}
            familyMembers={familyMembers}
            realms={realms}
            provinces={provinces}
            realmNPCs={realmNPCs}
            vassals={vassals}
            totalArmyPower={totalArmyPower}
            unlockedPerkIds={unlockedPerkIds}
            cadetBranches={cadetBranches}
            onDesignateHeir={handleDesignateHeir}
            onSetEducationTrack={handleSetEducationTrack}
            onStudyHarder={handleStudyHarder}
            onGiftFamilyMember={handleGiftFamily}
            onSpendTimeWithMember={handleSpendTimeWithMember}
            onProposeCrossMarriage={handleProposeCrossMarriage}
            onUnlockPerk={(perk) => {
              if (character.stats.renown < perk.costRenown) return;
              setCharacter(prev => ({ ...prev, stats: { ...prev.stats, renown: prev.stats.renown - perk.costRenown } }));
              setUnlockedPerkIds(prev => Array.from(new Set([...prev, perk.id])));
              setChronicleEntries(prev => [
                {
                  id: `perk_${Date.now()}`,
                  year: currentYear,
                  age: character.age,
                  title: `🌟 Dynastic Legacy Unlocked: ${perk.name}`,
                  description: `Unlocked permanent dynasty legacy perk! ${perk.description}`,
                  type: 'family',
                  isImportant: true
                },
                ...prev
              ]);
            }}
            onCreateCadetBranch={(branch) => {
              setCadetBranches(prev => [branch, ...prev]);
              setChronicleEntries(prev => [
                {
                  id: `branch_${Date.now()}`,
                  year: currentYear,
                  age: character.age,
                  title: `⚜️ Cadet Branch Founded: ${branch.name}`,
                  description: `${branch.founderName} established a new noble cadet branch in ${branch.seatProvinceName} (${branch.motto}).`,
                  type: 'family',
                  isImportant: true
                },
                ...prev
              ]);
            }}
            onUpdateFamilyMember={(updated) => setFamilyMembers(prev => prev.map(m => m.id === updated.id ? updated : m))}
            onUpdateFamilyMembers={(members) => setFamilyMembers(members)}
            onUpdatePlayerGold={(newGold) => setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: newGold } }))}
            onUpdateCharacter={(updates) => setCharacter(prev => ({ ...prev, ...updates }))}
            onAddChronicle={(entry) => setChronicleEntries(prev => [
              {
                id: `chron_fam_${Date.now()}`,
                year: currentYear,
                age: character.age,
                isImportant: true,
                ...entry
              },
              ...prev
            ])}
            onBackToChronicle={() => setActiveTab('chronicle')}
          />
        )}

        {activeTab === 'diplomacy' && (
          <WarDiplomacyTab
            character={character}
            realms={realms}
            vassals={vassals}
            provinces={provinces}
            familyMembers={familyMembers}
            activeWars={activeWars}
            tradeCaravans={tradeCaravans}
            totalArmyPower={totalArmyPower}
            currentYear={currentYear}
            onSendGift={handleSendGift}
            onSignTreaty={handleSignTreaty}
            onDeclareWarOnTarget={handleDeclareWarOnTarget}
            onUpdateWar={handleUpdateWar}
            onEndWar={handleEndWar}
            onProposeConditionalPeace={handleProposeConditionalPeace}
            onDispatchCaravan={handleDispatchCaravan}
            onBribeVassal={handleBribeVassal}
            onAppeaseFaction={handleAppeaseFaction}
            onUpdatePlayerGold={(newGold) => setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: newGold } }))}
            onUpdatePlayerPrestige={(newPrestige) => setCharacter(prev => ({ ...prev, stats: { ...prev.stats, renown: newPrestige } }))}
            onBackToChronicle={() => setActiveTab('chronicle')}
          />
        )}

        {activeTab === 'laws' && (
          <LawsPowersTab
            character={character}
            realmLaws={realmLaws}
            vassals={vassals}
            totalArmyPower={totalArmyPower}
            onEnactLaw={handleEnactLaw}
            onUseSpeciesAbility={handleUseSpeciesAbility}
            onAssignCouncil={handleAssignCouncil}
            onUpdatePlayerPrestige={(newPrestige) => setCharacter(prev => ({ ...prev, stats: { ...prev.stats, renown: newPrestige } }))}
            onUpdatePlayerPiety={(newPiety) => setCharacter(prev => ({ ...prev, stats: { ...prev.stats, pietyOrMana: newPiety } }))}
            onBackToChronicle={() => setActiveTab('chronicle')}
          />
        )}

        {activeTab === 'court' && (
          <CourtActivitiesTab
            character={character}
            vassals={vassals}
            realmNPCs={realmNPCs}
            spymasterTask={spymasterTask}
            hooksAndSecrets={hooksAndSecrets}
            vassalFactions={vassalFactions}
            imperialEdicts={imperialEdicts}
            dynastyArtifacts={dynastyArtifacts}
            greatWonders={greatWonders}
            crusadeState={crusadeState}
            epidemicState={epidemicState}
            nomadInvasion={nomadInvasion}
            activeNemeses={activeNemeses}
            totalArmyPower={totalArmyPower}
            onOpenFeastModal={() => setShowFeastModal(true)}
            onOpenTournamentModal={() => setShowTournamentModal(true)}
            onOpenPilgrimageModal={() => setShowPilgrimageModal(true)}
            onOpenWondersModal={() => setShowWondersModal(true)}
            onOpenCrusadeModal={() => setShowCrusadeModal(true)}
            onOpenPlagueModal={() => setShowPlagueModal(true)}
            onOpenNomadModal={() => setShowNomadModal(true)}
            onOpenNemesisModal={() => setShowNemesisModal(true)}
            onUpdateSpymasterTask={setSpymasterTask}
            onUpdateHooksAndSecrets={setHooksAndSecrets}
            onUpdateFactions={setVassalFactions}
            onUpdateImperialEdicts={setImperialEdicts}
            onUpdateArtifacts={setDynastyArtifacts}
            onUpdateCharacter={(updates) => setCharacter(prev => ({ ...prev, ...updates }))}
            onUpdateVassals={setVassals}
            onAddChronicle={(entry) => setChronicleEntries(prev => [
              {
                id: `chron_court_${Date.now()}`,
                year: currentYear,
                age: character.age,
                isImportant: true,
                ...entry
              },
              ...prev
            ])}
            onTriggerCivilWarBattle={handleTriggerCivilWarBattle}
            onHostFeast={handleHostFeast}
            onGoHunting={handleGoHunting}
            onGoPilgrimage={handleGoPilgrimage}
            onHostTournament={handleHostTournament}
            onConductSpeciesCeremony={handleUseSpeciesAbility}
            onAdministerJustice={handleAdministerJustice}
          />
        )}
      </main>

      {/* Bottom Nav */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingEventsCount={activeEvent ? 1 : 0}
        hasActiveWar={activeWars.length > 0}
        unassignedCouncilCount={vassals.filter(v => !v.councilRole).length > 0 ? 1 : 0}
      />

      {/* Modals */}
      {activeEvent && (
        <EventModal
          event={activeEvent}
          character={character}
          onSelectChoice={handleSelectEventChoice}
        />
      )}

      {!character.alive && (
        <DeathHeirModal
          deceasedCharacter={character}
          heirs={livingHeirs}
          reignYears={reignYears}
          onContinueAsHeir={handleContinueAsHeir}
          onStartNewDynasty={() => setShowCreator(true)}
        />
      )}

      <CharacterCreatorModal
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        onStartGame={handleStartCustomGame}
      />

      <GuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />

      <VassalsSystemModal
        isOpen={showVassalsModal}
        onClose={() => setShowVassalsModal(false)}
        vassals={vassals}
        provinces={provinces}
        playerCharacter={character}
        familyMembers={familyMembers}
        onUpdateVassals={(updater) => setVassals(updater)}
        onUpdateCharacter={(updater) => setCharacter(updater)}
        onAddChronicleEntry={(entry) => setChronicleEntries(prev => [entry, ...prev])}
      />

      <SaveLoadModal
        isOpen={showSaveLoadModal}
        onClose={() => setShowSaveLoadModal(false)}
        currentState={{
          character,
          familyMembers,
          realms,
          provinces,
          realmNPCs,
          vassals,
          realmLaws,
          chronicleEntries,
          tradeCaravans,
          currentYear,
          reignYears,
          activeWars,
          provincialSoldiers
        }}
        onLoadGameState={handleLoadGameState}
      />

      <InGameEditorModal
        isOpen={showEditorModal}
        onClose={() => setShowEditorModal(false)}
        character={character}
        setCharacter={setCharacter}
        familyMembers={familyMembers}
        setFamilyMembers={setFamilyMembers}
        realms={realms}
        setRealms={setRealms}
        provinces={provinces}
        setProvinces={setProvinces}
        vassals={vassals}
        setVassals={setVassals}
        realmLaws={realmLaws}
        setRealmLaws={setRealmLaws}
        chronicleEntries={chronicleEntries}
        setChronicleEntries={setChronicleEntries}
        currentYear={currentYear}
        setCurrentYear={setCurrentYear}
        reignYears={reignYears}
        setReignYears={setReignYears}
        activeWars={activeWars}
        setActiveWars={setActiveWars}
        onTriggerEvent={(ev) => setActiveEvent(ev)}
      />

      {travelModalState?.isOpen && (
        <TravelEncounterModal
          isOpen={travelModalState.isOpen}
          activity={travelModalState.activity}
          character={character}
          onResolve={handleResolveTravelOutcome}
          onClose={() => setTravelModalState(null)}
        />
      )}

      {/* Universal Interactive Character & Family Modal */}
      {selectedUniversalCharacter && (
        <UniversalCharacterModal
          isOpen={!!selectedUniversalCharacter}
          onClose={() => setSelectedUniversalCharacter(null)}
          target={selectedUniversalCharacter}
          playerCharacter={character}
          playerFamily={familyMembers}
          hooksAndSecrets={hooksAndSecrets}
          vassalFactions={vassalFactions}
          onUpdateCharacter={setCharacter}
          onAddChronicle={(title, desc, isImportant) => {
            setChronicleEntries(prev => [
              {
                id: `chron_char_${Date.now()}`,
                year: currentYear,
                age: character.age,
                title,
                description: desc,
                type: 'diplomacy',
                isImportant: !!isImportant
              },
              ...prev
            ]);
          }}
          onSwaySuccess={(charId, newOpinion) => {
            setVassals(prev => prev.map(v => v.id === charId ? { ...v, opinion: newOpinion } : v));
            setRealmNPCs(prev => prev.map(n => n.id === charId ? { ...n, opinion: newOpinion } : n));
          }}
          onGiftGoldSuccess={(charId, newOpinion, newLoyalty) => {
            setVassals(prev => prev.map(v => v.id === charId ? { ...v, opinion: newOpinion, loyalty: newLoyalty ?? v.loyalty } : v));
          }}
          onMarriageArranged={(playerMemberId, targetRelative) => {
            setFamilyMembers(prev => prev.map(m => m.id === playerMemberId ? {
              ...m,
              isMarried: true,
              spouse: {
                id: targetRelative.id,
                name: targetRelative.name,
                age: targetRelative.age,
                relation: 'Spouse',
                portrait: targetRelative.portrait,
                alive: true,
                health: 100,
                opinion: 80,
                skills: { martial: 10, intellect: 10, diplomacy: 10 }
              }
            } : m));
            sound.playFanfare();
          }}
          onDemandHostage={(charId, _child) => {
            setVassals(prev => prev.map(v => v.id === charId ? { ...v, isHostage: true } : v));
            sound.playSword();
          }}
          onFabricateHookSuccess={(newHook) => {
            setHooksAndSecrets(prev => [newHook, ...prev]);
          }}
        />
      )}

      {/* Dynamic Crises & Power Struggle / Assassination Resolution Modal */}
      {activeCrisis && (
        <CrisisAndPlotModal
          crisis={activeCrisis}
          character={character}
          onResolveCrisis={(optionId) => {
            const selectedOpt = activeCrisis.options.find(o => o.id === optionId);
            if (selectedOpt) {
              const outcome = selectedOpt.outcome;
              
              // Stat impacts
              setCharacter(prev => ({
                ...prev,
                stats: {
                  ...prev.stats,
                  gold: Math.max(0, prev.stats.gold + (outcome.goldDelta || 0)),
                  renown: Math.max(0, prev.stats.renown + (outcome.renownDelta || 0)),
                  health: Math.max(0, Math.min(100, prev.stats.health + (outcome.healthDelta || 0)))
                }
              }));

              if (outcome.unrestDelta) {
                setProvinces(prev => prev.map(p => ({
                  ...p,
                  unrest: Math.max(0, Math.min(100, (p.unrest || 0) + outcome.unrestDelta!))
                })));
              }

              if (outcome.capturedConspirator) {
                setHooksAndSecrets(prev => [
                  {
                    id: `hook_plot_${Date.now()}`,
                    targetName: activeCrisis.instigator.name,
                    targetId: `instigator_${Date.now()}`,
                    type: 'Strong Hook',
                    title: 'Thwarted Treason Scheme',
                    description: `Held confessed evidence of complicity in the shadow scheme against the crown.`,
                    unlocked: true,
                    blackmailCount: 0
                  },
                  ...prev
                ]);
              }

              // Record in Annals
              setChronicleEntries(prev => [
                {
                  id: `chron_crisis_${Date.now()}`,
                  year: currentYear,
                  age: character.age,
                  title: activeCrisis.title,
                  description: outcome.text,
                  type: 'intrigue',
                  isImportant: true
                },
                ...prev
              ]);
            }
            setActiveCrisis(null);
          }}
        />
      )}

      {/* Grand Chivalric Tournament Modal */}
      {showTournamentModal && (
        <GrandTournamentModal
          isOpen={showTournamentModal}
          onClose={() => setShowTournamentModal(false)}
          character={character}
          onCompleteTournament={(rewards) => {
            setCharacter(prev => ({
              ...prev,
              stats: {
                ...prev.stats,
                renown: prev.stats.renown + (rewards.renown || 0),
                happiness: Math.min(100, prev.stats.happiness + (rewards.happiness || 0)),
                martial: Math.min(100, prev.stats.martial + (rewards.martial || 0)),
                gold: Math.max(0, prev.stats.gold + (rewards.gold || 0))
              }
            }));
            if (rewards.recruits) {
              setProvinces(prev => prev.map((p, i) => i === 0 ? { ...p, troops: p.troops + rewards.recruits! } : p));
            }
            setChronicleEntries(prev => [
              {
                id: `tourn_${Date.now()}`,
                year: currentYear,
                age: character.age,
                title: '🏆 Grand Chivalric Tournament Celebrated',
                description: `Hosted the Grand Realm Tournament across all martial disciplines! ${rewards.chronicleSummary || 'Crown prestige and veteran martial renown surged.'}`,
                type: 'court',
                isImportant: true
              },
              ...prev
            ]);
            setShowTournamentModal(false);
          }}
        />
      )}

      {/* Grand Royal Feast Modal */}
      {showFeastModal && (
        <GrandFeastModal
          isOpen={showFeastModal}
          onClose={() => setShowFeastModal(false)}
          character={character}
          vassals={vassals}
          familyMembers={familyMembers}
          onCompleteFeast={(rewards) => {
            setCharacter(prev => ({
              ...prev,
              stats: {
                ...prev.stats,
                renown: prev.stats.renown + (rewards.renown || 0),
                happiness: Math.min(100, prev.stats.happiness + (rewards.happiness || 0)),
                stress: Math.max(0, (prev.stats.stress || 0) - (rewards.stressRelief || 0))
              }
            }));
            if (rewards.vassalLoyalty) {
              setVassals(prev => prev.map(v => ({ ...v, loyalty: Math.min(100, v.loyalty + rewards.vassalLoyalty!) })));
            }
            setChronicleEntries(prev => [
              {
                id: `feast_${Date.now()}`,
                year: currentYear,
                age: character.age,
                title: '🍷 Grand Royal Banquet Concluded',
                description: `Held a magnificent royal feast. Vassals toasted royal majesty and bonds were forged across the high table.`,
                type: 'court',
                isImportant: true
              },
              ...prev
            ]);
            setShowFeastModal(false);
          }}
        />
      )}

      {/* Holy Pilgrimage Modal */}
      {showPilgrimageModal && (
        <HolyPilgrimageModal
          isOpen={showPilgrimageModal}
          onClose={() => setShowPilgrimageModal(false)}
          character={character}
          onCompletePilgrimage={(outcome) => {
            setCharacter(prev => {
              const updatedStats = { ...prev.stats };
              if (outcome.piety) updatedStats.pietyOrMana = Math.min(100, updatedStats.pietyOrMana + outcome.piety);
              if (outcome.renown) updatedStats.renown = updatedStats.renown + outcome.renown;
              if (outcome.health) updatedStats.health = Math.min(100, updatedStats.health + outcome.health);
              if (outcome.stressRelief) updatedStats.stress = Math.max(0, (updatedStats.stress || 0) - outcome.stressRelief);
              const updatedTraits = outcome.trait && !prev.traits.includes(outcome.trait) ? [...prev.traits, outcome.trait] : prev.traits;
              return { ...prev, stats: updatedStats, traits: updatedTraits };
            });
            setChronicleEntries(prev => [
              {
                id: `pilg_${Date.now()}`,
                year: currentYear,
                age: character.age,
                title: '✨ Sacred Pilgrimage Completed',
                description: `Completed the arduous holy pilgrimage, receiving divine blessings and holy serenity across the realm.`,
                type: 'supernatural',
                isImportant: true
              },
              ...prev
            ]);
            setShowPilgrimageModal(false);
          }}
        />
      )}

      {/* Great Imperial Wonders Modal */}
      {showWondersModal && (
        <GreatWondersModal
          isOpen={showWondersModal}
          onClose={() => setShowWondersModal(false)}
          wonders={greatWonders}
          character={character}
          provinces={provinces}
          onStartWonderStage={(wonderId, stageId, cost) => {
            if (character.stats.gold < cost) return;
            setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: prev.stats.gold - cost } }));
            setGreatWonders(prev => prev.map(w => {
              if (w.id === wonderId) {
                const updatedStages = w.stages.map(s => s.id === stageId ? { ...s, status: 'in_progress' as const, progress: 15 } : s);
                return { ...w, isUnderConstruction: true, stages: updatedStages };
              }
              return w;
            }));
          }}
          onRushStage={(wonderId, stageId, rushCost) => {
            if (character.stats.gold < rushCost) return;
            setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: prev.stats.gold - rushCost } }));
            setGreatWonders(prev => prev.map(w => {
              if (w.id === wonderId) {
                const updatedStages = w.stages.map(s => s.id === stageId ? { ...s, status: 'completed' as const, progress: 100 } : s);
                const allComplete = updatedStages.every(s => s.status === 'completed');
                return { ...w, isCompleted: allComplete, isUnderConstruction: !allComplete, stages: updatedStages };
              }
              return w;
            }));
          }}
        />
      )}

      {/* Great Crusade / Holy War Modal */}
      {showCrusadeModal && (
        <CrusadeModal
          isOpen={showCrusadeModal}
          onClose={() => setShowCrusadeModal(false)}
          crusade={crusadeState}
          character={character}
          totalArmyPower={totalArmyPower}
          onCommitTroops={(troops) => {
            setCrusadeState(prev => ({
              ...prev,
              playerContribution: {
                ...prev.playerContribution,
                troopsCommitted: prev.playerContribution.troopsCommitted + troops,
                crusadeScore: prev.playerContribution.crusadeScore + Math.round(troops / 10)
              },
              attackerForces: prev.attackerForces + troops
            }));
          }}
          onDonateGold={(gold) => {
            if (character.stats.gold < gold) return;
            setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: prev.stats.gold - gold, pietyOrMana: Math.min(100, prev.stats.pietyOrMana + 20) } }));
            setCrusadeState(prev => ({
              ...prev,
              playerContribution: {
                ...prev.playerContribution,
                goldDonated: prev.playerContribution.goldDonated + gold,
                crusadeScore: prev.playerContribution.crusadeScore + Math.round(gold / 2)
              }
            }));
          }}
          onNominateBeneficiary={(name, relation, portrait) => {
            setCrusadeState(prev => ({
              ...prev,
              playerContribution: {
                ...prev.playerContribution,
                beneficiaryCandidate: { name, relation, portrait }
              }
            }));
          }}
        />
      )}

      {/* Epidemic & Plague Outbreak Modal */}
      {showPlagueModal && (
        <EpidemicPlagueModal
          isOpen={showPlagueModal}
          onClose={() => setShowPlagueModal(false)}
          epidemic={epidemicState}
          character={character}
          provinces={provinces}
          onEnactMeasure={(measureId, cost) => {
            if (character.stats.gold < cost) return;
            setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: prev.stats.gold - cost } }));
            setEpidemicState(prev => ({
              ...prev,
              mitigationMeasures: [...prev.mitigationMeasures, measureId],
              severityLevel: Math.max(1, prev.severityLevel - 1)
            }));
          }}
          onQuarantineProvince={(provId) => {
            setProvinces(prev => prev.map(p => p.id === provId ? { ...p, isQuarantined: true } : p));
          }}
        />
      )}

      {/* Nomad Steppe Invasion Modal */}
      {showNomadModal && (
        <NomadInvasionModal
          isOpen={showNomadModal}
          onClose={() => setShowNomadModal(false)}
          invasion={nomadInvasion}
          character={character}
          totalArmyPower={totalArmyPower}
          onPayTribute={(goldCost) => {
            if (character.stats.gold < goldCost) return;
            setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: prev.stats.gold - goldCost } }));
            setNomadInvasion(prev => ({ ...prev, hordeWarScore: Math.max(-50, prev.hordeWarScore - 30), hordeTroops: Math.round(prev.hordeTroops * 0.8) }));
          }}
          onDeployHost={() => {
            setNomadInvasion(prev => ({ ...prev, hordeWarScore: Math.min(100, prev.hordeWarScore + 25) }));
          }}
          onArrangeHostageMarriage={() => {
            setNomadInvasion(prev => ({ ...prev, hordeWarScore: 0 }));
          }}
        />
      )}

      {/* Nemesis Blood Feud Modal */}
      {showNemesisModal && (
        <NemesisFeudModal
          isOpen={showNemesisModal}
          onClose={() => setShowNemesisModal(false)}
          nemeses={activeNemeses}
          character={character}
          onChallengeDuel={(nemesisId) => {
            setActiveNemeses(prev => prev.filter(n => n.id !== nemesisId));
            setCharacter(prev => ({ ...prev, stats: { ...prev.stats, renown: prev.stats.renown + 50 } }));
            setChronicleEntries(prev => [
              {
                id: `feud_${Date.now()}`,
                year: currentYear,
                age: character.age,
                title: '⚔️ Nemesis Blood Feud Avenged in Duel',
                description: `Met the sworn blood rival in personal combat on the field of honor and ended the feud forever!`,
                type: 'court',
                isImportant: true
              },
              ...prev
            ]);
            setShowNemesisModal(false);
          }}
          onHireAssassins={(nemesisId, goldCost) => {
            if (character.stats.gold < goldCost) return;
            setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: prev.stats.gold - goldCost } }));
            setActiveNemeses(prev => prev.filter(n => n.id !== nemesisId));
            setShowNemesisModal(false);
          }}
          onMakePeace={(nemesisId) => {
            setActiveNemeses(prev => prev.filter(n => n.id !== nemesisId));
            setShowNemesisModal(false);
          }}
        />
      )}

      {/* Mental Strain & Stress Break Modal */}
      {showStressModal && (
        <StressBreakModal
          isOpen={showStressModal}
          onClose={() => setShowStressModal(false)}
          character={character}
          stressLevel={activeStressLevel}
          onSelectStressChoice={(choice) => {
            setCharacter(prev => {
              const updatedStats = { ...prev.stats };
              if (choice.effects.stressRelief) updatedStats.stress = Math.max(0, (updatedStats.stress || 0) - choice.effects.stressRelief);
              if (choice.effects.health) updatedStats.health = Math.min(100, Math.max(5, updatedStats.health + choice.effects.health));
              if (choice.effects.gold) updatedStats.gold = Math.max(0, updatedStats.gold + choice.effects.gold);
              if (choice.effects.renown) updatedStats.renown = Math.max(0, updatedStats.renown + choice.effects.renown);
              const updatedTraits = choice.effects.newTrait && !prev.traits.includes(choice.effects.newTrait) ? [...prev.traits, choice.effects.newTrait] : prev.traits;
              return { ...prev, stats: updatedStats, traits: updatedTraits };
            });
            setChronicleEntries(prev => [
              {
                id: `stress_${Date.now()}`,
                year: currentYear,
                age: character.age,
                title: `Mental Strain Break: ${choice.copingMechanism}`,
                description: `Under severe mental stress, the monarch turned to coping mechanisms: ${choice.description}`,
                type: 'court',
                isImportant: true
              },
              ...prev
            ]);
            setShowStressModal(false);
          }}
        />
      )}

      {/* Imperial Coronation Ceremony Modal */}
      {showCoronationModal && coronationHeirCandidate && (
        <CoronationCeremonyModal
          isOpen={showCoronationModal}
          onClose={() => setShowCoronationModal(false)}
          heir={coronationHeirCandidate}
          character={character}
          onSelectCoronation={(style) => {
            handleContinueAsHeir(coronationHeirCandidate, style);
            setShowCoronationModal(false);
            setCoronationHeirCandidate(null);
          }}
        />
      )}

      {/* Succession Crisis / Civil War Pretender Modal */}
      {showSuccessionCrisisModal && successionPretender && coronationHeirCandidate && (
        <SuccessionCrisisModal
          isOpen={showSuccessionCrisisModal}
          pretender={successionPretender}
          newRulerName={coronationHeirCandidate.name}
          newRulerPortrait={coronationHeirCandidate.portrait}
          onDeclareCivilWar={() => {
            setShowSuccessionCrisisModal(false);
            const pretenderWar: WarState = {
              id: `war_pretender_${Date.now()}`,
              title: `War of Succession: ${successionPretender.claimTitle}`,
              targetType: 'realm',
              targetRealmId: character.realmId,
              targetRealmName: character.dynastyName,
              targetProvinceName: 'Capital March',
              targetLeaderName: successionPretender.name,
              targetLeaderPortrait: successionPretender.portrait,
              targetLeaderTitle: 'Pretender to the Throne',
              targetLeaderAge: 32,
              targetLeaderOpinion: -100,
              warGoal: `Crush the succession challenge of ${successionPretender.name}`,
              claimUsed: 'Imperial Sovereignty & Primogeniture',
              yearlyTroops: Math.round(totalArmyPower * 0.8),
              maxYearlyTroops: totalArmyPower,
              isPlayerCommanding: true,
              playerLevies: Math.round(totalArmyPower * 0.8),
              enemyLevies: successionPretender.armySize,
              enemyMaxLevies: successionPretender.armySize * 1.2,
              warScore: 0,
              warYear: 1,
              lastTacticsChangeYear: currentYear,
              playerTactics: 'Imperial Shock Assault',
              enemyTactics: 'Frontline Shock Charge',
              plunderCount: 0,
              commanders: [],
              battleLog: []
            };
            setActiveWars(prev => [pretenderWar, ...prev]);
            setActiveTab('diplomacy');
          }}
          onBribePretender={(goldCost) => {
            setCharacter(prev => ({ ...prev, stats: { ...prev.stats, gold: Math.max(0, prev.stats.gold - goldCost) } }));
            setShowSuccessionCrisisModal(false);
          }}
          onGrantAppanage={() => {
            setShowSuccessionCrisisModal(false);
          }}
        />
      )}
    </div>
  );
}
