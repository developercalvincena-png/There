import { CadetBranch, DynastyPerk } from '../types';

export const INITIAL_DYNASTY_PERKS: DynastyPerk[] = [
  // 1. Conquest & Iron Blood
  {
    id: 'perk_conquest_1',
    branch: 'conquest',
    tier: 1,
    name: 'Banner of the Ancestors',
    icon: '🚩',
    description: 'Ancient martial traditions rally recruits to the crown banner swiftly.',
    effectsSummary: '+15% Realm Levy Capacity, +10 Commander Martial baseline',
    renownCost: 150,
    isUnlocked: false
  },
  {
    id: 'perk_conquest_2',
    branch: 'conquest',
    tier: 2,
    name: 'Unyielding Shieldwall',
    icon: '🛡️',
    description: 'Troops fight with dynastic zeal, resisting battle fatigue longer.',
    effectsSummary: '-30% Army War Upkeep, -25% Battle Casualties',
    renownCost: 350,
    isUnlocked: false
  },
  {
    id: 'perk_conquest_3',
    branch: 'conquest',
    tier: 3,
    name: 'Right of Feudal Conquest',
    icon: '⚔️',
    description: 'Dynastic claims across foreign duchies are recognized as divinely ordained.',
    effectsSummary: '-50% War Declaration & Truce Break Costs, +30 War Score per major victory',
    renownCost: 650,
    isUnlocked: false
  },
  {
    id: 'perk_conquest_4',
    branch: 'conquest',
    tier: 4,
    name: 'Blood of the Conqueror',
    icon: '👑',
    description: 'Legends of your ancestral conquerors strike terror into neighboring kingdoms.',
    effectsSummary: '+25 Dread, Vassal Rebellions -40% likely, +2000 Elite Vanguard Troops',
    renownCost: 1200,
    isUnlocked: false
  },

  // 2. Guile & Shadows
  {
    id: 'perk_guile_1',
    branch: 'guile',
    tier: 1,
    name: 'Silent Footsteps',
    icon: '🥷',
    description: 'Informants in taverns and courtyards report court gossip directly to your ears.',
    effectsSummary: '+20% Scheme Discovery Speed, +15 Intrigue to all family members',
    renownCost: 150,
    isUnlocked: false
  },
  {
    id: 'perk_guile_2',
    branch: 'guile',
    tier: 2,
    name: 'Blackmail Network',
    icon: '📜',
    description: 'Every secret uncovered yields lasting political leverage over rival lords.',
    effectsSummary: 'Fabricate Strong Hooks with 30% higher success, Hostages cannot rebel',
    renownCost: 350,
    isUnlocked: false
  },
  {
    id: 'perk_guile_3',
    branch: 'guile',
    tier: 3,
    name: 'Poisoner’s Legacy',
    icon: '🧪',
    description: 'Secret alchemical formulas passed down through generations leave no trace.',
    effectsSummary: '+35% Assassination Secrecy, Immune to hostile poisoning schemes',
    renownCost: 650,
    isUnlocked: false
  },
  {
    id: 'perk_guile_4',
    branch: 'guile',
    tier: 4,
    name: 'Puppet-Masters of the Throne',
    icon: '🎭',
    description: 'Dynasty holds invisible strings across council chambers and foreign courts.',
    effectsSummary: 'Foreign Spymasters are automatically swayed, +100 Gold from blackmail each year',
    renownCost: 1200,
    isUnlocked: false
  },

  // 3. Architects of Eternity
  {
    id: 'perk_arch_1',
    branch: 'architecture',
    tier: 1,
    name: 'Master Mason Guilds',
    icon: '📐',
    description: 'Generations of master builders draft blueprints for grand province works.',
    effectsSummary: '-20% Province Building Construction Cost, +15% Tax Efficiency',
    renownCost: 150,
    isUnlocked: false
  },
  {
    id: 'perk_arch_2',
    branch: 'architecture',
    tier: 2,
    name: 'Granaries & Aqueducts',
    icon: '🌾',
    description: 'Advanced irrigation and grain reserves safeguard against famine and plague.',
    effectsSummary: '+25% Province Prosperity Growth, -50% Epidemic Devastation',
    renownCost: 350,
    isUnlocked: false
  },
  {
    id: 'perk_arch_3',
    branch: 'architecture',
    tier: 3,
    name: 'Monuments of Majesty',
    icon: '🏛️',
    description: 'Great Wonders build 50% faster with reduced gold requirements.',
    effectsSummary: '-30% Great Wonder stage costs, +20 Renown per wonder tier completed',
    renownCost: 650,
    isUnlocked: false
  },
  {
    id: 'perk_arch_4',
    branch: 'architecture',
    tier: 4,
    name: 'The Eternal Capital',
    icon: '🏰',
    description: 'Your capital becomes a peerless jewel of the medieval world.',
    effectsSummary: '+50 Gold/Year Capital Revenue, Capital Province immune to sieges',
    renownCost: 1200,
    isUnlocked: false
  },

  // 4. Erudition & Bloodlines
  {
    id: 'perk_erud_1',
    branch: 'erudition',
    tier: 1,
    name: 'Royal Scriptorium',
    icon: '📚',
    description: 'Heirs receive personalized tutoring in statecraft, history, and classical languages.',
    effectsSummary: '+3 Baseline Stats to all newborn children, +20% Heir Training Speed',
    renownCost: 150,
    isUnlocked: false
  },
  {
    id: 'perk_erud_2',
    branch: 'erudition',
    tier: 2,
    name: 'Curated Genomes',
    icon: '🧬',
    description: 'Carefully arranged unions ensure positive physical and mental traits pass down.',
    effectsSummary: 'High chance of inheriting Genius, Beautiful, or Herculean traits',
    renownCost: 350,
    isUnlocked: false
  },
  {
    id: 'perk_erud_3',
    branch: 'erudition',
    tier: 3,
    name: 'Philosopher Kings',
    icon: '✨',
    description: 'Dynasty members live longer and withstand mental stress with stoic philosophy.',
    effectsSummary: '+10 Character Longevity, Stress Gain reduced by 40%',
    renownCost: 650,
    isUnlocked: false
  },
  {
    id: 'perk_erud_4',
    branch: 'erudition',
    tier: 4,
    name: 'Renaissance of the Crown',
    icon: '🌟',
    description: 'Your scholars invent cultural innovations centuries ahead of their time.',
    effectsSummary: 'Allows enacting 2 extra Imperial Edicts without upkeep cost, +50 Piety/Year',
    renownCost: 1200,
    isUnlocked: false
  },

  // 5. Glory & Noble Ties
  {
    id: 'perk_glory_1',
    branch: 'glory',
    tier: 1,
    name: 'Illustrious Lineage',
    icon: '💎',
    description: 'Foreign monarchs regard your house as ancient nobility of supreme esteem.',
    effectsSummary: '+30 Foreign Monarch Opinion, +100% Royal Marriage Acceptance',
    renownCost: 150,
    isUnlocked: false
  },
  {
    id: 'perk_glory_2',
    branch: 'glory',
    tier: 2,
    name: 'Feudal Harmony',
    icon: '🤝',
    description: 'Vassals view serving your dynasty as an sacred honor and privilege.',
    effectsSummary: '+25 Vassal Loyalty baseline, Vassal Tax contributions +20%',
    renownCost: 350,
    isUnlocked: false
  },
  {
    id: 'perk_glory_3',
    branch: 'glory',
    tier: 3,
    name: 'Dynastic Web',
    icon: '🌐',
    description: 'Distant kin occupying foreign thrones funnel prestige and trade back to the patriarch.',
    effectsSummary: '+50 Renown/Year, Cadet branches generate automatic non-aggression pacts',
    renownCost: 650,
    isUnlocked: false
  },
  {
    id: 'perk_glory_4',
    branch: 'glory',
    tier: 4,
    name: 'Crown of the Ages',
    icon: '🏆',
    description: 'Your dynasty name will echo through chronicles for a thousand generations.',
    effectsSummary: '+100 Renown on succession, Dynasty Members never accept vassal revolts',
    renownCost: 1200,
    isUnlocked: false
  }
];

export const DYNASTY_PERK_TREES = INITIAL_DYNASTY_PERKS;

export const INITIAL_CADET_BRANCHES: CadetBranch[] = [
  {
    id: 'cadet_1',
    name: 'House Percival-Ravencrest',
    founderName: 'Lord Cedric of Ravencrest',
    founderPortrait: '🦅',
    seatProvinceName: 'Oakhaven Marches',
    crestColor: 'bg-indigo-900',
    crestIcon: '🛡️',
    foundedYear: 1084,
    reputation: 'Fierce Vanguard Protectors',
    motto: 'From the Shadows We Soar'
  },
  {
    id: 'cadet_2',
    name: 'House Percival-Aquitaine',
    founderName: 'Lady Isabella of the Coast',
    founderPortrait: '⛵',
    seatProvinceName: 'Sunken Harbor',
    crestColor: 'bg-emerald-900',
    crestIcon: '⚓',
    foundedYear: 1092,
    reputation: 'Wealthy Merchant Dukes',
    motto: 'Gold Flows Where Currents Guide'
  }
];
