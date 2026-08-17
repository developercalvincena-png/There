import { Character, CharacterFamilyTree, CharacterRelative, FamilyMember, HookSecret, LeaderProfile, RealmNPC, Species, Vassal } from '../types';

/**
 * Generates a default, contextually rich family tree for any character, vassal, leader or NPC
 * if they do not currently have one defined.
 */
export function getOrGenerateFamilyTree(
  characterId: string,
  name: string,
  species: Species,
  gender: 'Male' | 'Female',
  age: number,
  title: string,
  houseName: string = 'Noble Lineage',
  existingFamily?: CharacterFamilyTree
): CharacterFamilyTree {
  if (existingFamily && (existingFamily.children?.length > 0 || existingFamily.spouse)) {
    return existingFamily;
  }

  const isAdult = age >= 18;
  const isElder = age >= 50;

  // Generate Spouse if adult
  let spouse: CharacterRelative | undefined = undefined;
  if (isAdult && age >= 20) {
    const spouseGender = gender === 'Male' ? 'Female' : 'Male';
    const spouseAge = Math.max(18, age + (gender === 'Male' ? -3 : 2));
    spouse = {
      id: `spouse_${characterId}_${Date.now()}`,
      name: spouseGender === 'Female' ? `Lady Vivienne of House ${houseName}` : `Lord Roland of House ${houseName}`,
      species,
      age: spouseAge,
      gender: spouseGender,
      relation: 'Spouse',
      title: spouseGender === 'Female' ? `Consort of ${houseName}` : `Consort Lord of ${houseName}`,
      traits: ['Noble Blood', 'Devoted Partner'],
      opinion: 75,
      portrait: spouseGender === 'Female' ? '👰' : '🤵',
      alive: true,
      maritalStatus: 'Married'
    };
  }

  // Generate Children based on age
  const children: CharacterRelative[] = [];
  if (isAdult && age >= 22) {
    const numChildren = Math.min(4, Math.max(1, Math.floor((age - 20) / 7)));
    for (let i = 0; i < numChildren; i++) {
      const childGender: 'Male' | 'Female' = i % 2 === 0 ? 'Male' : 'Female';
      const childAge = Math.max(1, Math.min(age - 19, (age - 21) - (i * 3)));
      const isHeir = i === 0;
      const childName = childGender === 'Male' 
        ? `${isHeir ? 'Lord ' : ''}${houseName === 'Pendragon' ? 'Arthur' : 'Godfrey'} ${i + 1}`
        : `Lady ${houseName === 'Sangreal' ? 'Elisabeth' : 'Isolde'} ${i + 1}`;

      children.push({
        id: `child_${characterId}_${i}`,
        name: childName,
        species,
        age: childAge,
        gender: childGender,
        relation: 'Child',
        title: isHeir ? `Heir Apparent of House ${houseName}` : `Scion of House ${houseName}`,
        traits: isHeir ? ['Ambitious Scion', 'Quick Learner'] : ['Affable', 'Artistic'],
        opinion: 80,
        portrait: childAge < 12 ? (childGender === 'Male' ? '👦' : '👧') : (childGender === 'Male' ? '🤴' : '👸'),
        alive: true,
        isHeir,
        maritalStatus: childAge >= 18 ? 'Single' : 'Single'
      });
    }
  }

  // Generate Parents (alive or deceased)
  const parents: CharacterRelative[] = [
    {
      id: `parent_father_${characterId}`,
      name: `Lord Aldous of House ${houseName} the Elder`,
      species,
      age: age + 26,
      gender: 'Male',
      relation: 'Parent',
      title: `Late Patriarch of ${houseName}`,
      traits: ['Old Warmaster', 'Stern Ruler'],
      opinion: 85,
      portrait: '👴',
      alive: age < 35,
      causeOfDeath: age >= 35 ? 'Battlefield Honors' : undefined
    },
    {
      id: `parent_mother_${characterId}`,
      name: `Lady Beatrice of House ${houseName}`,
      species,
      age: age + 24,
      gender: 'Female',
      relation: 'Parent',
      title: `Dowager Matron of ${houseName}`,
      traits: ['Pious Mother', 'Charitable'],
      opinion: 90,
      portrait: '👵',
      alive: age < 40,
      causeOfDeath: age >= 40 ? 'Winter Fever' : undefined
    }
  ];

  // Generate Siblings
  const siblings: CharacterRelative[] = [];
  if (age >= 16) {
    siblings.push({
      id: `sib_${characterId}_1`,
      name: gender === 'Male' ? `Lady Eleanor of ${houseName}` : `Lord Cedric of ${houseName}`,
      species,
      age: Math.max(16, age - 4),
      gender: gender === 'Male' ? 'Female' : 'Male',
      relation: 'Sibling',
      title: gender === 'Male' ? `Court Dowager of ${houseName}` : `Knight Commander of ${houseName}`,
      traits: ['Loyal Kinsman', 'Skilled Diplomat'],
      opinion: 65,
      portrait: gender === 'Male' ? '👩' : '👨',
      alive: true
    });
  }

  return {
    spouse,
    children,
    parents,
    siblings,
    heirId: children[0]?.id
  };
}

/**
 * Progresses all NPC and Vassal families when advancing a year:
 * - Age all characters & family members
 * - Eligible adults marry or betroth
 * - Married couples have chances to birth children
 * - Handle aging and natural successions
 */
export function simulateWorldFamiliesYearAdvance(
  vassals: Vassal[],
  realmNPCs: RealmNPC[],
  leaders: LeaderProfile[],
  currentYear: number
): {
  updatedVassals: Vassal[];
  updatedNPCs: RealmNPC[];
  updatedLeaders: LeaderProfile[];
  dynastyAnnouncements: string[];
  events: Array<{
    id: string;
    title: string;
    description: string;
    type: 'family' | 'birth' | 'coronation';
  }>;
} {
  const announcements: string[] = [];

  // 1. Process Vassals
  const updatedVassals = vassals.map(vassal => {
    const age = (vassal.age || 35) + 1;
    let family = getOrGenerateFamilyTree(vassal.id, vassal.name, vassal.species, vassal.gender, age, vassal.title, vassal.houseName || 'Vassal', vassal.family);

    // Age spouse
    if (family.spouse && family.spouse.alive) {
      family.spouse.age += 1;
    }

    // Age children & check marriages / births
    const agedChildren = family.children.map(child => {
      const newChildAge = child.age + 1;
      return {
        ...child,
        age: newChildAge,
        portrait: newChildAge >= 16 ? (child.gender === 'Male' ? '🤴' : '👸') : child.portrait
      };
    });

    // Chance of new birth if spouse exists and wife is under 45
    const isWifeFertile = family.spouse && family.spouse.alive && (vassal.gender === 'Female' ? age <= 45 : family.spouse.age <= 45);
    if (isWifeFertile && agedChildren.length < 4 && Math.random() < 0.22) {
      const babyGender: 'Male' | 'Female' = Math.random() > 0.5 ? 'Male' : 'Female';
      const babyName = babyGender === 'Male' ? `Lord Raymond` : `Lady Rosamund`;
      const newBaby: CharacterRelative = {
        id: `child_${vassal.id}_${Date.now()}`,
        name: `${babyName} of ${vassal.houseName || 'Brecknock'}`,
        species: vassal.species,
        age: 0,
        gender: babyGender,
        relation: 'Child',
        title: `Young Noble of ${vassal.countyName || 'County'}`,
        traits: ['Newborn Scion', 'Cherished Infant'],
        opinion: 90,
        portrait: '👶',
        alive: true,
        isHeir: agedChildren.length === 0,
        maritalStatus: 'Single'
      };
      agedChildren.push(newBaby);
      announcements.push(`👶 ${vassal.title} ${vassal.name} and ${family.spouse?.name} welcomed a newborn child: ${newBaby.name}!`);
    }

    // Age siblings
    const agedSiblings = (family.siblings || []).map(s => ({
      ...s,
      age: s.age + 1
    }));

    return {
      ...vassal,
      age,
      family: {
        ...family,
        children: agedChildren,
        siblings: agedSiblings
      }
    };
  });

  // 2. Process Realm NPCs
  const updatedNPCs = realmNPCs.map(npc => {
    const age = npc.age + 1;
    let family = getOrGenerateFamilyTree(npc.id, npc.name, npc.species, npc.gender, age, npc.title, npc.houseName, npc.family);

    if (family.spouse && family.spouse.alive) {
      family.spouse.age += 1;
    }

    const agedChildren = family.children.map(child => ({
      ...child,
      age: child.age + 1
    }));

    return {
      ...npc,
      age,
      family: {
        ...family,
        children: agedChildren
      }
    };
  });

  // 3. Process Foreign Leaders
  const updatedLeaders = leaders.map(leader => {
    const age = leader.age + 1;
    let family = getOrGenerateFamilyTree(leader.id, leader.name, leader.species, leader.gender, age, leader.title, leader.houseName, leader.family);

    if (family.spouse && family.spouse.alive) {
      family.spouse.age += 1;
    }

    const agedChildren = family.children.map(child => ({
      ...child,
      age: child.age + 1
    }));

    return {
      ...leader,
      age,
      family: {
        ...family,
        children: agedChildren
      }
    };
  });

  return {
    updatedVassals,
    updatedNPCs,
    updatedLeaders,
    dynastyAnnouncements: announcements,
    events: announcements.map((text, idx) => ({
      id: `dyn_event_${Date.now()}_${idx}`,
      title: '📜 Dynastic Succession & Court Annals',
      description: text,
      type: 'family' as const
    }))
  };
}

export const generateFamilyForCharacter = getOrGenerateFamilyTree;

