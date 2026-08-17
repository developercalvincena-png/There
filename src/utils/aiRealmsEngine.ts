import { Realm, Province, Character, WarState, ChronicleEntry, Vassal } from '../types';
import { BUILDINGS_CONFIG } from '../data/buildingsData';

export interface AIRealmsSimulationResult {
  updatedRealms: Realm[];
  updatedProvinces: Province[];
  declaredDefensiveWar: WarState | null;
  worldChronicles: ChronicleEntry[];
}

/**
 * Simulates active yearly economic growth, infrastructure expansion, army recruitment,
 * and offensive war declarations for all AI realms in the continent.
 */
export function simulateAIRealmsYearlyProgress(
  realms: Realm[],
  provinces: Province[],
  character: Character,
  currentYear: number,
  activeWars: WarState[],
  vassals: Vassal[],
  totalPlayerArmyPower: number
): AIRealmsSimulationResult {
  const worldChronicles: ChronicleEntry[] = [];
  let declaredDefensiveWar: WarState | null = null;

  // 1. Calculate player vulnerability & military ratio
  const activeFatigue = activeWars.length > 0
    ? Math.max(0, ...activeWars.map(w => w.warYear >= 6 ? 3 : w.warYear === 5 ? 2 : w.warYear === 4 ? 1 : 0))
    : 0;
  const isPlayerVulnerable = (
    activeFatigue >= 2 || 
    character.stats.health < 40 || 
    character.stats.gold < 35 ||
    (activeWars.length >= 2 && totalPlayerArmyPower < 20000)
  );

  // Map to hold updated provinces
  const provinceMap = new Map<string, Province>();
  provinces.forEach(p => provinceMap.set(p.id, { ...p }));

  const updatedRealms = realms.map(realm => {
    // If it's the player's primary realm, keep basic state
    if (realm.id === character.realmId) {
      return realm;
    }

    // Identify provinces belonging to this AI realm
    const realmProvinces = Array.from(provinceMap.values()).filter(p => p.realmId === realm.id && !p.isPlayerControlled);
    
    // If all provinces conquered, realm has collapsed
    if (realmProvinces.length === 0) {
      return {
        ...realm,
        militaryPower: 0,
        armyStrength: 0,
        economicPower: 0,
        isAtWarWithPlayer: false
      };
    }

    // 1. Economic Growth & Tax Collection
    const currentTreasury = realm.treasury || Math.round(realm.economicPower * 1.5) || 450;
    let annualIncome = 0;
    realmProvinces.forEach(prov => {
      const provIncome = prov.income || 25;
      const b = prov.buildings || {};
      const marketBonus = (b.market || 0) * 12;
      const blacksmithBonus = (b.blacksmith || 0) * 8;
      const prosperityBonus = Math.floor((prov.prosperity || 50) / 6);
      annualIncome += provIncome + marketBonus + blacksmithBonus + prosperityBonus;
    });

    // Trade agreement revenue
    if (realm.treaties.includes('Trade Agreement')) {
      annualIncome += 45;
    }

    let newTreasury = currentTreasury + annualIncome;

    // 2. AI Infrastructure & Building Upgrades
    let upgradedBuildingText = '';
    const updatedRealmAchievements = [...(realm.recentAchievements || [])];

    realmProvinces.forEach(prov => {
      const b = { ...(prov.buildings || {}) };
      let provUpgraded = false;

      // AI spends treasury on key buildings
      // A. Barracks upgrade (Costs 80 gold)
      if (newTreasury >= 80 && (b.barracks || 0) < 5 && Math.random() < 0.45) {
        b.barracks = (b.barracks || 0) + 1;
        newTreasury -= 80;
        provUpgraded = true;
        upgradedBuildingText = `Expanded Grand Barracks (Tier ${b.barracks})`;
      }
      // B. Castle / Citadel upgrade (Costs 120 gold)
      else if (newTreasury >= 120 && (b.castle || 0) < 5 && Math.random() < 0.35) {
        b.castle = (b.castle || 0) + 1;
        newTreasury -= 120;
        provUpgraded = true;
        upgradedBuildingText = `Fortified Citadel Ramparts (Tier ${b.castle})`;
      }
      // C. Market & Trade Outpost (Costs 60 gold)
      else if (newTreasury >= 60 && (b.market || 0) < 4 && Math.random() < 0.40) {
        b.market = (b.market || 0) + 1;
        newTreasury -= 60;
        provUpgraded = true;
        upgradedBuildingText = `Constructed Merchant Guild Outposts (Tier ${b.market})`;
      }
      // D. Species Special Wonder / Arcane Spire (Costs 150 gold)
      else if (newTreasury >= 150 && (b.realmSpecialStructure || 0) < 3 && Math.random() < 0.25) {
        b.realmSpecialStructure = (b.realmSpecialStructure || 0) + 1;
        newTreasury -= 150;
        provUpgraded = true;
        upgradedBuildingText = `Consecrated Sovereign Wonder (Tier ${b.realmSpecialStructure})`;
      }

      // Provincial development growth
      const currentDev = prov.developmentLevel || 60;
      const newDev = Math.min(100, currentDev + (provUpgraded ? 3 : 1));
      let devTier = 'Frontier March';
      if (newDev >= 85) devTier = 'High Imperial Metropolis';
      else if (newDev >= 70) devTier = 'Flourishing Sovereign County';
      else if (newDev >= 50) devTier = 'Fortified Feudal Bastion';

      // Update province state
      provinceMap.set(prov.id, {
        ...prov,
        buildings: b,
        developmentLevel: newDev,
        developmentTier: devTier,
        prosperity: Math.min(100, Math.max(10, (prov.prosperity || 50) + (provUpgraded ? 2 : 1) - (prov.unrest > 30 ? 2 : 0))),
        unrest: Math.max(0, (prov.unrest || 10) - (b.castle || 1) * 2)
      });
    });

    // 3. Military Recruitment & Army Scaling
    // Base standing army scales with realm size, barracks, leader martial, and overall game development
    let totalRealmRecruits = 0;
    const currentProvs = Array.from(provinceMap.values()).filter(p => p.realmId === realm.id && !p.isPlayerControlled);

    currentProvs.forEach(prov => {
      const b = prov.buildings || {};
      const barracksTroops = (b.barracks || 1) * 280;
      const castleTroops = (b.castle || 1) * 150;
      const specialTroops = (b.realmSpecialStructure || 0) * 220;
      const devBonus = Math.floor((prov.developmentLevel || 50) * 3);
      
      const annualNewProvTroops = Math.max(120, barracksTroops + castleTroops + specialTroops + devBonus);
      totalRealmRecruits += annualNewProvTroops;

      // Update individual province garrison/troops
      const currentProvTroops = prov.troops || 1500;
      const updatedProvTroops = Math.min(25000, currentProvTroops + Math.round(annualNewProvTroops * 0.45));

      provinceMap.set(prov.id, {
        ...prov,
        troops: updatedProvTroops,
        armyStrength: updatedProvTroops
      });
    });

    // Calculate total standing realm army
    const baseArmyStrength = realm.armyStrength || (realm.militaryPower * 12) || 12000;
    // Dynamic parity bonus: Keep AI military formidable and scaling with player's total power
    const parityScalingFactor = totalPlayerArmyPower > 25000 ? 1.08 : 1.04;
    const newArmyStrength = Math.round(Math.min(95000, Math.max(8500, (baseArmyStrength + totalRealmRecruits) * parityScalingFactor)));
    const newMilitaryPower = Math.round(newArmyStrength / 10);
    const newEconomicPower = Math.round(Math.min(3500, (realm.economicPower || 800) + annualIncome * 0.12));

    // Chronicle milestone when AI realm reaches major military or infrastructure landmark
    if (upgradedBuildingText && Math.random() < 0.20) {
      worldChronicles.push({
        id: `world_prog_${realm.id}_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: `🏛️ ${realm.name} Infrastructure Expansion`,
        description: `Ambassadors report that ${realm.leaderTitle} ${realm.leaderName} of ${realm.name} has ${upgradedBuildingText.toLowerCase()} across their realm provinces, bolstering their economic and military readiness!`,
        type: 'realm',
        isImportant: false
      });
    }

    // 4. Dynamic Offensive AI War Declarations against Player
    // Conditions:
    // - Not currently at war with player
    // - Active wars against player is at most 1 (prevent unplayable dogpiling)
    // - Opinion is hostile/tense (opinion < 20) OR AI has ambitious conqueror behavior
    // - AI realm has formidable military strength (at least 8,500 troops)
    const isAlreadyAtWar = activeWars.some(w => w.targetRealmId === realm.id || w.targetRealmName.toLowerCase() === realm.name.toLowerCase()) || realm.isAtWarWithPlayer;
    const hasNonAggressionPact = realm.treaties.includes('Non-Aggression Pact') || realm.treaties.includes('Defensive Alliance');
    
    // Aggression probability calculation
    let attackScore = 0;
    if (realm.opinion < -50) attackScore += 35;
    else if (realm.opinion < 0) attackScore += 20;
    else if (realm.opinion < 20) attackScore += 10;

    if (isPlayerVulnerable) attackScore += 30;
    if (newArmyStrength > totalPlayerArmyPower * 0.85) attackScore += 15;
    if (realm.species === 'Vampire' || realm.species === 'Werewolf') attackScore += 10; // Aggressive predator lore
    if (hasNonAggressionPact) attackScore -= 50; // Respect pacts unless broke

    // Trigger AI Offensive War
    const shouldDeclareWar = !declaredDefensiveWar && !isAlreadyAtWar && activeWars.length < 2 && attackScore >= 40 && Math.random() < 0.40;

    if (shouldDeclareWar) {
      const warId = `def_war_${realm.id}_${Date.now()}`;
      
      // Dynamic Casus Belli based on realm lore and situation
      let casusBelli = 'Imperial Subjugation & Hegemony';
      if (realm.species === 'Vampire') {
        casusBelli = 'Blood Tithe Encroachment & Aristocratic Subjugation';
      } else if (realm.species === 'Werewolf') {
        casusBelli = 'Ancestral Highland Reclaim & Primal Pack Dominance';
      } else if (realm.species === 'Witch') {
        casusBelli = 'Leyline Sanctuary Retaliation & Arcane Sovereignty';
      } else if (isPlayerVulnerable) {
        casusBelli = 'Opportunistic Conquest against a Weakened Crown';
      } else if (realm.opinion < -30) {
        casusBelli = 'Dynastic Blood Feud & Imperial Border Reconquest';
      }

      // Offensive army size mobilized by AI (75% to 95% of their total military strength)
      const mobilizedEnemyTroops = Math.round(newArmyStrength * (0.75 + Math.random() * 0.20));

      // Player initial defensive mobilization (matches player current ready forces)
      const initialPlayerDefense = Math.max(2500, Math.round(totalPlayerArmyPower * 0.80));

      declaredDefensiveWar = {
        id: warId,
        title: `Defensive War against ${realm.name}`,
        targetType: 'realm',
        targetRealmId: realm.id,
        targetRealmName: realm.name,
        targetProvinceName: realm.capitalName,
        targetLeaderName: realm.leaderName,
        targetLeaderPortrait: realm.leaderPortrait,
        targetLeaderTitle: realm.leaderTitle,
        targetLeaderAge: realm.leaderProfile?.age || 48,
        targetLeaderOpinion: realm.opinion,
        warGoal: `${casusBelli} against ${character.dynastyName}`,
        claimUsed: casusBelli,
        isDefensive: true,
        aggressorName: realm.name,
        aggressorRealmId: realm.id,
        casusBelli: casusBelli,
        yearlyTroops: initialPlayerDefense,
        maxYearlyTroops: totalPlayerArmyPower,
        isPlayerCommanding: true,
        playerLevies: initialPlayerDefense,
        enemyLevies: mobilizedEnemyTroops,
        enemyMaxLevies: newArmyStrength,
        warScore: -12, // Aggressor has initial offensive momentum and surprise
        warYear: 1,
        lastTacticsChangeYear: currentYear,
        playerTactics: 'Fortified Shieldwall & Defilade',
        enemyTactics: realm.species === 'Werewolf' ? 'Frontline Shock Charge' : realm.species === 'Witch' ? 'Arcane & Primal Siege Magic' : 'Tactical Outflanking & Pincer',
        plunderCount: 0,
        commanders: [
          {
            id: `cmd_def_1_${warId}`,
            name: 'Grand High Marshal',
            role: 'Grand Marshal',
            portrait: '🛡️',
            martial: Math.min(99, Math.max(28, Math.round(character.stats.martial * 0.45))),
            trait: 'Bastion of the Realm',
            assignedTroops: Math.round(initialPlayerDefense * 0.35),
            status: 'Ready'
          },
          {
            id: `cmd_def_2_${warId}`,
            name: 'Vanguard Royal Knight',
            role: 'Vanguard Commander',
            portrait: '🤴',
            martial: Math.min(99, Math.max(26, Math.round(character.stats.martial * 0.40))),
            trait: 'Steadfast Defender',
            assignedTroops: Math.round(initialPlayerDefense * 0.25),
            status: 'Ready'
          },
          {
            id: `cmd_def_3_${warId}`,
            name: 'Highland Border Captain',
            role: 'Left Flank',
            portrait: '👨🏽',
            martial: 24,
            trait: 'Garrison Shieldwall Expert',
            assignedTroops: Math.round(initialPlayerDefense * 0.15),
            status: 'Ready'
          },
          {
            id: `cmd_def_4_${warId}`,
            name: 'Royal Ranger Warden',
            role: 'Right Flank',
            portrait: '🏹',
            martial: 23,
            trait: 'Hillside Ambush & Volley',
            assignedTroops: Math.round(initialPlayerDefense * 0.15),
            status: 'Ready'
          },
          {
            id: `cmd_def_5_${warId}`,
            name: 'Court Arcane Wardmaster',
            role: 'Reserve & Magic',
            portrait: '🔮',
            martial: 25,
            trait: 'Aegis Ward Magic',
            assignedTroops: Math.round(initialPlayerDefense * 0.10),
            status: 'Ready'
          }
        ],
        battleLog: [
          {
            year: currentYear,
            title: `🚨 WAR DECLARED: ${realm.name} Invades!`,
            description: `${realm.leaderTitle} ${realm.leaderName} of ${realm.name} has sounded the war horns and marched ${mobilizedEnemyTroops.toLocaleString()} troops across our sovereign border pressing the claim "${casusBelli}"! Homeland defense banners have been raised.`,
            won: false,
            casualtiesPlayer: 0,
            casualtiesEnemy: 0
          }
        ]
      };

      worldChronicles.push({
        id: `chron_def_war_${Date.now()}`,
        year: currentYear,
        age: character.age,
        title: `🚨 INVASION DECLARED: ${realm.name} Attacks Our Realm!`,
        description: `${realm.leaderTitle} ${realm.leaderName} has declared offensive war against ${character.dynastyName}, mobilizing a massive invasion host of ${mobilizedEnemyTroops.toLocaleString()} soldiers! All loyal provincial levies must mobilize for homeland defense.`,
        type: 'war',
        isImportant: true
      });
    }

    return {
      ...realm,
      treasury: newTreasury,
      armyStrength: newArmyStrength,
      standingArmy: newArmyStrength,
      militaryPower: newMilitaryPower,
      economicPower: newEconomicPower,
      isAtWarWithPlayer: declaredDefensiveWar?.targetRealmId === realm.id ? true : realm.isAtWarWithPlayer,
      opinion: declaredDefensiveWar?.targetRealmId === realm.id ? -85 : realm.opinion,
      recentAchievements: updatedRealmAchievements.slice(0, 5)
    };
  });

  return {
    updatedRealms,
    updatedProvinces: Array.from(provinceMap.values()),
    declaredDefensiveWar,
    worldChronicles
  };
}
