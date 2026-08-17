import { DynastyArtifact, HookSecret, ImperialEdict, VassalFaction } from '../types';

export const INITIAL_HOOKS_AND_SECRETS: HookSecret[] = [
  {
    id: 'hook_1',
    targetId: 'vassal_brecknock_bailiff',
    targetName: 'Castellan Gwilym of Brecknock',
    targetRole: 'Castellan & Chancellor',
    targetPortrait: '🛡️',
    type: 'Weak Hook',
    secretName: 'Secret Timber Monopoly',
    description: 'Discovered that Gwilym has been pocketing crown timber tariffs from the Blackwood forest.',
    obtainedYear: 1042,
    isUsed: false,
    leveragePower: 50
  }
];

export const INITIAL_FACTIONS: VassalFaction[] = [
  {
    id: 'faction_liberty',
    kind: 'Liberty',
    title: 'The Sovereign Liberty League',
    description: 'A coalition of provincial lords demanding lower imperial levies, higher provincial autonomy, and reduction of crown authority.',
    demands: 'Lower Imperial Taxes to Exempt, reduce crown levy obligations by 50%, and grant regional court vetoes.',
    leaderId: 'vassal_brecknock_bailiff',
    leaderName: 'Castellan Gwilym of Brecknock',
    leaderPortrait: '🛡️',
    memberVassalIds: ['vassal_brecknock_bailiff'],
    powerPercent: 35,
    discontent: 42,
    ultimatumSent: false
  },
  {
    id: 'faction_claimant',
    kind: 'Claimant',
    title: 'Pretender Succession League',
    description: 'Disgruntled courtiers and rival bloodline heirs plotting to install a claimant upon the throne.',
    demands: 'Crown Prince / Lord Valerius declared the sole legitimate successor to the High Crown.',
    leaderId: 'claimant_valerius',
    leaderName: 'Lord Valerius the Pretender',
    leaderPortrait: '🤴',
    claimantName: 'Lord Valerius of Bloodline Pendragon',
    claimantTitle: 'Rival Royal Claimant',
    memberVassalIds: [],
    powerPercent: 20,
    discontent: 25,
    ultimatumSent: false
  }
];

export const INITIAL_IMPERIAL_EDICTS: ImperialEdict[] = [
  {
    id: 'edict_currency',
    name: 'Universal Imperial Currency',
    icon: '🪙',
    category: 'Economy',
    description: 'Standardize gold sovereign minting and abolish local feudal coin debasement across all provinces.',
    effects: '+18% Crown Tax Income, +10 Merchant Prosperity, -5 Unrest across all held counties.',
    upkeepCost: 15,
    isActive: false,
    minRankRequired: 'King'
  },
  {
    id: 'edict_pax',
    name: 'Pax Imperialis (Crown Peace)',
    icon: '🕊️',
    category: 'Administration',
    description: 'Enact absolute prohibition on unauthorized inter-vassal feuds and border skirmishing without royal writ.',
    effects: '+20 Vassal Loyalty, -25% War Fatigue, +15 Crown Renown.',
    upkeepCost: 20,
    isActive: false,
    minRankRequired: 'King'
  },
  {
    id: 'edict_highways',
    name: 'Grand Imperial Highway Tolls',
    icon: '🛣️',
    category: 'Economy',
    description: 'Pave stone military routes connecting major realm capitals and establish fortified turnpike checkpoints.',
    effects: '+40 Gold per year, +25% Trade Caravan Speed, +10% Province Troop Reinforcement.',
    upkeepCost: 25,
    isActive: false,
    minRankRequired: 'King'
  },
  {
    id: 'edict_toleration',
    name: 'Edict of Multi-Species Harmony',
    icon: '🤝',
    category: 'Culture',
    description: 'Sanction equal civic rights and religious protections for Humans, Vampires, Werewolves, Witches, and High Elves.',
    effects: '+30 Foreign Realm Opinion, +20 Faith/Mana regeneration, Prevents Cross-Species Cultural Revolts.',
    upkeepCost: 15,
    isActive: false,
    minRankRequired: 'King'
  },
  {
    id: 'edict_iron_cohort',
    name: 'Conscription of the Imperial Iron Cohort',
    icon: '⚔️',
    category: 'Military',
    description: 'Levy a permanent standing regiment of veteran heavy infantry and arcane warmages loyal solely to the Emperor.',
    effects: '+800 Elite Standing Levies, +15 Commander Combat Prowess, -5 Vassal Loyalty.',
    upkeepCost: 35,
    isActive: false,
    minRankRequired: 'Emperor'
  }
];

export const INITIAL_DYNASTY_ARTIFACTS: DynastyArtifact[] = [
  {
    id: 'art_crown_imperator',
    name: 'Crown of the First Imperator',
    type: 'Crown',
    rarity: 'Legendary',
    icon: '👑',
    slot: 'head',
    effects: {
      renown: 25,
      diplomacy: 15,
      intrigue: 10,
      vassalOpinionBonus: 15,
      renownBonusPercent: 20
    },
    description: 'An ancient diademed circlet wrought from star-metal and encrusted with glowing sun-rubies, worn by the first founder of the realm.',
    history: 'Passed down through five generations of conquering monarchs, commanding deep fealty and awe in the hearts of all subject lords.',
    isEquipped: true,
    commissionYear: 1010,
    artisanName: 'Arch-Artificer Valerius the Elder',
    qualityScore: 98
  },
  {
    id: 'art_scepter_dominion',
    name: 'Scepter of Sovereign Dominion',
    type: 'Scepter',
    rarity: 'Epic',
    icon: '🪄',
    slot: 'mainHand',
    effects: {
      diplomacy: 12,
      stewardship: 18,
      taxRateBonusPercent: 12,
      goldIncome: 30,
      vassalOpinionBonus: 8
    },
    description: 'A polished aurum rod capped with a radiant celestial crystal, symbolizing the monarch\'s supreme right of taxation and governance.',
    history: 'Bestowed upon the dynasty by the High Guild Council in recognition of lawful trade charters.',
    isEquipped: true,
    commissionYear: 1035,
    artisanName: 'Guildmaster Goldsmith Elidor',
    qualityScore: 88
  },
  {
    id: 'art_armor_aegis',
    name: 'Aegis of the Sun-Forged Dragon',
    type: 'Armor',
    rarity: 'Epic',
    icon: '🛡️',
    slot: 'armor',
    effects: {
      martial: 22,
      prowess: 20,
      armyMoraleBonus: 15,
      levySizeBonusPercent: 10
    },
    description: 'A heavy suit of enchanted dragon-scale plate mail that deflects steel blades and sorcerous hexes with equal ease.',
    history: 'Forged in the heart of Mount Cinder for the grand siege against rival invader legions.',
    isEquipped: true,
    commissionYear: 1045,
    artisanName: 'Master Armorer Torvald Ironbreaker',
    qualityScore: 92
  },
  {
    id: 'art_grimoire_void',
    name: 'Grimoire of the Leyline Weave',
    type: 'Grimoire',
    rarity: 'Epic',
    icon: '📜',
    slot: 'relic',
    effects: {
      intellect: 24,
      intrigue: 14,
      renown: 10
    },
    description: 'A leather-bound tome pulsating with eldritch cipher secrets and lost celestial incantations.',
    history: 'Recovered from the sunken ruins of the Sunken Archon Academy by early dynasty scions.',
    isEquipped: false,
    commissionYear: 1022,
    artisanName: 'High Archmage Zephyr',
    qualityScore: 86
  },
  {
    id: 'art_blood_chalice',
    name: 'Chalice of Perpetual Abundance',
    type: 'Chalice',
    rarity: 'Rare',
    icon: '🏆',
    slot: 'relic',
    effects: {
      goldIncome: 25,
      diplomacy: 10,
      vassalOpinionBonus: 5
    },
    description: 'A gilded chalice etched with sacred bloodline oaths, turning plain wine into restorative nectar.',
    history: 'Used at every royal coronation and dynastic marriage banquet to seal everlasting loyalty.',
    isEquipped: true,
    commissionYear: 1040,
    artisanName: 'Silversmith Lady Fiona',
    qualityScore: 78
  }
];

export interface RegaliaArtisanOption {
  id: string;
  name: string;
  title: string;
  portrait: string;
  tier: 'Apprentice' | 'Master' | 'Mythic';
  costGold: number;
  costMana: number;
  successQualityRange: [number, number];
  rarityChance: { common: number; rare: number; epic: number; legendary: number; mythic: number };
  description: string;
}

export const REGALIA_ARTISANS: RegaliaArtisanOption[] = [
  {
    id: 'artisan_local',
    name: 'Master Goldsmith Bryan',
    title: 'Imperial Guild Metalsmith',
    portrait: '🔨',
    tier: 'Apprentice',
    costGold: 90,
    costMana: 0,
    successQualityRange: [60, 75],
    rarityChance: { common: 30, rare: 55, epic: 15, legendary: 0, mythic: 0 },
    description: 'Skilled provincial artisan who crafts solid, reliable royal regalia with dependable craftsmanship.'
  },
  {
    id: 'artisan_royal',
    name: 'Lady Vivienne of the Silver Spire',
    title: 'High Court Enchantress & Jeweler',
    portrait: '🧝‍♀️',
    tier: 'Master',
    costGold: 220,
    costMana: 25,
    successQualityRange: [75, 90],
    rarityChance: { common: 0, rare: 30, epic: 55, legendary: 15, mythic: 0 },
    description: 'Renowned arcane jewel-crafter whose pieces shimmer with radiant enchantments that inspire awe across realms.'
  },
  {
    id: 'artisan_mythic',
    name: 'Arch-Artificer Ignis & The Moon-Coven',
    title: 'Mythic Relic Forgers of the First Dawn',
    portrait: '🧙‍♂️',
    tier: 'Mythic',
    costGold: 450,
    costMana: 60,
    successQualityRange: [88, 100],
    rarityChance: { common: 0, rare: 0, epic: 25, legendary: 60, mythic: 15 },
    description: 'Ancient masters who weave astral starlight and dragon-fire into items of transcendent world-shaping majesty.'
  }
];

export const REGALIA_RECIPES = [
  {
    type: 'Crown' as const,
    slot: 'head' as const,
    title: 'Imperial Diadem or Sovereign Crown',
    icon: '👑',
    baseDescription: 'A supreme symbol of royal authority that commands vassal veneration and expands dynastic prestige.',
    focusOptions: [
      { id: 'vassal_fealty', label: 'Fealty of the High Lords (+Vassal Opinion & Diplomacy)', primaryStat: 'diplomacy', opinionBonus: 20 },
      { id: 'imperial_glory', label: 'Eternity of the Crown (+Renown & Prestige Multiplier)', primaryStat: 'renown', renownBonus: 35 },
      { id: 'dread_sovereignty', label: 'Shadow Sovereign Diadem (+Intrigue & Scheme Resistance)', primaryStat: 'intrigue', opinionBonus: 10 }
    ]
  },
  {
    type: 'Scepter' as const,
    slot: 'mainHand' as const,
    title: 'Scepter of State & Treasury Dominion',
    icon: '🪄',
    baseDescription: 'A gilded staff of office that enforces royal tax edicts and stimulates realm-wide commerce.',
    focusOptions: [
      { id: 'tax_dominance', label: 'Imperial Treasury Seal (+15% Kingdom Tax Rate & Gold)', primaryStat: 'stewardship', taxBonus: 15 },
      { id: 'diplomatic_accord', label: 'Herald of Harmonious Accord (+Diplomacy & Trade Speed)', primaryStat: 'diplomacy', taxBonus: 8 },
      { id: 'magisterial_decree', label: 'Scepter of Inflexible Law (+Vassal Fealty & Reduced Unrest)', primaryStat: 'stewardship', opinionBonus: 12 }
    ]
  },
  {
    type: 'Armor' as const,
    slot: 'armor' as const,
    title: 'Enchanted Plate Mail or Dragon Cuirass',
    icon: '🛡️',
    baseDescription: 'Impenetrable battle-harness that bolsters commander prowess, army morale, and levy readiness.',
    focusOptions: [
      { id: 'warlord_aegis', label: 'Aegis of the Warlord (+Martial, +Prowess & +15% Army Morale)', primaryStat: 'martial', armyBonus: 15 },
      { id: 'unyielding_bastion', label: 'Fortress of the Living (+Health & +10% Levy Capacity)', primaryStat: 'prowess', armyBonus: 10 },
      { id: 'dragon_fury', label: 'Dragon-Claw Battlemail (+Martial Prowess & Siege Speed)', primaryStat: 'martial', armyBonus: 20 }
    ]
  },
  {
    type: 'Relic' as const,
    slot: 'relic' as const,
    title: 'Sacred Chalice, Grimoire, or Holy Reliquary',
    icon: '🔮',
    baseDescription: 'An ancient blessed artifact that channels celestial energy, esoteric wisdom, and gold prosperity.',
    focusOptions: [
      { id: 'celestial_wisdom', label: 'Codex of Leyline Arcana (+Intellect & Mana Regeneration)', primaryStat: 'intellect' },
      { id: 'chalice_plenty', label: 'Chalice of Eternal Harvest (+Gold Income & Vassal Joy)', primaryStat: 'stewardship', taxBonus: 10 },
      { id: 'divine_sanctuary', label: 'Reliquary of the First Saint (+Piety, +Renown & +Diplomacy)', primaryStat: 'diplomacy', opinionBonus: 10 }
    ]
  }
];

export const SECRETS_DISCOVERY_POOL: Array<{
  secretName: string;
  type: HookSecret['type'];
  description: (targetName: string) => string;
  leveragePower: number;
}> = [
  {
    secretName: 'Embezzled Crown Grain Reserves',
    type: 'Weak Hook',
    description: (name) => `Uncovered ledgers proving ${name} has been skimming 15% of provincial granary supplies.`,
    leveragePower: 50
  },
  {
    secretName: 'Secret Coven Sympathizer',
    type: 'Strong Hook',
    description: (name) => `Found occult talismans proving ${name} attends forbidden midnight ritual covens.`,
    leveragePower: 100
  },
  {
    secretName: 'Illegitimate Secret Bloodline',
    type: 'Strong Hook',
    description: (name) => `Discovered private letters showing ${name}'s declared heir is not of their true bloodline.`,
    leveragePower: 100
  },
  {
    secretName: 'Foreign Realm Correspondence',
    type: 'Strong Hook',
    description: (name) => `Intercepted encrypted letters where ${name} was discussing treasonous pacts with foreign envoys.`,
    leveragePower: 100
  },
  {
    secretName: 'Forbidden Alchemical Chamber',
    type: 'Weak Hook',
    description: (name) => `Spies documented a secret subterranean laboratory where ${name} conducts unauthorized experiments.`,
    leveragePower: 50
  },
  {
    secretName: 'Shadow Tax Evasion',
    type: 'Weak Hook',
    description: (name) => `Revealed falsified merchant records concealing hundreds of silver pieces from the crown treasurer.`,
    leveragePower: 50
  }
];
