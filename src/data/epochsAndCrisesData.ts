import { CharacterNemesis, CrusadeState, EpidemicState, NomadInvasionState, StressBreakChoice } from '../types';

export const INITIAL_CRUSADE_STATE: CrusadeState = {
  id: 'crusade_1',
  isActive: false,
  type: 'Crusade',
  targetRealmId: 'realm_witch',
  targetRealmName: 'Coven of the Eclipse',
  targetHolySite: 'The Holy Sanctum of Antioch',
  proclaimerTitle: 'High Pontiff Urban II',
  proclaimerPortrait: '🇻🇦',
  warScore: 15,
  playerContributionScore: 0,
  playerPledgedTroops: 0,
  playerDonatedGold: 0,
  crusaderTotalArmy: 45000,
  defenderTotalArmy: 38000,
  yearsActive: 0,
  isPlayerDefender: false,
  status: 'mobilizing'
};

export const INITIAL_EPIDEMIC_STATE: EpidemicState = {
  isActive: false,
  name: 'The Great Black Death (Great Pestilence)',
  yearStarted: 1095,
  yearsActive: 0,
  globalSeverity: 'Simmering',
  totalRealmDeaths: 0,
  provinces: {},
  activeDecrees: {
    borderQuarantine: false,
    plagueDoctorsHired: false,
    courtSecludedInManor: false,
    holyPenanceProcessions: false
  }
};

export const INITIAL_NOMAD_INVASION: NomadInvasionState = {
  id: 'nomad_1',
  isActive: false,
  threatType: 'Viking Sea-Raiders',
  warlordName: 'Jarl Ragnar Blood-Axe',
  warlordTitle: 'High Sea-King of the North Sea Fleet',
  warlordPortrait: '🪓',
  hordeStrength: 18500,
  demandedTributeGold: 150,
  targetProvinceIds: ['prov_coastal'],
  settlementOffered: false,
  status: 'demanding_tribute'
};

export const INITIAL_CHARACTER_NEMESES: CharacterNemesis[] = [
  {
    id: 'nemesis_1',
    targetId: 'rival_vassal_1',
    targetName: 'Count Roderick of Ironwood',
    targetTitle: 'Discontented Border Lord',
    targetPortrait: '🗡️',
    targetRole: 'Rebellious Vassal',
    reason: 'Publicly challenged your dynastic lineage and disputed crown tax levies during the royal feast.',
    feudIntensity: 65,
    feudStatus: 'Tense Rivalry',
    feudHistory: [
      'Disputed royal tax obligations in Year 1082.',
      'Slandered the crown heir at the regional tourney in Year 1084.'
    ]
  }
];

export const INITIAL_NEMESES_POOL = INITIAL_CHARACTER_NEMESES;

export const STRESS_BREAK_OPTIONS: Record<number, StressBreakChoice[]> = {
  // Level 1: Mild Stress Relief (Seeking outlets)
  1: [
    {
      id: 'stress_feast',
      title: '🍷 Host an Impromptu Midnight Tavern Revelry',
      description: 'Drink deeply with trusted courtiers, ignoring the burdens of statecraft for a night.',
      goldCost: 40,
      stressRelieved: 45,
      traitGained: 'Reveler',
      flavorOutcome: 'Laughter and flagons of fine spiced wine wash away your anxieties.'
    },
    {
      id: 'stress_prayer',
      title: '🕯️ Seclude Yourself in Prayer and Solitude',
      description: 'Spend days fasting in the royal chapel under the guidance of the High Priest.',
      renownImpact: 10,
      stressRelieved: 40,
      traitGained: 'Ascetic',
      flavorOutcome: 'Quiet meditation and holy incense bring serenity to your troubled mind.'
    },
    {
      id: 'stress_hunting',
      title: '🏹 Gallop into the Deep Forest on an Unannounced Hunt',
      description: 'Track wild boar and stags across the untamed wilderness to release adrenaline.',
      goldCost: 20,
      stressRelieved: 40,
      flavorOutcome: 'The crisp forest air and the thrill of the hunt clear your heavy mind.'
    }
  ],
  // Level 2: Severe Mental Breakdown (Permanent Coping Traits)
  2: [
    {
      id: 'stress_drunkard',
      title: '🍺 Take Refuge in the Bottle (Become a Drunkard)',
      description: 'Drown your royal sorrows in bottomless casks of vintage mead and ale.',
      stressRelieved: 70,
      traitGained: 'Drunkard',
      flavorOutcome: 'You find solace at the bottom of the flagon, though your hands tremble by morning.'
    },
    {
      id: 'stress_flagellant',
      title: '⛓️ Subject Yourself to the Scourge (Become Flagellant)',
      description: 'Punish your mortal flesh with holy lashes to cleanse your dynastic sins.',
      stressRelieved: 75,
      traitGained: 'Flagellant',
      flavorOutcome: 'Pain purges the guilt and madness from your soul, leaving sacred scars.'
    },
    {
      id: 'stress_recluse',
      title: '🚪 Barricade the Royal Chambers (Become a Recluse)',
      description: 'Refuse all court audiences and council meetings, communicating only through locked doors.',
      stressRelieved: 80,
      traitGained: 'Recluse',
      flavorOutcome: 'You retreat into dark silence behind heavy iron bolts, safe from the treacherous world.'
    },
    {
      id: 'stress_spendthrift',
      title: '💎 Lavish Gold on Extravagant Trinkets (Spendthrift)',
      description: 'Buy exotic tapestries, rare beasts, and gilded gems to distract from inner despair.',
      goldCost: 200,
      stressRelieved: 85,
      traitGained: 'Spendthrift',
      flavorOutcome: 'Piles of silk and velvet soothe your wounded pride, at the treasury\'s expense.'
    }
  ],
  // Level 3: Critical Catastrophe (Dynastic Crisis)
  3: [
    {
      id: 'stress_melancholia',
      title: '🥀 Sinks into Profound Melancholia',
      description: 'The monarch can no longer govern effectively, handing executive regency to the council.',
      stressRelieved: 100,
      traitGained: 'Melancholic Invalid',
      flavorOutcome: 'A heavy gloom settles over the throne room as the ruler ceases to speak.'
    },
    {
      id: 'stress_berserk',
      title: '🔥 Fly into a Destructive Berserk Fury',
      description: 'Smash furniture, draw swords in council, and terrify the entire palace staff.',
      stressRelieved: 100,
      traitGained: 'Berserker Wrath',
      flavorOutcome: 'Your terrifying rage leaves the council shaking with terror, cementing absolute dread.'
    }
  ]
};
