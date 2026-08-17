import { Character, FamilyMember, Province, Realm, Vassal, Species } from '../types';
import { INITIAL_REALMS, INITIAL_PROVINCES } from './provincesAndRealmsData';

export { INITIAL_REALMS, INITIAL_PROVINCES };

export const INITIAL_VASSALS: Vassal[] = [
  {
    id: 'vassal_brecknock_bailiff',
    name: 'Castellan Gwilym of Brecknock',
    species: 'Human',
    gender: 'Male',
    age: 38,
    title: 'Castellan of the Upper Keep',
    houseName: 'Brecknock',
    countyName: 'The County of Brecknock',
    duchyName: 'Brecknock Southern March (Duchy)',
    duchyControl: 85,
    kingdomName: 'Kingdom of Valoria (Kingdom)',
    kingdomControl: 10,
    empireName: 'Aethelgard High Imperium (Empire)',
    empireControl: 5,
    culture: 'Valorian',
    troops: 450,
    maxTroops: 600,
    holdingsCount: 1,
    provinceId: 'prov_brecknock',
    provinceName: 'The County of Brecknock',
    councilRole: 'Chancellor',
    loyalty: 85,
    opinion: 80,
    taxContribution: 15,
    levyContribution: 0,
    taxRate: 'Normal',
    levyObligation: 'Standard',
    faction: 'Loyalist',
    traits: ['Diligent Administrator', 'Loyal Castellan', 'Honorable'],
    portrait: '🛡️',
    stats: {
      martial: 65,
      diplomacy: 78,
      intrigue: 58,
      intellect: 74,
      prowess: 70,
      stewardship: 82
    },
    family: {
      spouse: {
        id: 'rel_gwen',
        name: 'Lady Gwen of Powys',
        species: 'Human',
        age: 34,
        gender: 'Female',
        relation: 'Spouse',
        title: 'Lady of the Keep',
        traits: ['Gracious Hostess', 'Skilled Weaver'],
        opinion: 75,
        portrait: '👰',
        alive: true
      },
      children: [
        {
          id: 'rel_maredudd',
          name: 'Maredudd of Brecknock',
          species: 'Human',
          age: 14,
          gender: 'Male',
          relation: 'Child',
          title: 'Squire & Heir to Brecknock',
          traits: ['Eager Jouster', 'Courageous'],
          opinion: 80,
          portrait: '👦',
          alive: true,
          isHeir: true,
          maritalStatus: 'Single',
          countyName: 'The County of Brecknock'
        },
        {
          id: 'rel_rhiannon',
          name: 'Lady Rhiannon',
          species: 'Human',
          age: 11,
          gender: 'Female',
          relation: 'Child',
          title: 'Young Maiden of the Keep',
          traits: ['Quick-Witted', 'Musical'],
          opinion: 85,
          portrait: '👧',
          alive: true,
          isHeir: false,
          maritalStatus: 'Single'
        }
      ],
      parents: [
        {
          id: 'rel_hywel',
          name: 'Old Lord Hywel of Brecknock',
          species: 'Human',
          age: 68,
          gender: 'Male',
          relation: 'Parent',
          title: 'Late Elder of the March',
          traits: ['Veteran Defender'],
          opinion: 90,
          portrait: '👴',
          alive: false,
          causeOfDeath: 'Natural Old Age'
        }
      ],
      siblings: [
        {
          id: 'rel_bran',
          name: 'Captain Bran the Archer',
          species: 'Human',
          age: 31,
          gender: 'Male',
          relation: 'Sibling',
          title: 'Captain of the Longbow Guard',
          traits: ['Eagle Eye', 'Fierce'],
          opinion: 70,
          portrait: '🏹',
          alive: true
        }
      ]
    }
  }
];

export const PRESET_DYNASTIES: Array<{
  id: string;
  name: string;
  dynastyName: string;
  gender: 'Male' | 'Female';
  species: Species;
  title: string;
  rank: string;
  realmId: string;
  portrait: string;
  traits: string[];
  motto: string;
  backstory: string;
  initialSpouse?: {
    name: string;
    species: Species;
    relation: 'Spouse';
    title: string;
    portrait: string;
    traits: string[];
  };
  initialChildren?: Array<{
    name: string;
    species: Species;
    gender: 'Male' | 'Female';
    age: number;
    title: string;
    portrait: string;
    traits: string[];
  }>;
}> = [
  {
    id: 'preset_human',
    name: 'Alistair II',
    dynastyName: 'House Pendragon',
    gender: 'Male',
    species: 'Human',
    title: 'Count of Brecknock',
    rank: 'Count',
    realmId: 'realm_human',
    portrait: '👑',
    traits: ['Just Ruler', 'Chivalric Knight', 'Ambitious'],
    motto: 'From Humble Fiefdom to Sovereign Empire',
    backstory: 'Starting as a vassal lord holding only the County of Brecknock. You must develop your ancestral seat, wage strategic campaigns, and expand your realm to elevate your rank to King and claim the title of Emperor!',
    initialSpouse: {
      name: 'Lady Elaine of Valoria',
      species: 'Human',
      relation: 'Spouse',
      title: 'Countess Consort',
      portrait: '👸',
      traits: ['Charming', 'Devout', 'Patron of Arts']
    },
    initialChildren: [
      {
        name: 'Lord Arthur',
        species: 'Human',
        gender: 'Male',
        age: 6,
        title: 'Heir to Brecknock',
        portrait: '🤴',
        traits: ['Eager Squire', 'Quick Learner']
      },
      {
        name: 'Lady Guinevere',
        species: 'Human',
        gender: 'Female',
        age: 4,
        title: 'Young Lady of Brecknock',
        portrait: '👧',
        traits: ['Curious', 'Sweet-Hearted']
      }
    ]
  },
  {
    id: 'preset_vampire',
    name: 'Lord Cassian',
    dynastyName: 'House Sangreal',
    gender: 'Male',
    species: 'Vampire',
    title: 'Grand Blood Sovereign',
    rank: 'Grand Sovereign',
    realmId: 'realm_vampire',
    portrait: '🧛',
    traits: ['Immortal', 'Master Intriguer', 'Ancient Lore'],
    motto: 'In Crimson Shadows, We Endure For Eternity',
    backstory: 'Awakened from a century-long slumber to find your gothic empire challenged by mortals and shape-shifters alike.',
    initialSpouse: {
      name: 'Countess Carmilla the Pale',
      species: 'Vampire',
      relation: 'Spouse',
      title: 'Blood Mistress',
      portrait: '🥀',
      traits: ['Mesmeric', 'Nightstalker', 'Cruel Beauty']
    },
    initialChildren: [
      {
        name: 'Lord Victor',
        species: 'Vampire',
        gender: 'Male',
        age: 18,
        title: 'Blood Heir',
        portrait: '🦇',
        traits: ['Nocturnal Duelist', 'Cold-Blooded']
      }
    ]
  },
  {
    id: 'preset_werewolf',
    name: 'Alpha Kenneth',
    dynastyName: 'Clan Silverfang',
    gender: 'Male',
    species: 'Werewolf',
    title: 'High Alpha of the Great Pack',
    rank: 'High Alpha',
    realmId: 'realm_werewolf',
    portrait: '🐺',
    traits: ['Apex Predator', 'Unbreakable Honor', 'Furious Roar'],
    motto: 'One Pack, One Blood, Unbroken Might',
    backstory: 'United the warring forest clans through raw combat prowess under the red moon.',
    initialSpouse: {
      name: 'Luna Sylvanis',
      species: 'Werewolf',
      relation: 'Spouse',
      title: 'High Matron Luna',
      portrait: '🐾',
      traits: ['Fierce Guardian', 'Wise Huntress']
    },
    initialChildren: [
      {
        name: 'Torren Silverfang',
        species: 'Werewolf',
        gender: 'Male',
        age: 8,
        title: 'Pack Pup Heir',
        portrait: '🐕',
        traits: ['Spirited Hunter', 'Tough Hide']
      }
    ]
  },
  {
    id: 'preset_witch',
    name: 'High Matriarch Morgana',
    dynastyName: 'Coven of the Eldermist',
    gender: 'Female',
    species: 'Witch',
    title: 'Grand High Enchantress',
    rank: 'Grand Matriarch',
    realmId: 'realm_witch',
    portrait: '🔮',
    traits: ['Alchemical Master', 'Prophetic Sight', 'Storm Weaver'],
    motto: 'As Above, So Below; The Threads of Fate Weave True',
    backstory: 'Keeper of the ancient cauldron and guardian of the forbidden leylines that span all five realms.',
    initialSpouse: {
      name: 'Consort Balthazar the Enchanter',
      species: 'Witch',
      relation: 'Spouse',
      title: 'Coven Consort',
      portrait: '🧙‍♂️',
      traits: ['Herbalist', 'Calm Mind']
    },
    initialChildren: [
      {
        name: 'Circe of the Mist',
        species: 'Witch',
        gender: 'Female',
        age: 7,
        title: 'Coven Initiate & Heiress',
        portrait: '✨',
        traits: ['Arcane Spark', 'Familiar Whisperer']
      }
    ]
  }
];
