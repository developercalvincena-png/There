export type Species = 'Human' | 'Vampire' | 'Werewolf' | 'Witch' | 'HighElf';

export type Gender = 'Male' | 'Female';

export type CouncilRole = 
  | 'Marshal' 
  | 'Chancellor' 
  | 'Spymaster' 
  | 'CourtMage' 
  | 'GrandTreasurer' 
  | 'HighPriest';

export type FactionType = 
  | 'Loyalist' 
  | 'Autonomy' 
  | 'LowerTaxes' 
  | 'CrossRealmSympathizers' 
  | 'PretenderClaimant';

export type TreatyType = 
  | 'Trade Agreement' 
  | 'Non-Aggression Pact' 
  | 'Military Alliance' 
  | 'Blood Covenant' 
  | 'Moon Concordat' 
  | 'Coven Accord'
  | 'Vassalage Fealty';

export interface CharacterStats {
  health: number; // 0 - 100
  happiness: number; // 0 - 100
  renown: number; // 0+
  pietyOrMana: number; // 0 - 100
  gold: number; // economy
  martial: number; // 0 - 100
  intellect: number; // 0 - 100
  intrigue: number; // 0 - 100
  diplomacy: number; // 0 - 100
  specialResource: number; // 0 - 100 (Blood Essence for Vampires, Primal Rage for Werewolves, Witchcraft Resonance for Witches, Divine Grace for Humans)
  stress?: number; // 0 - 100 (Stress & Mental Breakdowns)
}

export interface Character {
  id: string;
  name: string;
  dynastyName: string;
  gender: Gender;
  species: Species;
  age: number;
  portrait: string; // Avatar emoji/icon code
  rank: string;
  title?: string;
  stats: CharacterStats;
  traits: string[];
  alive: boolean;
  causeOfDeath?: string;
  yearBorn: number;
  yearDied?: number;
  spouseId?: string;
  spouseName?: string;
  spouseSpecies?: Species;
  childrenIds: string[];
  parentsIds: string[];
  educationTrack?: string;
  mentorName?: string;
  realmId: string;
  isHeir: boolean;
  titlesHeld: string[];
}

export interface FamilyMember {
  id: string;
  name: string;
  species: Species;
  gender: Gender;
  relation: 'Father' | 'Mother' | 'Spouse' | 'Child' | 'Sibling' | 'Grandchild' | 'Cousin' | 'Enemy' | 'Advisor' | 'Relative';
  age: number;
  alive: boolean;
  health: number;
  opinion: number; // -100 to 100
  spouseId?: string;
  spouseName?: string;
  childrenIds: string[];
  realmId: string;
  title: string;
  houseName?: string;
  culture?: string;
  countyName?: string;
  provinceId?: string;
  isHeir: boolean;
  isBloodRelation?: boolean;
  isFavorite?: boolean;
  isImprisoned?: boolean;
  educationTrack?: string;
  mentorName?: string;
  traits: string[];
  causeOfDeath?: string;
  portrait: string;
  itemsGiven?: string[];
  activeScheme?: string;
  assignedWardId?: string;
  tutorId?: string;
  tutorName?: string;
  tutorPortrait?: string;
  tutorRole?: string;
  tutorTraits?: string[];
  trainingFocus?: 'Martial' | 'Intellect' | 'Diplomacy' | 'Intrigue' | 'Stewardship';
  educationProgress?: number; // 0 - 100
  educationTier?: number; // 1 to 4
  stats?: {
    martial: number;
    diplomacy: number;
    intrigue: number;
    intellect: number;
    prowess: number;
    stewardship: number;
  };
  family?: {
    spouseName?: string;
    childrenCount?: number;
    heirName?: string;
    fatherName?: string;
    motherName?: string;
  };
}

export interface ProvinceBuildings {
  castle: number; // Defense & vassal limit
  churchOrShrine: number; // Piety & stability
  market: number; // Gold income & trade
  barracks: number; // Troop capacity & recruitment
  academy: number; // Education & intellect boost
  governorOffice: number; // Tax collection & unrest reduction
  farms: number; // Food, population & prosperity
  realmSpecialStructure: number; // Blood Crypt, Moon Totem, Arcane Spire, Cathedral
}

export interface CharacterRelative {
  id: string;
  name: string;
  species: Species;
  age: number;
  gender: Gender;
  relation: 'Spouse' | 'Child' | 'Parent' | 'Sibling' | 'Heir' | 'Ward' | 'Hostage' | string;
  title?: string;
  traits: string[];
  opinion: number;
  portrait: string;
  alive: boolean;
  causeOfDeath?: string;
  isHeir?: boolean;
  maritalStatus?: 'Single' | 'Betrothed' | 'Married';
  betrothedTo?: string;
  countyName?: string;
  martial?: number;
  diplomacy?: number;
  intrigue?: number;
  intellect?: number;
}

export interface CharacterFamilyTree {
  spouse?: CharacterRelative;
  children: CharacterRelative[];
  parents?: CharacterRelative[];
  siblings?: CharacterRelative[];
  heirId?: string;
  hostageChild?: CharacterRelative;
}

export interface WorldNewsArticle {
  id: string;
  headline: string;
  category: 'War & Sieges' | 'Crown Scandals' | 'Holy Edicts' | 'Guilds & Trade' | 'Omens & Astrology' | string;
  region: string;
  summary: string;
  historicalContext: string;
  rumorImpact: string;
  source: string;
  year?: number;
}

export interface AssassinationPlot {
  id: string;
  targetId: string;
  targetName: string;
  targetRole: string;
  targetPortrait: string;
  instigatorId: string;
  instigatorName: string;
  instigatorRole: string;
  instigatorPortrait: string;
  method: 'Poisoned Chalice' | 'Shadow Ambush' | 'Hunting Crossbow' | 'Venomous Asp' | 'Sabotaged Carriage' | string;
  plotPower: number; // 0 - 100
  secrecy: number; // 0 - 100
  discovered: boolean;
  turnsRemaining: number;
  isPlayerTarget: boolean;
  description: string;
}

export interface LeaderProfile {
  id: string;
  name: string;
  title: string;
  portrait: string;
  species: Species;
  gender: Gender;
  age: number;
  houseName: string;
  opinion: number; // -100 to 100
  traits: string[];
  leadershipType: string;
  troops: number;
  militaryUnit?: string;
  stats: {
    martial: number;
    diplomacy: number;
    intrigue: number;
    intellect: number;
    prowess: number;
    stewardship: number;
  };
  claims?: string[];
  bio?: string;
  realmId?: string;
  realmName?: string;
  provinceId?: string;
  provinceName?: string;
  family?: CharacterFamilyTree;
  factionsJoined?: string[];
  hostageChildId?: string;
}

export interface Province {
  id: string;
  name: string;
  realmId: string;
  isPlayerControlled: boolean;
  governorId?: string;
  governorName?: string;
  governorProfile?: LeaderProfile;
  leadershipType?: string;
  regionalRules?: string[];
  armyStrength?: number;
  militaryUnit?: string;
  developmentLevel?: number; // 0 - 100
  developmentTier?: string;
  prosperity: number; // 0 - 100
  unrest: number; // 0 - 100
  income: number;
  troops: number;
  buildings: ProvinceBuildings;
  specialty: string;
}

export interface Realm {
  id: string;
  name: string;
  species: Species;
  capitalName: string;
  leaderName: string;
  leaderTitle: string;
  leaderSpecies: Species;
  leaderPortrait: string;
  leaderProfile?: LeaderProfile;
  leadershipType?: string;
  regionalRules?: string[];
  armyStrength?: number;
  militaryUnit?: string;
  developmentLevel?: number; // 0 - 100
  developmentTier?: string;
  crestColor: string;
  crestIcon: string;
  provinces?: Province[];
  militaryPower: number;
  economicPower: number;
  treasury?: number;
  standingArmy?: number;
  aiBehavior?: 'Conqueror' | 'Defensive' | 'Opportunist' | 'Diplomat' | 'Warmonger';
  lastUpgradeYear?: number;
  recentAchievements?: string[];
  opinion: number; // Player realm opinion (-100 to 100)
  treaties: TreatyType[];
  tradeGoods: string[];
  isAtWarWithPlayer: boolean;
  warScore?: number;
  cultureDescription: string;
}

export interface Vassal {
  id: string;
  name: string;
  species: Species;
  gender: Gender;
  title: string;
  age?: number;
  houseName?: string;
  countyName?: string;
  provinceId?: string;
  provinceName?: string;
  duchyName?: string;
  duchyControl?: number; // 0 - 100
  kingdomName?: string;
  kingdomControl?: number; // 0 - 100
  empireName?: string;
  empireControl?: number; // 0 - 100
  culture?: string;
  troops?: number;
  maxTroops?: number;
  holdingsCount?: number;
  councilRole?: CouncilRole;
  loyalty: number; // 0 - 100
  opinion: number; // -100 to 100
  taxContribution: number;
  levyContribution: number;
  taxRate?: 'Low' | 'Normal' | 'High' | 'Exempt';
  levyObligation?: 'Low' | 'Standard' | 'Extensive' | 'Exempt';
  faction: FactionType;
  traits: string[];
  portrait: string;
  isFavorite?: boolean;
  isImprisoned?: boolean;
  activeScheme?: string;
  assignedWardId?: string;
  itemsGiven?: string[];
  stats?: {
    martial: number;
    diplomacy: number;
    intrigue: number;
    intellect: number;
    prowess: number;
    stewardship: number;
  };
  family?: CharacterFamilyTree;
  factionsJoined?: string[];
  hostageHeld?: boolean;
}

export interface TradeCaravan {
  id: string;
  targetRealmId: string;
  targetRealmName: string;
  exportGood: string;
  importGood: string;
  investment: number;
  annualProfit: number;
  risk: 'Low' | 'Medium' | 'High';
  activeYears: number;
}

export interface RealmLawOption {
  id: string;
  name: string;
  icon?: string;
  description: string;
  effects: string;
  unrestImpact?: number;
  goldImpact?: number;
  prestigeCost?: number;
  pietyCost?: number;
}

export interface RealmLaw {
  id: string;
  category?: 'Succession' | 'Taxation' | 'Military' | 'CrossRealm' | 'SpeciesRite' | string;
  categoryKey?: 'gender_succession' | 'imperial_succession' | 'marriage_laws' | 'polygamy' | 'province_seizure' | 'realm_succession' | 'taxation' | 'military' | string;
  title: string;
  icon?: string;
  currentOptionId: string;
  options: RealmLawOption[];
}

export interface SpeciesAbility {
  id: string;
  name: string;
  description: string;
  speciesRequired: Species;
  cooldownTurns: number;
  currentCooldown: number;
  cost: {
    gold?: number;
    specialResource?: number;
    health?: number;
    pietyOrMana?: number;
  };
  icon: string;
  effectSummary: string;
}

export interface ChronicleEntry {
  id: string;
  year: number;
  age: number;
  title: string;
  description: string;
  type: 'birth' | 'war' | 'diplomacy' | 'court' | 'family' | 'realm' | 'supernatural' | 'death' | 'building' | 'trade' | 'intrigue';
  isImportant?: boolean;
}

export interface GameEventChoiceOutcome {
  text: string;
  gold?: number;
  renown?: number;
  happiness?: number;
  health?: number;
  pietyOrMana?: number;
  martial?: number;
  intellect?: number;
  intrigue?: number;
  diplomacy?: number;
  specialResource?: number;
  targetRealmId?: string;
  opinionChange?: number;
  newTrait?: string;
  removeTrait?: string;
  triggerWarRealmId?: string;
  triggerMarriage?: { partnerName: string, partnerSpecies: Species };
  triggerChild?: { childName: string, childSpecies: Species };
  troopsChange?: number;
}

export interface GameEventChoice {
  id: string;
  text: string;
  requirements?: {
    gold?: number;
    martial?: number;
    intrigue?: number;
    diplomacy?: number;
    intellect?: number;
    specialResource?: number;
    species?: Species;
  };
  outcome: GameEventChoiceOutcome;
}

export interface GameEvent {
  id: string;
  title: string;
  category: string;
  description: string;
  imagePromptIcon?: string;
  speaker?: {
    name: string;
    title: string;
    species: Species;
    portrait: string;
  };
  choices: GameEventChoice[];
}

export interface WarCommander {
  id: string;
  name: string;
  role: 'Grand Marshal' | 'Vanguard Commander' | 'Left Flank' | 'Right Flank' | 'Reserve & Magic';
  portrait: string;
  martial: number;
  trait: string;
  assignedTroops: number;
  status: 'Ready' | 'Engaged' | 'Victorious' | 'Wounded' | 'Pillaging' | 'Captured' | 'Killed';
  woundDescription?: string;
  woundYearsRemaining?: number;
  battlesSurvived?: number;
  victoriesCount?: number;
  veteranTrait?: 'War Veteran' | 'Heroic Commander' | 'Legendary Warmaster' | string;
  earnedTraits?: string[];
}

export interface WarState {
  id: string;
  title: string;
  targetType: 'realm' | 'province' | 'vassal' | 'rebel_faction';
  targetRealmId: string;
  targetRealmName: string;
  targetProvinceId?: string;
  targetProvinceName?: string;
  targetLeaderName: string;
  targetLeaderPortrait: string;
  targetLeaderTitle: string;
  targetLeaderAge?: number;
  targetLeaderOpinion?: number;
  warGoal: string;
  claimUsed: string;
  isDefensive?: boolean;
  aggressorName?: string;
  aggressorRealmId?: string;
  casusBelli?: string;
  defensiveResponse?: string;
  yearlyTroops: number; // in thousands (e.g. 18.4)
  maxYearlyTroops: number; // in thousands (e.g. 51.3)
  isPlayerCommanding: boolean;
  playerLevies: number;
  enemyLevies: number;
  enemyMaxLevies: number;
  warScore: number; // -100 to 100
  warYear: number;
  warFatigueLevel?: number; // 0 = None, 1 = Mild (Yr 4), 2 = High (Yr 5), 3 = Severe (Yr 6+)
  annualUpkeepCost?: number; // Gold per year
  playerTactics?: string;
  enemyTactics?: string;
  commanders: WarCommander[];
  plunderCount?: number;
  lastTacticsChangeYear?: number;
  targetProvincesCount?: number;
  lastBattleReport?: {
    year: number;
    title: string;
    description: string;
    won: boolean;
    casualtiesPlayer: number;
    casualtiesEnemy: number;
    scoreDelta: number;
    tacticalMatchup?: string;
    commanderEvents?: string[];
    infrastructureDamageText?: string;
  };
  battleLog: {
    year: number;
    title: string;
    description: string;
    won: boolean;
    casualtiesPlayer: number;
    casualtiesEnemy: number;
    tacticalMatchup?: string;
    commanderEvents?: string[];
    infrastructureDamageText?: string;
  }[];
}

export type CoronationStyle = 'sacred_rites' | 'martial_triumph' | 'lavish_feast' | 'pragmatic';

export interface ConditionalPeaceTerms {
  warId: string;
  goldAmount: number; // Positive = player demands gold from enemy, Negative = player pays war indemnity to enemy, 0 = no gold
  demandedProvinceIds: string[]; // Enemy province IDs player is demanding
  cededProvinceIds: string[]; // Player province IDs player is offering to cede
  marriageAlliance?: {
    memberType: 'self' | 'family';
    memberId?: string;
    memberName: string;
    memberRole: string;
    targetDynastyMemberName: string;
    targetDynastyTitle: string;
    targetSpecies: Species;
    dowry: number;
  };
  treaties: TreatyType[];
  liberatePrisoners?: boolean; // Liberate all captured commanders & POWs
  opinionBonus: number;
  summaryText: string;
}

export interface DynastyHistoryEntry {
  generation: number;
  rulerName: string;
  dynastyName: string;
  species: Species;
  reignYears: number;
  yearsLived: string;
  finalRank: string;
  summary: string;
  portrait: string;
  keyAchievements: string[];
}

export type NPCRelationshipStatus = 'Neutral' | 'Friend' | 'Rival' | 'Lover' | 'Vassal' | 'Courtier' | 'Enemy' | 'Ally' | 'Betrothed';

export interface RealmNPC {
  id: string;
  name: string;
  species: Species;
  gender: Gender;
  age: number;
  portrait: string;
  title: string;
  role: 'Grand Marshal' | 'Court Spymaster' | 'High Chancellor' | 'Arch-Mage' | 'High Priestess' | 'Guildmaster' | 'Champion Knight' | 'Royal Envoy' | 'Shadow Assassin' | 'Court Jester' | 'Pack Alpha' | 'Elder Matron' | string;
  realmId: string;
  realmName: string;
  provinceId?: string;
  provinceName?: string;
  houseName: string;
  opinion: number; // -100 to 100
  loyalty: number; // 0 - 100
  traits: string[];
  stats: {
    martial: number;
    diplomacy: number;
    intrigue: number;
    intellect: number;
    prowess: number;
    stewardship: number;
  };
  secretAgenda?: string;
  bio: string;
  dialogueQuote: string;
  relationshipStatus: NPCRelationshipStatus;
  isEmployedAtCourt?: boolean;
  bribed?: boolean;
  swayed?: boolean;
  hasSecretRevealed?: boolean;
  family?: CharacterFamilyTree;
  factionsJoined?: string[];
  hostageHeld?: boolean;
}

export interface SpymasterTask {
  mission: 'discover_plot' | 'fabricate_hook' | 'counter_espionage' | 'snoop_secrets' | 'idle';
  targetId?: string;
  targetName?: string;
  progress: number; // 0 - 100
  turnsRemaining: number;
  successChance: number; // e.g. 70%
  description?: string;
}

export type HookType = 'Weak Hook' | 'Strong Hook' | 'Blackmail Secret' | 'Dark Heritage';

export interface HookSecret {
  id: string;
  targetId: string;
  targetName: string;
  targetRole?: string;
  targetPortrait?: string;
  type: HookType;
  secretName: string;
  description: string;
  obtainedYear: number;
  isUsed?: boolean;
  leveragePower: number; // 50 for weak, 100 for strong
}

export type VassalFactionKind = 'Liberty' | 'Claimant' | 'Autonomy' | 'Independence' | 'LowerTaxes';

export interface VassalFaction {
  id: string;
  kind: VassalFactionKind;
  title: string;
  description: string;
  demands: string;
  leaderId: string;
  leaderName: string;
  leaderPortrait: string;
  claimantName?: string;
  claimantTitle?: string;
  memberVassalIds: string[];
  powerPercent: number; // % of crown army power
  discontent: number; // 0 - 100
  ultimatumSent: boolean;
}

export interface ImperialEdict {
  id: string;
  name: string;
  icon: string;
  category: 'Administration' | 'Economy' | 'Military' | 'Culture';
  description: string;
  effects: string;
  upkeepCost: number; // Gold per year
  isActive: boolean;
  minRankRequired: 'King' | 'High King' | 'Emperor';
}

export type ArtifactType = 'Crown' | 'Scepter' | 'Weapon' | 'Armor' | 'Grimoire' | 'Relic' | 'Chalice' | 'Jewelry';
export type ArtifactRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
export type ArtifactSlot = 'head' | 'mainHand' | 'armor' | 'relic';

export interface DynastyArtifact {
  id: string;
  name: string;
  type: ArtifactType;
  rarity: ArtifactRarity;
  icon: string;
  slot?: ArtifactSlot;
  effects: {
    martial?: number;
    intrigue?: number;
    intellect?: number;
    diplomacy?: number;
    renown?: number;
    goldIncome?: number; // Flat gold per year
    prowess?: number;
    stewardship?: number;
    vassalOpinionBonus?: number; // Kingdom-wide vassal/courtier opinion boost
    taxRateBonusPercent?: number; // Kingdom-wide tax income % boost
    renownBonusPercent?: number; // Prestige multiplier
    armyMoraleBonus?: number; // Battle morale
    levySizeBonusPercent?: number; // Army capacity boost %
    pietyOrMana?: number;
  };
  description: string;
  history: string;
  isEquipped: boolean;
  commissionYear?: number;
  artisanName?: string;
  qualityScore?: number;
}

export type SoldierRank = 
  | 'Militia Recruit' 
  | 'Foot Soldier' 
  | 'Man-at-Arms' 
  | 'Sergeant' 
  | 'Veteran Sergeant' 
  | 'Master-at-Arms' 
  | 'Captain of the Guard' 
  | 'Knight of the Realm' 
  | 'Provincial Head';

export type SoldierStatus = 'active' | 'promoted' | 'demoted' | 'knighted' | 'imprisoned' | 'provincial_head';

export interface ProvincialSoldier {
  id: string;
  provinceId: string;
  provinceName: string;
  name: string;
  lowBornOrigin: string; // e.g. "Village Blacksmith's Son", "Forest Huntsman & Scout", "Peasant Militia Levy"
  rank: SoldierRank;
  rankTier: number; // 1 to 7
  martial: number; // 10 - 95
  prowess: number; // 12 - 98
  loyalty: number; // 0 - 100
  species: Species;
  gender: Gender;
  portrait: string;
  status: SoldierStatus;
  specialMartialTraits: string[]; // e.g. "Shield Wall Stalwart", "Giant Slayer", "Iron Vanguard", "Berserker Fury"
  killsCount: number;
  battlesFought: number;
  equipmentTier: 'Rusty Militia Gear' | 'Standard Issue Mail' | 'Hardened Brigandine' | 'Tempered Steel Plate' | 'Masterwork Gilded Plate';
  backstory: string;
  knightedTitle?: string;
  ennobledHouseName?: string;
  nobleVassalId?: string;
  fealtyOathPledged?: boolean;
}

export interface GameSaveState {
  version: string;
  savedAt: string; // ISO date string
  slotId?: string;
  slotName?: string;
  character: Character;
  familyMembers: FamilyMember[];
  realms: Realm[];
  provinces: Province[];
  realmNPCs: RealmNPC[];
  vassals: Vassal[];
  realmLaws: RealmLaw[];
  chronicleEntries: ChronicleEntry[];
  tradeCaravans: TradeCaravan[];
  currentYear: number;
  reignYears: number;
  activeWars: WarState[];
  spymasterTask?: SpymasterTask;
  hooksAndSecrets?: HookSecret[];
  vassalFactions?: VassalFaction[];
  imperialEdicts?: ImperialEdict[];
  dynastyArtifacts?: DynastyArtifact[];
  crusadeState?: CrusadeState;
  epidemicState?: EpidemicState;
  nomadInvasion?: NomadInvasionState;
  unlockedPerkIds?: string[];
  cadetBranches?: CadetBranch[];
  greatWonders?: GreatWonder[];
  activeNemeses?: CharacterNemesis[];
  provincialSoldiers?: Record<string, ProvincialSoldier[]>;
}

export interface SaveSlotMetadata {
  id: string;
  name: string;
  savedAt: string;
  year: number;
  rulerName: string;
  dynastyName: string;
  rank: string;
  portrait: string;
  realmName: string;
  realmCrest: string;
  gold: number;
  provincesControlled: number;
  totalProvinces: number;
  isAutoSave?: boolean;
}

// 1. Crusade & Holy War Types
export interface CrusadeState {
  id: string;
  isActive: boolean;
  type: 'Crusade' | 'Jihad' | 'Holy War';
  targetRealmId: string;
  targetRealmName: string;
  targetHolySite: string; // e.g. "Antioch", "Jerusalem", "Cordoba", "Alexandria"
  proclaimerTitle: string; // e.g. "High Pontiff Urban II" or "Grand Caliph"
  proclaimerPortrait: string;
  warScore: number; // -100 to 100
  playerContributionScore: number; // 0 - 1000
  playerPledgedTroops: number;
  playerDonatedGold: number;
  crusaderTotalArmy: number;
  defenderTotalArmy: number;
  yearsActive: number;
  isPlayerDefender: boolean;
  status: 'mobilizing' | 'active_war' | 'triumph' | 'defeated';
}

// 2. Epidemic / Black Death Types
export type PlagueSeverity = 'None' | 'Outbreak' | 'Epidemic' | 'Devastation';

export interface ProvincePlagueStatus {
  provinceId: string;
  provinceName: string;
  severity: PlagueSeverity;
  infectionRate: number; // 0 - 100
  deathsThisYear: number;
  isQuarantined: boolean;
}

export interface EpidemicState {
  isActive: boolean;
  name: string;
  yearStarted: number;
  yearsActive: number;
  globalSeverity: 'Simmering' | 'Peak' | 'Receding';
  totalRealmDeaths: number;
  provinces: Record<string, ProvincePlagueStatus>;
  activeDecrees: {
    borderQuarantine: boolean;
    plagueDoctorsHired: boolean;
    courtSecludedInManor: boolean;
    holyPenanceProcessions: boolean;
  };
}

// 3. Nomadic / Viking Great Invasions
export interface NomadInvasionState {
  id: string;
  isActive: boolean;
  threatType: 'Viking Sea-Raiders' | 'Steppe Nomad Horde' | 'Desert Sarranid Host';
  warlordName: string;
  warlordTitle: string;
  warlordPortrait: string;
  hordeStrength: number; // e.g. 24000
  demandedTributeGold: number; // Danegeld
  targetProvinceIds: string[];
  settlementOffered: boolean;
  status: 'demanding_tribute' | 'pillaging' | 'repelled' | 'settled_vassal';
}

// 4. Dynastic Legacies & Bloodline Perk Tree
export type LegacyBranchKey = 'conquest' | 'guile' | 'architecture' | 'erudition' | 'glory';

export interface DynastyPerk {
  id: string;
  branch: LegacyBranchKey;
  tier: number; // 1 to 4
  name: string;
  icon: string;
  description: string;
  effectsSummary: string;
  renownCost: number;
  isUnlocked: boolean;
}

export interface CadetBranch {
  id: string;
  name: string;
  founderName: string;
  founderPortrait: string;
  seatProvinceName: string;
  crestColor: string;
  crestIcon: string;
  foundedYear: number;
  reputation: string;
  motto: string;
}

// 5. Great Wonder Megaprojects
export type WonderType = 'cathedral' | 'citadel' | 'university' | 'harbor';

export interface WonderStage {
  stageNumber: number;
  title: string;
  description: string;
  costGold: number;
  yearsToBuild: number;
  unlockedBonus: string;
  isCompleted: boolean;
}

export interface GreatWonder {
  id: string;
  type: WonderType;
  name: string;
  provinceId: string;
  provinceName: string;
  icon: string;
  currentStage: number; // 0 to 4 (0 = not started)
  progressYears: number;
  isUnderConstruction: boolean;
  totalInvestedGold: number;
  architectName?: string;
  stages: WonderStage[];
  completedYear?: number;
}

// 6. Character Nemesis & Stress Breaks
export interface CharacterNemesis {
  id: string;
  targetId: string;
  targetName: string;
  targetTitle: string;
  targetPortrait: string;
  targetRole: string;
  reason: string;
  feudIntensity: number; // 0 - 100
  feudStatus: 'Active Blood Feud' | 'Tense Rivalry' | 'Vengeance Settled';
  feudHistory: string[];
}

export interface StressBreakChoice {
  id: string;
  title: string;
  description: string;
  traitGained?: string;
  goldCost?: number;
  renownImpact?: number;
  stressRelieved: number;
  flavorOutcome: string;
}

