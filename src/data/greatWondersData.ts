import { GreatWonder } from '../types';

export const INITIAL_GREAT_WONDERS: GreatWonder[] = [
  {
    id: 'wonder_cathedral',
    type: 'cathedral',
    name: 'Imperial Sun-Cathedral of the Trinity',
    provinceId: 'prov_capital',
    provinceName: 'The Imperial Seat',
    icon: '⛪',
    currentStage: 1,
    progressYears: 2,
    isUnderConstruction: false,
    totalInvestedGold: 250,
    architectName: 'Master Mason Julian of Chartres',
    stages: [
      {
        stageNumber: 1,
        title: 'Deep Foundation & Crypt Vaults',
        description: 'Heavy granite foundation stones consecrated with holy oils and blessed relics.',
        costGold: 250,
        yearsToBuild: 3,
        unlockedBonus: '+10 Piety/Year, +5% Realm Stability',
        isCompleted: true
      },
      {
        stageNumber: 2,
        title: 'Gothic Nave & Rose Windows',
        description: 'Towering stained glass rose windows bathing the sanctuary in divine celestial colors.',
        costGold: 500,
        yearsToBuild: 5,
        unlockedBonus: '+25 Piety/Year, Clergy loyalty +15, +15 Renown/Year',
        isCompleted: false
      },
      {
        stageNumber: 3,
        title: 'Flying Buttresses & Marble Spires',
        description: 'Majestic spires ascending toward the heavens, visible for twenty leagues.',
        costGold: 900,
        yearsToBuild: 6,
        unlockedBonus: '+50 Piety/Year, Free Holy Relic Artifact, -25% Vassal Rebellion risk',
        isCompleted: false
      },
      {
        stageNumber: 4,
        title: 'Consecrated Reliquary & Golden Dome',
        description: 'A gilded dome crowned in pure leaf gold, enshrining the Holy Relics of the dynasty.',
        costGold: 1500,
        yearsToBuild: 8,
        unlockedBonus: 'Saintly Bloodline permanently unlocked, Pope/Priests cannot excommunicate you',
        isCompleted: false
      }
    ]
  },
  {
    id: 'wonder_citadel',
    type: 'citadel',
    name: 'Iron Bastion of the Sovereign Host',
    provinceId: 'prov_capital',
    provinceName: 'The Imperial Seat',
    icon: '🏰',
    currentStage: 0,
    progressYears: 0,
    isUnderConstruction: false,
    totalInvestedGold: 0,
    architectName: 'Warmaster Castellan Richard',
    stages: [
      {
        stageNumber: 1,
        title: 'Moat Excavation & Star Bastions',
        description: 'Deep flooded water-moats and concentric earthen star bastions defending the outer gate.',
        costGold: 300,
        yearsToBuild: 3,
        unlockedBonus: '+1500 Garrison Troops, Capital cannot be taken in surprise raids',
        isCompleted: false
      },
      {
        stageNumber: 2,
        title: 'Concentric Stone Curtain Walls',
        description: 'Triple rings of ashlar masonry curtain walls equipped with murder holes and boiling oil pits.',
        costGold: 600,
        yearsToBuild: 4,
        unlockedBonus: '+3000 Garrison Troops, +15% Army Defense in capital province',
        isCompleted: false
      },
      {
        stageNumber: 3,
        title: 'Siege Engine Ballista Turrets',
        description: 'Massive counterweight trebuchets and rapid-fire repeating scorpions atop towering bastions.',
        costGold: 1000,
        yearsToBuild: 6,
        unlockedBonus: '+5000 Troops, Siege duration against Capital +10 Years, +25 Martial',
        isCompleted: false
      },
      {
        stageNumber: 4,
        title: 'The Impenetrable Sovereign Keep',
        description: 'The legendary central fortress citadel regarded across the world as completely unbreachable.',
        costGold: 1800,
        yearsToBuild: 7,
        unlockedBonus: 'Capital Province can never be captured in wars; +35 Dread; +20% Realm-wide Army Morale',
        isCompleted: false
      }
    ]
  },
  {
    id: 'wonder_university',
    type: 'university',
    name: 'Grand Royal Scriptorium & Academy of Sciences',
    provinceId: 'prov_capital',
    provinceName: 'The Imperial Seat',
    icon: '🏛️',
    currentStage: 0,
    progressYears: 0,
    isUnderConstruction: false,
    totalInvestedGold: 0,
    stages: [
      {
        stageNumber: 1,
        title: 'Great Scriptorium & Papyrus Archive',
        description: 'Dozens of scribes transcribe ancient philosophical and administrative texts day and night.',
        costGold: 250,
        yearsToBuild: 2,
        unlockedBonus: '+10 Intellect to all heirs, +15% Tax Bureaucracy efficiency',
        isCompleted: false
      },
      {
        stageNumber: 2,
        title: 'Astronomical Astrolabe & Observatory',
        description: 'Grand brass astrolabes and celestial domes predicting eclipses, seasons, and star alignments.',
        costGold: 550,
        yearsToBuild: 4,
        unlockedBonus: '+20% Cultural Innovation Research Speed, +10% Crop harvest yields',
        isCompleted: false
      },
      {
        stageNumber: 3,
        title: 'Alchemical Laboratory & Medical Faculty',
        description: 'Distillation chambers and anatomy theaters training premier court physicians and scholars.',
        costGold: 950,
        yearsToBuild: 5,
        unlockedBonus: '+15 Health to all dynasty members; Plague deaths reduced by 60%',
        isCompleted: false
      },
      {
        stageNumber: 4,
        title: 'The Alexandria of the West',
        description: 'The definitive center of world civilization attracting philosophers, engineers, and mages from every continent.',
        costGold: 1600,
        yearsToBuild: 7,
        unlockedBonus: 'All councilors gain +5 to all stats; +100 Renown/Year; Unlocks Advanced Siege & Naval Tech',
        isCompleted: false
      }
    ]
  },
  {
    id: 'wonder_harbor',
    type: 'harbor',
    name: 'Colossus Great Harbor & Sovereign Drydocks',
    provinceId: 'prov_coastal',
    provinceName: 'Sunken Harbor',
    icon: '⚓',
    currentStage: 0,
    progressYears: 0,
    isUnderConstruction: false,
    totalInvestedGold: 0,
    stages: [
      {
        stageNumber: 1,
        title: 'Deep-Water Granite Breakwater',
        description: 'Enormous submerged stone sea-walls calming tidal surges and sheltering merchant fleets.',
        costGold: 300,
        yearsToBuild: 3,
        unlockedBonus: '+35 Gold/Year Maritime Trade Profit, +1 Trade Caravan capacity',
        isCompleted: false
      },
      {
        stageNumber: 2,
        title: 'The Titan Pharos Lighthouse',
        description: 'A 150-foot beacon tower illuminated by mirror-focused Greek fire guiding nighttime shipping.',
        costGold: 650,
        yearsToBuild: 4,
        unlockedBonus: '+75 Gold/Year Trade Revenue, +20 Foreign Realm Opinion',
        isCompleted: false
      },
      {
        stageNumber: 3,
        title: 'Imperial Galleon Drydocks & Arsenal',
        description: 'Venetian-style assembly-line shipyards capable of outfitting a war galley in twenty-four hours.',
        costGold: 1100,
        yearsToBuild: 5,
        unlockedBonus: '+4000 Naval Marines, Coastal provinces immune to Viking raids, +100 Gold/Year',
        isCompleted: false
      },
      {
        stageNumber: 4,
        title: 'The Sovereign Queen of the Oceans',
        description: 'A supreme maritime trade emporium controlling Mediterranean and Atlantic shipping lanes.',
        costGold: 1800,
        yearsToBuild: 7,
        unlockedBonus: '+250 Gold/Year Profit; Trade Caravans generate double yields; Absolute Naval Dominance',
        isCompleted: false
      }
    ]
  }
];

export const GREAT_WONDERS_CATALOG = INITIAL_GREAT_WONDERS;
