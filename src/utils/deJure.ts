import { Province, Realm, Character } from '../types';

export interface DeJureClaimInfo {
  provinceId: string;
  provinceName: string;
  realmId: string;
  realmName: string;
  isPlayerControlled: boolean;
  isDeJureClaim: boolean;
  historicalJustification: string;
  warScoreDiscount: number; // e.g. 25% lower warscore required
}

/**
 * Calculates whether a province is a de jure claim for the player.
 * Player-controlled provinces automatically generate claims over neighboring 
 * non-player-controlled provinces within their historical de jure realm.
 */
export function getProvinceDeJureStatus(
  province: Province,
  allProvinces: Province[],
  realms: Realm[],
  character: Character
): DeJureClaimInfo {
  const realm = realms.find(r => r.id === province.realmId);
  const realmName = realm ? realm.name : 'Unknown Realm';

  // If already player controlled, it's sovereign crown land
  if (province.isPlayerControlled) {
    return {
      provinceId: province.id,
      provinceName: province.name,
      realmId: province.realmId,
      realmName,
      isPlayerControlled: true,
      isDeJureClaim: false,
      historicalJustification: 'Held by the Imperial Crown',
      warScoreDiscount: 0
    };
  }

  // Check if player holds ANY province in the same realm
  const playerProvincesInSameRealm = allProvinces.filter(
    p => p.realmId === province.realmId && p.isPlayerControlled
  );

  const isHomeRealm = province.realmId === character.realmId;
  const isDeJureClaim = isHomeRealm || playerProvincesInSameRealm.length > 0;

  let historicalJustification = '';
  let warScoreDiscount = 0;

  if (isHomeRealm) {
    historicalJustification = `Ancestral Crown Demesne: Historically part of ${realmName}. Legitimate ancestral claim recognized by ancient feudal charters.`;
    warScoreDiscount = 25; // 25% war score discount
  } else if (playerProvincesInSameRealm.length > 0) {
    historicalJustification = `De Jure Provincial Right: Your sovereignty over ${playerProvincesInSameRealm[0].name} establishes a historical de jure claim across the entirety of ${realmName}.`;
    warScoreDiscount = 20;
  } else {
    historicalJustification = 'Foreign Territorial Dominion: Conquest requires fabricating new claims or diplomatic leverage.';
    warScoreDiscount = 0;
  }

  return {
    provinceId: province.id,
    provinceName: province.name,
    realmId: province.realmId,
    realmName,
    isPlayerControlled: false,
    isDeJureClaim,
    historicalJustification,
    warScoreDiscount
  };
}

/**
 * Returns all active de jure claims across the world for the player
 */
export function getAllDeJureClaims(
  allProvinces: Province[],
  realms: Realm[],
  character: Character
): DeJureClaimInfo[] {
  return allProvinces
    .filter(p => !p.isPlayerControlled)
    .map(p => getProvinceDeJureStatus(p, allProvinces, realms, character))
    .filter(info => info.isDeJureClaim);
}
