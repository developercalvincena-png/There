import { ProvincialSoldier, SoldierRank, Species, Gender } from '../types';

export interface MartialTraitInfo {
  name: string;
  icon: string;
  category: 'Offense' | 'Defense' | 'Leadership' | 'Grit' | 'Tactics';
  description: string;
  bonus: string;
}

export const MARTIAL_TRAITS_CATALOG: Record<string, MartialTraitInfo> = {
  'Shield Wall Stalwart': {
    name: 'Shield Wall Stalwart',
    icon: '🛡️',
    category: 'Defense',
    description: 'Unflinchingly locks shields against cavalry charges and arrow storms.',
    bonus: '+15 Garrison Defense, -20% Infantry Losses'
  },
  'Giant Slayer': {
    name: 'Giant Slayer',
    icon: '⚔️',
    category: 'Offense',
    description: 'Specializes in bringing down massive siege beasts, mounted champions, and armored knights.',
    bonus: '+20 Prowess in duels, +15 Army Morale'
  },
  'Iron Vanguard': {
    name: 'Iron Vanguard',
    icon: '🪖',
    category: 'Grit',
    description: 'First over the castle battlements, impervious to wounds and terror.',
    bonus: '+18 Martial, +25% Siege Assault Speed'
  },
  'Berserker Fury': {
    name: 'Berserker Fury',
    icon: '🩸',
    category: 'Offense',
    description: 'Enters a bloodthirsty battle trance, scattering enemy frontlines with terrifying ferocity.',
    bonus: '+25 Shock Damage, +12 Prowess'
  },
  'Deadly Blademaster': {
    name: 'Deadly Blademaster',
    icon: '🗡️',
    category: 'Offense',
    description: 'Fluid swordcraft honed through hundreds of brutal tavern brawls and skirmishes.',
    bonus: '+22 Prowess, +10 Critical Strike Chance'
  },
  'Eagle-Eyed Skirmisher': {
    name: 'Eagle-Eyed Skirmisher',
    icon: '🏹',
    category: 'Tactics',
    description: 'Former forest poacher with unmatched precision with longbow and heavy crossbow.',
    bonus: '+20 Ranged Flanking, +10 Reconnaissance'
  },
  'Siege Sapper': {
    name: 'Siege Sapper',
    icon: '💣',
    category: 'Tactics',
    description: 'Master of pickaxe, tunneling, and incendiary breach tactics.',
    bonus: '+30% Siege Breach Speed, +10 Fort Defense'
  },
  'Warhound Master': {
    name: 'Warhound Master',
    icon: '🐺',
    category: 'Leadership',
    description: 'Trains armored hound packs to tear down fleeing enemy lines and scouts.',
    bonus: '+15 Pursuit Damage, -10 Enemy Morale'
  },
  'Peasant Champion': {
    name: 'Peasant Champion',
    icon: '👑',
    category: 'Leadership',
    description: 'Revered by common levies and foot soldiers, inspiring fierce popular loyalty.',
    bonus: '-20% Provincial Unrest, +25% Levy Mobilization'
  },
  'Battle Tactician': {
    name: 'Battle Tactician',
    icon: '📜',
    category: 'Tactics',
    description: 'Possesses an intuitive grasp of topography, ambushes, and vanguard maneuvers.',
    bonus: '+16 Martial, +15% Army Maneuver'
  },
  'Bloodthirsty Executioner': {
    name: 'Bloodthirsty Executioner',
    icon: '🪓',
    category: 'Offense',
    description: 'Strikes terror into opposing hosts with unforgiving battlefield cleaves.',
    bonus: '+18 Prowess, +20 Dread'
  },
  'Indomitable Will': {
    name: 'Indomitable Will',
    icon: '💎',
    category: 'Grit',
    description: 'Refuses to break under torture, starvation, or overwhelming odds.',
    bonus: '+30 Loyalty, +15 Morale in Last Stand'
  },
  'Fierce Skirmisher': {
    name: 'Fierce Skirmisher',
    icon: '⚡',
    category: 'Tactics',
    description: 'Harasses enemy flanks with javelins and hit-and-run cavalry charges.',
    bonus: '+14 Skirmish Power, +10 Speed'
  },
  'Low-Born Valor': {
    name: 'Low-Born Valor',
    icon: '🌟',
    category: 'Leadership',
    description: 'Rose from mud and famine through raw courage and determination.',
    bonus: '+10 All Combat Stats, +20 Renown Gain'
  },
  'Veteran of Hundred Clashes': {
    name: 'Veteran of Hundred Clashes',
    icon: '🎖️',
    category: 'Grit',
    description: 'Covered in battle scars from frontier wars, seasoned against any trick.',
    bonus: '+15 Martial, +15 Prowess'
  }
};

export const RANK_TIERS: Record<SoldierRank, { tier: number; name: SoldierRank; minMartial: number; minProwess: number; nextRank?: SoldierRank; prevRank?: SoldierRank; promoteCost: number }> = {
  'Militia Recruit': { tier: 1, name: 'Militia Recruit', minMartial: 12, minProwess: 15, nextRank: 'Foot Soldier', promoteCost: 8 },
  'Foot Soldier': { tier: 2, name: 'Foot Soldier', minMartial: 20, minProwess: 25, nextRank: 'Man-at-Arms', prevRank: 'Militia Recruit', promoteCost: 12 },
  'Man-at-Arms': { tier: 3, name: 'Man-at-Arms', minMartial: 32, minProwess: 38, nextRank: 'Sergeant', prevRank: 'Foot Soldier', promoteCost: 18 },
  'Sergeant': { tier: 4, name: 'Sergeant', minMartial: 45, minProwess: 52, nextRank: 'Veteran Sergeant', prevRank: 'Man-at-Arms', promoteCost: 25 },
  'Veteran Sergeant': { tier: 5, name: 'Veteran Sergeant', minMartial: 60, minProwess: 68, nextRank: 'Master-at-Arms', prevRank: 'Sergeant', promoteCost: 35 },
  'Master-at-Arms': { tier: 6, name: 'Master-at-Arms', minMartial: 72, minProwess: 80, nextRank: 'Captain of the Guard', prevRank: 'Veteran Sergeant', promoteCost: 50 },
  'Captain of the Guard': { tier: 7, name: 'Captain of the Guard', minMartial: 85, minProwess: 90, prevRank: 'Master-at-Arms', promoteCost: 0 },
  'Knight of the Realm': { tier: 7, name: 'Knight of the Realm', minMartial: 80, minProwess: 92, promoteCost: 0 },
  'Provincial Head': { tier: 7, name: 'Provincial Head', minMartial: 88, minProwess: 86, promoteCost: 0 }
};

const LOW_BORN_ORIGINS = [
  "Village Blacksmith's Son",
  "Forest Huntsman & Poacher",
  "Peasant Levy Militia Veteran",
  "Hedge Mercenary from the Marches",
  "Quarry Stonemason & Sapper",
  "Tavern Brawler & Pit Fighter",
  "Frontier Watchman Outrider",
  "Dockside Stevedore & Marine",
  "Refugee Raider Survivor",
  "Disgraced Guild Apprentice",
  "Monastery Bellringer & Scout",
  "Shepherd Warhound Handler",
  "Ferryman & River Guard",
  "Swamp Hermit & Tracker",
  "Miller's Stout Defender",
  "Camp Cook turned Vanguard"
];

const SOLDIER_FIRST_NAMES_MALE = [
  'Bran', 'Gaston', 'Rowan', 'Torin', 'Kael', 'Durn', 'Alden', 'Cormac', 'Wulfric', 'Jarek',
  'Garrett', 'Boran', 'Harlan', 'Roderick', 'Thorne', 'Eadric', 'Viggo', 'Oswald', 'Kevan', 'Gareth',
  'Brant', 'Lucan', 'Darian', 'Balthazar', 'Vane', 'Eldon', 'Corin', 'Finn', 'Merrick', 'Gregor'
];

const SOLDIER_FIRST_NAMES_FEMALE = [
  'Brigid', 'Lyanna', 'Kestrel', 'Vespera', 'Elowen', 'Maeve', 'Gwendolyn', 'Thora', 'Astrid', 'Hilda',
  'Morgath', 'Rowena', 'Kaela', 'Vanya', 'Rhiannon', 'Sigrid', 'Valda', 'Kallista', 'Brea', 'Freya'
];

const SOLDIER_EPITHETS = [
  'Ironfoot', 'the Bold', 'Stonebreaker', 'the Hound', 'Redblade', 'the Oak', 'Scarface',
  'Crow-Eye', 'the Wolf', 'Swiftbow', 'the Bear', 'Shieldbiter', 'the Tall', 'Grimjaw',
  'the Relentless', 'Hardhand', 'the Cleaver', 'Stormborn', 'the Indomitable', 'Ironfist'
];

const PORTRAITS_BY_SPECIES: Record<Species, string[]> = {
  'Human': ['🛡️', '⚔️', '🪖', '🏹', '🪓', '🗡️', '🧔', '👩‍🦰', '🧑‍🦱', '🤺'],
  'Vampire': ['🧛', '🩸', '🦇', '🗡️', '🍷', '🥀', '⚔️', '🛡️', '🪖', '👤'],
  'Werewolf': ['🐺', '🐾', '🌕', '🌲', '🪓', '⚔️', '🛡️', '🩸', '🪖', '👤'],
  'Witch': ['🧙‍♀️', '🔮', '✨', '🧹', '🧪', '🏹', '🗡️', '🌙', '🛡️', '👤'],
  'HighElf': ['🧝', '✨', '🏹', '🗡️', '🛡️', '👑', '⚔️', '🪖', '👤', '🌟']
};

/**
 * Generate 20 unique, interactive low-born soldiers for a province barracks
 */
export function generateTop20ProvincialSoldiers(provinceId: string, provinceName: string, species: Species = 'Human'): ProvincialSoldier[] {
  const seedNum = provinceId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Rank distribution for top 20:
  // 1 Captain of Guard (Rank 7)
  // 2 Master-at-Arms (Rank 6)
  // 3 Veteran Sergeants (Rank 5)
  // 4 Sergeants (Rank 4)
  // 4 Men-at-Arms (Rank 3)
  // 4 Foot Soldiers (Rank 2)
  // 2 Promising Militia Recruits (Rank 1)
  const rankRoster: SoldierRank[] = [
    'Captain of the Guard',
    'Master-at-Arms',
    'Master-at-Arms',
    'Veteran Sergeant',
    'Veteran Sergeant',
    'Veteran Sergeant',
    'Sergeant',
    'Sergeant',
    'Sergeant',
    'Sergeant',
    'Man-at-Arms',
    'Man-at-Arms',
    'Man-at-Arms',
    'Man-at-Arms',
    'Foot Soldier',
    'Foot Soldier',
    'Foot Soldier',
    'Foot Soldier',
    'Militia Recruit',
    'Militia Recruit'
  ];

  const traitKeys = Object.keys(MARTIAL_TRAITS_CATALOG);
  const speciesPortraits = PORTRAITS_BY_SPECIES[species] || PORTRAITS_BY_SPECIES['Humans'];

  return rankRoster.map((rank, idx) => {
    const isFemale = (seedNum + idx * 7) % 3 === 0;
    const gender: Gender = isFemale ? 'Female' : 'Male';
    const firstNames = isFemale ? SOLDIER_FIRST_NAMES_FEMALE : SOLDIER_FIRST_NAMES_MALE;
    const firstName = firstNames[(seedNum + idx * 13) % firstNames.length];
    const epithet = SOLDIER_EPITHETS[(seedNum + idx * 17) % SOLDIER_EPITHETS.length];
    const origin = LOW_BORN_ORIGINS[(seedNum + idx * 5) % LOW_BORN_ORIGINS.length];
    
    const rankInfo = RANK_TIERS[rank];
    const baseMartial = rankInfo.minMartial + ((seedNum + idx * 3) % 10);
    const baseProwess = rankInfo.minProwess + ((seedNum + idx * 7) % 10);
    const baseLoyalty = 60 + ((seedNum + idx * 9) % 38);

    // Pick 2-3 unique traits
    const trait1 = traitKeys[(seedNum + idx * 2) % traitKeys.length];
    const trait2 = traitKeys[(seedNum + idx * 5 + 3) % traitKeys.length];
    const traits = [trait1];
    if (trait2 !== trait1) traits.push(trait2);
    if (rankInfo.tier >= 5) {
      const trait3 = traitKeys[(seedNum + idx * 11 + 7) % traitKeys.length];
      if (!traits.includes(trait3)) traits.push(trait3);
    }

    const battles = Math.max(1, (rankInfo.tier * 4) + ((seedNum + idx * 3) % 12));
    const kills = Math.round(battles * (1.5 + (baseProwess / 30)));

    let equipTier: ProvincialSoldier['equipmentTier'] = 'Rusty Militia Gear';
    if (rankInfo.tier === 2) equipTier = 'Standard Issue Mail';
    else if (rankInfo.tier === 3 || rankInfo.tier === 4) equipTier = 'Hardened Brigandine';
    else if (rankInfo.tier >= 5) equipTier = 'Tempered Steel Plate';

    const portrait = speciesPortraits[(seedNum + idx) % speciesPortraits.length];

    const backstory = `${firstName} was born into humble peasant origins as a ${origin.toLowerCase()} in the county of ${provinceName}. Recruited into the provincial garrison, ${firstName} proved their battlefield valor in over ${battles} skirmishes, recording ${kills} enemy casualties.`;

    return {
      id: `soldier_${provinceId}_${idx + 1}`,
      provinceId,
      provinceName,
      name: `${firstName} ${epithet}`,
      lowBornOrigin: origin,
      rank,
      rankTier: rankInfo.tier,
      martial: Math.min(99, baseMartial),
      prowess: Math.min(99, baseProwess),
      loyalty: Math.min(100, baseLoyalty),
      species,
      gender,
      portrait,
      status: 'active',
      specialMartialTraits: traits,
      killsCount: kills,
      battlesFought: battles,
      equipmentTier: equipTier,
      backstory
    };
  });
}
